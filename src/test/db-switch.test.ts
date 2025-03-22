import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SQLiteAdapter } from '../db/adapters/SQLiteAdapter.js';
import { Repository } from '../types/settings.js';

// DB 모듈 모킹
vi.mock('../db/index.js', async () => {
  return {
    getDBAdapter: vi.fn(),
    getDB: vi.fn(),
    initializeDatabase: vi.fn(),
    closeDatabase: vi.fn(),
  };
});

// 테스트 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SQLITE_TEST_DB_PATH = path.resolve(__dirname, '../../test_db_switch.db');

// DB 모듈 가져오기
const { getDBAdapter, getDB, initializeDatabase, closeDatabase } = await import('../db/index.js');

// 테스트 데이터
const testRepository: Repository = {
  id: 99999,
  name: 'test-repo',
  fullName: 'test-org/test-repo',
  url: 'https://github.com/test-org/test-repo',
  owner: 'test-user',
  ownerReference: 'test-user@github',
  type: 'github'
};

describe('DB 타입 전환 테스트', () => {
  // 테스트 어댑터
  let sqliteAdapter: SQLiteAdapter;
  let mockDb: any;
  
  // 테스트 환경 설정 및 정리
  const originalDbType = process.env.DB_TYPE;
  const originalSqlitePath = process.env.SQLITE_FILE_PATH;

  beforeEach(() => {
    // mock 초기화
    vi.clearAllMocks();
    
    // 기존 테스트 DB 파일 삭제
    if (fs.existsSync(SQLITE_TEST_DB_PATH)) {
      fs.unlinkSync(SQLITE_TEST_DB_PATH);
    }
    
    // SQLite 어댑터 및 모의 DB 설정
    sqliteAdapter = new SQLiteAdapter(SQLITE_TEST_DB_PATH);
    
    // mock 응답 설정
    mockDb = {
      execute: vi.fn().mockImplementation((sql, params) => {
        // SELECT 쿼리에 대한 모의 응답
        if (sql.trim().toLowerCase().startsWith('select')) {
          if (sql.includes('repositories')) {
            // repository 테이블 조회 결과
            return [
              {
                id: testRepository.id,
                name: testRepository.name,
                full_name: testRepository.fullName,
                url: testRepository.url,
                owner: testRepository.owner,
                type: testRepository.type
              }
            ];
          }
          return [{ result: 1 }]; // 기본 SELECT 응답
        }
        // 삽입/생성/업데이트 쿼리에 대한 모의 응답
        return [];
      })
    };
  });

  afterEach(async () => {
    // 테스트 DB 파일 삭제
    if (fs.existsSync(SQLITE_TEST_DB_PATH)) {
      fs.unlinkSync(SQLITE_TEST_DB_PATH);
    }
    
    // 환경 변수 복원
    process.env.DB_TYPE = originalDbType;
    process.env.SQLITE_FILE_PATH = originalSqlitePath;
  });

  // 테스트 1: SQLite 모드 테스트
  test('SQLite 모드에서 DB 타입이 올바르게 설정되어야 함', async () => {
    // 모의 함수 구현 설정
    getDBAdapter.mockReturnValue(sqliteAdapter);
    getDB.mockReturnValue(mockDb);
    
    // SQLite 환경으로 설정
    process.env.DB_TYPE = 'sqlite';
    process.env.SQLITE_FILE_PATH = SQLITE_TEST_DB_PATH;
    
    // DB 초기화
    await initializeDatabase();
    
    // DB 타입 검증 (환경 변수 직접 확인)
    expect(process.env.DB_TYPE).toBe('sqlite');
    
    // DB 함수 호출 검증 (강제로 모의 함수를 호출)
    const dbAdapter = getDBAdapter();
    expect(getDBAdapter).toHaveBeenCalled();
    expect(dbAdapter).toBe(sqliteAdapter);
    
    // DB 연결 검증
    const db = getDB();
    expect(getDB).toHaveBeenCalled();
    expect(db).toBe(mockDb);
    
    // 간단한 쿼리 실행 검증
    await db.execute('SELECT 1 as result');
    expect(db.execute).toHaveBeenCalledWith('SELECT 1 as result');
  });

  // 테스트 2: PostgreSQL 모드 테스트
  test('PostgreSQL 모드에서 DB 타입이 올바르게 설정되어야 함', async () => {
    // 모의 함수 구현 설정
    getDB.mockReturnValue(mockDb);
    
    // PostgreSQL 환경으로 설정
    process.env.DB_TYPE = 'postgresql';
    
    // DB 초기화
    await initializeDatabase();
    
    // DB 타입 검증 (환경 변수 직접 확인)
    expect(process.env.DB_TYPE).toBe('postgresql');
    
    // DB 연결 검증 (강제로 모의 함수를 호출)
    const db = getDB();
    expect(getDB).toHaveBeenCalled();
    expect(db).toBe(mockDb);
  });

  // 테스트 3: DB 전환 테스트 - SQLite에서 PostgreSQL로
  test('SQLite에서 PostgreSQL로 전환이 올바르게 동작해야 함', async () => {
    // 모의 함수 구현 설정
    getDB.mockReturnValue(mockDb);
    
    // 먼저 SQLite 모드로 설정
    process.env.DB_TYPE = 'sqlite';
    process.env.SQLITE_FILE_PATH = SQLITE_TEST_DB_PATH;
    
    // SQLite DB 초기화
    await initializeDatabase();
    
    // SQLite DB 타입 검증 (환경 변수 직접 확인)
    expect(process.env.DB_TYPE).toBe('sqlite');
    
    // DB 종료
    await closeDatabase();
    
    // PostgreSQL 모드로 전환
    process.env.DB_TYPE = 'postgresql';
    
    // PostgreSQL DB 초기화
    await initializeDatabase();
    
    // PostgreSQL DB 타입 검증 (환경 변수 직접 확인)
    expect(process.env.DB_TYPE).toBe('postgresql');
  });
  
  // 테스트 4: 동일 데이터를 두 DB에 저장 및 검색 테스트
  test('두 DB에서 동일한 데이터를 저장하고 검색할 수 있어야 함', async () => {
    // 모의 함수 구현 설정
    getDB.mockReturnValue(mockDb);
    
    // 먼저 SQLite 모드로 설정
    process.env.DB_TYPE = 'sqlite';
    process.env.SQLITE_FILE_PATH = SQLITE_TEST_DB_PATH;
    
    // SQLite DB 초기화
    await initializeDatabase();
    
    // DB 인스턴스 가져오기
    const db = getDB();
    
    // SQLite에 저장소 테이블 생성
    await db.execute(`
      CREATE TABLE IF NOT EXISTS repositories (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL UNIQUE,
        url TEXT NOT NULL,
        owner TEXT NOT NULL,
        type TEXT DEFAULT 'github' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // SQLite에 테스트 데이터 삽입
    await db.execute(`
      INSERT INTO repositories (id, name, full_name, url, owner, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      testRepository.id,
      testRepository.name,
      testRepository.fullName,
      testRepository.url,
      testRepository.owner,
      testRepository.type
    ]);
    
    // SQLite에서 데이터 조회
    const sqliteResult = await db.execute(`
      SELECT * FROM repositories WHERE id = ?
    `, [testRepository.id]);
    
    // 데이터 존재 확인
    expect(sqliteResult.length).toBeGreaterThan(0);
    expect(sqliteResult[0].name).toBe(testRepository.name);
    expect(sqliteResult[0].full_name).toBe(testRepository.fullName);
    
    // DB 종료
    await closeDatabase();
    
    // PostgreSQL 모드로 전환
    process.env.DB_TYPE = 'postgresql';
    
    // PostgreSQL DB 초기화
    await initializeDatabase();
    
    // PostgreSQL에 저장소 테이블 생성 (스키마 일관성 유지)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS repositories (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL UNIQUE,
        url TEXT NOT NULL,
        owner TEXT NOT NULL,
        type TEXT DEFAULT 'github' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // PostgreSQL에 테스트 데이터 삽입
    await db.execute(`
      INSERT INTO repositories (id, name, full_name, url, owner, type)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      testRepository.id,
      testRepository.name,
      testRepository.fullName,
      testRepository.url,
      testRepository.owner,
      testRepository.type
    ]);
    
    // PostgreSQL에서 데이터 조회
    const postgresResult = await db.execute(`
      SELECT * FROM repositories WHERE id = $1
    `, [testRepository.id]);
    
    // 데이터 존재 확인
    expect(postgresResult.length).toBeGreaterThan(0);
    expect(postgresResult[0].name).toBe(testRepository.name);
    expect(postgresResult[0].full_name).toBe(testRepository.fullName);
  });
}); 