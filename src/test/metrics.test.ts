import { describe, it, expect } from 'vitest';
import { 
  calculatePRCount, 
  calculateLinesOfCode, 
  findFirstReviewTime, 
  calculateAverageReviewResponseTime, 
  calculateAveragePRCycleTime,
  calculateDeploymentFrequency,
  calculateChangeFailureRate,
  calculateMetrics
} from '../lib/metrics';
import { PullRequest, Review, Commit } from '../api/github';
import { DeploymentEvent } from '../types/github';
import { fetchPullRequests, fetchPullRequestReviews, fetchPullRequestCommits, fetchCommitDetails, fetchDeployments } from '../api/github';

// 테스트용 목 데이터
const mockPullRequests: PullRequest[] = [
  {
    id: 1,
    number: 101,
    title: 'PR 1',
    user: { login: 'user1' },
    created_at: '2023-06-10T10:00:00Z',
    merged_at: '2023-06-15T15:00:00Z',
    closed_at: '2023-06-15T15:00:00Z',
    state: 'closed',
    html_url: 'https://github.com/test/repo/pull/101'
  },
  {
    id: 2,
    number: 102,
    title: 'PR 2',
    user: { login: 'user2' },
    created_at: '2023-06-12T10:00:00Z',
    merged_at: null,
    closed_at: '2023-06-14T15:00:00Z',
    state: 'closed',
    html_url: 'https://github.com/test/repo/pull/102'
  },
  {
    id: 3,
    number: 103,
    title: 'PR 3',
    user: { login: 'user3' },
    created_at: '2023-06-14T10:00:00Z',
    merged_at: null,
    closed_at: null,
    state: 'open',
    html_url: 'https://github.com/test/repo/pull/103'
  }
];

const mockReviews: Record<number, Review[]> = {
  101: [
    {
      id: 1001,
      user: { login: 'reviewer1' },
      state: 'APPROVED',
      submitted_at: '2023-06-12T14:00:00Z',
      body: '좋은 PR입니다!'
    },
    {
      id: 1002,
      user: { login: 'reviewer2' },
      state: 'COMMENTED',
      submitted_at: '2023-06-13T10:00:00Z',
      body: '코멘트입니다'
    }
  ],
  102: [
    {
      id: 1003,
      user: { login: 'reviewer1' },
      state: 'CHANGES_REQUESTED',
      submitted_at: '2023-06-13T11:00:00Z',
      body: '수정이 필요합니다'
    }
  ],
  103: []
};

const mockCommits: Record<number, Commit[]> = {
  101: [
    {
      sha: 'abc123',
      commit: {
        message: '기능 추가',
        author: {
          name: 'User 1',
          date: '2023-06-10T11:00:00Z'
        }
      },
      stats: {
        additions: 100,
        deletions: 50,
        total: 150
      }
    }
  ],
  102: [
    {
      sha: 'def456',
      commit: {
        message: '버그 수정',
        author: {
          name: 'User 2',
          date: '2023-06-12T11:00:00Z'
        }
      },
      stats: {
        additions: 30,
        deletions: 20,
        total: 50
      }
    },
    {
      sha: 'ghi789',
      commit: {
        message: '리팩토링',
        author: {
          name: 'User 2',
          date: '2023-06-13T11:00:00Z'
        }
      },
      stats: {
        additions: 40,
        deletions: 40,
        total: 80
      }
    }
  ],
  103: [
    {
      sha: 'jkl012',
      commit: {
        message: '신규 기능',
        author: {
          name: 'User 3',
          date: '2023-06-14T11:00:00Z'
        }
      },
      stats: {
        additions: 200,
        deletions: 0,
        total: 200
      }
    }
  ]
};

const mockPrDetails: Record<number, { reviews: Review[], commits: Commit[] }> = {
  101: { reviews: mockReviews[101], commits: mockCommits[101] },
  102: { reviews: mockReviews[102], commits: mockCommits[102] },
  103: { reviews: mockReviews[103], commits: mockCommits[103] }
};

// 테스트용 배포 데이터
const mockDeployments: DeploymentEvent[] = [
  {
    id: 1,
    repository: 'test/repo',
    environment: 'production',
    created_at: '2023-06-12T12:00:00Z',
    completed_at: '2023-06-12T12:05:00Z',
    status: 'success',
    has_issues: false,
    created_by: 'user1'
  },
  {
    id: 2,
    repository: 'test/repo',
    environment: 'production',
    created_at: '2023-06-14T15:00:00Z',
    completed_at: '2023-06-14T15:10:00Z',
    status: 'failure',
    has_issues: true,
    created_by: 'user2'
  },
  {
    id: 3,
    repository: 'test/repo',
    environment: 'staging',
    created_at: '2023-06-16T10:00:00Z',
    completed_at: '2023-06-16T10:03:00Z',
    status: 'success',
    has_issues: false,
    created_by: 'user3'
  }
];

