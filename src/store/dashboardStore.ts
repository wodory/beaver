import { create } from 'zustand'
import { 
  fetchPullRequests, 
  fetchPullRequestReviews, 
  fetchPullRequestCommits,
  fetchCommitDetails,
  PullRequest,
  Review,
  Commit
} from '../api/github';
import { Repository, TimeRange } from '../types/github';

interface DashboardState {
  // 기본 상태
  isLoading: boolean;
  error: string | null;
  repositories: Repository[];
  selectedRepository: Repository | null;
  timeRange: TimeRange;
  
  // 데이터 상태
  pullRequests: PullRequest[];
  pullRequestsWithDetails: Record<number, {
    reviews: Review[];
    commits: Commit[];
  }>;
  
  // 액션
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setRepositories: (repositories: Repository[]) => void;
  setSelectedRepository: (repository: Repository | null) => void;
  setTimeRange: (timeRange: TimeRange) => void;
  fetchPullRequestsData: () => Promise<void>;
  fetchPullRequestDetails: (pullNumber: number) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // 초기 상태
  isLoading: false,
  error: null,
  repositories: [],
  selectedRepository: null,
  timeRange: {
    since: '2023-01-01',
    until: '2023-12-31'
  },
  pullRequests: [],
  pullRequestsWithDetails: {},
  
  // 액션
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setRepositories: (repositories) => set({ repositories }),
  setSelectedRepository: (repository) => set({ selectedRepository: repository }),
  setTimeRange: (timeRange) => set({ timeRange }),
  
  // GitHub 데이터 가져오기
  fetchPullRequestsData: async () => {
    const { selectedRepository, timeRange } = get();
    
    if (!selectedRepository) {
      set({ error: '저장소가 선택되지 않았습니다.' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const pullRequests = await fetchPullRequests(
        selectedRepository.owner,
        selectedRepository.name,
        timeRange.since,
        timeRange.until
      );
      
      set({ pullRequests, isLoading: false });
    } catch (error) {
      console.error('PR 데이터 가져오기 실패:', error);
      set({ 
        error: error instanceof Error ? error.message : '데이터를 가져오는 중 오류가 발생했습니다.',
        isLoading: false
      });
    }
  },
  
  // 특정 PR의 상세 정보 가져오기 (리뷰 및 커밋)
  fetchPullRequestDetails: async (pullNumber: number) => {
    const { selectedRepository, pullRequestsWithDetails } = get();
    
    if (!selectedRepository) {
      set({ error: '저장소가 선택되지 않았습니다.' });
      return;
    }
    
    // 이미 상세 정보가 있으면 다시 가져오지 않음
    if (pullRequestsWithDetails[pullNumber]) {
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // 병렬로 리뷰와 커밋 데이터 가져오기
      const [reviews, commits] = await Promise.all([
        fetchPullRequestReviews(selectedRepository.owner, selectedRepository.name, pullNumber),
        fetchPullRequestCommits(selectedRepository.owner, selectedRepository.name, pullNumber),
      ]);
      
      // 각 커밋에 대한 상세 정보 가져오기 (변경된 라인 수 등)
      const commitsWithDetails = await Promise.all(
        commits.map(async (commit) => {
          const details = await fetchCommitDetails(
            selectedRepository.owner,
            selectedRepository.name,
            commit.sha
          );
          return details;
        })
      );
      
      // 상태 업데이트
      set({
        pullRequestsWithDetails: {
          ...pullRequestsWithDetails,
          [pullNumber]: {
            reviews,
            commits: commitsWithDetails
          }
        },
        isLoading: false
      });
    } catch (error) {
      console.error(`PR #${pullNumber} 상세 정보 가져오기 실패:`, error);
      set({ 
        error: error instanceof Error ? error.message : '상세 정보를 가져오는 중 오류가 발생했습니다.',
        isLoading: false
      });
    }
  }
})) 