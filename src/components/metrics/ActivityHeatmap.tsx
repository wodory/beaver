import React, { useMemo } from 'react';
import { format, startOfWeek, addDays, differenceInDays, parseISO, isValid, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// 활동 데이터 타입 정의
interface ActivityData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data: ActivityData[];
  startDate: Date;
  endDate: Date;
  maxWeeks?: number;
  title?: string;
  valueLabel?: string;
}

export function ActivityHeatmap({
  data,
  startDate,
  endDate,
  maxWeeks = 53,
  title = '활동 히트맵',
  valueLabel = '커밋'
}: ActivityHeatmapProps) {
  // 활동 데이터를 Map으로 변환
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(item => {
      if (item.date && item.count) {
        const dateObj = parseISO(item.date);
        if (isValid(dateObj)) {
          map.set(item.date, item.count);
        }
      }
    });
    return map;
  }, [data]);

  // 가능한 최대 활동 수 (색상 강도 계산용)
  const maxCount = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map(item => item.count));
  }, [data]);

  // 표시할 주 및 일 계산
  const { weeks, weekLabels } = useMemo(() => {
    const totalDays = differenceInDays(endDate, startDate);
    const weekCount = Math.min(Math.ceil(totalDays / 7), maxWeeks);
    
    // 표시할 최초 날짜 (현재일 기준으로 maxWeeks 이전)
    const actualStartDate = addDays(endDate, -Math.min(totalDays, maxWeeks * 7) + 1);
    
    // 주의 시작일 (일요일)로 조정
    const startOfFirstWeek = startOfWeek(actualStartDate, { weekStartsOn: 0 });
    
    // 각 주를 생성
    const weeks = [];
    const weekLabels = [];
    
    for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) {
      const week = [];
      const weekStart = addDays(startOfFirstWeek, weekIndex * 7);
      
      if (weekIndex % 4 === 0) {
        weekLabels.push({
          index: weekIndex,
          label: format(weekStart, 'MMM', { locale: ko })
        });
      }
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = addDays(weekStart, dayIndex);
        const dateString = format(date, 'yyyy-MM-dd');
        const isInRange = isWithinInterval(date, { start: startDate, end: endDate });
        
        week.push({
          date: dateString,
          count: isInRange ? (activityMap.get(dateString) || 0) : null,
          isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
        });
      }
      
      weeks.push(week);
    }
    
    return { weeks, weekLabels };
  }, [startDate, endDate, maxWeeks, activityMap]);

  // 활동 강도에 따른 색상 계산
  const getColorClass = (count: number | null) => {
    if (count === null) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 0) return 'bg-gray-200 dark:bg-gray-700';
    
    const intensity = Math.min(Math.ceil((count / Math.max(maxCount, 4)) * 4), 4);
    
    switch (intensity) {
      case 1: return 'bg-emerald-200 dark:bg-emerald-900';
      case 2: return 'bg-emerald-300 dark:bg-emerald-800';
      case 3: return 'bg-emerald-400 dark:bg-emerald-700';
      case 4: return 'bg-emerald-500 dark:bg-emerald-600';
      default: return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      
      <div className="flex">
        {/* 요일 레이블 */}
        <div className="flex flex-col justify-center mr-2 text-xs text-muted-foreground space-y-[3px]">
          {dayLabels.map((day, idx) => (
            <div key={idx} className="h-[10px] py-[2px] text-right">
              {idx % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>
        
        <div className="overflow-x-auto">
          <div className="relative" style={{ paddingBottom: '20px' }}>
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            w-[10px] h-[10px] rounded-sm
                            ${getColorClass(day.count)}
                            ${day.isToday ? 'ring-1 ring-primary' : ''}
                          `}
                        />
                      </TooltipTrigger>
                      <TooltipContent align="center" side="top">
                        <div className="text-xs">
                          <div>{format(parseISO(day.date), 'yyyy년 MM월 dd일 (eee)', { locale: ko })}</div>
                          <div className="font-semibold">{day.count !== null ? `${day.count}개의 ${valueLabel}` : '범위 밖'}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
            
            {/* 월 레이블 */}
            <div className="absolute left-0 bottom-0 flex">
              {weekLabels.map(label => (
                <div
                  key={label.index}
                  className="text-xs text-muted-foreground"
                  style={{ position: 'absolute', left: `${label.index * 11}px` }}
                >
                  {label.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 색상 범례 */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
        <span>적음</span>
        <div className="flex space-x-[2px]">
          <div className="w-[10px] h-[10px] rounded-sm bg-gray-200 dark:bg-gray-700" />
          <div className="w-[10px] h-[10px] rounded-sm bg-emerald-200 dark:bg-emerald-900" />
          <div className="w-[10px] h-[10px] rounded-sm bg-emerald-300 dark:bg-emerald-800" />
          <div className="w-[10px] h-[10px] rounded-sm bg-emerald-400 dark:bg-emerald-700" />
          <div className="w-[10px] h-[10px] rounded-sm bg-emerald-500 dark:bg-emerald-600" />
        </div>
        <span>많음</span>
      </div>
    </div>
  );
} 