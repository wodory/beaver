import { RepositoryInfo } from '../IGitServiceAdapter';
import { SyncExecutor } from './SyncExecutor.js';
import { SyncProgressTracker } from '../trackers/SyncProgressTracker.js';
import { SyncResult, SyncResultProcessor } from '../processors/SyncResultProcessor.js';
import { logger } from '../../../utils/logger.js';

/**
 * 병렬 동기화 실행기
 * 
 * 여러 저장소를 동시에 병렬로 동기화합니다.
 */
export class ParallelSyncExecutor implements SyncExecutor {
  private progressTracker: SyncProgressTracker;
  private resultProcessor: SyncResultProcessor;
  private syncRepositoryFn: (repoId: number, forceFull: boolean) => Promise<SyncResult>;
  private concurrency: number;
  
  /**
   * 병렬 동기화 실행기를 생성합니다.
   * 
   * @param progressTracker 진행 상황 추적기
   * @param resultProcessor 결과 처리기
   * @param syncRepositoryFn 저장소 동기화 함수
   * @param concurrency 동시에 처리할 저장소 수
   */
  constructor(
    progressTracker: SyncProgressTracker,
    resultProcessor: SyncResultProcessor,
    syncRepositoryFn: (repoId: number, forceFull: boolean) => Promise<SyncResult>,
    concurrency: number = 3
  ) {
    this.progressTracker = progressTracker;
    this.resultProcessor = resultProcessor;
    this.syncRepositoryFn = syncRepositoryFn;
    this.concurrency = Math.max(1, Math.min(concurrency, 10)); // 1~10 사이로 제한
  }
  
  /**
   * 저장소 목록을 병렬로 동기화합니다.
   * 
   * @param repositories 동기화할 저장소 목록 
   * @param forceFull 전체 동기화 여부
   * @returns 각 저장소별 동기화 결과
   */
  async execute(repositories: RepositoryInfo[], forceFull: boolean): Promise<SyncResult[]> {
    logger.info(`병렬 동기화 시작: ${repositories.length}개 저장소 (동시성: ${this.concurrency})`);
    
    // 동기화 시작 설정
    this.progressTracker.startSync(repositories.length);
    
    // 저장소를 청크로 나누기
    const chunks = this.chunkArray(repositories, this.concurrency);
    const results: SyncResult[] = [];
    
    // 청크 단위로 처리
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      logger.info(`청크 ${i + 1}/${chunks.length} 처리 중... (${chunk.length}개 저장소)`);
      
      // 현재 청크의 모든 저장소를 병렬로 처리
      const chunkPromises = chunk.map(repo => this.processRepository(repo, forceFull));
      const chunkResults = await Promise.all(chunkPromises);
      
      // 결과 병합
      results.push(...chunkResults);
      
      // 진행 상황 로그
      const processedCount = Math.min((i + 1) * this.concurrency, repositories.length);
      const percentage = Math.round((processedCount / repositories.length) * 100);
      logger.info(`진행 상황: ${percentage}% (${processedCount}/${repositories.length})`);
    }
    
    // 전체 동기화 완료
    this.progressTracker.completeSync();
    logger.info(`병렬 동기화 완료: ${results.length}개 저장소`);
    
    return results;
  }
  
  /**
   * 단일 저장소를 처리합니다.
   * 
   * @param repo 저장소 정보
   * @param forceFull 전체 동기화 여부
   * @returns 동기화 결과
   */
  private async processRepository(repo: RepositoryInfo, forceFull: boolean): Promise<SyncResult> {
    try {
      // 현재 처리 중인 저장소 설정
      this.progressTracker.setCurrentRepository(repo.id, repo.name);
      logger.info(`저장소 동기화 시작: ${repo.name}`);
      
      // 저장소 동기화 실행
      const result = await this.syncRepositoryFn(repo.id, forceFull);
      
      // 저장소 동기화 완료 처리
      this.progressTracker.completeRepository();
      logger.info(`저장소 동기화 완료: ${repo.name}`);
      
      return result;
    } catch (error) {
      // 오류 발생 시 처리
      logger.error(`저장소 동기화 실패 (${repo.name}):`, error);
      
      // 저장소 동기화 완료 (실패) 처리
      this.progressTracker.completeRepository();
      
      // 실패 결과 생성 및 반환
      return this.resultProcessor.createErrorResult(
        repo.id,
        repo.name,
        error instanceof Error ? error : String(error)
      );
    }
  }
  
  /**
   * 배열을 지정된 크기의 청크로 나눕니다.
   * 
   * @param array 원본 배열
   * @param chunkSize 청크 크기
   * @returns 청크 배열
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
} 