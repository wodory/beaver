import { CommitInfo, IGitServiceAdapter, PullRequestInfo, RepositoryInfo, ReviewInfo, UserInfo } from '../IGitServiceAdapter';
import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';
import { GitHubDataCollector } from '../services/github/GitHubDataCollector.js';
import { getDB } from '../../../db';
import { eq } from 'drizzle-orm';
import { repositories } from '../../../db/schema';
import simpleGit, { SimpleGit } from 'simple-git';
import path from 'path';
import { logger } from '../../../utils/logger.js';

/**
 * GitHub 어댑터
 * 실제 GitHub API와 통신할 때 사용할 어댑터입니다.
 */
export class GitHubAdapter implements IGitServiceAdapter {
  private apiToken?: string;
  private octokit: Octokit;
  // graphqlWithAuth가 사용되지 않지만 향후 GraphQL 구현을 위해 유지
  // @ts-ignore
  private graphqlWithAuth: any;
  private enterpriseUrl?: string;
  private isEnterprise: boolean;
  private repositoryId?: number;

  constructor(apiToken?: string, enterpriseUrl?: string, repositoryId?: number) {
    this.apiToken = apiToken;
    this.enterpriseUrl = enterpriseUrl;
    this.isEnterprise = !!enterpriseUrl;
    this.repositoryId = repositoryId;
    
    // GitHub Enterprise인 경우 baseUrl 설정
    const options: any = {
      auth: this.apiToken
    };
    
    if (this.isEnterprise && this.enterpriseUrl) {
      // 이미 /api/v3가 포함된 경우를 확인하여 URL 중복 방지
      const baseUrl = this.enterpriseUrl.replace(/\/$/, '');
      options.baseUrl = baseUrl.includes('/api/v3') ? baseUrl : `${baseUrl}/api/v3`;
    }
    
    this.octokit = new Octokit(options);
    
    if (this.apiToken) {
      const graphqlOptions: any = {
        headers: {
          authorization: `Bearer ${this.apiToken}`
        }
      };
      
      // GitHub Enterprise인 경우 baseUrl 설정
      if (this.isEnterprise && this.enterpriseUrl) {
        const baseUrl = this.enterpriseUrl.replace(/\/$/, '');
        graphqlOptions.baseUrl = baseUrl.includes('/api/graphql') ? baseUrl : `${baseUrl}/api/graphql`;
      }
      
      // GraphQL 클라이언트 초기화 (향후 사용 예정)
      this.graphqlWithAuth = graphql.defaults(graphqlOptions);
    }
  }

  /**
   * API 토큰 반환
   */
  getApiToken(): string | undefined {
    return this.apiToken;
  }

  /**
   * API URL 반환
   */
  getApiUrl(): string | undefined {
    return this.enterpriseUrl;
  }

  /**
   * 저장소 클론 또는 업데이트 (인터페이스 호환성을 위해 유지)
   * 실제로는 GraphQL API를 사용하므로 로컬 클론이 필요하지 않음
   */
  async cloneOrUpdateRepository(repoInfo: RepositoryInfo, localPath: string): Promise<string> {
    console.log(`[GitHubAdapter] GraphQL 방식으로 변경되어 로컬 저장소 클론이 필요 없습니다.`);
    return localPath; // 더 이상 사용되지 않지만 인터페이스 호환성을 위해 유지
  }

  /**
   * 저장소 동기화
   * @param repoInfo 저장소 정보
   * @returns 동기화 결과
   */
  async syncRepository(repoInfo: RepositoryInfo): Promise<{ success: boolean; message: string; }> {
    try {
      if (!this.repositoryId) {
        this.repositoryId = repoInfo.id;
      }

      console.log(`저장소 ${repoInfo.fullName} (ID: ${this.repositoryId}) 동기화 시작`);
      
      // GraphQL 컬렉터 초기화
      const collector = new GitHubDataCollector(
        this.repositoryId,
        this.apiToken || '',
        this.isEnterprise ? (this.enterpriseUrl || 'https://api.github.com') : 'https://api.github.com'
      );
      
      // 커밋 데이터 수집
      const commitCount = await collector.collectCommits();
      
      // TODO: PR 및 리뷰 데이터 수집 추가 (추후 구현)
      
      return {
        success: true,
        message: `저장소 ${repoInfo.fullName} 동기화 완료: ${commitCount}개의 새 커밋 수집됨`
      };
    } catch (error: any) {
      console.error(`저장소 동기화 중 오류 발생: ${error.message}`);
      return {
        success: false,
        message: `저장소 동기화 실패: ${error.message}`
      };
    }
  }

