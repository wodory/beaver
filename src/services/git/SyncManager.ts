import { RepositoryInfo } from './IGitServiceAdapter';
import { getDB } from '../../db/index.js';
import { schemaToUse as schema } from '../../db/index.js';
import { eq } from 'drizzle-orm';
import { GitHubApiCollector, GitHubApiSettings } from '../github/GitHubApiCollector.js';
import { logger } from '../../utils/logger.js';
import { SettingsService } from '../../api/server/settings-service.js';
import { sql } from 'drizzle-orm';

/**
 * 시스템 설정 인터페이스
 */
interface SystemSettings {
  defaultPaths?: {
    repoStorage?: string;
  };
  refreshInterval?: number;
  language?: string;
  [key: string]: any;
}

/**
 * 동기화 결과 인터페이스
 */
export interface SyncResult {
  repositoryId: number;
  repositoryName: string;
  success: boolean;
  message: string;
  commitCount: number;
  pullRequestCount: number;
  reviewCount: number;
  jiraIssueCount: number;
  startTime: Date;
  endTime: Date;
  errors: string[];
}

/**
 * 동기화 진행 상황 인터페이스
 */
export interface SyncProgress {
  total: number;
  current: number;
  completed: number;
  failed: number;
  skipped: number;
  inProgress: number;
  status: 'idle' | 'running' | 'completed' | 'failed';
  startTime: Date | null;
  endTime: Date | null;
  estimatedTimeRemaining: number | null;
}

/**
 * 동기화 관리자
 * 
 * 저장소의 코드 및 메타데이터를 동기화하는 작업을 관리합니다.
 */
export class SyncManager {
  private githubApiCollector: GitHubApiCollector;
  private settingsService: SettingsService;
  // private basePath: string;
  private systemSettings: SystemSettings = {};
  private syncProgress: SyncProgress;
  
  constructor() {
    this.githubApiCollector = new GitHubApiCollector();
    this.settingsService = new SettingsService();
    // this.basePath = './repos'; // 기본값 설정
    
    // 동기화 진행 상황 초기화
    this.syncProgress = {
      total: 0,
      current: 0,
      completed: 0,
      failed: 0,
      skipped: 0,
      inProgress: 0,
      status: 'idle',
      startTime: null,
      endTime: null,
      estimatedTimeRemaining: null
    };
    
    // 설정 로드
    this.loadSettings();
  }
  