describe('메트릭 계산 함수 테스트', () => {
  describe('calculatePRCount', () => {
    it('PR 개수를 정확하게 계산해야 함', () => {
      const count = calculatePRCount(mockPullRequests);
      expect(count).toBe(3);
    });
  });

  describe('calculateLinesOfCode', () => {
    it('커밋의 코드 변경량을 정확하게 계산해야 함', () => {
      const loc1 = calculateLinesOfCode(mockCommits[101]);
      expect(loc1).toBe(150); // 100 + 50

      const loc2 = calculateLinesOfCode(mockCommits[102]);
      expect(loc2).toBe(130); // 30 + 20 + 40 + 40
    });
  });

  describe('findFirstReviewTime', () => {
    it('첫 번째 리뷰 시간을 정확하게 찾아야 함', () => {
      const firstReviewTime = findFirstReviewTime(mockReviews[101]);
      expect(firstReviewTime).toEqual(new Date('2023-06-12T14:00:00Z'));
    });

    it('리뷰가 없을 경우 undefined를 반환해야 함', () => {
      const firstReviewTime = findFirstReviewTime(mockReviews[103]);
      expect(firstReviewTime).toBeUndefined();
    });
  });

  describe('calculateAverageReviewResponseTime', () => {
    it('평균 리뷰 응답 시간을 정확하게 계산해야 함', () => {
      const avgTime = calculateAverageReviewResponseTime(
        mockPullRequests, 
        { 101: { reviews: mockReviews[101] }, 102: { reviews: mockReviews[102] } }
      );
      
      // PR 101: 2023-06-12T14:00:00Z - 2023-06-10T10:00:00Z = 2일 4시간 = 52시간 = 187,200,000 밀리초
      // PR 102: 2023-06-13T11:00:00Z - 2023-06-12T10:00:00Z = 1일 1시간 = 25시간 = 90,000,000 밀리초
      // 평균: (187,200,000 + 90,000,000) / 2 = 138,600,000 밀리초
      
      // 단순화된 계산 (하루를 정확히 86,400,000 밀리초로 계산)
      const pr1ResponseTime = new Date('2023-06-12T14:00:00Z').getTime() - new Date('2023-06-10T10:00:00Z').getTime();
      const pr2ResponseTime = new Date('2023-06-13T11:00:00Z').getTime() - new Date('2023-06-12T10:00:00Z').getTime();
      const expectedAvgTime = (pr1ResponseTime + pr2ResponseTime) / 2;
      
      expect(avgTime).toBeCloseTo(expectedAvgTime, -4); // 소수점 4자리 오차 허용
    });
  });

  describe('calculateAveragePRCycleTime', () => {
    it('평균 PR 사이클 타임을 정확하게 계산해야 함', () => {
      const avgCycleTime = calculateAveragePRCycleTime(mockPullRequests);
      
      // PR 101: 2023-06-15T15:00:00Z - 2023-06-10T10:00:00Z = 5일 5시간 = 125시간
      // PR 102: 2023-06-14T15:00:00Z - 2023-06-12T10:00:00Z = 2일 5시간 = 53시간
      // PR 103: 아직 열려있어 계산에서 제외
      // 평균: (125시간 + 53시간) / 2 = 89시간
      
      // 단순화된 계산 (하루를 정확히 86,400,000 밀리초로 계산)
      const pr1CycleTime = new Date('2023-06-15T15:00:00Z').getTime() - new Date('2023-06-10T10:00:00Z').getTime();
      const pr2CycleTime = new Date('2023-06-14T15:00:00Z').getTime() - new Date('2023-06-12T10:00:00Z').getTime();
      const expectedAvgCycleTime = (pr1CycleTime + pr2CycleTime) / 2;
      
      expect(avgCycleTime).toBeCloseTo(expectedAvgCycleTime, -4); // 소수점 4자리 오차 허용
    });
  });

  describe('calculateDeploymentFrequency', () => {
    it('선택 기간 내 배포 빈도를 정확하게 계산해야 함', () => {
      const startDate = new Date('2023-06-10T00:00:00Z');
      const endDate = new Date('2023-06-15T00:00:00Z');
      
      const frequency = calculateDeploymentFrequency(mockDeployments, startDate, endDate);
      
      // 2023-06-10 ~ 2023-06-15는 5일 기간
      // 이 기간 내에 2개의 배포가 있음 => 2/5 = 0.4 (일당 배포 횟수)
      expect(frequency).toBeCloseTo(0.4, 2);
    });
    
    it('기간 외 배포는 계산하지 않아야 함', () => {
      const startDate = new Date('2023-06-15T00:00:00Z');
      const endDate = new Date('2023-06-17T00:00:00Z');
      
      const frequency = calculateDeploymentFrequency(mockDeployments, startDate, endDate);
      
      // 2023-06-15 ~ 2023-06-17는 2일 기간
      // 이 기간 내에 1개의 배포가 있음 => 1/2 = 0.5 (일당 배포 횟수)
      expect(frequency).toBeCloseTo(0.5, 2);
    });
    
    it('기간이 0일 경우 0을 반환해야 함', () => {
      const sameDate = new Date('2023-06-15T00:00:00Z');
      
      const frequency = calculateDeploymentFrequency(mockDeployments, sameDate, sameDate);
      
      expect(frequency).toBe(0);
    });
  });
  
  describe('calculateChangeFailureRate', () => {
    it('결함률을 정확하게 계산해야 함', () => {
      const failureRate = calculateChangeFailureRate(mockDeployments);
      
      // 전체 3개 배포 중 1개에 문제 발생 => 33.33%
      expect(failureRate).toBeCloseTo(33.33, 1);
    });
    
    it('배포가 없을 경우 0을 반환해야 함', () => {
      const failureRate = calculateChangeFailureRate([]);
      
      expect(failureRate).toBe(0);
    });
  });

  describe('calculateMetrics', () => {
    it('모든 메트릭을 정확하게 계산해야 함', () => {
      const metrics = calculateMetrics(mockPullRequests, mockPrDetails, mockDeployments);
      
      // PR 개수
      expect(metrics.prCount).toBe(3);
      
      // 코드 변경량: 150 + 130 + 200 = 480
      expect(metrics.totalLinesOfCode).toBe(480);
      
      // 배포 빈도 및 결함률도 계산되어야 함
      expect(metrics.deploymentFrequency).toBeDefined();
      expect(metrics.changeFailureRate).toBeCloseTo(33.33, 1);
      
      // 리뷰 응답 시간 및 사이클 타임은 이전 테스트와 동일
      expect(metrics.avgReviewResponseTime).toBeGreaterThan(0);
      expect(metrics.avgPRCycleTime).toBeGreaterThan(0);
    });
    
    it('배포 데이터가 없을 경우에도 다른 메트릭이 계산되어야 함', () => {
      const metrics = calculateMetrics(mockPullRequests, mockPrDetails);
      
      expect(metrics.prCount).toBe(3);
      expect(metrics.totalLinesOfCode).toBe(480);
      expect(metrics.deploymentFrequency).toBe(0);
      expect(metrics.changeFailureRate).toBe(0);
    });
  });
});

