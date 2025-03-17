import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import Database from 'better-sqlite3';
import { IDatabaseAdapter } from './IDatabaseAdapter';
import * as schema from '../schema-sqlite';

/**
 * SQLite 데이터베이스 어댑터
 */
export class SQLiteAdapter implements IDatabaseAdapter {
  private sqlite: Database | null = null;
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
   * 쿼리를 실행합니다. (데이터 반환)
   */
  async query<T>(sql: string, params: any[] = []): Promise<T> {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    try {
      // BetterSQLite3 사용
      const stmt = this.sqlite.prepare(sql);
      const result = stmt.all(...params);
      return result as T;
    } catch (error) {
      console.error('SQL 쿼리 실행 오류:', error);
      throw error;
    }
  }

  /**
   * 쿼리를 실행합니다. (데이터 반환 없음)
   */
  async execute(sql: string, params: any[] = []): Promise<void> {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    try {
      // BetterSQLite3 사용
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
  async insert<T extends Record<string, any>, R>(table: any, data: T): Promise<R> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    return await Promise.resolve(this.db.insert(table).values(data).returning().get()) as R;
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
    
    const updateQuery = this.db.update(table).set(data);
    if (where) {
      // where 조건이 객체인 경우 eq로 변환
      if (typeof where === 'object' && !Array.isArray(where)) {
        const conditions = Object.entries(where).map(([key, value]) => {
          return eq(table[key as keyof typeof table], value);
        });
        
        // where 사용 - 단일 조건 적용
        return await Promise.resolve(updateQuery.where(where).returning().get()) as R;
      } else {
        // where가 이미 drizzle 조건인 경우
        return await Promise.resolve(updateQuery.where(where).returning().get()) as R;
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
    
    const deleteQuery = this.db.delete(table);
    if (where) {
      // where 조건이 객체인 경우 eq로 변환
      if (typeof where === 'object' && !Array.isArray(where)) {
        const conditions = Object.entries(where).map(([key, value]) => {
          return eq(table[key as keyof typeof table], value);
        });
        
        // where 사용 - 단일 조건 적용
        return await Promise.resolve(deleteQuery.where(where).returning().get()) as R;
      } else {
        // where가 이미 drizzle 조건인 경우
        return await Promise.resolve(deleteQuery.where(where).returning().get()) as R;
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
    
    this.sqlite.exec('BEGIN TRANSACTION');
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
      throw new Error('트랜잭션이 시작되지 않았습니다.');
    }
    
    this.sqlite.exec('COMMIT');
    this.transaction = false;
  }

  /**
   * 트랜잭션을 롤백합니다.
   */
  async rollbackTransaction(): Promise<void> {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    if (!this.transaction) {
      throw new Error('트랜잭션이 시작되지 않았습니다.');
    }
    
    this.sqlite.exec('ROLLBACK');
    this.transaction = false;
  }

  /**
   * 마이그레이션을 실행합니다.
   */
  async runMigrations(): Promise<void> {
    try {
      if (!this.db) {
        throw new Error('데이터베이스가 초기화되지 않았습니다.');
      }
      
      // HACK: 기존 파일 기반 마이그레이션 대신 스키마 정의를 직접 사용하여 테이블 생성
      const statements = [
        "CREATE TABLE IF NOT EXISTS repositories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, full_name TEXT NOT NULL UNIQUE, clone_url TEXT NOT NULL, local_path TEXT, type TEXT NOT NULL DEFAULT 'github', api_url TEXT, api_token TEXT, last_sync_at TEXT DEFAULT CURRENT_TIMESTAMP, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);",
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT NOT NULL, name TEXT, email TEXT, avatar_url TEXT, github_id INTEGER UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);",
        "CREATE TABLE IF NOT EXISTS commits (id TEXT PRIMARY KEY, repository_id INTEGER NOT NULL, author_id INTEGER, committer_id INTEGER, message TEXT, committed_at TEXT NOT NULL, additions INTEGER, deletions INTEGER, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);",
        "CREATE TABLE IF NOT EXISTS pull_requests (id INTEGER PRIMARY KEY AUTOINCREMENT, number INTEGER NOT NULL, repository_id INTEGER NOT NULL, title TEXT NOT NULL, state TEXT NOT NULL, author_id INTEGER, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, closed_at TEXT, merged_at TEXT, additions INTEGER, deletions INTEGER, changed_files INTEGER, record_created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, record_updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);",
        "CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, pull_request_id INTEGER NOT NULL, state TEXT NOT NULL, author_id INTEGER, submitted_at TEXT NOT NULL, body TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);"
      ];
      
      // 트랜잭션 내에서 모든 테이블 생성
      this.sqlite?.exec('BEGIN TRANSACTION;');
      
      for (const statement of statements) {
        this.sqlite?.exec(statement);
      }
      
      this.sqlite?.exec('COMMIT;');
      
      console.log('마이그레이션 완료');
    } catch (error) {
      console.error('마이그레이션 오류:', error);
      if (this.sqlite?.inTransaction) {
        this.sqlite.exec('ROLLBACK;');
      }
      throw error;
    }
  }
} 