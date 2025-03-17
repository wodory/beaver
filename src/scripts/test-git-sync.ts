/**
 * Git 서비스 모듈 테스트 스크립트
 * 
 * Mock 어댑터를 사용하여 저장소 동기화 기능을 테스트합니다.
 */
import { SyncManager } from '../services/git/SyncManager';
import { dbAdapter } from '../db';

async function main() {
  try {
    // 1. 데이터베이스 연결
    console.log('데이터베이스 연결 중...');
    await dbAdapter.initialize();
    
    // 2. SyncManager 생성
    const syncManager = new SyncManager();
    
    // 3. 모든 저장소 동기화 실행
    console.log('모든 저장소 동기화 시작...');
    const results = await syncManager.syncAllRepositories();
    
    // 4. 결과 출력
    console.log('============ 동기화 결과 ============');
    for (const result of results) {
      console.log(`저장소: ${result.repositoryName}`);
      console.log(`상태: ${result.success ? '성공' : '실패'}`);
      console.log(`커밋 수: ${result.commitCount}`);
      console.log(`PR 수: ${result.pullRequestCount}`);
      console.log(`리뷰 수: ${result.reviewCount}`);
      console.log(`소요 시간: ${(result.endTime.getTime() - result.startTime.getTime()) / 1000}초`);
      
      if (result.errors.length > 0) {
        console.log('오류:');
        for (const error of result.errors) {
          console.log(`  - ${error}`);
        }
      }
      
      console.log('-----------------------------------');
    }
    
    console.log('테스트 완료!');
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  } finally {
    // 데이터베이스 연결 종료
    if (dbAdapter.close) {
      await dbAdapter.close();
    }
  }
}

// 스크립트 실행
main(); 