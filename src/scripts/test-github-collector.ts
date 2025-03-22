import { SyncManager } from '../services/git/SyncManager';
import { GitHubDataCollector } from '../services/git/services/github/GitHubDataCollector.js';
import { getDB } from '../db';
import { logger } from '../utils/logger.js';

/**
 * GitHub GraphQL Collector 테스트 함수
 * 
 * 특정 저장소의 커밋 데이터를 GraphQL API로 수집합니다.
 * 
 * @param repositoryId 저장소 ID
 */
async function testGraphQLCollector(repositoryId: number): Promise<void> {
  try {
    // DB 초기화 확인
    if (!getDB()) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }

    logger.info(`저장소 ID ${repositoryId} 테스트 시작`);
    
    // 저장소 정보 확인
    const syncManager = new SyncManager();
    const repository = await syncManager.getRepository(repositoryId);
    if (!repository) {
      throw new Error(`저장소 ID ${repositoryId}를 찾을 수 없습니다.`);
    }
    
    logger.info(`저장소 정보: ${repository.fullName}`);
    
    // GraphQL 컬렉터 초기화 - 새로운 팩토리 메서드 사용
    logger.info(`저장소 ID ${repositoryId}에 대한 GitHubDataCollector 생성 중...`);
    const collector = await GitHubDataCollector.createForRepository(repositoryId);
    
    // 커밋 수집 테스트
    logger.info(`커밋 데이터 수집 시작`);
    const commitCount = await collector.collectCommits();
    logger.info(`커밋 데이터 수집 완료: ${commitCount}개의 새 커밋 수집됨`);
    
    // 마지막 동기화 시간 업데이트
    await collector.updateLastSyncAt();
    logger.info(`마지막 동기화 시간 업데이트 완료`);
    
    logger.info(`테스트 완료`);
  } catch (error) {
    logger.error(`테스트 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * SyncManager 테스트 함수
 * 
 * SyncManager를 사용하여 저장소를 동기화합니다.
 * 
 * @param repositoryId 저장소 ID
 * @param forceFull 전체 동기화 여부
 */
async function testSyncManager(repositoryId: number, forceFull: boolean = false): Promise<void> {
  try {
    logger.info(`SyncManager 테스트 시작: 저장소 ID ${repositoryId}, 전체 동기화: ${forceFull}`);
    
    const syncManager = new SyncManager();
    const result = await syncManager.syncRepository(repositoryId, forceFull);
    
    logger.info('동기화 결과:');
    logger.info(`- 저장소: ${result.repositoryName}`);
    logger.info(`- 성공 여부: ${result.success}`);
    logger.info(`- 메시지: ${result.message}`);
    logger.info(`- 수집된 커밋 수: ${result.commitCount}`);
    logger.info(`- 수집된 PR 수: ${result.pullRequestCount}`);
    logger.info(`- 수집된 리뷰 수: ${result.reviewCount}`);
    logger.info(`- 시작 시간: ${result.startTime.toISOString()}`);
    logger.info(`- 종료 시간: ${result.endTime.toISOString()}`);
    logger.info(`- 소요 시간: ${(result.endTime.getTime() - result.startTime.getTime()) / 1000}초`);
    
    if (result.errors.length > 0) {
      logger.error('오류 목록:');
      result.errors.forEach((error, index) => {
        logger.error(`${index + 1}. ${error}`);
      });
    }
    
    logger.info('테스트 완료');
  } catch (error) {
    logger.error(`테스트 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// 테스트 실행
(async () => {
  const repositoryId = parseInt(process.argv[2], 10) || 1; // 기본값은 저장소 ID 1
  const testMode = process.argv[3] || 'collector'; // 'collector' 또는 'sync'
  const forceFull = process.argv[4] === 'full'; // 'full'이면 전체 동기화
  
  if (testMode === 'collector') {
    await testGraphQLCollector(repositoryId);
  } else if (testMode === 'sync') {
    await testSyncManager(repositoryId, forceFull);
  } else {
    logger.error(`잘못된 테스트 모드: ${testMode}. 'collector' 또는 'sync'를 사용하세요.`);
  }
})(); 