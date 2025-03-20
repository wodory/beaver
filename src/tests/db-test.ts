/**
 * 데이터베이스 연결 테스트
 */
import { initializeDatabase, getDB, schemaToUse as schema, closeDatabase } from '../db/index.js';

async function testDatabase() {
  console.log('데이터베이스 연결 테스트 시작');
  
  try {
    console.log('1. 데이터베이스 초기화 중...');
    await initializeDatabase();
    console.log('데이터베이스 초기화 성공');
    
    console.log('2. 저장소 정보 조회 중...');
    const db = getDB();
    const repositories = await db.select().from(schema.repositories);
    
    console.log(`데이터베이스에서 ${repositories.length}개의 저장소를 찾았습니다.`);
    if (repositories.length > 0) {
      console.log('첫 번째 저장소 정보:');
      console.log(JSON.stringify(repositories[0], null, 2));
    }
    
    return true;
  } catch (error) {
    console.error('데이터베이스 테스트 중 오류 발생:', error);
    return false;
  } finally {
    console.log('데이터베이스 연결 종료 중...');
    await closeDatabase();
    console.log('데이터베이스 연결 종료 완료');
  }
}

// 스크립트가 직접 실행될 때만 테스트 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabase()
    .then(success => {
      if (success) {
        console.log('데이터베이스 테스트 완료: 성공');
        process.exit(0);
      } else {
        console.error('데이터베이스 테스트 완료: 실패');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('예기치 않은 오류:', error);
      process.exit(1);
    });
}

export { testDatabase }; 