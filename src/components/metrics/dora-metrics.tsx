import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { format, addDays, differenceInDays } from "date-fns"
import { ko } from "date-fns/locale"

interface FilterState {
  project: string;
  startDate: Date | null;
  endDate: Date | null;
  datePreset?: string;
}

const DATE_PRESETS = [
  { id: "7d", name: "최근 7일", days: 7 },
  { id: "14d", name: "최근 14일", days: 14 },
  { id: "30d", name: "최근 30일", days: 30 },
  { id: "90d", name: "최근 90일", days: 90 },
  { id: "custom", name: "사용자 지정", days: 0 },
];

// 메트릭 데이터 타입 정의
interface MetricDataPoint {
  date: string;
  value: number;
}

interface MetricData {
  title: string;
  value: string;
  subValue: string;
  change: { value: number; trend: "up" | "down" };
  status: string;
  tooltip: string;
  color: string;
  bgColorClass: string;
  cursorBgClass: string;
  graphData: MetricDataPoint[];
}

interface MetricsDataType {
  deploymentFrequency: MetricData;
  changeFailureRate: MetricData;
  cycleTime: MetricData;
  meanTimeToResponse: MetricData;
}

// 기본 메트릭 데이터 템플릿
const BASE_METRICS_DATA: MetricsDataType = {
  deploymentFrequency: {
    title: "배포 빈도",
    value: "2일 4시간",
    subValue: "총 285개 PR",
    change: { value: 36, trend: "up" },
    status: "Elite",
    tooltip: "프로덕션 환경에 성공적으로 배포하는 빈도",
    color: "var(--chart-deployment-frequency)",
    bgColorClass: "bg-chart-deployment-frequency-20",
    cursorBgClass: "bg-chart-deployment-frequency-15",
    graphData: []
  },
  changeFailureRate: {
    title: "변경 실패율",
    value: "17%",
    subValue: "총 48개 실패",
    change: { value: 12, trend: "down" },
    status: "High",
    tooltip: "프로덕션 환경에서 배포 실패가 발생하는 비율",
    color: "var(--chart-change-failure-rate)",
    bgColorClass: "bg-chart-change-failure-rate-20",
    cursorBgClass: "bg-chart-change-failure-rate-15",
    graphData: []
  },
  cycleTime: {
    title: "주기 시간",
    value: "2일 4시간",
    subValue: "총 243개 PR",
    change: { value: 26, trend: "up" },
    status: "Low",
    tooltip: "코드 커밋부터 프로덕션 배포까지 걸리는 시간",
    color: "var(--chart-cycle-time)",
    bgColorClass: "bg-chart-cycle-time-20",
    cursorBgClass: "bg-chart-cycle-time-15",
    graphData: []
  },
  meanTimeToResponse: {
    title: "평균 복구 시간",
    value: "3.2시간",
    subValue: "총 48개 실패",
    change: { value: 7, trend: "up" },
    status: "Mid",
    tooltip: "프로덕션 환경에서 실패가 발생한 후 복구까지 걸리는 시간",
    color: "var(--chart-mean-time-to-response)",
    bgColorClass: "bg-chart-mean-time-to-response-20",
    cursorBgClass: "bg-chart-mean-time-to-response-15",
    graphData: []
  }
};

type MetricKey = keyof typeof BASE_METRICS_DATA

interface DoraMetricsProps {
  filterState: FilterState;
}

