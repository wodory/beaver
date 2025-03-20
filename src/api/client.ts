import axios from 'axios';
import { generateCacheKey, cachedApiRequest } from '../utils/cache';
import { 
  TrendDirection, 
  TrendStrength, 
  ModelType, 
  TrendResult, 
  PredictionResult,
  SeasonalityResult,
  SeasonalityType
} from '../services/metrics/TrendAnalysisService';
import { TimeSeriesPoint } from '../utils/time-series';

/**
 * 기본 API 클라이언트 설정
 */
const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:3001' : '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * 응답이 유효한 JSON인지 확인하는 헬퍼 함수
 */
const isValidJsonResponse = (data: any) => {
  return data !== undefined && data !== null;
};

/**
 * 에러 핸들링 함수
 */
const handleApiError = (error: any) => {
  // Axios 에러인 경우
  if (axios.isAxiosError(error)) {
    const response = error.response;
    if (response) {
      console.error('API 응답 에러:', response.status, response.data);
      throw new Error(`API 에러 (${response.status}): ${response.data.message || '알 수 없는 오류'}`);
    } else if (error.request) {
      console.error('API 요청 에러:', error.message);
      throw new Error('서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.');
    }
  }
  
  // 기타 에러
  console.error('API 호출 에러:', error);
  throw error;
};

/**
 * 저장소 목록 가져오기
 */
export const fetchRepositories = async (forceRefresh = false) => {
  const cacheKey = generateCacheKey('/repositories');
  
  console.log('fetchRepositories 함수 호출됨, API URL:', import.meta.env.DEV ? 'http://localhost:3001' : '/api');
  
  return cachedApiRequest(
    cacheKey,
    async () => {
      try {
        console.log('저장소 목록 API 요청 시작...');
        const response = await apiClient.get('/repositories');
        console.log('저장소 목록 API 응답 받음:', response.data);
        
        if (!isValidJsonResponse(response.data)) {
          console.error('저장소 목록 응답이 유효한 JSON이 아닙니다', response.data);
          throw new Error('API에서 유효한 JSON 응답을 받지 못했습니다');
        }
        
        return response.data;
      } catch (error) {
        console.error('저장소 목록 API 호출 중 오류 발생:', error);
        return handleApiError(error);
      }
    },
    { forceRefresh }
  );
};

/**
 * 개발자 지표 가져오기
 */
