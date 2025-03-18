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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RepositoryMetrics } from '../../services/metrics/MetricsService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface RepositoryActivityChartProps {
  repoData: RepositoryMetrics;
  title?: string;
}

type MetricType = 'activity' | 'codeChanges' | 'reviews';
type ChartType = 'bar' | 'pie';

interface ChartData {
  name: string;
  value: number;
  fill: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

/**
 * 저장소 활동 차트
 * 
 * 저장소의 커밋, PR, 코드 변경량, 리뷰 등의 활동 지표를 시각화합니다.
 */
export function RepositoryActivityChart({ repoData, title }: RepositoryActivityChartProps) {
  const [metricType, setMetricType] = useState<MetricType>('activity');
  const [chartType, setChartType] = useState<ChartType>('bar');
  
  const defaultTitle = `${repoData.name} 저장소 활동`;
  
  // 데이터 준비
  const getChartData = (): ChartData[] => {
    switch (metricType) {
      case 'activity':
        return [
          { name: '커밋 수', value: repoData.commitCount, fill: COLORS[0] },
          { name: '기여자 수', value: repoData.contributorCount, fill: COLORS[1] },
          { name: 'PR 수', value: repoData.prCount, fill: COLORS[2] },
          { name: '병합된 PR', value: repoData.prMergedCount, fill: COLORS[3] },
          { name: '리뷰 수', value: repoData.reviewCount, fill: COLORS[4] },
        ];
      case 'codeChanges':
        return [
          { name: '추가된 라인', value: repoData.totalAdditions, fill: COLORS[1] },
          { name: '삭제된 라인', value: repoData.totalDeletions, fill: COLORS[3] },
        ];
      case 'reviews':
        return [
          { 
            name: '리뷰 응답 시간 (분)', 
            value: repoData.avgTimeToFirstReview || 0, 
            fill: COLORS[0] 
          },
          { 
            name: '병합 소요 시간 (분)', 
            value: repoData.avgTimeToMerge || 0, 
            fill: COLORS[2] 
          },
        ];
      default:
        return [];
    }
  };

  const chartData = getChartData();
  
  const renderBarChart = () => (
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
          labelFormatter={(label) => `${label}`} 
        />
        <Legend />
        <Bar 
          dataKey="value" 
          name={
            metricType === 'codeChanges' 
              ? '라인 수' 
              : metricType === 'reviews' 
                ? '평균 시간 (분)' 
                : '개수'
          }
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value}`, '']}
          labelFormatter={(label) => `${label}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title || defaultTitle}</CardTitle>
        <div className="flex items-center space-x-4">
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
                <SelectItem value="activity">저장소 활동</SelectItem>
                <SelectItem value="codeChanges">코드 변경량</SelectItem>
                <SelectItem value="reviews">리뷰 및 병합 시간</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">차트 유형:</span>
            <Tabs value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
              <TabsList>
                <TabsTrigger value="bar">막대 차트</TabsTrigger>
                <TabsTrigger value="pie">파이 차트</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartType === 'bar' ? renderBarChart() : renderPieChart()}
        </div>
      </CardContent>
    </Card>
  );
} 