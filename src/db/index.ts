import { IDatabaseAdapter } from './adapters/IDatabaseAdapter';
import { DatabaseFactory, DatabaseType } from './DatabaseFactory';
import * as schema from './schema';
import * as schemaSQLite from './schema-sqlite';

// 환경 변수에서 DB 타입 확인 (기본값: sqlite)
const dbType = process.env.DB_TYPE || 'sqlite';
console.log(`Database type from env: ${dbType}`);

const DB_TYPE = dbType.toLowerCase() === 'sqlite' ? DatabaseType.SQLITE : DatabaseType.POSTGRESQL;
console.log('Selected database type:', DB_TYPE);

// 데이터베이스 연결 문자열 또는 파일 경로
let DB_CONNECTION = '';
if (DB_TYPE === DatabaseType.SQLITE) {
  DB_CONNECTION = process.env.SQLITE_DB_PATH || './data/github-metrics.db';
  console.log('Using SQLite database at:', DB_CONNECTION);
} else {
  DB_CONNECTION = process.env.DATABASE_URL || 'postgresql://localhost:5432/github_metrics';
  console.log('Using PostgreSQL database with connection string:', DB_CONNECTION);
}

// 데이터베이스 어댑터 인스턴스 생성
export const dbAdapter: IDatabaseAdapter = DatabaseFactory.createAdapter(DB_TYPE, DB_CONNECTION);

/**
 * 데이터베이스를 초기화합니다.
 * 애플리케이션 시작 시 호출해야 합니다.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await dbAdapter.initialize();
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
    await dbAdapter.close();
    console.log('데이터베이스 연결 종료');
  } catch (error) {
    console.error('데이터베이스 연결 종료 실패:', error);
  }
}

/**
 * 마이그레이션을 실행합니다.
 */
export async function runMigrations(): Promise<void> {
  try {
    await dbAdapter.runMigrations();
    console.log('마이그레이션 완료');
  } catch (error) {
    console.error('마이그레이션 실패:', error);
    throw error;
  }
}

/**
 * 데이터베이스 스키마 객체를 내보냅니다.
 */
export { schema };

// 데이터베이스 타입에 따라 적절한 스키마 사용
export const schemaToUse = DB_TYPE === DatabaseType.SQLITE ? schemaSQLite : schema;

/**
 * 트랜잭션을 실행합니다.
 * 
 * @param callback 트랜잭션 내에서 실행할 콜백 함수
 * @returns 콜백 함수의 결과
 */
export async function transaction<T>(callback: () => Promise<T>): Promise<T> {
  try {
    await dbAdapter.beginTransaction();
    const result = await callback();
    await dbAdapter.commitTransaction();
    return result;
  } catch (error) {
    await dbAdapter.rollbackTransaction();
    throw error;
  }
} 