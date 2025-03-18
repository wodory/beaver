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
  LineChart,
  Line,
  ComposedChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TeamMetrics } from '../../types/metrics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

interface TeamActivityChartProps {
  teamData: TeamMetrics;
  title?: string;
}

type MetricType = 'activity' | 'codeChanges' | 'reviews' | 'jira';
type ChartType = 'bar' | 'line' | 'composed';

/**
 * 팀 활동 차트
 * 
 * 팀의 활동 지표를 시각화합니다. 여러 저장소의 데이터를 통합하여 표시합니다.
 */
export function TeamActivityChart({ teamData, title }: TeamActivityChartProps) {
  const [metricType, setMetricType] = useState<MetricType>('activity');
  const [chartType, setChartType] = useState<ChartType>('bar');
  
  const defaultTitle = `${teamData.teamName} 팀 활동 지표`;
  
  // 데이터 변환 함수
  const getChartData = () => {
    switch (metricType) {
      case 'activity':
        return [
          { name: '커밋 수', value: teamData.commitCount, color: '#8884d8' },
          { name: 'PR 수', value: teamData.prCount, color: '#82ca9d' },
          { name: '병합된 PR', value: teamData.mergedPrCount, color: '#ffc658' },
          { name: '리뷰 수', value: teamData.reviewCount, color: '#ff8042' },
        ];
      case 'codeChanges':
        return [
          { name: '추가된 라인', value: teamData.totalAdditions, color: '#82ca9d' },
          { name: '삭제된 라인', value: teamData.totalDeletions, color: '#ff8042' },
        ];
      case 'reviews':
        return [
          { 
            name: '첫 리뷰 응답 시간 (분)', 
            value: teamData.avgTimeToFirstReview || 0,
            color: '#8884d8'
          },
          { 
            name: 'PR 병합 소요 시간 (분)', 
            value: teamData.avgTimeToMerge || 0,
            color: '#82ca9d'
          },
        ];
      case 'jira':
        return [
          { 
            name: '완료된 이슈 수', 
            value: teamData.jiraIssuesCount || 0,
            color: '#8884d8'
          },
          { 
            name: '평균 이슈 해결 시간 (시간)', 
            value: teamData.avgIssueResolutionTime || 0,
            color: '#82ca9d'
          },
        ];
      default:
        return [];
    }
  };

  // 시계열 데이터 시뮬레이션 (실제로는 API에서 시계열 데이터를 가져와야 함)
  const getTimeSeriesData = () => {
    // 예시 데이터 - 실제로는 API에서 가져와서 처리해야 함
    const currentMonth = new Date().getMonth();
    const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월', 
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    
    // 이전 6개월 데이터 시뮬레이션 (실제로는 서버에서 가져와야 함)
    return Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - 5 + i) % 12;
      const month = monthNames[monthIndex >= 0 ? monthIndex : monthIndex + 12];
      
      // 데이터를 시간 경과에 따라 증가하는 추세로 시뮬레이션
      const factor = 0.8 + (i * 0.2);  // 시간에 따라 증가하는 요소
      
      switch (metricType) {
        case 'activity':
          return {
            month,
            커밋수: Math.round(teamData.commitCount * factor * (0.8 + Math.random() * 0.4) / 6),
            PR수: Math.round(teamData.prCount * factor * (0.8 + Math.random() * 0.4) / 6),
            병합된PR: Math.round(teamData.mergedPrCount * factor * (0.8 + Math.random() * 0.4) / 6),
            리뷰수: Math.round(teamData.reviewCount * factor * (0.8 + Math.random() * 0.4) / 6),
          };
        case 'codeChanges':
          return {
            month,
            추가된라인: Math.round(teamData.totalAdditions * factor * (0.8 + Math.random() * 0.4) / 6),
            삭제된라인: Math.round(teamData.totalDeletions * factor * (0.8 + Math.random() * 0.4) / 6),
          };
        case 'reviews':
          return {
            month,
            '첫리뷰시간(분)': Math.round((teamData.avgTimeToFirstReview || 30) * (1.2 - i * 0.1) * (0.8 + Math.random() * 0.4)),
            '병합시간(분)': Math.round((teamData.avgTimeToMerge || 60) * (1.2 - i * 0.1) * (0.8 + Math.random() * 0.4)),
          };
        case 'jira':
          return {
            month,
            '완료된이슈': Math.round((teamData.jiraIssuesCount || 0) * factor * (0.8 + Math.random() * 0.4) / 6),
            '해결시간(시간)': Math.round((teamData.avgIssueResolutionTime || 24) * (1.2 - i * 0.1) * (0.8 + Math.random() * 0.4)),
          };
        default:
          return { month };
      }
    });
  };
  
  const singleMetricData = getChartData();
  const timeSeriesData = getTimeSeriesData();
  
  // 단일 지표용 바 차트
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={singleMetricData}
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
        <Tooltip />
        <Legend />
        <Bar 
          dataKey="value" 
          name={
            metricType === 'reviews' ? '시간 (분)' : 
            metricType === 'jira' && singleMetricData[1]?.name.includes('시간') ? '시간' : 
            '개수'
          } 
          fill="#8884d8" 
        />
      </BarChart>
    </ResponsiveContainer>
  );

  // 시계열 라인 차트
  const renderLineChart = () => {
    const getLines = () => {
      switch (metricType) {
        case 'activity':
          return (
            <>
              <Line type="monotone" dataKey="커밋수" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="PR수" stroke="#82ca9d" />
              <Line type="monotone" dataKey="병합된PR" stroke="#ffc658" />
              <Line type="monotone" dataKey="리뷰수" stroke="#ff8042" />
            </>
          );
        case 'codeChanges':
          return (
            <>
              <Line type="monotone" dataKey="추가된라인" stroke="#82ca9d" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="삭제된라인" stroke="#ff8042" />
            </>
          );
        case 'reviews':
          return (
            <>
              <Line type="monotone" dataKey="첫리뷰시간(분)" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="병합시간(분)" stroke="#82ca9d" />
            </>
          );
        case 'jira':
          return (
            <>
              <Line type="monotone" dataKey="완료된이슈" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="해결시간(시간)" stroke="#82ca9d" />
            </>
          );
        default:
          return null;
      }
    };
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={timeSeriesData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          {getLines()}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // 조합 차트 (Area + Line)
  const renderComposedChart = () => {
    const getComposedElements = () => {
      switch (metricType) {
        case 'activity':
          return (
            <>
              <Area type="monotone" dataKey="커밋수" fill="#8884d8" stroke="#8884d8" />
              <Line type="monotone" dataKey="PR수" stroke="#82ca9d" />
              <Line type="monotone" dataKey="병합된PR" stroke="#ffc658" />
              <Bar dataKey="리뷰수" barSize={20} fill="#ff8042" />
            </>
          );
        case 'codeChanges':
          return (
            <>
              <Area type="monotone" dataKey="추가된라인" fill="#82ca9d" stroke="#82ca9d" />
              <Line type="monotone" dataKey="삭제된라인" stroke="#ff8042" />
            </>
          );
        case 'reviews':
          return (
            <>
              <Line type="monotone" dataKey="첫리뷰시간(분)" stroke="#8884d8" />
              <Bar dataKey="병합시간(분)" barSize={20} fill="#82ca9d" />
            </>
          );
        case 'jira':
          return (
            <>
              <Bar dataKey="완료된이슈" barSize={20} fill="#8884d8" />
              <Line type="monotone" dataKey="해결시간(시간)" stroke="#82ca9d" />
            </>
          );
        default:
          return null;
      }
    };
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={timeSeriesData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          {getComposedElements()}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };
  
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
                <SelectItem value="activity">팀 활동 지표</SelectItem>
                <SelectItem value="codeChanges">코드 변경량</SelectItem>
                <SelectItem value="reviews">리뷰 시간</SelectItem>
                <SelectItem value="jira">JIRA 이슈</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">차트 유형:</span>
            <Tabs value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
              <TabsList>
                <TabsTrigger value="bar">단일 값</TabsTrigger>
                <TabsTrigger value="line">시계열</TabsTrigger>
                <TabsTrigger value="composed">조합 차트</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartType === 'bar' 
            ? renderBarChart() 
            : chartType === 'line' 
              ? renderLineChart() 
              : renderComposedChart()}
        </div>
      </CardContent>
    </Card>
  );
} 