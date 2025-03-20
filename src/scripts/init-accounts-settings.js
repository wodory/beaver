/**
 * 계정 설정 초기화 스크립트
 */
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 설정
const DB_TYPE = 'postgresql';
const DATABASE_URL = 'postgresql://neondb_owner:npg_Fg3G0Pyrcklp@ep-bold-water-a1ga74m9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// 기본 사용자 ID
const DEFAULT_USER_ID = 1;

// PostgreSQL 클라이언트 생성
const sql = postgres(DATABASE_URL, { 
  ssl: 'require',
  max: 10,
  idle_timeout: 30
});

// SQL 스크립트 파일 경로
const sqlFilePath = path.join(__dirname, '../db/schema-sql/add-accounts-settings.sql');

/**
 * SQL 스크립트를 실행하여 계정 설정을 초기화합니다.
 */
async function initializeAccountsSettings() {
  try {
    console.log('계정 설정 초기화 중...');
    
    // SQL 파일 읽기
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // SQL 스크립트 실행
    const result = await sql.unsafe(sqlScript);
    
    console.log('계정 설정이 성공적으로 초기화되었습니다.');
    console.log('결과:', result);
    
    return true;
  } catch (error) {
    console.error('계정 설정 초기화 중 오류 발생:', error);
    return false;
  }
}

/**
 * 예제 계정 추가 (선택적)
 */
async function addExampleAccounts() {
  try {
    console.log('예제 계정 추가 중...');
    
    // 현재 설정 가져오기
    const currentSettings = await sql`
      SELECT data FROM settings
      WHERE type = 'accounts' AND user_id = ${DEFAULT_USER_ID}
      LIMIT 1
    `;
    
    if (currentSettings.length === 0) {
      console.error('계정 설정을 찾을 수 없습니다.');
      return false;
    }
    
    // 기존 설정 데이터
    let settings = currentSettings[0].data;
    
    // 예제 GitHub 계정 추가
    const exampleGitHubAccount = {
      id: "github_example",
      name: "GitHub 예제 계정",
      type: "github",
      url: "https://github.com",
      apiUrl: "https://api.github.com",
      token: "",
      company: "Example Inc."
    };
    
    // 예제 저장소 추가
    const exampleRepository = {
      id: 1,
      name: "example-repo",
      fullName: "example/example-repo",
      url: "https://github.com/example/example-repo",
      type: "github",
      accountId: "github_example"
    };
    
    // 설정에 예제 데이터 추가
    settings.accounts = [exampleGitHubAccount];
    settings.repositories = [exampleRepository];
    
    // 업데이트된 설정 저장
    await sql`
      UPDATE settings
      SET data = ${settings}::jsonb, updated_at = NOW()
      WHERE type = 'accounts' AND user_id = ${DEFAULT_USER_ID}
    `;
    
    console.log('예제 계정과 저장소가 추가되었습니다.');
    return true;
  } catch (error) {
    console.error('예제 계정 추가 중 오류 발생:', error);
    return false;
  }
}

/**
 * 메인 함수
 */
async function main() {
  try {
    console.log('계정 설정 초기화 시작...');
    
    // 계정 설정 초기화
    const initialized = await initializeAccountsSettings();
    if (!initialized) {
      console.error('계정 설정 초기화 실패.');
      process.exit(1);
    }
    
    // 예제 계정 추가 여부 (선택적)
    const addExamples = process.argv.includes('--add-examples');
    if (addExamples) {
      await addExampleAccounts();
    }
    
    console.log('계정 설정 초기화 완료!');
  } catch (error) {
    console.error('초기화 중 오류 발생:', error);
    process.exit(1);
  } finally {
    // 연결 종료
    await sql.end();
  }
}

// 스크립트 실행
main(); 