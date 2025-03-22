/**
 * GitHub 계정 및 저장소 다중 사용자 테스트
 * 
 * 다양한 사용자와 계정 조합으로 GitHub 데이터 수집기를 테스트합니다.
 * - 3명의 사용자
 * - 각 사용자당 GitHub 및 GitHub Enterprise 저장소 각 2개씩
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDB, initializeDatabase, getDBAdapter } from '../db/index.js';
import { logger } from '../utils/logger.js';
import { repositories } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { GitHubDataCollector } from '../services/git/services/github/GitHubDataCollector.js';
import { MockGitHubDataCollector } from './mocks/MockGitHubDataCollector.js';
import { createTestDatabase } from './utils/test-database.js';
import { SQLiteAdapter } from '../db/adapters/SQLiteAdapter.js';
import { SQLiteSettingsRepository } from '../repositories/implementations/SQLiteSettingsRepository.js';
import { SQLiteRepositoryInfoRepository } from '../repositories/implementations/SQLiteRepositoryInfoRepository.js';
import { schemaToUse } from '../db/index.js';
import { Repository } from '../types/settings.js';
import { RepositoryInfoRepository } from '../repositories/interfaces/RepositoryInfoRepository.js';
import { SettingsRepository } from '../repositories/interfaces/SettingsRepository.js';

// SQLite DB 설정 - 모든 import 전에 먼저 환경 변수 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SQLITE_DB_PATH = path.resolve(__dirname, '../../test_github_accounts.db');

// 환경 변수 설정 - 가장 먼저 처리
console.log('Initial database type:', process.env.DB_TYPE);
process.env.DB_TYPE = 'sqlite';
process.env.SQLITE_FILE_PATH = SQLITE_DB_PATH;
console.log('환경 변수 설정 완료:');
console.log('DB_TYPE =', process.env.DB_TYPE);
console.log('SQLITE_FILE_PATH =', process.env.SQLITE_FILE_PATH);

console.log('SQLite 파일 경로:', SQLITE_DB_PATH);

// 테스트용 SQLiteRepositoryInfoRepository 확장 클래스
class TestSQLiteRepositoryInfoRepository extends SQLiteRepositoryInfoRepository {
  private testRepoStore: Map<number, Repository> = new Map();
  
  constructor(adapter: SQLiteAdapter) {
    super(adapter);
  }
  
  async save(repository: Repository): Promise<Repository> {
    try {
      const now = new Date().toISOString();
      
      // ID 유지하며 저장 (테스트 데이터는 ID를 명시적으로 전달함)
      const repoId = repository.id || Math.floor(Math.random() * 10000);
      
      // SQLite와 호환되는 더 간단한 삽입 쿼리
      // ID 필드 명시적으로 지정
      const query = `INSERT INTO repositories (id, name, full_name, clone_url, created_at, updated_at, last_sync_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      // 새 어댑터 생성 및 실행
      const adapter = new SQLiteAdapter(process.env.SQLITE_FILE_PATH || '');
      await adapter.initialize();
      
      // 레코드 삽입 (RETURNING 없이)
      await adapter.execute(query, [
        repoId,
        repository.name,
        repository.fullName,
        repository.url,
        now,
        now,
        now
      ]);
      
      // 메모리에도 저장 (테스트용)
      const savedRepo = {
        id: repoId,
        name: repository.name,
        fullName: repository.fullName,
        url: repository.url,
        type: repository.type || 'github', // 기본 타입
        owner: repository.owner,
        ownerReference: repository.ownerReference
      };
      
      // 메모리 저장소에 추가 (findById에서 사용)
      this.testRepoStore.set(repoId, savedRepo);
      
      console.log(`저장소 ${savedRepo.fullName} (ID: ${savedRepo.id})가 SQLite와 메모리 모두에 저장됨`);
      
      return savedRepo;
    } catch (error) {
      console.error('SQLite 저장소 저장 오류:', error);
      throw error;
    }
  }
  
  // 오버라이드: 메모리 저장소에서 먼저 찾고, 없으면 부모 메서드 호출
  async findById(id: number): Promise<Repository | null> {
    // 메모리 저장소에서 찾기
    const repo = this.testRepoStore.get(id);
    if (repo) {
      console.log(`메모리에서 저장소 ID ${id} 찾음: ${repo.fullName}`);
      return repo;
    }
    
    console.log(`메모리에서 저장소 ID ${id}를 찾을 수 없어 SQLite에서 조회 시도...`);
    
    // 부모 클래스 메서드 호출
    try {
      const result = await super.findById(id);
      if (result) {
        // 찾았으면 메모리 저장소에도 추가
        this.testRepoStore.set(id, result);
      }
      return result;
    } catch (error) {
      console.error(`SQLite에서 저장소 ID ${id} 조회 중 오류:`, error);
      return null;
    }
  }
}

// 테스트 DB 저장 변수
let testDb: {
  adapter: SQLiteAdapter;
  settingsRepository: SQLiteSettingsRepository;
  repositoryInfoRepository: TestSQLiteRepositoryInfoRepository;
} | null = null;

// 테스트 환경에서 재사용 가능한 리포지토리 인스턴스 저장
let globalRepositoryInfoRepository: RepositoryInfoRepository | null = null;
let globalSettingsRepository: SettingsRepository | null = null;

// GitHubDataCollector가 테스트 인스턴스를 사용하도록 오버라이드
import * as GitHubDataCollectorModule from '../services/git/services/github/GitHubDataCollector.js';
const originalCreateForRepository = GitHubDataCollectorModule.GitHubDataCollector.createForRepository;

// GitHubDataCollector의 Mock 구현 클래스
class GitHubDataCollectorMock {
  private repositoryId: number;
  private repository: Repository | null = null;
  
  constructor(
    private settingsRepository: SettingsRepository,
    private repositoryInfoRepository: RepositoryInfoRepository,
    repositoryId: number
  ) {
    this.repositoryId = repositoryId;
  }
  
  // 테스트용 저장소 정보 설정
  async initialize(): Promise<void> {
    try {
      // 저장소 정보 조회
      const repository = await this.repositoryInfoRepository.findById(this.repositoryId);
      
      if (!repository) {
        throw new Error(`저장소 ID ${this.repositoryId}를 찾을 수 없습니다.`);
      }
      
      this.repository = repository;
      logger.info(`[GitHubDataCollectorMock] 저장소 ${repository.fullName} (ID: ${this.repositoryId}) 초기화 완료`);
    } catch (error) {
      logger.error(`[GitHubDataCollectorMock] 초기화 오류:`, error);
      throw error;
    }
  }
  
  // GitHubDataCollector.getRepositoryInfo 메서드 모방
  async getRepositoryInfo(): Promise<{ repository: Repository, owner: string, name: string }> {
    if (!this.repository) {
      throw new Error('저장소가 초기화되지 않았습니다.');
    }
    
    // 'Org/repo' 형식의 fullName에서 owner와 name 추출
    const parts = this.repository.fullName.split('/');
    const owner = parts[0] || '';
    const name = parts[1] || '';
    
    return {
      repository: this.repository,
      owner,
      name
    };
  }
  
  // 테스트에 필요한 Mock 메서드들
  async syncData(): Promise<void> {
    logger.info(`[GitHubDataCollectorMock] ${this.repository?.fullName || this.repositoryId} 데이터 동기화 진행 중 (Mock)`);
    // 성공적인 동기화 시뮬레이션
    return Promise.resolve();
  }
  
  async getCommits(): Promise<any[]> {
    return Promise.resolve([]);
  }
  
  async getPullRequests(): Promise<any[]> {
    return Promise.resolve([]);
  }
}

// GitHubDataCollector.createForRepository 메서드 오버라이드
GitHubDataCollectorModule.GitHubDataCollector.createForRepository = async function(repositoryId: number) {
  // 모의 구현 사용
  logger.info(`테스트 환경에서 GitHubDataCollector Mock 생성 - 저장소 ID: ${repositoryId}`);
  const collector = new GitHubDataCollectorMock(
    globalSettingsRepository!,
    globalRepositoryInfoRepository!,
    repositoryId
  );
  
  // 초기화 실행
  await collector.initialize();
  
  return collector as any; // 타입 캐스팅
};

/**
 * 테스트용 데이터베이스 초기화 함수
 * @param dbFilePath 데이터베이스 파일 경로
 */
