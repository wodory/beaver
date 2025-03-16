import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/dashboardStore';
import { format, isValid, eachDayOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatMetricResult } from '@/lib/utils';
import { RefreshCw, Key, Eye, EyeOff, Trash2, Database, Calendar, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import config from '@/config.json';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import DeploymentFrequencyChart from './DeploymentFrequencyChart';
import ChangeFailureRateChart from './ChangeFailureRateChart';
import LeadTimeForChangesChart from './LeadTimeForChangesChart';
import MeanTimeToRestoreChart from './MeanTimeToRestoreChart';
import PerformanceIndicator from './PerformanceIndicator';
import EventTimeline from './EventTimeline';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const getDORALevel = (metric: string, value: number | null): 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high' | 'unknown' => {
  if (value === null) return 'unknown';
  
  switch(metric) {
    case 'deploymentFrequency':
      // 배포 빈도 (일 단위)
      if (value >= 1) return 'high'; // 일 1회 이상
      if (value >= 1/7) return 'medium-high'; // 주 1회 이상
      if (value >= 1/30) return 'medium'; // 월 1회 이상
      if (value >= 1/180) return 'medium-low'; // 6개월 1회 이상
      return 'low';
      
    case 'leadTimeForChanges':
      // 변경 리드 타임 (시간 단위)
      if (value <= 24) return 'high'; // 하루 이내
      if (value <= 168) return 'medium-high'; // 일주일 이내
      if (value <= 720) return 'medium'; // 한 달 이내
      if (value <= 2160) return 'medium-low'; // 3개월 이내
      return 'low';
      
    case 'changeFailureRate':
      // 변경 실패율 (%)
      if (value <= 15) return 'high'; // 15% 이하
      if (value <= 30) return 'medium-high'; // 30% 이하
      if (value <= 45) return 'medium'; // 45% 이하
      if (value <= 60) return 'medium-low'; // 60% 이하
      return 'low';
      
    case 'meanTimeToRestore':
      // 복구 시간 (시간 단위)
      if (value <= 1) return 'high'; // 1시간 이내
      if (value <= 24) return 'medium-high'; // 하루 이내
      if (value <= 168) return 'medium'; // 일주일 이내
      if (value <= 336) return 'medium-low'; // 2주일 이내
      return 'low';
      
    default:
      return 'unknown';
  }
};

