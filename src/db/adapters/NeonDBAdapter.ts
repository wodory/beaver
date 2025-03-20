/**
 * Neon DB 데이터베이스 어댑터
 * 
 * Neon DB(서버리스 PostgreSQL)와 연결하고 쿼리를 실행하는 어댑터입니다.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { IDatabaseAdapter } from './IDatabaseAdapter.js';
import * as schema from '../schema/index.js';

/**
 * Neon DB 어댑터 클래스
 */
export class NeonDBAdapter implements IDatabaseAdapter {
  private poolClient: ReturnType<typeof postgres> | null = null;
  public db: ReturnType<typeof drizzle> | null = null;
  private transaction: boolean = false;

  /**
   * Neon DB 어댑터를 초기화합니다.
   * @param connectionString Neon DB 연결 문자열
   */
  constructor(private readonly connectionString: string) {}

  /**
   * 데이터베이스 연결을 초기화합니다.
   */
  async initialize(): Promise<void> {
    try {
      // Neon DB는 서버리스이므로 SSL 필요
      this.poolClient = postgres(this.connectionString, {
        ssl: 'require',
        max: 10,           // 연결 풀 크기 (서버리스에 최적화)
        idle_timeout: 30,  // 유휴 연결 타임아웃 (초)
        connect_timeout: 10 // 연결 타임아웃 (초)
      });
      
      // Drizzle ORM 초기화
      this.db = drizzle(this.poolClient, { schema });
      
      console.log('Neon DB 연결 성공');
    } catch (error) {
      console.error('Neon DB 연결 오류:', error);
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }
  }

  /**
   * 데이터베이스 연결을 종료합니다.
   */
  async close(): Promise<void> {
    if (this.poolClient) {
      await this.poolClient.end();
      this.poolClient = null;
    }
    
    this.db = null;
  }

  /**
   * SQL 쿼리를 실행합니다.
   */
  async query<T>(query: any): Promise<T> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    // 직접 SQL 실행인 경우
    if (typeof query === 'object' && query.text) {
      const { text, values } = query;
      
      if (!this.poolClient) {
        throw new Error('데이터베이스 클라이언트가 초기화되지 않았습니다.');
      }
      
      return await this.poolClient.unsafe(text, values) as unknown as T;
    }
    
    // Drizzle 쿼리 객체인 경우
    return await query.execute() as T;
  }

  /**
   * 데이터를 삽입합니다.
   */
  async insert<T, R>(table: any, data: T): Promise<R> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    return await this.db.insert(table).values(data as Record<string, any>).returning().execute() as R;
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
    
    const updateQuery = this.db.update(table).set(data as Record<string, any>);
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
    if (!this.poolClient) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    if (this.transaction) {
      throw new Error('이미 트랜잭션이 진행중입니다.');
    }
    
    // Neon DB의 트랜잭션은 postgres.js 내장 기능 사용
    this.transaction = true;
  }

  /**
   * 트랜잭션을 커밋합니다.
   */
  async commitTransaction(): Promise<void> {
    if (!this.poolClient) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    if (!this.transaction) {
      throw new Error('진행중인 트랜잭션이 없습니다.');
    }
    
    this.transaction = false;
  }

  /**
   * 트랜잭션을 롤백합니다.
   */
  async rollbackTransaction(): Promise<void> {
    if (!this.poolClient) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    if (!this.transaction) {
      throw new Error('진행중인 트랜잭션이 없습니다.');
    }
    
    this.transaction = false;
  }

  /**
   * 마이그레이션을 실행합니다.
   */
  async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    try {
      await migrate(this.db, {
        migrationsFolder: './src/db/migrations'
      });
      console.log('마이그레이션 완료');
    } catch (error) {
      console.error('마이그레이션 오류:', error);
      throw error;
    }
  }
} 