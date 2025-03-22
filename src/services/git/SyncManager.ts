import { RepositoryInfo } from './IGitServiceAdapter';
import { GitHubApiCollector, GitHubApiSettings } from '../github/GitHubApiCollector.js';
import { logger } from '../../utils/logger.js';
import { SettingsService } from '../../api/server/settings-service.js';

import { RepositoryProvider } from './providers/RepositoryProvider.js';
import { TokenManager } from './managers/TokenManager.js';
import { SyncProgressTracker, SyncProgress } from './trackers/SyncProgressTracker.js';
import { SettingsManager } from './managers/SettingsManager.js';
import { SyncExecutor } from './executors/SyncExecutor.js';
import { SequentialSyncExecutor } from './executors/SequentialSyncExecutor.js';
import { ParallelSyncExecutor } from './executors/ParallelSyncExecutor.js';
import { SyncResultProcessor, SyncResult } from './processors/SyncResultProcessor.js';

/**
 * 동기화 관리자
 * 
 * 저장소의 코드 및 메타데이터를 동기화하는 작업을 관리합니다.
 */
export class SyncManager {
  private githubApiCollector: GitHubApiCollector;
  private settingsService: SettingsService;
  
  // 컴포넌트들
  private repositoryProvider: RepositoryProvider;
  private tokenManager: TokenManager;
  private progressTracker: SyncProgressTracker;
  private settingsManager: SettingsManager;
  private resultProcessor: SyncResultProcessor;
  
  constructor() {
    // 기본 서비스 초기화
    this.githubApiCollector = new GitHubApiCollector();
    this.settingsService = new SettingsService();
    
    // 컴포넌트 초기화
    this.repositoryProvider = new RepositoryProvider();
    this.tokenManager = new TokenManager();
    this.progressTracker = new SyncProgressTracker();
    this.settingsManager = new SettingsManager();
    this.resultProcessor = new SyncResultProcessor();
    
    // 설정 로드
    this.loadSettings();
  }
  
  /**
   * 설정을 로드하고 각 서비스에 적용합니다.
   */
  private async loadSettings(): Promise<void> {
    // 시스템 설정 로드
    await this.settingsManager.loadSettings();
    
    // GitHub 설정 로드
    const githubSettings = await this.settingsService.getGitHubSettings();
    logger.info('GitHub 설정 로드됨');
    
    if (githubSettings && githubSettings.token) {
      const apiSettings: GitHubApiSettings = {
        token: githubSettings.token,
        enterpriseUrl: undefined
      };
      
      // GitHub API 클라이언트 설정 업데이트
      this.githubApiCollector.updateSettings(apiSettings);
      logger.info('GitHub 설정이 적용됨');
    } else {
      logger.warn('GitHub 토큰이 설정되지 않았습니다.');
    }
    
    // GitHub Enterprise 설정 로드
    const githubEnterpriseSettings = await this.settingsService.getGitHubEnterpriseSettings();
    logger.info('GitHub Enterprise 설정 로드됨');
    
    if (githubEnterpriseSettings && githubEnterpriseSettings.enterpriseToken) {
      const enterpriseApiSettings: GitHubApiSettings = {
        token: githubEnterpriseSettings.enterpriseToken,
        enterpriseUrl: githubEnterpriseSettings.enterpriseUrl
      };
      
      // GitHub Enterprise 설정이 있는 경우만 업데이트
      if (enterpriseApiSettings.token && enterpriseApiSettings.enterpriseUrl) {
        // GitHub Enterprise 설정 업데이트
        this.githubApiCollector.updateSettings(enterpriseApiSettings);
        logger.info('GitHub Enterprise 설정이 적용됨');
      } else {
        logger.warn('GitHub Enterprise 설정이 불완전합니다. token 또는 enterpriseUrl이 누락되었습니다.');
      }
    } else {
      logger.warn('GitHub Enterprise 토큰이 설정되지 않았습니다.');
    }
  }
  
