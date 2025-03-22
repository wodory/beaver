import { logger } from '../../../utils/logger.js';

/**
 * 동기화 진행 상황 인터페이스
 */
export interface SyncProgress {
  inProgress: boolean;
  totalRepositories: number;
  completedRepositories: number;
  currentRepository?: {
    id: number;
    name: string;
  };
  startTime?: Date;
  estimatedEndTime?: Date;
  error?: string;
}

/**
 * 동기화 진행 상황 추적 클래스
 * 
 * 전체 동기화 작업의 진행 상황을 추적하고 관리합니다.
 */
export class SyncProgressTracker {
  private progress: SyncProgress;
  
  constructor() {
    // 기본 진행 상황 초기화
    this.progress = {
      inProgress: false,
      totalRepositories: 0,
      completedRepositories: 0
    };
  }
  
  /**
   * 동기화 작업 시작을 기록합니다.
   * 
   * @param totalRepositories 전체 저장소 수
   */
  startSync(totalRepositories: number): void {
    this.progress = {
      inProgress: true,
      totalRepositories,
      completedRepositories: 0,
      startTime: new Date()
    };
    
    logger.info(`동기화 시작: 총 ${totalRepositories}개 저장소`);
  }
  
  /**
   * 현재 작업 중인 저장소를 설정합니다.
   * 
   * @param repoId 저장소 ID
   * @param repoName 저장소 이름
   */
  setCurrentRepository(repoId: number, repoName: string): void {
    this.progress.currentRepository = {
      id: repoId,
      name: repoName
    };
    
    // 예상 종료 시간 업데이트
    this.updateEstimatedEndTime();
    
    logger.info(`동기화 중: ${repoName} (${this.progress.completedRepositories + 1}/${this.progress.totalRepositories})`);
  }
  
  /**
   * 저장소 동기화 완료를 기록합니다.
   */
  completeRepository(): void {
    this.progress.completedRepositories++;
    
    // 예상 종료 시간 업데이트
    this.updateEstimatedEndTime();
    
    logger.info(`저장소 동기화 완료: ${this.progress.completedRepositories}/${this.progress.totalRepositories}`);
    
    // 모든 저장소가 완료되었는지 확인
    if (this.progress.completedRepositories >= this.progress.totalRepositories) {
      this.completeSync();
    }
  }
  
  /**
   * 전체 동기화 작업 완료를 기록합니다.
   */
  completeSync(): void {
    const startTime = this.progress.startTime;
    const endTime = new Date();
    
    this.progress.inProgress = false;
    
    if (startTime) {
      const duration = (endTime.getTime() - startTime.getTime()) / 1000;
      logger.info(`동기화 완료: 총 ${this.progress.completedRepositories}개 저장소, 소요 시간: ${duration}초`);
    } else {
      logger.info(`동기화 완료: 총 ${this.progress.completedRepositories}개 저장소`);
    }
  }
  
  /**
   * 동기화 작업 오류를 기록합니다.
   * 
   * @param error 오류 메시지
   */
  setError(error: string): void {
    this.progress.error = error;
    logger.error(`[SyncProgressTracker] 동기화 오류 발생: ${error}`);
  }
  
  /**
   * 예상 종료 시간을 업데이트합니다.
   */
  private updateEstimatedEndTime(): void {
    const { startTime, totalRepositories, completedRepositories } = this.progress;
    
    if (startTime && completedRepositories > 0) {
      const now = new Date();
      const elapsed = now.getTime() - startTime.getTime();
      const timePerRepo = elapsed / completedRepositories;
      const remainingRepos = totalRepositories - completedRepositories;
      const remaining = timePerRepo * remainingRepos;
      
      this.progress.estimatedEndTime = new Date(now.getTime() + remaining);
    }
  }
  
  /**
   * 현재 동기화 진행 상황을 반환합니다.
   * 
   * @returns 동기화 진행 상황
   */
  getProgress(): SyncProgress {
    return { ...this.progress };
  }
  
  /**
   * 동기화 작업이 진행 중인지 확인합니다.
   * 
   * @returns 동기화 진행 중 여부
   */
  isSyncInProgress(): boolean {
    return this.progress.inProgress;
  }
} 