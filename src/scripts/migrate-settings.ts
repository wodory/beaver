/**
 * 설정 마이그레이션 스크립트
 * 
 * .env 파일과 설정 파일의 값을 NeonDB의 settings 테이블로 마이그레이션합니다.
 */
import { initializeDatabase, closeDatabase, getDB, DB_TYPE } from '../db/index.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env 파일 로드
config();

// 기본 사용자 ID
const DEFAULT_USER_ID = 1;

/**
 * GitHub 설정을 마이그레이션합니다.
 */
async function migrateGitHubSettings() {
  const db = getDB();
  
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
  
  try {
    // 이미 설정이 있는지 확인
    const existingSettings = await db.execute(`
      SELECT id FROM settings 
      WHERE type = $1 AND user_id = $2 
      LIMIT 1
    `, ['github', DEFAULT_USER_ID]);
    
    if (existingSettings && existingSettings.length > 0) {
      // 업데이트
      await db.execute(`
        UPDATE settings 
        SET data = $1, updated_at = NOW() 
        WHERE type = $2 AND user_id = $3
      `, [githubSettings, 'github', DEFAULT_USER_ID]);
      
      console.log('GitHub 설정이 업데이트되었습니다.');
    } else {
      // 삽입
      await db.execute(`
        INSERT INTO settings (type, user_id, data, created_at, updated_at) 
        VALUES ($1, $2, $3, NOW(), NOW())
      `, ['github', DEFAULT_USER_ID, githubSettings]);
      
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
  const db = getDB();
  
  // Jira 설정 파일 경로
  const jiraConfigPath = path.resolve(__dirname, '../../config/jira.json');
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
  
  try {
    // 이미 설정이 있는지 확인
    const existingSettings = await db.execute(`
      SELECT id FROM settings 
      WHERE type = $1 AND user_id = $2 
      LIMIT 1
    `, ['jira', DEFAULT_USER_ID]);
    
    if (existingSettings && existingSettings.length > 0) {
      // 업데이트
      await db.execute(`
        UPDATE settings 
        SET data = $1, updated_at = NOW() 
        WHERE type = $2 AND user_id = $3
      `, [jiraSettings, 'jira', DEFAULT_USER_ID]);
      
      console.log('Jira 설정이 업데이트되었습니다.');
    } else {
      // 삽입
      await db.execute(`
        INSERT INTO settings (type, user_id, data, created_at, updated_at) 
        VALUES ($1, $2, $3, NOW(), NOW())
      `, ['jira', DEFAULT_USER_ID, jiraSettings]);
      
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
  const db = getDB();
  
  // 기본 사용자 설정
  const userSettings = {
    notificationsEnabled: true,
    darkModeEnabled: false,
    autoUpdateEnabled: true,
    refreshInterval: parseInt(process.env.REFRESH_INTERVAL || '10', 10),
    language: process.env.LANGUAGE || 'ko',
  };
  
  try {
    // 이미 설정이 있는지 확인
    const existingSettings = await db.execute(`
      SELECT id FROM settings 
      WHERE type = $1 AND user_id = $2 
      LIMIT 1
    `, ['user', DEFAULT_USER_ID]);
    
    if (existingSettings && existingSettings.length > 0) {
      // 업데이트
      await db.execute(`
        UPDATE settings 
        SET data = $1, updated_at = NOW() 
        WHERE type = $2 AND user_id = $3
      `, [userSettings, 'user', DEFAULT_USER_ID]);
      
      console.log('사용자 설정이 업데이트되었습니다.');
    } else {
      // 삽입
      await db.execute(`
        INSERT INTO settings (type, user_id, data, created_at, updated_at) 
        VALUES ($1, $2, $3, NOW(), NOW())
      `, ['user', DEFAULT_USER_ID, userSettings]);
      
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
  console.log('설정 마이그레이션 시작...');
  
  if (DB_TYPE !== 'postgresql') {
    console.error('이 스크립트는 PostgreSQL DB_TYPE에서만 실행 가능합니다.');
    process.exit(1);
  }
  
  try {
    // 데이터베이스 초기화
    await initializeDatabase();
    
    // 설정 마이그레이션
    await migrateGitHubSettings();
    await migrateJiraSettings();
    await migrateUserSettings();
    
    console.log('설정 마이그레이션 완료');
  } catch (error) {
    console.error('설정 마이그레이션 실패:', error);
  } finally {
    // 데이터베이스 연결 종료
    await closeDatabase();
  }
}

// 스크립트 실행
main().catch(error => {
  console.error('실행 오류:', error);
  process.exit(1);
}); 