  /**
   * 저장소를 동기화합니다.
   * 
   * @param repoId 저장소 ID
   * @param forceFull 전체 동기화 여부 (true: 전체 동기화, false: 마지막 동기화 시점 이후만 동기화)
   * @returns 동기화 결과
   */
  async syncRepository(repoId: number, forceFull: boolean = false): Promise<SyncResult> {
    logger.info(`=== 저장소 동기화 시작 (ID: ${repoId}, 전체 동기화: ${forceFull}) ===`);
    
    // 1. 초기 결과 객체 생성
    const result = this.resultProcessor.createInitialResult(repoId);
    
    // 2. 저장소 정보 조회
    logger.info(`[1/6] 저장소 정보 조회 중... (ID: ${repoId})`);
    const repoInfo = await this.repositoryProvider.getRepository(repoId);
    if (!repoInfo) {
      return this.resultProcessor.handleRepositoryNotFound(repoId, result);
    }
    
    result.repositoryName = repoInfo.name;
    logger.info(`[1/6] 저장소 정보 조회 완료: [${repoInfo.fullName}] (타입: ${repoInfo.type})`);
    
    // 3. 동기화 모드 설정 (전체/증분)
    if (forceFull) {
      logger.info(`[2/6] 전체 동기화 모드 - 마지막 동기화 시간 초기화 중...`);
      await this.repositoryProvider.resetLastSyncAt(repoId);
      logger.info(`[2/6] 마지막 동기화 시간 초기화 완료`);
    } else {
      logger.info(`[2/6] 증분 동기화 모드 - 마지막 동기화(${repoInfo.lastSyncAt}) 이후 데이터만 가져옵니다.`);
    }
    
    // 4. API 토큰 및 URL 설정
    logger.info(`[3/6] API 토큰 및 URL 설정 중...`);
    const { apiToken } = await this.tokenManager.getApiCredentials(repoInfo);
    
    // 토큰 유효성 검증
    if (!this.tokenManager.validateToken(apiToken)) {
      logger.warn(`[3/6] API 토큰 검증 실패 - 동기화가 제한될 수 있습니다.`);
    }
    
    // 5. 데이터 수집기 초기화
    logger.info(`[4/6] GitHubDataCollector 초기화 시작`);
    
    logger.info(`[4/6] GitHubDataCollector 호출`);
    const { GitHubDataCollector } = await import('./services/github/GitHubDataCollector.js');
    logger.info(`[4/6] GitHubDataCollector 호출 완료`);
    
    // 정적 팩토리 메서드를 사용하여 데이터 수집기 초기화
    logger.info(`[4/6] 데이터 수집기 팩토리 메서드 호출 중...`);
    const collector = await GitHubDataCollector.createForRepository(repoId);
    logger.info(`[4/6] 데이터 수집기 초기화 완료`);
    
    // 6. 데이터 동기화 실행
    logger.info(`[5/6] 데이터 수집 시작 (${repoInfo.fullName})`);
    const syncData = await collector.syncAll();
    logger.info(`[5/6] 데이터 수집 완료: 커밋 ${syncData.commitCount}개, PR ${syncData.pullRequestCount}개, 리뷰 ${syncData.reviewCount}개`);
    
    // 7. 결과 처리
    const finalResult = this.resultProcessor.processSuccessResult(result, syncData, repoInfo);
    
    // 동기화 완료 시간 기록
    finalResult.endTime = new Date();
    const duration = (finalResult.endTime.getTime() - finalResult.startTime.getTime()) / 1000;
    logger.info(`=== 저장소 동기화 완료 (ID: ${repoId}, 소요시간: ${duration}초) ===`);
    
    return finalResult;
  }
  
  /**
   * 모든 저장소를 동기화합니다.
   * 
   * @param forceFull 전체 동기화 여부
   * @param concurrency 동시 처리할 저장소 수 (기본값: 1)
   * @returns 각 저장소의 동기화 결과 배열
   */
  async syncAllRepositories(forceFull: boolean = false, concurrency: number = 1): Promise<SyncResult[]> {
    // 1. 모든 저장소 정보 조회
    const repositories = await this.repositoryProvider.getAllRepositories();
    
    if (repositories.length === 0) {
      logger.warn('동기화할 저장소가 없습니다.');
      return [];
    }
    
    // 2. 동기화 실행기 선택 및 실행
    const executor = this.getSyncExecutor(concurrency);
    return await executor.execute(repositories, forceFull);
  }
  
  /**
   * 적절한 동기화 실행기를 반환합니다.
   * 
   * @param concurrency 동시성 수준
   * @returns 동기화 실행기
   */
  private getSyncExecutor(concurrency: number): SyncExecutor {
    if (concurrency <= 1) {
      return new SequentialSyncExecutor(
        this.progressTracker,
        this.resultProcessor,
        this.syncRepository.bind(this)
      );
    } else {
      return new ParallelSyncExecutor(
        this.progressTracker,
        this.resultProcessor,
        this.syncRepository.bind(this),
        concurrency
      );
    }
  }
  
  /**
   * 현재 동기화 진행 상황을 반환합니다.
   * 
   * @returns 동기화 진행 상황 정보
   */
  getSyncProgress(): SyncProgress {
    return this.progressTracker.getProgress();
  }
  
  /**
   * 동기화 작업이 진행 중인지 확인합니다.
   * 
   * @returns 동기화 진행 중 여부
   */
  isSyncInProgress(): boolean {
    return this.progressTracker.isSyncInProgress();
  }
  
  /**
   * 저장소 정보를 가져옵니다.
   * @param repoId 저장소 ID
   * @returns 저장소 정보
   */
  async getRepository(repoId: number): Promise<RepositoryInfo | null> {
    return this.repositoryProvider.getRepository(repoId);
  }
  
  /**
   * 전체 저장소 목록을 조회합니다.
   * @returns 저장소 정보 목록
   */
  async getAllRepositories(): Promise<RepositoryInfo[]> {
    return this.repositoryProvider.getAllRepositories();
  }
  
  /**
   * 데이터가 없는 저장소 목록 조회
   */
  async getRepositoriesWithoutData(): Promise<RepositoryInfo[]> {
    return this.repositoryProvider.getRepositoriesWithoutData();
  }
}