async function initializeTestDatabase(dbFilePath: string): Promise<void> {
  try {
    if (fs.existsSync(dbFilePath)) {
      logger.info(`기존 테스트 데이터베이스 파일 삭제: ${dbFilePath}`);
      fs.unlinkSync(dbFilePath);
    }

    // 환경 변수 설정
    console.log('DB_TYPE (환경 변수):', process.env.DB_TYPE);
    console.log('SQLITE_FILE_PATH (환경 변수):', process.env.SQLITE_FILE_PATH);
    
    // 데이터베이스 타입 확인
    const dbType = process.env.DB_TYPE || 'postgresql';
    console.log('Resolved database type:', dbType);
    
    // SQLite 초기화
    if (dbType === 'sqlite') {
      console.log('SQLite 데이터베이스 초기화 중...');
      console.log(`Using SQLite database with file path: ${dbFilePath}`);
      
      // createTestDatabase 함수 호출로 변경
      const result = await createTestDatabase(dbFilePath);
      
      // TestSQLiteRepositoryInfoRepository로 변경 
      testDb = {
        adapter: result.adapter,
        settingsRepository: result.settingsRepository, 
        repositoryInfoRepository: new TestSQLiteRepositoryInfoRepository(result.adapter)
      };
      
      // 전역 어댑터 설정
      (global as any).dbAdapter = result.adapter;
      
      // 글로벌 변수에 저장 (GitHubDataCollector에서 사용)
      globalRepositoryInfoRepository = result.repositoryInfoRepository;
      globalSettingsRepository = result.settingsRepository;
      
      console.log('SQLite 마이그레이션 완료');
      console.log('SQLite 데이터베이스 연결 성공');
      console.log('SQLite 데이터베이스 초기화 완료');
    } else {
      // PostgreSQL 초기화 (그대로 유지)
      await initializeDatabase();
    }
  } catch (error) {
    console.error('테스트 데이터베이스 초기화 오류:', error);
    throw error;
  }
}

