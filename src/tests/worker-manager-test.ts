import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import dotenv from 'dotenv';
import { WorkerManager, Task } from '../services/worker/WorkerManager';
import { dbAdapter, initializeDatabase, closeDatabase } from '../db';
import fs from 'fs';

// ESM 환경에서 __filename 에뮬레이션
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 로드
dotenv.config();

// config.json 로드
const configPath = join(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

/**
 * 워커 관리자 테스트 실행
 */
async function runWorkerManagerTest() {
  console.log('워커 관리자 테스트 시작...');
  
  try {
    // 데이터베이스 초기화
    await initializeDatabase();
    console.log('데이터베이스 초기화 성공');
    
    // 워커 관리자 생성
    const workerManager = new WorkerManager({
      maxWorkers: 4,
      maxRetries: 2,
      retryDelay: 1000,
      workerTimeout: 60000 // 60초 타임아웃
    });
    
    console.log('워커 관리자 생성됨');
    
    try {
      // 1. 간단한 테스트 작업
      console.log('\n1. 간단한 테스트 작업:');
      
      const testTasks: Task[] = [
        { id: 'test1', type: 'default', data: { testValue: 100 }, priority: 1 },
        { id: 'test2', type: 'default', data: { testValue: 200 }, priority: 2 },
        { id: 'test3', type: 'default', data: { testValue: 300 }, priority: 1 }
      ];
      
      console.log(`${testTasks.length}개의 테스트 작업 추가`);
      workerManager.addTasks(testTasks);
      
      console.log('작업 처리 시작...');
      const testResults = await workerManager.processAllTasks();
      
      console.log('테스트 작업 결과:');
      for (const result of testResults) {
        console.log(`- 작업 ${result.taskId}: ${result.success ? '성공' : '실패'}`);
        if (result.result) {
          console.log(`  결과: ${JSON.stringify(result.result)}`);
        }
      }
    } catch (error) {
      console.error('테스트 작업 실행 실패:', error);
    }
    
    // 저장소 정보 가져오기 (있는 경우에만 테스트)
    const repositories = config.repositories || [];
    
    if (repositories.length > 0) {
      try {
        // 2. 저장소 동기화 작업
        console.log('\n2. 저장소 동기화 작업:');
        
        // 테스트할 저장소 선택 (첫 번째 저장소)
        const testRepo = repositories[0];
        console.log(`테스트할 저장소: ${testRepo.fullName} (ID: ${testRepo.id})`);
        
        // 동기화 작업 설정
        const syncTask: Task = {
          id: `sync-${testRepo.id}`,
          type: 'syncRepository',
          data: {
            repoId: testRepo.id,
            forceFull: false,
            syncJira: true
          },
          priority: 10 // 높은 우선순위
        };
        
        console.log('저장소 동기화 작업 추가');
        
        // 작업 처리
        console.log('작업 처리 시작...');
        const syncResult = await workerManager.processTask(syncTask);
        
        console.log('저장소 동기화 결과:');
        console.log(`- 성공 여부: ${syncResult.success ? '성공' : '실패'}`);
        if (syncResult.success && syncResult.result) {
          console.log(`- 커밋 수집: ${syncResult.result.commitCount}개`);
          console.log(`- PR 수집: ${syncResult.result.pullRequestCount}개`);
          console.log(`- 리뷰 수집: ${syncResult.result.reviewCount}개`);
        } else if (syncResult.error) {
          console.error(`- 오류: ${syncResult.error}`);
        }
      } catch (error) {
        console.error('저장소 동기화 작업 실행 실패:', error);
      }
      
      try {
        // 3. 여러 저장소의 메트릭 계산
        console.log('\n3. 여러 저장소의 메트릭 계산:');
        
        // 기간 설정 (최근 30일)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        
        // 여러 저장소에 대한 메트릭 계산 작업 설정
        const metricsTasks: Task[] = repositories.slice(0, Math.min(3, repositories.length)).map(repo => ({
          id: `metrics-${repo.id}`,
          type: 'calculateRepositoryMetrics',
          data: {
            repoId: repo.id,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }));
        
        console.log(`${metricsTasks.length}개 저장소에 대한 메트릭 계산 작업 추가`);
        
        // 작업 처리
        console.log('작업 처리 시작...');
        const metricsResults = await workerManager.processAllTasks(metricsTasks);
        
        console.log('메트릭 계산 결과:');
        for (const result of metricsResults) {
          console.log(`- 저장소 ID ${result.taskId.replace('metrics-', '')}: ${result.success ? '성공' : '실패'}`);
          if (result.success && result.result) {
            console.log(`  - 커밋 수: ${result.result.commitCount}`);
            console.log(`  - PR 수: ${result.result.prCount}`);
          } else if (result.error) {
            console.error(`  - 오류: ${result.error}`);
          }
        }
      } catch (error) {
        console.error('메트릭 계산 작업 실행 실패:', error);
      }
    } else {
      console.log('테스트할 저장소가 없습니다. 저장소 관련 작업 테스트를 건너뜁니다.');
    }
    
    // 리소스 정리
    await workerManager.cleanup();
    console.log('\n워커 관리자 테스트 완료');
    return true;
  } catch (error) {
    console.error('워커 관리자 테스트 실패:', error);
    return false;
  } finally {
    // 데이터베이스 연결 종료
    await closeDatabase();
    console.log('데이터베이스 연결 종료');
  }
}

// 메인 함수로 실행될 때만 테스트 수행
if (import.meta.url === `file://${process.argv[1]}`) {
  runWorkerManagerTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('예기치 않은 오류:', error);
      process.exit(1);
    });
} 