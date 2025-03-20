import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema/index.js';
// SQLite 관련 import - 참고용으로 유지 (사용되지 않음)
//import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
//import { migrate as migrateSQLite } from 'drizzle-orm/better-sqlite3/migrator';
//import Database from 'better-sqlite3';
//import * as schemaSQLite from './schema-sqlite/index.js';
// DB 어댑터 import
import { NeonDBAdapter } from './adapters/NeonDBAdapter.js';
// PostgreSQL을 기본 데이터베이스로 사용
export const DB_TYPE = 'postgresql';
console.log('Using database type:', DB_TYPE);
// 데이터베이스 연결 문자열
let DB_CONNECTION = '';
let db = null;
let queryClient = null;
// DB 어댑터 인스턴스
let dbAdapterInstance = null;
// 데이터베이스 스키마 객체를 내보냅니다.
export { schema };
// PostgreSQL 스키마 사용
export const schemaToUse = schema;
/**
 * 데이터베이스를 초기화합니다.
 * 애플리케이션 시작 시 호출해야 합니다.
 */
export async function initializeDatabase() {
    try {
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
        }
        catch (error) {
            // 테이블이 이미 존재하는 경우 (42P07), 오류를 무시하고 계속 진행
            if (error.code === '42P07') {
                console.log('Tables already exist, skipping migration');
            }
            else {
                // 다른 오류는 다시 throw
                throw error;
            }
        }
        console.log('데이터베이스 초기화 완료');
    }
    catch (error) {
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
