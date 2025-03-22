import { RepositoryInfo } from '../IGitServiceAdapter';
import { SyncExecutor } from './SyncExecutor.js';
import { SyncProgressTracker } from '../trackers/SyncProgressTracker.js';
import { SyncResult, SyncResultProcessor } from '../processors/SyncResultProcessor.js';
import { logger } from '../../../utils/logger.js';

/**
 * 순차적 동기화 실행기
 * 
 * 저장소를 순차적으로 하나씩 동기화합니다.
 */
export class SequentialSyncExecutor implements SyncExecutor {
  private progressTracker: SyncProgressTracker;
  private resultProcessor: SyncResultProcessor;
  private syncRepositoryFn: (repoId: number, forceFull: boolean) => Promise<SyncResult>;
  
  /**
   * 순차적 동기화 실행기를 생성합니다.
   * 
   * @param progressTracker 진행 상황 추적기
   * @param resultProcessor 결과 처리기
   * @param syncRepositoryFn 저장소 동기화 함수
   */
  constructor(
    progressTracker: SyncProgressTracker,
    resultProcessor: SyncResultProcessor,
    syncRepositoryFn: (repoId: number, forceFull: boolean) => Promise<SyncResult>
  ) {
    this.progressTracker = progressTracker;
    this.resultProcessor = resultProcessor;
    this.syncRepositoryFn = syncRepositoryFn;
  }
  
  /**
   * 저장소 목록을 순차적으로 동기화합니다.
   * 
   * @param repositories 동기화할 저장소 목록 
   * @param forceFull 전체 동기화 여부
   * @returns 각 저장소별 동기화 결과
   */
  async execute(repositories: RepositoryInfo[], forceFull: boolean): Promise<SyncResult[]> {
    logger.info(`순차적 동기화 시작: ${repositories.length}개 저장소`);
    
    // 동기화 시작 설정
    this.progressTracker.startSync(repositories.length);
    
    const results: SyncResult[] = [];
    
    // 저장소 순차 처리
    for (let i = 0; i < repositories.length; i++) {
      const repo = repositories[i];
      
      try {
        // 현재 처리 중인 저장소 설정
        this.progressTracker.setCurrentRepository(repo.id, repo.name);
        logger.info(`[${i + 1}/${repositories.length}] 저장소 동기화 시작: ${repo.name}`);
        
        // 저장소 동기화 실행
        const result = await this.syncRepositoryFn(repo.id, forceFull);
        results.push(result);
        
        // 저장소 동기화 완료 처리
        this.progressTracker.completeRepository();
        logger.info(`[${i + 1}/${repositories.length}] 저장소 동기화 완료: ${repo.name}`);
      } catch (error) {
        // 오류 발생 시 처리
        logger.error(`저장소 동기화 실패 (${repo.name}):`, error);
        
        // 실패 결과 생성 및 추가
        const failureResult = this.resultProcessor.createErrorResult(
          repo.id,
          repo.name,
          error instanceof Error ? error : String(error) // 적절한 타입으로 캐스팅
        );
        results.push(failureResult);
        
        // 저장소 동기화 완료 (실패) 처리
        this.progressTracker.completeRepository();
      }
    }
    
    // 전체 동기화 완료
    this.progressTracker.completeSync();
    logger.info(`순차적 동기화 완료: ${results.length}개 저장소`);
    
    return results;
  }
} 