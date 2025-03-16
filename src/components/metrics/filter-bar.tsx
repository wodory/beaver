import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { addDays, subDays } from "date-fns";

// 예시 프로젝트 목록 (실제 데이터는 API에서 가져와야 함)
const SAMPLE_PROJECTS = [
  { id: "all", name: "모든 프로젝트" },
  { id: "amplify-notify", name: "amplify-notify" },
  { id: "apps-react", name: "apps-react" },
  { id: "beaver", name: "beaver" },
  { id: "api-gateway", name: "api-gateway" },
];

// 기간 프리셋 목록
const DATE_PRESETS = [
  { id: "7d", name: "최근 7일", days: 7 },
  { id: "14d", name: "최근 14일", days: 14 },
  { id: "30d", name: "최근 30일", days: 30 },
  { id: "90d", name: "최근 90일", days: 90 },
  { id: "custom", name: "사용자 지정", days: 0 },
];

interface FilterBarProps {
  onFilterChange?: (filters: {
    project: string;
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDatePreset, setSelectedDatePreset] = useState("30d");
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isCustomDate, setIsCustomDate] = useState(false);

  // 날짜 프리셋이 변경될 때 날짜 범위 업데이트
  const handleDatePresetChange = (value: string) => {
    setSelectedDatePreset(value);
    
    if (value === "custom") {
      setIsCustomDate(true);
      return;
    }
    
    setIsCustomDate(false);
    const preset = DATE_PRESETS.find(p => p.id === value);
    if (preset) {
      const end = new Date();
      const start = subDays(end, preset.days);
      setStartDate(start);
      setEndDate(end);
      
      if (onFilterChange) {
        onFilterChange({
          project: selectedProject,
          startDate: start,
          endDate: end
        });
      }
    }
  };

  // 프로젝트가 변경될 때 필터 업데이트
  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    
    if (onFilterChange) {
      onFilterChange({
        project: value,
        startDate,
        endDate
      });
    }
  };

  // 사용자 지정 날짜가 변경될 때 처리
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    
    if (onFilterChange && date) {
      onFilterChange({
        project: selectedProject,
        startDate: date,
        endDate
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    
    if (onFilterChange && date) {
      onFilterChange({
        project: selectedProject,
        startDate,
        endDate: date
      });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 pb-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="project-filter">프로젝트</Label>
        <Select
          value={selectedProject}
          onValueChange={handleProjectChange}
        >
          <SelectTrigger id="project-filter" className="w-[200px]">
            <SelectValue placeholder="프로젝트 선택" />
          </SelectTrigger>
          <SelectContent>
            {SAMPLE_PROJECTS.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date-preset">기간</Label>
        <Select
          value={selectedDatePreset}
          onValueChange={handleDatePresetChange}
        >
          <SelectTrigger id="date-preset" className="w-[150px]">
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            {DATE_PRESETS.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isCustomDate && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="start-date">시작일</Label>
            <DatePicker
              date={startDate}
              setDate={handleStartDateChange}
              placeholder="시작일 선택"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="end-date">종료일</Label>
            <DatePicker
              date={endDate}
              setDate={handleEndDateChange}
              placeholder="종료일 선택"
            />
          </div>
        </>
      )}
    </div>
  );
} 