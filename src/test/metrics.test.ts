import { describe, it, expect } from 'vitest';
import { 
  calculatePRCount, 
  calculateLinesOfCode, 
  findFirstReviewTime, 
  calculateAverageReviewResponseTime, 
  calculateAveragePRCycleTime,
  calculateMetrics
} from '../lib/metrics';
import { PullRequest, Review, Commit } from '../api/github';

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

  describe('calculateMetrics', () => {
    it('모든 메트릭을 정확하게 계산해야 함', () => {
      const metrics = calculateMetrics(mockPullRequests, mockPrDetails);
      
      // PR 개수
      expect(metrics.prCount).toBe(3);
      
      // 코드 변경량: 150 + 130 + 200 = 480
      expect(metrics.totalLinesOfCode).toBe(480);
      
      // 리뷰 응답 시간 및 사이클 타임은 이전 테스트와 동일
      expect(metrics.avgReviewResponseTime).toBeGreaterThan(0);
      expect(metrics.avgPRCycleTime).toBeGreaterThan(0);
    });
  });
}); 