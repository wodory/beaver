import { GitHubAdapter } from '../services/git/adapters/GitHubAdapter';
import { GitHubEnterpriseAdapter } from '../services/git/adapters/GitHubEnterpriseAdapter';
import { RepositoryInfo } from '../services/git/IGitServiceAdapter';
import fs from 'fs/promises';
import path from 'path';
import { SettingsService } from '../api/server/settings-service';
import { getDB, initializeDatabase, schemaToUse as schema } from '../db';
import { eq } from 'drizzle-orm';

/**
 * GitHub API 직접 동기화 테스트
 */
async function testGitHubSync() {
  console.log('===== GitHub 데이터 직접 동기화 테스트 시작 =====');
  
  // 데이터베이스 연결 문자열 설정
  process.env.DB_TYPE = 'neon';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Fg3G0Pyrcklp@ep-bold-water-a1ga74m9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  
  // 저장소 기본 경로 설정
  const basePath = './repos';
  console.log(`저장소 기본 경로: ${basePath}`);
  
  // 디렉토리 생성
  try {
    await fs.mkdir(basePath, { recursive: true });
  } catch (error) {
    console.error('디렉토리 생성 실패:', error);
  }
  
  // 데이터베이스 연결
  console.log('데이터베이스 연결 초기화 중...');
  await initializeDatabase();
  console.log('데이터베이스 연결 성공');
  
  // 저장소 목록 가져오기
  console.log('저장소 목록 조회 중...');
  const db = getDB();
  const repositories = await db.select().from(schema.repositories);
  console.log(`데이터베이스에서 ${repositories.length}개의 저장소를 찾았습니다.`);
  
  // 설정 서비스를 통해 계정 정보 가져오기
  const settingsService = new SettingsService();
  const accountsSettings = await settingsService.getAccountsSettings();
  console.log('계정 설정 조회 완료');
  
  // 각 저장소별로 데이터 동기화 시도
  for (const repo of repositories) {
    try {
      console.log(`\n저장소 [${repo.fullName}] 동기화 시작...`);
      
      // 저장소 설정 정보 가져오기
      const repoConfig = accountsSettings.repositories.find(r => r.fullName === repo.fullName);
      if (!repoConfig) {
        console.error(`계정 설정에서 저장소 정보(${repo.fullName})를 찾을 수 없습니다.`);
        continue;
      }
      
      // 소유자 정보 가져오기
      const ownerName = repoConfig.owner;
      console.log(`소유자: ${ownerName}`);
      
      // 계정 참조 정보 확인
      const ownerReference = repoConfig.ownerReference;
      const accountType = ownerReference?.split('@')[1]; // 예: wodory@github_enterprise -> github_enterprise
      
      // 소유자와 계정 타입에 맞는 계정 찾기
      const ownerAccount = accountsSettings.accounts.find(acc => 
        acc.id === ownerName && (accountType ? acc.type === accountType : true)
      );
      
      if (!ownerAccount) {
        console.error(`저장소 소유자(${ownerName})에 해당하는 계정 정보를 찾을 수 없습니다.`);
        continue;
      }
      
      // 저장소 정보 구성
      const repoInfo: RepositoryInfo = {
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        cloneUrl: repo.cloneUrl,
        type: repo.type as 'github' | 'github-enterprise' | 'gitlab' | 'other',
        apiUrl: ownerAccount.apiUrl,
        apiToken: ownerAccount.token,
        localPath: repo.localPath,
        lastSyncAt: repo.lastSyncAt
      };
      
      // GitHub 어댑터 생성
      console.log(`API URL: ${repoInfo.apiUrl}`);
      console.log(`GitHub 토큰: ${repoInfo.apiToken?.substring(0, 10)}... (앞 10자리만 표시)`);
      
      let adapter;
      if (repoInfo.type === 'github-enterprise') {
        const enterpriseUrl = repoInfo.apiUrl?.replace('/api/v3', '') || '';
        console.log(`GitHub Enterprise URL: ${enterpriseUrl}`);
        adapter = new GitHubEnterpriseAdapter(repoInfo.apiUrl || '', repoInfo.apiToken);
      } else {
        adapter = new GitHubAdapter(repoInfo.apiToken);
      }
      
      // 1. 저장소 클론 또는 업데이트
      console.log('\n1. 저장소 클론 또는 업데이트 테스트');
      const localPath = await adapter.cloneOrUpdateRepository(repoInfo, basePath);
      console.log(`로컬 경로: ${localPath}`);
      
      // 2. 커밋 데이터 수집
      console.log('\n2. 최근 커밋 데이터 수집 테스트');
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7일전
      const commits = await adapter.collectCommits(repoInfo, localPath, since);
      console.log(`수집된 커밋 수: ${commits.length}`);
      if (commits.length > 0) {
        console.log('최근 커밋 예시:');
        console.log(commits[0]);
      }
      
      // 3. PR 데이터 수집
      console.log('\n3. PR 데이터 수집 테스트');
      const prs = await adapter.collectPullRequests(repoInfo, since);
      console.log(`수집된 PR 수: ${prs.length}`);
      if (prs.length > 0) {
        console.log('최근 PR 예시:');
        console.log(prs[0]);
        
        // 4. PR 리뷰 데이터 수집
        console.log('\n4. PR 리뷰 데이터 수집 테스트');
        console.log(`GitHub: PR #${prs[0].number}의 리뷰 데이터 수집 중...`);
        const reviews = await adapter.collectPullRequestReviews(repoInfo, prs[0].number);
        console.log(`PR #${prs[0].number}의 리뷰 수: ${reviews.length}`);
      }
      
      // 5. 사용자 데이터 수집
      console.log('\n5. 사용자 데이터 수집 테스트');
      const users = await adapter.collectUsers(repoInfo);
      console.log(`수집된 사용자 수: ${users.length}`);
      if (users.length > 0) {
        console.log('사용자 예시:');
        console.log(users[0]);
      }
      
      // 저장소 정보 업데이트 (마지막 동기화 시간)
      const now = new Date();
      await db.update(schema.repositories)
        .set({ 
          lastSyncAt: now, 
          updatedAt: now 
        })
        .where(eq(schema.repositories.id, repo.id));
      
      console.log(`저장소 [${repo.fullName}] 동기화 완료`);
      
    } catch (error) {
      console.error(`저장소 [${repo.fullName}] 동기화 실패:`, error);
    }
  }
  
  console.log('\n===== GitHub 데이터 직접 동기화 테스트 완료 =====');
  
  // 데이터베이스 연결 닫기
  console.log('데이터베이스 연결 종료');
  
  return true;
}

// 스크립트가 직접 실행될 때만 테스트 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
  testGitHubSync()
    .then(success => {
      if (success) {
        console.log('모든 테스트가 성공적으로 완료되었습니다.');
      } else {
        console.error('일부 테스트가 실패했습니다.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('테스트 중 오류 발생:', error);
      process.exit(1);
    });
}

export { testGitHubSync }; 