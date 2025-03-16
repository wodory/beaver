import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Info, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MetricLevel = 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high' | 'unknown';

type PerformanceIndicatorProps = {
  title: string;
  value: number | null;
  unit: string;
  level: MetricLevel;
  description?: string;
  isLoading?: boolean;
};

const getLevelColor = (level: MetricLevel): string => {
  switch (level) {
    case 'low':
      return 'bg-[#FF3B30] text-white dark:bg-[#FF3B30] dark:text-white'; // 위험 - 빨강
    case 'medium-low':
      return 'bg-[#FF9500] text-white dark:bg-[#FF9500] dark:text-white'; // 미흡 - 주황
    case 'medium':
      return 'bg-[#FFCC00] text-black dark:bg-[#FFCC00] dark:text-black'; // 양호 - 노랑
    case 'medium-high':
      return 'bg-[#34C759] text-white dark:bg-[#34C759] dark:text-white'; // 우수 - 녹색
    case 'high':
      return 'bg-[#007AFF] text-white dark:bg-[#007AFF] dark:text-white'; // 최상 - 파랑
    case 'unknown':
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getLevelLabel = (level: MetricLevel): string => {
  switch (level) {
    case 'low':
      return '위험';
    case 'medium-low':
      return '미흡';
    case 'medium':
      return '양호';
    case 'medium-high':
      return '우수';
    case 'high':
      return '최상';
    case 'unknown':
    default:
      return '알 수 없음';
  }
};

const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({ 
  title, 
  value, 
  unit, 
  level,
  description,
  isLoading = false
}) => {
  const levelColor = getLevelColor(level);
  const levelLabel = getLevelLabel(level);

  // 값 포맷팅 함수 - 소수점 1자리로 제한
  const formatValue = (val: number | null): string => {
    if (val === null) return '-';
    
    // 소수점 첫째 자리까지 표시 (반올림)
    return val.toFixed(1);
  };

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center gap-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && (
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button 
                    type="button"
                    className="text-muted-foreground hover:text-foreground focus:outline-none"
                    aria-label={`${title} 설명 보기`}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-2">
                  <p className="text-sm">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">데이터 로딩 중...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold">
              {value !== null ? `${formatValue(value)} ${unit}` : '-'}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">성능 레벨:</span>
              <span 
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium', 
                  levelColor
                )}
              >
                {levelLabel}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceIndicator; 