/**
 * 트렌드 분석 및 예측 화면 컴포넌트
 * 
 * 메트릭 데이터의 트렌드를 분석하고 미래 값을 예측하여 시각화합니다.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { addDays, subDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TrendLineChart } from './trends/TrendLineChart';
import { analyzeTrend, predictMetric, analyzeSeasonality } from '../../api/client';
import { 
  ModelType, 
  TrendResult, 
  PredictionResult, 
  SeasonalityResult,
  SeasonalityType
} from '../../services/metrics/TrendAnalysisService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  AlertCircle, 
  Calendar as CalendarIcon, 
  ChevronDown, 
  LineChart, 
  BarChart, 
  TrendingUp,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

// 메트릭 유형 선택 옵션
const metricOptions = [
  { value: 'commitCount', label: '커밋 수' },
  { value: 'prCount', label: 'PR 수' },
  { value: 'prMergeCount', label: '병합된 PR 수' },
  { value: 'reviewCount', label: '리뷰 수' },
  { value: 'issueCount', label: '이슈 수' },
  { value: 'totalAdditions', label: '코드 추가 라인' },
  { value: 'totalDeletions', label: '코드 삭제 라인' }
];

// 엔티티 유형 선택 옵션
const entityTypeOptions = [
  { value: 'developer', label: '개발자' },
  { value: 'repository', label: '저장소' },
  { value: 'team', label: '팀' }
];

// 모델 유형 선택 옵션
const modelTypeOptions = [
  { value: ModelType.LINEAR_REGRESSION, label: '선형 회귀' },
  { value: ModelType.EXPONENTIAL_SMOOTHING, label: '지수 평활법' },
  { value: ModelType.MOVING_AVERAGE, label: '이동 평균' }
];

/**
 * 트렌드 분석 및 예측 화면 컴포넌트
 */
