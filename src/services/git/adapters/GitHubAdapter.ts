import { CommitInfo, IGitServiceAdapter, PullRequestInfo, RepositoryInfo, ReviewInfo, UserInfo } from '../IGitServiceAdapter';
import simpleGit, { SimpleGit } from 'simple-git';
import { mkdir } from 'fs/promises';
import path from 'path';

/**
 * GitHub 어댑터
 * 실제 GitHub API와 통신할 때 사용할 어댑터입니다.
 * 현재는 mock 어댑터를 사용하므로 기본 구현만 제공합니다.
 */
export class GitHubAdapter implements IGitServiceAdapter {
  private apiToken?: string;

  constructor(apiToken?: string) {
    this.apiToken = apiToken;
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
   * (현재는 GitHub API 연동이 구현되지 않아 throw error)
   */
  async collectCommits(repoInfo: RepositoryInfo, localPath: string, since?: Date): Promise<CommitInfo[]> {
    console.log(`GitHub: ${repoInfo.fullName} 저장소의 커밋 데이터 수집 중...`);
    throw new Error('GitHub API를 이용한 커밋 데이터 수집은 아직 구현되지 않았습니다.');
  }

  /**
   * 저장소의 PR 데이터 수집
   * (현재는 GitHub API 연동이 구현되지 않아 throw error)
   */
  async collectPullRequests(repoInfo: RepositoryInfo, since?: Date): Promise<PullRequestInfo[]> {
    console.log(`GitHub: ${repoInfo.fullName} 저장소의 PR 데이터 수집 중...`);
    throw new Error('GitHub API를 이용한 PR 데이터 수집은 아직 구현되지 않았습니다.');
  }

  /**
   * PR의 리뷰 데이터 수집
   * (현재는 GitHub API 연동이 구현되지 않아 throw error)
   */
  async collectPullRequestReviews(repoInfo: RepositoryInfo, prNumber: number): Promise<ReviewInfo[]> {
    console.log(`GitHub: PR #${prNumber}의 리뷰 데이터 수집 중...`);
    throw new Error('GitHub API를 이용한 리뷰 데이터 수집은 아직 구현되지 않았습니다.');
  }

  /**
   * 저장소 사용자 정보 수집
   * (현재는 GitHub API 연동이 구현되지 않아 throw error)
   */
  async collectUsers(repoInfo: RepositoryInfo): Promise<UserInfo[]> {
    console.log(`GitHub: ${repoInfo.fullName} 저장소의 사용자 정보 수집 중...`);
    throw new Error('GitHub API를 이용한 사용자 정보 수집은 아직 구현되지 않았습니다.');
  }
} 