import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { GitHubDataCollector } from '../services/git/services/github/GitHubDataCollector'
import { createTestDatabase } from '../tests/utils/test-database.js'
import { Repository } from '../types/settings.js'

// 테스트 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SQLITE_TEST_DB_PATH = path.resolve(__dirname, '../../test_db_selection.db');

describe('GitHubDataCollector DB 선택 테스트', () => {
  // 테스트 DB 객체
  let testDb: any = null;
  
  // 테스트 리포지토리 객체
  const testRepository: Repository = {
    id: 99999,
    name: 'test-repo',
    fullName: 'test-org/test-repo',
    url: 'https://github.com/test-org/test-repo',
    owner: 'test-user',
    ownerReference: 'test-user@github',
    type: 'github'
  };
  
  // 테스트 계정 설정
  const testAccountsSettings = {
    accounts: [
      {
        id: 'test-user',
        type: 'github',
        username: 'TestUser',
        token: 'test-token',
        apiUrl: 'https://api.github.com',
        email: 'test@example.com',
        org: 'TestOrg',
        url: 'https://github.com/TestUser'
      }
    ],
    repositories: [
      {
        id: 99999,
        type: 'github',
        name: 'test-repo',
        fullName: 'test-org/test-repo',
        url: 'https://github.com/test-org/test-repo',
        owner: 'test-user',
        ownerReference: 'test-user@github'
      }
    ]
  };
  
  // 각 테스트 전 실행
  beforeEach(async () => {
    // 기존 테스트 DB 파일 삭제
    if (fs.existsSync(SQLITE_TEST_DB_PATH)) {
      fs.unlinkSync(SQLITE_TEST_DB_PATH);
    }
    
    // 테스트 DB 생성
    testDb = await createTestDatabase(SQLITE_TEST_DB_PATH);
    
    // 테스트 데이터 설정
    await testDb.settingsRepository.saveSettings('1', 'accounts', testAccountsSettings);
    await testDb.repositoryInfoRepository.save(testRepository);
  });
  
  // 각 테스트 후 실행
  afterEach(async () => {
    // DB 연결 종료
    if (testDb && testDb.adapter) {
      await testDb.adapter.close();
    }
    
    // 테스트 DB 파일 삭제
    if (fs.existsSync(SQLITE_TEST_DB_PATH)) {
      fs.unlinkSync(SQLITE_TEST_DB_PATH);
    }
  });
  
  test('SQLite 환경에서 SQLite 레포지토리를 사용해야 함', async () => {
    // 환경 변수 설정
    const originalDbType = process.env.DB_TYPE;
    const originalSqlitePath = process.env.SQLITE_FILE_PATH;
    
    process.env.DB_TYPE = 'sqlite';
    process.env.SQLITE_FILE_PATH = SQLITE_TEST_DB_PATH;
    
    try {
      // GitHubDataCollector 생성
      const collector = await GitHubDataCollector.createForRepository(99999);
      
      // 저장소 정보 조회 테스트
      const repoInfo = await collector.getRepositoryInfo();
      
      // 검증
      expect(repoInfo).toBeDefined();
      expect(repoInfo.repository.id).toBe(99999);
      expect(repoInfo.repository.fullName).toBe('test-org/test-repo');
    } finally {
      // 환경 변수 복원
      process.env.DB_TYPE = originalDbType;
      process.env.SQLITE_FILE_PATH = originalSqlitePath;
    }
  });
  
  // PostgreSQL 테스트는 여기서 생략 (실제 DB 연결 필요)
}); 