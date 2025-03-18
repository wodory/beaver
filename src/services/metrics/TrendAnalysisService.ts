/**
 * 트렌드 분석 및 예측 서비스
 * 
 * 수집된 메트릭 데이터의 추세를 분석하고 미래 값을 예측하는 기능을 제공합니다.
 */

import { 
  TimeSeriesPoint, 
  calculateMovingAverage, 
  calculateStandardDeviation,
  detectAnomalies,
  normalizeData,
  aggregateByDay,
  aggregateByWeek,
  aggregateByMonth,
  aggregateByQuarter,
  fillMissingDates
} from '../../utils/time-series';

/**
 * 트렌드 방향
 */
export enum TrendDirection {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  FLUCTUATING = 'fluctuating'
}

/**
 * 트렌드 강도
 */
export enum TrendStrength {
  STRONG = 'strong',
  MODERATE = 'moderate',
  WEAK = 'weak',
  NONE = 'none'
}

/**
 * 트렌드 분석 결과 인터페이스
 */
export interface TrendResult {
  // 트렌드 방향 (증가, 감소, 안정, 변동)
  direction: TrendDirection;
  
  // 트렌드 강도 (강함, 중간, 약함, 없음)
  strength: TrendStrength;
  
  // 트렌드 기울기 (선형 회귀 기울기)
  slope: number;
  
  // 추세선 데이터 포인트 (시각화용)
  trendLine: TimeSeriesPoint[];
  
  // 표준 편차 (변동성 지표)
  standardDeviation: number;
  
  // 변화율 (처음과 마지막 데이터 포인트 간)
  changeRate: number;
  
  // 분석된 원본 데이터
  data: TimeSeriesPoint[];
  
  // 이상치 목록
  anomalies?: TimeSeriesPoint[];
}

/**
 * 시즌성 유형
 */
export enum SeasonalityType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  NONE = 'none'
}

/**
 * 시즌성 분석 결과 인터페이스
 */
export interface SeasonalityResult {
  // 시즌성 유형 (주간, 월간, 분기별, 연간, 없음)
  type: SeasonalityType;
  
  // 시즌성 강도 (0~1 사이 값)
  strength: number;
  
  // 주기 길이 (일 단위)
  periodLength: number;
  
  // 시즌별 평균 패턴
  pattern: { [key: string]: number };
}

/**
 * 예측 모델 유형
 */
export enum ModelType {
  LINEAR_REGRESSION = 'linearRegression',
  EXPONENTIAL_SMOOTHING = 'exponentialSmoothing',
  MOVING_AVERAGE = 'movingAverage'
}

/**
 * 예측 결과 인터페이스
 */
export interface PredictionResult {
  // 예측 값 (타임스탬프와 예측값으로 구성된 배열)
  predictions: TimeSeriesPoint[];
  
  // 신뢰 구간 (상한/하한 값과 신뢰 수준)
  confidenceIntervals: {
    upper: TimeSeriesPoint[];
    lower: TimeSeriesPoint[];
    confidenceLevel: number;
  };
  
  // 사용된 모델 유형
  modelType: ModelType;
  
  // 예측 오차 지표 (훈련 데이터 기준)
  errorMetrics: {
    mape?: number;  // Mean Absolute Percentage Error
    mse?: number;   // Mean Squared Error
  };
  
  // 원본 학습 데이터
  trainingData: TimeSeriesPoint[];
}

/**
 * 트렌드 분석 서비스 클래스
 */
export class TrendAnalysisService {
  
