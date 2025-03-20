import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import { migrate as migrateSQLite } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema/index.js';
import * as schemaSQLite from './schema-sqlite/index.js';

// 환경 변수에서 DB 타입 확인 (기본값: sqlite)
const dbType = process.env.DB_TYPE || 'sqlite';
console.log(`Database type from env: ${dbType}`);

// PostgreSQL or SQLite 선택
export const DB_TYPE = dbType.toLowerCase() === 'sqlite' ? 'sqlite' : 'postgresql';
console.log('Selected database type:', DB_TYPE);

// 데이터베이스 연결 문자열 또는 파일 경로
let DB_CONNECTION = '';
let db: any = null;
let queryClient: any = null;

// 데이터베이스 스키마 객체를 내보냅니다.
export { schema };

// 데이터베이스 타입에 따라 적절한 스키마 사용
export const schemaToUse = DB_TYPE === 'sqlite' ? schemaSQLite : schema;

/**
 * 데이터베이스를 초기화합니다.
 * 애플리케이션 시작 시 호출해야 합니다.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    if (DB_TYPE === 'sqlite') {
      DB_CONNECTION = process.env.SQLITE_DB_PATH || './data/github-metrics.db';
      console.log('Using SQLite database at:', DB_CONNECTION);
      
      const sqlite = new Database(DB_CONNECTION);
      sqlite.pragma('journal_mode = WAL');
      sqlite.pragma('foreign_keys = ON');
      
      db = drizzleSQLite(sqlite, { schema: schemaSQLite });
      
      // SQLite 마이그레이션
      await migrateSQLite(db, { migrationsFolder: './src/db/migrations-sqlite' });
    } else {
      DB_CONNECTION = process.env.DATABASE_URL || 'postgresql://localhost:5432/github_metrics';
      console.log('Using PostgreSQL database with connection string:', DB_CONNECTION);
      
      // Neon DB 연결을 위한 SSL 설정
      queryClient = postgres(DB_CONNECTION, { 
        ssl: 'require',
        max: 10, // 연결 풀 최대 크기
        idle_timeout: 30 // 유휴 연결 타임아웃 (초)
      });
      
      db = drizzle(queryClient, { schema });
      
      // PostgreSQL 마이그레이션
      try {
        await migrate(db, { migrationsFolder: './src/db/migrations' });
        console.log('Database migration completed successfully');
      } catch (error: any) {
        // 테이블이 이미 존재하는 경우 (42P07), 오류를 무시하고 계속 진행
        if (error.code === '42P07') {
          console.log('Tables already exist, skipping migration');
        } else {
          // 다른 오류는 다시 throw
          throw error;
        }
      }
    }
    
    console.log('데이터베이스 초기화 완료');
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    throw error;
  }
}

/**
 * 데이터베이스 연결을 종료합니다.
 * 애플리케이션 종료 시 호출해야 합니다.
 */
export async function closeDatabase(): Promise<void> {
  try {
    if (DB_TYPE === 'sqlite') {
      // @ts-ignore - SQLite 연결 종료
      db.driver?.close();
    } else if (queryClient) {
      // PostgreSQL 연결 종료
      await queryClient.end();
    }
    
    db = null;
    queryClient = null;
    console.log('데이터베이스 연결 종료');
  } catch (error) {
    console.error('데이터베이스 연결 종료 실패:', error);
  }
}

/**
 * 데이터베이스 쿼리 클라이언트를 반환합니다.
 */
export function getDB() {
  if (!db) {
    throw new Error('데이터베이스가 초기화되지 않았습니다.');
  }
  return db;
}

/**
 * 트랜잭션을 실행합니다.
 * 
 * @param callback 트랜잭션 내에서 실행할 콜백 함수
 * @returns 콜백 함수의 결과
 */
export async function transaction<T>(callback: () => Promise<T>): Promise<T> {
  if (!db) {
    throw new Error('데이터베이스가 초기화되지 않았습니다.');
  }
  
  try {
    let result: T;
    
    if (DB_TYPE === 'postgresql' && queryClient) {
      result = await queryClient.transaction(async () => {
        // 콜백 실행 및 결과 반환
        return await callback();
      });
    } else {
      // SQLite는 트랜잭션 구현이 다름
      // 적절한 트랜잭션 처리 필요
      // @ts-ignore
      db.driver?.exec('BEGIN TRANSACTION;');
      result = await callback();
      // @ts-ignore
      db.driver?.exec('COMMIT;');
    }
    
    return result;
  } catch (error) {
    if (DB_TYPE === 'sqlite') {
      // @ts-ignore
      db.driver?.exec('ROLLBACK;');
    }
    throw error;
  }
} 