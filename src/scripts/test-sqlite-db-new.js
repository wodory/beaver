// SQLite 데이터베이스 테스트 스크립트
import { initializeDatabase, getDB, dbAdapter, closeDatabase, setDBType } from '../db/index.js';
import { sql } from 'drizzle-orm';
import { testTable } from '../db/schema-sqlite/index.js';

async function main() {
  try {
    console.log('환경 변수 설정...');
    process.env.DB_TYPE = 'sqlite';
    process.env.SQLITE_FILE_PATH = './test_github_accounts.db';
    
    console.log('환경 변수 확인:');
    console.log('DB_TYPE:', process.env.DB_TYPE);
    console.log('SQLITE_FILE_PATH:', process.env.SQLITE_FILE_PATH);
    
    // DB 타입 명시적 설정
    setDBType('sqlite');
    
    // 데이터베이스 초기화
    console.log('데이터베이스 초기화 시작...');
    await initializeDatabase();
    console.log('데이터베이스 초기화 완료!');
    
    // DB 인스턴스 확인
    const db = getDB();
    if (!db) {
      throw new Error('데이터베이스 인스턴스를 가져올 수 없습니다.');
    }
    console.log('데이터베이스 인스턴스 가져오기 성공!');
    
    // 테이블 테스트
    try {
      // 스키마에 정의된 테이블 생성
      console.log('테스트 테이블 생성 중...');
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          created_at INTEGER DEFAULT (unixepoch('now'))
        )
      `);
      console.log('테스트 테이블 생성 완료');
      
      // 데이터 추가 (insert 메소드 사용)
      console.log('테스트 데이터 추가 중...');
      await db.run(sql`
        INSERT INTO test_table (name, description)
        VALUES ('Test Item', 'This is a test item')
      `);
      console.log('테스트 데이터 추가 완료');
      
      // 데이터 조회 (SQL 쿼리 사용)
      console.log('테스트 데이터 조회 중...');
      const items = await db.all(sql`SELECT * FROM test_table`);
      console.log('테스트 테이블 조회 결과:');
      console.log(items);
      
      // 저장소 테이블 생성
      console.log('저장소 테이블 생성 중...');
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS test_repositories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          url TEXT NOT NULL,
          created_at INTEGER DEFAULT (unixepoch('now'))
        )
      `);
      console.log('저장소 테이블 생성 완료');
      
      // 저장소 데이터 추가
      console.log('저장소 데이터 추가 중...');
      await db.run(sql`
        INSERT INTO test_repositories (name, url)
        VALUES ('test-repo', 'https://github.com/test/repo')
      `);
      console.log('저장소 데이터 추가 완료');
      
      // 저장소 데이터 조회
      console.log('저장소 데이터 조회 중...');
      const repos = await db.all(sql`SELECT * FROM test_repositories`);
      console.log('저장소 조회 결과:');
      console.log(repos);
    } catch (error) {
      console.error('테스트 중 오류 발생:', error);
    } finally {
      // 데이터베이스 연결 종료
      console.log('데이터베이스 연결 종료 중...');
      await closeDatabase();
      console.log('테스트 완료!');
    }
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  }
}

// 스크립트 실행
main(); 