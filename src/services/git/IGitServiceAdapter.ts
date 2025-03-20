/**
 * Git 서비스 어댑터 인터페이스
 * 다양한 Git 호스팅 서비스(GitHub, GitLab, GitHub Enterprise 등)에 대한 
 * 공통 기능을 정의합니다.
 */
export interface IGitServiceAdapter {
  /**
   * 저장소 클론 또는 업데이트
   * @param repoInfo 저장소 정보
   * @param localPath 로컬 경로
   * @returns 클론/업데이트된 로컬 경로
   */
  cloneOrUpdateRepository(repoInfo: RepositoryInfo, localPath: string): Promise<string>;
  
  /**
   * 커밋 데이터 수집
   * @param repoInfo 저장소 정보
   * @param localPath 로컬 경로
   * @param since 시작 날짜 (이후 커밋만 수집)
   * @returns 수집된 커밋 목록
   */
  collectCommits(repoInfo: RepositoryInfo, localPath: string, since?: Date): Promise<CommitInfo[]>;
  
  /**
   * PR 데이터 수집
   * @param repoInfo 저장소 정보
   * @param since 시작 날짜 (이후 PR만 수집)
   * @returns 수집된 PR 목록
   */
  collectPullRequests(repoInfo: RepositoryInfo, since?: Date): Promise<PullRequestInfo[]>;
  
  /**
   * PR 리뷰 데이터 수집
   * @param repoInfo 저장소 정보
   * @param prNumber PR 번호
   * @returns 수집된 리뷰 목록
   */
  collectPullRequestReviews(repoInfo: RepositoryInfo, prNumber: number): Promise<ReviewInfo[]>;
  
  /**
   * 저장소 사용자/협업자 정보 수집
   * @param repoInfo 저장소 정보
   * @returns 사용자 목록
   */
  collectUsers(repoInfo: RepositoryInfo): Promise<UserInfo[]>;
}

/**
 * 저장소 정보 인터페이스
 */
export interface RepositoryInfo {
  id: number;
  name: string;
  fullName: string;
  cloneUrl: string;
  type: 'github' | 'gitlab' | 'github-enterprise' | 'other';
  apiUrl?: string;
  apiToken?: string;
  localPath?: string | null;
  lastSyncAt?: string | Date | null;
}

/**
 * 커밋 정보 인터페이스
 */
export interface CommitInfo {
  id: string; // 커밋 해시
  message: string;
  authorName: string;
  authorEmail: string;
  committedDate: Date;
  additions: number; // 추가된 라인 수
  deletions: number; // 삭제된 라인 수
}

/**
 * PR 정보 인터페이스
 */
export interface PullRequestInfo {
  number: number;
  title: string;
  authorName: string;
  authorId?: number;
  state: 'open' | 'closed' | 'merged';
  createdAt: Date;
  updatedAt: Date;
  mergedAt?: Date;
  closedAt?: Date;
}

/**
 * 리뷰 정보 인터페이스
 */
export interface ReviewInfo {
  id: string;
  prNumber: number;
  authorName: string;
  authorId?: number;
  state: 'approved' | 'changes_requested' | 'commented';
  submittedAt: Date;
  body?: string;
}

/**
 * 사용자 정보 인터페이스
 */
export interface UserInfo {
  id?: number;
  login: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
} 