// 테스트가 10초 이상 걸릴 수 있으므로 타임아웃 설정
describe('Facebook React 저장소 메트릭스 테스트', () => {
  it('facebook/react 저장소의 2025년 2월 1일부터 오늘까지의 지표를 계산합니다', async () => {
    // Facebook React 저장소 정보
    const owner = 'facebook';
    const repo = 'react';
    
    // 기간 설정: 2025년 2월 1일부터 오늘까지
    const since = '2025-02-01T00:00:00Z';
    const until = new Date().toISOString();
    
    console.log(`${owner}/${repo} 저장소의 ${since} ~ ${until} 기간 메트릭스 조회 중...`);
    
    try {
      // PR 데이터 가져오기
      const pullRequests = await fetchPullRequests(owner, repo, since, until);
      console.log(`가져온 PR 개수: ${pullRequests.length}`);
      
      // PR 상세 정보 가져오기
      const prDetails: Record<number, { reviews: any[], commits: any[] }> = {};
      
      // 시간 단축을 위해 최대 10개의 PR만 상세 조회
      const limitedPRs = pullRequests.slice(0, 10);
      
      for (const pr of limitedPRs) {
        const prNumber = pr.number;
        
        // 리뷰 및 커밋 데이터 가져오기
        const [reviews, commits] = await Promise.all([
          fetchPullRequestReviews(owner, repo, prNumber),
          fetchPullRequestCommits(owner, repo, prNumber)
        ]);
        
        // 커밋 상세 정보 가져오기
        const commitDetails = await Promise.all(
          commits.map(commit => fetchCommitDetails(owner, repo, commit.sha))
        );
        
        // 결과 저장
        prDetails[prNumber] = {
          reviews,
          commits: commitDetails
        };
        
        console.log(`PR #${prNumber} 상세 정보 처리 완료`);
      }
      
      // 배포 데이터 가져오기
      const deployments = await fetchDeployments(owner, repo);
      
      // 메트릭스 계산
      const metrics = calculateMetrics(pullRequests, prDetails, deployments);
      
      // 결과 출력
      console.log('\n====== 측정 결과 ======');
      console.log(`1. PR 개수: ${metrics.prCount}개`);
      console.log(`2. 코드 변경량: ${metrics.totalLinesOfCode}줄`);
      console.log(`3. 평균 리뷰 응답 시간: ${(metrics.avgReviewResponseTime / (1000 * 60 * 60)).toFixed(2)}시간`);
      console.log(`4. 평균 PR 사이클 타임: ${(metrics.avgPRCycleTime / (1000 * 60 * 60)).toFixed(2)}시간`);
      console.log(`5. 배포 빈도: ${metrics.deploymentFrequency?.toFixed(4) || '측정 불가'} 회/일`);
      console.log(`6. 결함률: ${metrics.changeFailureRate?.toFixed(2) || '측정 불가'}%`);
      
      // 테스트 통과 조건 (메트릭스 값이 존재하는지 확인)
      expect(metrics.prCount).toBeGreaterThanOrEqual(0);
      expect(metrics.totalLinesOfCode).toBeGreaterThanOrEqual(0);
      
    } catch (error) {
      console.error('메트릭스 계산 오류:', error);
      throw error; // 테스트 실패 처리
    }
  }, 60000); // 60초 타임아웃 설정
}); 