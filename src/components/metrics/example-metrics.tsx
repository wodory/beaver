import { useState, useEffect, useMemo, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { MetricsCard, MetricItem } from "./metrics-card";
import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";

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
function MetricChart({ data, color }: { data: any; color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
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
  );
}

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
            <TooltipContent>
              <p className="w-[200px] text-xs">특정 기간 동안 프로덕션에 배포한 빈도</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
      value: deployFreq,
      subValue: "매일 1회 이상",
      trend: {
        value: 36,
        direction: "up" as const
      },
      status: "Elite",
      color: STATUS_COLORS.Elite,
      count: {
        value: prCount,
        label: "PR"
      },
      chartData: dates.map(date => ({
        date,
        value: Math.floor(Math.random() * 40 * seed) + 10
      }))
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

interface ExampleMetricsProps {
  filterState?: {
    project: string;
    startDate: Date | null;
    endDate: Date | null;
    datePreset?: string;
  };
}

export function ExampleMetrics({ filterState }: ExampleMetricsProps) {
  const [activeMetricIndex, setActiveMetricIndex] = useState(0);
  
  // filterState가 변경될 때마다 리렌더링되는 메트릭 데이터 계산
  const metrics = useMemo(() => {
    if (!filterState || !filterState.startDate || !filterState.endDate) {
      return initialMetrics;
    }

    const days = Math.abs(differenceInDays(filterState.startDate, filterState.endDate)) + 1;
    return generateMetricsData(days);
  }, [filterState]);
  
  // filterState가 변경될 때마다 새로운 함수 생성
  const getSubtitle = useCallback(() => {
    console.log('ExampleMetrics - subtitle function called with filterState:', filterState);
    
    if (!filterState) {
      return "최근 30일간의 주요 DevOps 메트릭스 데이터";
    }

    if (filterState.datePreset === "custom" && filterState.startDate && filterState.endDate) {
      return `${format(filterState.startDate, 'yyyy/MM/dd', { locale: ko })} 부터 ${format(filterState.endDate, 'yyyy/MM/dd', { locale: ko })} 까지의 메트릭스 데이터`;
    }
    
    const preset = DATE_PRESETS.find(p => p.id === filterState.datePreset);
    if (preset) {
      return `${preset.name}간의 주요 DevOps 메트릭스 데이터`;
    }
    
    return "최근 30일간의 주요 DevOps 메트릭스 데이터";
  }, [filterState]);

  return (
    <MetricsCard
      title="DORA 메트릭스"
      subtitle={getSubtitle}
      metrics={metrics}
      activeMetricIndex={activeMetricIndex}
      onMetricClick={setActiveMetricIndex}
      chartComponent={MetricChart}
      filterState={filterState}
    />
  );
} 