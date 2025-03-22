import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import type { Database as SQLiteDatabase } from 'better-sqlite3';
import Database from 'better-sqlite3';
import { IDatabaseAdapter } from './IDatabaseAdapter.js';
import * as schema from '../schema-sqlite/index.js';

/**
 * SQLite 데이터베이스 어댑터
 */
export class SQLiteAdapter implements IDatabaseAdapter {
  private sqlite: SQLiteDatabase | null = null;
  public db: ReturnType<typeof drizzle> | null = null;
  private transaction: boolean = false;

  /**
   * SQLite 어댑터를 초기화합니다.
   * @param dbPath SQLite 데이터베이스 파일 경로
   */
  constructor(private readonly dbPath: string) {}

  /**
   * 데이터베이스 연결을 초기화합니다.
   */
  async initialize(): Promise<void> {
    try {
      // 타입 단언을 사용하여 타입 안전하게 처리
      this.sqlite = new Database(this.dbPath) as SQLiteDatabase;
      
      // SQLite 프래그마 설정 (타입 안전하게 처리)
      if (this.sqlite) {
        this.sqlite.pragma('journal_mode = WAL');
        this.sqlite.pragma('foreign_keys = ON');
      }
      
      // Drizzle ORM 초기화 (null 체크)
      if (this.sqlite) {
        this.db = drizzle(this.sqlite, { schema });
      }
      
      // 마이그레이션 자동 실행
      await this.runMigrations();
      
      console.log('SQLite 데이터베이스 연결 성공');
    } catch (error) {
      console.error('SQLite 연결 오류:', error);
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }
  }

  /**
   * 데이터베이스 연결을 종료합니다.
   */
  async close(): Promise<void> {
    if (this.sqlite) {
      this.sqlite.close();
      this.sqlite = null;
    }
    
    this.db = null;
  }

  /**
   * SQL 쿼리를 실행합니다.
   */
  async query<T>(query: any): Promise<T> {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    // 직접 SQL 실행인 경우
    if (typeof query === 'string') {
      return this.sqlite.prepare(query).all() as unknown as T;
    }
    
    // 객체형 쿼리에서 text와 values가 있는 경우
    if (typeof query === 'object' && query.text) {
      const { text, values } = query;
      const stmt = this.sqlite.prepare(text);
      
      if (Array.isArray(values)) {
        return stmt.run(...values) as unknown as T;
      }
      
      return stmt.run(values) as unknown as T;
    }
    
    // Drizzle 쿼리 객체인 경우
    if (query.execute && typeof query.execute === 'function') {
      return query.execute() as T;
    }
    
    throw new Error('지원되지 않는 쿼리 형식입니다.');
  }

  /**
   * SQL 명령을 실행합니다.
   */
  async execute(sql: string, params: any[] = []): Promise<any> {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    try {
      const stmt = this.sqlite.prepare(sql);
      return stmt.run(...params);
    } catch (error) {
      console.error('SQL 쿼리 실행 오류:', error);
      throw error;
    }
  }

  /**
   * 데이터를 삽입합니다.
   */
  async insert<T, R>(table: any, data: T): Promise<R> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    // 타입 안전하게 처리
    const result = this.db.insert(table).values(data as Record<string, any>);
    if (result.returning && typeof result.returning === 'function') {
      return result.returning().get() as unknown as R;
    }
    
    return Promise.resolve({} as R);
  }

  /**
   * 데이터를 조회합니다.
   */
  async select<T>(query: any): Promise<T[]> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    return await Promise.resolve(query.all()) as unknown as T[];
  }

  /**
   * 데이터를 수정합니다.
   */
  async update<T, R>(table: any, data: Partial<T>, where: any): Promise<R> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    // 기본 업데이트 쿼리 생성
    const updateQuery = this.db.update(table).set(data as Record<string, any>);
    
    // where 조건 추가 (타입 안전)
    const finalQuery = where ? updateQuery.where(where) : updateQuery;
    
    // 결과 반환
    if (finalQuery.returning && typeof finalQuery.returning === 'function') {
      return finalQuery.returning().get() as unknown as R;
    }
    
    return Promise.resolve({} as R);
  }

  /**
   * 데이터를 삭제합니다.
   */
  async delete<R>(table: any, where: any): Promise<R> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    // 기본 삭제 쿼리 생성
    const deleteQuery = this.db.delete(table);
    
    // where 조건 추가 (타입 안전)
    const finalQuery = where ? deleteQuery.where(where) : deleteQuery;
    
    // 결과 반환
    if (finalQuery.returning && typeof finalQuery.returning === 'function') {
      return finalQuery.returning().get() as unknown as R;
    }
    
    return Promise.resolve({} as R);
  }

  /**
   * 트랜잭션을 시작합니다.
   */
  async beginTransaction(): Promise<void> {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    if (this.transaction) {
      throw new Error('이미 트랜잭션이 진행중입니다.');
    }
    
    // exec 대신 prepare + run 사용 (타입 안전)
    this.sqlite.prepare('BEGIN TRANSACTION;').run();
    this.transaction = true;
  }

  /**
   * 트랜잭션을 커밋합니다.
   */
  async commitTransaction(): Promise<void> {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    if (!this.transaction) {
      throw new Error('진행중인 트랜잭션이 없습니다.');
    }
    
    try {
      // exec 대신 prepare + run 사용 (타입 안전)
      this.sqlite.prepare('COMMIT;').run();
    } finally {
      this.transaction = false;
    }
  }

  /**
   * 트랜잭션을 롤백합니다.
   */
  async rollbackTransaction(): Promise<void> {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    if (!this.transaction) {
      throw new Error('진행중인 트랜잭션이 없습니다.');
    }
    
    try {
      // exec 대신 prepare + run 사용 (타입 안전)
      this.sqlite.prepare('ROLLBACK;').run();
    } finally {
      this.transaction = false;
    }
  }

  /**
   * 마이그레이션을 실행합니다.
   */
  async runMigrations(): Promise<void> {
    if (!this.db || !this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    try {
      await migrate(this.db, {
        migrationsFolder: './src/db/migrations-sqlite'
      });
      console.log('SQLite 마이그레이션 완료');
    } catch (error) {
      console.error('SQLite 마이그레이션 오류:', error);
      throw error;
    }
  }
} 