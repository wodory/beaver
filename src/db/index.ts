// 실제 사용되는 PostgreSQL 라이브러리 임포트 복원
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema/index.js';
import * as schemaSQLite from './schema-sqlite/index.js';

// SQLite 관련 import
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import { migrate as migrateSQLite } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';

// DB 어댑터 import
import { NeonDBAdapter } from './adapters/NeonDBAdapter.js';
import { SQLiteAdapter } from './adapters/SQLiteAdapter.js';
import { IDatabaseAdapter } from './adapters/IDatabaseAdapter.js';
import { SQL } from 'drizzle-orm';

// 데이터베이스 타입 정의 (별도 파일에서 import하지 않고 직접 정의)
const DB_TYPES = {
  POSTGRESQL: 'postgresql',
  SQLITE: 'sqlite'
} as const;

/**
 * 현재 사용 중인 DB 타입을 반환합니다.
 * 
 * @returns {'postgresql' | 'sqlite'} 현재 사용 중인 DB 타입
 */
export function getDbType(): 'postgresql' | 'sqlite' {
  // 환경 변수에서 DB_TYPE 직접 확인 (dotenv는 이미 앱 시작 시점에 로드됨)
  console.log('getDbType - 환경변수 DB_TYPE:', process.env.DB_TYPE);
  
  // 명시적으로 'sqlite'인 경우에만 SQLite 사용, 그 외에는 PostgreSQL 사용
  if (process.env.DB_TYPE === 'sqlite') {
    console.log('SQLite 데이터베이스 사용 결정됨');
    return 'sqlite';
  }
  
  console.log('PostgreSQL 데이터베이스 사용 결정됨');
  return 'postgresql';
}

// DB 타입 결정 (환경 변수에서 직접 읽기)
export const DB_TYPE = process.env.DB_TYPE === 'sqlite' ? 'sqlite' : 'postgresql';

console.log(`Using database type: ${DB_TYPE}`);

// 데이터베이스 연결 문자열
let DB_CONNECTION = '';
let db: any = null;
let queryClient: any = null;

// DB 어댑터 인스턴스
let dbAdapterInstance: IDatabaseAdapter | null = null;

// 데이터베이스 스키마 객체를 내보냅니다.
export { schema, schemaSQLite };

// DB 타입에 따른 스키마 선택
export let schemaToUse: typeof schema | typeof schemaSQLite;
if (DB_TYPE === 'sqlite') {
  console.log('SQLite 스키마 사용');
  schemaToUse = schemaSQLite;
} else {
  console.log('PostgreSQL 스키마 사용');
  schemaToUse = schema;
}

// 데이터베이스 어댑터 팩토리 (직접 구현)
class DatabaseAdapterFactory {
  private static instance: DatabaseAdapterFactory;
  private adapters: Map<string, IDatabaseAdapter> = new Map();
  
  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): DatabaseAdapterFactory {
    if (!DatabaseAdapterFactory.instance) {
      DatabaseAdapterFactory.instance = new DatabaseAdapterFactory();
    }
    return DatabaseAdapterFactory.instance;
  }
  
  /**
   * 데이터베이스 어댑터 생성
   * @param type 데이터베이스 타입
   * @param connectionString 연결 문자열
   * @returns 데이터베이스 어댑터 인스턴스
   */
  public createAdapter(type: string, connectionString: string): IDatabaseAdapter {
    // 캐시된 어댑터가 있으면 재사용
    const cacheKey = `${type}:${connectionString}`;
    if (this.adapters.has(cacheKey)) {
      return this.adapters.get(cacheKey)!;
    }
    
    // 타입에 따라 어댑터 생성
    let adapter: IDatabaseAdapter;
    
    if (type === DB_TYPES.POSTGRESQL) {
      adapter = new NeonDBAdapter(connectionString);
    } else if (type === DB_TYPES.SQLITE) {
      adapter = new SQLiteAdapter(connectionString);
    } else {
      throw new Error(`지원하지 않는 데이터베이스 타입: ${type}`);
    }
    
    // 어댑터 캐싱
    this.adapters.set(cacheKey, adapter);
    
    return adapter;
  }
  
  /**
   * 모든 어댑터 연결 종료
   */
  public async closeAll(): Promise<void> {
    // 모든 캐시된 어댑터 연결 종료
    for (const adapter of this.adapters.values()) {
      await adapter.close();
    }
    
    // 캐시 비우기
    this.adapters.clear();
  }
}

// 팩토리 인스턴스
const databaseAdapterFactory = DatabaseAdapterFactory.getInstance();

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
    
    // 팩토리를 통해 SQLite 어댑터 생성
    dbAdapterInstance = databaseAdapterFactory.createAdapter(DB_TYPES.SQLITE, sqliteFilePath);
    
    // 어댑터 초기화
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
  
  // Postgres 클라이언트 설정 - prepare:false로 변경 (트랜잭션 풀 모드에서는 prepared statements가 지원되지 않음)
  queryClient = postgres(DB_CONNECTION, {
    ssl: 'require',
    max: 10, // 연결 풀 최대 크기
    idle_timeout: 30, // 유휴 연결 타임아웃 (초)
    prepare: false // prepared statements 비활성화
  });
  
  // Drizzle ORM 인스턴스 생성 - 단순화된 설정
  db = drizzle(queryClient, { schema });
  
  // 팩토리를 통해 PostgreSQL 어댑터 생성
  dbAdapterInstance = databaseAdapterFactory.createAdapter(DB_TYPES.POSTGRESQL, DB_CONNECTION);
  
  // 어댑터 초기화
  await dbAdapterInstance.initialize();
  
  // 마이그레이션 실행
  try {
    // null 체크 추가
    if (dbAdapterInstance) {
      await dbAdapterInstance.runMigrations();
      console.log('Database migration completed successfully');
    }
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
    // 팩토리를 통해 모든 어댑터 종료
    await databaseAdapterFactory.closeAll();
    
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
  const adapter = getDBAdapter();
  
  try {
    // 트랜잭션 시작
    await adapter.beginTransaction();
    
    try {
      // 콜백 실행
      const result = await callback();
      
      // 트랜잭션 커밋
      await adapter.commitTransaction();
      
      return result;
    } catch (error) {
      // 오류 발생 시 롤백
      await adapter.rollbackTransaction();
      throw error;
    }
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
  },
  
  async query<T>(query: any): Promise<T> {
    return getDBAdapter().query<T>(query);
  }
}; 