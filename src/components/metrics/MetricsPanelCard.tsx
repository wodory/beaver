import { useState, useEffect, useMemo, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { MetricsCard, MetricItem } from "./metrics-card";
import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";
import React from "react";

// 상태별 색상 정의
const STATUS_COLORS = {
  Elite: "#10b981", // green-500
  High: "#3b82f6", // blue-500
  Mid: "#f59e0b", // yellow-500
  Low: "#ef4444", // red-500
};

const DATE_PRESETS = [
  { id: "7d", name: "최근 7일", days: 7 },
  { id: "14d", name: "최근 14일", days: 14 },
  { id: "30d", name: "최근 30일", days: 30 },
  { id: "90d", name: "최근 90일", days: 90 },
  { id: "custom", name: "사용자 지정", days: 0 },
];

// 샘플 차트 컴포넌트
const MetricChart = React.memo(({ data, color }: { data: any; color: string }) => {
  const chartHeight = useMemo(() => {
    // 미디어 쿼리를 이용한 높이 조정 대신 useMediaQuery 사용 가능하지만
    // 간단히 CSS 클래스로 대체
    return "100%";
  }, []);

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart 
          data={data}
          margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
        >
          <defs>
            <linearGradient id={`colorGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis 
            dataKey="date" 
            fontSize={12}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
            opacity={0.5}
            minTickGap={32}
            interval={data.length > 60 ? 6 : data.length > 30 ? 3 : 1}
            tickFormatter={(value) => {
              try {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                  return "";
                }
                // 90일 이상인 경우 월-일 형식으로 표시
                return format(date, 'MM.dd', { locale: ko });
              } catch (e) {
                return "";
              }
            }}
          />
          <YAxis 
            fontSize={12}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
            stroke="hsl(var(--muted-foreground))"
            opacity={0.5}
          />
          <RechartsTooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontFamily: 'inherit',
              padding: '8px 12px'
            }}
            cursor={{ fill: `${color}15` }}
            formatter={(value) => [`${value}`, '값']}
            labelFormatter={(label) => `${label}`}
          />
          <Bar 
            dataKey="value" 
            fill={`url(#colorGradient-${color.replace('#', '')})`}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            animationDuration={500}
            animationEasing="ease-in-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

MetricChart.displayName = 'MetricChart';

// 기본 메트릭 데이터 생성 함수
const generateMetricsData = (dateRange = 14, seed = 1): MetricItem[] => {
  // 날짜 범위에 따라 메트릭 값 조정
  let deployFreq = "2일 4시간";
  let prCount = Math.floor(285 * (dateRange / 30));
  let failureRate = "17%";
  let failureCount = Math.floor(48 * (dateRange / 30));
  let cycleTime = "2일 4시간";
  let cycleCount = Math.floor(250 * (dateRange / 30));
  let mttr = "3.2시간";
  let mttrCount = Math.floor(48 * (dateRange / 30));

  // 날짜 범위에 따른 값 조정
  if (dateRange <= 7) {
    deployFreq = "1일 2시간";
    failureRate = "14%";
    cycleTime = "1일 18시간";
    mttr = "2.5시간";
  } else if (dateRange <= 14) {
    deployFreq = "1일 18시간";
    failureRate = "15%";
    cycleTime = "1일 22시간";
    mttr = "2.8시간";
  } else if (dateRange > 60) {
    deployFreq = "3일 6시간";
    failureRate = "19%";
    cycleTime = "3일 2시간";
    mttr = "3.6시간";
  }

  // 오늘 날짜 기준으로 dateRange만큼의 일자 데이터 생성
  const today = new Date();
  const generateDates = (count: number) => {
    return Array.from({ length: count }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - count + i + 1);
      // YYYY-MM-DD 형식으로 반환
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    });
  };
  
  const dates = generateDates(Math.min(dateRange, 90)); // 최대 90일로 제한

  return [
    {
      title: (
        <div className="flex items-center">
          배포 빈도
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex ml-1 cursor-help">
                <HelpCircle className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-72">
              <p className="mb-1">코드가 배포되는 빈도를 나타냅니다.</p>
              <p>더 빠른 배포 주기는 더 나은 소프트웨어 전달 성능을 의미합니다.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
      id: "deployment-frequency",
      value: deployFreq,
      subValue: `${prCount}개 PR 병합됨`,
      trend: {
        value: 12,
        direction: "up"
      },
      status: "Elite",
      color: STATUS_COLORS.Elite,
      count: {
        value: prCount,
        label: "배포"
      },
      chartData: dates.map(date => {
        // 요일에 따라 값 변경 (주말에는 적게)
        const dayOfWeek = new Date(date).getDay();
        const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.3 : 1;
        
        return {
          date,
          value: Math.max(1, Math.floor(Math.random() * 8 * weekendFactor)),
        };
      })
    },
    {
      title: (
        <div className="flex items-center">
          변경 실패율
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex ml-1 cursor-help">
                <HelpCircle className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[200px] text-xs">배포 후 즉시 실패하는 변경 사항의 비율</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
      value: failureRate,
      subValue: "0-15% 사이",
      trend: {
        value: 12,
        direction: "down" as const
      },
      status: "High",
      color: STATUS_COLORS.High,
      count: {
        value: failureCount,
        label: "실패"
      },
      chartData: dates.map(date => ({
        date,
        value: Math.floor(Math.random() * 30 * seed) + 5
      }))
    },
    {
      title: (
        <div className="flex items-center">
          수정 시간
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex ml-1 cursor-help">
                <HelpCircle className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[200px] text-xs">코드 변경부터 프로덕션 배포까지 걸리는 시간</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
      value: cycleTime,
      subValue: "1일 이내",
      trend: {
        value: 26,
        direction: "up" as const
      },
      status: "Low",
      color: STATUS_COLORS.Low,
      count: {
        value: cycleCount,
        label: "PR"
      },
      chartData: dates.map(date => ({
        date,
        value: Math.floor(Math.random() * 50 * seed) + 20
      }))
    },
    {
      title: (
        <div className="flex items-center">
          평균 복구 시간
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex ml-1 cursor-help">
                <HelpCircle className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[200px] text-xs">서비스 장애 발생부터 복구까지 걸리는 시간</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
      value: mttr,
      subValue: "1시간 이내",
      trend: {
        value: 7,
        direction: "up" as const
      },
      status: "Mid",
      color: STATUS_COLORS.Mid,
      count: {
        value: mttrCount,
        label: "실패"
      },
      chartData: dates.map(date => ({
        date,
        value: Math.floor(Math.random() * 15 * seed) + 2
      }))
    }
  ];
};

// 샘플 데이터 초기화
const initialMetrics = generateMetricsData();

interface MetricsPanelCardProps {
  filterState?: {
    project: string;
    startDate: Date | null;
    endDate: Date | null;
    datePreset?: string;
  };
}

export function MetricsPanelCard({ filterState }: MetricsPanelCardProps) {
  const [activeMetricIndex, setActiveMetricIndex] = useState(0);
  
  // 메트릭스 데이터 메모이제이션
  const metricsData = useMemo(() => {
    // 필터 상태에 따라 적절한 범위의 데이터 생성
    const dateRange = filterState?.startDate && filterState?.endDate 
      ? differenceInDays(filterState.endDate, filterState.startDate)
      : 30;
    
    return generateMetricsData(dateRange, 1);
  }, [filterState?.startDate, filterState?.endDate]);

  // 차트 데이터 메모이제이션
  const charts = useMemo(() => {
    return metricsData.map((metric) => ({
      id: metric.id || `metric-${Math.random()}`,
      data: metric.chartData,
      color: STATUS_COLORS[metric.status as keyof typeof STATUS_COLORS] || '#64748b',
    }));
  }, [metricsData]);
  
  // 날짜 범위 정보 메모이제이션
  const dateRangeInfo = useMemo(() => {
    if (!filterState?.startDate || !filterState?.endDate) {
      return "최근 30일";
    }
    
    const koreanDateFormat = 'yyyy년 M월 d일';
    return `${format(filterState.startDate, koreanDateFormat, { locale: ko })} ~ ${format(filterState.endDate, koreanDateFormat, { locale: ko })}`;
  }, [filterState?.startDate, filterState?.endDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-2xl font-semibold">DORA 메트릭스</h2>
        <div className="text-sm text-muted-foreground">
          {dateRangeInfo}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricsCard
          title="DORA 메트릭스"
          subtitle="주요 DevOps 메트릭스 데이터"
          metrics={metricsData}
          activeMetricIndex={activeMetricIndex}
          onMetricClick={setActiveMetricIndex}
          chartComponent={MetricChart}
          filterState={filterState}
        />
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {charts.map((chart) => (
            <div 
              key={chart.id} 
              className="bg-card border rounded-lg p-4 shadow-sm h-64 md:h-72"
            >
              <MetricChart data={chart.data} color={chart.color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 반응형 차트 스타일 추가
const style = document.createElement('style');
style.textContent = `
  .chart-container {
    width: 100%;
    height: 300px;
  }
  
  @media (max-width: 768px) {
    .chart-container {
      height: 250px;
    }
  }
  
  @media (max-width: 480px) {
    .chart-container {
      height: 200px;
    }
  }
`;
document.head.appendChild(style); 