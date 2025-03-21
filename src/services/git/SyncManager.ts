// import { GitCommitCollector } from './GitCommitCollector';
// import { GitServiceFactory } from './GitServiceFactory';
import { RepositoryInfo } from './IGitServiceAdapter';
import { getDB } from '../../db/index.js';
import { schemaToUse as schema } from '../../db/index.js';
import { eq, /*and, not, isNull,*/ count } from 'drizzle-orm';
// import fs from 'fs/promises';
// import path from 'path';
import { GitHubApiCollector, GitHubApiSettings } from '../github/GitHubApiCollector.js';
import { logger } from '../../utils/logger.js';
// Jira 관련 import 주석 처리
// import { JiraDataCollector, JiraCollectorSettings } from '../jira/JiraDataCollector';
// import { JiraIssue } from '../jira/IJiraAdapter';
import { SettingsService } from '../../api/server/settings-service.js';
import { GitHubDataCollector } from './services/github/GitHubDataCollector.js';

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
 * 동기화 관리자
 * 
 * 저장소의 코드 및 메타데이터를 동기화하는 작업을 관리합니다.
 */
export class SyncManager {
  // TypeScript 오류: gitServiceFactory가 선언되었지만 사용되지 않음
  // 실제로 사용하거나 제거해야 함
  // private gitServiceFactory: GitServiceFactory;
  //private commitCollector: GitCommitCollector;
  private githubApiCollector: GitHubApiCollector;
  // Jira 컬렉터 주석 처리
  // private jiraDataCollector: JiraDataCollector;
  private settingsService: SettingsService;
  private basePath: string;
  private systemSettings: SystemSettings = {};
  
