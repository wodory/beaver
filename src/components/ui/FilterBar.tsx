import { ReactNode, useState, useEffect } from "react";
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
import { fetchRepositories } from "@/api/client";

// 기본 프로젝트 목록 (API가 없을 때 사용)
const FALLBACK_PROJECTS = [
  { id: "all", name: "모든 프로젝트" },
  { id: "n3r/web-ui", name: "web-ui" },
  { id: "wodory/beaver", name: "beaver" },
  { id: "wodory/flowmate", name: "flowmate" },
  { id: "se-framework/zero-js", name: "zero-js" },
  { id: "pinpoint/pinpoint-naver", name: "pinpoint-naver" },
  { id: "nelo/web-ui", name: "web-ui (nelo)" },
];

// 기간 프리셋 목록
const DATE_PRESETS = [
  { id: "7d", name: "최근 7일", days: 7 },
  { id: "14d", name: "최근 14일", days: 14 },
  { id: "30d", name: "최근 30일", days: 30 },
  { id: "90d", name: "최근 90일", days: 90 },
  { id: "custom", name: "사용자 지정", days: 0 },
];

export interface FilterState {
  project: string;
  startDate: Date | null;
  endDate: Date | null;
  datePreset?: string;
}

interface FilterBarProps {
  children?: ReactNode;
  onFilterChange?: (filters: FilterState) => void;
  filterState?: FilterState;
}

export function FilterBar({ children, onFilterChange, filterState }: FilterBarProps) {
  const [selectedProject, setSelectedProject] = useState(filterState?.project || "all");
  const [selectedDatePreset, setSelectedDatePreset] = useState(filterState?.datePreset || "30d");
  const [startDate, setStartDate] = useState<Date | null>(
    filterState?.startDate ? new Date(filterState.startDate) : subDays(new Date(), 30)
  );
  const [endDate, setEndDate] = useState<Date | null>(
    filterState?.endDate ? new Date(filterState.endDate) : new Date()
  );
  const [isCustomDate, setIsCustomDate] = useState(selectedDatePreset === "custom");
  const [repositories, setRepositories] = useState<Array<{id: string, name: string}>>([
    ...FALLBACK_PROJECTS
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // DB에서 저장소 목록 가져오기
  const loadRepositories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // API를 통해 저장소 목록 가져오기 (DB에 저장된 데이터를 가져옴)
      // 항상 최신 데이터를 사용하도록 forceRefresh를 true로 설정
      const response = await fetchRepositories(true);
      
      if (response && Array.isArray(response) && response.length > 0) {
        console.log("DB에서 저장소 목록을 성공적으로 가져왔습니다:", response);
        
        // API 응답에서 저장소 목록 변환
        const repoOptions = response.map(repo => ({
          id: repo.fullName,
          name: repo.name || repo.fullName
        }));
        
        // "모든 프로젝트" 옵션과 함께 설정
        setRepositories([
          { id: "all", name: "모든 프로젝트" },
          ...repoOptions
        ]);
      } else {
        console.log('DB에서 저장소 목록을 가져올 수 없습니다. 기본 옵션을 사용합니다.');
        // 저장소가 없거나 API 요청 실패 시 기본 옵션 사용 (유지)
      }
    } catch (error) {
      console.error('저장소 목록을 가져오는 중 오류가 발생했습니다:', error);
      setError('저장소 목록을 가져오는 중 오류가 발생했습니다');
      // 에러 발생 시에도 기본 옵션 유지
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 및 내부 상태가 변경될 때마다 저장소 목록 로드 시도
  useEffect(() => {
    loadRepositories().catch(err => {
      console.error('저장소 목록 로드 실패:', err);
    });
    
    // 5초마다 저장소 목록 갱신
    const intervalId = setInterval(() => {
      loadRepositories().catch(err => {
        console.error('저장소 목록 주기적 로드 실패:', err);
      });
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  // filterState가 외부에서 변경되면 내부 상태 업데이트
  useEffect(() => {
    if (filterState) {
      setSelectedProject(filterState.project || "all");
      setSelectedDatePreset(filterState.datePreset || "30d");
      
      if (filterState.startDate) {
        setStartDate(new Date(filterState.startDate));
      }
      
      if (filterState.endDate) {
        setEndDate(new Date(filterState.endDate));
      }
      
      setIsCustomDate(filterState.datePreset === "custom");
    }
  }, [filterState]);

  // 날짜 프리셋이 변경될 때 날짜 범위 업데이트
  const handleDatePresetChange = (value: string) => {
    setSelectedDatePreset(value);
    
    if (value === "custom") {
      setIsCustomDate(true);
      
      if (onFilterChange) {
        onFilterChange({
          project: selectedProject,
          startDate,
          endDate,
          datePreset: value
        });
      }
      
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
          endDate: end,
          datePreset: value
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
        endDate,
        datePreset: selectedDatePreset
      });
    }
  };

  // 사용자 지정 날짜가 변경될 때 처리
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date || null);
    
    if (onFilterChange && date) {
      onFilterChange({
        project: selectedProject,
        startDate: date,
        endDate,
        datePreset: selectedDatePreset
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date || null);
    
    if (onFilterChange && date) {
      onFilterChange({
        project: selectedProject,
        startDate,
        endDate: date,
        datePreset: selectedDatePreset
      });
    }
  };

  // 저장소 목록 수동 새로고침
  const handleRefreshRepositories = () => {
    loadRepositories();
  };

  return (
    <div className="flex flex-wrap items-center gap-4 w-full pb-4">
      <div className="flex flex-col gap-1.5 min-w-[150px]">
        <Label htmlFor="project-filter">프로젝트</Label>
        <Select
          value={selectedProject}
          onValueChange={handleProjectChange}
        >
          <SelectTrigger id="project-filter" className="w-full md:w-[200px]">
            <SelectValue placeholder={isLoading ? "로딩 중..." : "프로젝트 선택"} />
          </SelectTrigger>
          <SelectContent>
            {repositories.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      <div className="flex flex-col gap-1.5 min-w-[120px]">
        <Label htmlFor="date-preset">기간</Label>
        <Select
          value={selectedDatePreset}
          onValueChange={handleDatePresetChange}
        >
          <SelectTrigger id="date-preset" className="w-full md:w-[150px]">
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

      {/* 추가 필터 (children)가 있으면 렌더링 */}
      {children && (
        <div className="ml-auto mt-2 md:mt-0">
          {children}
        </div>
      )}
    </div>
  );
} 