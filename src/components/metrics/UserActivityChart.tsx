import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserMetrics } from '../../services/metrics/MetricsService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface UserActivityChartProps {
  userData: UserMetrics;
  title?: string;
}

type MetricType = 'commits' | 'pullRequests' | 'codeChanges' | 'reviews';

interface ChartData {
  name: string;
  value: number;
  fill: string;
}

/**
 * 사용자 활동 차트
 * 
 * 사용자의 커밋, PR, 코드 변경량, 리뷰 등의 활동 지표를 시각화합니다.
 */
export function UserActivityChart({ userData, title = '사용자 활동 지표' }: UserActivityChartProps) {
  const [metricType, setMetricType] = useState<MetricType>('commits');
  
  // 데이터 준비
  const getChartData = (): ChartData[] => {
    switch (metricType) {
      case 'commits':
        return [
          { name: '커밋 수', value: userData.commitCount, fill: '#8884d8' },
          { name: '활동 일수', value: userData.activeCommitDays, fill: '#82ca9d' },
        ];
      case 'pullRequests':
        return [
          { name: 'PR 생성', value: userData.prCount, fill: '#8884d8' },
          { name: 'PR 병합', value: userData.prMergedCount, fill: '#82ca9d' },
          { name: '활동 일수', value: userData.activePrDays, fill: '#ffc658' },
        ];
      case 'codeChanges':
        return [
          { name: '추가된 라인', value: userData.totalAdditions, fill: '#82ca9d' },
          { name: '삭제된 라인', value: userData.totalDeletions, fill: '#ff8042' },
        ];
      case 'reviews':
        return [
          { name: '작성한 리뷰', value: userData.reviewsGivenCount, fill: '#8884d8' },
        ];
      default:
        return [];
    }
  };

  const chartData = getChartData();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">지표 유형:</span>
          <Select
            value={metricType}
            onValueChange={(value) => setMetricType(value as MetricType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="지표 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="commits">커밋 활동</SelectItem>
              <SelectItem value="pullRequests">PR 활동</SelectItem>
              <SelectItem value="codeChanges">코드 변경량</SelectItem>
              <SelectItem value="reviews">리뷰 활동</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value}`, '']}
                labelFormatter={() => ''}
              />
              <Legend />
              <Bar dataKey="value" name={metricType === 'codeChanges' ? '라인 수' : '개수'} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 