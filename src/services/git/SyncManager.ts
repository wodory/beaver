import { GitCommitCollector } from './GitCommitCollector';
import { GitServiceFactory } from './GitServiceFactory';
import { RepositoryInfo } from './IGitServiceAdapter';
import { getDB } from '../../db';
import { schemaToUse as schema } from '../../db';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import config from '../../config.json';
import { GitHubApiCollector, GitHubApiSettings } from '../github/GitHubApiCollector';
import { logger } from '../../utils/logger';
import { JiraDataCollector, JiraCollectorSettings } from '../jira/JiraDataCollector';
import { JiraIssue } from '../jira/IJiraAdapter';
import { SettingsService } from '../../api/server/settings-service.js';

/**
 * 동기화 관리자
 * 
 * 저장소의 코드 및 메타데이터를 동기화하는 작업을 관리합니다.
 */
export class SyncManager {
  private gitServiceFactory: GitServiceFactory;
  private commitCollector: GitCommitCollector;
  private githubApiCollector: GitHubApiCollector;
  private jiraDataCollector: JiraDataCollector;
  private settingsService: SettingsService;
  private basePath: string;
  
  constructor(useMockJira: boolean = false) {
    this.gitServiceFactory = GitServiceFactory.getInstance();
    this.commitCollector = new GitCommitCollector();
    this.githubApiCollector = new GitHubApiCollector();
    this.jiraDataCollector = new JiraDataCollector(useMockJira);
    this.settingsService = new SettingsService();
    this.basePath = config.defaultPaths?.repoStorage || './repos';
    
    // 설정 로드
    this.loadSettings();
  }
  
