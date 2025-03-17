import { CommitInfo, IGitServiceAdapter, PullRequestInfo, RepositoryInfo, ReviewInfo, UserInfo } from '../IGitServiceAdapter';
import simpleGit, { SimpleGit } from 'simple-git';
import { mkdir } from 'fs/promises';
import path from 'path';

/**
 * GitHub Enterprise Mock 어댑터
 * 테스트 및 개발을 위한 가상 데이터를 제공합니다.
 */
export class MockGitHubEnterpriseAdapter implements IGitServiceAdapter {
  // 가상 사용자 데이터
  private users: UserInfo[] = [
    { id: 101, login: 'enterprise-user1', name: '기업사용자1', email: 'user1@company.com', avatarUrl: 'https://via.placeholder.com/150' },
    { id: 102, login: 'enterprise-user2', name: '기업사용자2', email: 'user2@company.com', avatarUrl: 'https://via.placeholder.com/150' },
    { id: 103, login: 'enterprise-user3', name: '기업사용자3', email: 'user3@company.com', avatarUrl: 'https://via.placeholder.com/150' }
  ];

  // 가상 저장소별 커밋 데이터
  private mockCommitsByRepo: Record<string, CommitInfo[]> = {
    'company/project1': [
      {
        id: 'e1f2g3h4i5j6k7l8m9n0',
        message: '[기능] 결제 시스템 구현',
        authorName: '기업사용자1',
        authorEmail: 'user1@company.com',
        committedDate: new Date('2024-02-01T09:15:00Z'),
        additions: 450,
        deletions: 30
      },
      {
        id: 'f2g3h4i5j6k7l8m9n0o1',
        message: '[보안] 인증 시스템 강화',
        authorName: '기업사용자2',
        authorEmail: 'user2@company.com',
        committedDate: new Date('2024-02-03T13:45:00Z'),
        additions: 200,
        deletions: 180
      },
      {
        id: 'g3h4i5j6k7l8m9n0o1p2',
        message: '[성능] 데이터베이스 쿼리 최적화',
        authorName: '기업사용자3',
        authorEmail: 'user3@company.com',
        committedDate: new Date('2024-02-06T11:20:00Z'),
        additions: 120,
        deletions: 300
      }
    ],
    'company/project2': [
      {
        id: 'h4i5j6k7l8m9n0o1p2q3',
        message: '[기능] 내부 API 개발',
        authorName: '기업사용자1',
        authorEmail: 'user1@company.com',
        committedDate: new Date('2024-02-02T10:30:00Z'),
        additions: 350,
        deletions: 20
      },
      {
        id: 'i5j6k7l8m9n0o1p2q3r4',
        message: '[리팩토링] 공통 모듈 구조 개선',
        authorName: '기업사용자2',
        authorEmail: 'user2@company.com',
        committedDate: new Date('2024-02-04T15:10:00Z'),
        additions: 280,
        deletions: 250
      }
    ]
  };

  // 가상 저장소별 PR 데이터
  private mockPRsByRepo: Record<string, PullRequestInfo[]> = {
    'company/project1': [
      {
        number: 501,
        title: '결제 시스템 구현',
        authorName: '기업사용자1',
        authorId: 101,
        state: 'merged',
        createdAt: new Date('2024-02-01T09:00:00Z'),
        updatedAt: new Date('2024-02-02T14:00:00Z'),
        mergedAt: new Date('2024-02-02T14:00:00Z')
      },
      {
        number: 502,
        title: '인증 시스템 강화',
        authorName: '기업사용자2',
        authorId: 102,
        state: 'merged',
        createdAt: new Date('2024-02-03T13:30:00Z'),
        updatedAt: new Date('2024-02-04T09:45:00Z'),
        mergedAt: new Date('2024-02-04T09:45:00Z')
      },
      {
        number: 503,
        title: '데이터베이스 쿼리 최적화',
        authorName: '기업사용자3',
        authorId: 103,
        state: 'open',
        createdAt: new Date('2024-02-06T11:00:00Z'),
        updatedAt: new Date('2024-02-06T11:00:00Z')
      }
    ],
    'company/project2': [
      {
        number: 601,
        title: '내부 API 개발',
        authorName: '기업사용자1',
        authorId: 101,
        state: 'merged',
        createdAt: new Date('2024-02-02T10:00:00Z'),
        updatedAt: new Date('2024-02-03T09:30:00Z'),
        mergedAt: new Date('2024-02-03T09:30:00Z')
      },
      {
        number: 602,
        title: '공통 모듈 구조 개선',
        authorName: '기업사용자2',
        authorId: 102,
        state: 'merged',
        createdAt: new Date('2024-02-04T15:00:00Z'),
        updatedAt: new Date('2024-02-05T11:30:00Z'),
        mergedAt: new Date('2024-02-05T11:30:00Z')
      }
    ]
  };

