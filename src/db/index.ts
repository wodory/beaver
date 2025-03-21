import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema/index.js';
// SQLite 관련 import
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import { migrate as migrateSQLite } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schemaSQLite from './schema-sqlite/index.js';

// DB 어댑터 import
import { NeonDBAdapter } from './adapters/NeonDBAdapter.js';
import { SQLiteAdapter } from './adapters/SQLiteAdapter.js';
import { IDatabaseAdapter } from './adapters/IDatabaseAdapter.js';
import { SQL } from 'drizzle-orm';

// 데이터베이스 타입 설정 (환경 변수에서 읽기)
// 항상 최신 환경 변수 값을 반환하도록 함수로 변경
export function getDbType(): string {
  return process.env.DB_TYPE || 'postgresql';
}

// 정적 변수 대신 동적 변수로 변경
export const DB_TYPE = getDbType();

// 초기 DB 타입 출력
console.log('Initial database type:', getDbType());

// 데이터베이스 연결 문자열
let DB_CONNECTION = '';
let db: any = null;
let queryClient: any = null;

// DB 어댑터 인스턴스
let dbAdapterInstance: IDatabaseAdapter | null = null;

// 데이터베이스 스키마 객체를 내보냅니다.
export { schema, schemaSQLite };

// 데이터베이스 유형에 따라 스키마 선택
export const schemaToUse = getDbType() === 'sqlite' ? schemaSQLite : schema;

/**
 * 데이터베이스를 초기화합니다.
 * 애플리케이션 시작 시 호출해야 합니다.
 */
export async function initializeDatabase(): Promise<any> {
  try {
    // 환경 변수 상태 로깅
    console.log('DB_TYPE (환경 변수):', process.env.DB_TYPE);
    console.log('SQLITE_FILE_PATH (환경 변수):', process.env.SQLITE_FILE_PATH);
    console.log('Resolved database type:', getDbType());
    
    // 데이터베이스 유형에 따라 다른 초기화 로직 사용
    if (getDbType() === 'sqlite') {
      console.log('SQLite 데이터베이스 초기화 중...');
      return await initializeSQLiteDatabase();
    } else {
      console.log('PostgreSQL 데이터베이스 초기화 중...');
      return await initializePostgresDatabase();
    }
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    throw new Error(`데이터베이스 초기화에 실패했습니다: ${(error as Error).message}`);
  }
}

/**
 * SQLite 데이터베이스를 초기화합니다.
 */
async function initializeSQLiteDatabase() {
  try {
    // SQLite 파일 경로 가져오기
    const sqliteFilePath = process.env.SQLITE_FILE_PATH || ':memory:';
    console.log('Using SQLite database with file path:', sqliteFilePath);
    
    // SQLiteAdapter 인스턴스 생성 및 초기화
    dbAdapterInstance = new SQLiteAdapter(sqliteFilePath);
    await dbAdapterInstance.initialize();
    
    // Drizzle ORM 인스턴스 설정
    db = dbAdapterInstance.db;
    
    console.log('SQLite 데이터베이스 초기화 완료');
    return dbAdapterInstance;
  } catch (error) {
    console.error('SQLite 데이터베이스 초기화 실패:', error);
    throw error;
  }
}

/**
 * PostgreSQL 데이터베이스를 초기화합니다.
 */
async function initializePostgresDatabase() {
  // PostgreSQL 데이터베이스 연결
  DB_CONNECTION = process.env.DATABASE_URL || 'postgresql://localhost:5432/github_metrics';
  console.log('Using PostgreSQL database with connection string:', DB_CONNECTION);
  
  // Neon DB 연결을 위한 SSL 설정
  queryClient = postgres(DB_CONNECTION, { 
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: true } // 프로덕션 환경
      : { rejectUnauthorized: false }, // 개발 환경
    max: 1, // Neon 프리티어 권장 값
    idle_timeout: 20, // Neon 권장 값
    connect_timeout: 30 // 연결 타임아웃 (초)
  });
  
  db = drizzle(queryClient, { schema });
  
  // NeonDBAdapter 인스턴스 생성 및 초기화
  dbAdapterInstance = new NeonDBAdapter(DB_CONNECTION);
  await dbAdapterInstance.initialize();
  
  // PostgreSQL 마이그레이션 실행
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
  
  console.log('PostgreSQL 데이터베이스 초기화 완료');
  return dbAdapterInstance;
}

/**
 * 데이터베이스 연결을 종료합니다.
 * 애플리케이션 종료 시 호출해야 합니다.
 */
export async function closeDatabase(): Promise<void> {
  try {
    // DB 어댑터 유형에 따른 종료 처리
    if (getDbType() === 'sqlite') {
      // SQLite 어댑터 종료
      if (dbAdapterInstance) {
        await dbAdapterInstance.close();
        console.log('SQLite 데이터베이스 연결 종료');
      }
    } else {
      // PostgreSQL 어댑터 종료
      if (queryClient) {
        // PostgreSQL 연결 종료
        await queryClient.end();
        console.log('PostgreSQL 쿼리 클라이언트 종료');
      }
      
      if (dbAdapterInstance) {
        await dbAdapterInstance.close();
        console.log('PostgreSQL 어댑터 종료');
      }
    }
    
    db = null;
    queryClient = null;
    dbAdapterInstance = null;
    console.log('데이터베이스 연결 종료 완료');
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
 * 데이터베이스 어댑터를 반환합니다.
 */
export function getDBAdapter(): IDatabaseAdapter {
  if (!dbAdapterInstance) {
    throw new Error('데이터베이스 어댑터가 초기화되지 않았습니다.');
  }
  return dbAdapterInstance;
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
    if (!queryClient) {
      throw new Error('PostgreSQL 쿼리 클라이언트가 초기화되지 않았습니다.');
    }
    
    // PostgreSQL 트랜잭션 실행
    const result = await queryClient.transaction(async () => {
      // 콜백 실행 및 결과 반환
      return await callback();
    });
    
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * 기존 코드 호환성을 위한 dbAdapter 객체
 * 다른 부분의 코드 수정 없이 dbAdapter를 사용할 수 있도록 함
 */
export const dbAdapter = {
  get db() {
    return getDBAdapter().db;
  },
  
  async select<T>(query: any): Promise<T[]> {
    return getDBAdapter().select<T>(query);
  },
  
  async insert<T, R>(table: any, data: T): Promise<R> {
    return getDBAdapter().insert<T, R>(table, data);
  },
  
  async update<T, R>(table: any, data: Partial<T>, where: SQL<unknown>): Promise<R> {
    return getDBAdapter().update<T, R>(table, data, where);
  },
  
  async delete<R>(table: any, where: SQL<unknown>): Promise<R> {
    return getDBAdapter().delete<R>(table, where);
  }
}; 