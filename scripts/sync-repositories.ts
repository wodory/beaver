import { SyncManager } from '../src/services/git/SyncManager.js';
import { initializeDatabase } from '../src/db/index.js';
import { SettingsService } from '../src/api/server/settings-service.js';

// 결과 타입 정의
interface SyncResult {
  repositoryName: string;
  success: boolean;
  commitCount: number;
  pullRequestCount: number;
  reviewCount: number;
  jiraIssueCount: number;
  startTime: Date;
  endTime: Date;
  errors: string[];
}

/**
 * 저장소 동기화 스크립트
 * 
 * 모든 저장소의 데이터를 수집하고 DB에 저장합니다.
 */
async function main() {
  try {
    console.log('데이터베이스 초기화 중...');
    await initializeDatabase();
    
    console.log('저장소 동기화 관리자 초기화 중...');
    const syncManager = new SyncManager();
    
    // 설정 서비스를 통해 저장소 목록 가져오기
    const settingsService = new SettingsService();
    const accounts = await settingsService.getAccounts();
    
    console.log(`GitHub 계정 ${accounts.length}개를 발견했습니다.`);
    
    for (const account of accounts) {
      console.log(`계정 [${account.username}]의 저장소를 동기화합니다...`);
      
      // 저장소 목록 가져오기
      const repositories = await syncManager.getAllRepositories();
      console.log(`총 ${repositories.length}개의 저장소를 찾았습니다.`);
      
      // 모든 저장소 동기화
      console.log('모든 저장소 데이터를 동기화합니다. 이 작업은 몇 분 정도 소요될 수 있습니다...');
      const results: SyncResult[] = await syncManager.syncAllRepositories(true, true);
      
      // 결과 출력
      console.log('==== 동기화 결과 요약 ====');
      for (const result of results) {
        console.log(`저장소: ${result.repositoryName}`);
        console.log(`성공: ${result.success ? '✅' : '❌'}`);
        console.log(`커밋 수: ${result.commitCount}`);
        console.log(`PR 수: ${result.pullRequestCount}`);
        console.log(`리뷰 수: ${result.reviewCount}`);
        console.log(`JIRA 이슈 수: ${result.jiraIssueCount}`);
        console.log(`소요 시간: ${(result.endTime.getTime() - result.startTime.getTime()) / 1000}초`);
        
        if (result.errors.length > 0) {
          console.log('오류:');
          result.errors.forEach(err => console.log(`  - ${err}`));
        }
        console.log('------------------------');
      }
    }
    
    console.log('모든 저장소 동기화가 완료되었습니다.');
    process.exit(0);
  } catch (error) {
    console.error('저장소 동기화 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main().catch(err => {
  console.error('치명적 오류 발생:', err);
  process.exit(1);
}); 