import { CommitInfo, IGitServiceAdapter, PullRequestInfo, RepositoryInfo, ReviewInfo, UserInfo } from '../IGitServiceAdapter';

/**
 * GitLab 어댑터 (인터페이스만 구현)
 * 현재는 사용하지 않으므로 메서드 스켈레톤만 제공합니다.
 */
export class GitLabAdapter implements IGitServiceAdapter {
  private apiToken?: string;

  constructor(apiToken?: string) {
    this.apiToken = apiToken;
  }

  async cloneOrUpdateRepository(repoInfo: RepositoryInfo, localPath: string): Promise<string> {
    throw new Error('GitLabAdapter.cloneOrUpdateRepository - 아직 구현되지 않았습니다.');
  }

  async collectCommits(repoInfo: RepositoryInfo, localPath: string, since?: Date): Promise<CommitInfo[]> {
    throw new Error('GitLabAdapter.collectCommits - 아직 구현되지 않았습니다.');
  }

  async collectPullRequests(repoInfo: RepositoryInfo, since?: Date): Promise<PullRequestInfo[]> {
    throw new Error('GitLabAdapter.collectPullRequests - 아직 구현되지 않았습니다.');
  }

  async collectPullRequestReviews(repoInfo: RepositoryInfo, prNumber: number): Promise<ReviewInfo[]> {
    throw new Error('GitLabAdapter.collectPullRequestReviews - 아직 구현되지 않았습니다.');
  }

  async collectUsers(repoInfo: RepositoryInfo): Promise<UserInfo[]> {
    throw new Error('GitLabAdapter.collectUsers - 아직 구현되지 않았습니다.');
  }
} 