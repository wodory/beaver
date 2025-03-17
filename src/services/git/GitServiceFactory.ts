import { IGitServiceAdapter, RepositoryInfo } from './IGitServiceAdapter';
import { GitHubAdapter } from './adapters/GitHubAdapter';
import { GitHubEnterpriseAdapter } from './adapters/GitHubEnterpriseAdapter';
import { GitLabAdapter } from './adapters/GitLabAdapter';
import { MockGitHubAdapter } from './adapters/MockGitHubAdapter';
import { MockGitHubEnterpriseAdapter } from './adapters/MockGitHubEnterpriseAdapter';

/**
 * Git 서비스 어댑터 생성 팩토리
 * 저장소 타입에 따라 적절한 어댑터 인스턴스를 생성합니다.
 */
export class GitServiceFactory {
  private static instance: GitServiceFactory;
  private useMock: boolean = true; // 개발 환경에서는 기본적으로 Mock 사용

  private constructor() {}

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): GitServiceFactory {
    if (!GitServiceFactory.instance) {
      GitServiceFactory.instance = new GitServiceFactory();
    }
    return GitServiceFactory.instance;
  }

  /**
   * Mock 사용 여부 설정
   * @param useMock Mock 사용 여부
   */
  public setUseMock(useMock: boolean): void {
    this.useMock = useMock;
  }

  /**
   * 저장소 정보에 맞는 Git 서비스 어댑터 생성
   * @param repoInfo 저장소 정보
   * @returns Git 서비스 어댑터 인스턴스
   */
  public createAdapter(repoInfo: RepositoryInfo): IGitServiceAdapter {
    if (this.useMock) {
      return this.createMockAdapter(repoInfo);
    }

    switch (repoInfo.type) {
      case 'github':
        return new GitHubAdapter(repoInfo.apiToken);
      case 'github-enterprise':
        if (!repoInfo.apiUrl) {
          throw new Error('GitHub Enterprise 어댑터를 위해서는 apiUrl이 필요합니다.');
        }
        return new GitHubEnterpriseAdapter(repoInfo.apiUrl, repoInfo.apiToken);
      case 'gitlab':
        return new GitLabAdapter(repoInfo.apiToken);
      default:
        throw new Error(`지원하지 않는 저장소 타입입니다: ${repoInfo.type}`);
    }
  }

  /**
   * Mock 어댑터 생성
   * @param repoInfo 저장소 정보
   * @returns Mock Git 서비스 어댑터
   */
  private createMockAdapter(repoInfo: RepositoryInfo): IGitServiceAdapter {
    switch (repoInfo.type) {
      case 'github':
        return new MockGitHubAdapter();
      case 'github-enterprise':
        return new MockGitHubEnterpriseAdapter();
      case 'gitlab':
        // 현재 GitLab Mock은 구현하지 않음
        throw new Error('GitLab Mock 어댑터는 아직 구현되지 않았습니다.');
      default:
        throw new Error(`지원하지 않는 저장소 타입입니다: ${repoInfo.type}`);
    }
  }
} 