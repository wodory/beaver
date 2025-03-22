import { Repository } from '../../types/settings';
import { GitHubDataCollector } from '../../services/git/services/github/GitHubDataCollector.js';

/**
 * GitHubDataCollector의 Mock 구현체
 * 테스트에서 실제 GitHub API 대신 사용할 수 있습니다.
 */
export class MockGitHubDataCollector {
  private repositoryId: number;
  
  /**
   * 주어진 레포지토리 ID로 MockGitHubDataCollector를 생성합니다.
   */
  static async createForRepository(repositoryId: number): Promise<GitHubDataCollector> {
    // GitHubDataCollector로 타입 단언하여 반환
    return new MockGitHubDataCollector(repositoryId) as unknown as GitHubDataCollector;
  }
  
  constructor(repositoryId: number) {
    this.repositoryId = repositoryId;
  }
  
  /**
   * 저장소 정보를 반환합니다.
   */
  async getRepositoryInfo() {
    const repository: Repository = {
      id: this.repositoryId,
      name: 'mock-repo',
      fullName: 'test-owner/mock-repo',
      url: 'https://github.com/test-owner/mock-repo.git',
      type: 'github',
      owner: 'test-owner',
      ownerReference: 'test-owner@github'
    };
    
    return {
      repository,
      owner: 'test-owner',
      name: 'mock-repo'
    };
  }
  
  /**
   * 커밋 수집을 시뮬레이션합니다.
   */
  async collectCommits(): Promise<number> {
    return 10; // 10개의 커밋이 수집되었다고 가정
  }
  
  /**
   * PR과 리뷰 수집을 시뮬레이션합니다.
   */
  async collectPullRequestsAndReviews(): Promise<{
    pullRequestCount: number;
    reviewCount: number;
  }> {
    return {
      pullRequestCount: 5,
      reviewCount: 8
    };
  }
  
  /**
   * 전체 동기화를 시뮬레이션합니다.
   */
  async syncAll(): Promise<{
    commitCount: number;
    pullRequestCount: number;
    reviewCount: number;
  }> {
    return {
      commitCount: 10,
      pullRequestCount: 5,
      reviewCount: 8
    };
  }
  
  /**
   * 마지막 동기화 시간 업데이트를 시뮬레이션합니다.
   */
  async updateLastSyncAt(): Promise<void> {
    // 아무 작업 없음
  }
} 