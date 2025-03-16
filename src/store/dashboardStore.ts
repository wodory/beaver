import { create } from 'zustand'
import { 
  fetchPullRequests, 
  fetchPullRequestReviews, 
  fetchPullRequestCommits,
  fetchCommitDetails,
  fetchDeployments,
  PullRequest,
  Review,
  Commit
} from '../api/github';
import { Repository, TimeRange, MetricsResult, DeploymentEvent } from '../types/github';
import { calculateMetrics } from '../lib/metrics';
import config from '../config.json';
import { eachDayOfInterval, startOfDay, isSameDay, format } from 'date-fns';

// 캐시 관련 상수 및 유틸리티 함수
const CACHE_PREFIX = 'beaver_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24시간 (밀리초)

// 기본 날짜 설정
const defaultStartDate = new Date(config.defaultTimeRange?.since || '2024-01-01');
const defaultEndDate = new Date(config.defaultTimeRange?.until || '2025-03-16');

// 캐시 키 생성 함수
const generateCacheKey = (startDate: Date, endDate: Date, repo: string | null): string => {
  if (!repo) return '';
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');
  return `${CACHE_PREFIX}${repo}_data_${startStr}_${endStr}`;
};

// 캐시 데이터 저장 함수
const saveToCache = (key: string, data: any) => {
  if (!key) return;
  
  const cacheData = {
    timestamp: new Date().toISOString(),
    data
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(cacheData));
    console.log(`캐시 저장 완료: ${key}`);
  } catch (error) {
    console.error('캐시 저장 오류:', error);
  }
};

// 캐시 데이터 가져오기 함수
const getFromCache = (key: string) => {
  if (!key) return null;
  
  try {
    const cacheData = localStorage.getItem(key);
    if (!cacheData) return null;
    
    const parsedData = JSON.parse(cacheData);
    
    // 캐시 만료 확인
    const timestamp = new Date(parsedData.timestamp).getTime();
    const now = new Date().getTime();
    
    if (now - timestamp > CACHE_EXPIRY) {
      console.log(`캐시 만료: ${key}`);
      localStorage.removeItem(key);
      return null;
    }
    
    return parsedData;
  } catch (error) {
    console.error('캐시 가져오기 오류:', error);
    return null;
  }
};

// 모든 캐시 데이터 삭제 함수
const clearAllCache = () => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('모든 캐시 삭제 완료');
  } catch (error) {
    console.error('캐시 삭제 오류:', error);
  }
};

// 테스트 모드 감지 함수
const isTestDataMode = (repo: string, start: Date, end: Date): boolean => {
  // 시작일이 2024-01-01인 경우 테스트 데이터 모드로 간주
  return start.getFullYear() === 2024 && start.getMonth() === 0 && start.getDate() === 1;
};

