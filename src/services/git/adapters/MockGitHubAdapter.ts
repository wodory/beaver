import { CommitInfo, IGitServiceAdapter, PullRequestInfo, RepositoryInfo, ReviewInfo, UserInfo } from '../IGitServiceAdapter';
import simpleGit, { SimpleGit } from 'simple-git';
import { mkdir } from 'fs/promises';
import path from 'path';

/**
 * GitHub Mock 어댑터
 * 테스트 및 개발을 위한 가상 데이터를 제공합니다.
 */
export class MockGitHubAdapter implements IGitServiceAdapter {
  // 가상 사용자 데이터
  private users: UserInfo[] = [
    { id: 1, login: 'user1', name: '사용자1', email: 'user1@example.com', avatarUrl: 'https://via.placeholder.com/150' },
    { id: 2, login: 'user2', name: '사용자2', email: 'user2@example.com', avatarUrl: 'https://via.placeholder.com/150' },
    { id: 3, login: 'user3', name: '사용자3', email: 'user3@example.com', avatarUrl: 'https://via.placeholder.com/150' }
  ];

  // 가상 저장소별 커밋 데이터
  private mockCommitsByRepo: Record<string, CommitInfo[]> = {
    'owner/repo1': [
      {
        id: '1a2b3c4d5e6f7g8h9i0j',
        message: '[기능] 로그인 기능 구현',
        authorName: '사용자1',
        authorEmail: 'user1@example.com',
        committedDate: new Date('2024-02-01T10:30:00Z'),
        additions: 150,
        deletions: 20
      },
      {
        id: '2b3c4d5e6f7g8h9i0j1k',
        message: '[버그수정] 프로필 이미지 로딩 오류 수정',
        authorName: '사용자2',
        authorEmail: 'user2@example.com',
        committedDate: new Date('2024-02-03T14:15:00Z'),
        additions: 30,
        deletions: 15
      },
      {
        id: '3c4d5e6f7g8h9i0j1k2l',
        message: '[리팩토링] API 호출 모듈 개선',
        authorName: '사용자1',
        authorEmail: 'user1@example.com',
        committedDate: new Date('2024-02-05T09:45:00Z'),
        additions: 200,
        deletions: 180
      }
    ],
    'owner/repo2': [
      {
        id: '4d5e6f7g8h9i0j1k2l3m',
        message: '[기능] 알림 시스템 구현',
        authorName: '사용자3',
        authorEmail: 'user3@example.com',
        committedDate: new Date('2024-02-02T11:20:00Z'),
        additions: 300,
        deletions: 50
      },
      {
        id: '5e6f7g8h9i0j1k2l3m4n',
        message: '[문서] README 업데이트',
        authorName: '사용자2',
        authorEmail: 'user2@example.com',
        committedDate: new Date('2024-02-04T16:30:00Z'),
        additions: 120,
        deletions: 80
      }
    ]
  };

  // 가상 저장소별 PR 데이터
  private mockPRsByRepo: Record<string, PullRequestInfo[]> = {
    'owner/repo1': [
      {
        number: 101,
        title: '로그인 기능 구현',
        authorName: '사용자1',
        authorId: 1,
        state: 'merged',
        createdAt: new Date('2024-02-01T10:00:00Z'),
        updatedAt: new Date('2024-02-02T15:00:00Z'),
        mergedAt: new Date('2024-02-02T15:00:00Z')
      },
      {
        number: 102,
        title: '프로필 이미지 로딩 오류 수정',
        authorName: '사용자2',
        authorId: 2,
        state: 'merged',
        createdAt: new Date('2024-02-03T14:00:00Z'),
        updatedAt: new Date('2024-02-04T11:30:00Z'),
        mergedAt: new Date('2024-02-04T11:30:00Z')
      },
      {
        number: 103,
        title: 'API 호출 모듈 개선',
        authorName: '사용자1',
        authorId: 1,
        state: 'open',
        createdAt: new Date('2024-02-05T09:30:00Z'),
        updatedAt: new Date('2024-02-05T09:30:00Z')
      }
    ],
    'owner/repo2': [
      {
        number: 201,
        title: '알림 시스템 구현',
        authorName: '사용자3',
        authorId: 3,
        state: 'merged',
        createdAt: new Date('2024-02-02T11:00:00Z'),
        updatedAt: new Date('2024-02-03T10:00:00Z'),
        mergedAt: new Date('2024-02-03T10:00:00Z')
      },
      {
        number: 202,
        title: 'README 업데이트',
        authorName: '사용자2',
        authorId: 2,
        state: 'merged',
        createdAt: new Date('2024-02-04T16:00:00Z'),
        updatedAt: new Date('2024-02-05T14:00:00Z'),
        mergedAt: new Date('2024-02-05T14:00:00Z')
      }
    ]
  };

