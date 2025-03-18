/**
 * 예측 모델 평가 서비스
 * 
 * 예측 모델의 정확도를 평가하고 파라미터를 최적화하는 기능을 제공합니다.
 */

import { TimeSeriesPoint } from '../../utils/time-series';
import { ModelType, TrendAnalysisService } from './TrendAnalysisService';

/**
 * 예측 모델 파라미터 인터페이스
 */
export interface ModelParameters {
  // 모델 유형에 따른 파라미터
  [key: string]: any;
  
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
 * 모델 최적화 결과 인터페이스
 */
export interface OptimizedParameters {
  // 최적화된 모델 유형
  modelType: ModelType;
  
  // 최적화된 파라미터
  parameters: ModelParameters;
  
  // 최적화된 모델의 정확도 지표
  errorMetrics: {
    mape?: number; // Mean Absolute Percentage Error
    mse?: number;  // Mean Squared Error
  };
}

/**
 * 교차 검증 결과 인터페이스
 */
export interface ValidationResult {
  // 모델 정확도 평가 지표
  errorMetrics: {
    mape?: number[]; // 각 폴드별 Mean Absolute Percentage Error
    mapeAvg?: number; // 평균 MAPE
    mse?: number[];   // 각 폴드별 Mean Squared Error
    mseAvg?: number;  // 평균 MSE
  };
  
  // 각 폴드별 검증 결과
  foldResults: Array<{
    testIndices: number[]; // 테스트 데이터 인덱스
    predictions: TimeSeriesPoint[]; // 예측 결과
    actual: TimeSeriesPoint[]; // 실제 값
  }>;
}

/**
 * 예측 평가 서비스 클래스
 */
export class PredictionEvaluationService {
  private trendAnalysisService: TrendAnalysisService;
  
  constructor() {
    this.trendAnalysisService = new TrendAnalysisService();
  }
  
  /**
   * Mean Absolute Percentage Error(MAPE)를 계산합니다.
   * MAPE = (1/n) * Σ(|actual - predicted| / |actual|) * 100%
   * 
   * @param actual 실제 데이터
   * @param predicted 예측 데이터
   * @returns MAPE 값 (백분율)
   */
  calculateMAPE(actual: TimeSeriesPoint[], predicted: TimeSeriesPoint[]): number | undefined {
    if (!actual || !predicted || actual.length === 0 || predicted.length === 0) {
      return undefined;
    }
    
    // 날짜로 정렬
    const sortedActual = [...actual].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const sortedPredicted = [...predicted].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // 날짜가 일치하는 데이터 포인트만 비교
    const actualMap = new Map<string, number>();
    sortedActual.forEach(point => {
      const dateKey = point.timestamp.toISOString();
      actualMap.set(dateKey, point.value);
    });
    
    let sumAbsPercentError = 0;
    let validCount = 0;
    
    sortedPredicted.forEach(prediction => {
      const dateKey = prediction.timestamp.toISOString();
      if (actualMap.has(dateKey)) {
        const actualValue = actualMap.get(dateKey)!;
        if (actualValue !== 0) { // 0으로 나누기 방지
          const absPercentError = Math.abs((actualValue - prediction.value) / actualValue);
          sumAbsPercentError += absPercentError;
          validCount++;
        }
      }
    });
    
    if (validCount === 0) return undefined;
    
    // MAPE를 백분율로 반환
    return (sumAbsPercentError / validCount) * 100;
  }
  
  /**
   * Mean Squared Error(MSE)를 계산합니다.
   * MSE = (1/n) * Σ(actual - predicted)²
   * 
   * @param actual 실제 데이터
   * @param predicted 예측 데이터
   * @returns MSE 값
   */
  calculateMSE(actual: TimeSeriesPoint[], predicted: TimeSeriesPoint[]): number | undefined {
    if (!actual || !predicted || actual.length === 0 || predicted.length === 0) {
      return undefined;
    }
    
    // 날짜로 정렬
    const sortedActual = [...actual].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const sortedPredicted = [...predicted].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // 날짜가 일치하는 데이터 포인트만 비교
    const actualMap = new Map<string, number>();
    sortedActual.forEach(point => {
      const dateKey = point.timestamp.toISOString();
      actualMap.set(dateKey, point.value);
    });
    
    let sumSquaredError = 0;
    let validCount = 0;
    
    sortedPredicted.forEach(prediction => {
      const dateKey = prediction.timestamp.toISOString();
      if (actualMap.has(dateKey)) {
        const actualValue = actualMap.get(dateKey)!;
        const error = actualValue - prediction.value;
        sumSquaredError += error * error;
        validCount++;
      }
    });
    
    if (validCount === 0) return undefined;
    
    return sumSquaredError / validCount;
  }
  