  // 가상 PR별 리뷰 데이터
  private mockReviewsByPR: Record<number, ReviewInfo[]> = {
    501: [
      {
        id: 'review-e1',
        prNumber: 501,
        authorName: '기업사용자3',
        authorId: 103,
        state: 'approved',
        submittedAt: new Date('2024-02-02T13:30:00Z'),
        body: '결제 로직이 잘 구현되었습니다. 보안 관련 추가 검토 필요할 수 있습니다.'
      }
    ],
    502: [
      {
        id: 'review-e2',
        prNumber: 502,
        authorName: '기업사용자1',
        authorId: 101,
        state: 'changes_requested',
        submittedAt: new Date('2024-02-03T15:45:00Z'),
        body: '2FA 인증 로직 개선이 필요합니다.'
      },
      {
        id: 'review-e3',
        prNumber: 502,
        authorName: '기업사용자1',
        authorId: 101,
        state: 'approved',
        submittedAt: new Date('2024-02-04T09:15:00Z'),
        body: '수정사항 확인했습니다. 이슈 해결되었습니다.'
      }
    ],
    601: [
      {
        id: 'review-e4',
        prNumber: 601,
        authorName: '기업사용자2',
        authorId: 102,
        state: 'approved',
        submittedAt: new Date('2024-02-03T09:00:00Z'),
        body: 'API 설계가 명확합니다. 문서화 잘 되어있네요.'
      }
    ],
    602: [
      {
        id: 'review-e5',
        prNumber: 602,
        authorName: '기업사용자3',
        authorId: 103,
        state: 'approved',
        submittedAt: new Date('2024-02-05T10:30:00Z'),
        body: '모듈 구조가 훨씬 더 명확해졌습니다. 좋은 개선입니다.'
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
      console.log(`Mock GHE: 저장소 ${repoInfo.fullName} 디렉토리 생성됨 (${repoPath})`);
      
      // 기본 git 구조를 가진 빈 저장소 생성
      const git: SimpleGit = simpleGit(repoPath);
      const isRepo = await git.checkIsRepo().catch(() => false);
      
      if (!isRepo) {
        await git.init();
        console.log(`Mock GHE: 저장소 ${repoInfo.fullName}에 빈 git 저장소 초기화됨`);
      }
      
      return repoPath;
    } catch (error) {
      console.error(`Mock GHE: 저장소 ${repoInfo.fullName} 처리 중 오류 발생:`, error);
      throw error;
    }
  }

  /**
   * 저장소의 커밋 데이터 수집 (Mock)
   */
  async collectCommits(repoInfo: RepositoryInfo, localPath: string, since?: Date): Promise<CommitInfo[]> {
    console.log(`Mock GHE: ${repoInfo.fullName} 저장소의 커밋 데이터 수집 중...`);
    
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
    console.log(`Mock GHE: ${repoInfo.fullName} 저장소의 PR 데이터 수집 중...`);
    
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
    console.log(`Mock GHE: PR #${prNumber}의 리뷰 데이터 수집 중...`);
    
    // 해당 PR의 가상 리뷰 데이터 가져오기
    return this.mockReviewsByPR[prNumber] || [];
  }

  /**
   * 저장소 사용자 정보 수집 (Mock)
   */
  async collectUsers(repoInfo: RepositoryInfo): Promise<UserInfo[]> {
    console.log(`Mock GHE: ${repoInfo.fullName} 저장소의 사용자 정보 수집 중...`);
    
    // 가상 사용자 목록 반환
    return this.users;
  }
} 