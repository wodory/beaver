/**
 * 데이터베이스 테스트 스크립트 (CommonJS)
 */
const { exec } = require('child_process');

// 환경 변수 설정
process.env.DB_TYPE = 'postgresql';
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_Fg3G0Pyrcklp@ep-bold-water-a1ga74m9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

/**
 * 저장소 목록을 가져옵니다.
 */
function getRepositories() {
  return new Promise((resolve, reject) => {
    // psql 명령어로 저장소 정보 조회
    const psqlCommand = `psql "${process.env.DATABASE_URL}" -c "SELECT * FROM repositories ORDER BY id;"`;
    
    console.log('저장소 정보를 조회합니다...');
    
    exec(psqlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`조회 오류: ${error.message}`);
        reject(error);
        return;
      }
      
      console.log('저장소 목록:');
      console.log(stdout);
      resolve(stdout);
    });
  });
}

/**
 * 메인 함수
 */
async function main() {
  try {
    // 저장소 정보 조회
    await getRepositories();
    
    console.log('데이터베이스 연결 및 조회 성공!');
  } catch (error) {
    console.error('데이터베이스 조회 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main(); 