  /**
   * 저장소의 커밋 데이터 수집
   * 
   * 이 메서드는 두 가지 방식으로 동작합니다:
   * 1. 로컬 저장소가 있는 경우: 저장소 업데이트 후 로컬 git 명령어로 커밋 수집
   * 2. 로컬 저장소가 없는 경우: GraphQL API를 통한 커밋 수집
   */
  async collectCommits(repoInfo: RepositoryInfo, localPath?: string, since?: Date): Promise<CommitInfo[]> {
    logger.info(`GitHub: ${repoInfo.fullName} 저장소의 커밋 데이터 수집 중...`);
    
    try {
      // since 매개변수가 없으면 30일 전으로 설정
      const sinceDate = since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // GraphQL API를 우선 사용하여 데이터 수집
      if (repoInfo.id) {
        try {
          logger.info(`저장소 ID ${repoInfo.id}에 대해 GraphQL API로 커밋 수집 시도`);
          
          // 우선 팩토리 메서드를 이용하여 GitHubDataCollector 인스턴스 생성 시도
          let collector;
          
          try {
            // 새로 구현한 생성 메서드 사용
            collector = await GitHubDataCollector.createForRepository(repoInfo.id);
          } catch (factoryError) {
            logger.warn(`팩토리 메서드로 GitHubDataCollector 생성 실패, 기본 생성자 사용: ${factoryError instanceof Error ? factoryError.message : String(factoryError)}`);
            // 기존 방식으로 컬렉터 초기화
            collector = new GitHubDataCollector(
              repoInfo.id,
              this.apiToken,
              this.isEnterprise ? this.enterpriseUrl : undefined
            );
          }
          
          // GraphQL로 커밋 데이터 수집 및 저장
          await collector.collectCommits();
          
          // DB에서 저장된 커밋 데이터 조회하여 반환
          const commits = await this.getCommitsFromDB(repoInfo.id, sinceDate);
          return commits;
        } catch (error) {
          logger.warn(`GraphQL API로 커밋 수집 실패, REST API로 대체: ${error instanceof Error ? error.message : String(error)}`);
          // GraphQL API가 실패하면 기존 REST API 또는 로컬 git 사용
        }
      }
      
      // 로컬 저장소가 있고 경로가 제공된 경우, 로컬 git 사용
      if (localPath) {
        return this.collectCommitsFromLocalGit(repoInfo, localPath, sinceDate);
      }
      
      // 그 외의 경우 REST API 사용 (기존 메서드)
      return this.collectCommitsFromRestApi(repoInfo, sinceDate);
    } catch (error) {
      logger.error(`커밋 데이터 수집 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * DB에서 커밋 데이터 조회
   */
  private async getCommitsFromDB(repositoryId: number, since: Date): Promise<CommitInfo[]> {
    // 필요한 데이터베이스 조회 로직 구현
    // DB에서 커밋 데이터 가져와서 CommitInfo 형식으로 반환
    
    // 여기서는 간단한 구현을 위해 빈 배열 반환
    // 실제 구현에서는 DB 조회 및 데이터 변환 필요
    return [];
  }
  
  /**
   * 로컬 Git 저장소에서 커밋 데이터 수집
   */
  private async collectCommitsFromLocalGit(repoInfo: RepositoryInfo, localPath: string, sinceDate: Date): Promise<CommitInfo[]> {
    try {
      const repoPath = path.join(localPath, repoInfo.name);
      const git: SimpleGit = simpleGit(repoPath);
      
      // 저장소 존재 여부 확인
      const isRepo = await git.checkIsRepo().catch(() => false);
      if (!isRepo) {
        throw new Error(`${repoPath}는 유효한 Git 저장소가 아닙니다.`);
      }
      
      // 최신 데이터로 업데이트
      logger.info(`저장소 ${repoInfo.fullName} 업데이트 중...`);
      await git.pull();
      
      // 커밋 로그 가져오기
      const logOptions = [`--since=${sinceDate.toISOString()}`, '--numstat'];
      const logs = await git.log(logOptions);
      
      // CommitInfo 배열로 변환
      return logs.all.map(log => {
        // 코드 변경량 계산
        let additions = 0;
        let deletions = 0;
        
        // numstat 속성 확인 및 안전하게 접근
        if (log.diff && 'numstat' in log.diff) {
          const numstatData = (log.diff as any).numstat;
          if (Array.isArray(numstatData)) {
            for (const stat of numstatData) {
              additions += parseInt(stat.additions) || 0;
              deletions += parseInt(stat.deletions) || 0;
            }
          }
        }
        
        return {
          id: log.hash,
          message: log.message,
          authorName: log.author_name,
          authorEmail: log.author_email,
          committedDate: new Date(log.date),
          additions,
          deletions
        } as CommitInfo;
      });
    } catch (error) {
      logger.error(`로컬 Git에서 커밋 수집 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * GitHub REST API를 사용한 커밋 데이터 수집
   */
  private async collectCommitsFromRestApi(repoInfo: RepositoryInfo, sinceDate: Date): Promise<CommitInfo[]> {
    try {
      // 저장소 정보 분리 (owner/repo 형식)
      const [owner, repo] = repoInfo.fullName.split('/');
      
      // GitHub API를 통해 커밋 목록 가져오기
      const response = await this.octokit.repos.listCommits({
        owner,
        repo,
        since: sinceDate.toISOString(),
        per_page: 100
      });
      
      // 상세 커밋 정보 수집을 위한 Promise 배열
      const commitPromises = response.data.map(async commit => {
        const detailedCommit = await this.octokit.repos.getCommit({
          owner,
          repo,
          ref: commit.sha
        });
        
        return {
          id: commit.sha,
          message: commit.commit.message,
          authorName: commit.commit.author?.name || 'Unknown',
          authorEmail: commit.commit.author?.email || 'unknown@example.com',
          committedDate: new Date(commit.commit.committer?.date || Date.now()),
          additions: detailedCommit.data.stats?.additions || 0,
          deletions: detailedCommit.data.stats?.deletions || 0
        } as CommitInfo;
      });
      
      // 모든 커밋 정보 수집 완료 대기
      return await Promise.all(commitPromises);
    } catch (error) {
      logger.error(`REST API에서 커밋 수집 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * 저장소의 PR 데이터 수집
   * TODO: GraphQL 버전으로 업데이트 필요
   */
  async collectPullRequests(repoInfo: RepositoryInfo, since?: Date): Promise<PullRequestInfo[]> {
    // 기존 REST API 코드 유지 (추후 GraphQL로 변경 예정)
    console.log(`GitHub: ${repoInfo.fullName} 저장소의 PR 데이터 수집 중...`);
    
    try {
      // 저장소 정보 분리 (owner/repo 형식)
      const [owner, repo] = repoInfo.fullName.split('/');
      
      // since 매개변수가 없으면 30일 전으로 설정
      const sinceDate = since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // GitHub API를 통해 PR 목록 가져오기 (상태: all - 모든 PR 포함)
      const response = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: 100
      });
      
      // since 이후의 PR만 필터링
      const filteredPRs = response.data.filter(pr => {
        const updatedAt = new Date(pr.updated_at);
        return updatedAt >= sinceDate;
      });
      
      // 상세 PR 정보 수집을 위한 Promise 배열
      const prPromises = filteredPRs.map(async pr => {
        // PR 상세 정보 가져오기 (커밋 수, 변경 파일 수 등)
        const prDetail = await this.octokit.pulls.get({
          owner,
          repo,
          pull_number: pr.number
        });
        
        // PR 상태 변환
        let state: 'open' | 'closed' | 'merged' = 'open';
        if (pr.state === 'closed') {
          state = prDetail.data.merged ? 'merged' : 'closed';
        }
        
        return {
          number: pr.number,
          title: pr.title,
          authorName: pr.user?.login || 'unknown',
          authorId: pr.user?.id,
          state: state,
          createdAt: new Date(pr.created_at),
          updatedAt: new Date(pr.updated_at),
          closedAt: pr.closed_at ? new Date(pr.closed_at) : undefined,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : undefined
        } as PullRequestInfo;
      });
      
      // 모든 PR 정보 수집 완료 대기
      return await Promise.all(prPromises);
    } catch (error: any) {
      console.error(`PR 데이터 수집 중 오류 발생: ${error.message}`);
      throw error;
    }
  }

  /**
   * PR의 리뷰 데이터 수집
   * TODO: GraphQL 버전으로 업데이트 필요
   */
  async collectPullRequestReviews(repoInfo: RepositoryInfo, prNumber: number): Promise<ReviewInfo[]> {
    // 기존 REST API 코드 유지 (추후 GraphQL로 변경 예정)
    console.log(`GitHub: PR #${prNumber}의 리뷰 데이터 수집 중...`);
    
    try {
      // 저장소 정보 분리 (owner/repo 형식)
      const [owner, repo] = repoInfo.fullName.split('/');
      
      // GitHub API를 통해 PR 리뷰 목록 가져오기
      const response = await this.octokit.pulls.listReviews({
        owner,
        repo,
        pull_number: prNumber
      });
      
      // 리뷰 정보 변환
      return response.data.map(review => {
        // 리뷰 상태 변환
        let state: 'approved' | 'changes_requested' | 'commented' = 'commented';
        if (review.state === 'APPROVED') {
          state = 'approved';
        } else if (review.state === 'CHANGES_REQUESTED') {
          state = 'changes_requested';
        }
        
        return {
          id: review.id.toString(),
          prNumber: prNumber,
          authorName: review.user?.login || 'unknown',
          authorId: review.user?.id,
          state: state,
          submittedAt: new Date(review.submitted_at || Date.now()),
          body: review.body || ''
        } as ReviewInfo;
      });
    } catch (error: any) {
      console.error(`PR 리뷰 데이터 수집 중 오류 발생: ${error.message}`);
      throw error;
    }
  }

  /**
   * 저장소 사용자 정보 수집
   * TODO: GraphQL 버전으로 업데이트 필요
   */
  async collectUsers(repoInfo: RepositoryInfo): Promise<UserInfo[]> {
    // 기존 코드 유지 (추후 GraphQL로 변경 예정)
    console.log(`GitHub: ${repoInfo.fullName} 저장소의 사용자 정보 수집 중...`);
    
    try {
      // 저장소 정보 분리 (owner/repo 형식)
      const [owner, repo] = repoInfo.fullName.split('/');
      
      // GitHub API를 통해 저장소 기여자 목록 가져오기
      const response = await this.octokit.repos.listContributors({
        owner,
        repo,
        per_page: 100
      });
      
      // 상세 사용자 정보 수집을 위한 Promise 배열
      const userPromises = response.data.map(async contributor => {
        // login이 undefined일 가능성에 대한 처리
        if (!contributor.login) {
          return {
            id: contributor.id || 0,
            login: 'unknown',
            name: 'Unknown User',
            email: 'unknown@example.com',
            avatarUrl: contributor.avatar_url || ''
          } as UserInfo;
        }
        
        // 사용자 상세 정보 가져오기
        const userDetail = await this.octokit.users.getByUsername({
          username: contributor.login
        });
        
        return {
          id: userDetail.data.id,
          login: userDetail.data.login,
          name: userDetail.data.name || userDetail.data.login,
          email: userDetail.data.email || `${userDetail.data.login}@example.com`,
          avatarUrl: userDetail.data.avatar_url
        } as UserInfo;
      });
      
      // 모든 사용자 정보 수집 완료 대기
      return await Promise.all(userPromises);
    } catch (error: any) {
      console.error(`사용자 정보 수집 중 오류 발생: ${error.message}`);
      throw error;
    }
  }

  /**
   * 팩토리 메서드 - 저장소 ID로부터 어댑터 생성
   */
  static async createFromRepositoryId(repositoryId: number): Promise<GitHubAdapter> {
    try {
      const db = getDB();
      const repository = await db.query.repositories.findFirst({
        where: eq(repositories.id, repositoryId)
      });
      
      if (!repository) {
        throw new Error(`저장소 ID ${repositoryId}를 찾을 수 없습니다.`);
      }
      
      // 저장소에 연결된 계정 설정 조회
      if (!repository.settingsId) {
        throw new Error(`저장소 ${repositoryId}에 연결된 설정이 없습니다.`);
      }
      
      // 설정 테이블에서 토큰 가져오기
      // 참고: 실제 설정 테이블 이름이 다를 수 있으므로 확인 필요
      const accountSettings = await db.query.settings.findFirst({
        where: eq(db.schema.settings.id, repository.settingsId)
      });
      
      if (!accountSettings || !accountSettings.token) {
        throw new Error(`저장소 ${repositoryId}에 대한 유효한 토큰 설정을 찾을 수 없습니다.`);
      }
      
      // token과 apiUrl이 문자열인지 확인 (타입 안전성 확보)
      const token = String(accountSettings.token);
      
      // apiUrl은 문자열이거나 undefined
      const apiUrl = accountSettings.apiUrl ? String(accountSettings.apiUrl) : undefined;
      
      return new GitHubAdapter(token, apiUrl, repositoryId);
    } catch (error: any) {
      console.error(`GitHubAdapter 생성 중 오류 발생: ${error.message}`);
      throw error;
    }
  }
} 