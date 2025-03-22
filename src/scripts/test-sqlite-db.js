// SQLite 데이터베이스 테스트 스크립트
import { initializeDatabase, getDB } from '../db/index.js';

async function main() {
  try {
    console.log('환경 변수 확인:');
    console.log('DB_TYPE:', process.env.DB_TYPE);
    console.log('SQLITE_FILE_PATH:', process.env.SQLITE_FILE_PATH);
    
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
    
    // 테이블 확인을 위한 쿼리 실행
    try {
      console.log('저장소 테이블 확인 중...');
      const tables = await db.execute(
        `SELECT name FROM sqlite_master WHERE type='table';`
      );
      console.log('데이터베이스 테이블 목록:');
      console.log(tables);
      
      // 저장소 테이블이 있는지 확인
      console.log('저장소 정보 조회 중...');
      const repositories = await db.execute(
        `SELECT * FROM repositories LIMIT 5;`
      );
      console.log('저장소 정보:');
      console.log(repositories);
    } catch (dbError) {
      console.error('데이터베이스 쿼리 실행 중 오류 발생:', dbError);
    }
    
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