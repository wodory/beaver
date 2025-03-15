import { describe, expect, it, vi, beforeEach } from 'vitest';
import { 
  fetchPullRequests, 
  fetchPullRequestReviews, 
  fetchPullRequestCommits, 
  fetchCommitDetails 
} from '../api/github';

// Octokit 모듈을 모킹
vi.mock('@octokit/rest', () => {
  return {
    Octokit: vi.fn().mockImplementation(() => ({
      pulls: {
        list: vi.fn().mockResolvedValue({
          data: [
            {
              id: 1,
              number: 101,
              title: '테스트 PR',
              user: { login: 'testuser' },
              created_at: '2023-06-15T10:00:00Z',
              merged_at: '2023-06-16T15:30:00Z',
              closed_at: '2023-06-16T15:30:00Z',
              state: 'closed',
              html_url: 'https://github.com/test/repo/pull/101'
            },
            {
              id: 2,
              number: 102,
              title: '오래된 PR',
              user: { login: 'olduser' },
              created_at: '2022-01-01T10:00:00Z',
              merged_at: null,
              closed_at: null,
              state: 'open',
              html_url: 'https://github.com/test/repo/pull/102'
            }
          ]
        }),
        listReviews: vi.fn().mockResolvedValue({
          data: [
            {
              id: 1001,
              user: { login: 'reviewer1' },
              state: 'APPROVED',
              submitted_at: '2023-06-16T12:00:00Z',
              body: '좋은 PR입니다!'
            }
          ]
        }),
        listCommits: vi.fn().mockResolvedValue({
          data: [
            {
              sha: 'abc123',
              commit: {
                message: '테스트 커밋',
                author: {
                  name: 'Test User',
                  date: '2023-06-15T11:00:00Z'
                }
              }
            }
          ]
        }),
        listComments: vi.fn().mockResolvedValue({
          data: [
            {
              id: 2001,
              user: { login: 'commenter1' },
              created_at: '2023-06-16T11:30:00Z',
              body: '코멘트 테스트'
            }
          ]
        })
      },
      repos: {
        getCommit: vi.fn().mockResolvedValue({
          data: {
            sha: 'abc123',
            commit: {
              message: '테스트 커밋',
              author: {
                name: 'Test User',
                date: '2023-06-15T11:00:00Z'
              }
            },
            stats: {
              additions: 10,
              deletions: 5,
              total: 15
            }
          }
        })
      }
    }))
  };
});

describe('Github API 모듈', () => {
  // 각 테스트 전에 모킹된 함수 초기화
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchPullRequests', () => {
    it('지정된 기간의 PR을 필터링하여 반환해야 함', async () => {
      const result = await fetchPullRequests('test', 'repo', '2023-01-01', '2023-12-31');
      
      // 2023년 내의 PR만 필터링되어야 함
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
      expect(result[0].title).toBe('테스트 PR');
    });
  });

  describe('fetchPullRequestReviews', () => {
    it('PR에 대한 리뷰를 가져와야 함', async () => {
      const reviews = await fetchPullRequestReviews('test', 'repo', 101);
      
      expect(reviews.length).toBe(1);
      expect(reviews[0].id).toBe(1001);
      expect(reviews[0].state).toBe('APPROVED');
    });
  });

  describe('fetchPullRequestCommits', () => {
    it('PR에 포함된 커밋을 가져와야 함', async () => {
      const commits = await fetchPullRequestCommits('test', 'repo', 101);
      
      expect(commits.length).toBe(1);
      expect(commits[0].sha).toBe('abc123');
      expect(commits[0].commit.message).toBe('테스트 커밋');
    });
  });

  describe('fetchCommitDetails', () => {
    it('커밋의 상세 정보를 가져와야 함', async () => {
      const commit = await fetchCommitDetails('test', 'repo', 'abc123');
      
      expect(commit.sha).toBe('abc123');
      expect(commit.stats).toBeDefined();
      expect(commit.stats?.additions).toBe(10);
      expect(commit.stats?.deletions).toBe(5);
    });
  });
}); 