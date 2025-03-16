"use client"

import * as React from "react"
import { format, isValid } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date | null;
  setDate?: (date: Date | undefined) => void;
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
  placeholder?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DatePicker({ 
  date, 
  setDate, 
  selected, 
  onSelect,
  placeholder = "날짜 선택",
  open,
  onOpenChange,
}: DatePickerProps) {
  // 날짜 유효성 확인
  const ensureValidDate = (date: Date | string | null | undefined): Date | null => {
    if (!date) return null;
    if (date instanceof Date && isValid(date)) return date;
    if (typeof date === 'string') {
      try {
        const parsedDate = new Date(date);
        return isValid(parsedDate) ? parsedDate : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };
  
  // date와 selected, setDate와 onSelect를 함께 지원하기 위한 처리
  const selectedDateInput = selected || date;
  const selectedDate = ensureValidDate(selectedDateInput);
  
  const [isOpenState, setIsOpenState] = React.useState(false);
  
  // open prop이 제공되지 않았을 때 내부 상태 사용
  const isOpen = open !== undefined ? open : isOpenState;
  const setIsOpen = onOpenChange || setIsOpenState;
  
  // 현재 선택된 날짜를 기준으로 월 설정 (없으면 현재 월)
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    selectedDate || new Date()
  );
  
  // 팝업 열릴 때 선택된 날짜가 있는 월로 설정
  React.useEffect(() => {
    if (isOpen && selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [isOpen, selectedDate]);
  
  const handleDateChange = (newDate: Date | undefined) => {
    if (onSelect) {
      onSelect(newDate || null);
    }
    if (setDate) {
      setDate(newDate);
    }
    setIsOpen(false); // 날짜 선택 후 팝업 닫기
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[160px] justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP", { locale: ko }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          initialFocus
          modifiers={{ today: new Date() }}
          modifiersStyles={{
            today: { fontWeight: 'bold', border: '1px solid currentColor' }
          }}
        />
      </PopoverContent>
    </Popover>
  )
} 