  // 가상 PR별 리뷰 데이터
  private mockReviewsByPR: Record<number, ReviewInfo[]> = {
    101: [
      {
        id: 'review1',
        prNumber: 101,
        authorName: '사용자2',
        authorId: 2,
        state: 'approved',
        submittedAt: new Date('2024-02-02T14:30:00Z'),
        body: 'LGTM 👍'
      }
    ],
    102: [
      {
        id: 'review2',
        prNumber: 102,
        authorName: '사용자1',
        authorId: 1,
        state: 'changes_requested',
        submittedAt: new Date('2024-02-03T16:00:00Z'),
        body: '테스트 케이스를 추가해주세요.'
      },
      {
        id: 'review3',
        prNumber: 102,
        authorName: '사용자1',
        authorId: 1,
        state: 'approved',
        submittedAt: new Date('2024-02-04T10:30:00Z'),
        body: '수정 확인했습니다. 이제 괜찮네요.'
      }
    ],
    201: [
      {
        id: 'review4',
        prNumber: 201,
        authorName: '사용자1',
        authorId: 1,
        state: 'approved',
        submittedAt: new Date('2024-02-03T09:30:00Z'),
        body: '잘 구현되었네요!'
      }
    ],
    202: [
      {
        id: 'review5',
        prNumber: 202,
        authorName: '사용자3',
        authorId: 3,
        state: 'approved',
        submittedAt: new Date('2024-02-05T13:30:00Z'),
        body: '문서가 더 명확해졌습니다.'
      }
    ]
  };

  /**
   * 저장소 클론 또는 업데이트 (Mock)
   * 실제로는 디렉토리만 생성합니다.
   */
  async cloneOrUpdateRepository(repoInfo: RepositoryInfo, localPath: string): Promise<string> {
    const repoPath = path.join(localPath, repoInfo.name);
    
    try {
      // 디렉토리 생성
      await mkdir(repoPath, { recursive: true });
      console.log(`Mock: 저장소 ${repoInfo.fullName} 디렉토리 생성됨 (${repoPath})`);
      
      // 기본 git 구조를 가진 빈 저장소 생성
      const git: SimpleGit = simpleGit(repoPath);
      const isRepo = await git.checkIsRepo().catch(() => false);
      
      if (!isRepo) {
        await git.init();
        console.log(`Mock: 저장소 ${repoInfo.fullName}에 빈 git 저장소 초기화됨`);
      }
      
      return repoPath;
    } catch (error) {
      console.error(`Mock: 저장소 ${repoInfo.fullName} 처리 중 오류 발생:`, error);
      throw error;
    }
  }

  /**
   * 저장소의 커밋 데이터 수집 (Mock)
   */
  async collectCommits(repoInfo: RepositoryInfo, localPath: string, since?: Date): Promise<CommitInfo[]> {
    console.log(`Mock: ${repoInfo.fullName} 저장소의 커밋 데이터 수집 중...`);
    
    // 해당 저장소의 가상 커밋 데이터 가져오기
    const commits = this.mockCommitsByRepo[repoInfo.fullName] || [];
    
    // since 날짜 이후의 커밋만 필터링
    if (since) {
      return commits.filter(commit => new Date(commit.committedDate) >= since);
    }
    
    return commits;
  }

  /**
   * 저장소의 PR 데이터 수집 (Mock)
   */
  async collectPullRequests(repoInfo: RepositoryInfo, since?: Date): Promise<PullRequestInfo[]> {
    console.log(`Mock: ${repoInfo.fullName} 저장소의 PR 데이터 수집 중...`);
    
    // 해당 저장소의 가상 PR 데이터 가져오기
    const pullRequests = this.mockPRsByRepo[repoInfo.fullName] || [];
    
    // since 날짜 이후의 PR만 필터링
    if (since) {
      return pullRequests.filter(pr => new Date(pr.updatedAt) >= since);
    }
    
    return pullRequests;
  }

  /**
   * PR의 리뷰 데이터 수집 (Mock)
   */
  async collectPullRequestReviews(repoInfo: RepositoryInfo, prNumber: number): Promise<ReviewInfo[]> {
    console.log(`Mock: PR #${prNumber}의 리뷰 데이터 수집 중...`);
    
    // 해당 PR의 가상 리뷰 데이터 가져오기
    return this.mockReviewsByPR[prNumber] || [];
  }

  /**
   * 저장소 사용자 정보 수집 (Mock)
   */
  async collectUsers(repoInfo: RepositoryInfo): Promise<UserInfo[]> {
    console.log(`Mock: ${repoInfo.fullName} 저장소의 사용자 정보 수집 중...`);
    
    // 가상 사용자 목록 반환
    return this.users;
  }
} 