  /**
   * 시계열 데이터의 트렌드를 감지합니다.
   * 
   * @param data 분석할 시계열 데이터
   * @param windowSize 이동 평균 계산에 사용할 윈도우 크기
   * @returns 트렌드 분석 결과
   */
  detectTrend(data: TimeSeriesPoint[], windowSize: number = 7): TrendResult {
    if (!data || data.length === 0) {
      throw new Error('분석할 데이터가 없습니다.');
    }
    
    // 날짜순으로 정렬
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // 선형 회귀 계산
    const { slope, trendLine } = this.calculateLinearRegression(sortedData);
    
    // 표준 편차 계산
    const values = sortedData.map(point => point.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    // 변화율 계산 (처음과 마지막 데이터 포인트 간)
    const firstValue = sortedData[0].value;
    const lastValue = sortedData[sortedData.length - 1].value;
    const changeRate = firstValue !== 0 ? (lastValue - firstValue) / Math.abs(firstValue) * 100 : 0;
    
    // 트렌드 방향 결정
    let direction: TrendDirection;
    if (Math.abs(slope) < 0.001) {
      direction = TrendDirection.STABLE;
    } else if (slope > 0) {
      direction = TrendDirection.INCREASING;
    } else {
      direction = TrendDirection.DECREASING;
    }
    
    // 트렌드 강도 결정
    let strength: TrendStrength;
    const slopeStrength = Math.abs(slope);
    
    if (slopeStrength > 0.1) {
      strength = TrendStrength.STRONG;
    } else if (slopeStrength > 0.05) {
      strength = TrendStrength.MODERATE;
    } else if (slopeStrength > 0.01) {
      strength = TrendStrength.WEAK;
    } else {
      strength = TrendStrength.NONE;
    }
    
    // 이상치 탐지
    const anomalies = detectAnomalies(sortedData, windowSize).filter(point => point.isAnomaly);
    
    return {
      direction,
      strength,
      slope,
      trendLine,
      standardDeviation,
      changeRate,
      data: sortedData,
      anomalies: anomalies.map(a => ({ timestamp: a.timestamp, value: a.value }))
    };
  }
  
  /**
   * 선형 회귀를 계산합니다.
   * 
   * @param data 시계열 데이터
   * @returns 회귀 분석 결과 (기울기, y절편, 추세선)
   */
  private calculateLinearRegression(data: TimeSeriesPoint[]) {
    const n = data.length;
    
    // X 값은 타임스탬프를 숫자로 변환 (일 단위로 정규화)
    const startTime = data[0].timestamp.getTime();
    const msPerDay = 24 * 60 * 60 * 1000;
    
    const x = data.map(point => (point.timestamp.getTime() - startTime) / msPerDay);
    const y = data.map(point => point.value);
    
    // 평균 계산
    const avgX = x.reduce((sum, val) => sum + val, 0) / n;
    const avgY = y.reduce((sum, val) => sum + val, 0) / n;
    
    // 기울기 계산: slope = Σ(x-avgX)(y-avgY) / Σ(x-avgX)²
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - avgX) * (y[i] - avgY);
      denominator += Math.pow(x[i] - avgX, 2);
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    
    // y절편 계산: intercept = avgY - slope * avgX
    const intercept = avgY - slope * avgX;
    
    // 추세선 데이터 생성
    const trendLine = data.map((point, index) => ({
      timestamp: point.timestamp,
      value: intercept + slope * x[index]
    }));
    
    return { slope, intercept, trendLine };
  }
  
  /**
   * 시즌성(주기성)을 분석합니다.
   * 
   * @param data 시계열 데이터
   * @returns 시즌성 분석 결과
   */
  analyzeSeasonality(data: TimeSeriesPoint[]): SeasonalityResult {
    if (!data || data.length < 14) { // 최소 2주 이상의 데이터 필요
      return {
        type: SeasonalityType.NONE,
        strength: 0,
        periodLength: 0,
        pattern: {}
      };
    }
    
    // 날짜순으로 정렬
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // 주간 패턴 분석
    const weeklyPattern = this.calculateWeeklyPattern(sortedData);
    const weeklyStrength = this.calculatePatternStrength(weeklyPattern);
    
    // 월간 패턴 분석 (충분한 데이터가 있는 경우)
    let monthlyPattern = {};
    let monthlyStrength = 0;
    
    if (sortedData.length >= 60) { // 최소 2개월 이상의 데이터
      monthlyPattern = this.calculateMonthlyPattern(sortedData);
      monthlyStrength = this.calculatePatternStrength(monthlyPattern);
    }
    
    // 가장 강한 패턴 선택
    if (weeklyStrength > 0.3 && weeklyStrength >= monthlyStrength) {
      return {
        type: SeasonalityType.WEEKLY,
        strength: weeklyStrength,
        periodLength: 7,
        pattern: weeklyPattern
      };
    } else if (monthlyStrength > 0.3) {
      return {
        type: SeasonalityType.MONTHLY,
        strength: monthlyStrength,
        periodLength: 30,
        pattern: monthlyPattern
      };
    } else {
      return {
        type: SeasonalityType.NONE,
        strength: 0,
        periodLength: 0,
        pattern: {}
      };
    }
  }
  
