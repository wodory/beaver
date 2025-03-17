import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { eq } from 'drizzle-orm';
import { IDatabaseAdapter } from './IDatabaseAdapter';
import * as schema from '../schema';

// pg 모듈 타입
type Pool = any;
type PoolClient = any;

/**
 * PostgreSQL 데이터베이스 어댑터
 */
export class PostgreSQLAdapter implements IDatabaseAdapter {
  private pool: Pool | null = null;
  public db: ReturnType<typeof drizzle> | null = null;
  private client: PoolClient | null = null;

  /**
   * PostgreSQL 어댑터를 초기화합니다.
   * @param connectionString PostgreSQL 연결 문자열
   */
  constructor(private readonly connectionString: string) {}

  /**
   * 데이터베이스 연결을 초기화합니다.
   */
  async initialize(): Promise<void> {
    try {
      // ESM 환경에서 동적 임포트
      const pg = await import('pg');
      const Pool = pg.default.Pool;
      this.pool = new Pool({
        connectionString: this.connectionString,
      });
      
      // 연결 테스트
      await this.pool.query('SELECT NOW()');
      
      // Drizzle ORM 초기화
      this.db = drizzle(this.pool, { schema });
      
      console.log('PostgreSQL 데이터베이스 연결 성공');
    } catch (error) {
      console.error('PostgreSQL 연결 오류:', error);
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }
  }

  /**
   * 데이터베이스 연결을 종료합니다.
   */
  async close(): Promise<void> {
    if (this.client) {
      this.client.release();
      this.client = null;
    }
    
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    
    this.db = null;
  }

  /**
   * 쿼리를 실행합니다.
   */
  async query<T>(query: any): Promise<T> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    return await query.execute() as T;
  }

  /**
   * 데이터를 삽입합니다.
   */
  async insert<T extends Record<string, any>, R>(table: any, data: T): Promise<R> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    return await this.db.insert(table).values(data).returning().execute() as R;
  }

  /**
   * 데이터를 조회합니다.
   */
  async select<T>(query: any): Promise<T[]> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    return await query.execute() as T[];
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
      // where 사용
      return await updateQuery.where(where).returning().execute() as R;
    }
    
    return await updateQuery.returning().execute() as R;
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
      // where 사용
      return await deleteQuery.where(where).returning().execute() as R;
    }
    
    return await deleteQuery.returning().execute() as R;
  }

  /**
   * 트랜잭션을 시작합니다.
   */
  async beginTransaction(): Promise<void> {
    if (!this.pool) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    this.client = await this.pool.connect();
    await this.client.query('BEGIN');
  }

  /**
   * 트랜잭션을 커밋합니다.
   */
  async commitTransaction(): Promise<void> {
    if (!this.client) {
      throw new Error('트랜잭션이 시작되지 않았습니다.');
    }
    
    await this.client.query('COMMIT');
    this.client.release();
    this.client = null;
  }

  /**
   * 트랜잭션을 롤백합니다.
   */
  async rollbackTransaction(): Promise<void> {
    if (!this.client) {
      throw new Error('트랜잭션이 시작되지 않았습니다.');
    }
    
    await this.client.query('ROLLBACK');
    this.client.release();
    this.client = null;
  }

  /**
   * 마이그레이션을 실행합니다.
   */
  async runMigrations(): Promise<void> {
    if (!this.db || !this.pool) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    const db = drizzle(this.pool);
    
    // 마이그레이션 실행
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    console.log('마이그레이션 완료');
  }
} 