import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema/index.js';
// SQLite 관련 import - 사용함
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import { migrate as migrateSQLite } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schemaSQLite from './schema-sqlite/index.js';
// DB 어댑터 import
import { NeonDBAdapter } from './adapters/NeonDBAdapter.js';
import { SQLiteAdapter } from './adapters/SQLiteAdapter.js';

// 내부 상태로 DB_TYPE 변수를 관리
let _DB_TYPE = 'postgresql';

/**
 * DB 타입을 설정합니다.
 * @param {string} type 'sqlite' 또는 'postgresql'
 */
export function setDBType(type) {
  if (type === 'sqlite' || type === 'postgresql') {
    _DB_TYPE = type;
    console.log(`DB 타입이 '${type}'으로 설정되었습니다.`);
  } else {
    console.warn(`지원되지 않는 DB 타입: '${type}'. 'postgresql'을 사용합니다.`);
    _DB_TYPE = 'postgresql';
  }
}

// 환경 변수에서 DB 타입 확인
if (process.env.DB_TYPE === 'sqlite') {
  setDBType('sqlite');
} else {
  setDBType('postgresql');
}

// DB 타입을 가져오는 함수를 export
export function getDBType() {
  return _DB_TYPE;
}

// DB 타입 내보내기 (주의: 이 값은 변경될 수 있으므로 항상 getDBType() 사용 권장)
export const DB_TYPE = _DB_TYPE;
console.log('Using database type:', getDBType(), '(환경변수 DB_TYPE:', process.env.DB_TYPE, ')');

// 데이터베이스 연결 문자열
let DB_CONNECTION = '';
let db = null;
let queryClient = null;

// DB 어댑터 인스턴스
let dbAdapterInstance = null;

// 데이터베이스 스키마 객체를 내보냅니다.
export { schema };
export { schemaSQLite };

// 사용할 스키마 선택 (항상 최신 DB_TYPE 값 사용)
export function getSchemaToUse() {
  return getDBType() === 'sqlite' ? schemaSQLite : schema;
}

// 호환성을 위해 schemaToUse도 export (실제 동작은 getSchemaToUse()를 통해)
export const schemaToUse = getDBType() === 'sqlite' ? schemaSQLite : schema;

/**
 * 데이터베이스를 초기화합니다.
 * 애플리케이션 시작 시 호출해야 합니다.
 */
export async function initializeDatabase() {
    try {
        // 함수 호출 시점에서 다시 한번 환경 변수 확인
        if (process.env.DB_TYPE === 'sqlite') {
            setDBType('sqlite');
        }
        
        // 현재 DB 타입 확인
        const currentDBType = getDBType();
        console.log('현재 DB 타입:', currentDBType);
        
        // DB 타입에 따라 다른 초기화 로직 사용
        if (currentDBType === 'sqlite') {
            console.log('SQLite 데이터베이스 초기화 중...');
            
            // SQLite 파일 경로 설정
            const sqliteFilePath = process.env.SQLITE_FILE_PATH || './github_metrics.db';
            console.log('Using SQLite database with file path:', sqliteFilePath);
            
            // SQLite 데이터베이스 연결
            try {
                // SQLite 어댑터 초기화
                dbAdapterInstance = new SQLiteAdapter(sqliteFilePath);
                await dbAdapterInstance.initialize();
                
                // SQLite 객체 가져오기 (이미 어댑터 내부에서 생성됨)
                db = dbAdapterInstance.db;
                
                console.log('SQLite 데이터베이스 초기화 성공!');
                return true;
            } catch (sqliteError) {
                console.error('SQLite 초기화 오류:', sqliteError);
                throw sqliteError;
            }
        } else {
            // PostgreSQL 데이터베이스 연결
            DB_CONNECTION = process.env.DATABASE_URL || 'postgresql://localhost:5432/github_metrics';
            console.log('Using PostgreSQL database with connection string:', DB_CONNECTION);
            
            // Neon DB 연결을 위한 SSL 설정
            queryClient = postgres(DB_CONNECTION, {
                ssl: 'require',
                max: 10, // 연결 풀 최대 크기
                idle_timeout: 30 // 유휴 연결 타임아웃 (초)
            });
            
            db = drizzle(queryClient, { schema });
            
            // NeonDBAdapter 인스턴스 생성 및 초기화
            dbAdapterInstance = new NeonDBAdapter(DB_CONNECTION);
            await dbAdapterInstance.initialize();
            
            // PostgreSQL 마이그레이션 실행
            try {
                await migrate(db, { migrationsFolder: './src/db/migrations' });
                console.log('Database migration completed successfully');
            } catch (error) {
                // 테이블이 이미 존재하는 경우 (42P07), 오류를 무시하고 계속 진행
                if (error.code === '42P07') {
                    console.log('Tables already exist, skipping migration');
                } else {
                    throw error;
                }
            }
            
            console.log('Neon DB 연결 성공');
        }
    } catch (error) {
        console.error('데이터베이스 초기화 실패:', error);
        throw error;
    }
}
/**
 * 데이터베이스 연결을 종료합니다.
 * 애플리케이션 종료 시 호출해야 합니다.
 */
export async function closeDatabase() {
    try {
        if (queryClient) {
            // PostgreSQL 연결 종료
            await queryClient.end();
        }
        // DB 어댑터 종료
        if (dbAdapterInstance) {
            await dbAdapterInstance.close();
            dbAdapterInstance = null;
        }
        db = null;
        queryClient = null;
        console.log('데이터베이스 연결 종료');
    }
    catch (error) {
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
export function getDBAdapter() {
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
export async function transaction(callback) {
    if (!db) {
        throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    try {
        if (getDBType() === 'sqlite') {
            // SQLite 트랜잭션 실행
            if (!dbAdapterInstance) {
                throw new Error('SQLite 어댑터가 초기화되지 않았습니다.');
            }
            
            // 트랜잭션 시작
            await dbAdapterInstance.beginTransaction();
            
            try {
                // 콜백 실행
                const result = await callback();
                
                // 트랜잭션 커밋
                await dbAdapterInstance.commitTransaction();
                
                return result;
            } catch (error) {
                // 오류 발생 시 롤백
                await dbAdapterInstance.rollbackTransaction();
                throw error;
            }
        } else {
            // PostgreSQL 트랜잭션 실행
            if (!queryClient) {
                throw new Error('PostgreSQL 쿼리 클라이언트가 초기화되지 않았습니다.');
            }
            
            // PostgreSQL 트랜잭션 실행
            const result = await queryClient.transaction(async () => {
                // 콜백 실행 및 결과 반환
                return await callback();
            });
            return result;
        }
    }
    catch (error) {
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
    async initialize() {
        return initializeDatabase();
    },
    async close() {
        return closeDatabase();
    },
    async select(query) {
        return getDBAdapter().select(query);
    },
    async insert(table, data) {
        return getDBAdapter().insert(table, data);
    },
    async update(table, data, where) {
        return getDBAdapter().update(table, data, where);
    },
    async delete(table, where) {
        return getDBAdapter().delete(table, where);
    }
};