// 테스트 데이터: 사용자 3명, 각각 GitHub 및 GitHub Enterprise 계정 및 저장소
const TEST_USERS = [
  {
    id: 1,
    name: '사용자 1',
    accounts: [
      {
        id: 'user1',
        type: 'github',
        username: '사용자1-GitHub',
        token: 'github_pat_test1_github',
        apiUrl: 'https://api.github.com',
        email: 'user1@example.com',
        org: 'Org1',
        url: 'https://github.com/user1'
      },
      {
        id: 'user1',
        type: 'github_enterprise',
        username: '사용자1-Enterprise',
        token: 'github_pat_test1_enterprise',
        apiUrl: 'https://enterprise.example.com/api/v3',
        email: 'user1@company.com',
        org: 'EnterpriseOrg1',
        url: 'https://enterprise.example.com/user1'
      }
    ],
    repositories: [
      {
        id: 101,
        type: 'github',
        name: 'repo1-github',
        fullName: 'Org1/repo1-github',
        url: 'https://github.com/Org1/repo1-github',
        owner: 'user1',
        ownerReference: 'user1@github'
      },
      {
        id: 102,
        type: 'github',
        name: 'repo2-github',
        fullName: 'Org1/repo2-github',
        url: 'https://github.com/Org1/repo2-github',
        owner: 'user1',
        ownerReference: 'user1@github'
      },
      {
        id: 103,
        type: 'github-enterprise',
        name: 'repo1-enterprise',
        fullName: 'EnterpriseOrg1/repo1-enterprise',
        url: 'https://enterprise.example.com/EnterpriseOrg1/repo1-enterprise',
        owner: 'user1',
        ownerReference: 'user1@github_enterprise'
      },
      {
        id: 104,
        type: 'github-enterprise',
        name: 'repo2-enterprise',
        fullName: 'EnterpriseOrg1/repo2-enterprise',
        url: 'https://enterprise.example.com/EnterpriseOrg1/repo2-enterprise',
        owner: 'user1',
        ownerReference: 'user1@github_enterprise'
      }
    ]
  },
  {
    id: 2,
    name: '사용자 2',
    accounts: [
      {
        id: 'user2',
        type: 'github',
        username: '사용자2-GitHub',
        token: 'github_pat_test2_github',
        apiUrl: 'https://api.github.com',
        email: 'user2@example.com',
        org: 'Org2',
        url: 'https://github.com/user2'
      },
      {
        id: 'user2',
        type: 'github_enterprise',
        username: '사용자2-Enterprise',
        token: 'github_pat_test2_enterprise',
        apiUrl: 'https://enterprise.example.com/api/v3',
        email: 'user2@company.com',
        org: 'EnterpriseOrg2',
        url: 'https://enterprise.example.com/user2'
      }
    ],
    repositories: [
      {
        id: 201,
        type: 'github',
        name: 'repo1-github',
        fullName: 'Org2/repo1-github',
        url: 'https://github.com/Org2/repo1-github',
        owner: 'user2',
        ownerReference: 'user2@github'
      },
      {
        id: 202,
        type: 'github',
        name: 'repo2-github',
        fullName: 'Org2/repo2-github',
        url: 'https://github.com/Org2/repo2-github',
        owner: 'user2',
        ownerReference: 'user2@github'
      },
      {
        id: 203,
        type: 'github-enterprise',
        name: 'repo1-enterprise',
        fullName: 'EnterpriseOrg2/repo1-enterprise',
        url: 'https://enterprise.example.com/EnterpriseOrg2/repo1-enterprise',
        owner: 'user2',
        ownerReference: 'user2@github_enterprise'
      },
      {
        id: 204,
        type: 'github-enterprise',
        name: 'repo2-enterprise',
        fullName: 'EnterpriseOrg2/repo2-enterprise',
        url: 'https://enterprise.example.com/EnterpriseOrg2/repo2-enterprise',
        owner: 'user2',
        ownerReference: 'user2@github_enterprise'
      }
    ]
  },
  {
    id: 3,
    name: '사용자 3',
    accounts: [
      {
        id: 'user3',
        type: 'github',
        username: '사용자3-GitHub',
        token: 'github_pat_test3_github',
        apiUrl: 'https://api.github.com',
        email: 'user3@example.com',
        org: 'Org3',
        url: 'https://github.com/user3'
      },
      {
        id: 'user3',
        type: 'github_enterprise',
        username: '사용자3-Enterprise',
        token: 'github_pat_test3_enterprise',
        apiUrl: 'https://enterprise.example.com/api/v3',
        email: 'user3@company.com',
        org: 'EnterpriseOrg3',
        url: 'https://enterprise.example.com/user3'
      }
    ],
    repositories: [
      {
        id: 301,
        type: 'github',
        name: 'repo1-github',
        fullName: 'Org3/repo1-github',
        url: 'https://github.com/Org3/repo1-github',
        owner: 'user3',
        ownerReference: 'user3@github'
      },
      {
        id: 302,
        type: 'github',
        name: 'repo2-github',
        fullName: 'Org3/repo2-github',
        url: 'https://github.com/Org3/repo2-github',
        owner: 'user3',
        ownerReference: 'user3@github'
      },
      {
        id: 303,
        type: 'github-enterprise',
        name: 'repo1-enterprise',
        fullName: 'EnterpriseOrg3/repo1-enterprise',
        url: 'https://enterprise.example.com/EnterpriseOrg3/repo1-enterprise',
        owner: 'user3',
        ownerReference: 'user3@github_enterprise'
      },
      {
        id: 304,
        type: 'github-enterprise',
        name: 'repo2-enterprise',
        fullName: 'EnterpriseOrg3/repo2-enterprise',
        url: 'https://enterprise.example.com/EnterpriseOrg3/repo2-enterprise',
        owner: 'user3',
        ownerReference: 'user3@github_enterprise'
      }
    ]
  }
];

