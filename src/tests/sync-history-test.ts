import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import dotenv from 'dotenv';
import { SyncManager } from '../services/git/SyncManager.js';
import { getDB, initializeDatabase, closeDatabase } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { schemaToUse as schema } from '../db/index.js';
import { SyncHistory } from '../db/schema/index.js';

// ESM 환경에서 __filename 에뮬레이션
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 로드
dotenv.config();

/**
 * 동기화 이력 테스트 실행
 */
async function runSyncHistoryTest() {
  console.log('동기화 이력 테스트 시작...');
  
  try {
    // 데이터베이스 초기화
    await initializeDatabase();
    console.log('데이터베이스 초기화 성공');
    
    // DB 인스턴스 가져오기
    const db = getDB();
    
    // SyncManager 인스턴스 생성
    const syncManager = new SyncManager();
    
    // 1. 테스트할 저장소 정보 가져오기
    const repositories = await syncManager.getAllRepositories();
    
    if (repositories.length === 0) {
      console.error('저장소 정보가 없습니다. 먼저 저장소를 추가해주세요.');
      return false;
    }
    
    console.log(`조회된 저장소 목록: ${repositories.map(r => r.fullName).join(', ')}`);
    
    // 첫 번째 저장소 선택
    const testRepo = repositories[0];
    console.log(`테스트할 저장소: ${testRepo.fullName} (ID: ${testRepo.id})`);
    
    // 2. 동기화 이력 테이블 테스트
    console.log('\n1. 동기화 이력 테이블 테스트:');
    
    // 2.1 기존 동기화 이력 조회
    const existingHistory = await db.execute(`
      SELECT * FROM sync_history 
      WHERE repository_id = $1 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [testRepo.id]);
    
    console.log(`기존 동기화 이력 수: ${existingHistory.length}개`);
    if (existingHistory.length > 0) {
      console.log('가장 최근 동기화 이력:');
      console.log(existingHistory[0]);
    }
    
    // 3. 단일 저장소 동기화 테스트
    console.log('\n2. 단일 저장소 동기화 테스트:');
    
    // 3.1 동기화 시작
    console.log(`저장소 ${testRepo.fullName} 동기화 시작...`);
    const syncStart = new Date();
    
    // 실제 동기화 수행
    const syncResult = await syncManager.syncRepository(testRepo.id, false);
    
    console.log('동기화 결과:');
    console.log(`- 성공 여부: ${syncResult.success ? '성공' : '실패'}`);
    console.log(`- 메시지: ${syncResult.message}`);
    console.log(`- 수집된 데이터: 커밋 ${syncResult.commitCount}개, PR ${syncResult.pullRequestCount}개, 리뷰 ${syncResult.reviewCount}개`);
    console.log(`- 소요 시간: ${(syncResult.endTime.getTime() - syncResult.startTime.getTime()) / 1000}초`);
    
    // 3.2 동기화 이력 확인
    console.log('\n동기화 후 이력 확인:');
    const newHistory = await db.execute(`
      SELECT * FROM sync_history 
      WHERE repository_id = $1 AND start_time >= $2
      ORDER BY created_at DESC 
      LIMIT 1
    `, [testRepo.id, syncStart]);
    
    if (newHistory.length > 0) {
      console.log('새로 생성된 동기화 이력:');
      const historyRecord = newHistory[0];
      console.log(`- ID: ${historyRecord.id}`);
      console.log(`- 저장소 ID: ${historyRecord.repository_id}`);
      console.log(`- 시작 시간: ${historyRecord.start_time}`);
      console.log(`- 종료 시간: ${historyRecord.end_time}`);
      console.log(`- 상태: ${historyRecord.status}`);
      console.log(`- 수집된 커밋 수: ${historyRecord.commit_count}`);
      console.log(`- 수집된 PR 수: ${historyRecord.pull_request_count}`);
      console.log(`- 수집된 리뷰 수: ${historyRecord.review_count}`);
      console.log(`- 오류: ${historyRecord.error || '없음'}`);
      
      // 3.3 동기화 결과와 이력 비교 검증
      const isResultConsistent = 
        syncResult.commitCount === historyRecord.commit_count &&
        syncResult.pullRequestCount === historyRecord.pull_request_count &&
        syncResult.reviewCount === historyRecord.review_count;
      
      console.log(`동기화 결과와 이력 일치 여부: ${isResultConsistent ? '일치' : '불일치'}`);
      
      if (!isResultConsistent) {
        console.warn('동기화 결과와 이력 정보가 일치하지 않습니다. 상세 정보:');
        console.warn(`- 동기화 결과: 커밋 ${syncResult.commitCount}개, PR ${syncResult.pullRequestCount}개, 리뷰 ${syncResult.reviewCount}개`);
        console.warn(`- 이력 정보: 커밋 ${historyRecord.commit_count}개, PR ${historyRecord.pull_request_count}개, 리뷰 ${historyRecord.review_count}개`);
      }
    } else {
      console.error('동기화 후 이력이 생성되지 않았습니다!');
    }
    
    // 4. 모든 저장소 동기화 테스트
    if (repositories.length > 1) {
      console.log('\n3. 모든 저장소 일괄 동기화 테스트:');
      
      console.log('모든 저장소 동기화 시작...');
      const batchSyncStart = new Date();
      
      // 일괄 동기화 수행
      const allSyncResults = await syncManager.syncAllRepositories();
      
      // 결과 요약
      const successCount = allSyncResults.filter(r => r.success).length;
      const failedCount = allSyncResults.length - successCount;
      const startTime = allSyncResults.length > 0 ? allSyncResults[0].startTime : batchSyncStart;
      const endTime = allSyncResults.length > 0 ? allSyncResults[0].endTime : new Date();
      
      console.log('일괄 동기화 결과:');
      console.log(`- 성공 저장소 수: ${successCount}개`);
      console.log(`- 실패 저장소 수: ${failedCount}개`);
      console.log(`- 총 처리 저장소 수: ${allSyncResults.length}개`);
      console.log(`- 소요 시간: ${(endTime.getTime() - startTime.getTime()) / 1000}초`);
      
      // 4.1 각 저장소별 동기화 이력 확인
      console.log('\n일괄 동기화 후 각 저장소 이력 확인:');
      
      for (const repo of repositories) {
        const repoHistory = await db.execute(`
          SELECT * FROM sync_history 
          WHERE repository_id = $1 AND start_time >= $2
          ORDER BY created_at DESC 
          LIMIT 1
        `, [repo.id, batchSyncStart]);
        
        if (repoHistory.length > 0) {
          console.log(`\n저장소 ${repo.fullName} 동기화 이력:`);
          console.log(`- 상태: ${repoHistory[0].status}`);
          console.log(`- 수집된 데이터: 커밋 ${repoHistory[0].commit_count || 0}개, PR ${repoHistory[0].pull_request_count || 0}개, 리뷰 ${repoHistory[0].review_count || 0}개`);
        } else {
          console.log(`저장소 ${repo.fullName}의 동기화 이력이 없습니다.`);
        }
      }
    } else {
      console.log('\n3. 모든 저장소 일괄 동기화 테스트: 저장소가 한 개뿐이므로 건너뜁니다.');
    }
    
    console.log('\n동기화 이력 테스트 완료');
    return true;
  } catch (error) {
    console.error('동기화 이력 테스트 실패:', error);
    return false;
  } finally {
    // 데이터베이스 연결 종료
    await closeDatabase();
    console.log('데이터베이스 연결 종료');
  }
}

// 메인 함수로 실행될 때만 테스트 수행
if (import.meta.url === `file://${process.argv[1]}`) {
  runSyncHistoryTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('예기치 않은 오류:', error);
      process.exit(1);
    });
} 