  /**
   * NeonDB에서 설정을 로드하고 각 서비스에 적용합니다.
   */
  private async loadSettings(): Promise<void> {
    try {
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
      
      // Jira 설정 로드
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
    } catch (error) {
      logger.error('설정 로드 중 오류 발생:', error);
      logger.info('환경 변수의 기본 설정을 사용합니다.');
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
   * 모든 저장소 정보를 가져옵니다.
   * @returns 저장소 정보 목록
   */
  async getAllRepositories(): Promise<RepositoryInfo[]> {
    // Phase 1에서 이미 완료된 기능 사용
    if (!getDB()) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    const repos = await getDB().select()
      .from(schema.repositories);
    
    return repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.fullName,
      cloneUrl: repo.cloneUrl,
      type: repo.type as 'github' | 'gitlab' | 'github-enterprise' | 'other',
      apiUrl: repo.apiUrl,
      apiToken: repo.apiToken,
      localPath: repo.localPath
    }));
  }
  
  /**
   * 저장소를 동기화합니다.
   * @param repoId 저장소 ID
   * @param forceFull 전체 동기화 여부 (증분 동기화 무시)
   * @param syncJira JIRA 이슈 동기화 여부
   * @returns 동기화 결과
   */
  async syncRepository(repoId: number, forceFull: boolean = false, syncJira: boolean = true): Promise<SyncResult> {
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
      const repoInfo = await this.getRepository(repoId);
      if (!repoInfo) {
        result.message = `ID가 ${repoId}인 저장소를 찾을 수 없습니다.`;
        result.endTime = new Date();
        return result;
      }
      
      result.repositoryName = repoInfo.fullName;
      logger.info(`저장소 동기화 시작: ${repoInfo.fullName}`);
      
      // 동기화 기준 시간 설정 (마지막 동기화 시간 또는 전체 동기화)
      let since: Date | undefined = undefined;
      if (!forceFull && repoInfo.lastSyncAt) {
        since = new Date(repoInfo.lastSyncAt);
        logger.info(`마지막 동기화 시간으로부터 증분 동기화: ${since.toISOString()}`);
      } else {
        logger.info('전체 동기화 수행 중...');
      }
      
      // 저장소 경로 확보
      const repoPath = await this.ensureRepositoryPath(repoInfo);
      if (!repoPath) {
        throw new Error(`저장소 경로를 생성할 수 없습니다: ${repoInfo.fullName}`);
      }
      
      // 커밋 데이터 수집
      try {
        result.commitCount = await this.commitCollector.collectAndStoreCommits(
          repoInfo,
          since
        );
      } catch (error) {
        const errorMessage = `커밋 데이터 수집 중 오류: ${error}`;
        logger.error(errorMessage);
        result.errors.push(errorMessage);
      }
      
      // GitHub API를 통해 PR 및 리뷰 데이터 수집
      try {
        // owner/repo 형식에서 추출
        const [owner, repo] = repoInfo.fullName.split('/');
        
        if (owner && repo) {
          // PR 및 리뷰 데이터 수집
          const prData = await this.githubApiCollector.collectRepositoryData(owner, repo, since);
          
          // 수집된 PR 데이터 저장
          result.pullRequestCount = await this.storePullRequests(repoInfo, prData.prs);
          
          // 각 PR의 리뷰 처리
          for (const pr of prData.prs) {
            const reviewCount = await this.storePullRequestReviews(repoInfo, pr.number, pr.reviews);
            result.reviewCount += reviewCount;
          }
          
          logger.info(`PR 데이터 수집 완료: ${result.pullRequestCount}개 PR, ${result.reviewCount}개 리뷰`);
        } else {
          const errorMessage = `저장소 이름 형식이 잘못되었습니다: ${repoInfo.fullName}`;
          logger.error(errorMessage);
          result.errors.push(errorMessage);
        }
      } catch (error) {
        const errorMessage = `PR 및 리뷰 데이터 수집 중 오류: ${error}`;
        logger.error(errorMessage);
        result.errors.push(errorMessage);
      }
      
      // JIRA 이슈 데이터 수집 (syncJira가 true일 때만)
      if (syncJira) {
        try {
          // JIRA 데이터 수집기 초기화
          await this.jiraDataCollector.initialize();
          
          // JIRA 이슈 데이터 수집
          const issuesData = await this.collectJiraIssuesForRepository(repoInfo, since);
          
          // 수집된 JIRA 이슈 데이터 저장
          if (issuesData.length > 0) {
            result.jiraIssueCount = await this.storeJiraIssues(repoInfo, issuesData);
            logger.info(`JIRA 이슈 데이터 수집 완료: ${result.jiraIssueCount}개 이슈`);
          } else {
            logger.info(`JIRA 이슈 데이터 없음: ${repoInfo.fullName}`);
          }
        } catch (error) {
          const errorMessage = `JIRA 이슈 데이터 수집 중 오류: ${error}`;
          logger.error(errorMessage);
          result.errors.push(errorMessage);
        }
      }
      
      // 마지막 동기화 시간 업데이트
      await getDB().update(
        schema.repositories,
        { lastSyncAt: new Date() },
        eq(schema.repositories.id, repoId)
      );
      
      result.success = true;
      result.message = '저장소 동기화 성공';
      logger.info(`저장소 동기화 완료: ${repoInfo.fullName}`);
    } catch (error) {
      result.message = `저장소 동기화 실패: ${error}`;
      result.errors.push(result.message);
      logger.error(result.message);
    }
    
    result.endTime = new Date();
    return result;
  }
  
  /**
   * 모든 저장소를 동기화합니다.
   * 
   * @param forceFull 전체 동기화 여부 (기본값: false)
   * @param syncJira JIRA 이슈 동기화 여부 (기본값: true)
   * @returns 동기화 결과 목록
   */
  async syncAllRepositories(forceFull: boolean = false, syncJira: boolean = true): Promise<SyncResult[]> {
    const repositories = await this.getAllRepositories();
    const results: SyncResult[] = [];
    
    for (const repo of repositories) {
      try {
        const result = await this.syncRepository(repo.id, forceFull, syncJira);
        results.push(result);
      } catch (error) {
        logger.error(`저장소 ${repo.fullName} 동기화 중 오류 발생:`, error);
        results.push({
          repositoryId: repo.id,
          repositoryName: repo.fullName,
          success: false,
          message: `동기화 중 오류 발생: ${error}`,
          commitCount: 0,
          pullRequestCount: 0,
          reviewCount: 0,
          jiraIssueCount: 0,
          startTime: new Date(),
          endTime: new Date(),
          errors: [`${error}`]
        });
      }
    }
    
    return results;
  }
  
  /**
   * 저장소와 관련된 JIRA 이슈 목록을 수집합니다.
   * @param repoInfo 저장소 정보
   * @param since 이 시간 이후의 이슈만 수집
   * @returns JIRA 이슈 목록
   */
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
  
  /**
   * JIRA 이슈 데이터를 데이터베이스에 저장합니다.
   * @param repoInfo 저장소 정보
   * @param issues JIRA 이슈 목록
   * @returns 저장된 이슈 수
   */
  private async storeJiraIssues(repoInfo: RepositoryInfo, issues: JiraIssue[]): Promise<number> {
    if (!getDB()) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    if (issues.length === 0) {
      return 0;
    }
    
    try {
      let insertCount = 0;
      
      // 이슈 데이터 변환 및 저장
      for (const issue of issues) {
        try {
          // 기존 이슈 조회 (DB에 이미 존재하는지 확인)
          const existingIssues = await getDB().select()
            .from(schema.jiraIssues)
            .where(eq(schema.jiraIssues.key, issue.key));
          
          const issueData = {
            repositoryId: repoInfo.id,
            key: issue.key,
            summary: issue.summary,
            description: issue.description || '',
            status: issue.status,
            issueType: issue.type || '',
            assignee: issue.assignee?.displayName || '',
            reporter: issue.reporter?.displayName || '',
            createdAt: new Date(issue.createdAt || new Date()),
            updatedAt: new Date(issue.updatedAt || new Date()),
            resolvedAt: issue.resolvedAt ? new Date(issue.resolvedAt) : null
          };
          
          if (existingIssues.length > 0) {
            // 이슈가 이미 존재하면 업데이트
            await getDB().update(
              schema.jiraIssues,
              issueData,
              eq(schema.jiraIssues.key, issue.key)
            );
          } else {
            // 새 이슈 삽입
            await getDB().insert(schema.jiraIssues).values(issueData).returning({ id: sql<number>`inserted.id` });
            insertCount++;
          }
        } catch (error) {
          logger.error(`JIRA 이슈 저장 중 오류 (${issue.key}): ${error}`);
          // 개별 이슈 저장 오류는 무시하고 계속 진행
          continue;
        }
      }
      
      return insertCount;
    } catch (error) {
      logger.error(`JIRA 이슈 저장 중 오류: ${error}`);
      throw error;
    }
  }
  
  /**
   * 저장소 경로를 확인하고 없으면 생성합니다.
   * 
   * @param repoInfo 저장소 정보
   * @returns 저장소 로컬 경로
   */
  private async ensureRepositoryPath(repoInfo: RepositoryInfo): Promise<string> {
    // 저장소 경로가 이미 설정되어 있으면 그대로 사용
    if (repoInfo.localPath) {
      await fs.mkdir(repoInfo.localPath, { recursive: true });
      return repoInfo.localPath;
    }
    
    // 새 경로 생성
    const repoPath = path.join(this.basePath, repoInfo.name);
    await fs.mkdir(repoPath, { recursive: true });
    
    return repoPath;
  }
  
  /**
   * PR 데이터를 데이터베이스에 저장
   * @param repoInfo 저장소 정보
   * @param pullRequests PR 목록
   * @returns 저장된 PR 수
   */
  private async storePullRequests(repoInfo: RepositoryInfo, pullRequests: any[]): Promise<number> {
    let storedCount = 0;
    
    try {
      for (const pr of pullRequests) {
        try {
          // PR 작성자 처리
          let authorId = null;
          if (pr.user) {
            authorId = await this.getOrCreateUser(pr.user.login, pr.user.id, pr.user.avatar_url);
          }
          
          // PR 병합자 처리 (있는 경우)
          let mergedById = null;
          if (pr.merged_by) {
            mergedById = await this.getOrCreateUser(pr.merged_by.login, pr.merged_by.id, pr.merged_by.avatar_url);
          }
          
          // PR 상태 결정
          let state = pr.state;
          if (pr.state === 'closed' && pr.merged_at) {
            state = 'merged';
          }
          
          // 기존 PR 확인
          const existingPRs = await getDB().query(`
            SELECT * FROM pull_requests WHERE repository_id = ? AND number = ?
          `, [repoInfo.id, pr.number]);
          
          if (existingPRs && existingPRs.length > 0) {
            // 기존 PR 업데이트
            await getDB().update(
              schema.pullRequests,
              {
                title: pr.title,
                body: pr.body || '',
                state: state,
                isDraft: pr.draft || false,
                additions: pr.additions || 0,
                deletions: pr.deletions || 0,
                changedFiles: pr.changed_files || 0,
                updatedAt: new Date(pr.updated_at),
                closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
                mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
                mergedBy: mergedById
              },
              eq(schema.pullRequests.id, existingPRs[0].id)
            );
            
            logger.debug(`PR #${pr.number} 업데이트 완료`);
          } else {
            // 새 PR 추가
            await getDB().insert(schema.pullRequests).values({
              repositoryId: repoInfo.id,
              number: pr.number,
              title: pr.title,
              body: pr.body || '',
              state: state,
              authorId,
              isDraft: pr.draft || false,
              additions: pr.additions || 0,
              deletions: pr.deletions || 0,
              changedFiles: pr.changed_files || 0,
              createdAt: new Date(pr.created_at),
              updatedAt: new Date(pr.updated_at),
              closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
              mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
              mergedBy: mergedById
            }).returning({ id: sql<number>`inserted.id` });
            
            logger.debug(`PR #${pr.number} 추가 완료`);
          }
          
          storedCount++;
        } catch (error) {
          logger.error(`PR #${pr.number} 저장 실패: ${error}`);
        }
      }
    } catch (error) {
      logger.error(`PR 데이터 저장 중 오류 발생: ${error}`);
    }
    
    return storedCount;
  }
  
  /**
   * PR 리뷰 데이터를 데이터베이스에 저장
   * @param repoInfo 저장소 정보
   * @param prNumber PR 번호
   * @param reviews 리뷰 목록
   * @returns 저장된 리뷰 수
   */
  private async storePullRequestReviews(repoInfo: RepositoryInfo, prNumber: number, reviews: any[]): Promise<number> {
    let storedCount = 0;
    
    try {
      // PR ID 찾기
      const pullRequests = await getDB().query(`
        SELECT id FROM pull_requests WHERE repository_id = ? AND number = ?
      `, [repoInfo.id, prNumber]);
      
      if (!pullRequests || pullRequests.length === 0) {
        logger.warn(`PR #${prNumber}를 찾을 수 없어 리뷰를 저장할 수 없습니다.`);
        return 0;
      }
      
      const prId = pullRequests[0].id;
      
      for (const review of reviews) {
        try {
          // 리뷰어 처리
          let reviewerId = null;
          if (review.user) {
            reviewerId = await this.getOrCreateUser(review.user.login, review.user.id, review.user.avatar_url);
          }
          
          // 기존 리뷰 확인
          const existingReviews = await getDB().query(`
            SELECT * FROM pr_reviews WHERE id = ?
          `, [review.id]);
          
          if (!existingReviews || existingReviews.length === 0) {
            // 새 리뷰 추가
            await getDB().insert(schema.prReviews).values({
              id: review.id,
              pullRequestId: prId,
              reviewerId,
              state: review.state,
              body: review.body || '',
              submittedAt: new Date(review.submitted_at),
              createdAt: new Date(),
              updatedAt: new Date()
            }).returning({ id: sql<number>`inserted.id` });
            
            logger.debug(`PR #${prNumber}의 리뷰 ${review.id} 추가 완료`);
            storedCount++;
          }
        } catch (error) {
          logger.error(`리뷰 ${review.id} 저장 실패: ${error}`);
        }
      }
    } catch (error) {
      logger.error(`PR #${prNumber}의 리뷰 데이터 저장 중 오류 발생: ${error}`);
    }
    
    return storedCount;
  }
  
  /**
   * 사용자 정보를 가져오거나 새로 생성
   * @param login GitHub 사용자명
   * @param githubId GitHub 사용자 ID
   * @param avatarUrl 프로필 이미지 URL
   * @returns 사용자 ID
   */
  private async getOrCreateUser(login: string, githubId: number, avatarUrl?: string): Promise<number> {
    try {
      // 기존 사용자 찾기
      const existingUsers = await getDB().query(`
        SELECT * FROM users WHERE github_id = ?
      `, [githubId]);
      
      if (existingUsers && existingUsers.length > 0) {
        return existingUsers[0].id;
      }
      
      // 새 사용자 생성
      const result = await getDB().insert(schema.users).values({
        login,
        githubId,
        avatarUrl: avatarUrl || null,
        name: null,
        email: null
      }).returning({ id: sql<number>`inserted.id` });
      
      return result.id;
    } catch (error) {
      logger.error(`사용자 정보 처리 중 오류 발생: ${error}`);
      throw error;
    }
  }
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