// 테스트 데이터 생성 함수
const createDefaultTestData = (repo: string, startDate: Date, endDate: Date) => {
  console.log(`📊 테스트 모드를 위한 기본 데이터를 자동 생성합니다: ${repo}`);
  
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');
  
  // 키 생성
  const leadTimeKey = `beaver_${repo}_lead_time_${startStr}_${endStr}`;
  const mttrKey = `beaver_${repo}_mttr_${startStr}_${endStr}`;
  const dfKey = `beaver_${repo}_deployment_frequency_${startStr}_${endStr}`;
  const cfrKey = `beaver_${repo}_change_failure_rate_${startStr}_${endStr}`;
  const metricsKey = `beaver_${repo}_metrics_${startStr}_${endStr}`;
  const deploymentsKey = `beaver_${repo}_deployments_${startStr}_${endStr}`;
  const incidentsKey = `beaver_${repo}_incidents_${startStr}_${endStr}`;
  
  // 이미 데이터가 있는지 확인
  if (localStorage.getItem(leadTimeKey) || 
      localStorage.getItem(mttrKey) || 
      localStorage.getItem(dfKey) || 
      localStorage.getItem(cfrKey)) {
    console.log('기존 테스트 데이터가 발견되었습니다. 자동 생성을 건너뜁니다.');
    return;
  }
  
  // 날짜 범위 생성 (30일)
  const days = 30;
  const leadTimeData = [];
  const mttrData = [];
  const deploymentFrequencyData = [];
  const changeFailureRateData = [];
  
  const endDateValue = new Date(endDate);
  const startDateValue = new Date(endDateValue);
  startDateValue.setDate(endDateValue.getDate() - days);
  
  // 날짜 배열 생성
  const dateRange = eachDayOfInterval({ start: startDateValue, end: endDateValue });
  
  // 1. 리드 타임 데이터 생성
  for (const date of dateRange) {
    leadTimeData.push({
      date: format(date, 'yyyy-MM-dd'),
      leadTime: 10 + Math.random() * 20 // 10~30 시간 사이 랜덤 값
    });
  }
  
  // 2. MTTR 데이터 생성
  for (const date of dateRange) {
    mttrData.push({
      date: format(date, 'yyyy-MM-dd'),
      mttr: 1 + Math.random() * 5 // 1~6 시간 사이 랜덤 값
    });
  }
  
  // 3. 배포 빈도 데이터 생성
  for (const date of dateRange) {
    deploymentFrequencyData.push({
      date: format(date, 'yyyy-MM-dd'),
      count: Math.floor(Math.random() * 3) // 0~2 회/일 사이 랜덤 값
    });
  }
  
  // 4. 변경 실패율 데이터 생성
  for (const date of dateRange) {
    changeFailureRateData.push({
      date: format(date, 'yyyy-MM-dd'),
      rate: Math.random() * 20 // 0~20% 사이 랜덤 값
    });
  }
  
  // 5. 메트릭스 요약 데이터
  const metricsData = {
    leadTimeForChanges: 18.5, // 평균 리드 타임 (시간)
    deploymentFrequency: 1.2, // 배포 빈도 (회/일)
    changeFailureRate: 12.5, // 변경 실패율 (%)
    meanTimeToRestore: 3.2, // 평균 복구 시간 (시간)
  };
  
  // 6. 배포 이벤트 데이터
  const deploymentsData = dateRange.map((date, index) => {
    if (Math.random() > 0.7) { // 약 30%의 날짜에만 배포 이벤트 생성
      return {
        timestamp: format(date, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'', { weekStartsOn: 1 }),
        version: `v1.${index % 10}.${Math.floor(Math.random() * 10)}`
      };
    }
    return null;
  }).filter(Boolean);
  
  // 7. 인시던트 데이터
  const incidentsData = dateRange.map((date, index) => {
    if (Math.random() > 0.9) { // 약 10%의 날짜에만 인시던트 생성
      const startTime = new Date(date);
      startTime.setHours(Math.floor(Math.random() * 12) + 8); // 8AM~8PM 사이
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 6) + 1); // 1~6시간 지속
      
      return {
        start: format(startTime, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
        end: format(endTime, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
      };
    }
    return null;
  }).filter(Boolean);
  
  // 데이터 저장
  try {
    localStorage.setItem(leadTimeKey, JSON.stringify(leadTimeData));
    localStorage.setItem(mttrKey, JSON.stringify(mttrData));
    localStorage.setItem(dfKey, JSON.stringify(deploymentFrequencyData));
    localStorage.setItem(cfrKey, JSON.stringify(changeFailureRateData));
    localStorage.setItem(metricsKey, JSON.stringify(metricsData));
    localStorage.setItem(deploymentsKey, JSON.stringify(deploymentsData));
    localStorage.setItem(incidentsKey, JSON.stringify(incidentsData));
    
    console.log('🎉 테스트 데이터가 성공적으로 생성되었습니다.', {
      leadTimeData: leadTimeData.length,
      mttrData: mttrData.length,
      deploymentFrequencyData: deploymentFrequencyData.length,
      changeFailureRateData: changeFailureRateData.length,
      deploymentsData: deploymentsData.length,
      incidentsData: incidentsData.length
    });
    
  } catch (error) {
    console.error('테스트 데이터 생성 중 오류 발생:', error);
  }
};

// 차트 데이터 타입 정의
export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface LeadTimeDataPoint {
  date: string;
  leadTime: number;
  repository?: string;
}

export interface MTTRDataPoint {
  date: string;
  mttr: number;
  repository?: string;
}

export interface DeploymentFrequencyDataPoint {
  date: string;
  count: number;
  repository?: string;
}

export interface ChangeFailureRateDataPoint {
  date: string;
  rate: number;
  repository?: string;
}

// 여러 저장소 데이터를 관리하기 위한 컬렉션 인터페이스
export interface MultiRepoDataCollection {
  leadTimeData: { [repo: string]: LeadTimeDataPoint[] };
  mttrData: { [repo: string]: MTTRDataPoint[] };
  deploymentFrequencyData: { [repo: string]: DeploymentFrequencyDataPoint[] };
  changeFailureRateData: { [repo: string]: ChangeFailureRateDataPoint[] };
}

