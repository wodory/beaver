/**
 * 시계열 데이터 처리 유틸리티
 * 
 * 메트릭 데이터를 시계열 형식으로 변환하고 분석하는 함수들을 제공합니다.
 */

/**
 * 시계열 데이터 포인트 인터페이스
 */
export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

/**
 * 이동 평균 계산 결과 인터페이스
 */
export interface MovingAverageResult {
  timestamp: Date;
  value: number;
  movingAverage: number;
}

/**
 * 표준편차 계산 결과 인터페이스
 */
export interface StandardDeviationResult {
  timestamp: Date;
  value: number;
  standardDeviation: number;
}

/**
 * 이상치 탐지 결과 인터페이스
 */
export interface AnomalyDetectionResult {
  timestamp: Date;
  value: number;
  isAnomaly: boolean;
  expectedValue?: number;
  deviationPercent?: number;
}

/**
 * 데이터를 일별로 집계합니다.
 * 같은 날짜의 데이터 포인트들은 평균값으로 집계됩니다.
 * 
 * @param data 시계열 데이터 포인트 배열
 * @returns 일별로 집계된 데이터 포인트 배열
 */
export function aggregateByDay(data: TimeSeriesPoint[]): TimeSeriesPoint[] {
  if (!data || data.length === 0) return [];
  
  const dailyMap = new Map<string, { sum: number; count: number; date: Date }>();
  
  // 날짜별로 데이터 합산 및 카운트
  data.forEach(point => {
    const date = new Date(point.timestamp);
    date.setHours(0, 0, 0, 0); // 시간 부분을 0으로 설정하여 날짜만 비교
    
    const dateKey = date.toISOString().split('T')[0];
    
    if (dailyMap.has(dateKey)) {
      const entry = dailyMap.get(dateKey)!;
      entry.sum += point.value;
      entry.count += 1;
    } else {
      dailyMap.set(dateKey, { sum: point.value, count: 1, date });
    }
  });
  
  // 각 날짜별 평균 계산
  return Array.from(dailyMap.entries()).map(([_, { sum, count, date }]) => ({
    timestamp: date,
    value: sum / count
  })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * 데이터를 주별로 집계합니다.
 * 같은 주(월요일~일요일)의 데이터 포인트들은 평균값으로 집계됩니다.
 * 
 * @param data 시계열 데이터 포인트 배열
 * @returns 주별로 집계된 데이터 포인트 배열
 */
export function aggregateByWeek(data: TimeSeriesPoint[]): TimeSeriesPoint[] {
  if (!data || data.length === 0) return [];
  
  const weeklyMap = new Map<string, { sum: number; count: number; date: Date }>();
  
  // 주별로 데이터 합산 및 카운트
  data.forEach(point => {
    const date = new Date(point.timestamp);
    
    // 해당 주의 월요일 날짜 계산
    const day = date.getDay(); // 0(일) ~ 6(토)
    const diff = day === 0 ? 6 : day - 1; // 월요일을 기준으로 차이 계산
    
    const monday = new Date(date);
    monday.setDate(date.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    
    const weekKey = monday.toISOString().split('T')[0];
    
    if (weeklyMap.has(weekKey)) {
      const entry = weeklyMap.get(weekKey)!;
      entry.sum += point.value;
      entry.count += 1;
    } else {
      weeklyMap.set(weekKey, { sum: point.value, count: 1, date: monday });
    }
  });
  
  // 각 주별 평균 계산
  return Array.from(weeklyMap.entries()).map(([_, { sum, count, date }]) => ({
    timestamp: date,
    value: sum / count
  })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * 데이터를 월별로 집계합니다.
 * 같은 달의 데이터 포인트들은 평균값으로 집계됩니다.
 * 
 * @param data 시계열 데이터 포인트 배열
 * @returns 월별로 집계된 데이터 포인트 배열
 */
export function aggregateByMonth(data: TimeSeriesPoint[]): TimeSeriesPoint[] {
  if (!data || data.length === 0) return [];
  
  const monthlyMap = new Map<string, { sum: number; count: number; date: Date }>();
  
  // 월별로 데이터 합산 및 카운트
  data.forEach(point => {
    const date = new Date(point.timestamp);
    
    // 해당 월의 첫 날짜로 설정
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    
    const monthKey = firstDayOfMonth.toISOString().split('T')[0];
    
    if (monthlyMap.has(monthKey)) {
      const entry = monthlyMap.get(monthKey)!;
      entry.sum += point.value;
      entry.count += 1;
    } else {
      monthlyMap.set(monthKey, { sum: point.value, count: 1, date: firstDayOfMonth });
    }
  });
  
  // 각 월별 평균 계산
  return Array.from(monthlyMap.entries()).map(([_, { sum, count, date }]) => ({
    timestamp: date,
    value: sum / count
  })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * 데이터를 분기별로 집계합니다.
 * 같은 분기의 데이터 포인트들은 평균값으로 집계됩니다.
 * 
 * @param data 시계열 데이터 포인트 배열
 * @returns 분기별로 집계된 데이터 포인트 배열
 */
export function aggregateByQuarter(data: TimeSeriesPoint[]): TimeSeriesPoint[] {
  if (!data || data.length === 0) return [];
  
  const quarterlyMap = new Map<string, { sum: number; count: number; date: Date }>();
  
  // 분기별로 데이터 합산 및 카운트
  data.forEach(point => {
    const date = new Date(point.timestamp);
    const month = date.getMonth();
    
    // 분기 계산 (0-2: Q1, 3-5: Q2, 6-8: Q3, 9-11: Q4)
    const quarter = Math.floor(month / 3);
    
    // 해당 분기의 첫 날짜로 설정
    const firstDayOfQuarter = new Date(date.getFullYear(), quarter * 3, 1);
    
    const quarterKey = `${date.getFullYear()}-Q${quarter + 1}`;
    
    if (quarterlyMap.has(quarterKey)) {
      const entry = quarterlyMap.get(quarterKey)!;
      entry.sum += point.value;
      entry.count += 1;
    } else {
      quarterlyMap.set(quarterKey, { sum: point.value, count: 1, date: firstDayOfQuarter });
    }
  });
  
  // 각 분기별 평균 계산
  return Array.from(quarterlyMap.entries()).map(([_, { sum, count, date }]) => ({
    timestamp: date,
    value: sum / count
  })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * 이동 평균을 계산합니다.
 * 
 * @param data 시계열 데이터 포인트 배열
 * @param windowSize 이동 평균 계산에 사용할 윈도우 크기
 * @returns 이동 평균이 계산된 결과 배열
 */
export function calculateMovingAverage(data: TimeSeriesPoint[], windowSize: number): MovingAverageResult[] {
  if (!data || data.length === 0 || windowSize <= 0) return [];
  
  // 데이터 시간 순 정렬
  const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  const result: MovingAverageResult[] = [];
  
  for (let i = 0; i < sortedData.length; i++) {
    // 현재 위치에서 이전 windowSize-1개와 현재 값을 포함한 윈도우 생성
    const windowStart = Math.max(0, i - windowSize + 1);
    const window = sortedData.slice(windowStart, i + 1);
    
    // 윈도우 내 값의 평균 계산
    const sum = window.reduce((acc, point) => acc + point.value, 0);
    const avg = sum / window.length;
    
    result.push({
      timestamp: sortedData[i].timestamp,
      value: sortedData[i].value,
      movingAverage: avg
    });
  }
  
  return result;
}

/**
 * 이동 표준편차를 계산합니다.
 * 
 * @param data 시계열 데이터 포인트 배열
 * @param windowSize 표준편차 계산에 사용할 윈도우 크기
 * @returns 표준편차가 계산된 결과 배열
 */
export function calculateStandardDeviation(data: TimeSeriesPoint[], windowSize: number): StandardDeviationResult[] {
  if (!data || data.length === 0 || windowSize <= 0) return [];
  
  // 데이터 시간 순 정렬
  const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  const result: StandardDeviationResult[] = [];
  
  for (let i = 0; i < sortedData.length; i++) {
    // 현재 위치에서 이전 windowSize-1개와 현재 값을 포함한 윈도우 생성
    const windowStart = Math.max(0, i - windowSize + 1);
    const window = sortedData.slice(windowStart, i + 1);
    
    // 윈도우 내 값의 평균 계산
    const sum = window.reduce((acc, point) => acc + point.value, 0);
    const mean = sum / window.length;
    
    // 표준편차 계산
    const squaredDiffs = window.map(point => Math.pow(point.value - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / window.length;
    const stdDev = Math.sqrt(variance);
    
    result.push({
      timestamp: sortedData[i].timestamp,
      value: sortedData[i].value,
      standardDeviation: stdDev
    });
  }
  
  return result;
}

/**
 * 이상치를 탐지합니다. 이동 평균과 표준편차를 사용하여 정상 범위를 벗어난 값을 찾습니다.
 * 
 * @param data 시계열 데이터 포인트 배열
 * @param windowSize 이동 평균과 표준편차 계산에 사용할 윈도우 크기
 * @param thresholdFactor 이상치로 판단할 표준편차 배수 (기본값: 2.0)
 * @returns 이상치 탐지 결과 배열
 */
export function detectAnomalies(
  data: TimeSeriesPoint[], 
  windowSize: number,
  thresholdFactor: number = 2.0
): AnomalyDetectionResult[] {
  if (!data || data.length === 0 || windowSize <= 0) return [];
  
  // 이동 평균 및 표준편차 계산
  const stdDevResults = calculateStandardDeviation(data, windowSize);
  
  // 이상치 탐지
  return stdDevResults.map(point => {
    const isAnomaly = point.standardDeviation > 0 && 
                      Math.abs(point.value - point.standardDeviation) > thresholdFactor * point.standardDeviation;
    
    // 이동 평균으로 예상되는 값 계산
    const movingAvgResults = calculateMovingAverage(data, windowSize);
    const movingAvgPoint = movingAvgResults.find(
      p => p.timestamp.getTime() === point.timestamp.getTime()
    );
    
    const expectedValue = movingAvgPoint ? movingAvgPoint.movingAverage : undefined;
    
    // 예상값과의 편차 비율 계산
    const deviationPercent = expectedValue !== undefined && expectedValue !== 0
      ? ((point.value - expectedValue) / expectedValue) * 100
      : undefined;
    
    return {
      timestamp: point.timestamp,
      value: point.value,
      isAnomaly,
      expectedValue,
      deviationPercent
    };
  });
}

/**
 * 시계열 데이터를 정규화합니다 (0-1 범위로 변환).
 * 
 * @param data 시계열 데이터 포인트 배열
 * @returns 정규화된 데이터 포인트 배열
 */
export function normalizeData(data: TimeSeriesPoint[]): TimeSeriesPoint[] {
  if (!data || data.length === 0) return [];
  
  // 최소값과 최대값 찾기
  const values = data.map(point => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // 최대값과 최소값이 같으면 모든 값이 0.5로 정규화
  if (max === min) {
    return data.map(point => ({
      timestamp: point.timestamp,
      value: 0.5
    }));
  }
  
  // 정규화 (min-max 스케일링)
  return data.map(point => ({
    timestamp: point.timestamp,
    value: (point.value - min) / (max - min)
  }));
}

/**
 * 날짜 간격 생성 함수
 * 두 날짜 사이의 모든 날짜를 생성합니다 (빈 날짜 채우기용)
 * 
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @returns 날짜 배열
 */
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  // 시작일부터 종료일까지 하루씩 증가시키며 날짜 추가
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * 데이터의 빈 날짜를 채웁니다.
 * 
 * @param data 시계열 데이터 포인트 배열
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @param defaultValue 빈 날짜에 사용할 기본값 (기본: 0)
 * @returns 빈 날짜가 채워진 데이터 포인트 배열
 */
export function fillMissingDates(
  data: TimeSeriesPoint[], 
  startDate: Date, 
  endDate: Date,
  defaultValue: number = 0
): TimeSeriesPoint[] {
  if (!data || data.length === 0) return [];
  
  // 기존 데이터를 날짜별로 매핑
  const dataMap = new Map<string, number>();
  
  data.forEach(point => {
    const dateKey = new Date(point.timestamp).toISOString().split('T')[0];
    dataMap.set(dateKey, point.value);
  });
  
  // 시작일부터 종료일까지의 모든 날짜 생성
  const dateRange = generateDateRange(new Date(startDate), new Date(endDate));
  
  // 모든 날짜에 대해 데이터 포인트 생성
  return dateRange.map(date => {
    const dateKey = date.toISOString().split('T')[0];
    return {
      timestamp: date,
      value: dataMap.has(dateKey) ? dataMap.get(dateKey)! : defaultValue
    };
  });
} 