  constructor() {
    // this.gitServiceFactory = GitServiceFactory.getInstance();
    //this.commitCollector = new GitCommitCollector();
    this.githubApiCollector = new GitHubApiCollector();
    // Jira 컬렉터 초기화 주석 처리
    // this.jiraDataCollector = new JiraDataCollector(useMockJira);
    this.settingsService = new SettingsService();
    this.basePath = './repos'; // 기본값 설정
    
    // 설정 로드
    this.loadSettings();
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

      // 직접 SQL 쿼리 사용 (systemSettings 테이블이 없을 수 있음)
      const result = await getDB().execute(
        `SELECT value FROM system_settings WHERE key = 'default_settings'`
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
      
      // 직접 SQL 쿼리 사용 (systemSettings 테이블이 없을 수 있음)
      const result = await getDB().execute(
        `SELECT COUNT(*) as count FROM system_settings WHERE key = 'default_settings'`
      );
      
      const count = parseInt(result[0].count);
      
      if (count > 0) {
        // 기존 설정 업데이트
        await getDB().execute(
          `UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = 'default_settings'`,
          [JSON.stringify(settings)]
        );
      } else {
        // 새 설정 삽입
        await getDB().execute(
          `INSERT INTO system_settings (key, value) VALUES ('default_settings', $1)`,
          [JSON.stringify(settings)]
        );
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
      this.basePath = this.systemSettings.defaultPaths?.repoStorage || './repos';
      logger.info(`저장소 기본 경로: ${this.basePath}`);
    } catch (error) {
      logger.error('기본 설정 초기화 중 오류 발생:', error);
      this.basePath = './repos'; // 오류 발생 시 기본값 사용
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
      
      if (githubSettings) {
        logger.info('GitHub 설정을 로드하여 API 클라이언트에 적용합니다.');
        
        const apiSettings: GitHubApiSettings = {
          token: githubSettings.token,
          enterpriseUrl: githubSettings.enterpriseUrl
        };
        
        // GitHub API 클라이언트 설정 업데이트
        this.githubApiCollector.updateSettings(apiSettings);
      }
      
      // Jira 설정 로드 주석 처리
      /*
      const jiraSettings = await this.settingsService.getJiraSettings();
      
      if (jiraSettings && jiraSettings.url && jiraSettings.apiToken) {
        logger.info('Jira 설정을 로드하여 클라이언트에 적용합니다.');
        
        const jiraConfig: JiraCollectorSettings = {
          baseUrl: jiraSettings.url,
          username: jiraSettings.email,
          apiToken: jiraSettings.apiToken,
          projectKeys: jiraSettings.projectKey ? [jiraSettings.projectKey] : []
        };
        
        await this.jiraDataCollector.updateSettings(jiraConfig);
      }
      */
    } catch (error) {
      logger.error('설정 로드 중 오류 발생:', error);
      logger.info('환경 변수의 기본 설정을 사용합니다.');
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
      const repoInfo = await this.getRepository(repoId);
      if (!repoInfo) {
        result.message = `저장소 ID ${repoId}를 찾을 수 없습니다.`;
        return result;
      }
      
      result.repositoryName = repoInfo.name;
      logger.info(`저장소 [${repoInfo.fullName}] 동기화 시작`);
      
      // 전체 동기화인 경우 마지막 동기화 시간 초기화
      if (forceFull) {
        await this.resetLastSyncAt(repoId);
        logger.info(`전체 동기화 모드: 저장소 [${repoInfo.fullName}]의 마지막 동기화 시간 초기화됨`);
      }
      
      // 2. API 토큰 확인
      const apiToken = repoInfo.apiToken;
      if (!apiToken) {
        logger.warn(`저장소 [${repoInfo.fullName}]에 API 토큰이 설정되지 않았습니다. 인증 없이 진행합니다.`);
      }
      
      // 3. 데이터 수집기 초기화
      const collector = new GitHubDataCollector(repoId, apiToken, repoInfo.apiUrl);
      
      // 4. 데이터 동기화 실행
      logger.info(`저장소 [${repoInfo.fullName}] 데이터 수집 시작`);
      const syncResult = await collector.syncAll();
      
      // 5. 결과 설정
      result.commitCount = syncResult.commitCount;
      result.pullRequestCount = syncResult.pullRequestCount;
      result.reviewCount = syncResult.reviewCount;
      result.success = true;
      result.message = `저장소 [${repoInfo.fullName}] 동기화 완료: ${syncResult.commitCount}개의 커밋, ${syncResult.pullRequestCount}개의 PR, ${syncResult.reviewCount}개의 리뷰 수집됨`;
      
      logger.info(result.message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.success = false;
      result.message = `저장소 동기화 실패: ${errorMessage}`;
      result.errors.push(errorMessage);
      logger.error(`저장소 ID ${repoId} 동기화 중 오류 발생:`, error);
    } finally {
      result.endTime = new Date();
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
      
      logger.info(`총 ${repositories.length}개 저장소 동기화 시작 (동시성: ${concurrency})`);
      
      // 동시 처리 로직 - 주어진 동시성 수에 따라 처리
      const results: SyncResult[] = [];
      
      if (concurrency <= 1) {
        // 순차 처리
        for (let i = 0; i < repositories.length; i++) {
          const repo = repositories[i];
          logger.info(`(${i + 1}/${repositories.length}) 저장소 ${repo.fullName} 동기화 중...`);
          
          try {
            const result = await this.syncRepository(repo.id, forceFull);
            results.push(result);
          } catch (error) {
            // 한 저장소 실패해도 다음 저장소 계속 진행
            logger.error(`저장소 ${repo.fullName} 동기화 중 오류 발생:`, error);
            results.push(this.createErrorResult(repo, error));
          }
        }
      } else {
        // 병렬 처리
        for (let i = 0; i < repositories.length; i += concurrency) {
          const batch = repositories.slice(i, i + concurrency);
          logger.info(`배치 처리 중: ${i + 1}-${Math.min(i + concurrency, repositories.length)}/${repositories.length} 저장소`);
          
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
        }
      }
      
      // 성공/실패 통계
      const successCount = results.filter(r => r.success).length;
      logger.info(`${repositories.length}개 저장소 동기화 완료: ${successCount}개 성공, ${repositories.length - successCount}개 실패`);
      
      return results;
    } catch (error) {
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
   * 저장소와 관련된 JIRA 이슈 목록을 수집합니다.
   * @param repoInfo 저장소 정보
   * @param since 이 시간 이후의 이슈만 수집
   * @returns JIRA 이슈 목록
   */
  /* 전체 메서드 주석 처리
  private async collectJiraIssuesForRepository(
    repoInfo: RepositoryInfo, 
    since?: Date
  ): Promise<JiraIssue[]> {
    // 저장소 이름에서 프로젝트 키 추출 시도
    // 일반적으로 저장소 이름은 "project-repo" 형식이므로 '-' 앞 부분을 프로젝트 키로 사용
    const projectKey = repoInfo.name.split('-')[0].toUpperCase();
    
    // 검색 옵션 설정
    const searchOptions = {
      projectKey: projectKey,
      startDate: since,
      endDate: new Date() // 현재 시간까지
    };
    
    try {
      // 최신 완료된 이슈와 생성된 이슈를 함께 가져옴
      const [completedIssues, createdIssues] = await Promise.all([
        this.jiraDataCollector.getCompletedIssues(searchOptions),
        this.jiraDataCollector.getCreatedIssues(searchOptions)
      ]);
      
      // 중복 제거를 위해 Map 사용
      const issueMap = new Map<string, JiraIssue>();
      
      // 완료된 이슈와 생성된 이슈를 합침 (중복 제거)
      completedIssues.forEach(issue => {
        issueMap.set(issue.key, issue);
      });
      
      createdIssues.forEach(issue => {
        // 이미 완료된 이슈에 있으면 덮어쓰지 않음
        if (!issueMap.has(issue.key)) {
          issueMap.set(issue.key, issue);
        }
      });
      
      // Map에서 이슈 배열로 변환
      return Array.from(issueMap.values());
    } catch (error) {
      logger.error(`JIRA 이슈 수집 중 오류: ${error}`);
      throw error;
    }
  }
  */
  
  /**
   * 저장소 경로를 확인하고 없으면 생성합니다.
   * 
   * @param repoInfo 저장소 정보
   * @returns 저장소 로컬 경로
   */
  // private async ensureRepositoryPath(repoInfo: RepositoryInfo): Promise<string> {
  //   // 저장소 경로가 이미 설정되어 있으면 그대로 사용
  //   if (repoInfo.localPath) {
  //     await fs.mkdir(repoInfo.localPath, { recursive: true });
  //     return repoInfo.localPath;
  //   }
    
  //   // 새 경로 생성
  //   const repoPath = path.join(this.basePath, repoInfo.name);
  //   await fs.mkdir(repoPath, { recursive: true });
    
  //   return repoPath;
  // }
  
  /**
   * PR 데이터를 데이터베이스에 저장
   * @param repoInfo 저장소 정보
   * @param pullRequests PR 목록
   * @returns 저장된 PR 수
   */
  // private async storePullRequests(repoInfo: RepositoryInfo, pullRequests: any[]): Promise<number> {
  //   let storedCount = 0;
    
  //   try {
  //     for (const pr of pullRequests) {
  //       try {
  //         // PR 작성자 처리
  //         let authorId = null;
  //         if (pr.user) {
  //           authorId = await this.getOrCreateUser(pr.user.login, pr.user.id, pr.user.avatar_url);
  //         }
          
  //         // PR 병합자 처리 (있는 경우)
  //         let mergedById = null;
  //         if (pr.merged_by) {
  //           mergedById = await this.getOrCreateUser(pr.merged_by.login, pr.merged_by.id, pr.merged_by.avatar_url);
  //         }
          
  //         // PR 상태 결정
  //         let state = pr.state;
  //         if (pr.state === 'closed' && pr.merged_at) {
  //           state = 'merged';
  //         }
          
  //         // 기존 PR 확인 (ORM 방식)
  //         const existingPRs = await getDB()
  //           .select()
  //           .from(schema.pullRequests)
  //           .where(
  //             and(
  //               eq(schema.pullRequests.repositoryId, repoInfo.id),
  //               eq(schema.pullRequests.number, pr.number)
  //             )
  //           );
          
  //         if (existingPRs && existingPRs.length > 0) {
  //           // 기존 PR 업데이트
  //           await getDB()
  //             .update(schema.pullRequests)
  //             .set({
  //               title: pr.title,
  //               body: pr.body || '',
  //               state: state,
  //               isDraft: pr.draft || false,
  //               additions: pr.additions || 0,
  //               deletions: pr.deletions || 0,
  //               changedFiles: pr.changed_files || 0,
  //               updatedAt: new Date(pr.updated_at),
  //               closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
  //               mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
  //               mergedBy: mergedById
  //             })
  //             .where(eq(schema.pullRequests.id, existingPRs[0].id));
            
  //           logger.debug(`PR #${pr.number} 업데이트 완료`);
  //         } else {
  //           // 새 PR 추가
  //           await getDB()
  //             .insert(schema.pullRequests)
  //             .values({
  //               repositoryId: repoInfo.id,
  //               number: pr.number,
  //               title: pr.title,
  //               body: pr.body || '',
  //               state: state,
  //               authorId,
  //               isDraft: pr.draft || false,
  //               additions: pr.additions || 0,
  //               deletions: pr.deletions || 0,
  //               changedFiles: pr.changed_files || 0,
  //               createdAt: new Date(pr.created_at),
  //               updatedAt: new Date(pr.updated_at),
  //               closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
  //               mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
  //               mergedBy: mergedById
  //             });
            
  //           logger.debug(`PR #${pr.number} 추가 완료`);
  //         }
          
  //         storedCount++;
  //       } catch (error) {
  //         logger.error(`PR #${pr.number} 저장 실패: ${error}`);
  //       }
  //     }
  //   } catch (error) {
  //     logger.error(`PR 데이터 저장 중 오류 발생: ${error}`);
  //   }
    
  //   return storedCount;
  // }
  
  /**
   * PR 리뷰 데이터를 데이터베이스에 저장
   * @param repoInfo 저장소 정보
   * @param prNumber PR 번호
   * @param reviews 리뷰 목록
   * @returns 저장된 리뷰 수
   */
  // private async storePullRequestReviews(repoInfo: RepositoryInfo, prNumber: number, reviews: any[]): Promise<number> {
  //   let storedCount = 0;
    
  //   try {
  //     // PR ID 찾기 (ORM 방식)
  //     const pullRequests = await getDB()
  //       .select()
  //       .from(schema.pullRequests)
  //       .where(
  //         and(
  //           eq(schema.pullRequests.repositoryId, repoInfo.id),
  //           eq(schema.pullRequests.number, prNumber)
  //         )
  //       );
      
  //     if (!pullRequests || pullRequests.length === 0) {
  //       logger.warn(`PR #${prNumber}를 찾을 수 없어 리뷰를 저장할 수 없습니다.`);
  //       return 0;
  //     }
      
  //     const prId = pullRequests[0].id;
      
  //     for (const review of reviews) {
  //       try {
  //         // 리뷰어 처리
  //         let reviewerId = null;
  //         if (review.user) {
  //           reviewerId = await this.getOrCreateUser(review.user.login, review.user.id, review.user.avatar_url);
  //         }
          
  //         // 기존 리뷰 확인 (ORM 방식)
  //         const existingReviews = await getDB()
  //           .select()
  //           .from(schema.prReviews)
  //           .where(eq(schema.prReviews.id, review.id));
          
  //         if (!existingReviews || existingReviews.length === 0) {
  //           // 새 리뷰 추가
  //           await getDB()
  //             .insert(schema.prReviews)
  //             .values({
  //               id: review.id,
  //               pullRequestId: prId,
  //               reviewerId,
  //               state: review.state,
  //               body: review.body || '',
  //               submittedAt: new Date(review.submitted_at),
  //               createdAt: new Date(),
  //               updatedAt: new Date()
  //             });
            
  //           logger.debug(`PR #${prNumber}의 리뷰 ${review.id} 추가 완료`);
  //           storedCount++;
  //         }
  //       } catch (error) {
  //         logger.error(`리뷰 ${review.id} 저장 실패: ${error}`);
  //       }
  //     }
  //   } catch (error) {
  //     logger.error(`PR #${prNumber}의 리뷰 데이터 저장 중 오류 발생: ${error}`);
  //   }
    
  //   return storedCount;
  // }
  
  /**
   * 사용자 정보를 가져오거나 새로 생성
   * @param login GitHub 사용자명
   * @param githubId GitHub 사용자 ID
   * @param avatarUrl 프로필 이미지 URL
   * @returns 사용자 ID
   */
  // private async getOrCreateUser(login: string, githubId: number, avatarUrl?: string): Promise<number> {
  //   try {
  //     // 기존 사용자 찾기 (ORM 방식)
  //     const existingUsers = await getDB()
  //       .select()
  //       .from(schema.users)
  //       .where(eq(schema.users.githubId, githubId));
      
  //     if (existingUsers && existingUsers.length > 0) {
  //       return existingUsers[0].id;
  //     }
      
  //     // 새 사용자 생성 (ORM 방식)
  //     const result = await getDB()
  //       .insert(schema.users)
  //       .values({
  //         login,
  //         githubId,
  //         avatarUrl: avatarUrl || null,
  //         name: null,
  //         email: null
  //       })
  //       .returning({ id: schema.users.id });
      
  //     return result[0].id;
  //   } catch (error) {
  //     logger.error(`사용자 정보 처리 중 오류 발생: ${error}`);
  //     throw error;
  //   }
  // }

  /**
   * 데이터가 없는 저장소 목록 조회
   * 커밋이나 PR 데이터가 수집되지 않은 저장소를 반환합니다.
   */
  async getRepositoriesWithoutData() {
    try {
      const db = getDB();
      
      // 모든 저장소 정보 조회
      const repositories = await db.select().from(schema.repositories);
      
      // 데이터가 없는 저장소 목록
      const repositoriesWithoutData = [];
      
      for (const repo of repositories) {
        // 커밋 수 확인
        const commitCount = await db.select({ count: count() })
          .from(schema.commits)
          .where(eq(schema.commits.repositoryId, repo.id))
          .execute();
        
        // PR 수 확인
        const prCount = await db.select({ count: count() })
          .from(schema.pullRequests)
          .where(eq(schema.pullRequests.repositoryId, repo.id))
          .execute();
        
        // 커밋이나 PR이 없는 경우 목록에 추가
        if (commitCount[0].count === 0 || prCount[0].count === 0) {
          repositoriesWithoutData.push(repo);
        }
      }
      
      return repositoriesWithoutData;
    } catch (error) {
      logger.error('데이터가 없는 저장소 목록 조회 중 오류 발생:', error);
      throw error;
    }
  }
} 