import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GitHubAdapter } from '../services/git/adapters/GitHubAdapter';
import { RepositoryInfo } from '../services/git/IGitServiceAdapter';
import path from 'path';
import { eq } from 'drizzle-orm';
import { initializeDatabase, schema, getDB, closeDatabase } from '../db';
import { SettingsService } from '../api/server/settings-service';

// 환경 변수 로드 (폴백용으로만 유지)
dotenv.config();

// ESM 환경에서 __filename 에뮬레이션
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 기본 경로 설정
const REPOS_BASE_PATH = process.env.REPOS_BASE_PATH || path.join(__dirname, '../../repos');

/**
 * GitHub API 어댑터 테스트를 위한 함수
 */
async function testGitHubAdapter() {
  console.log('===== GitHub API 어댑터 테스트 시작 =====');
  console.log(`저장소 기본 경로: ${REPOS_BASE_PATH}`);
  
  try {
    // 데이터베이스 초기화
    console.log('데이터베이스 연결 초기화 중...');
    await initializeDatabase();
    console.log('데이터베이스 연결 성공');
    
    // 데이터베이스에서 저장소 목록 조회
    console.log('저장소 목록 조회 중...');
    const repositories = await getDB().select().from(schema.repositories);
    
    if (!repositories || repositories.length === 0) {
      console.error('데이터베이스에 저장된 저장소가 없습니다.');
      return false;
    }
    
    console.log(`데이터베이스에서 ${repositories.length}개의 저장소를 찾았습니다.`);
    
    // 테스트할 첫 번째 저장소 선택 (n3r/web-ui)
    const n3rRepo = repositories.find((repo: any) => repo.fullName === 'n3r/web-ui');
    
    if (!n3rRepo) {
      console.error('n3r/web-ui 저장소를 찾을 수 없습니다.');
      return false;
    }
    
    const repoData = n3rRepo;
    console.log(`테스트할 저장소: ${repoData.fullName}`);
    
    // settings 서비스를 통해 계정 정보 가져오기
    const settingsService = new SettingsService();
    const accountsSettings = await settingsService.getAccountsSettings();
    console.log('계정 설정 조회 완료');
    
    // 로그에서 저장소의 실제 owner 정보 확인
    console.log(`저장소 owner 정보: ${JSON.stringify(accountsSettings.repositories.find(r => r.fullName === repoData.fullName))}`);
    
    // 저장소의 owner 정보 가져오기 - fullName이 아닌 repositories에 저장된 owner 사용
    const repoConfig = accountsSettings.repositories.find(r => r.fullName === repoData.fullName);
    if (!repoConfig) {
      console.error(`계정 설정에서 저장소 정보(${repoData.fullName})를 찾을 수 없습니다.`);
      return false;
    }
    
    const ownerName = repoConfig.owner; // 저장소의 설정된 owner 사용
    console.log(`사용할 owner: ${ownerName}`);
    
    // 저장소에 연결된 계정 참조 정보 확인
    const ownerReference = repoConfig.ownerReference;
    console.log(`계정 참조 정보: ${ownerReference}`);
    
    // 계정 타입 분리 (예: wodory@github_enterprise -> github_enterprise)
    const accountType = ownerReference?.split('@')[1];
    console.log(`계정 타입: ${accountType}`);
    
    // ownerName과 accountType에 맞는 계정 찾기
    const ownerAccount = accountsSettings.accounts.find(acc => 
      acc.id === ownerName && (accountType ? acc.type === accountType : true)
    );
    
    if (!ownerAccount) {
      console.error(`저장소 소유자(${ownerName})에 해당하는 계정 정보를 찾을 수 없습니다.`);
      return false;
    }
    
    // GitHub 토큰과 API URL 가져오기
    const githubToken = ownerAccount.token;
    const apiUrl = ownerAccount.apiUrl;
    
    console.log(`계정 타입: ${ownerAccount.type}`);
    console.log(`API URL: ${apiUrl || '기본값'}`);
    
    if (!githubToken) {
      console.error('GitHub 토큰이 설정되지 않았습니다. DB의 accounts 설정을 확인해주세요.');
      return false;
    }
    
    // GitHub 토큰 일부 출력 (보안상 전체 출력은 하지 않음)
    console.log(`GitHub 토큰: ${githubToken.substring(0, 10)}... (앞 10자리만 표시)`);
    
    // 테스트용 저장소 정보 생성
    const testRepo: RepositoryInfo = {
      id: repoData.id,
      name: repoData.name,
      fullName: repoData.fullName,
      cloneUrl: repoData.cloneUrl,
      type: repoData.type as 'github' | 'gitlab' | 'github-enterprise' | 'other',
      apiUrl: apiUrl,
      apiToken: githubToken,
      localPath: repoData.localPath || null,
      lastSyncAt: repoData.lastSyncAt
    };
    
    // GitHub 어댑터 생성 (GitHub Enterprise용 URL 적용)
    const githubAdapter = new GitHubAdapter(githubToken, apiUrl);
    
    console.log('\n1. 저장소 클론 또는 업데이트 테스트');
    const localPath = await githubAdapter.cloneOrUpdateRepository(testRepo, REPOS_BASE_PATH);
    console.log(`로컬 경로: ${localPath}`);
    
    console.log('\n2. 최근 커밋 데이터 수집 테스트');
    // 최근 7일간의 커밋만 수집 (기간 단축)
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const commits = await githubAdapter.collectCommits(testRepo, localPath, since);
    console.log(`수집된 커밋 수: ${commits.length}`);
    if (commits.length > 0) {
      console.log('최근 커밋 예시:');
      console.log(commits[0]);
    }
    
    console.log('\n3. PR 데이터 수집 테스트');
    const prs = await githubAdapter.collectPullRequests(testRepo, since);
    console.log(`수집된 PR 수: ${prs.length}`);
    if (prs.length > 0) {
      console.log('최근 PR 예시:');
      console.log(prs[0]);
    }
    
    if (prs.length > 0) {
      console.log('\n4. PR 리뷰 데이터 수집 테스트');
      const prNumber = prs[0].number;
      const reviews = await githubAdapter.collectPullRequestReviews(testRepo, prNumber);
      console.log(`PR #${prNumber}의 리뷰 수: ${reviews.length}`);
      if (reviews.length > 0) {
        console.log('리뷰 예시:');
        console.log(reviews[0]);
      }
    }
    
    console.log('\n5. 사용자 데이터 수집 테스트');
    const users = await githubAdapter.collectUsers(testRepo);
    console.log(`수집된 사용자 수: ${users.length}`);
    if (users.length > 0) {
      console.log('사용자 예시:');
      console.log(users[0]);
    }
    
    console.log('\n===== GitHub API 어댑터 테스트 완료 =====');
    return true;
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    return false;
  } finally {
    // 데이터베이스 연결 종료
    await closeDatabase();
    console.log('데이터베이스 연결 종료');
  }
}

// 테스트 실행
testGitHubAdapter()
  .then((success) => {
    if (success) {
      console.log('모든 테스트가 성공적으로 완료되었습니다.');
    } else {
      console.log('일부 테스트가 실패했습니다.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('테스트 중 치명적인 오류 발생:', error);
    process.exit(1);
  }); 