// 이벤트 인터페이스 정의
export interface Event {
  id: string;
  type: 'deployment' | 'incident' | 'recovery' | 'other';
  timestamp: string;
  description: string;
  repository: string;
}

// 대시보드 상태와 인터페이스를 정의합니다
interface DashboardState {
  // 필터링 상태
  startDate: Date | null;
  endDate: Date | null;
  selectedRepo: string | null;
  repositories: string[];
  
  // 데이터 상태
  events: Event[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null; // 마지막 업데이트 시간
  
  // 계산된 메트릭스
  leadTimeForChanges: number | null;
  deploymentFrequency: number | null;
  changeFailureRate: number | null;
  meanTimeToRestore: number | null;
  
  // 차트 데이터
  leadTimeData: LeadTimeDataPoint[];
  mttrData: MTTRDataPoint[];
  deploymentFrequencyData: DeploymentFrequencyDataPoint[];
  changeFailureRateData: ChangeFailureRateDataPoint[];
  
  // 액션
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setSelectedRepo: (repo: string | null) => void;
  setEvents: (events: Event[]) => void;
  loadEvents: () => Promise<void>;
  loadMetrics: (startDate: Date, endDate: Date, repo: string) => Promise<void>;
  refreshData: () => Promise<void>; // 데이터 새로고침 함수
}

// config.repositories에서 저장소 문자열 목록 추출
const getRepositoryStrings = (): string[] => {
  if (!config.repositories) return ['owner/repo1', 'owner/repo2', 'owner/repo3'];
  
  // 저장소 객체 배열이면 문자열 형식으로 변환 ("owner/name")
  if (Array.isArray(config.repositories)) {
    return config.repositories.map((repo: any) => {
      if (typeof repo === 'string') return repo;
      if (repo && repo.owner && repo.name) return `${repo.owner}/${repo.name}`;
      return 'unknown/repo';
    });
  }
  
  return ['owner/repo1', 'owner/repo2', 'owner/repo3'];
};

// 배포 이벤트를 일반 이벤트로 변환하는 함수
const deploymentToEvent = (deployment: DeploymentEvent): Event => {
  return {
    id: `deployment-${deployment.id}`,
    type: deployment.has_issues ? 'incident' : 'deployment',
    timestamp: deployment.created_at,
    description: `${deployment.has_issues ? '실패한 배포' : '성공한 배포'} (${deployment.environment})`,
    repository: deployment.repository
  };
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // 필터링 상태
  startDate: null,
  endDate: null,
  selectedRepo: null,
  repositories: getRepositoryStrings(), // 문자열 배열로 변환된 저장소 목록
  
  // 데이터 상태
  events: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  
  // 계산된 메트릭스
  leadTimeForChanges: null,
  deploymentFrequency: null,
  changeFailureRate: null,
  meanTimeToRestore: null,
  
  // 차트 데이터 (더미 데이터, 실제 구현 시 API 호출로 변경)
  leadTimeData: [
    { date: '2023-04-01', leadTime: 30.5 },
    { date: '2023-04-02', leadTime: 22.8 },
    { date: '2023-04-03', leadTime: 28.2 },
    { date: '2023-04-04', leadTime: 18.5 },
    { date: '2023-04-05', leadTime: 16.3 },
    { date: '2023-04-06', leadTime: 25.7 },
    { date: '2023-04-07', leadTime: 20.1 }
  ],
  mttrData: [
    { date: '2023-04-01', mttr: 5.2 },
    { date: '2023-04-02', mttr: 3.5 },
    { date: '2023-04-03', mttr: 6.1 },
    { date: '2023-04-04', mttr: 2.4 },
    { date: '2023-04-05', mttr: 3.8 },
    { date: '2023-04-06', mttr: 4.2 },
    { date: '2023-04-07', mttr: 3.0 }
  ],
  deploymentFrequencyData: [],
  changeFailureRateData: [],
  
  // 액션
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setSelectedRepo: (repo) => set({ selectedRepo: repo }),
  setEvents: (events) => set({ events }),
  
  // 이벤트 데이터 로드
  loadEvents: async () => {
    const state = get();
    set({ isLoading: true, error: null });
    
    try {
      // 선택된 저장소가 있으면 해당 저장소의 이벤트만 로드
      if (state.selectedRepo) {
        const [owner, repo] = state.selectedRepo.split('/');
        
        // 배포 데이터 가져오기
        const deployments = await fetchDeployments(owner, repo);
        
        // 이벤트로 변환
        const events = deployments.map(deploymentToEvent);
        
        set({
          events,
          isLoading: false,
          lastUpdated: new Date()
        });
      } else {
        // 선택된 저장소가 없으면 기본 데이터 표시
        const dummyEvents = [
          { 
            id: '1',
            type: 'deployment' as const,
            timestamp: '2023-04-01T10:00:00Z',
            description: '버전 1.2.3 배포',
            repository: 'owner/repo1'
          },
          { 
            id: '2',
            type: 'incident' as const,
            timestamp: '2023-04-03T11:00:00Z',
            description: '서버 오류 발생',
            repository: 'owner/repo1'
          },
          { 
            id: '3',
            type: 'recovery' as const,
            timestamp: '2023-04-03T15:00:00Z',
            description: '서버 오류 복구 완료',
            repository: 'owner/repo1'
          },
          { 
            id: '4',
            type: 'deployment' as const,
            timestamp: '2023-04-05T09:00:00Z',
            description: '버전 1.2.4 배포',
            repository: 'owner/repo1'
          }
        ];
        
        set({
          events: dummyEvents,
          isLoading: false,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('이벤트 데이터 로드 오류:', error);
      set({ 
        error: '이벤트 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.',
        isLoading: false 
      });
    }
  },
  
  // 메트릭스 계산 - 실제 GitHub API 사용
  loadMetrics: async (startDate, endDate, repo) => {
    set({ isLoading: true, error: null });
    
    try {
      // 테스트 데이터 모드인지 확인
      const testMode = isTestDataMode(repo, startDate, endDate);
      if (testMode) {
        console.log('📊 테스트 데이터 모드: loadMetrics에서 GitHub API 호출 생략');
        
        const startStr = format(startDate, 'yyyy-MM-dd');
        const endStr = format(endDate, 'yyyy-MM-dd');
        
        // 주요 지표 데이터 찾기
        const leadTimeKey = `beaver_${repo}_lead_time_${startStr}_${endStr}`;
        const mttrKey = `beaver_${repo}_mttr_${startStr}_${endStr}`;
        const dfKey = `beaver_${repo}_deployment_frequency_${startStr}_${endStr}`;
        const cfrKey = `beaver_${repo}_change_failure_rate_${startStr}_${endStr}`;
        const metricsKey = `beaver_${repo}_metrics_${startStr}_${endStr}`;
        const deploymentsKey = `beaver_${repo}_deployments_${startStr}_${endStr}`;
        const incidentsKey = `beaver_${repo}_incidents_${startStr}_${endStr}`;
        
        try {
          // 테스트 데이터가 있는지 확인
          const leadTimeData = JSON.parse(localStorage.getItem(leadTimeKey) || '[]');
          const mttrData = JSON.parse(localStorage.getItem(mttrKey) || '[]');
          const deploymentFrequencyData = JSON.parse(localStorage.getItem(dfKey) || '[]');
          const changeFailureRateData = JSON.parse(localStorage.getItem(cfrKey) || '[]');
          const metricsData = JSON.parse(localStorage.getItem(metricsKey) || '{}');
          
          // 테스트 데이터가 있으면 적용
          if (leadTimeData.length > 0 || mttrData.length > 0 || deploymentFrequencyData.length > 0 || changeFailureRateData.length > 0) {
            console.log('💾 테스트 데이터 발견, 차트에 적용합니다');
            
            set({
              leadTimeForChanges: metricsData.leadTimeForChanges || 0,
              deploymentFrequency: metricsData.deploymentFrequency || 0,
              changeFailureRate: metricsData.changeFailureRate || 0,
              meanTimeToRestore: metricsData.meanTimeToRestore || 0,
              leadTimeData,
              mttrData,
              deploymentFrequencyData,
              changeFailureRateData,
              isLoading: false,
              lastUpdated: new Date()
            });
            
            return;
          } else {
            console.log('❌ 테스트 데이터 모드이지만 데이터를 찾을 수 없습니다. 기본 테스트 데이터를 자동 생성합니다.');
            
            // 자동으로 테스트 데이터 생성
            createDefaultTestData(repo, startDate, endDate);
            
            // 생성된 데이터 다시 확인
            const autoGenLeadTimeData = JSON.parse(localStorage.getItem(leadTimeKey) || '[]');
            const autoGenMttrData = JSON.parse(localStorage.getItem(mttrKey) || '[]');
            const autoGenDfData = JSON.parse(localStorage.getItem(dfKey) || '[]');
            const autoGenCfrData = JSON.parse(localStorage.getItem(cfrKey) || '[]');
            const autoGenMetricsData = JSON.parse(localStorage.getItem(metricsKey) || '{}');
            
            if (autoGenLeadTimeData.length > 0) {
              console.log('🎉 자동 생성된 테스트 데이터를 적용합니다.');
              
              set({
                leadTimeForChanges: autoGenMetricsData.leadTimeForChanges || 0,
                deploymentFrequency: autoGenMetricsData.deploymentFrequency || 0,
                changeFailureRate: autoGenMetricsData.changeFailureRate || 0,
                meanTimeToRestore: autoGenMetricsData.meanTimeToRestore || 0,
                leadTimeData: autoGenLeadTimeData,
                mttrData: autoGenMttrData,
                deploymentFrequencyData: autoGenDfData,
                changeFailureRateData: autoGenCfrData,
                isLoading: false,
                lastUpdated: new Date()
              });
              
              return;
            }
            
            // 디버깅: 로컬 스토리지의 모든 키 출력
            console.log('로컬 스토리지 내 모든 키:');
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              console.log(`${i}: ${key} (값 존재: ${Boolean(localStorage.getItem(key))})`);
            }
            
            // 디버깅: 찾으려는 키 목록 출력
            console.log('찾으려는 키:', {
              leadTimeKey,
              mttrKey,
              dfKey,
              cfrKey,
              metricsKey,
              deploymentsKey,
              incidentsKey
            });
            
            set({ 
              error: '테스트 데이터를 찾을 수 없습니다. "테스트 데이터 주입" 도구를 사용하여 데이터를 추가해주세요.',
              isLoading: false 
            });
            return;
          }
        } catch (error) {
          console.error('테스트 데이터 처리 오류:', error);
          set({ 
            error: '테스트 데이터 처리 중 오류가 발생했습니다.',
            isLoading: false 
          });
          return;
        }
      }

      // 테스트 모드가 아닌 경우에만 GitHub API 호출 진행
      // 저장소 정보 파싱
      const [owner, repoName] = repo.split('/');
      
      // 날짜를 ISO 형식 문자열로 변환
      const since = startDate.toISOString();
      const until = endDate.toISOString();
      
      // PR 데이터 가져오기
      const pullRequests = await fetchPullRequests(owner, repoName, since, until);
      
      // PR 상세 정보 가져오기
      const prDetails: Record<number, { reviews: Review[], commits: Commit[] }> = {};
      
      // 병렬 처리를 위한 프로미스 배열
      const promises = pullRequests.map(async (pr) => {
        const prNumber = pr.number;
        
        // 리뷰 및 커밋 데이터 병렬로 가져오기
        const [reviews, commits] = await Promise.all([
          fetchPullRequestReviews(owner, repoName, prNumber),
          fetchPullRequestCommits(owner, repoName, prNumber)
        ]);
        
        // 커밋 상세 정보 가져오기
        const commitDetailsPromises = commits.map(commit => 
          fetchCommitDetails(owner, repoName, commit.sha)
        );
        const commitDetails = await Promise.all(commitDetailsPromises);
        
        // 결과 저장
        prDetails[prNumber] = {
          reviews,
          commits: commitDetails
        };
      });
      
      // 모든 PR 데이터 가져오기 완료 대기
      await Promise.all(promises);
      
      // 배포 데이터 가져오기
      const deployments = await fetchDeployments(owner, repoName);
      
      // 메트릭스 계산
      const metrics = calculateMetrics(pullRequests, prDetails, deployments);
      
      // 차트 데이터 생성 (시간별 데이터)
      // 선택된 기간의 모든 날짜 배열 생성
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      // 리드 타임 데이터 생성
      const leadTimeData = dateRange.map(date => {
        // 해당 날짜의 PR들 필터링
        const dayPRs = pullRequests.filter(pr => {
          const prCreatedDate = startOfDay(new Date(pr.created_at));
          return isSameDay(prCreatedDate, date);
        });
        
        // 해당 날짜의 평균 리드 타임 계산
        let avgLeadTime = 0;
        if (dayPRs.length > 0) {
          const leadTimes = dayPRs.map(pr => {
            if (!pr.merged_at) return 0;
            return (new Date(pr.merged_at).getTime() - new Date(pr.created_at).getTime()) / (1000 * 60 * 60);
          }).filter(time => time > 0);
          
          if (leadTimes.length > 0) {
            avgLeadTime = leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length;
          }
        }
        
        return {
          date: format(date, 'yyyy-MM-dd'),
          leadTime: avgLeadTime
        };
      });
      
      // 복구 시간 데이터 생성
      const mttrData = dateRange.map(date => {
        // MTTR 계산 로직 (예시: 고정값)
        return {
          date: format(date, 'yyyy-MM-dd'),
          mttr: metrics.meanTimeToRestore || 4.2
        };
      });
      
      // 배포 빈도 데이터 생성
      const deploymentFrequencyData = dateRange.map(date => {
        const dayStart = startOfDay(date);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);
        
        // 해당 날짜의 배포 횟수 계산
        const deploymentCount = deployments.filter(deployment => {
          const deploymentDate = new Date(deployment.created_at);
          return deploymentDate >= dayStart && deploymentDate < dayEnd;
        }).length;
        
        return {
          date: format(date, 'yyyy-MM-dd'),
          count: deploymentCount
        };
      });
      
      // 변경 실패율 데이터 생성
      const changeFailureRateData = dateRange.map(date => {
        const dayStart = startOfDay(date);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);
        
        // 해당 날짜의 배포 필터링
        const dayDeployments = deployments.filter(deployment => {
          const deploymentDate = new Date(deployment.created_at);
          return deploymentDate >= dayStart && deploymentDate < dayEnd;
        });
        
        // 실패율 계산
        let failureRate = 0;
        if (dayDeployments.length > 0) {
          const failedDeployments = dayDeployments.filter(deployment => deployment.has_issues).length;
          failureRate = (failedDeployments / dayDeployments.length) * 100;
        } else if (metrics.changeFailureRate !== null) {
          failureRate = metrics.changeFailureRate * 100;
        }
        
        return {
          date: format(date, 'yyyy-MM-dd'),
          rate: failureRate
        };
      });
      
      set({
        leadTimeForChanges: metrics.avgPRCycleTime / (1000 * 60 * 60), // 밀리초를 시간으로 변환
        deploymentFrequency: metrics.deploymentFrequency || 0,
        changeFailureRate: metrics.changeFailureRate || 0,
        meanTimeToRestore: 4.2, // 실제 계산 필요
        leadTimeData,
        mttrData,
        deploymentFrequencyData,
        changeFailureRateData,
        isLoading: false,
        lastUpdated: new Date()
      });
      
      // 이벤트 데이터도 함께 업데이트
      await get().loadEvents();
      
    } catch (error) {
      console.error('메트릭스 로드 오류:', error);
      set({ 
        error: '데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.',
        isLoading: false 
      });
    }
  },
  
  // 데이터 갱신 함수
  refreshData: async () => {
    const state = get();
    
    // 시작일, 종료일, 저장소가 모두 선택된 경우
    if (state.startDate && state.endDate && state.selectedRepo) {
      // 날짜 형식 확인 및 변환
      const start = state.startDate instanceof Date ? state.startDate : 
                   typeof state.startDate === 'string' ? new Date(state.startDate) : defaultStartDate;
      const end = state.endDate instanceof Date ? state.endDate : 
                 typeof state.endDate === 'string' ? new Date(state.endDate) : defaultEndDate;
      
      // 캐시 키 생성
      const cacheKey = generateCacheKey(start, end, state.selectedRepo);
      console.log('새로고침 시도 - 캐시 키:', cacheKey);
      
      // 현재 로컬 스토리지 상태 확인
      console.log('로컬 스토리지 내 캐시 키 목록:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_PREFIX)) {
          console.log(` - ${key}`);
        }
      }
      
      // 테스트 데이터 모드인지 확인
      const testMode = isTestDataMode(state.selectedRepo, start, end);
      if (testMode) {
        console.log('📊 테스트 데이터 모드 감지: 캐시된 테스트 데이터를 먼저 확인합니다.');
      }
      
      // 캐시 존재 확인
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        console.log('💾 새로고침: 캐시된 데이터를 사용합니다', cacheKey);
        
        // 캐시된 데이터로 상태 직접 업데이트
        set({
          leadTimeForChanges: cachedData.data.metrics.leadTimeForChanges,
          deploymentFrequency: cachedData.data.metrics.deploymentFrequency,
          changeFailureRate: cachedData.data.metrics.changeFailureRate,
          meanTimeToRestore: cachedData.data.metrics.meanTimeToRestore,
          events: cachedData.data.events,
          leadTimeData: cachedData.data.leadTimeData || [],
          mttrData: cachedData.data.mttrData || [],
          deploymentFrequencyData: cachedData.data.deploymentFrequencyData || [],
          changeFailureRateData: cachedData.data.changeFailureRateData || [],
          isLoading: false,
          lastUpdated: new Date(cachedData.timestamp)
        });
        
        return;
      } else {
        // 테스트 데이터 체크
        if (testMode) {
          // 테스트 데이터 체크
          console.log('🧪 테스트 데이터 모드: 직접 캐시 항목 확인');
          
          // 저장소 아이디 추출 (owner/name 형식)
          const repo = state.selectedRepo;
          const startStr = format(start, 'yyyy-MM-dd');
          const endStr = format(end, 'yyyy-MM-dd');
          
          // 주요 지표 데이터 찾기
          const leadTimeKey = `beaver_${repo}_lead_time_${startStr}_${endStr}`;
          const mttrKey = `beaver_${repo}_mttr_${startStr}_${endStr}`;
          const dfKey = `beaver_${repo}_deployment_frequency_${startStr}_${endStr}`;
          const cfrKey = `beaver_${repo}_change_failure_rate_${startStr}_${endStr}`;
          const metricsKey = `beaver_${repo}_metrics_${startStr}_${endStr}`;
          const deploymentsKey = `beaver_${repo}_deployments_${startStr}_${endStr}`;
          const incidentsKey = `beaver_${repo}_incidents_${startStr}_${endStr}`;
          
          console.log('검색 중인 테스트 데이터 키:', leadTimeKey, mttrKey, dfKey, cfrKey, metricsKey);
          
          try {
            // 테스트 데이터가 있는지 확인
            const leadTimeData = JSON.parse(localStorage.getItem(leadTimeKey) || '[]');
            const mttrData = JSON.parse(localStorage.getItem(mttrKey) || '[]');
            const deploymentFrequencyData = JSON.parse(localStorage.getItem(dfKey) || '[]');
            const changeFailureRateData = JSON.parse(localStorage.getItem(cfrKey) || '[]');
            const metricsData = JSON.parse(localStorage.getItem(metricsKey) || '{}');
            const deploymentsData = JSON.parse(localStorage.getItem(deploymentsKey) || '[]');
            const incidentsData = JSON.parse(localStorage.getItem(incidentsKey) || '[]');
            
            // 테스트 데이터가 있으면 적용
            if (leadTimeData.length > 0 || mttrData.length > 0 || deploymentFrequencyData.length > 0 || changeFailureRateData.length > 0) {
              console.log('💾 테스트 데이터 발견, 화면에 적용합니다');
              
              // 이벤트 데이터 생성
              const events: Event[] = [
                // 배포 이벤트 추가
                ...deploymentsData.map((d: any) => ({
                  id: `deployment-${d.timestamp}`,
                  type: 'deployment' as const,
                  timestamp: d.timestamp,
                  description: `배포 ${d.version || ''}`,
                  repository: repo
                })),
                
                // 인시던트 이벤트 추가
                ...incidentsData.map((i: any) => ([
                  {
                    id: `incident-${i.start}`,
                    type: 'incident' as const,
                    timestamp: i.start,
                    description: `인시던트 발생 (심각도: ${i.severity})`,
                    repository: repo
                  },
                  {
                    id: `recovery-${i.end}`,
                    type: 'recovery' as const,
                    timestamp: i.end,
                    description: '인시던트 복구 완료',
                    repository: repo
                  }
                ])).flat()
              ];
              
              // 테스트 데이터로 상태 업데이트
              set({
                leadTimeForChanges: metricsData.leadTimeForChanges || 0,
                deploymentFrequency: metricsData.deploymentFrequency || 0,
                changeFailureRate: metricsData.changeFailureRate || 0,
                meanTimeToRestore: metricsData.meanTimeToRestore || 0,
                events,
                leadTimeData,
                mttrData,
                deploymentFrequencyData,
                changeFailureRateData,
                isLoading: false,
                lastUpdated: new Date()
              });
              
              // 캐시에 저장
              saveToCache(cacheKey, {
                metrics: {
                  leadTimeForChanges: metricsData.leadTimeForChanges || 0,
                  deploymentFrequency: metricsData.deploymentFrequency || 0,
                  changeFailureRate: metricsData.changeFailureRate || 0,
                  meanTimeToRestore: metricsData.meanTimeToRestore || 0
                },
                events,
                leadTimeData,
                mttrData,
                deploymentFrequencyData,
                changeFailureRateData
              });
              
              return;
            } else {
              console.log('❌ 테스트 데이터 모드이지만 데이터를 찾을 수 없습니다. 기본 테스트 데이터를 자동 생성합니다.');
              
              // 자동으로 테스트 데이터 생성
              createDefaultTestData(repo, start, end);
              
              // 생성된 데이터 다시 확인
              const autoGenLeadTimeData = JSON.parse(localStorage.getItem(leadTimeKey) || '[]');
              const autoGenMttrData = JSON.parse(localStorage.getItem(mttrKey) || '[]');
              const autoGenDfData = JSON.parse(localStorage.getItem(dfKey) || '[]');
              const autoGenCfrData = JSON.parse(localStorage.getItem(cfrKey) || '[]');
              const autoGenMetricsData = JSON.parse(localStorage.getItem(metricsKey) || '{}');
              
              if (autoGenLeadTimeData.length > 0) {
                console.log('🎉 자동 생성된 테스트 데이터를 적용합니다.');
                
                set({
                  leadTimeForChanges: autoGenMetricsData.leadTimeForChanges || 0,
                  deploymentFrequency: autoGenMetricsData.deploymentFrequency || 0,
                  changeFailureRate: autoGenMetricsData.changeFailureRate || 0,
                  meanTimeToRestore: autoGenMetricsData.meanTimeToRestore || 0,
                  leadTimeData: autoGenLeadTimeData,
                  mttrData: autoGenMttrData,
                  deploymentFrequencyData: autoGenDfData,
                  changeFailureRateData: autoGenCfrData,
                  isLoading: false,
                  lastUpdated: new Date()
                });
                
                return;
              }
              
              // 디버깅: 로컬 스토리지의 모든 키 출력
              console.log('로컬 스토리지 내 모든 키:');
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                console.log(`${i}: ${key} (값 존재: ${Boolean(localStorage.getItem(key))})`);
              }
              
              // 디버깅: 찾으려는 키 목록 출력
              console.log('찾으려는 키:', {
                leadTimeKey,
                mttrKey,
                dfKey,
                cfrKey,
                metricsKey,
                deploymentsKey,
                incidentsKey
              });
              
              set({ 
                error: '테스트 데이터를 찾을 수 없습니다. "테스트 데이터 주입" 도구를 사용하여 데이터를 추가해주세요.',
                isLoading: false 
              });
              return;
            }
          } catch (error) {
            console.error('테스트 데이터 처리 오류:', error);
          }
        }
        
        console.log('🔄 새로고침: 캐시 없음, API에서 데이터를 가져옵니다');
      }
      
