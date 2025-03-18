import React from 'react';
import { ko } from 'date-fns/locale';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

// 날짜 범위 프리셋
const DATE_PRESETS = {
  '7d': '최근 7일',
  '14d': '최근 14일',
  '30d': '최근 30일',
  '60d': '최근 60일',
  '90d': '최근 90일',
  'thisMonth': '이번 달',
  'lastMonth': '지난 달',
  'custom': '직접 선택'
};

export function TeamDateRangePicker({ 
  startDate, 
  endDate, 
  onDateRangeChange 
}: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = React.useState('30d');
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  
  // 프리셋에 따라 날짜 범위 설정
  const applyPreset = (preset: string) => {
    const today = new Date();
    let newStartDate: Date;
    let newEndDate = today;
    
    switch (preset) {
      case '7d':
        newStartDate = subDays(today, 7);
        break;
      case '14d':
        newStartDate = subDays(today, 14);
        break;
      case '30d':
        newStartDate = subDays(today, 30);
        break;
      case '60d':
        newStartDate = subDays(today, 60);
        break;
      case '90d':
        newStartDate = subDays(today, 90);
        break;
      case 'thisMonth':
        newStartDate = startOfMonth(today);
        newEndDate = endOfMonth(today);
        break;
      case 'lastMonth':
        newStartDate = startOfMonth(subMonths(today, 1));
        newEndDate = endOfMonth(subMonths(today, 1));
        break;
      case 'custom':
        // 직접 선택은 팝오버 열기만 함
        setIsCalendarOpen(true);
        return;
      default:
        newStartDate = subDays(today, 30);
    }
    
    setSelectedPreset(preset);
    onDateRangeChange(newStartDate, newEndDate);
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Select value={selectedPreset} onValueChange={applyPreset}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="날짜 범위 선택" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(DATE_PRESETS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? (
              format(startDate, "yyyy년 MM월 dd일", { locale: ko }) + ' ~ ' + format(endDate, "yyyy년 MM월 dd일", { locale: ko })
            ) : (
              <span>날짜 범위 선택</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: startDate,
              to: endDate,
            }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onDateRangeChange(range.from, range.to);
                setSelectedPreset('custom');
                setIsCalendarOpen(false);
              }
            }}
            locale={ko}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
} 