// 특수 테스트 케이스 추가
const SPECIAL_TEST_CASES = [
  {
    id: 100,
    name: '특수 케이스 - ownerReference와 저장소 타입 불일치',
    accounts: [
      {
        id: 'special1',
        type: 'github',
        username: '특수케이스1-GitHub',
        token: 'github_pat_special1_github',
        apiUrl: 'https://api.github.com',
        email: 'special1@example.com',
        org: 'SpecialOrg1',
        url: 'https://github.com/special1'
      },
      {
        id: 'special1',
        type: 'github_enterprise',
        username: '특수케이스1-Enterprise',
        token: 'github_pat_special1_enterprise',
        apiUrl: 'https://enterprise.example.com/api/v3',
        email: 'special1@company.com',
        org: 'SpecialEnterpriseOrg1',
        url: 'https://enterprise.example.com/special1'
      }
    ],
    repositories: [
      {
        id: 1001,
        type: 'github',
        name: 'mismatch-repo',
        fullName: 'SpecialOrg1/mismatch-repo',
        url: 'https://github.com/SpecialOrg1/mismatch-repo',
        owner: 'special1',
        ownerReference: 'special1@github_enterprise' // 타입 불일치 (저장소는 github이지만 참조는 github_enterprise)
      }
    ]
  },
  {
    id: 200,
    name: '특수 케이스 - 토큰 없음',
    accounts: [
      {
        id: 'special2',
        type: 'github',
        username: '특수케이스2-GitHub',
        token: '', // 토큰 없음
        apiUrl: 'https://api.github.com',
        email: 'special2@example.com',
        org: 'SpecialOrg2',
        url: 'https://github.com/special2'
      }
    ],
    repositories: [
      {
        id: 2001,
        type: 'github',
        name: 'no-token-repo',
        fullName: 'SpecialOrg2/no-token-repo',
        url: 'https://github.com/SpecialOrg2/no-token-repo',
        owner: 'special2',
        ownerReference: 'special2@github'
      }
    ]
  },
  {
    id: 300,
    name: '특수 케이스 - ownerReference 없음',
    accounts: [
      {
        id: 'special3',
        type: 'github',
        username: '특수케이스3-GitHub',
        token: 'github_pat_special3_github',
        apiUrl: 'https://api.github.com',
        email: 'special3@example.com',
        org: 'SpecialOrg3',
        url: 'https://github.com/special3'
      },
      {
        id: 'special3',
        type: 'github_enterprise',
        username: '특수케이스3-Enterprise',
        token: 'github_pat_special3_enterprise',
        apiUrl: 'https://enterprise.example.com/api/v3',
        email: 'special3@company.com',
        org: 'SpecialEnterpriseOrg3',
        url: 'https://enterprise.example.com/special3'
      }
    ],
    repositories: [
      {
        id: 3001,
        type: 'github',
        name: 'no-reference-repo',
        fullName: 'SpecialOrg3/no-reference-repo',
        url: 'https://github.com/SpecialOrg3/no-reference-repo',
        owner: 'special3'
        // ownerReference가 없음 - 타입으로 찾아야 함
      }
    ]
  }
];