  /**
   * 주간 패턴을 계산합니다.
   * 
   * @param data 시계열 데이터
   * @returns 요일별 평균값 맵
   */
  private calculateWeeklyPattern(data: TimeSeriesPoint[]): { [key: string]: number } {
    const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const pattern: { [key: string]: { sum: number; count: number } } = {};
    
    // 요일별로 초기화
    daysOfWeek.forEach(day => pattern[day] = { sum: 0, count: 0 });
    
    // 요일별로 값 합산
    data.forEach(point => {
      const day = daysOfWeek[point.timestamp.getDay()];
      pattern[day].sum += point.value;
      pattern[day].count += 1;
    });
    
    // 요일별 평균 계산
    const result: { [key: string]: number } = {};
    daysOfWeek.forEach(day => {
      result[day] = pattern[day].count > 0 ? pattern[day].sum / pattern[day].count : 0;
    });
    
    return result;
  }
  
  /**
   * 월간 패턴을 계산합니다.
   * 
   * @param data 시계열 데이터
   * @returns 월별 평균값 맵
   */
  private calculateMonthlyPattern(data: TimeSeriesPoint[]): { [key: string]: number } {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const pattern: { [key: string]: { sum: number; count: number } } = {};
    
    // 월별로 초기화
    months.forEach(month => pattern[month] = { sum: 0, count: 0 });
    
    // 월별로 값 합산
    data.forEach(point => {
      const month = months[point.timestamp.getMonth()];
      pattern[month].sum += point.value;
      pattern[month].count += 1;
    });
    
    // 월별 평균 계산
    const result: { [key: string]: number } = {};
    months.forEach(month => {
      result[month] = pattern[month].count > 0 ? pattern[month].sum / pattern[month].count : 0;
    });
    
    return result;
  }
  
  /**
   * 패턴의 강도를 계산합니다. 변동성이 클수록 강도가 높음
   * 
   * @param pattern 패턴 객체
   * @returns 패턴 강도 (0~1 사이 값)
   */
  private calculatePatternStrength(pattern: { [key: string]: number }): number {
    const values = Object.values(pattern).filter(v => v > 0);
    
    if (values.length <= 1) return 0;
    
    // 평균과 표준편차 계산
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // 변동계수 (CV = 표준편차 / 평균) 계산, 0~1 사이 값으로 정규화
    const cv = mean !== 0 ? stdDev / mean : 0;
    return Math.min(cv, 1);
  }
  
  /**
   * 선형 회귀 기반 예측을 수행합니다.
   * 
   * @param data 학습 데이터
   * @param forecastPeriod 예측할 기간 (일 단위)
   * @param confidenceLevel 신뢰 구간 수준 (0.95 = 95%)
   * @returns 예측 결과
   */
  predictLinearRegression(
    data: TimeSeriesPoint[], 
    forecastPeriod: number,
    confidenceLevel: number = 0.95
  ): PredictionResult {
    if (!data || data.length === 0) {
      throw new Error('예측할 데이터가 없습니다.');
    }
    
    // 날짜순으로 정렬
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // 선형 회귀 계산
    const { slope, intercept, trendLine } = this.calculateLinearRegression(sortedData);
    
    // 예측 기간 동안의 타임스탬프 생성
    const predictions: TimeSeriesPoint[] = [];
    const lastTimestamp = sortedData[sortedData.length - 1].timestamp;
    const msPerDay = 24 * 60 * 60 * 1000;
    
    for (let i = 1; i <= forecastPeriod; i++) {
      const newTimestamp = new Date(lastTimestamp.getTime() + i * msPerDay);
      
      // 예측 위치 계산 (일 단위로 정규화된 x 값)
      const startTime = sortedData[0].timestamp.getTime();
      const x = (newTimestamp.getTime() - startTime) / msPerDay;
      
      // 예측값 계산
      const predictedValue = intercept + slope * x;
      
      predictions.push({
        timestamp: newTimestamp,
        value: predictedValue
      });
    }
    
    // 신뢰 구간 계산
    const confidenceIntervals = this.calculateConfidenceIntervals(
      sortedData, 
      predictions, 
      trendLine, 
      confidenceLevel
    );
    
    // 예측 오차 계산 (학습 데이터에 대한)
    const errorMetrics = this.calculateErrorMetrics(sortedData, trendLine);
    
    return {
      predictions,
      confidenceIntervals,
      modelType: ModelType.LINEAR_REGRESSION,
      errorMetrics,
      trainingData: sortedData
    };
  }
  
