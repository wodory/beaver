/**
 * 추세선 및 예측선을 시각화하는 차트 컴포넌트
 */
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { TimeSeriesPoint } from '../../../utils/time-series';
import { TrendResult, TrendDirection, TrendStrength, PredictionResult } from '../../../services/metrics/TrendAnalysisService';

/**
 * 트렌드 라인 차트 속성
 */
export interface TrendLineChartProps {
  // 차트 제목
  title?: string;
  
  // 데이터 포인트 배열
  data: TimeSeriesPoint[];
  
  // 트렌드 분석 결과
  trend?: TrendResult;
  
  // 예측 결과 (옵션)
  prediction?: PredictionResult;
  
  // 예측선 표시 여부
  showPrediction?: boolean;
  
  // 추세선 표시 여부
  showTrendLine?: boolean;
  
  // 신뢰 구간 표시 여부
  showConfidenceInterval?: boolean;
  
  // 이상치 표시 여부
  showAnomalies?: boolean;
  
  // Y축 레이블
  yAxisLabel?: string;
  
  // X축 레이블
  xAxisLabel?: string;
  
  // 차트 높이
  height?: number;
}

/**
 * 트렌드 라인 차트 컴포넌트
 */
export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  title = '트렌드 분석',
  data,
  trend,
  prediction,
  showPrediction = true,
  showTrendLine = true,
  showConfidenceInterval = true,
  showAnomalies = true,
  yAxisLabel = '값',
  xAxisLabel = '날짜',
  height = 400
}) => {
  // 실제 데이터와 예측 데이터를 결합
  const combinedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const result = data.map(point => ({
      date: point.timestamp,
      value: point.value,
      trend: trend?.trendLine.find(t => t.timestamp.getTime() === point.timestamp.getTime())?.value,
      isAnomaly: trend?.anomalies?.some(a => a.timestamp.getTime() === point.timestamp.getTime())
    }));
    
    // 예측 데이터가 있고 표시 옵션이 켜져 있으면 추가
    if (prediction && showPrediction) {
      prediction.predictions.forEach(point => {
        result.push({
          date: point.timestamp,
          forecastValue: point.value,
          upperBound: showConfidenceInterval ? 
            prediction.confidenceIntervals.upper.find(u => u.timestamp.getTime() === point.timestamp.getTime())?.value : 
            undefined,
          lowerBound: showConfidenceInterval ? 
            prediction.confidenceIntervals.lower.find(l => l.timestamp.getTime() === point.timestamp.getTime())?.value : 
            undefined
        });
      });
    }
    
    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data, trend, prediction, showPrediction, showConfidenceInterval]);
  
  // 트렌드 방향에 따른 색상 결정
  const getTrendColor = () => {
    if (!trend) return '#888888';
    
    switch (trend.direction) {
      case TrendDirection.INCREASING:
        return '#10b981'; // 초록색
      case TrendDirection.DECREASING:
        return '#ef4444'; // 빨간색
      case TrendDirection.STABLE:
        return '#3b82f6'; // 파란색
      default:
        return '#888888'; // 회색
    }
  };
  
  // 트렌드 강도에 따른 선 굵기 설정
  const getTrendStrokeWidth = () => {
    if (!trend) return 1;
    
    switch (trend.strength) {
      case TrendStrength.STRONG:
        return 3;
      case TrendStrength.MODERATE:
        return 2;
      case TrendStrength.WEAK:
      case TrendStrength.NONE:
      default:
        return 1;
    }
  };
  
  // 날짜 포맷 함수
  const formatDate = (date: Date) => {
    return format(date, 'MM.dd', { locale: ko });
  };
  
  // 툴팁 커스텀 구현
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = label ? format(new Date(label), 'yyyy년 MM월 dd일', { locale: ko }) : '';
      
      return (
        <div className="bg-background border rounded p-2 shadow-md">
          <p className="text-sm font-medium mb-1">{date}</p>
          
          {payload.map((entry: any, index: number) => {
            // 각 데이터 유형에 따라 다른 라벨 표시
            let name = entry.name;
            if (name === 'value') name = '실제 값';
            if (name === 'trend') name = '추세선';
            if (name === 'forecastValue') name = '예측 값';
            if (name === 'upperBound') name = '상한 신뢰구간';
            if (name === 'lowerBound') name = '하한 신뢰구간';
            
            return (
              <p key={`tooltip-${index}`} className="text-xs" style={{ color: entry.color }}>
                {name}: {entry.value?.toFixed(2)}
              </p>
            );
          })}
        </div>
      );
    }
    
    return null;
  };
  
  // 차트 렌더링
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {trend && (
          <div className="text-sm text-muted-foreground">
            트렌드 방향: <span className="font-medium" style={{ color: getTrendColor() }}>
              {trend.direction === TrendDirection.INCREASING 
                ? '상승' 
                : trend.direction === TrendDirection.DECREASING 
                  ? '하락' 
                  : trend.direction === TrendDirection.STABLE 
                    ? '안정' 
                    : '변동'}
            </span> (강도: {
              trend.strength === TrendStrength.STRONG 
                ? '강함' 
                : trend.strength === TrendStrength.MODERATE 
                  ? '중간' 
                  : trend.strength === TrendStrength.WEAK 
                    ? '약함' 
                    : '없음'
            })
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis 
                dataKey="date" 
                scale="time" 
                type="number" 
                domain={['auto', 'auto']} 
                name={xAxisLabel}
                tickFormatter={date => formatDate(new Date(date))}
              />
              <YAxis name={yAxisLabel} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* 실제 데이터 */}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                activeDot={{ r: 6 }}
                name="실제 값"
                connectNulls 
              />
              
              {/* 이상치 표시 */}
              {showAnomalies && trend?.anomalies && trend.anomalies.length > 0 && (
                <Line 
                  type="none"
                  dataKey="value"
                  stroke="none"
                  name="이상치"
                  dot={(props: any) => {
                    // isAnomaly인 경우에만 점 표시
                    const isAnomaly = combinedData[props.index]?.isAnomaly;
                    if (!isAnomaly) return null;
                    
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={6}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              )}
              
              {/* 추세선 */}
              {showTrendLine && trend && (
                <Line 
                  type="monotone" 
                  dataKey="trend" 
                  stroke={getTrendColor()} 
                  strokeWidth={getTrendStrokeWidth()} 
                  dot={false} 
                  strokeDasharray="5 5"
                  name="추세선"
                  connectNulls
                />
              )}
              
              {/* 예측선 */}
              {showPrediction && prediction && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="forecastValue" 
                    stroke="#8a2be2" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    name="예측 값"
                    connectNulls
                  />
                  
                  {/* 신뢰 구간 */}
                  {showConfidenceInterval && (
                    <Area 
                      type="monotone" 
                      dataKey="upperBound" 
                      stroke="none" 
                      fillOpacity={0.1} 
                      fill="#8a2be2"
                      name="상한 신뢰구간"
                      connectNulls
                    />
                  )}
                  
                  {showConfidenceInterval && (
                    <Area 
                      type="monotone" 
                      dataKey="lowerBound" 
                      stroke="none" 
                      fillOpacity={0.1} 
                      fill="#8a2be2"
                      name="하한 신뢰구간"
                      connectNulls
                    />
                  )}
                </>
              )}
              
              {/* 실제 데이터와 예측 데이터 구분선 */}
              {showPrediction && prediction && prediction.predictions.length > 0 && (
                <ReferenceLine 
                  x={prediction.predictions[0].timestamp.getTime()} 
                  stroke="#888888" 
                  strokeDasharray="3 3" 
                  label={{ value: '예측 시작', position: 'top', fill: '#888888' }} 
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 