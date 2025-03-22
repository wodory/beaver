import { RepositoryInfo } from '../IGitServiceAdapter';
import { SyncResult } from '../processors/SyncResultProcessor.js';

/**
 * 동기화 실행 인터페이스
 * 
 * 동기화 작업의 실행 방식에 대한 추상화를 제공합니다.
 */
export interface SyncExecutor {
  /**
   * 동기화 작업을 실행합니다.
   * 
   * @param repositories 동기화할 저장소 목록
   * @param forceFull 전체 동기화 여부
   * @returns 각 저장소별 동기화 결과
   */
  execute(repositories: RepositoryInfo[], forceFull: boolean): Promise<SyncResult[]>;
} 