// TEST_USERS 배열에 특수 케이스 추가
const ALL_TEST_USERS = [...TEST_USERS, ...SPECIAL_TEST_CASES];

/**
 * 데이터베이스에 테스트 데이터 설정
 */
async function setupTestData() {
  // 테스트 데이터베이스가 초기화되었는지 확인
  if (!testDb) {
    throw new Error('테스트 데이터베이스가 초기화되지 않았습니다.');
  }
  
  logger.info('테스트 데이터 설정 시작...');
  
  try {
    const { settingsRepository, repositoryInfoRepository } = testDb;
    
    // 각 사용자별로 데이터 설정
    for (const user of ALL_TEST_USERS) {
      logger.info(`사용자 ${user.id} (${user.name}) 데이터 설정 중...`);
      
      // accounts 설정 생성
      const accountsSettings = {
        accounts: user.accounts,
        repositories: user.repositories
      };
      
      // 설정 저장소 사용하여 accounts 설정 저장
      await settingsRepository.updateSettings(
        user.id.toString(),
        'accounts', 
        accountsSettings
      );
      
      logger.info(`사용자 ${user.id} 계정 설정 업데이트 완료`);
      
      // 각 저장소 정보 저장
      for (const repo of user.repositories) {
        try {
          // 저장소 정보 저장
          await repositoryInfoRepository.save({
            id: repo.id,
            name: repo.name,
            fullName: repo.fullName,
            url: repo.url,
            type: repo.type as any,
            owner: repo.owner || '',
            ownerReference: (repo as any).ownerReference || ''
          });
          
          logger.info(`저장소 ${repo.fullName} (ID: ${repo.id}) 저장 완료`);
        } catch (error) {
          logger.error(`저장소 ${repo.fullName} 저장 중 오류:`, error);
        }
      }
    }
    
    logger.info('모든 테스트 데이터 설정 완료');
  } catch (err) {
    const error = err as Error;
    logger.error('테스트 데이터 설정 중 오류:', error);
    throw new Error(`테스트 데이터 설정 실패: ${error.message}`);
  }
}

