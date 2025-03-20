/**
 * 기본 설정 업데이트 스크립트
 * 
 * .env 파일과 config.json의 값을 NeonDB 설정 테이블에 반영합니다.
 */
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

// Config 파일 로드
const loadConfigFile = () => {
  try {
    const configPath = path.resolve(__dirname, '../../src/config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (error) {
    console.error('config.json 로드 중 오류 발생:', error);
  }
  return null;
};

/**
 * GitHub 설정을 업데이트합니다.
 */
async function updateGitHubSettings() {
  try {
    // Config 파일 로드
    const configData = loadConfigFile();
    const domains = configData?.domain || [];
    
    // GitHub 토큰과 엔터프라이즈 URL 가져오기
    const githubToken = process.env.GITHUB_TOKEN || '';
    const githubEnterpriseUrl = process.env.GITHUB_ENTERPRISE_URL || '';
    const githubEnterpriseToken = process.env.GITHUB_ENTERPRISE_TOKEN || '';
    
    // 저장소 리스트 파싱 (보통 공백이나 줄바꿈으로 구분된 목록)
    const reposEnv = process.env.GITHUB_REPOSITORIES || '';
    const repositories = reposEnv
      .split(/[,\s]+/)
      .map(repo => repo.trim())
      .filter(Boolean);
    
    if (!repositories.length && configData?.repositories) {
      // config.json에서 저장소 목록 가져오기
      const configRepos = Array.isArray(configData.repositories) 
        ? configData.repositories.map(repo => 
            typeof repo === 'string' ? repo : repo.fullName || repo.name
          ).filter(Boolean)
        : [];
      repositories.push(...configRepos);
    }
    
    // 기존 설정 확인
    const existingSettings = await sql`
      SELECT data FROM settings 
      WHERE type = 'github' AND user_id = ${DEFAULT_USER_ID}
      LIMIT 1
    `;
    
    // 기존 설정에서 저장소 목록 가져오기
    let existingRepositories = [];
    if (existingSettings.length > 0) {
      try {
        const existingData = existingSettings[0].data;
        if (existingData && existingData.repositories && Array.isArray(existingData.repositories)) {
          existingRepositories = existingData.repositories;
          console.log('기존 저장소 목록:', existingRepositories);
        }
      } catch (error) {
        console.error('기존 저장소 정보 파싱 실패:', error);
      }
    }
    
    // 저장소 목록이 비어있으면 기존 목록 사용
    if (repositories.length === 0 && existingRepositories.length > 0) {
      console.log('환경 변수와 config.json에 저장소 정보가 없어 기존 설정을 유지합니다.');
      repositories.push(...existingRepositories);
    }
    
    // GitHub 설정 객체 생성
    const githubSettings = {
      token: githubToken,
      organization: process.env.GITHUB_ORGANIZATION || '',
      repositories,
      enterpriseUrl: githubEnterpriseUrl,
      enterpriseToken: githubEnterpriseToken,
      enterpriseOrganization: process.env.GITHUB_ENTERPRISE_ORGANIZATION || ''
    };
    
    console.log('GitHub 설정 업데이트 중...');
    console.log('저장소 목록:', repositories);
    
    // 이미 설정이 있는지 확인
    const existingSettingsCheck = await sql`
      SELECT id FROM settings 
      WHERE type = 'github' AND user_id = ${DEFAULT_USER_ID}
      LIMIT 1
    `;
    
    if (existingSettingsCheck.length > 0) {
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
    console.error('GitHub 설정 업데이트 실패:', error);
  }
}

/**
 * Jira 설정을 업데이트합니다.
 */
async function updateJiraSettings() {
  try {
    // Jira 설정 파일 경로
    const jiraConfigPath = path.join(__dirname, '../../config/jira.json');
    let jiraSettings = {
      url: process.env.JIRA_URL || '',
      email: process.env.JIRA_EMAIL || '',
      apiToken: process.env.JIRA_API_TOKEN || '',
      projectKey: process.env.JIRA_PROJECT_KEY || ''
    };
    
    // 설정 파일이 있으면 로드
    try {
      if (fs.existsSync(jiraConfigPath)) {
        const jiraConfig = JSON.parse(fs.readFileSync(jiraConfigPath, 'utf8'));
        // 환경 변수에 값이 없으면 설정 파일에서 가져오기
        jiraSettings = {
          url: process.env.JIRA_URL || jiraConfig.baseUrl || '',
          email: process.env.JIRA_EMAIL || jiraConfig.username || '',
          apiToken: process.env.JIRA_API_TOKEN || jiraConfig.apiToken || '',
          projectKey: process.env.JIRA_PROJECT_KEY || (Array.isArray(jiraConfig.projectKeys) && jiraConfig.projectKeys.length > 0 
            ? jiraConfig.projectKeys[0] 
            : '')
        };
      }
    } catch (error) {
      console.error('Jira 설정 파일 로드 실패:', error);
    }
    
    console.log('Jira 설정 업데이트 중...');
    
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
    console.error('Jira 설정 업데이트 실패:', error);
  }
}

/**
 * 사용자 설정을 업데이트합니다.
 */
async function updateUserSettings() {
  try {
    // Config 파일 로드
    const configData = loadConfigFile();
    
    // 기본 사용자 설정
    const userSettings = {
      notificationsEnabled: true,
      darkModeEnabled: false,
      autoUpdateEnabled: true,
      refreshInterval: parseInt(process.env.REFRESH_INTERVAL || configData?.refreshInterval || '10', 10),
      language: process.env.LANGUAGE || 'ko',
    };
    
    console.log('사용자 설정 업데이트 중...');
    
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
    console.error('사용자 설정 업데이트 실패:', error);
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log('설정 업데이트 시작...');
  
  try {
    // 설정 업데이트
    await updateGitHubSettings();
    await updateJiraSettings();
    await updateUserSettings();
    
    console.log('모든 설정이 성공적으로 업데이트되었습니다.');
  } catch (error) {
    console.error('설정 업데이트 실패:', error);
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