  /**
   * 모델 파라미터를 최적화합니다.
   * 
   * @param data 학습 및 검증에 사용할 데이터
   * @param targetModelType 최적화할 모델 유형 (미지정 시 모든 유형 시도)
   * @returns 최적화된 파라미터 결과
   */
  optimizeParameters(
    data: TimeSeriesPoint[], 
    targetModelType?: ModelType
  ): OptimizedParameters {
    if (!data || data.length < 14) { // 최소 2주 이상의 데이터 필요
      throw new Error('최적화할 데이터가 충분하지 않습니다.');
    }
    
    // 날짜로 정렬된 데이터
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // 훈련/검증 분할 (8:2 비율)
    const splitIndex = Math.floor(sortedData.length * 0.8);
    const trainingData = sortedData.slice(0, splitIndex);
    const validationData = sortedData.slice(splitIndex);
    
    // 최적화할 모델 유형 결정
    const modelTypes = targetModelType 
      ? [targetModelType] 
      : [ModelType.LINEAR_REGRESSION, ModelType.EXPONENTIAL_SMOOTHING, ModelType.MOVING_AVERAGE];
    
    // 각 모델별 최적 파라미터 및 오차 저장
    const modelResults: OptimizedParameters[] = [];
    
    // 모델별 최적화 수행
    for (const modelType of modelTypes) {
      let bestParams: ModelParameters = {};
      let lowestError = Number.MAX_VALUE;
      let bestErrorMetrics: { mape?: number; mse?: number } = { mape: undefined, mse: undefined };
      
      // 1. 선형 회귀 모델 최적화
      if (modelType === ModelType.LINEAR_REGRESSION) {
        // 선형 회귀는 파라미터 최적화가 크게 필요하지 않음
        const params = { includeSeasonality: false };
        const forecastPeriod = validationData.length;
        
        const prediction = this.trendAnalysisService.predictLinearRegression(
          trainingData, 
          forecastPeriod
        );
        
        const mse = this.calculateMSE(validationData, prediction.predictions);
        if (mse !== undefined && mse < lowestError) {
          lowestError = mse;
          bestParams = { linearRegression: params };
          bestErrorMetrics = { 
            mse,
            mape: this.calculateMAPE(validationData, prediction.predictions)
          };
        }
      }
      
      // 2. 지수 평활법 모델 최적화
      else if (modelType === ModelType.EXPONENTIAL_SMOOTHING) {
        // 알파 값 범위 설정 (0.1부터 0.9까지 0.1 간격)
        const alphaValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
        const forecastPeriod = validationData.length;
        
        for (const alpha of alphaValues) {
          const prediction = this.trendAnalysisService.predictExponentialSmoothing(
            trainingData, 
            forecastPeriod,
            alpha
          );
          
          const mse = this.calculateMSE(validationData, prediction.predictions);
          if (mse !== undefined && mse < lowestError) {
            lowestError = mse;
            bestParams = { exponentialSmoothing: { alpha } };
            bestErrorMetrics = { 
              mse,
              mape: this.calculateMAPE(validationData, prediction.predictions)
            };
          }
        }
      }
      
      // 3. 이동 평균 모델 최적화
      else if (modelType === ModelType.MOVING_AVERAGE) {
        // 윈도우 크기 범위 설정
        const windowSizes = [3, 5, 7, 10, 14, 21, 28]; // 일주일, 2주, 한달 단위 등
        const forecastPeriod = validationData.length;
        
        for (const windowSize of windowSizes) {
          // 윈도우 크기가 훈련 데이터보다 크면 건너뜀
          if (windowSize >= trainingData.length) continue;
          
          const prediction = this.trendAnalysisService.predictMovingAverage(
            trainingData, 
            forecastPeriod,
            windowSize
          );
          
          const mse = this.calculateMSE(validationData, prediction.predictions);
          if (mse !== undefined && mse < lowestError) {
            lowestError = mse;
            bestParams = { movingAverage: { windowSize } };
            bestErrorMetrics = { 
              mse,
              mape: this.calculateMAPE(validationData, prediction.predictions)
            };
          }
        }
      }
      
      modelResults.push({
        modelType,
        parameters: bestParams,
        errorMetrics: bestErrorMetrics
      });
    }
    
    // 가장 낮은 오차를 가진 모델 선택
    const bestModel = modelResults.reduce((best, current) => {
      const bestMSE = best.errorMetrics.mse ?? Number.MAX_VALUE;
      const currentMSE = current.errorMetrics.mse ?? Number.MAX_VALUE;
      return currentMSE < bestMSE ? current : best;
    }, modelResults[0]);
    
    return bestModel;
  }
  
