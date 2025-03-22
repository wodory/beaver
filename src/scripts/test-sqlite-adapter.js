// SQLite 어댑터 테스트 스크립트
import { SQLiteAdapter } from '../db/adapters/SQLiteAdapter.js';
import * as schemaSQLite from '../db/schema-sqlite/index.js';

async function main() {
  try {
    console.log('환경 변수 확인:');
    console.log('DB_TYPE:', process.env.DB_TYPE);
    console.log('SQLITE_FILE_PATH:', process.env.SQLITE_FILE_PATH);
    
    // SQLite 파일 경로 설정
    const sqliteFilePath = process.env.SQLITE_FILE_PATH || './test_github_accounts.db';
    console.log('SQLite 파일 경로:', sqliteFilePath);
    
    // SQLite 어댑터 인스턴스 생성
    const sqliteAdapter = new SQLiteAdapter(sqliteFilePath);
    console.log('SQLite 어댑터 인스턴스 생성 성공!');
    
    // 데이터베이스 초기화
    console.log('데이터베이스 초기화 시작...');
    await sqliteAdapter.initialize();
    console.log('데이터베이스 초기화 완료!');
    
    // DB 인스턴스 확인
    if (!sqliteAdapter.db) {
      throw new Error('데이터베이스 인스턴스를 가져올 수 없습니다.');
    }
    console.log('데이터베이스 인스턴스 가져오기 성공!');
    
    // 테이블 목록 확인
    try {
      console.log('데이터베이스 테이블 확인 중...');
      const tables = await sqliteAdapter.execute(
        `SELECT name FROM sqlite_master WHERE type='table';`
      );
      console.log('데이터베이스 테이블 목록:', tables);

      // 저장소 테이블 스키마 확인
      console.log('저장소 스키마 확인 중...');
      console.log('저장소 스키마:', schemaSQLite.repositories);
      
      // 저장소 테이블이 있는지 확인
      try {
        console.log('저장소 정보 조회 중...');
        const repositories = await sqliteAdapter.execute(
          `SELECT * FROM repositories LIMIT 5;`
        );
        console.log('저장소 정보:', repositories);
      } catch (repoError) {
        console.error('저장소 테이블 조회 중 오류 발생:', repoError);
      }
    } catch (dbError) {
      console.error('데이터베이스 쿼리 실행 중 오류 발생:', dbError);
    }
    
    // 데이터베이스 연결 종료
    console.log('데이터베이스 연결 종료 중...');
    await sqliteAdapter.close();
    console.log('데이터베이스 연결 종료 완료!');
    
    console.log('테스트 완료!');
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  }
}

// 환경 변수 설정
process.env.DB_TYPE = 'sqlite';
process.env.SQLITE_FILE_PATH = './test_github_accounts.db';

// 스크립트 실행
main(); 