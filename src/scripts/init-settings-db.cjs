/**
 * 설정 테이블 초기화 스크립트 (CommonJS)
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 환경 변수 설정
process.env.DB_TYPE = 'postgresql';
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_Fg3G0Pyrcklp@ep-bold-water-a1ga74m9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// SQL 파일 경로
const SQL_FILE_PATH = path.join(__dirname, '../db/schema-sql/settings.sql');

/**
 * SQL 파일을 실행합니다.
 */
function executeSqlFile() {
  return new Promise((resolve, reject) => {
    const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');
    
    // SQL 파일 내용을 임시 파일에 저장
    const tempFilePath = path.join(__dirname, 'temp-settings-db.sql');
    fs.writeFileSync(tempFilePath, sqlContent);
    
    // psql 명령어로 SQL 실행
    const psqlCommand = `psql "${process.env.DATABASE_URL}" -f "${tempFilePath}"`;
    
    console.log('설정 테이블 생성 중...');
    
    exec(psqlCommand, (error, stdout, stderr) => {
      // 임시 파일 삭제
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.error('임시 파일 삭제 실패:', e);
      }
      
      if (error) {
        console.error(`SQL 실행 오류: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr && !stderr.includes('NOTICE')) {
        console.error(`SQL 실행 오류: ${stderr}`);
        reject(new Error(stderr));
        return;
      }
      console.log(`SQL 실행 결과: ${stdout}`);
      resolve(stdout);
    });
  });
}

/**
 * 메인 함수
 */
async function main() {
  try {
    console.log('설정 테이블 초기화 시작...');
    
    // SQL 파일 실행하여 테이블 생성
    await executeSqlFile();
    
    console.log('설정 테이블 초기화 완료!');
  } catch (error) {
    console.error('초기화 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main(); 