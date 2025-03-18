import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import dotenv from 'dotenv';
import fs from 'fs';
import { SyncManager } from '../services/git/SyncManager';
import { dbAdapter, initializeDatabase, closeDatabase } from '../db';

// ESM 환경에서 __filename 에뮬레이션
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 로드
dotenv.config();

// config.json 로드
const configPath = join(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

/**
 * SyncManager 테스트 실행
 */
async function runSyncManagerTest() {
  console.log('SyncManager 테스트 시작...');
  
  try {
    // 데이터베이스 초기화
    await initializeDatabase();
    console.log('데이터베이스 초기화 성공');
    
    // SyncManager 인스턴스 생성
    const syncManager = new SyncManager();
    
    // 테스트할 저장소 ID 가져오기
    const repositories = await syncManager.getAllRepositories();
    
    if (repositories.length === 0) {
      console.error('저장소 정보가 없습니다. 데이터베이스에 저장소를 추가해주세요.');
      return false;
    }
    
    console.log(`조회된 저장소 목록: ${repositories.map(r => r.fullName).join(', ')}`);
    
    // 첫 번째 저장소 선택
    const testRepo = repositories[0];
    console.log(`테스트할 저장소: ${testRepo.fullName} (ID: ${testRepo.id})`);
    
    // 1. 증분 동기화 테스트
    console.log('\n1. 증분 동기화 테스트:');
    const incrementalResult = await syncManager.syncRepository(testRepo.id, false, true);
    
    console.log('증분 동기화 결과:');
    console.log(`- 성공 여부: ${incrementalResult.success ? '성공' : '실패'}`);
    console.log(`- 메시지: ${incrementalResult.message}`);
    console.log(`- 수집된 커밋 수: ${incrementalResult.commitCount}`);
    console.log(`- 수집된 PR 수: ${incrementalResult.pullRequestCount}`);
    console.log(`- 수집된 리뷰 수: ${incrementalResult.reviewCount}`);
    console.log(`- 수집된 JIRA 이슈 수: ${incrementalResult.jiraIssueCount}`);
    console.log(`- 소요 시간: ${(incrementalResult.endTime.getTime() - incrementalResult.startTime.getTime()) / 1000}초`);
    
    if (incrementalResult.errors.length > 0) {
      console.log('발생한 오류:');
      incrementalResult.errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err}`);
      });
    }
    
    // 2. 전체 동기화 테스트 (선택 사항)
    console.log('\n2. 전체 동기화 테스트:');
    const fullSyncResult = await syncManager.syncRepository(testRepo.id, true, true);
    
    console.log('전체 동기화 결과:');
    console.log(`- 성공 여부: ${fullSyncResult.success ? '성공' : '실패'}`);
    console.log(`- 메시지: ${fullSyncResult.message}`);
    console.log(`- 수집된 커밋 수: ${fullSyncResult.commitCount}`);
    console.log(`- 수집된 PR 수: ${fullSyncResult.pullRequestCount}`);
    console.log(`- 수집된 리뷰 수: ${fullSyncResult.reviewCount}`);
    console.log(`- 수집된 JIRA 이슈 수: ${fullSyncResult.jiraIssueCount}`);
    console.log(`- 소요 시간: ${(fullSyncResult.endTime.getTime() - fullSyncResult.startTime.getTime()) / 1000}초`);
    
    if (fullSyncResult.errors.length > 0) {
      console.log('발생한 오류:');
      fullSyncResult.errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err}`);
      });
    }
    
    console.log('\nSyncManager 테스트 완료');
    return true;
  } catch (error) {
    console.error('SyncManager 테스트 실패:', error);
    return false;
  } finally {
    // 데이터베이스 연결 종료
    await closeDatabase();
    console.log('데이터베이스 연결 종료');
  }
}

// 메인 함수로 실행될 때만 테스트 수행
if (import.meta.url === `file://${process.argv[1]}`) {
  runSyncManagerTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('예기치 않은 오류:', error);
      process.exit(1);
    });
} 