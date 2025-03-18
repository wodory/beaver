import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// ESM 환경에서 __dirname, __filename 에뮬레이션
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 모듈 import
import { JiraDataCollector } from '../services/jira/JiraDataCollector.js';
import { JiraSearchOptions } from '../services/jira/IJiraAdapter.js';
import { SyncManager } from '../services/git/SyncManager.js';
import { logger } from '../utils/logger.js';
import { dbAdapter } from '../db/index.js';

/**
 * JIRA 모듈 테스트
 */
async function testJiraIntegration() {
  try {
    // 1. 데이터베이스 초기화
    logger.info('데이터베이스 초기화 중...');
    await dbAdapter.initialize();
    logger.info('데이터베이스 초기화 완료');
    
    // 2. JIRA 데이터 수집기 테스트
    logger.info('----- JIRA 데이터 수집기 테스트 -----');
    await testJiraDataCollector();
    
    // 3. SyncManager 연동 테스트
    logger.info('----- SyncManager 연동 테스트 -----');
    await testSyncManagerIntegration();
    
    logger.info('모든 테스트가 성공적으로 완료되었습니다.');
  } catch (error) {
    logger.error(`테스트 실패: ${error}`);
  } finally {
    // 데이터베이스 연결 종료
    await dbAdapter.close();
  }
}

/**
 * JIRA 데이터 수집기 테스트
 */
async function testJiraDataCollector() {
  try {
    // Mock 어댑터를 사용하여 JIRA 데이터 수집기 생성
    const jiraCollector = new JiraDataCollector(true);
    
    // 데이터 수집기 초기화
    await jiraCollector.initialize();
    logger.info('JIRA 데이터 수집기 초기화 완료');
    
    // 프로젝트 조회
    const projects = await jiraCollector.getProjects();
    logger.info(`프로젝트 ${projects.length}개 조회 성공`);
    logger.info(`프로젝트 목록: ${projects.map(p => p.key).join(', ')}`);
    
    // 최근 30일 이내 완료된 이슈 조회
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const searchOptions = {
      startDate: thirtyDaysAgo,
      endDate: new Date()
    };
    
    // 완료된 이슈 조회
    const completedIssues = await jiraCollector.getCompletedIssues(searchOptions);
    logger.info(`완료된 이슈 ${completedIssues.length}개 조회 성공`);
    
    // 생성된 이슈 조회
    const createdIssues = await jiraCollector.getCreatedIssues(searchOptions);
    logger.info(`생성된 이슈 ${createdIssues.length}개 조회 성공`);
    
    // 이슈 통계 계산
    const stats = await jiraCollector.calculateIssueStats(searchOptions);
    logger.info(`이슈 통계: 총 ${stats.totalIssues}개, 완료 ${stats.completedIssues}개`);
    logger.info(`평균 해결 시간: ${stats.averageResolutionTimeInDays}일`);
    
    // 모든 이슈 타입 출력
    const issueTypes = Object.keys(stats.issuesByType);
    logger.info(`이슈 타입: ${issueTypes.join(', ')}`);
    
    // 첫 번째 이슈 상세 정보 출력
    if (completedIssues.length > 0) {
      printIssueDetails(completedIssues[0]);
    }
    
    return true;
  } catch (error) {
    logger.error(`JIRA 데이터 수집기 테스트 실패: ${error}`);
    throw error;
  }
}

/**
 * SyncManager와 JIRA 통합 테스트
 */
async function testSyncManagerIntegration() {
  try {
    // Mock 데이터를 사용하는 SyncManager 생성
    const syncManager = new SyncManager(true);
    
    // 저장소 목록 조회
    const repositories = await syncManager.getAllRepositories();
    
    if (repositories.length === 0) {
      logger.warn('테스트할 저장소가 없습니다. 테스트를 건너뜁니다.');
      return;
    }
    
    // 첫 번째 저장소만 테스트 진행
    const testRepo = repositories[0];
    logger.info(`저장소 '${testRepo.fullName}' 동기화 테스트 시작`);
    
    // syncJira를 true로 설정하여 저장소 동기화 진행
    const result = await syncManager.syncRepository(testRepo.id, false, true);
    
    // 결과 출력
    logger.info(`동기화 결과: ${result.success ? '성공' : '실패'}`);
    logger.info(`커밋 수: ${result.commitCount}`);
    logger.info(`PR 수: ${result.pullRequestCount}`);
    logger.info(`리뷰 수: ${result.reviewCount}`);
    logger.info(`JIRA 이슈 수: ${result.jiraIssueCount}`);
    
    if (result.errors.length > 0) {
      logger.warn(`발생한 오류: ${result.errors.join('\n')}`);
    }
    
    return result.success;
  } catch (error) {
    logger.error(`SyncManager 통합 테스트 실패: ${error}`);
    throw error;
  }
}

/**
 * JIRA 이슈 상세 정보 출력
 */
function printIssueDetails(issue: JiraSearchOptions) {
  logger.info('\n------------------------------');
  logger.info(`이슈 키: ${issue.key}`);
  logger.info(`제목: ${issue.summary}`);
  logger.info(`상태: ${issue.status}`);
  logger.info(`유형: ${issue.issueType}`);
  logger.info(`담당자: ${issue.assignee?.displayName || '없음'}`);
  logger.info(`보고자: ${issue.reporter?.displayName || '없음'}`);
  logger.info(`생성일: ${issue.created}`);
  logger.info(`수정일: ${issue.updated}`);
  logger.info(`해결일: ${issue.resolutionDate || '미해결'}`);
  logger.info('------------------------------\n');
}

// 테스트 실행
// ESM에서는 require.main === module 대신 import.meta.url 사용
if (import.meta.url === `file://${process.argv[1]}`) {
  testJiraIntegration()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error(`테스트 실패: ${error}`);
      process.exit(1);
    });
} 