export const fetchDeveloperMetrics = async (developerId: string, startDate: Date, endDate: Date, forceRefresh = false) => {
  const params = { developerId, from: startDate.toISOString(), to: endDate.toISOString() };
  const cacheKey = generateCacheKey(`/metrics/developers/${developerId}`, params);
  
  return cachedApiRequest(
    cacheKey,
    async () => {
      try {
        const response = await apiClient.get(`/metrics/developers/${developerId}`, {
          params: { 
            from: startDate.toISOString(),
            to: endDate.toISOString()
          }
        });
        
        if (!isValidJsonResponse(response.data)) {
          console.error('개발자 지표 응답이 유효한 JSON이 아닙니다', response.data);
          throw new Error('API에서 유효한 JSON 응답을 받지 못했습니다');
        }
        
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
    { forceRefresh }
  );
};

/**
 * 저장소(프로젝트) 지표 가져오기
 */
export const fetchProjectMetrics = async (projectId: string, startDate: Date, endDate: Date, forceRefresh = false) => {
  const params = { projectId, from: startDate.toISOString(), to: endDate.toISOString() };
  const cacheKey = generateCacheKey(`/metrics/projects/${projectId}`, params);
  
  return cachedApiRequest(
    cacheKey,
    async () => {
      try {
        const response = await apiClient.get(`/metrics/projects/${projectId}`, {
          params: { 
            from: startDate.toISOString(),
            to: endDate.toISOString()
          }
        });
        
        if (!isValidJsonResponse(response.data)) {
          console.error('프로젝트 지표 응답이 유효한 JSON이 아닙니다', response.data);
          throw new Error('API에서 유효한 JSON 응답을 받지 못했습니다');
        }
        
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
    { forceRefresh }
  );
};

/**
 * 팀 지표 가져오기
 */
export const fetchTeamMetrics = async (teamId: string, startDate: Date, endDate: Date, forceRefresh = false) => {
  const params = { teamId, from: startDate.toISOString(), to: endDate.toISOString() };
  const cacheKey = generateCacheKey(`/metrics/teams/${teamId}`, params);
  
  return cachedApiRequest(
    cacheKey,
    async () => {
      try {
        // 백엔드 API 호출
        console.log('팀 메트릭스 API 요청 중...', teamId, startDate, endDate);
        
        const response = await apiClient.get(`/metrics/teams/${teamId}`, {
          params: { 
            from: startDate.toISOString(),
            to: endDate.toISOString()
          }
        });
        
        if (!isValidJsonResponse(response.data)) {
          console.error('팀 지표 응답이 유효한 JSON이 아닙니다', response.data);
          throw new Error('API에서 유효한 JSON 응답을 받지 못했습니다');
        }
        
        return response.data;
      } catch (error) {
        console.error('팀 메트릭스 가져오기 오류:', error);
        return handleApiError(error);
      }
    },
    { forceRefresh }
  );
};

/**
 * 팀 ID로 팀 이름 찾기
 */
function getTeamNameById(teamId: string): string {
  const teams = {
    'team1': '프론트엔드 팀',
    'team2': '백엔드 팀',
    'team3': '인프라 팀',
    'team4': '데이터 팀'
  };
  
  return teams[teamId as keyof typeof teams] || '알 수 없는 팀';
}

/**
 * 팀 목록 가져오기
 */
export const fetchTeams = async (forceRefresh = false) => {
  const cacheKey = generateCacheKey('/teams');
  
  return cachedApiRequest(
    cacheKey,
    async () => {
      try {
        // API 엔드포인트 문제로 인해 임시로 더미 데이터 반환
        console.log('팀 목록 API 요청 중...');
        
        // 실제 서버가 구현되면 이 주석을 해제하고 실제 API 호출 사용
        /* 
        const response = await apiClient.get('/teams');
        
        if (!isValidJsonResponse(response.data)) {
          console.error('팀 목록 응답이 유효한 JSON이 아닙니다', response.data);
          throw new Error('API에서 유효한 JSON 응답을 받지 못했습니다');
        }
        
        return response.data;
        */
        
        // 로컬 개발용 더미 데이터
        return [
          { id: 'team1', name: '프론트엔드 팀', memberCount: 5, description: '사용자 인터페이스 개발' },
          { id: 'team2', name: '백엔드 팀', memberCount: 7, description: 'API 및 서버 개발' },
          { id: 'team3', name: '인프라 팀', memberCount: 3, description: '클라우드 인프라 관리' },
          { id: 'team4', name: '데이터 팀', memberCount: 4, description: '데이터 분석 및 처리' },
        ];
      } catch (error) {
        console.error('팀 목록 가져오기 오류:', error);
        
        // 오류 발생 시에도 더미 데이터 반환
        return [
          { id: 'team1', name: '프론트엔드 팀', memberCount: 5, description: '사용자 인터페이스 개발' },
          { id: 'team2', name: '백엔드 팀', memberCount: 7, description: 'API 및 서버 개발' },
          { id: 'team3', name: '인프라 팀', memberCount: 3, description: '클라우드 인프라 관리' },
          { id: 'team4', name: '데이터 팀', memberCount: 4, description: '데이터 분석 및 처리' },
        ];
      }
    },
    { forceRefresh }
  );
};

/**
 * 데이터 동기화 실행하기
 */
export const syncRepository = async (repositoryId: string) => {
  try {
    const response = await apiClient.post(`/sync/repository/${repositoryId}`);
    
    if (!isValidJsonResponse(response.data)) {
      console.error('저장소 동기화 응답이 유효한 JSON이 아닙니다', response.data);
      throw new Error('API에서 유효한 JSON 응답을 받지 못했습니다');
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * 트렌드 분석 API 요청 옵션
 */
export interface TrendAnalysisOptions {
  // 이동 평균 윈도우 크기
  windowSize?: number;
  
  // 이상치 탐지 임계값
  anomalyThreshold?: number;
  
  // 시즌성 분석 포함 여부
  includeSeasonality?: boolean;
}

/**
 * 예측 API 요청 옵션
 */
export interface PredictionOptions {
  // 신뢰 구간 수준 (0.95 = 95%)
  confidenceLevel?: number;
  
  // 선형 회귀 모델 파라미터
  linearRegression?: {
    includeSeasonality?: boolean;
  };
  
  // 지수 평활법 모델 파라미터
  exponentialSmoothing?: {
    alpha?: number; // 평활 계수
  };
  
  // 이동 평균 모델 파라미터
  movingAverage?: {
    windowSize?: number; // 윈도우 크기
  };
}

/**
 * 트렌드 분석을 수행합니다.
 * 
 * @param metricType 메트릭 유형 (commitCount, prCount 등)
 * @param entityId 분석 대상 ID (사용자/저장소/팀)
 * @param entityType 분석 대상 유형 (developer, repository, team)
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @param options 트렌드 분석 옵션
 * @returns 트렌드 분석 결과
 */
export const analyzeTrend = async (
  metricType: string,
  entityId: string,
  entityType: 'developer' | 'repository' | 'team',
  startDate: Date,
  endDate: Date,
  options: TrendAnalysisOptions = {}
): Promise<TrendResult> => {
  const params = {
    metricType,
    from: startDate.toISOString(),
    to: endDate.toISOString(),
    windowSize: options.windowSize,
    anomalyThreshold: options.anomalyThreshold,
    includeSeasonality: options.includeSeasonality
  };
  
  const cacheKey = generateCacheKey(`/metrics/trend/${entityType}/${entityId}`, params);
  
  return cachedApiRequest(
    cacheKey,
    async () => {
      try {
        // 백엔드 API 준비되기 전까지 더미 데이터 사용
        console.log('트렌드 분석 API 요청 중...', metricType, entityId, entityType, startDate, endDate);
        
        // 여기서는 해당 대상의 메트릭 데이터를 가져와서 트렌드 분석 서비스로 처리해야 함
        // 최종적으로는 백엔드 API를 호출해야 하지만, 현재는 더미 데이터 사용
        
        // 메트릭 데이터 가져오기
        let metricData: { timestamp: Date; value: number }[] = [];
        
        // 엔티티 유형에 따른 메트릭 데이터 가져오기
        if (entityType === 'developer') {
          const devMetrics = await fetchDeveloperMetrics(entityId, startDate, endDate);
          
          if (metricType in devMetrics) {
            // 일별 데이터 추출
            metricData = devMetrics.dailyMetrics?.map((day: any) => ({
              timestamp: new Date(day.date),
              value: day[metricType as keyof typeof day] as number || 0
            })) || [];
          }
        }
        else if (entityType === 'repository') {
          const repoMetrics = await fetchProjectMetrics(entityId, startDate, endDate);
          
          if (metricType in repoMetrics) {
            // 일별 데이터 추출
            metricData = repoMetrics.dailyMetrics?.map((day: any) => ({
              timestamp: new Date(day.date),
              value: day[metricType as keyof typeof day] as number || 0
            })) || [];
          }
        }
        else if (entityType === 'team') {
          const teamMetrics = await fetchTeamMetrics(entityId, startDate, endDate);
          
          if (metricType in teamMetrics) {
            // 일별 데이터 추출
            // 팀 메트릭스의 경우 dailyActivity 속성을 사용
            const dailyData = (teamMetrics as any).dailyActivity || [];
            metricData = dailyData.map((day: any) => ({
              timestamp: new Date(day.date),
              value: day[metricType as keyof typeof day] as number || 0
            }));
          }
        }
        
        // 데이터가 없으면 더미 데이터 생성
        if (metricData.length === 0) {
          console.warn('메트릭 데이터가 없어 더미 데이터를 생성합니다.');
          
          const startTimestamp = startDate.getTime();
          const endTimestamp = endDate.getTime();
          const dayMillis = 24 * 60 * 60 * 1000;
          const days = Math.ceil((endTimestamp - startTimestamp) / dayMillis);
          
          // 일별 더미 데이터 생성 (기본 트렌드와 약간의 노이즈)
          for (let i = 0; i < days; i++) {
            const date = new Date(startTimestamp + i * dayMillis);
            
            // 기본 값은 10~20 사이
            let value = 10 + Math.floor(Math.random() * 10);
            
            // 상승 트렌드 추가
            value += Math.floor(i / 5);
            
            // 주말에는 값이 약간 감소
            const day = date.getDay();
            if (day === 0 || day === 6) {
              value = Math.max(0, value - 5);
            }
            
            metricData.push({
              timestamp: date,
              value
            });
          }
        }
        
        // 더미 트렌드 분석 결과 생성
        const trendDirection = Math.random() > 0.5 ? TrendDirection.INCREASING : TrendDirection.DECREASING;
        const trendStrength = [TrendStrength.WEAK, TrendStrength.MODERATE, TrendStrength.STRONG][Math.floor(Math.random() * 3)];
        
        // 추세선 생성
        const trendLine = metricData.map(point => {
          // 약간의 추세를 적용한 값
          const trendValue = trendDirection === TrendDirection.INCREASING
            ? point.value * (1 + 0.01 * (trendStrength === TrendStrength.STRONG ? 3 : trendStrength === TrendStrength.MODERATE ? 2 : 1))
            : point.value * (1 - 0.01 * (trendStrength === TrendStrength.STRONG ? 3 : trendStrength === TrendStrength.MODERATE ? 2 : 1));
          
          return {
            timestamp: point.timestamp,
            value: trendValue
          };
        });
        
        return {
          direction: trendDirection,
          strength: trendStrength,
          slope: trendDirection === TrendDirection.INCREASING ? 0.05 : -0.05,
          trendLine,
          standardDeviation: 2.5,
          changeRate: trendDirection === TrendDirection.INCREASING ? 15.3 : -8.7,
          data: metricData,
          anomalies: []
        };
      } catch (error) {
        return handleApiError(error);
      }
    },
    { forceRefresh: false }
  );
};

/**
 * 메트릭 예측을 수행합니다.
 * 
 * @param metricType 메트릭 유형 (commitCount, prCount 등)
 * @param entityId 분석 대상 ID (사용자/저장소/팀)
 * @param entityType 분석 대상 유형 (developer, repository, team)
 * @param startDate 학습 시작 날짜
 * @param endDate 학습 종료 날짜
 * @param forecastPeriod 예측 기간 (일)
 * @param modelType 예측 모델 유형
 * @param options 예측 옵션
 * @returns 예측 결과
 */
export const predictMetric = async (
  metricType: string,
  entityId: string,
  entityType: 'developer' | 'repository' | 'team',
  startDate: Date,
  endDate: Date,
  forecastPeriod: number = 30,
  modelType: ModelType = ModelType.LINEAR_REGRESSION,
  options: PredictionOptions = {}
): Promise<PredictionResult> => {
  const params = {
    metricType,
    from: startDate.toISOString(),
    to: endDate.toISOString(),
    forecastPeriod,
    modelType,
    confidenceLevel: options.confidenceLevel,
    ...options
  };
  
  const cacheKey = generateCacheKey(`/metrics/predict/${entityType}/${entityId}`, params);
  
  return cachedApiRequest(
    cacheKey,
    async () => {
      try {
        // 백엔드 API 준비되기 전까지 더미 데이터 사용
        console.log('예측 API 요청 중...', metricType, entityId, entityType, startDate, endDate, forecastPeriod, modelType);
        
        // 여기서도 트렌드 분석과 마찬가지로 해당 대상의 메트릭 데이터를 가져와야 함
        // 최종적으로는 백엔드 API를 호출해야 하지만, 현재는 더미 데이터 사용
        
        // 메트릭 데이터 가져오기 (트렌드 분석과 동일한 로직 사용)
        let metricData: TimeSeriesPoint[] = [];
        
        // 엔티티 유형에 따른 메트릭 데이터 가져오기
        if (entityType === 'developer') {
          const devMetrics = await fetchDeveloperMetrics(entityId, startDate, endDate);
          
          if (metricType in devMetrics) {
            // 일별 데이터 추출
            metricData = devMetrics.dailyMetrics?.map((day: any) => ({
              timestamp: new Date(day.date),
              value: day[metricType as keyof typeof day] as number || 0
            })) || [];
          }
        }
        else if (entityType === 'repository') {
          const repoMetrics = await fetchProjectMetrics(entityId, startDate, endDate);
          
          if (metricType in repoMetrics) {
            // 일별 데이터 추출
            metricData = repoMetrics.dailyMetrics?.map((day: any) => ({
              timestamp: new Date(day.date),
              value: day[metricType as keyof typeof day] as number || 0
            })) || [];
          }
        }
        else if (entityType === 'team') {
          const teamMetrics = await fetchTeamMetrics(entityId, startDate, endDate);
          
          if (metricType in teamMetrics) {
            // 일별 데이터 추출
            // 팀 메트릭스의 경우 dailyActivity 속성을 사용
            const dailyData = (teamMetrics as any).dailyActivity || [];
            metricData = dailyData.map((day: any) => ({
              timestamp: new Date(day.date),
              value: day[metricType as keyof typeof day] as number || 0
            }));
          }
        }
        
        // 데이터가 없으면 더미 데이터 생성
        if (metricData.length === 0) {
          console.warn('메트릭 데이터가 없어 더미 데이터를 생성합니다.');
          
          const startTimestamp = startDate.getTime();
          const endTimestamp = endDate.getTime();
          const dayMillis = 24 * 60 * 60 * 1000;
          const days = Math.ceil((endTimestamp - startTimestamp) / dayMillis);
          
          // 일별 더미 데이터 생성 (기본 트렌드와 약간의 노이즈)
          for (let i = 0; i < days; i++) {
            const date = new Date(startTimestamp + i * dayMillis);
            
            // 기본 값은 10~20 사이
            let value = 10 + Math.floor(Math.random() * 10);
            
            // 상승 트렌드 추가
            value += Math.floor(i / 5);
            
            // 주말에는 값이 약간 감소
            const day = date.getDay();
            if (day === 0 || day === 6) {
              value = Math.max(0, value - 5);
            }
            
            metricData.push({
              timestamp: date,
              value
            });
          }
        }
        
        // 예측 데이터 생성
        const lastTimestamp = endDate.getTime();
        const dayMillis = 24 * 60 * 60 * 1000;
        
        const predictions: TimeSeriesPoint[] = [];
        // 마지막 값 기준으로 약간의 증가 또는 감소 트렌드 적용
        const lastValue = metricData.length > 0 
          ? metricData[metricData.length - 1].value 
          : 10;
        
        const trend = Math.random() > 0.5 ? 0.02 : -0.01; // 증가 또는 감소 트렌드
        
        for (let i = 1; i <= forecastPeriod; i++) {
          const date = new Date(lastTimestamp + i * dayMillis);
          let value = lastValue * (1 + trend * i);
          
          // 주말에는 값이 약간 감소
          const day = date.getDay();
          if (day === 0 || day === 6) {
            value = Math.max(0, value * 0.8);
          }
          
          // 약간의 랜덤 변동 추가
          value += (Math.random() - 0.5) * 2;
          
          predictions.push({
            timestamp: date,
            value: Math.max(0, value)
          });
        }
        
        // 신뢰 구간 (예측의 ±15%)
        const confidenceLevel = options.confidenceLevel || 0.95;
        const marginOfError = 0.15;
        
        const upper = predictions.map(p => ({
          timestamp: p.timestamp,
          value: p.value * (1 + marginOfError)
        }));
        
        const lower = predictions.map(p => ({
          timestamp: p.timestamp,
          value: p.value * (1 - marginOfError)
        }));
        
        return {
          predictions,
          confidenceIntervals: {
            upper,
            lower,
            confidenceLevel
          },
          modelType,
          errorMetrics: {
            mape: 12.5,
            mse: 3.8
          },
          trainingData: metricData
        };
      } catch (error) {
        return handleApiError(error);
      }
    },
    { forceRefresh: false }
  );
};

/**
 * 시즌성 분석을 수행합니다.
 * 
 * @param metricType 메트릭 유형 (commitCount, prCount 등)
 * @param entityId 분석 대상 ID (사용자/저장소/팀)
 * @param entityType 분석 대상 유형 (developer, repository, team)
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @returns 시즌성 분석 결과
 */
export const analyzeSeasonality = async (
  metricType: string,
  entityId: string,
  entityType: 'developer' | 'repository' | 'team',
  startDate: Date,
  endDate: Date
): Promise<SeasonalityResult> => {
  const params = {
    metricType,
    from: startDate.toISOString(),
    to: endDate.toISOString()
  };
  
  const cacheKey = generateCacheKey(`/metrics/seasonality/${entityType}/${entityId}`, params);
  
  return cachedApiRequest(
    cacheKey,
    async () => {
      try {
        // 백엔드 API 준비되기 전까지 더미 데이터 사용
        console.log('시즌성 분석 API 요청 중...', metricType, entityId, entityType, startDate, endDate);
        
        // 더미 데이터: 주간 패턴 (월~금요일은 높고, 주말은 낮음)
        const weeklyPattern = {
          'mon': 18.5,
          'tue': 20.2,
          'wed': 19.8,
          'thu': 17.9,
          'fri': 16.3,
          'sat': 5.1,
          'sun': 4.2
        };
        
        return {
          type: SeasonalityType.WEEKLY,
          strength: 0.75,
          periodLength: 7,
          pattern: weeklyPattern
        };
      } catch (error) {
        return handleApiError(error);
      }
    },
    { forceRefresh: false }
  );
};

export default apiClient; 