      // 테스트 모드가 아닌 경우에만 API 요청
      if (!testMode) {
        await state.loadMetrics(state.startDate, state.endDate, state.selectedRepo);
      }
    } 
    // 저장소만 선택된 경우
    else if (state.selectedRepo) {
      await state.loadEvents();
    } 
    // 아무 것도 선택되지 않은 경우
    else {
      // 기본 데이터 로드
      await state.loadEvents();
    }
    
    set({ lastUpdated: new Date() });
  },

  // 테스트 데이터 날짜 설정 함수
  setTestDataDateRange: () => {
    const testStartDate = new Date('2024-01-01');
    const testEndDate = new Date('2025-03-16');
    
    setStartDate(testStartDate);
    setEndDate(testEndDate);
    
    // 테스트 데이터 날짜를 로컬 스토리지에 저장
    localStorage.setItem('beaver_start_date', testStartDate.toISOString());
    localStorage.setItem('beaver_end_date', testEndDate.toISOString());
    
    console.log('테스트 모드 활성화: 날짜 범위가 2024-01-01 ~ 2025-03-16으로 설정되었습니다.');
    
    // 테스트 데이터 자동 생성 (선택된 저장소가 있을 경우)
    setTimeout(() => {
      refreshData();
    }, 100);
  },
}));

// useStore라는 이름으로도 내보냅니다
export const useStore = useDashboardStore; 