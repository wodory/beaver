import { parentPort, workerData } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM에서 __dirname 획득
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 워커 데이터 받기
const { task } = workerData;

// 작업 처리 함수 맵
const taskHandlers = {
  // 저장소 동기화 작업 처리
  'syncRepository': async (data) => {
    const { SyncManager } = await import('../services/git/SyncManager.js');
    const syncManager = new SyncManager();
    const result = await syncManager.syncRepository(data.repoId, data.forceFull, data.syncJira);
    return result;
  },
  
  // 메트릭 계산 작업 처리
  'calculateRepositoryMetrics': async (data) => {
    const { MetricsService } = await import('../services/metrics/MetricsService.js');
    const metricsService = new MetricsService();
    return await metricsService.getRepositoryMetrics(
      data.repoId,
      new Date(data.startDate),
      new Date(data.endDate)
    );
  },
  
  // 사용자 메트릭 계산 작업 처리
  'calculateUserMetrics': async (data) => {
    const { MetricsService } = await import('../services/metrics/MetricsService.js');
    const metricsService = new MetricsService();
    return await metricsService.getUserMetrics(
      data.userId,
      new Date(data.startDate),
      new Date(data.endDate)
    );
  },
  
  // 팀 메트릭 계산 작업 처리
  'calculateTeamMetrics': async (data) => {
    const { MetricsService } = await import('../services/metrics/MetricsService.js');
    const metricsService = new MetricsService();
    return await metricsService.getTeamMetrics(
      data.teamId,
      data.teamName,
      data.repoIds,
      new Date(data.startDate),
      new Date(data.endDate)
    );
  },
  
  // JIRA 이슈 수집 작업 처리
  'collectJiraIssues': async (data) => {
    const { JiraDataCollector } = await import('../services/jira/JiraDataCollector.js');
    const jiraDataCollector = new JiraDataCollector();
    await jiraDataCollector.initialize();
    return await jiraDataCollector.getIssuesByJql(
      data.jql,
      data.maxResults,
      data.startAt
    );
  },
  
  // 기본 작업 처리 (테스트용)
  'default': async (data) => {
    // 간단한 계산 수행 (예시)
    await new Promise(resolve => setTimeout(resolve, 500)); // 작업 시뮬레이션
    return { message: '기본 작업 처리 완료', data };
  }
};

/**
 * 작업 처리 메인 함수
 */
async function processTask() {
  try {
    console.log(`워커 시작: 작업 ID ${task.id}, 유형 ${task.type}`);
    
    // 작업 유형에 맞는 핸들러 찾기
    const handler = taskHandlers[task.type] || taskHandlers.default;
    
    // 작업 처리
    const result = await handler(task.data);
    
    // 결과를 부모 스레드로 전송
    parentPort?.postMessage(result);
  } catch (error) {
    console.error(`워커 오류: 작업 ID ${task.id}, 유형 ${task.type}`, error);
    // 오류 발생 시 부모 스레드에 오류 전달
    throw error;
  }
}

// 작업 처리 시작
processTask()
  .catch(error => {
    // 예기치 않은 오류 처리
    console.error('작업 처리 중 치명적 오류:', error);
    // 워커 종료 (오류 코드 사용)
    process.exit(1);
  }); 