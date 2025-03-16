import { ReactNode, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// 메트릭 데이터 인터페이스
export interface MetricItem {
  title: ReactNode;
  value: string;
  subValue: string;
  trend: {
    value: number;
    direction: "up" | "down";
  };
  status: "Elite" | "High" | "Mid" | "Low";
  color: string;
  count?: {
    value: number;
    label: string;
  };
  chartData?: any; // 차트 데이터 (구체적인 타입은 차트 컴포넌트에 따라 다름)
}

// 메트릭 버튼 렌더링을 위한 props
export interface MetricButtonProps {
  metric: MetricItem;
  isActive: boolean;
  onClick: () => void;
  isFirst?: boolean;
}

// 메인 컴포넌트 props
export interface MetricsCardProps {
  title: ReactNode;
  subtitle?: ReactNode | (() => string);
  metrics: MetricItem[];
  activeMetricIndex: number;
  onMetricClick: (index: number) => void;
  chartComponent?: React.ComponentType<{
    data: any;
    color: string;
  }>;
  filterState?: any;
}

// 개별 메트릭 버튼 컴포넌트
export function MetricButton({ metric, isActive, onClick, isFirst }: MetricButtonProps) {
  const statusColors = {
    Elite: "text-green-500",
    High: "text-blue-500",
    Mid: "text-yellow-500",
    Low: "text-red-500"
  }

  const trendColors = {
    up: "text-green-500",
    down: "text-red-500"
  }

  // 버튼 상단 보더 스타일
  const buttonBorderStyle = isActive 
    ? { borderTop: `2px solid ${metric.color}` }
    : {};

  // 버튼 배경 스타일
  const buttonBgStyle = isActive 
    ? { backgroundColor: `${metric.color}10` }
    : {};

  return (
    <button
      style={{ ...buttonBorderStyle, ...buttonBgStyle }}
      className={cn(
        "relative z-30 flex flex-1 flex-col justify-center gap-1 px-4 py-5 text-left transition-colors hover:bg-muted/30",
        "border-l data-[active=true] sm:px-4 sm:py-5",
        !isFirst && "border-l",
        isActive ? "border-t-2" : "border-t",
      )}
      onClick={onClick}
      data-active={isActive}
    >
      <div className="flex justify-between items-center w-full">
        <div className="text-xs font-medium text-muted-foreground truncate pr-1 max-w-[75%]">
          {metric.title}
        </div>
        <span className={cn(
          "text-xs font-medium ml-1 whitespace-nowrap",
          trendColors[metric.trend.direction]
        )}>
          {metric.trend.direction === "up" ? "↑" : "↓"} {metric.trend.value}%
        </span>
      </div>
      
      <div className="w-full mt-2">
        <span className="text-xl font-bold leading-none sm:text-2xl block">
          {metric.value}
        </span>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground truncate pr-1 max-w-[75%]">
            {metric.count ? `총 ${metric.count.value}개 ${metric.count.label}` : metric.subValue}
          </span>
          <span className={cn(
            "text-xs font-medium whitespace-nowrap",
            statusColors[metric.status]
          )}>
            {metric.status}
          </span>
        </div>
      </div>
    </button>
  )
}

// 메인 MetricsCard 컴포넌트
export function MetricsCard({
  title,
  subtitle,
  metrics,
  activeMetricIndex,
  onMetricClick,
  chartComponent: ChartComponent,
  filterState
}: MetricsCardProps) {
  const activeMetric = metrics[activeMetricIndex];
  
  // subtitle이 함수인 경우 실행 (filterState 변경 시 재실행)
  console.log('MetricsCard - filterState:', filterState);
  console.log('MetricsCard - subtitle type:', typeof subtitle);
  
  // useMemo를 사용하여 filterState가 변경될 때마다 subtitle 함수를 다시 호출
  const subtitleContent = useMemo(() => {
    const result = typeof subtitle === 'function' ? subtitle() : subtitle;
    console.log('MetricsCard - useMemo subtitleContent:', result);
    return result;
  }, [subtitle, filterState]);
  
  console.log('MetricsCard - subtitleContent:', subtitleContent);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-stretch space-y-0.5 px-6 py-5 border-b">
        <CardTitle>{title}</CardTitle>
        {subtitleContent && <CardDescription className="mt-0.5">{subtitleContent}</CardDescription>}
      </CardHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
        {metrics.map((metric, index) => (
          <MetricButton
            key={index}
            metric={metric}
            isActive={index === activeMetricIndex}
            onClick={() => onMetricClick(index)}
            isFirst={index === 0}
          />
        ))}
      </div>
      
      <div className="border-b"></div>

      {ChartComponent && activeMetric && (
        <CardContent className="px-2 pt-6 pb-2 sm:p-6">
          <div className="h-[300px] w-full">
            <ChartComponent 
              data={activeMetric.chartData} 
              color={activeMetric.color} 
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
} 