export function TrendAnalysisView() {
  // 검색 파라미터 상태
  const [metricType, setMetricType] = useState('commitCount');
  const [entityType, setEntityType] = useState<'developer' | 'repository' | 'team'>('team');
  const [entityId, setEntityId] = useState('team1');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 90)); // 기본 90일 전부터
  const [endDate, setEndDate] = useState<Date>(new Date()); // 오늘까지
  const [forecastPeriod, setForecastPeriod] = useState(30); // 기본 30일 예측
  const [selectedTab, setSelectedTab] = useState('trend'); // 'trend' 또는 'prediction'
  const [selectedModelType, setSelectedModelType] = useState<ModelType>(ModelType.LINEAR_REGRESSION);
  
  // 결과 상태
  const [trendResult, setTrendResult] = useState<TrendResult | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [seasonalityResult, setSeasonalityResult] = useState<SeasonalityResult | null>(null);
  
  // 로딩 및 오류 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 선택된 메트릭 라벨 가져오기
  const selectedMetricLabel = useMemo(() => {
    return metricOptions.find(option => option.value === metricType)?.label || metricType;
  }, [metricType]);
  
  // 엔티티 선택 옵션
  const entityOptions = useMemo(() => {
    // 실제로는 API로 가져와야 함
    if (entityType === 'developer') {
      return [
        { value: 'dev1', label: '김개발' },
        { value: 'dev2', label: '이코더' },
        { value: 'dev3', label: '박엔지니어' }
      ];
    } else if (entityType === 'repository') {
      return [
        { value: 'repo1', label: 'frontend-app' },
        { value: 'repo2', label: 'backend-api' },
        { value: 'repo3', label: 'shared-lib' }
      ];
    } else if (entityType === 'team') {
      return [
        { value: 'team1', label: '프론트엔드 팀' },
        { value: 'team2', label: '백엔드 팀' },
        { value: 'team3', label: '인프라 팀' },
        { value: 'team4', label: '데이터 팀' }
      ];
    }
    return [];
  }, [entityType]);
  
  // 날짜 범위 포맷
  const formattedDateRange = useMemo(() => {
    return `${format(startDate, 'yyyy년 MM월 dd일', { locale: ko })} ~ ${format(endDate, 'yyyy년 MM월 dd일', { locale: ko })}`;
  }, [startDate, endDate]);
  
  // 데이터 분석 및 예측 수행
  const analyzeAndPredict = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 트렌드 분석 API 호출
      const trend = await analyzeTrend(
        metricType,
        entityId,
        entityType,
        startDate,
        endDate,
        { windowSize: 7 }
      );
      setTrendResult(trend);
      
      // 시즌성 분석 API 호출
      const seasonality = await analyzeSeasonality(
        metricType,
        entityId,
        entityType,
        startDate,
        endDate
      );
      setSeasonalityResult(seasonality);
      
      // 예측 API 호출
      const prediction = await predictMetric(
        metricType,
        entityId,
        entityType,
        startDate,
        endDate,
        forecastPeriod,
        selectedModelType,
        { confidenceLevel: 0.95 }
      );
      setPredictionResult(prediction);
    } catch (err: any) {
      setError(`분석 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // 시즌성 패턴 해석
  const getSeasonalityDescription = () => {
    if (!seasonalityResult) return '시즌성 분석 데이터가 없습니다.';
    
    if (seasonalityResult.type === SeasonalityType.NONE || seasonalityResult.strength < 0.1) {
      return '뚜렷한 시즌성이 감지되지 않았습니다.';
    }
    
    if (seasonalityResult.type === SeasonalityType.WEEKLY) {
      // 주간 패턴 설명
      const pattern = seasonalityResult.pattern;
      const values = Object.entries(pattern)
        .map(([day, value]) => ({ day, value }))
        .sort((a, b) => b.value - a.value);
      
      const highestDays = values.slice(0, 2).map(v => v.day);
      const lowestDays = values.slice(-2).map(v => v.day);
      
      const dayMap: Record<string, string> = {
        'sun': '일요일',
        'mon': '월요일',
        'tue': '화요일',
        'wed': '수요일',
        'thu': '목요일',
        'fri': '금요일',
        'sat': '토요일'
      };
      
      return `주간 패턴이 감지되었습니다. ${highestDays.map(d => dayMap[d]).join(', ')}에 활동이 가장 많고, ${lowestDays.map(d => dayMap[d]).join(', ')}에 활동이 가장 적습니다.`;
    }
    
    if (seasonalityResult.type === SeasonalityType.MONTHLY) {
      // 월간 패턴 설명
      return '월간 패턴이 감지되었습니다. 월별 활동량에 차이가 있습니다.';
    }
    
    return `${seasonalityResult.type} 패턴이 감지되었습니다. 강도: ${Math.round(seasonalityResult.strength * 100)}%`;
  };
  
  // 컴포넌트 마운트 시 초기 분석 수행
  useEffect(() => {
    analyzeAndPredict();
  }, []);
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">트렌드 분석 및 예측</h1>
        </div>
        
        {/* 검색 필터 */}
        <Card>
          <CardHeader>
            <CardTitle>분석 설정</CardTitle>
            <CardDescription>분석할 메트릭과 데이터 범위를 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 메트릭 유형 선택 */}
              <div className="space-y-2">
                <Label htmlFor="metricType">메트릭 유형</Label>
                <Select
                  value={metricType}
                  onValueChange={(value) => setMetricType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="메트릭 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {metricOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 엔티티 유형 선택 */}
              <div className="space-y-2">
                <Label htmlFor="entityType">분석 대상 유형</Label>
                <Select
                  value={entityType}
                  onValueChange={(value: 'developer' | 'repository' | 'team') => {
                    setEntityType(value);
                    // 기본값으로 첫 번째 엔티티 선택
                    if (entityOptions.length > 0) {
                      setEntityId(entityOptions[0].value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="대상 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 엔티티 선택 */}
              <div className="space-y-2">
                <Label htmlFor="entityId">분석 대상</Label>
                <Select
                  value={entityId}
                  onValueChange={(value) => setEntityId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="대상 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 날짜 범위 선택 */}
              <div className="space-y-2">
                <Label htmlFor="dateRange">날짜 범위</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>{formattedDateRange}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{
                        from: startDate,
                        to: endDate
                      }}
                      onSelect={(range) => {
                        if (range?.from) setStartDate(range.from);
                        if (range?.to) setEndDate(range.to);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* 예측 설정 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="forecastPeriod">예측 기간 (일)</Label>
                <Input
                  id="forecastPeriod"
                  type="number"
                  min={1}
                  max={365}
                  value={forecastPeriod}
                  onChange={(e) => setForecastPeriod(parseInt(e.target.value) || 30)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="modelType">예측 모델</Label>
                <Select
                  value={selectedModelType}
                  onValueChange={(value: ModelType) => setSelectedModelType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="모델 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* 분석 버튼 */}
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={analyzeAndPredict} 
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    트렌드 분석 및 예측
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* 에러 메시지 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* 결과 탭 */}
        <Tabs defaultValue="trend" onValueChange={(value) => setSelectedTab(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trend">
              <TrendingUp className="mr-2 h-4 w-4" />
              트렌드 분석
            </TabsTrigger>
            <TabsTrigger value="prediction">
              <LineChart className="mr-2 h-4 w-4" />
              예측 결과
            </TabsTrigger>
          </TabsList>
          
          {/* 트렌드 분석 탭 */}
          <TabsContent value="trend">
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="w-full h-[400px] rounded-md" />
                </CardContent>
              </Card>
            ) : trendResult ? (
              <>
                <TrendLineChart
                  title={`${entityOptions.find(e => e.value === entityId)?.label || entityId}의 ${selectedMetricLabel} 트렌드`}
                  data={trendResult.data}
                  trend={trendResult}
                  prediction={undefined}
                  showPrediction={false}
                  yAxisLabel={selectedMetricLabel}
                  height={400}
                />
                
                {/* 시즌성 정보 */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>시즌성 분석</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {getSeasonalityDescription()}
                    </p>
                    
                    {seasonalityResult && seasonalityResult.type !== SeasonalityType.NONE && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">시즌별 활동 패턴</h4>
                        <div className="grid grid-cols-7 gap-2">
                          {Object.entries(seasonalityResult.pattern).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <div 
                                className="h-20 bg-primary rounded-md" 
                                style={{ 
                                  opacity: Math.max(0.2, value / Math.max(...Object.values(seasonalityResult.pattern))),
                                }}
                              />
                              <div className="mt-1 text-sm">{key}</div>
                              <div className="text-sm font-medium">{value.toFixed(1)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>분석 데이터가 없습니다. 분석 설정을 변경하고 분석 버튼을 클릭하세요.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* 예측 결과 탭 */}
          <TabsContent value="prediction">
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="w-full h-[400px] rounded-md" />
                </CardContent>
              </Card>
            ) : predictionResult ? (
              <>
                <TrendLineChart
                  title={`${entityOptions.find(e => e.value === entityId)?.label || entityId}의 ${selectedMetricLabel} 예측 (${forecastPeriod}일)`}
                  data={predictionResult.trainingData}
                  trend={trendResult || undefined}
                  prediction={predictionResult}
                  yAxisLabel={selectedMetricLabel}
                  height={400}
                />
                
                {/* 예측 정확도 정보 */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>예측 모델 정보</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">모델 종류</h4>
                        <p className="text-muted-foreground">
                          {modelTypeOptions.find(m => m.value === predictionResult.modelType)?.label || predictionResult.modelType}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">신뢰 구간</h4>
                        <p className="text-muted-foreground">
                          {predictionResult.confidenceIntervals.confidenceLevel * 100}% 
                          (±{Math.round((predictionResult.confidenceIntervals.upper[0].value / predictionResult.predictions[0].value - 1) * 100)}%)
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">오차율 (MAPE)</h4>
                        <p className="text-muted-foreground">
                          {predictionResult.errorMetrics.mape?.toFixed(2)}%
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">예측 기간</h4>
                        <p className="text-muted-foreground">
                          {format(predictionResult.predictions[0].timestamp, 'yyyy.MM.dd', { locale: ko })} ~ 
                          {format(predictionResult.predictions[predictionResult.predictions.length - 1].timestamp, 'yyyy.MM.dd', { locale: ko })}
                          ({predictionResult.predictions.length}일)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>예측 데이터가 없습니다. 분석 설정을 변경하고 분석 버튼을 클릭하세요.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 