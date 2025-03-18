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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ComparisonItem {
  name: string;
  commitCount: number;
  prCount: number;
  reviewCount: number;
  codeChanges: number;
  mergeRate: number;
  avgLeadTime: number;
}

interface ComparisonChartProps {
  items: ComparisonItem[];
  title?: string;
  type?: 'team' | 'project';
}

type ChartType = 'bar' | 'radar';
type DataKey = 'commitCount' | 'prCount' | 'reviewCount' | 'codeChanges' | 'mergeRate' | 'avgLeadTime';

const DATA_KEYS: { [key: string]: { label: string; formatter?: (value: number) => string } } = {
  commitCount: { label: '커밋 수' },
  prCount: { label: 'PR 수' },
  reviewCount: { label: '리뷰 수' },
  codeChanges: { 
    label: '코드 변경량', 
    formatter: (value: number) => `${value > 1000 ? `${(value / 1000).toFixed(1)}K` : value} 라인` 
  },
  mergeRate: { 
    label: 'PR 병합률', 
    formatter: (value: number) => `${(value * 100).toFixed(1)}%` 
  },
  avgLeadTime: { 
    label: '평균 리드 타임', 
    formatter: (value: number) => `${value} 시간` 
  }
};

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'
];

/**
 * 팀 또는 프로젝트 비교 차트
 */
export function ComparisonChart({ 
  items, 
  title = '비교 차트', 
  type = 'team' 
}: ComparisonChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [dataKey, setDataKey] = useState<DataKey>('commitCount');

  const normalizedItems = items.map(item => {
    // 레이더 차트의 경우 값들을 정규화하여 0-100 사이로 조정
    if (chartType === 'radar') {
      const maxValues = {
        commitCount: Math.max(...items.map(i => i.commitCount)),
        prCount: Math.max(...items.map(i => i.prCount)),
        reviewCount: Math.max(...items.map(i => i.reviewCount)),
        codeChanges: Math.max(...items.map(i => i.codeChanges)),
        mergeRate: 1,  // 병합률은 이미 0-1 사이의 값
        avgLeadTime: Math.max(...items.map(i => i.avgLeadTime))
      };

      return {
        ...item,
        normalizedCommitCount: (item.commitCount / maxValues.commitCount) * 100,
        normalizedPrCount: (item.prCount / maxValues.prCount) * 100,
        normalizedReviewCount: (item.reviewCount / maxValues.reviewCount) * 100,
        normalizedCodeChanges: (item.codeChanges / maxValues.codeChanges) * 100,
        normalizedMergeRate: item.mergeRate * 100,
        normalizedAvgLeadTime: (item.avgLeadTime / maxValues.avgLeadTime) * 100
      };
    }
    return item;
  });

  // 레이더 차트 데이터 형식으로 변환
  const radarData = Object.keys(DATA_KEYS).map(key => {
    const result: any = { key, name: DATA_KEYS[key].label };
    
    items.forEach((item, index) => {
      const normalizedKey = `normalized${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof normalizedItems[0];
      result[item.name] = normalizedItems[index][normalizedKey];
    });
    
    return result;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          <Select value={dataKey} onValueChange={(value) => setDataKey(value as DataKey)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="지표 선택" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DATA_KEYS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="차트 유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">막대 차트</SelectItem>
              <SelectItem value="radar">레이더 차트</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-[350px] w-full">
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={items}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => {
                  const formatter = DATA_KEYS[dataKey].formatter;
                  return formatter ? [formatter(value), DATA_KEYS[dataKey].label] : [value, DATA_KEYS[dataKey].label];
                }}
              />
              <Legend />
              <Bar 
                dataKey={dataKey} 
                name={DATA_KEYS[dataKey].label}
                fill={COLORS[0]} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => `${value}%`}
              />
              {items.map((item, index) => (
                <Radar
                  key={item.name}
                  name={item.name}
                  dataKey={item.name}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.2}
                />
              ))}
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
} 