const Dashboard: React.FC = () => {
  const { 
    startDate, 
    endDate, 
    setStartDate, 
    setEndDate, 
    selectedRepo,
    setSelectedRepo,
    repositories,
    leadTimeForChanges,
    changeFailureRate,
    deploymentFrequency,
    meanTimeToRestore,
    loadEvents,
    loadMetrics,
    refreshData,
    isLoading,
    lastUpdated
  } = useStore();

  // 날짜 유효성 검사 함수
  const ensureValidDate = (date: Date | null | string | undefined): Date | null => {
    if (!date) return null;
    if (date instanceof Date && isValid(date)) return date;
    if (typeof date === 'string') {
      try {
        const parsed = new Date(date);
        return isValid(parsed) ? parsed : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // 시작일/종료일 데이트피커 오픈 상태 관리
  const [startDateOpen, setStartDateOpen] = React.useState(false);
  const [endDateOpen, setEndDateOpen] = React.useState(false);
  
  // 종료일 드롭다운을 여는 타이머 참조
  const endDateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 테스트 데이터 날짜 설정 함수
  const setTestDataDateRange = () => {
    const testStartDate = new Date('2024-01-01');
    const testEndDate = new Date('2025-03-16');
    
    setStartDate(testStartDate);
    setEndDate(testEndDate);
    
    // 테스트 데이터 날짜를 로컬 스토리지에 저장
    localStorage.setItem('beaver_start_date', testStartDate.toISOString());
    localStorage.setItem('beaver_end_date', testEndDate.toISOString());
    
    console.log('테스트 모드 활성화: 날짜 범위가 2024-01-01 ~ 2025-03-16으로 설정되었습니다.');
    
    // 데이터 새로고침 (테스트 데이터 모드 활성화 후 자동 적용)
    setTimeout(() => {
      refreshData();
    }, 100);
  };

  // 날짜 선택 값을 로컬 스토리지에 저장하는 함수
  const saveDatesToLocalStorage = (start: Date | null, end: Date | null) => {
    if (start) {
      localStorage.setItem('beaver_start_date', start.toISOString());
    }
    if (end) {
      localStorage.setItem('beaver_end_date', end.toISOString());
    }
  };

  // 시작일 변경 처리 (로컬 스토리지 저장 추가)
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setStartDateOpen(false);
    
    // 로컬 스토리지에 저장
    if (date) {
      saveDatesToLocalStorage(date, endDate);
    }
    
    // 이전 타이머가 있으면 취소
    if (endDateTimerRef.current) {
      clearTimeout(endDateTimerRef.current);
    }
    
    // 약간의 지연 후 종료일 드롭다운 열기 (UI 갱신 후)
    endDateTimerRef.current = setTimeout(() => {
      setEndDateOpen(true);
      endDateTimerRef.current = null;
    }, 100);
  };

  // 종료일 변경 처리 (로컬 스토리지 저장 추가)
  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    setEndDateOpen(false);
    
    // 로컬 스토리지에 저장
    if (date) {
      saveDatesToLocalStorage(startDate, date);
    }
  };

  // 기본값 설정 (로컬 스토리지 우선 사용)
  useEffect(() => {
    if (!startDate && !endDate) {
      // 로컬 스토리지에서 날짜 불러오기
      const savedStartDate = localStorage.getItem('beaver_start_date');
      const savedEndDate = localStorage.getItem('beaver_end_date');
      
      let parsedStartDate = null;
      let parsedEndDate = null;
      
      if (savedStartDate) {
        try {
          parsedStartDate = new Date(savedStartDate);
          if (!isValid(parsedStartDate)) parsedStartDate = null;
        } catch (error) {
          console.error('저장된 시작일 파싱 오류:', error);
        }
      }
      
      if (savedEndDate) {
        try {
          parsedEndDate = new Date(savedEndDate);
          if (!isValid(parsedEndDate)) parsedEndDate = null;
        } catch (error) {
          console.error('저장된 종료일 파싱 오류:', error);
        }
      }
      
      // 저장된 날짜가 있으면 사용
      if (parsedStartDate) {
        setStartDate(parsedStartDate);
        console.log('로컬 스토리지에서 시작일 불러옴:', format(parsedStartDate, 'yyyy-MM-dd'));
      }
      
      if (parsedEndDate) {
        setEndDate(parsedEndDate);
        console.log('로컬 스토리지에서 종료일 불러옴:', format(parsedEndDate, 'yyyy-MM-dd'));
      }
      
      // 저장된 날짜가 없는 경우 config.json의 기본값 사용
      if (!parsedStartDate && !parsedEndDate) {
        try {
          const configStartDate = new Date(config.defaultTimeRange.since);
          const configEndDate = new Date(config.defaultTimeRange.until);
          
          if (isValid(configStartDate)) setStartDate(configStartDate);
          if (isValid(configEndDate)) setEndDate(configEndDate);
        } catch (error) {
          console.error('기본 날짜 설정 오류:', error);
        }
      }
    }
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (endDateTimerRef.current) {
        clearTimeout(endDateTimerRef.current);
      }
    };
  }, []);

  // 컴포넌트 마운트 시 이벤트 데이터 로드
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // 필터 변경 시 지표 계산
  useEffect(() => {
    const validStartDate = ensureValidDate(startDate);
    const validEndDate = ensureValidDate(endDate);
    
    if (validStartDate && validEndDate && selectedRepo) {
      loadMetrics(validStartDate, validEndDate, selectedRepo);
    }
  }, [startDate, endDate, selectedRepo, loadMetrics]);

  // DORA 성능 레벨 계산
  const deploymentFrequencyLevel = getDORALevel('deploymentFrequency', deploymentFrequency);
  const leadTimeLevel = getDORALevel('leadTimeForChanges', leadTimeForChanges);
  const changeFailureRateLevel = getDORALevel('changeFailureRate', changeFailureRate);
  const mttrLevel = getDORALevel('meanTimeToRestore', meanTimeToRestore);

  // 마지막 업데이트 시간 포맷팅
  const formattedLastUpdated = lastUpdated && isValid(new Date(lastUpdated))
    ? format(new Date(lastUpdated), 'yyyy년 MM월 dd일 HH:mm:ss', { locale: ko }) 
    : '업데이트 내역 없음';

  // 데이터 새로고침 핸들러
  const handleRefresh = async () => {
    await refreshData();
  };

  // 테스트 데이터 모드인지 확인하는 함수 (dashboardStore의 isTestDataMode 사용)
  const isTestDataMode = (repo: string, start: Date, end: Date): boolean => {
    // 2024년 1월 1일 시작 날짜인 경우 테스트 데이터 모드로 간주
    return start.getFullYear() === 2024 && start.getMonth() === 0 && start.getDate() === 1;
  };

  // 캐시 초기화 함수 (clearCache 함수에 대한 대체)
  const handleClearCache = () => {
    // localStorage에서 beaver_ 프리픽스로 시작하는 모든 키 삭제
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('beaver_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('모든 캐시가 초기화되었습니다.');
  };

  // 캐시 없이 새로고침 핸들러
  const handleForceRefresh = async () => {
    handleClearCache(); // 캐시 초기화 (clearCache 대신 handleClearCache 사용)
    await refreshData(); // 데이터 새로고침
  };

  // GitHub 토큰 관련 상태 추가
  const [githubToken, setGithubToken] = useState<string>(
    localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN || ''
  );
  const [showToken, setShowToken] = useState<boolean>(false);
  const [tokenDialogOpen, setTokenDialogOpen] = useState<boolean>(false);
  const tokenFromEnv = Boolean(import.meta.env.VITE_GITHUB_TOKEN);
  
  // 페이지 로드 시 토큰 상태 디버깅
  useEffect(() => {
    console.log('Dashboard 마운트 시 GitHub 토큰 상태:', {
      tokenFromState: Boolean(githubToken),
      tokenFromStorage: Boolean(localStorage.getItem('github_token')),
      tokenFromEnv: Boolean(import.meta.env.VITE_GITHUB_TOKEN),
      tokenLength: githubToken ? githubToken.length : 0
    });
  }, [githubToken]);
  
  // 토큰 저장 함수
  const saveGithubToken = () => {
    // 입력된 토큰 유효성 검사
    if (githubToken && githubToken.length < 10) {
      alert('GitHub 토큰이 너무 짧습니다. 유효한 토큰인지 확인해 주세요.');
      return;
    }
    
    // 로컬 스토리지에 토큰 저장
    if (githubToken) {
      localStorage.setItem('github_token', githubToken);
      console.log('GitHub 토큰이 저장되었습니다. 페이지를 새로고침합니다.');
      window.location.reload(); // 페이지 새로고침 (Octokit 인스턴스 재생성을 위해)
    }
    setTokenDialogOpen(false);
  };
  
  // 토큰 삭제 함수
  const clearGithubToken = () => {
    localStorage.removeItem('github_token');
    setGithubToken('');
    console.log('GitHub 토큰이 삭제되었습니다. 페이지를 새로고침합니다.');
    window.location.reload(); // 페이지 새로고침 (Octokit 인스턴스 재생성을 위해)
    setTokenDialogOpen(false);
  };

  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('github_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'api' | 'cache'>('cache');
  const [activeTab, setActiveTab] = useState<string>("main");
  
  // 다중 저장소 차트 지원
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [multiRepoMode, setMultiRepoMode] = useState<boolean>(false);
  const [isMultiLoading, setIsMultiLoading] = useState<boolean>(false);
  
  // 선택된 여러 저장소의
  const [multiRepoData, setMultiRepoData] = useState<{
    leadTimeData: { [repo: string]: any[] };
    mttrData: { [repo: string]: any[] };
    deploymentFrequencyData: { [repo: string]: any[] };
    changeFailureRateData: { [repo: string]: any[] };
  }>({
    leadTimeData: {},
    mttrData: {},
    deploymentFrequencyData: {},
    changeFailureRateData: {}
  });

  // Apple 스타일 색상 팔레트
  const colorPalette = [
    '#007AFF', // Blue
    '#FF2D55', // Red
    '#5AC8FA', // Light Blue
    '#FF9500', // Orange
    '#4CD964', // Green
    '#AF52DE', // Purple
    '#FFCC00', // Yellow
    '#34C759', // Mint Green
    '#FF3B30', // Bright Red
    '#5856D6', // Dark Blue
  ];

  // 여러 저장소 데이터 로드 함수
  const loadMultiRepoData = async () => {
    if (!startDate || !endDate || selectedRepos.length === 0) return;
    
    setIsMultiLoading(true);
    
    const newMultiRepoData = {
      leadTimeData: {} as { [repo: string]: any[] },
      mttrData: {} as { [repo: string]: any[] },
      deploymentFrequencyData: {} as { [repo: string]: any[] },
      changeFailureRateData: {} as { [repo: string]: any[] }
    };
    
    console.log('다중 저장소 데이터 로드 시작:', {
      selectedRepos,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    // 테스트 데이터 모드 감지
    const isTestMode = startDate.getFullYear() === 2024 && 
                      startDate.getMonth() === 0 && 
                      startDate.getDate() === 1;
    
    // 선택된 각 저장소에 대해 데이터 로드
    for (const repo of selectedRepos) {
      // 캐시 키 생성
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');
      const cachedDataKey = `beaver_${repo}_metrics_${startStr}_${endStr}`;
      const cachedData = localStorage.getItem(cachedDataKey);
      
      let repoDataLoaded = false;
      
      // 1. 먼저 캐시된 메트릭 데이터를 확인
      if (cachedData) {
        try {
          // 캐시된 데이터가 있는 경우
          const parsedData = JSON.parse(cachedData);
          newMultiRepoData.leadTimeData[repo] = parsedData.leadTimeData?.map((item: any) => ({...item, repository: repo})) || [];
          newMultiRepoData.mttrData[repo] = parsedData.mttrData?.map((item: any) => ({...item, repository: repo})) || [];
          newMultiRepoData.deploymentFrequencyData[repo] = parsedData.deploymentFrequencyData?.map((item: any) => ({...item, repository: repo})) || [];
          newMultiRepoData.changeFailureRateData[repo] = parsedData.changeFailureRateData?.map((item: any) => ({...item, repository: repo})) || [];
          
          console.log(`저장소 ${repo} 캐시 데이터 로드 완료:`, {
            leadTimeData: newMultiRepoData.leadTimeData[repo].length,
            mttrData: newMultiRepoData.mttrData[repo].length,
            deploymentFrequencyData: newMultiRepoData.deploymentFrequencyData[repo].length,
            changeFailureRateData: newMultiRepoData.changeFailureRateData[repo].length
          });
          
          repoDataLoaded = true;
        } catch (error) {
          console.error(`${repo} 캐시 데이터 파싱 오류:`, error);
        }
      }
      
      // 2. 캐시 데이터가 없고 테스트 모드인 경우 개별 테스트 데이터 키 확인
      if (!repoDataLoaded && isTestMode) {
        try {
          const leadTimeKey = `beaver_${repo}_lead_time_${startStr}_${endStr}`;
          const mttrKey = `beaver_${repo}_mttr_${startStr}_${endStr}`;
          const dfKey = `beaver_${repo}_deployment_frequency_${startStr}_${endStr}`;
          const cfrKey = `beaver_${repo}_change_failure_rate_${startStr}_${endStr}`;
          
          const leadTimeData = JSON.parse(localStorage.getItem(leadTimeKey) || '[]');
          const mttrData = JSON.parse(localStorage.getItem(mttrKey) || '[]');
          const deploymentFrequencyData = JSON.parse(localStorage.getItem(dfKey) || '[]');
          const changeFailureRateData = JSON.parse(localStorage.getItem(cfrKey) || '[]');
          
          newMultiRepoData.leadTimeData[repo] = leadTimeData.map((item: any) => ({...item, repository: repo}));
          newMultiRepoData.mttrData[repo] = mttrData.map((item: any) => ({...item, repository: repo}));
          newMultiRepoData.deploymentFrequencyData[repo] = deploymentFrequencyData.map((item: any) => ({...item, repository: repo}));
          newMultiRepoData.changeFailureRateData[repo] = changeFailureRateData.map((item: any) => ({...item, repository: repo}));
          
          console.log(`저장소 ${repo} 테스트 데이터 로드 완료:`, {
            leadTimeData: newMultiRepoData.leadTimeData[repo].length,
            mttrData: newMultiRepoData.mttrData[repo].length,
            deploymentFrequencyData: newMultiRepoData.deploymentFrequencyData[repo].length,
            changeFailureRateData: newMultiRepoData.changeFailureRateData[repo].length
          });
          
          repoDataLoaded = true;
        } catch (error) {
          console.error(`${repo} 테스트 데이터 로드 오류:`, error);
        }
      }
      
      // 3. 테스트 모드인데 데이터가 없으면 자동 생성
      if (!repoDataLoaded && isTestMode) {
        console.log(`저장소 ${repo}에 데이터가 없습니다. 테스트 데이터를 자동 생성합니다.`);
        
        // 각 저장소에 고유한 값을 갖는 테스트 데이터 생성
        generateTestDataForRepo(repo, startDate, endDate);
        
        // 생성된 데이터 로드
        try {
          const leadTimeKey = `beaver_${repo}_lead_time_${startStr}_${endStr}`;
          const mttrKey = `beaver_${repo}_mttr_${startStr}_${endStr}`;
          const dfKey = `beaver_${repo}_deployment_frequency_${startStr}_${endStr}`;
          const cfrKey = `beaver_${repo}_change_failure_rate_${startStr}_${endStr}`;
          
          const leadTimeData = JSON.parse(localStorage.getItem(leadTimeKey) || '[]');
          const mttrData = JSON.parse(localStorage.getItem(mttrKey) || '[]');
          const deploymentFrequencyData = JSON.parse(localStorage.getItem(dfKey) || '[]');
          const changeFailureRateData = JSON.parse(localStorage.getItem(cfrKey) || '[]');
          
          newMultiRepoData.leadTimeData[repo] = leadTimeData.map((item: any) => ({...item, repository: repo}));
          newMultiRepoData.mttrData[repo] = mttrData.map((item: any) => ({...item, repository: repo}));
          newMultiRepoData.deploymentFrequencyData[repo] = deploymentFrequencyData.map((item: any) => ({...item, repository: repo}));
          newMultiRepoData.changeFailureRateData[repo] = changeFailureRateData.map((item: any) => ({...item, repository: repo}));
          
          console.log(`저장소 ${repo} 자동 생성된 테스트 데이터 로드 완료:`, {
            leadTimeData: newMultiRepoData.leadTimeData[repo].length,
            mttrData: newMultiRepoData.mttrData[repo].length,
            deploymentFrequencyData: newMultiRepoData.deploymentFrequencyData[repo].length,
            changeFailureRateData: newMultiRepoData.changeFailureRateData[repo].length
          });
        } catch (error) {
          console.error(`${repo} 자동 생성 테스트 데이터 로드 오류:`, error);
        }
      }
      
      // 4. 실제 API 모드이고 데이터가 아직 로드되지 않은 경우 (기존 코드 개선)
      if (!repoDataLoaded && !isTestMode) {
        try {
          console.log(`저장소 ${repo}의 실제 데이터를 로드합니다.`);
          
          // 여기서 실제 API 호출 또는 데이터 로드 로직이 실행될 것입니다.
          // 저장소별로 데이터를 구분하여 가공하는 로직 추가
          
          // API 데이터를 저장소별 고유한 값을 가질 수 있도록 처리
          // 실제 API 구현이 필요하지만, 현재는 기본 구조만 작성
          
          // 데이터 로드에 성공했다면 다음과 같이 처리 (실제 구현 필요)
          // API로부터 로드한 데이터 처리
          const apiLoadedData = {
            leadTimeData: [],
            mttrData: [],
            deploymentFrequencyData: [],
            changeFailureRateData: []
          };
          
          // 데이터가 로드되었다면 저장소 정보 추가하여 주입
          newMultiRepoData.leadTimeData[repo] = apiLoadedData.leadTimeData.map((item: any) => ({...item, repository: repo}));
          newMultiRepoData.mttrData[repo] = apiLoadedData.mttrData.map((item: any) => ({...item, repository: repo}));
          newMultiRepoData.deploymentFrequencyData[repo] = apiLoadedData.deploymentFrequencyData.map((item: any) => ({...item, repository: repo}));
          newMultiRepoData.changeFailureRateData[repo] = apiLoadedData.changeFailureRateData.map((item: any) => ({...item, repository: repo}));
          
          // 로드된 데이터를 캐시에 저장
          localStorage.setItem(cachedDataKey, JSON.stringify({
            leadTimeData: apiLoadedData.leadTimeData,
            mttrData: apiLoadedData.mttrData,
            deploymentFrequencyData: apiLoadedData.deploymentFrequencyData,
            changeFailureRateData: apiLoadedData.changeFailureRateData
          }));
          
          console.log(`저장소 ${repo} 실제 데이터 로드 완료 및 캐싱됨`);
          repoDataLoaded = true;
        } catch (error) {
          console.error(`${repo} 실제 데이터 로드 오류:`, error);
        }
      }
      
      // 5. 모든 시도 후에도 데이터를 로드하지 못한 경우 빈 데이터 설정
      if (!repoDataLoaded) {
        console.warn(`저장소 ${repo}에 대한 데이터를 로드할 수 없습니다. 빈 데이터로 설정합니다.`);
        
        newMultiRepoData.leadTimeData[repo] = [];
        newMultiRepoData.mttrData[repo] = [];
        newMultiRepoData.deploymentFrequencyData[repo] = [];
        newMultiRepoData.changeFailureRateData[repo] = [];
      }
    }
    
    console.log('다중 저장소 데이터 로드 완료:', {
      leadTimeData: Object.keys(newMultiRepoData.leadTimeData).length,
      mttrData: Object.keys(newMultiRepoData.mttrData).length,
      deploymentFrequencyData: Object.keys(newMultiRepoData.deploymentFrequencyData).length,
      changeFailureRateData: Object.keys(newMultiRepoData.changeFailureRateData).length
    });
    
    setMultiRepoData(newMultiRepoData);
    setIsMultiLoading(false);
  };
  
  // 저장소별 테스트 데이터 생성 함수
  const generateTestDataForRepo = (repo: string, startDate: Date, endDate: Date, multiplier = 1.0) => {
    console.log(`📊 저장소 ${repo}의 테스트 데이터를 생성합니다. 배수: ${multiplier}`);
    
    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');
    
    // 키 생성
    const leadTimeKey = `beaver_${repo}_lead_time_${startStr}_${endStr}`;
    const mttrKey = `beaver_${repo}_mttr_${startStr}_${endStr}`;
    const dfKey = `beaver_${repo}_deployment_frequency_${startStr}_${endStr}`;
    const cfrKey = `beaver_${repo}_change_failure_rate_${startStr}_${endStr}`;
    const metricsKey = `beaver_${repo}_metrics_${startStr}_${endStr}`;
    
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
    
    // 저장소별 고정 값 설정 (명확한 차이를 만들기 위해)
    const repoName = repo.split('/')[1];
    const baseValues = {
      // 저장소별로 확실히 다른 값을 가지도록 설정
      'n8n': { leadTime: 24.5, mttr: 6.3, deployFreq: 3.2, failRate: 22.5 },
      'docmost': { leadTime: 18.7, mttr: 4.8, deployFreq: 2.5, failRate: 15.3 },
      'react-flow': { leadTime: 12.3, mttr: 3.5, deployFreq: 1.8, failRate: 10.2 },
      'vitest': { leadTime: 8.6, mttr: 2.1, deployFreq: 1.2, failRate: 7.5 },
      'react': { leadTime: 5.4, mttr: 1.4, deployFreq: 0.7, failRate: 4.8 }
    }[repoName] || { leadTime: 10.0, mttr: 3.0, deployFreq: 1.5, failRate: 12.0 };
    
    // 1. 리드 타임 데이터 생성 (저장소마다 다른 값)
    for (const date of dateRange) {
      // 기본값에 랜덤 변동치 추가 (±20%)
      const randomVariation = 0.8 + Math.random() * 0.4; // 0.8 ~ 1.2
      leadTimeData.push({
        date: format(date, 'yyyy-MM-dd'),
        leadTime: baseValues.leadTime * randomVariation
      });
    }
    
    // 2. MTTR 데이터 생성
    for (const date of dateRange) {
      const randomVariation = 0.8 + Math.random() * 0.4;
      mttrData.push({
        date: format(date, 'yyyy-MM-dd'),
        mttr: baseValues.mttr * randomVariation
      });
    }
    
    // 3. 배포 빈도 데이터 생성
    for (const date of dateRange) {
      const randomVariation = 0.8 + Math.random() * 0.4;
      deploymentFrequencyData.push({
        date: format(date, 'yyyy-MM-dd'),
        count: Math.max(1, Math.round(baseValues.deployFreq * randomVariation))
      });
    }
    
    // 4. 변경 실패율 데이터 생성
    for (const date of dateRange) {
      const randomVariation = 0.8 + Math.random() * 0.4;
      changeFailureRateData.push({
        date: format(date, 'yyyy-MM-dd'),
        rate: (baseValues.failRate * randomVariation) / 100 // 0~25%의 값을 100으로 나눔
      });
    }
    
    // 5. 메트릭스 요약 데이터
    const metricsData = {
      leadTimeForChanges: baseValues.leadTime,
      deploymentFrequency: baseValues.deployFreq,
      changeFailureRate: baseValues.failRate,
      meanTimeToRestore: baseValues.mttr
    };
    
    // 데이터 저장
    try {
      localStorage.setItem(leadTimeKey, JSON.stringify(leadTimeData));
      localStorage.setItem(mttrKey, JSON.stringify(mttrData));
      localStorage.setItem(dfKey, JSON.stringify(deploymentFrequencyData));
      localStorage.setItem(cfrKey, JSON.stringify(changeFailureRateData));
      localStorage.setItem(metricsKey, JSON.stringify(metricsData));
      
      console.log(`저장소 ${repo} 테스트 데이터가 성공적으로 생성되었습니다.`, {
        leadTimeData: leadTimeData.length,
        mttrData: mttrData.length,
        deploymentFrequencyData: deploymentFrequencyData.length,
        changeFailureRateData: changeFailureRateData.length,
        baseValues: baseValues
      });
    } catch (error) {
      console.error(`저장소 ${repo} 테스트 데이터 생성 중 오류 발생:`, error);
    }
  };

  // 저장소 선택이 변경될 때마다 데이터 로드
  useEffect(() => {
    if (multiRepoMode && selectedRepos.length > 0) {
      loadMultiRepoData();
    }
  }, [selectedRepos, multiRepoMode, startDate, endDate]);

  // 다중 저장소 선택 토글
  const toggleMultiRepoMode = () => {
    const newMode = !multiRepoMode;
    setMultiRepoMode(newMode);
    
    if (newMode) {
      // 다중 모드 활성화시 현재 선택된 저장소가 있으면 추가
      if (selectedRepo && !selectedRepos.includes(selectedRepo)) {
        setSelectedRepos([...selectedRepos, selectedRepo]);
      }
    }
  };
  
  // 다중 저장소 선택/해제
  const toggleRepositorySelection = (repo: string) => {
    if (selectedRepos.includes(repo)) {
      setSelectedRepos(selectedRepos.filter(r => r !== repo));
    } else {
      if (selectedRepos.length < 10) { // 최대 10개 저장소 제한
        setSelectedRepos([...selectedRepos, repo]);
      } else {
        alert('최대 10개 저장소까지만 선택할 수 있습니다.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">DORA 메트릭스 대시보드</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">마지막 업데이트: {formattedLastUpdated}</p>
            
            {/* GitHub 토큰 설정 버튼 */}
            <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Key className="h-4 w-4" />
                  GitHub Token 설정
                  <span className={`ml-1 inline-flex h-2 w-2 rounded-full ${tokenFromEnv || localStorage.getItem('github_token') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>GitHub 토큰 설정</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <p className="text-sm text-muted-foreground">
                    GitHub API 사용 제한을 늘리기 위해 개인 액세스 토큰을 설정해주세요.
                    토큰을 설정하면 시간당 5,000회의 요청이 가능합니다.
                  </p>
                  <p className="text-sm">
                    <a 
                      href="https://github.com/settings/tokens" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      GitHub 토큰 생성하기
                    </a> (repo 권한 필요)
                  </p>
                  <div className="flex">
                    <div className="relative flex-1">
                      <Input
                        type={showToken ? "text" : "password"}
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        placeholder="GitHub 개인 액세스 토큰 입력"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setTokenDialogOpen(false)}>
                      취소
                    </Button>
                    <div className="space-x-2">
                      {(localStorage.getItem('github_token') || tokenFromEnv) && (
                        <Button variant="destructive" onClick={clearGithubToken}>
                          토큰 삭제
                        </Button>
                      )}
                      <Button onClick={saveGithubToken}>
                        저장
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* 테스트 데이터 주입 버튼 */}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1" 
              onClick={() => window.open('/inject-test-data.html', '_blank')}
            >
              <Database className="h-4 w-4" />
              테스트 데이터
            </Button>
            
            {/* 테스트 데이터 날짜 설정 버튼 */}
            <Button
              variant="outline"
              className="ml-2"
              onClick={() => {
                if (!selectedRepo) {
                  alert('테스트 모드를 활성화하기 전에 저장소를 선택해주세요.');
                  return;
                }
                setTestDataDateRange();
              }}
            >
              <span 
                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  startDate?.getTime() === new Date('2024-01-01').getTime() 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}
              ></span>
              테스트 모드
            </Button>
            
            {/* 새로고침 드롭다운 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  disabled={isMultiLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isMultiLoading ? 'animate-spin' : ''}`} />
                  {isMultiLoading ? '업데이트 중...' : '새로고침'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  캐시 확인 후 새로고침
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleForceRefresh}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  캐시 무시하고 새로고침
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* 필터 섹션 */}
        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">시작일</label>
            <DatePicker
              selected={startDate}
              onSelect={handleStartDateChange}
              placeholder="시작일 선택"
              open={startDateOpen}
              onOpenChange={setStartDateOpen}
            />
            {startDate && startDate.getFullYear() === 2024 && (
              <div className="text-xs text-green-600 mt-1">테스트 모드</div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">종료일</label>
            <DatePicker
              selected={endDate}
              onSelect={handleEndDateChange}
              placeholder="종료일 선택"
              open={endDateOpen}
              onOpenChange={setEndDateOpen}
            />
            {endDate && endDate.getFullYear() === 2024 && (
              <div className="text-xs text-green-600 mt-1">테스트 모드</div>
            )}
          </div>
          
          {/* 저장소 필터 */}
          <div className="space-y-2">
            <Label htmlFor="repository">저장소 필터</Label>
            <div className="flex space-x-2">
              {multiRepoMode ? (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1" 
                  onClick={toggleMultiRepoMode}
                >
                  <Eye size={16} />
                  단일 모드
                </Button>
              ) : (
                <Select value={selectedRepo || undefined} onValueChange={setSelectedRepo}>
                  <SelectTrigger id="repository">
                    <SelectValue placeholder="저장소 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {repositories.map((repo) => (
                      <SelectItem key={repo} value={repo}>{repo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMultiRepoMode}
                title={multiRepoMode ? "단일 저장소 모드로 전환" : "다중 저장소 모드로 전환"}
              >
                {multiRepoMode ? <Eye size={16} /> : <EyeOff size={16} />}
              </Button>
            </div>
            
            {/* 다중 저장소 선택 UI */}
            {multiRepoMode && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Label>다중 저장소 선택 (최대 10개)</Label>
                  <span className="text-xs text-muted-foreground">{selectedRepos.length}/10 선택됨</span>
                </div>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                  {repositories.map((repo, index) => (
                    <div 
                      key={repo} 
                      className={`px-3 py-1 rounded-full text-sm cursor-pointer flex items-center gap-1 ${
                        selectedRepos.includes(repo) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      style={selectedRepos.includes(repo) ? { backgroundColor: colorPalette[selectedRepos.indexOf(repo) % colorPalette.length] } : {}}
                      onClick={() => toggleRepositorySelection(repo)}
                    >
                      {repo.split('/')[1]}
                      {selectedRepos.includes(repo) && (
                        <span className="inline-flex items-center justify-center w-4 h-4 text-xs">
                          ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
            
          <Button 
            type="button"
            variant="default"
            onClick={() => {
              if (startDate && endDate && selectedRepo) {
                loadMetrics(startDate, endDate, selectedRepo);
              }
            }}
            disabled={!startDate || !endDate || !selectedRepo || isMultiLoading}
            className="px-8"
          >
            {isMultiLoading ? '로딩 중...' : '적용'}
          </Button>
        </div>
        
        {/* 테스트 데이터 모드 알림 메시지 */}
        {startDate && 
          startDate.getFullYear() === 2024 && 
          startDate.getMonth() === 0 && 
          startDate.getDate() === 1 && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>테스트 모드 활성화됨</AlertTitle>
            <AlertDescription>
              현재 <strong>테스트 모드</strong>를 사용 중입니다. 실제 GitHub API를 호출하지 않고 테스트 데이터를 사용합니다.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* 메트릭스 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 배포 빈도 카드 */}
        <PerformanceIndicator
          title="배포 빈도"
          value={deploymentFrequency}
          unit="회/일"
          level={deploymentFrequencyLevel}
          description="소프트웨어가 얼마나 자주 배포되는지 측정합니다."
          isLoading={isMultiLoading}
        />
        
        {/* 변경 리드 타임 카드 */}
        <PerformanceIndicator
          title="변경 리드 타임"
          value={leadTimeForChanges}
          unit="시간"
          level={leadTimeLevel}
          description="코드 변경부터 배포까지 걸리는 시간을 측정합니다."
          isLoading={isMultiLoading}
        />
        
        {/* 변경 실패율 카드 */}
        <PerformanceIndicator
          title="변경 실패율"
          value={changeFailureRate}
          unit="%"
          level={changeFailureRateLevel}
          description="배포 후 장애 또는 롤백으로 이어지는 비율입니다."
          isLoading={isMultiLoading}
        />
        
        {/* 복구 시간 카드 */}
        <PerformanceIndicator
          title="평균 복구 시간"
          value={meanTimeToRestore}
          unit="시간"
          level={mttrLevel}
          description="장애 발생 후 서비스 복구까지 걸리는 평균 시간입니다."
          isLoading={isMultiLoading}
        />
      </div>
      
      {/* 탭 섹션 - 추가적인 차트 및 정보 */}
      <div className="mt-8">
        <Tabs defaultValue="charts">
          <TabsList>
            <TabsTrigger value="charts">차트</TabsTrigger>
            <TabsTrigger value="events">이벤트</TabsTrigger>
            <TabsTrigger value="details">상세 정보</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="mt-4">
            {multiRepoMode && (
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-blue-800">
                  <strong>다중 저장소 모드:</strong> {selectedRepos.length}개 저장소 선택됨
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* 배포 빈도 차트 */}
              <Card>
                <CardHeader>
                  <CardTitle>시간별 배포 빈도</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <DeploymentFrequencyChart 
                    multiRepoMode={multiRepoMode} 
                    multiRepoData={multiRepoData.deploymentFrequencyData} 
                    colorPalette={colorPalette}
                  />
                </CardContent>
              </Card>
              
              {/* 변경 실패율 차트 */}
              <Card>
                <CardHeader>
                  <CardTitle>변경 실패율 추이</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ChangeFailureRateChart 
                    multiRepoMode={multiRepoMode} 
                    multiRepoData={multiRepoData.changeFailureRateData} 
                    colorPalette={colorPalette}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 리드 타임 차트 */}
              <Card>
                <CardHeader>
                  <CardTitle>변경 리드 타임 추이</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <LeadTimeForChangesChart 
                    multiRepoMode={multiRepoMode} 
                    multiRepoData={multiRepoData.leadTimeData} 
                    colorPalette={colorPalette}
                  />
                </CardContent>
              </Card>
              
              {/* 복구 시간 차트 */}
              <Card>
                <CardHeader>
                  <CardTitle>평균 복구 시간</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <MeanTimeToRestoreChart 
                    multiRepoMode={multiRepoMode} 
                    multiRepoData={multiRepoData.mttrData} 
                    colorPalette={colorPalette}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="mt-4">
            <EventTimeline />
          </TabsContent>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>데이터 상세 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <p>선택한 기간: {startDate && endDate ? `${format(startDate, 'yyyy년 MM월 dd일', { locale: ko })} ~ ${format(endDate, 'yyyy년 MM월 dd일', { locale: ko })}` : '기간을 선택해주세요'}</p>
                <p>선택한 저장소: {selectedRepo || '저장소를 선택해주세요'}</p>
                <p>마지막 업데이트: {formattedLastUpdated}</p>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">DORA 메트릭스 성능 레벨</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>배포 빈도: <span className="font-medium">{getDORALevel('deploymentFrequency', deploymentFrequency) !== 'unknown' ? getDORALevel('deploymentFrequency', deploymentFrequency) : '데이터 없음'}</span></li>
                      <li>변경 리드 타임: <span className="font-medium">{getDORALevel('leadTimeForChanges', leadTimeForChanges) !== 'unknown' ? getDORALevel('leadTimeForChanges', leadTimeForChanges) : '데이터 없음'}</span></li>
                      <li>변경 실패율: <span className="font-medium">{getDORALevel('changeFailureRate', changeFailureRate) !== 'unknown' ? getDORALevel('changeFailureRate', changeFailureRate) : '데이터 없음'}</span></li>
                      <li>평균 복구 시간: <span className="font-medium">{getDORALevel('meanTimeToRestore', meanTimeToRestore) !== 'unknown' ? getDORALevel('meanTimeToRestore', meanTimeToRestore) : '데이터 없음'}</span></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">메트릭스 계산 방법</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>배포 빈도: 선택한 기간 내 배포 횟수 / 기간(일)</li>
                      <li>변경 리드 타임: 코드 변경부터 배포까지 평균 시간(시)</li>
                      <li>변경 실패율: 장애 발생 배포 수 / 전체 배포 수</li>
                      <li>평균 복구 시간: 장애 발생부터 복구까지 평균 시간(시)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard; 