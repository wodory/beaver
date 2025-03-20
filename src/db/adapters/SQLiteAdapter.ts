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
      this.sqlite = new Database(this.dbPath);
      
      // SQLite 프래그마 설정
      this.sqlite.pragma('journal_mode = WAL');
      this.sqlite.pragma('foreign_keys = ON');
      
      // Drizzle ORM 초기화
      this.db = drizzle(this.sqlite, { schema });
      
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
  async query<T>(sql: string, params: any[] = []): Promise<T> {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    try {
      const stmt = this.sqlite.prepare(sql);
      
      // 단일 행 반환인지 여러 행 반환인지 확인
      if (sql.trim().toLowerCase().startsWith('select')) {
        return stmt.all(...params) as unknown as T;
      } else {
        return stmt.run(...params) as unknown as T;
      }
    } catch (error) {
      console.error('SQL 쿼리 실행 오류:', error);
      throw error;
    }
  }

  /**
   * SQL 명령을 실행합니다.
   */
  async execute(sql: string, params: any[] = []): Promise<void> {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    try {
      const stmt = this.sqlite.prepare(sql);
      stmt.run(...params);
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
    
    return await Promise.resolve(this.db.insert(table).values(data as Record<string, any>).returning().get()) as R;
  }

  /**
   * 데이터를 조회합니다.
   */
  async select<T>(query: any): Promise<T[]> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    return await Promise.resolve(query.all()) as T[];
  }

  /**
   * 데이터를 수정합니다.
   */
  async update<T, R>(table: any, data: Partial<T>, where: any): Promise<R> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    let updateQuery = this.db.update(table).set(data as Record<string, any>);
    
    if (where) {
      if (typeof where === 'function') {
        // 함수형 where 조건 (Drizzle 쿼리 빌더)
        updateQuery = updateQuery.where(where);
      } else if (typeof where === 'object') {
        // 객체형 where 조건 (ID 기반)
        for (const key in where) {
          updateQuery = updateQuery.where(eq(table[key], where[key]));
        }
      }
    }
    
    return await Promise.resolve(updateQuery.returning().get()) as R;
  }

  /**
   * 데이터를 삭제합니다.
   */
  async delete<R>(table: any, where: any): Promise<R> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    let deleteQuery = this.db.delete(table);
    
    if (where) {
      if (typeof where === 'function') {
        // 함수형 where 조건 (Drizzle 쿼리 빌더)
        deleteQuery = deleteQuery.where(where);
      } else if (typeof where === 'object') {
        // 객체형 where 조건 (ID 기반)
        for (const key in where) {
          deleteQuery = deleteQuery.where(eq(table[key], where[key]));
        }
      }
    }
    
    return await Promise.resolve(deleteQuery.returning().get()) as R;
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
    
    this.sqlite.exec('BEGIN TRANSACTION;');
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
      this.sqlite.exec('COMMIT;');
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
      this.sqlite.exec('ROLLBACK;');
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