  /**
   * 지수 평활법 기반 예측을 수행합니다.
   * 
   * @param data 학습 데이터
   * @param forecastPeriod 예측할 기간 (일 단위)
   * @param alpha 평활 계수 (0~1)
   * @param confidenceLevel 신뢰 구간 수준 (0.95 = 95%)
   * @returns 예측 결과
   */
  predictExponentialSmoothing(
    data: TimeSeriesPoint[], 
    forecastPeriod: number,
    alpha: number = 0.3,
    confidenceLevel: number = 0.95
  ): PredictionResult {
    if (!data || data.length === 0) {
      throw new Error('예측할 데이터가 없습니다.');
    }
    
    if (alpha < 0 || alpha > 1) {
      throw new Error('알파 값은 0과 1 사이여야 합니다.');
    }
    
    // 날짜순으로 정렬
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // 지수 평활법 적용
    const smoothedData: TimeSeriesPoint[] = [];
    let lastSmoothedValue = sortedData[0].value;
    
    // 학습 데이터에 대한 지수 평활 계산
    for (let i = 0; i < sortedData.length; i++) {
      if (i === 0) {
        smoothedData.push({
          timestamp: sortedData[i].timestamp,
          value: lastSmoothedValue
        });
      } else {
        lastSmoothedValue = alpha * sortedData[i].value + (1 - alpha) * lastSmoothedValue;
        smoothedData.push({
          timestamp: sortedData[i].timestamp,
          value: lastSmoothedValue
        });
      }
    }
    
    // 미래 예측 (마지막 평활값 유지)
    const predictions: TimeSeriesPoint[] = [];
    const lastTimestamp = sortedData[sortedData.length - 1].timestamp;
    const msPerDay = 24 * 60 * 60 * 1000;
    
    for (let i = 1; i <= forecastPeriod; i++) {
      const newTimestamp = new Date(lastTimestamp.getTime() + i * msPerDay);
      predictions.push({
        timestamp: newTimestamp,
        value: lastSmoothedValue
      });
    }
    
    // 신뢰 구간 계산
    const confidenceIntervals = this.calculateConfidenceIntervals(
      sortedData, 
      predictions, 
      smoothedData, 
      confidenceLevel
    );
    
    // 예측 오차 계산
    const errorMetrics = this.calculateErrorMetrics(sortedData, smoothedData);
    
    return {
      predictions,
      confidenceIntervals,
      modelType: ModelType.EXPONENTIAL_SMOOTHING,
      errorMetrics,
      trainingData: sortedData
    };
  }
  
  /**
   * 이동 평균 기반 예측을 수행합니다.
   * 
   * @param data 학습 데이터
   * @param forecastPeriod 예측할 기간 (일 단위)
   * @param windowSize 이동 평균 계산에 사용할 윈도우 크기
   * @param confidenceLevel 신뢰 구간 수준 (0.95 = 95%)
   * @returns 예측 결과
   */
  predictMovingAverage(
    data: TimeSeriesPoint[], 
    forecastPeriod: number,
    windowSize: number = 7,
    confidenceLevel: number = 0.95
  ): PredictionResult {
    if (!data || data.length === 0) {
      throw new Error('예측할 데이터가 없습니다.');
    }
    
    if (windowSize <= 0 || windowSize > data.length) {
      throw new Error('윈도우 크기가 유효하지 않습니다.');
    }
    
    // 날짜순으로 정렬
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // 이동 평균 계산
    const movingAvgResults = calculateMovingAverage(sortedData, windowSize);
    const fittedData = movingAvgResults.map(result => ({
      timestamp: result.timestamp,
      value: result.movingAverage
    }));
    
    // 예측 값은 마지막 N개 포인트의 평균
    const lastNPoints = sortedData.slice(-windowSize);
    const predictedValue = lastNPoints.reduce((sum, point) => sum + point.value, 0) / lastNPoints.length;
    
    // 미래 예측 (고정 값)
    const predictions: TimeSeriesPoint[] = [];
    const lastTimestamp = sortedData[sortedData.length - 1].timestamp;
    const msPerDay = 24 * 60 * 60 * 1000;
    
    for (let i = 1; i <= forecastPeriod; i++) {
      const newTimestamp = new Date(lastTimestamp.getTime() + i * msPerDay);
      predictions.push({
        timestamp: newTimestamp,
        value: predictedValue
      });
    }
    
    // 신뢰 구간 계산
    const confidenceIntervals = this.calculateConfidenceIntervals(
      sortedData, 
      predictions, 
      fittedData, 
      confidenceLevel
    );
    
    // 예측 오차 계산
    const errorMetrics = this.calculateErrorMetrics(sortedData, fittedData);
    
    return {
      predictions,
      confidenceIntervals,
      modelType: ModelType.MOVING_AVERAGE,
      errorMetrics,
      trainingData: sortedData
    };
  }
  