  /**
   * 데이터베이스 인스턴스를 반환합니다.
   */
  private async getDb() {
    const db = getDB();
    if (!db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    return db;
  }
  
  /**
   * 시스템 설정을 DB에서 로드합니다.
   */
  private async getSystemSettings(): Promise<SystemSettings> {
    try {
      if (!getDB()) {
        logger.error('데이터베이스가 초기화되지 않았습니다.');
        return {};
      }

      // Drizzle ORM 사용
      const db = getDB();
      const result = await db.execute(
        sql`SELECT value FROM system_settings WHERE key = 'default_settings'`
      );
      
      if (result && result.length > 0) {
        // 결과에서 값을 추출하고 파싱
        const settings = result[0].value;
        return typeof settings === 'string' ? JSON.parse(settings) : settings;
      }
      
      return {};
    } catch (error) {
      logger.error('시스템 설정을 로드하는 중 오류가 발생했습니다:', error);
      return {};
    }
  }
  
  /**
   * 시스템 설정을 DB에 저장합니다.
   */
  private async saveSystemSettings(settings: SystemSettings): Promise<void> {
    try {
      if (!getDB()) {
        logger.error('데이터베이스가 초기화되지 않았습니다.');
        return;
      }
      
      // Drizzle ORM 사용
      const db = getDB();
      // 설정이 존재하는지 확인
      const result = await db.execute(
        sql`SELECT COUNT(*) as count FROM system_settings WHERE key = 'default_settings'`
      );
      
      const count = parseInt(result[0].count);
      const settingsJson = JSON.stringify(settings);
      
      if (count > 0) {
        // 기존 설정 업데이트
        await db.execute(sql`
          UPDATE system_settings 
          SET value = ${settingsJson}, updated_at = NOW() 
          WHERE key = 'default_settings'
        `);
      } else {
        // 새 설정 삽입
        await db.execute(sql`
          INSERT INTO system_settings (key, value) 
          VALUES ('default_settings', ${settingsJson})
        `);
      }
      
      logger.info('시스템 설정이 DB에 저장되었습니다.');
    } catch (error) {
      logger.error('시스템 설정 저장 중 오류 발생:', error);
    }
  }
  
  /**
   * 초기 설정을 DB에 설정합니다.
   */
  private async ensureDefaultSettings(): Promise<void> {
    try {
      // 현재 설정 가져오기
      const currentSettings = await this.getSystemSettings();
      
      // 기본 설정이 없으면 새로 만들기
      if (!currentSettings || Object.keys(currentSettings).length === 0) {
        const defaultSettings: SystemSettings = {
          defaultPaths: {
            repoStorage: './repos'
          },
          refreshInterval: 5,
          language: 'ko'
        };
        
        await this.saveSystemSettings(defaultSettings);
        this.systemSettings = defaultSettings;
        logger.info('기본 시스템 설정이 DB에 생성되었습니다.');
      } else {
        this.systemSettings = currentSettings;
      }
      
      // defaultPaths가 없으면 추가
      if (!this.systemSettings.defaultPaths) {
        this.systemSettings.defaultPaths = {
          repoStorage: './repos'
        };
        await this.saveSystemSettings(this.systemSettings);
      }
      
      // 저장소 경로 설정
      // this.basePath = this.systemSettings.defaultPaths?.repoStorage || './repos';
      
    } catch (error) {
      logger.error('기본 설정 초기화 중 오류 발생:', error);
      // this.basePath = './repos'; // 오류 발생 시 기본값 사용
    }
  }
  
  /**
   * NeonDB에서 설정을 로드하고 각 서비스에 적용합니다.
   */
  private async loadSettings(): Promise<void> {
    try {
      // 시스템 설정 로드 및 초기화
      await this.ensureDefaultSettings();
      
      // GitHub 설정 로드
      const githubSettings = await this.settingsService.getGitHubSettings();
      logger.info('GitHub 설정 로드됨:', githubSettings);
      
      if (githubSettings && githubSettings.token) {
        const apiSettings: GitHubApiSettings = {
          token: githubSettings.token,
          enterpriseUrl: undefined
        };
        
        // GitHub API 클라이언트 설정 업데이트
        this.githubApiCollector.updateSettings(apiSettings);
        logger.info('GitHub 설정이 적용됨 :', { token: apiSettings.token ? '설정됨' : '없음' });
      } else {
        logger.warn('GitHub 토큰이 설정되지 않았습니다.');
      }
      
      // GitHub Enterprise 설정 로드
      const githubEnterpriseSettings = await this.settingsService.getGitHubEnterpriseSettings();
      logger.info('GitHub Enterprise 설정 로드됨:', githubEnterpriseSettings);
      
      if (githubEnterpriseSettings && githubEnterpriseSettings.enterpriseToken) {
        const enterpriseApiSettings: GitHubApiSettings = {
          token: githubEnterpriseSettings.enterpriseToken,
          enterpriseUrl: githubEnterpriseSettings.enterpriseUrl
        };
        
        // GitHub Enterprise 설정이 있는 경우만 업데이트
        if (enterpriseApiSettings.token && enterpriseApiSettings.enterpriseUrl) {
          // GitHub Enterprise 설정 업데이트
          this.githubApiCollector.updateSettings(enterpriseApiSettings);
          logger.info('GitHub Enterprise 설정이 적용됨 :', { 
            token: enterpriseApiSettings.token ? '설정됨' : '없음',
            url: enterpriseApiSettings.enterpriseUrl || '없음'
          });
        } else {
          logger.warn('GitHub Enterprise 설정이 불완전합니다. token 또는 enterpriseUrl이 누락되었습니다.');
        }
      } else {
        logger.warn('GitHub Enterprise 토큰이 설정되지 않았습니다.');
      }
    } catch (error) {
      logger.error('설정 로드 중 오류 발생:', error);
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
    const startTime = new Date();
    logger.info(`=== 저장소 동기화 시작 (ID: ${repoId}, 전체 동기화: ${forceFull}) ===`);
    
    const result: SyncResult = {
      repositoryId: repoId,
      repositoryName: '',
      success: false,
      message: '',
      commitCount: 0,
      pullRequestCount: 0,
      reviewCount: 0,
      jiraIssueCount: 0,
      startTime,
      endTime: startTime,
      errors: []
    };
    
    try {
      // 1. 저장소 정보 조회
      logger.info(`[1/6] 저장소 정보 조회 중... (ID: ${repoId})`);
      const repoInfo = await this.getRepository(repoId);
      if (!repoInfo) {
        const errorMsg = `저장소 ID ${repoId}를 찾을 수 없습니다.`;
        logger.error(errorMsg);
        result.message = errorMsg;
        return result;
      }
      
      result.repositoryName = repoInfo.name;
      logger.info(`[1/6] 저장소 정보 조회 완료: [${repoInfo.fullName}] (타입: ${repoInfo.type})`);
      
      // 전체 동기화인 경우 마지막 동기화 시간 초기화
      if (forceFull) {
        logger.info(`[2/6] 전체 동기화 모드 - 마지막 동기화 시간 초기화 중...`);
        await this.resetLastSyncAt(repoId);
        logger.info(`[2/6] 마지막 동기화 시간 초기화 완료`);
      } else {
        logger.info(`[2/6] 증분 동기화 모드 - 마지막 동기화(${repoInfo.lastSyncAt}) 이후 데이터만 가져옵니다.`);
      }
      
      // 2. 저장소 타입에 따른 API 토큰 선택
      logger.info(`[3/6] API 토큰 및 URL 설정 중...`);
      let apiToken: string | undefined;
      let apiUrl: string | undefined = repoInfo.apiUrl;
      
      if (repoInfo.type === 'github-enterprise') {
        // GitHub Enterprise의 경우 enterprise 설정에서 토큰 가져오기
        const githubEnterpriseSettings = await this.settingsService.getGitHubEnterpriseSettings();
        logger.info(`GitHub Enterprise 설정 로드됨: URL=${githubEnterpriseSettings.enterpriseUrl || '없음'}`);
        
        if (!githubEnterpriseSettings.enterpriseToken) {
          const errorMessage = `GitHub Enterprise 토큰이 설정되지 않았습니다. 설정 페이지에서 Enterprise 토큰을 확인하세요.`;
          logger.error(errorMessage);
          result.success = false;
          result.message = errorMessage;
          result.errors.push(errorMessage);
          result.endTime = new Date();
          return result;
        }
        
        apiToken = githubEnterpriseSettings.enterpriseToken;
        // apiUrl이 없는 경우 설정에서 가져옴
        if (!apiUrl && githubEnterpriseSettings.enterpriseUrl) {
          apiUrl = githubEnterpriseSettings.enterpriseUrl;
        }
        
        logger.info(`GitHub Enterprise 토큰 사용: ${apiToken.substring(0, 4)}...${apiToken.substring(apiToken.length - 4)}`);
      } else if (repoInfo.type === 'github') {
        // 일반 GitHub 저장소의 경우 GitHub 설정에서 토큰 가져오기
        const githubSettings = await this.settingsService.getGitHubSettings();
        logger.info(`GitHub 설정 로드됨`);
        
        // 저장소에 토큰이 있으면 그것을 우선 사용, 없으면 전역 설정 사용
        apiToken = repoInfo.apiToken || githubSettings.token;
        
        // apiUrl이 없으면 기본 GitHub API URL 사용
        if (!apiUrl) {
          apiUrl = 'https://api.github.com';
        }
        
        if (apiToken) {
          logger.info(`GitHub 토큰 사용: ${apiToken.substring(0, 4)}...${apiToken.substring(apiToken.length - 4)}`);
        } else {
          logger.warn(`GitHub 토큰이 설정되지 않았습니다.`);
        }
      } else {
        // 다른 타입의 저장소는 저장소 설정의 토큰 사용
        apiToken = repoInfo.apiToken;
        if (apiToken) {
          logger.info(`저장소 자체 토큰 사용: ${apiToken.substring(0, 4)}...${apiToken.substring(apiToken.length - 4)}`);
        }
      }
      
      // 토큰 유효성 검증
      if (!apiToken) {
        logger.warn(`[3/6] 저장소 [${repoInfo.fullName}]에 API 토큰이 설정되지 않았습니다. GitHub API 요청 제한으로 동기화가 실패할 수 있습니다.`);
      } else if (apiToken.length < 30) {
        logger.warn(`[3/6] API 토큰이 너무 짧습니다 (${apiToken.length}자). 유효한 GitHub 토큰인지 확인하세요.`);
      } else {
        logger.info(`[3/6] API 토큰 설정 완료`);
      }
      
      if (!apiUrl) {
        logger.warn(`[3/6] API URL이 설정되지 않았습니다. 기본 GitHub API URL을 사용합니다.`);
        apiUrl = 'https://api.github.com';
      }
      
      logger.info(`[3/6] 최종 API URL: ${apiUrl}`);
      
      // 4. 데이터 수집기 초기화
      logger.info(`[4/6] GitHubDataCollector 초기화 중...`);
      
      try {
        const { GitHubDataCollector } = await import('./services/github/GitHubDataCollector.js');
        
        // 정적 팩토리 메서드를 사용하여 데이터 수집기 초기화
        logger.info(`[4/6] 데이터 수집기 팩토리 메서드 호출 중...`);
        const collector = await GitHubDataCollector.createForRepository(repoId);
        logger.info(`[4/6] 데이터 수집기 초기화 완료`);
        
        // 5. 데이터 동기화 실행
        logger.info(`[5/6] 데이터 수집 시작 (${repoInfo.fullName})`);
        const syncResult = await collector.syncAll();
        logger.info(`[5/6] 데이터 수집 완료: 커밋 ${syncResult.commitCount}개, PR ${syncResult.pullRequestCount}개, 리뷰 ${syncResult.reviewCount}개`);
        
        // 6. 결과 설정
        result.commitCount = syncResult.commitCount;
        result.pullRequestCount = syncResult.pullRequestCount;
        result.reviewCount = syncResult.reviewCount;
        result.success = true;
        result.message = `저장소 [${repoInfo.fullName}] 동기화 완료: ${syncResult.commitCount}개의 커밋, ${syncResult.pullRequestCount}개의 PR, ${syncResult.reviewCount}개의 리뷰 수집됨`;
        
        logger.info(`[6/6] 동기화 성공: ${result.message}`);
      } catch (collectError) {
        // 데이터 수집기 초기화 또는 동기화 중 오류 발생
        const detailedError = collectError instanceof Error ? 
          { message: collectError.message, stack: collectError.stack } : 
          String(collectError);
          
        logger.error(`데이터 수집 중 오류 발생:`, detailedError);
        
        const errorMessage = collectError instanceof Error ? collectError.message : String(collectError);
        result.success = false;
        result.message = `저장소 동기화 실패: ${errorMessage}`;
        result.errors.push(errorMessage);
        throw collectError; // 상세 스택 트레이스를 로그에 기록하기 위해 다시 throw
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.success = false;
      result.message = `저장소 동기화 실패: ${errorMessage}`;
      result.errors.push(errorMessage);
      logger.error(`저장소 ID ${repoId} 동기화 중 오류 발생:`, error);
      // 스택 트레이스 로깅 추가
      if (error instanceof Error && error.stack) {
        logger.error(`오류 스택 트레이스: ${error.stack}`);
      }
    } finally {
      // 동기화 완료 시간 기록
      result.endTime = new Date();
      const duration = (result.endTime.getTime() - result.startTime.getTime()) / 1000;
      logger.info(`=== 저장소 동기화 완료 (ID: ${repoId}, 소요시간: ${duration}초) ===`);
    }
    
    return result;
  }
  
  /**
   * 모든 저장소를 동기화합니다.
   * 
   * @param forceFull 전체 동기화 여부
   * @param concurrency 동시 처리할 저장소 수 (기본값: 1)
   * @returns 각 저장소의 동기화 결과 배열
   */
  async syncAllRepositories(forceFull: boolean = false, concurrency: number = 1): Promise<SyncResult[]> {
    try {
      // 모든 저장소 정보 조회
      const repositories = await this.getAllRepositories();
      
      if (repositories.length === 0) {
        logger.warn('동기화할 저장소가 없습니다.');
        return [];
      }
      
      // 동기화 진행 상태 초기화
      this.syncProgress = {
        total: repositories.length,
        current: 0,
        completed: 0,
        failed: 0,
        skipped: 0,
        inProgress: 0,
        status: 'running',
        startTime: new Date(),
        endTime: null,
        estimatedTimeRemaining: null
      };
      
      logger.info(`총 ${repositories.length}개 저장소 동기화 시작 (동시성: ${concurrency})`);
      
      // 동시 처리 로직 - 주어진 동시성 수에 따라 처리
      const results: SyncResult[] = [];
      const startTime = Date.now();
      
      if (concurrency <= 1) {
        // 순차 처리
        for (let i = 0; i < repositories.length; i++) {
          const repo = repositories[i];
          this.syncProgress.current = i + 1;
          this.syncProgress.inProgress = 1;
          
          const percentComplete = Math.round((i / repositories.length) * 100);
          logger.info(`[${percentComplete}%] (${i + 1}/${repositories.length}) 저장소 ${repo.fullName} 동기화 중...`);
          
          try {
            const result = await this.syncRepository(repo.id, forceFull);
            results.push(result);
            
            if (result.success) {
              this.syncProgress.completed++;
              logger.info(`저장소 ${repo.fullName} 동기화 성공 - 커밋: ${result.commitCount}, PR: ${result.pullRequestCount}, 리뷰: ${result.reviewCount}`);
            } else {
              this.syncProgress.failed++;
              logger.error(`저장소 ${repo.fullName} 동기화 실패: ${result.message}`);
            }
            
            // 남은 시간 추정
            if (i > 0) {
              const elapsed = Date.now() - startTime;
              const avgTimePerRepo = elapsed / i;
              const remaining = repositories.length - i - 1;
              this.syncProgress.estimatedTimeRemaining = avgTimePerRepo * remaining;
              
              const minsRemaining = Math.round(this.syncProgress.estimatedTimeRemaining / 60000);
              logger.info(`예상 남은 시간: ${minsRemaining}분 (진행률: ${percentComplete}%)`);
            }
          } catch (error) {
            // 한 저장소 실패해도 다음 저장소 계속 진행
            logger.error(`저장소 ${repo.fullName} 동기화 중 오류 발생:`, error);
            results.push(this.createErrorResult(repo, error));
            this.syncProgress.failed++;
          }
          
          this.syncProgress.inProgress = 0;
        }
      } else {
        // 병렬 처리 - 동시성 레벨에 맞게 배치 처리
        for (let i = 0; i < repositories.length; i += concurrency) {
          const batch = repositories.slice(i, i + concurrency);
          const batchSize = batch.length;
          
          const percentComplete = Math.round((i / repositories.length) * 100);
          logger.info(`[${percentComplete}%] 배치 처리 중: ${i + 1}-${Math.min(i + concurrency, repositories.length)}/${repositories.length} 저장소`);
          this.syncProgress.current = i + 1;
          this.syncProgress.inProgress = batchSize;
          
          const batchPromises = batch.map(async (repo) => {
            try {
              logger.info(`저장소 ${repo.fullName} 동기화 시작`);
              return await this.syncRepository(repo.id, forceFull);
            } catch (error) {
              logger.error(`저장소 ${repo.fullName} 동기화 중 오류 발생:`, error);
              return this.createErrorResult(repo, error);
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);
          
          // 배치 결과 처리
          for (const result of batchResults) {
            if (result.success) {
              this.syncProgress.completed++;
            } else {
              this.syncProgress.failed++;
            }
          }
          
          // 남은 시간 추정
          if (i > 0) {
            const elapsed = Date.now() - startTime;
            // 병렬 처리이므로 완료된 배치 수를 기준으로 계산
            const completedBatches = Math.ceil((i + batchSize) / concurrency);
            const avgTimePerBatch = elapsed / completedBatches;
            const remainingBatches = Math.ceil((repositories.length - i - batchSize) / concurrency);
            this.syncProgress.estimatedTimeRemaining = avgTimePerBatch * remainingBatches;
            
            const minsRemaining = Math.round(this.syncProgress.estimatedTimeRemaining / 60000);
            logger.info(`예상 남은 시간: ${minsRemaining}분 (진행률: ${percentComplete}%)`);
          }
          
          this.syncProgress.inProgress = 0;
        }
      }
      
      // 동기화 완료 상태 업데이트
      this.syncProgress.status = this.syncProgress.failed > 0 ? 'failed' : 'completed';
      this.syncProgress.endTime = new Date();
      this.syncProgress.estimatedTimeRemaining = 0;
      
      // 성공/실패 통계
      const successCount = results.filter(r => r.success).length;
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      logger.info(`동기화 완료! ${repositories.length}개 저장소 중 ${successCount}개 성공, ${repositories.length - successCount}개 실패 (소요시간: ${totalTime}초)`);
      
      return results;
    } catch (error) {
      // 전체 동기화 실패 처리
      this.syncProgress.status = 'failed';
      this.syncProgress.endTime = new Date();
      
      logger.error('저장소 동기화 중 오류 발생:', error);
      throw error;
    }
  }
  
  /**
   * 오류 발생 시 사용할 결과 객체 생성
   */
  private createErrorResult(repo: any, error: unknown): SyncResult {
    return {
      repositoryId: repo.id,
      repositoryName: repo.name,
      success: false,
      message: `동기화 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
      commitCount: 0,
      pullRequestCount: 0,
      reviewCount: 0,
      jiraIssueCount: 0,
      startTime: new Date(),
      endTime: new Date(),
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
  
  /**
   * 마지막 동기화 시간 초기화
   */
  private async resetLastSyncAt(repoId: number): Promise<void> {
    try {
      await getDB().update(schema.repositories)
        .set({ lastSyncAt: new Date(0).toISOString() })
        .where(eq(schema.repositories.id, repoId));
    } catch (error) {
      logger.error(`마지막 동기화 시간 초기화 중 오류:`, error);
      throw error;
    }
  }
  
  /**
   * 저장소 정보를 가져옵니다.
   * @param repoId 저장소 ID
   * @returns 저장소 정보
   */
  async getRepository(repoId: number): Promise<RepositoryInfo | null> {
    try {
      const db = getDB();
      
      const repos = await db.select()
        .from(schema.repositories)
        .where(eq(schema.repositories.id, repoId));
      
      if (repos.length === 0) {
        return null;
      }
      
      const repo = repos[0];
      
      return {
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        cloneUrl: repo.cloneUrl,
        type: repo.type as 'github' | 'gitlab' | 'github-enterprise' | 'other',
        apiUrl: repo.apiUrl,
        apiToken: repo.apiToken,
        localPath: repo.localPath,
        lastSyncAt: repo.lastSyncAt
      };
    } catch (error) {
      logger.error(`저장소 정보 조회 실패 (ID: ${repoId}):`, error);
      return null;
    }
  }
  
  /**
   * 전체 저장소 목록을 조회합니다.
   * @returns 저장소 정보 목록
   */
  async getAllRepositories(): Promise<RepositoryInfo[]> {
    const repos = await getDB().select()
      .from(schema.repositories);
    
    return repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.fullName,
      cloneUrl: repo.cloneUrl,
      type: repo.type as 'github' | 'gitlab' | 'github-enterprise' | 'other',
      apiUrl: repo.apiUrl,
      apiToken: repo.apiToken,
      localPath: repo.localPath,
      lastSyncAt: repo.lastSyncAt
    }));
  }
  
  /**
   * 데이터가 없는 저장소 목록 조회
   */
  async getRepositoriesWithoutData(): Promise<RepositoryInfo[]> {
    try {
      const db = await this.getDb();
      
      // 현재 사용 중인 DB 유형 로깅
      const dbType = process.env.DB_TYPE || 'postgresql';
      logger.info(`데이터가 없는 저장소 조회 중 - 사용 중인 DB 유형: ${dbType}`);
      
      try {
        // Drizzle ORM 사용하여 commit 정보가 없는 저장소 확인
        logger.info('데이터가 없는 저장소 쿼리 실행 시작');
        const repositories = await db.execute(
          sql`SELECT r.* FROM repositories r
              LEFT JOIN (
                SELECT repository_id, COUNT(*) as commit_count
                FROM commits
                GROUP BY repository_id
              ) c ON r.id = c.repository_id
              WHERE c.commit_count IS NULL OR c.commit_count = 0`
        );
        
        logger.info(`데이터가 없는 저장소 쿼리 완료: ${repositories.length}개 저장소 발견`);

        return repositories.map((repo: any) => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          cloneUrl: repo.clone_url,
          type: repo.type
        }));
      } catch (error) {
        // 구체적인 오류 정보 로깅
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`데이터가 없는 저장소 조회 중 DB 오류 발생: ${errorMessage}`);
        
        // 테이블이 존재하지 않는 경우 모든 저장소를 반환
        if (error instanceof Error && 
            (errorMessage.includes('no such table') || 
             errorMessage.includes('relation') && errorMessage.includes('does not exist'))) {
          logger.warn('commits 테이블이 존재하지 않아 모든 저장소를 반환합니다.');
          return this.getAllRepositories();
        }
        
        // SQL 쿼리 오류의 경우 대체 쿼리 시도
        if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
          try {
            logger.info('대체 쿼리를 사용하여 모든 저장소를 반환합니다.');
            return await this.getAllRepositories();
          } catch (fallbackError) {
            logger.error('대체 쿼리 실행 중 오류 발생:', fallbackError);
          }
        }
        
        throw error; // 다른 오류는 상위로 전파
      }
    } catch (error) {
      logger.error('데이터가 없는 저장소 목록 조회 중 오류 발생:', error);
      throw error;
    }
  }
  
  /**
   * 현재 동기화 진행 상황을 반환합니다.
   * 
   * @returns 동기화 진행 상황 정보
   */
  getSyncProgress(): SyncProgress {
    return { ...this.syncProgress };
  }
  
  /**
   * 동기화 작업이 진행 중인지 확인합니다.
   * 
   * @returns 동기화 진행 중 여부
   */
  isSyncInProgress(): boolean {
    return this.syncProgress.status === 'running';
  }
} 