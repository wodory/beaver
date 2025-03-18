import { create } from 'zustand';
import { fetchTeams, fetchTeamMetrics } from '../api/client';
import { TeamMetrics } from '../types/metrics';
import { clearCacheByPrefix } from '../utils/cache';

export interface TeamState {
  // 팀 목록 관련 상태
  teams: Array<{ id: string; name: string; memberCount: number; description?: string }>;
  isTeamsLoading: boolean;
  teamsError: string | null;
  
  // 선택된 팀 관련 상태
  selectedTeamId: string | null;
  selectedTeamName: string | null;
  
  // 팀 메트릭스 관련 상태
  teamMetrics: TeamMetrics | null;
  isMetricsLoading: boolean;
  metricsError: string | null;
  
  // 필터링 관련 상태
  startDate: Date;
  endDate: Date;
  
  // 마지막 업데이트 시간
  lastUpdated: Date | null;
  
  // 액션 함수들
  loadTeams: (forceRefresh?: boolean) => Promise<void>;
  selectTeam: (teamId: string, teamName: string) => void;
  loadTeamMetrics: (forceRefresh?: boolean) => Promise<void>;
  setDateRange: (startDate: Date, endDate: Date) => void;
  refreshData: () => Promise<void>;
  clearCache: () => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  // 초기 상태
  teams: [],
  isTeamsLoading: false,
  teamsError: null,
  
  selectedTeamId: null,
  selectedTeamName: null,
  
  teamMetrics: null,
  isMetricsLoading: false,
  metricsError: null,
  
  startDate: (() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3); // 기본값: 최근 3개월
    return date;
  })(),
  endDate: new Date(),
  
  lastUpdated: null,
  
  // 팀 목록 로드 액션
  loadTeams: async (forceRefresh = false) => {
    const state = get();
    
    // 이미 로드 중이면 중복 로드 방지
    if (state.isTeamsLoading) return;
    
    set({ isTeamsLoading: true, teamsError: null });
    
    try {
      const teams = await fetchTeams(forceRefresh);
      set({ 
        teams,
        isTeamsLoading: false,
        lastUpdated: new Date()
      });
    } catch (error: any) {
      console.error('팀 목록 로드 오류:', error);
      set({ 
        isTeamsLoading: false,
        teamsError: error.message || '팀 목록을 불러오는 중 오류가 발생했습니다.' 
      });
    }
  },
  
  // 팀 선택 액션
  selectTeam: (teamId: string, teamName: string) => {
    // 이미 선택된 팀이면 중복 선택 방지
    if (get().selectedTeamId === teamId) return;
    
    set({ 
      selectedTeamId: teamId,
      selectedTeamName: teamName,
      // 새 팀을 선택하면 이전 메트릭스 데이터 초기화
      teamMetrics: null
    });
    
    // 선택된 팀의 메트릭스 자동 로드
    get().loadTeamMetrics();
  },
  
  // 팀 메트릭스 로드 액션
  loadTeamMetrics: async (forceRefresh = false) => {
    const state = get();
    
    // 선택된 팀이 없거나 이미 로드 중이면 중복 로드 방지
    if (!state.selectedTeamId || state.isMetricsLoading) return;
    
    set({ isMetricsLoading: true, metricsError: null });
    
    try {
      const metrics = await fetchTeamMetrics(
        state.selectedTeamId,
        state.startDate,
        state.endDate,
        forceRefresh
      );
      
      set({ 
        teamMetrics: metrics,
        isMetricsLoading: false,
        lastUpdated: new Date()
      });
    } catch (error: any) {
      console.error('팀 메트릭스 로드 오류:', error);
      set({ 
        isMetricsLoading: false,
        metricsError: error.message || '팀 메트릭스를 불러오는 중 오류가 발생했습니다.' 
      });
    }
  },
  
  // 날짜 범위 설정 액션
  setDateRange: (startDate: Date, endDate: Date) => {
    // 날짜가 변경되지 않았으면 중복 설정 방지
    if (
      startDate.getTime() === get().startDate.getTime() && 
      endDate.getTime() === get().endDate.getTime()
    ) {
      return;
    }
    
    set({ startDate, endDate });
    
    // 선택된 팀이 있으면 새 날짜 범위로 메트릭스 다시 로드
    if (get().selectedTeamId) {
      get().loadTeamMetrics();
    }
  },
  
  // 모든 데이터 새로고침 액션
  refreshData: async () => {
    await get().loadTeams(true);
    
    if (get().selectedTeamId) {
      await get().loadTeamMetrics(true);
    }
    
    set({ lastUpdated: new Date() });
  },
  
  // 캐시 초기화 액션
  clearCache: () => {
    clearCacheByPrefix('beaver_cache_');
    console.log('캐시가 초기화되었습니다.');
  }
})); 