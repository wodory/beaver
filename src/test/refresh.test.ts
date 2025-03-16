import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useStore } from '../store/dashboardStore';
import * as githubApi from '../api/github';

// GitHub API 모킹
vi.mock('../api/github', () => ({
  fetchPullRequests: vi.fn(),
  fetchPullRequestReviews: vi.fn(),
  fetchPullRequestCommits: vi.fn(),
  fetchCommitDetails: vi.fn(),
  fetchDeployments: vi.fn()
}));

// 스토어 상태를 초기화하는 헬퍼 함수
const resetStore = () => {
  const store = useStore.getState();
  store.setStartDate(null);
  store.setEndDate(null);
  store.setSelectedRepo(null);
};

describe('데이터 갱신 기능 테스트', () => {
  beforeEach(() => {
    // 모킹된 함수들의 반환값 설정
    vi.mocked(githubApi.fetchPullRequests).mockResolvedValue([
      {
        id: 1,
        number: 101,
        title: 'Test PR 1',
        user: { login: 'user1' },
        created_at: '2023-04-01T10:00:00Z',
        merged_at: '2023-04-02T10:00:00Z',
        closed_at: null,
        state: 'merged',
        html_url: 'https://github.com/owner/repo/pull/101'
      }
    ]);

    vi.mocked(githubApi.fetchPullRequestReviews).mockResolvedValue([
      {
        id: 1,
        user: { login: 'reviewer1' },
        state: 'APPROVED',
        submitted_at: '2023-04-01T15:00:00Z',
        body: 'LGTM!'
      }
    ]);

    vi.mocked(githubApi.fetchPullRequestCommits).mockResolvedValue([
      {
        sha: 'abc123',
        commit: {
          message: 'Test commit',
          author: {
            name: 'Test Author',
            date: '2023-04-01T12:00:00Z'
          }
        }
      }
    ]);

    vi.mocked(githubApi.fetchCommitDetails).mockResolvedValue({
      sha: 'abc123',
      commit: {
        message: 'Test commit',
        author: {
          name: 'Test Author',
          date: '2023-04-01T12:00:00Z'
        }
      },
      stats: {
        additions: 10,
        deletions: 5,
        total: 15
      }
    });

    vi.mocked(githubApi.fetchDeployments).mockResolvedValue([
      {
        id: 1,
        repository: 'owner/repo',
        environment: 'production',
        created_at: '2023-04-02T14:00:00Z',
        completed_at: '2023-04-02T14:30:00Z',
        status: 'success',
        has_issues: false,
        created_by: 'user1'
      }
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it('데이터 새로고침 시 loadEvents가 호출되는지 확인', async () => {
    // 스파이 생성
    const loadEventsSpy = vi.spyOn(useStore.getState(), 'loadEvents');
    
    // refreshData 호출
    await useStore.getState().refreshData();
    
    // loadEvents 호출 확인
    expect(loadEventsSpy).toHaveBeenCalledTimes(1);
  });

  it('저장소가 선택된 상태에서 갱신 시 적절한 API가 호출되는지 확인', async () => {
    // 상태 설정
    const store = useStore.getState();
    store.setSelectedRepo('owner/repo');
    
    // refreshData 호출
    await store.refreshData();
    
    // API 호출 확인
    const [owner, repo] = 'owner/repo'.split('/');
    expect(githubApi.fetchDeployments).toHaveBeenCalledWith(owner, repo);
  });

  it('시작일, 종료일, 저장소가 모두 선택된 상태에서 갱신 시 loadMetrics가 호출되는지 확인', async () => {
    // 스파이 생성
    const loadMetricsSpy = vi.spyOn(useStore.getState(), 'loadMetrics');
    
    // 상태 설정
    const store = useStore.getState();
    const startDate = new Date('2023-04-01');
    const endDate = new Date('2023-04-30');
    const repo = 'owner/repo';
    
    store.setStartDate(startDate);
    store.setEndDate(endDate);
    store.setSelectedRepo(repo);
    
    // refreshData 호출
    await store.refreshData();
    
    // loadMetrics 호출 확인
    expect(loadMetricsSpy).toHaveBeenCalledWith(startDate, endDate, repo);
  });

  it('데이터 갱신 후 lastUpdated가 업데이트되는지 확인', async () => {
    // 현재 lastUpdated 값 저장
    const oldLastUpdated = useStore.getState().lastUpdated;
    
    // 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // refreshData 호출
    await useStore.getState().refreshData();
    
    // lastUpdated 확인
    const newLastUpdated = useStore.getState().lastUpdated;
    expect(newLastUpdated).not.toBeNull();
    expect(newLastUpdated instanceof Date).toBe(true);
    
    // 이전 값과 다른지 확인
    if (oldLastUpdated) {
      expect(newLastUpdated?.getTime()).toBeGreaterThan(oldLastUpdated.getTime());
    }
  });

  it('갱신 중에는 isLoading이 true로 설정되는지 확인', async () => {
    // loadEvents를 느리게 실행하도록 모킹
    vi.spyOn(useStore.getState(), 'loadEvents').mockImplementation(async () => {
      useStore.setState({ isLoading: true });
      await new Promise(resolve => setTimeout(resolve, 100));
      useStore.setState({ isLoading: false, lastUpdated: new Date() });
    });
    
    // refreshData 호출
    const refreshPromise = useStore.getState().refreshData();
    
    // isLoading 상태 확인
    expect(useStore.getState().isLoading).toBe(true);
    
    // 완료 대기
    await refreshPromise;
    
    // 완료 후 상태 확인
    expect(useStore.getState().isLoading).toBe(false);
  });
}); 