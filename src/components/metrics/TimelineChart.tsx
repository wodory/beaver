import React from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// 타임라인 이벤트 타입 정의
export interface TimelineEvent {
  id: string;
  date: string; // ISO 형식 날짜 문자열
  type: string;
  value: number;
  label?: string;
  description?: string;
}

interface TimelineChartProps {
  title: string;
  description?: string;
  events: TimelineEvent[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  referenceDate?: string; // 참조 날짜 (오늘 또는 특정 이벤트 날짜)
}

export function TimelineChart({
  title,
  description,
  events,
  height = 300,
  showGrid = true,
  showLegend = true,
  referenceDate
}: TimelineChartProps) {
  // 이벤트 타입에 따른 색상 매핑
  const typeColors: Record<string, string> = {
    commit: '#10B981', // green
    pr: '#3B82F6',     // blue
    issue: '#F97316',  // orange
    review: '#8B5CF6', // purple
    release: '#EF4444' // red
  };

  // 데이터 정렬 (날짜순)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 툴팁 커스터마이징
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const event = payload[0].payload;
      return (
        <div className="bg-background p-2 border rounded-md shadow-md text-sm">
          <p className="font-medium">{format(parseISO(event.date), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}</p>
          <p className="text-muted-foreground">{event.type}: {event.label || ''}</p>
          {event.description && <p className="text-xs mt-1">{event.description}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={sortedEvents} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />}
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(parseISO(date), 'MM/dd', { locale: ko })}
              tickMargin={8}
            />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              />
            )}
            {Object.entries(typeColors).map(([type, color]) => (
              <Line
                key={type}
                type="monotone"
                dataKey={(datum: any) => datum.type === type ? datum.value : null}
                name={type}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 1 }}
                activeDot={{ r: 6, strokeWidth: 1 }}
                connectNulls={true}
              />
            ))}
            {referenceDate && (
              <ReferenceLine
                x={referenceDate}
                stroke="#FF8F00"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: "기준일", position: "insideTopRight", fill: "#FF8F00" }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 