  /**
   * K-Fold 교차 검증을 수행합니다.
   * 
   * @param data 검증할 데이터
   * @param modelType 모델 유형
   * @param params 모델 파라미터
   * @param k 폴드 수 (기본값: 5)
   * @returns 교차 검증 결과
   */
  crossValidate(
    data: TimeSeriesPoint[], 
    modelType: ModelType, 
    params: ModelParameters,
    k: number = 5
  ): ValidationResult {
    if (!data || data.length < k) {
      throw new Error('교차 검증을 위한 데이터가 충분하지 않습니다.');
    }
    
    // 날짜로 정렬된 데이터
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // k개 폴드로 분할
    const foldSize = Math.floor(sortedData.length / k);
    const folds: number[][] = [];
    
    for (let i = 0; i < k; i++) {
      const startIdx = i * foldSize;
      const endIdx = i === k - 1 ? sortedData.length : startIdx + foldSize;
      const indices = Array.from({ length: endIdx - startIdx }, (_, j) => startIdx + j);
      folds.push(indices);
    }
    
    // 각 폴드별 검증 결과 저장
    const foldResults: Array<{
      testIndices: number[];
      predictions: TimeSeriesPoint[];
      actual: TimeSeriesPoint[];
    }> = [];
    
    const mapeValues: number[] = [];
    const mseValues: number[] = [];
    
    // 각 폴드를 테스트 세트로 사용하여 검증
    for (let i = 0; i < k; i++) {
      const testIndices = folds[i];
      const trainIndices = folds
        .filter((_, foldIdx) => foldIdx !== i)
        .flat();
      
      const trainData = trainIndices.map(idx => sortedData[idx]);
      const testData = testIndices.map(idx => sortedData[idx]);
      
      let predictions: TimeSeriesPoint[] = [];
      
      // 선택한 모델 유형에 따른 예측 수행
      if (modelType === ModelType.LINEAR_REGRESSION) {
        const result = this.trendAnalysisService.predictLinearRegression(
          trainData, 
          testData.length
        );
        predictions = result.predictions;
      }
      else if (modelType === ModelType.EXPONENTIAL_SMOOTHING) {
        const alpha = params.exponentialSmoothing?.alpha ?? 0.3;
        const result = this.trendAnalysisService.predictExponentialSmoothing(
          trainData, 
          testData.length,
          alpha
        );
        predictions = result.predictions;
      }
      else if (modelType === ModelType.MOVING_AVERAGE) {
        const windowSize = params.movingAverage?.windowSize ?? 7;
        const result = this.trendAnalysisService.predictMovingAverage(
          trainData, 
          testData.length,
          windowSize
        );
        predictions = result.predictions;
      }
      
      // 실제 테스트 날짜에 맞춰 예측 값 조정
      const adjustedPredictions = testData.map((actual, idx) => ({
        timestamp: actual.timestamp,
        value: predictions[idx]?.value ?? 0
      }));
      
      // 오차 계산
      const mape = this.calculateMAPE(testData, adjustedPredictions);
      const mse = this.calculateMSE(testData, adjustedPredictions);
      
      if (mape !== undefined) mapeValues.push(mape);
      if (mse !== undefined) mseValues.push(mse);
      
      // 폴드 결과 저장
      foldResults.push({
        testIndices,
        predictions: adjustedPredictions,
        actual: testData
      });
    }
    
    // 평균 오차 계산
    const mapeAvg = mapeValues.length > 0 
      ? mapeValues.reduce((sum, val) => sum + val, 0) / mapeValues.length 
      : undefined;
      
    const mseAvg = mseValues.length > 0 
      ? mseValues.reduce((sum, val) => sum + val, 0) / mseValues.length 
      : undefined;
    
    return {
      errorMetrics: {
        mape: mapeValues,
        mapeAvg,
        mse: mseValues,
        mseAvg
      },
      foldResults
    };
  }
} 