export function DoraMetrics({ filterState }: DoraMetricsProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("deploymentFrequency")
  const [metricsData, setMetricsData] = useState<MetricsDataType>({ ...BASE_METRICS_DATA })
  const [barSize, setBarSize] = useState(40)

  // 선택된 기간에 따라 날짜 데이터 및 지표 값 생성
  useEffect(() => {
    // 날짜 범위 계산
    const startDate = filterState.startDate || new Date(new Date().setDate(new Date().getDate() - 30))
    const endDate = filterState.endDate || new Date()
    const days = Math.abs(differenceInDays(startDate, endDate)) + 1 // 날짜 수 계산 (시작일, 종료일 포함)
    
    // 바 크기 계산 (날짜 수에 따라 조정)
    let newBarSize = 40;
    if (days > 60) {
      newBarSize = 25;
    }
    if (days > 90) {
      newBarSize = 15;
    }
    setBarSize(newBarSize);
    
    // 새로운 메트릭 데이터 생성
    const newMetricsData = { ...BASE_METRICS_DATA }
    
    // 날짜 데이터 생성 (startDate부터 endDate까지)
    const dateLabels = Array.from({ length: Math.min(days, 90) }, (_, i) => {
      const date = addDays(startDate, i)
      return format(date, 'MM월 dd일', { locale: ko })
    })
    
    // 기간에 따라 배포 빈도 값 조정
    let deployFreq = "2일 4시간"
    let prCount = Math.floor(285 * (days / 30))
    let change = 36
    
    if (days <= 7) {
      deployFreq = "1일 2시간"
      change = 42
    } else if (days <= 14) {
      deployFreq = "1일 18시간"
      change = 39
    } else if (days > 60) {
      deployFreq = "3일 6시간"
      change = 28
    }
    
    newMetricsData.deploymentFrequency.value = deployFreq
    newMetricsData.deploymentFrequency.subValue = `총 ${prCount}개 PR`
    newMetricsData.deploymentFrequency.change.value = change
    newMetricsData.deploymentFrequency.graphData = dateLabels.map(date => ({
      date,
      value: Math.floor(Math.random() * 40) + 10
    }))
    
    // 변경 실패율 값 조정
    let failureRate = "17%"
    let failureCount = Math.floor(48 * (days / 30))
    let failureChange = 12
    
    if (days <= 7) {
      failureRate = "14%"
      failureChange = 18
    } else if (days <= 14) {
      failureRate = "16%"
      failureChange = 14
    } else if (days > 60) {
      failureRate = "19%"
      failureChange = 8
    }
    
    newMetricsData.changeFailureRate.value = failureRate
    newMetricsData.changeFailureRate.subValue = `총 ${failureCount}개 실패`
    newMetricsData.changeFailureRate.change.value = failureChange
    newMetricsData.changeFailureRate.graphData = dateLabels.map(date => ({
      date,
      value: Math.floor(Math.random() * 30) + 5
    }))
    
    // 주기 시간 값 조정
    let cycleTime = "2일 4시간"
    let cycleCount = Math.floor(243 * (days / 30))
    let cycleChange = 26
    
    if (days <= 7) {
      cycleTime = "1일 8시간"
      cycleChange = 32
    } else if (days <= 14) {
      cycleTime = "1일 18시간"
      cycleChange = 28
    } else if (days > 60) {
      cycleTime = "2일 12시간"
      cycleChange = 22
    }
    
    newMetricsData.cycleTime.value = cycleTime
    newMetricsData.cycleTime.subValue = `총 ${cycleCount}개 PR`
    newMetricsData.cycleTime.change.value = cycleChange
    newMetricsData.cycleTime.graphData = dateLabels.map(date => ({
      date,
      value: Math.floor(Math.random() * 50) + 20
    }))
    
    // 평균 복구 시간 값 조정
    let mttr = "3.2시간"
    let mttrCount = Math.floor(48 * (days / 30))
    let mttrChange = 7
    let mttrStatus = "Mid"
    
    if (days <= 7) {
      mttr = "2.5시간"
      mttrChange = 12
      mttrStatus = "High"
    } else if (days <= 14) {
      mttr = "2.8시간"
      mttrChange = 9
      mttrStatus = "High"
    } else if (days > 60) {
      mttr = "3.6시간"
      mttrChange = 5
      mttrStatus = "Low"
    }
    
    newMetricsData.meanTimeToResponse.value = mttr
    newMetricsData.meanTimeToResponse.subValue = `총 ${mttrCount}개 실패`
    newMetricsData.meanTimeToResponse.change.value = mttrChange
    newMetricsData.meanTimeToResponse.status = mttrStatus
    newMetricsData.meanTimeToResponse.graphData = dateLabels.map(date => ({
      date,
      value: Math.floor(Math.random() * 6) + 1
    }))
    
    setMetricsData(newMetricsData)
  }, [filterState])

  // 기간 정보 텍스트 생성
  const getPeriodText = (filter: FilterState) => {
    if (filter.datePreset === "custom" && filter.startDate && filter.endDate) {
      return `${format(filter.startDate, 'yyyy/MM/dd', { locale: ko })} 부터 ${format(filter.endDate, 'yyyy/MM/dd', { locale: ko })} 까지`;
    }
    
    const preset = DATE_PRESETS.find(p => p.id === filter.datePreset);
    if (preset) {
      return `${preset.name}간`;
    }
    
    return "기간 미설정";
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 p-0 border-b">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 border-b">
          <CardTitle>DORA 메트릭스</CardTitle>
          <CardDescription>
            {getPeriodText(filterState)}의 주요 DevOps 메트릭스 데이터
          </CardDescription>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
          {(Object.keys(metricsData) as MetricKey[]).map((key) => {
            const metric = metricsData[key];
            const isActive = selectedMetric === key;
            
            return (
              <button
                key={key}
                data-active={isActive}
                className={`relative flex flex-col justify-center gap-1 px-4 py-4 text-left transition-colors hover:bg-muted/30 ${
                  isActive ? `${metric.bgColorClass}` : ''
                }`}
                style={{ 
                  color: isActive ? 'hsl(var(--foreground))' : undefined,
                  borderTopColor: isActive ? metric.color : undefined,
                  borderTopStyle: isActive ? 'solid' : 'none',
                  borderTopWidth: isActive ? '2px' : '0'
                }}
                onClick={() => setSelectedMetric(key)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`text-xs ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'} truncate`}>
                      {metric.title}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex ml-1 cursor-help">
                          <HelpCircle className={`h-3 w-3 ${isActive ? 'text-foreground/90' : 'text-muted-foreground'}`} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">{metric.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className={`text-xs font-medium ml-1 ${
                    metric.change.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}>
                    {metric.change.trend === "up" ? "↑" : "↓"} {metric.change.value}%
                  </span>
                </div>
                <span className="text-lg font-bold leading-none mt-1 sm:text-2xl">
                  {metric.value}
                </span>
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${isActive ? 'text-foreground/80' : 'text-muted-foreground'} truncate`}>
                    {metric.subValue}
                  </span>
                  <span className={`text-xs font-medium ml-1 ${
                    metric.status === "Elite" ? "text-green-500" : 
                    metric.status === "High" ? "text-blue-500" :
                    metric.status === "Mid" ? "text-yellow-500" : "text-red-500"
                  }`}>
                    {metric.status}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-6 pb-2 sm:p-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={metricsData[selectedMetric].graphData} 
              margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontFamily: 'inherit', fill: 'hsl(var(--muted-foreground))' }}
                tickMargin={10}
                interval={metricsData[selectedMetric].graphData.length > 60 ? 4 : metricsData[selectedMetric].graphData.length > 30 ? 2 : 0}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontFamily: 'inherit', fill: 'hsl(var(--muted-foreground))' }}
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
                cursor={{ fill: metricsData[selectedMetric].color + '15' }}
                formatter={(value) => [`${value}`, metricsData[selectedMetric].title]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar 
                dataKey="value" 
                fill={metricsData[selectedMetric].color}
                radius={[4, 4, 0, 0]}
                maxBarSize={barSize}
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 