  /**
   * 예측값의 신뢰 구간을 계산합니다.
   * 
   * @param originalData 원본 학습 데이터
   * @param predictions 예측 데이터
   * @param fittedData 모델이 학습 데이터에 적합한 값
   * @param confidenceLevel 신뢰 수준 (0~1)
   * @returns 신뢰 구간 객체
   */
  private calculateConfidenceIntervals(
    originalData: TimeSeriesPoint[],
    predictions: TimeSeriesPoint[],
    fittedData: TimeSeriesPoint[],
    confidenceLevel: number
  ) {
    // 예측 오차의 표준편차 계산
    const errors = originalData.map((point, index) => {
      const fitted = fittedData[index] ? fittedData[index].value : point.value;
      return point.value - fitted;
    });
    
    const meanError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
    const squaredDiffs = errors.map(err => Math.pow(err - meanError, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / errors.length;
    const stdError = Math.sqrt(variance);
    
    // 신뢰 구간 계산 (정규분포 가정)
    // 95% 신뢰 구간은 약 ±1.96 * 표준오차
    const zScore = this.getZScore(confidenceLevel);
    const marginOfError = zScore * stdError;
    
    // 상한 및 하한 신뢰 구간 계산
    const upper = predictions.map(point => ({
      timestamp: point.timestamp,
      value: point.value + marginOfError
    }));
    
    const lower = predictions.map(point => ({
      timestamp: point.timestamp,
      value: point.value - marginOfError
    }));
    
    return {
      upper,
      lower,
      confidenceLevel
    };
  }
  
  /**
   * 신뢰 수준에 따른 Z 점수를 반환합니다.
   * 
   * @param confidenceLevel 신뢰 수준 (0~1)
   * @returns Z 점수
   */
  private getZScore(confidenceLevel: number): number {
    // 일반적인 신뢰 수준에 대한 Z 점수
    if (confidenceLevel >= 0.99) return 2.576; // 99%
    if (confidenceLevel >= 0.98) return 2.326; // 98%
    if (confidenceLevel >= 0.95) return 1.96;  // 95%
    if (confidenceLevel >= 0.90) return 1.645; // 90%
    if (confidenceLevel >= 0.85) return 1.44;  // 85%
    if (confidenceLevel >= 0.80) return 1.28;  // 80%
    return 1.0; // 기본값
  }
  
  /**
   * 예측 모델의 오차 지표를 계산합니다.
   * 
   * @param actual 실제 데이터
   * @param predicted 예측 데이터
   * @returns 오차 지표 객체
   */
  private calculateErrorMetrics(actual: TimeSeriesPoint[], predicted: TimeSeriesPoint[]) {
    const n = Math.min(actual.length, predicted.length);
    
    if (n === 0) return { mape: undefined, mse: undefined };
    
    let sumSquaredError = 0;
    let sumAbsPercentError = 0;
    let validMapeCount = 0;
    
    for (let i = 0; i < n; i++) {
      const actualValue = actual[i].value;
      const predictedValue = predicted[i].value;
      
      // MSE 계산
      const error = actualValue - predictedValue;
      sumSquaredError += error * error;
      
      // MAPE 계산 (실제값이 0이 아닌 경우만)
      if (actualValue !== 0) {
        sumAbsPercentError += Math.abs(error / actualValue);
        validMapeCount++;
      }
    }
    
    const mse = sumSquaredError / n;
    const mape = validMapeCount > 0 ? (sumAbsPercentError / validMapeCount) * 100 : undefined;
    
    return { mape, mse };
  }
} 