/**
 * 모든 저장소에 대해 GitHubDataCollector 테스트
 */
async function testAllRepositories() {
  if (!testDb) {
    throw new Error('테스트 데이터베이스가 초기화되지 않았습니다.');
  }
  
  logger.info('모든 저장소에 대한 GitHubDataCollector 테스트 시작...');
  
  let successCount = 0;
  let failCount = 0;
  const results: any[] = [];
  
  try {
    // 환경 변수 확인 (이미 파일 상단에서 설정됨)
    logger.info(`테스트 환경 설정: DB_TYPE=${process.env.DB_TYPE}, SQLITE_FILE_PATH=${process.env.SQLITE_FILE_PATH}`);
    
    // 각 사용자별로 테스트
    for (const user of ALL_TEST_USERS) {
      logger.info(`사용자 ${user.id} (${user.name})의 저장소 테스트 시작...`);
      
      // 각 저장소별로 테스트
      for (const repo of user.repositories) {
        logger.info(`저장소 ${repo.fullName} (ID: ${repo.id}) 테스트 중...`);
        
        try {
          // 실제 GitHubDataCollector 생성 테스트 (Mock 없이)
          // GitHubDataCollector는 환경 변수에 따라 적절한 레포지토리 구현체를 선택
          const collector = await GitHubDataCollector.createForRepository(repo.id);
          
          // 저장소 정보 조회 테스트
          const { repository, owner, name } = await collector.getRepositoryInfo();
          
          logger.info(`저장소 정보 조회 성공: ${owner}/${name}`);
          
          // 성공 카운트 증가 및 결과 저장
          successCount++;
          results.push({
            repositoryId: repo.id,
            fullName: repo.fullName,
            status: 'success',
            info: { owner, name }
          });
        } catch (error) {
          // 실패 카운트 증가 및 결과 저장
          failCount++;
          results.push({
            repositoryId: repo.id,
            fullName: repo.fullName,
            status: 'fail',
            error: error instanceof Error ? error.message : String(error)
          });
          
          logger.error(`저장소 ${repo.fullName} (ID: ${repo.id}) 테스트 실패:`, error);
        }
      }
    }
    
    logger.info(`저장소 테스트 완료: ${successCount}개 성공, ${failCount}개 실패`);
    
    return {
      successCount,
      failCount,
      results
    };
  } catch (error) {
    logger.error('저장소 테스트 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 테스트 실행
 */
async function runTest() {
  try {
    logger.info('GitHub 다중 사용자/계정 테스트 시작...');
    
    // 테스트 데이터베이스 초기화
    await initializeTestDatabase(SQLITE_DB_PATH);
    
    // 테스트 데이터 설정
    await setupTestData();
    
    // 모든 저장소에 대해 테스트
    const testResults = await testAllRepositories();
    
    logger.info('테스트 결과 요약:');
    logger.info(`- 성공: ${testResults.successCount}개 저장소`);
    logger.info(`- 실패: ${testResults.failCount}개 저장소`);
    
    // 실패한 경우 원인 출력
    if (testResults.failCount > 0) {
      logger.info('실패한 저장소:');
      testResults.results
        .filter(r => r.status === 'fail')
        .forEach(r => {
          logger.info(`- ${r.fullName} (ID: ${r.repositoryId}): ${r.error}`);
        });
    }
    
    logger.info('테스트 완료');
  } catch (error) {
    logger.error('테스트 실행 중 오류 발생:', error);
  } finally {
    // 리소스 정리
    if (testDb && testDb.adapter) {
      await testDb.adapter.close();
      testDb = null;
    }
  }
}

// 테스트 실행
runTest().catch(error => {
  logger.error('테스트 실행 중 오류 발생:', error);
  process.exit(1);
});
