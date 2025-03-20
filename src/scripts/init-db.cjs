/**
 * 데이터베이스 초기화 스크립트 (CommonJS)
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../../src/config.json');

// 환경 변수 설정
process.env.DB_TYPE = 'postgresql';
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_Fg3G0Pyrcklp@ep-bold-water-a1ga74m9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// SQL 파일 경로
const SQL_FILE_PATH = path.join(__dirname, '../db/schema-sql/create-tables.sql');

/**
 * SQL 파일을 실행합니다.
 */
function executeSqlFile() {
  return new Promise((resolve, reject) => {
    const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');
    
    // SQL 파일 내용을 임시 파일에 저장
    const tempFilePath = path.join(__dirname, 'temp-init-db.sql');
    fs.writeFileSync(tempFilePath, sqlContent);
    
    // psql 명령어로 SQL 실행
    const psqlCommand = `psql "${process.env.DATABASE_URL}" -f "${tempFilePath}"`;
    
    console.log('테이블 생성 중...');
    
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
 * 저장소 추가 함수
 */
function addRepository(repo) {
  return new Promise((resolve, reject) => {
    console.log(`저장소 추가: ${repo.fullName}`);
    
    // 저장소 URL 생성
    const repoUrl = repo.url || `https://oss.navercorp.com/${repo.fullName}.git`;
    
    // Drizzle 대신 직접 psql 명령어 실행
    const psqlCommand = `psql "${process.env.DATABASE_URL}" -c "INSERT INTO repositories (name, full_name, clone_url, type, api_url) VALUES ('${repo.name}', '${repo.fullName}', '${repoUrl}', '${repo.type || 'github'}', '${repo.apiUrl || ''}') ON CONFLICT (full_name) DO NOTHING RETURNING id, name, full_name, clone_url;"`;
    
    exec(psqlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`저장소 추가 오류: ${error.message}`);
        reject(error);
        return;
      }
      console.log(`저장소 추가 결과: ${stdout}`);
      resolve(stdout);
    });
  });
}

/**
 * 메인 함수
 */
async function main() {
  try {
    console.log('데이터베이스 초기화 시작...');
    
    // SQL 파일 실행하여 테이블 생성
    await executeSqlFile();
    
    // 저장소 정보 동기화
    console.log(`${config.repositories.length}개의 저장소 정보를 동기화합니다.`);
    
    for (const repo of config.repositories) {
      await addRepository(repo);
    }
    
    console.log('데이터베이스 초기화 완료!');
  } catch (error) {
    console.error('초기화 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main(); 