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

// Zustand 스토어 선택적으로 모킹
const mockSetStartDate = vi.fn();
const mockSetEndDate = vi.fn();
const mockSetSelectedRepo = vi.fn();
const mockLoadMetrics = vi.fn();

// 스토어 상태를 초기화하는 헬퍼 함수
const resetStore = () => {
  const store = useStore.getState();
  store.setStartDate(null);
  store.setEndDate(null);
  store.setSelectedRepo(null);
};

describe('필터링 및 날짜 선택 기능 테스트', () => {
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
      },
      {
        id: 2,
        number: 102,
        title: 'Test PR 2',
        user: { login: 'user2' },
        created_at: '2023-04-03T10:00:00Z',
        merged_at: null,
        closed_at: '2023-04-04T10:00:00Z',
        state: 'closed',
        html_url: 'https://github.com/owner/repo/pull/102'
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

  it('날짜 및 저장소 선택 상태 변경이 올바르게 작동하는지 확인', () => {
    // 초기 상태 확인
    const initialState = useStore.getState();
    expect(initialState.startDate).toBeNull();
    expect(initialState.endDate).toBeNull();
    expect(initialState.selectedRepo).toBeNull();
    
    // 시작일 설정
    const startDate = new Date('2023-04-01');
    useStore.getState().setStartDate(startDate);
    
    // 상태 업데이트 확인
    expect(useStore.getState().startDate).toEqual(startDate);
    
    // 종료일 설정
    const endDate = new Date('2023-04-30');
    useStore.getState().setEndDate(endDate);
    
    // 상태 업데이트 확인
    expect(useStore.getState().endDate).toEqual(endDate);
    
    // 저장소 선택
    useStore.getState().setSelectedRepo('owner/repo');
    
    // 상태 업데이트 확인
    expect(useStore.getState().selectedRepo).toBe('owner/repo');
  });

  it('필터 변경 후 loadMetrics 함수가 올바르게 API를 호출하는지 확인', async () => {
    // 필터 설정
    const startDate = new Date('2023-04-01');
    const endDate = new Date('2023-04-30');
    const repo = 'owner/repo';
    
    // 상태 설정
    const store = useStore.getState();
    store.setStartDate(startDate);
    store.setEndDate(endDate);
    store.setSelectedRepo(repo);
    
    // loadMetrics 함수 호출
    await store.loadMetrics(startDate, endDate, repo);
    
    // API 호출 확인
    expect(githubApi.fetchPullRequests).toHaveBeenCalledWith('owner', 'repo', startDate.toISOString(), endDate.toISOString());
    
    // 상태 업데이트 확인
    const updatedState = useStore.getState();
    expect(updatedState.isLoading).toBe(false);
    expect(updatedState.error).toBeNull();
    
    // 계산된 메트릭스 확인
    expect(updatedState.leadTimeForChanges).not.toBeNull();
    expect(updatedState.deploymentFrequency).not.toBeNull();
    expect(updatedState.changeFailureRate).not.toBeNull();
  });

  it('필터 변경 시 API 오류가 올바르게 처리되는지 확인', async () => {
    // API 오류 모킹
    vi.mocked(githubApi.fetchPullRequests).mockRejectedValueOnce(new Error('API Error'));
    
    // 필터 설정
    const startDate = new Date('2023-04-01');
    const endDate = new Date('2023-04-30');
    const repo = 'owner/repo';
    
    // loadMetrics 함수 호출
    await useStore.getState().loadMetrics(startDate, endDate, repo);
    
    // 오류 상태 확인
    const updatedState = useStore.getState();
    expect(updatedState.isLoading).toBe(false);
    expect(updatedState.error).not.toBeNull();
    expect(updatedState.error).toContain('오류가 발생했습니다');
  });
}); 