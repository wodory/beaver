import { CommitInfo, IGitServiceAdapter, PullRequestInfo, RepositoryInfo, ReviewInfo, UserInfo } from '../IGitServiceAdapter';
import simpleGit, { SimpleGit } from 'simple-git';
import { mkdir } from 'fs/promises';
import path from 'path';
import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';

/**
 * GitHub 어댑터
 * 실제 GitHub API와 통신할 때 사용할 어댑터입니다.
 */
export class GitHubAdapter implements IGitServiceAdapter {
  private apiToken?: string;
  private octokit: Octokit;
  private graphqlWithAuth: any;
  private enterpriseUrl?: string;
  private isEnterprise: boolean;

  constructor(apiToken?: string, enterpriseUrl?: string) {
    this.apiToken = apiToken;
    this.enterpriseUrl = enterpriseUrl;
    this.isEnterprise = !!enterpriseUrl;
    
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
          authorization: `token ${this.apiToken}`
        }
      };
      
      // GitHub Enterprise인 경우 baseUrl 설정
      if (this.isEnterprise && this.enterpriseUrl) {
        const baseUrl = this.enterpriseUrl.replace(/\/$/, '');
        graphqlOptions.baseUrl = baseUrl.includes('/api/graphql') ? baseUrl : `${baseUrl}/api/graphql`;
      }
      
      this.graphqlWithAuth = graphql.defaults(graphqlOptions);
    }
  }

  /**
   * 저장소 클론 또는 업데이트
   */
  async cloneOrUpdateRepository(repoInfo: RepositoryInfo, localPath: string): Promise<string> {
    const repoPath = path.join(localPath, repoInfo.name);
    
    try {
      // 디렉토리 생성
      await mkdir(repoPath, { recursive: true });
      
      const git: SimpleGit = simpleGit();
      // 이미 클론되어 있는지 확인
      const isRepo = await git.cwd(repoPath).checkIsRepo().catch(() => false);
      
      if (isRepo) {
        // 이미 클론된 저장소면 업데이트
        console.log(`저장소 ${repoInfo.fullName} 업데이트 중...`);
        await git.cwd(repoPath).pull();
      } else {
        // 새로 클론
        console.log(`저장소 ${repoInfo.fullName} 클론 중...`);
        
        // 인증이 필요한 경우 토큰 사용
        let cloneUrl = repoInfo.cloneUrl;
        if (this.apiToken && cloneUrl.startsWith('https://')) {
          cloneUrl = cloneUrl.replace('https://', `https://${this.apiToken}@`);
        }
        
        await git.clone(cloneUrl, repoPath);
      }
      
      return repoPath;
    } catch (error) {
      console.error(`저장소 ${repoInfo.fullName} 처리 중 오류 발생:`, error);
      throw error;
    }
  }

  /**
   * 저장소의 커밋 데이터 수집
   */
  async collectCommits(repoInfo: RepositoryInfo, localPath: string, since?: Date): Promise<CommitInfo[]> {
    console.log(`GitHub: ${repoInfo.fullName} 저장소의 커밋 데이터 수집 중...`);
    
    try {
      // 저장소 정보 분리 (owner/repo 형식)
      const [owner, repo] = repoInfo.fullName.split('/');
      
      // since 매개변수가 없으면 30일 전으로 설정
      const sinceDate = since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
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
      console.error(`커밋 데이터 수집 중 오류 발생:`, error);
      throw error;
    }
  }

  /**
   * 저장소의 PR 데이터 수집
   */
  async collectPullRequests(repoInfo: RepositoryInfo, since?: Date): Promise<PullRequestInfo[]> {
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
    } catch (error) {
      console.error(`PR 데이터 수집 중 오류 발생:`, error);
      throw error;
    }
  }

  /**
   * PR의 리뷰 데이터 수집
   */
  async collectPullRequestReviews(repoInfo: RepositoryInfo, prNumber: number): Promise<ReviewInfo[]> {
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
    } catch (error) {
      console.error(`PR 리뷰 데이터 수집 중 오류 발생:`, error);
      throw error;
    }
  }

  /**
   * 저장소 사용자 정보 수집
   */
  async collectUsers(repoInfo: RepositoryInfo): Promise<UserInfo[]> {
    console.log(`GitHub: ${repoInfo.fullName} 저장소의 사용자 정보 수집 중...`);
    
    try {
      // 저장소 정보 분리 (owner/repo 형식)
      const [owner, repo] = repoInfo.fullName.split('/');
      
      // GitHub API를 통해 컨트리뷰터 목록 가져오기
      const response = await this.octokit.repos.listContributors({
        owner,
        repo,
        per_page: 100
      });
      
      // 사용자 상세 정보 수집을 위한 Promise 배열
      const userPromises = response.data.map(async contributor => {
        if (!contributor.login) {
          return {
            login: 'anonymous',
            name: 'Anonymous User'
          } as UserInfo;
        }
        
        try {
          // 사용자 상세 정보 가져오기
          const userResponse = await this.octokit.users.getByUsername({
            username: contributor.login
          });
          
          const user = userResponse.data;
          
          return {
            id: user.id,
            login: user.login,
            name: user.name || user.login,
            email: user.email || `${user.login}@users.noreply.github.com`,
            avatarUrl: user.avatar_url
          } as UserInfo;
        } catch (error) {
          // 사용자 정보를 가져오지 못한 경우 기본 정보만 반환
          return {
            id: contributor.id,
            login: contributor.login,
            avatarUrl: contributor.avatar_url
          } as UserInfo;
        }
      });
      
      // 모든 사용자 정보 수집 완료 대기
      return await Promise.all(userPromises);
    } catch (error) {
      console.error(`사용자 정보 수집 중 오류 발생:`, error);
      throw error;
    }
  }
} 