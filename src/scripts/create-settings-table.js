import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env 파일 로드
config();

// 기본 사용자 ID
const DEFAULT_USER_ID = 1;

// 데이터베이스 연결 문자열
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// PostgreSQL 클라이언트 생성
const sql = postgres(dbUrl, { 
  ssl: 'require',
  max: 10,
  idle_timeout: 30
});

// SQL 스크립트 파일 경로
const sqlFilePath = path.join(__dirname, 'create-settings-table.sql');

async function createSettingsTable() {
  try {
    console.log('설정 테이블 생성 중...');
    
    // SQL 파일 읽기
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // SQL 스크립트 실행
    await sql.unsafe(sqlScript);
    
    console.log('설정 테이블이 성공적으로 생성되었습니다.');
    return true;
  } catch (error) {
    console.error('설정 테이블 생성 중 오류 발생:', error);
    return false;
  }
}

/**
 * GitHub 설정을 마이그레이션합니다.
 */
async function migrateGitHubSettings() {
  try {
    // GitHub 토큰과 엔터프라이즈 URL 가져오기
    const githubToken = process.env.GITHUB_TOKEN || '';
    const githubEnterpriseUrl = process.env.GITHUB_ENTERPRISE_URL || '';
    
    // 저장소 리스트 파싱 (보통 공백이나 줄바꿈으로 구분된 목록)
    const reposEnv = process.env.GITHUB_REPOSITORIES || '';
    const repositories = reposEnv
      .split(/[,\s]+/)
      .map(repo => repo.trim())
      .filter(Boolean);
    
    // GitHub 설정 객체 생성
    const githubSettings = {
      token: githubToken,
      organization: process.env.GITHUB_ORGANIZATION || '',
      repositories,
      enterpriseUrl: githubEnterpriseUrl
    };
    
    // 이미 설정이 있는지 확인
    const existingSettings = await sql`
      SELECT id FROM settings 
      WHERE type = 'github' AND user_id = ${DEFAULT_USER_ID}
      LIMIT 1
    `;
    
    if (existingSettings.length > 0) {
      // 업데이트
      await sql`
        UPDATE settings 
        SET data = ${githubSettings}, updated_at = NOW() 
        WHERE type = 'github' AND user_id = ${DEFAULT_USER_ID}
      `;
      
      console.log('GitHub 설정이 업데이트되었습니다.');
    } else {
      // 삽입
      await sql`
        INSERT INTO settings (type, user_id, data, created_at, updated_at) 
        VALUES ('github', ${DEFAULT_USER_ID}, ${githubSettings}, NOW(), NOW())
      `;
      
      console.log('GitHub 설정이 생성되었습니다.');
    }
  } catch (error) {
    console.error('GitHub 설정 마이그레이션 실패:', error);
  }
}

/**
 * Jira 설정을 마이그레이션합니다.
 */
async function migrateJiraSettings() {
  try {
    // Jira 설정 파일 경로
    const jiraConfigPath = path.join(__dirname, '../../config/jira.json');
    let jiraSettings = {
      url: '',
      email: '',
      apiToken: '',
      projectKey: ''
    };
    
    // 설정 파일이 있으면 로드
    try {
      if (fs.existsSync(jiraConfigPath)) {
        const jiraConfig = JSON.parse(fs.readFileSync(jiraConfigPath, 'utf8'));
        jiraSettings = {
          url: jiraConfig.baseUrl || '',
          email: jiraConfig.username || '',
          apiToken: jiraConfig.apiToken || '',
          projectKey: Array.isArray(jiraConfig.projectKeys) && jiraConfig.projectKeys.length > 0 
            ? jiraConfig.projectKeys[0] 
            : ''
        };
      }
    } catch (error) {
      console.error('Jira 설정 파일 로드 실패:', error);
    }
    
    // 이미 설정이 있는지 확인
    const existingSettings = await sql`
      SELECT id FROM settings 
      WHERE type = 'jira' AND user_id = ${DEFAULT_USER_ID}
      LIMIT 1
    `;
    
    if (existingSettings.length > 0) {
      // 업데이트
      await sql`
        UPDATE settings 
        SET data = ${jiraSettings}, updated_at = NOW() 
        WHERE type = 'jira' AND user_id = ${DEFAULT_USER_ID}
      `;
      
      console.log('Jira 설정이 업데이트되었습니다.');
    } else {
      // 삽입
      await sql`
        INSERT INTO settings (type, user_id, data, created_at, updated_at) 
        VALUES ('jira', ${DEFAULT_USER_ID}, ${jiraSettings}, NOW(), NOW())
      `;
      
      console.log('Jira 설정이 생성되었습니다.');
    }
  } catch (error) {
    console.error('Jira 설정 마이그레이션 실패:', error);
  }
}

/**
 * 사용자 설정을 마이그레이션합니다.
 */
async function migrateUserSettings() {
  try {
    // 기본 사용자 설정
    const userSettings = {
      notificationsEnabled: true,
      darkModeEnabled: false,
      autoUpdateEnabled: true,
      refreshInterval: parseInt(process.env.REFRESH_INTERVAL || '10', 10),
      language: process.env.LANGUAGE || 'ko',
    };
    
    // 이미 설정이 있는지 확인
    const existingSettings = await sql`
      SELECT id FROM settings 
      WHERE type = 'user' AND user_id = ${DEFAULT_USER_ID}
      LIMIT 1
    `;
    
    if (existingSettings.length > 0) {
      // 업데이트
      await sql`
        UPDATE settings 
        SET data = ${userSettings}, updated_at = NOW() 
        WHERE type = 'user' AND user_id = ${DEFAULT_USER_ID}
      `;
      
      console.log('사용자 설정이 업데이트되었습니다.');
    } else {
      // 삽입
      await sql`
        INSERT INTO settings (type, user_id, data, created_at, updated_at) 
        VALUES ('user', ${DEFAULT_USER_ID}, ${userSettings}, NOW(), NOW())
      `;
      
      console.log('사용자 설정이 생성되었습니다.');
    }
  } catch (error) {
    console.error('사용자 설정 마이그레이션 실패:', error);
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log('설정 테이블 생성 및 마이그레이션 시작...');
  
  try {
    // 테이블 생성
    const tableCreated = await createSettingsTable();
    if (!tableCreated) {
      console.error('설정 테이블 생성 실패, 마이그레이션을 중단합니다.');
      process.exit(1);
    }
    
    // 설정 마이그레이션
    await migrateGitHubSettings();
    await migrateJiraSettings();
    await migrateUserSettings();
    
    console.log('설정 마이그레이션 완료');
  } catch (error) {
    console.error('설정 마이그레이션 실패:', error);
  } finally {
    // 연결 종료
    await sql.end();
  }
}

// 스크립트 실행
main().catch(error => {
  console.error('실행 오류:', error);
  process.exit(1);
}); 