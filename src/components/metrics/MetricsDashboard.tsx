import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, subDays, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FilterBar } from '../ui/FilterBar';
import { 
  fetchProjectMetrics,
  fetchDeveloperMetrics,
  fetchTeamMetrics
} from '../../api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Inbox } from 'lucide-react';

// 필터 상태 타입 정의
interface FilterState {
  project: string;
  startDate: Date | null;
  endDate: Date | null;
  datePreset?: string;
}

export function MetricsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRepo, setSelectedRepo] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [startDate, setStartDate] = useState<Date>(() => subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(() => new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // API 데이터를 저장할 상태 변수들
  const [projectMetrics, setProjectMetrics] = useState<any>(null);
  const [developerMetrics, setDeveloperMetrics] = useState<any>(null);
  const [teamMetrics, setTeamMetrics] = useState<any>(null);
  
  // 필터 변경 시 데이터 로드
  useEffect(() => {
    const loadMetrics = async () => {
      if (!selectedRepo || selectedRepo === 'all') return;
      
      setLoading(true);
      setError(null);
      
      try {
        // 선택한 저장소의 메트릭스 데이터 로드
        const projectData = await fetchProjectMetrics(
          selectedRepo, 
          startDate, 
          endDate
        );
        setProjectMetrics(projectData);
        
        // 사용자 메트릭스 데이터 로드
        const devData = await fetchDeveloperMetrics(
          "1", 
          startDate, 
          endDate
        );
        setDeveloperMetrics(devData);
        
        // 팀 메트릭스 데이터 로드
        const teamData = await fetchTeamMetrics(
          "team1", 
          startDate, 
          endDate
        );
        setTeamMetrics(teamData);
        
      } catch (err) {
        console.error('메트릭스 데이터 로드 실패:', err);
        setError('메트릭스 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadMetrics();
  }, [selectedRepo, startDate, endDate]);
  
  // 필터 변경 핸들러
  const handleFilterChange = (filters: FilterState) => {
    setSelectedRepo(filters.project);
    if (filters.startDate) setStartDate(filters.startDate);
    if (filters.endDate) setEndDate(filters.endDate);
  };

  // 데이터 없음 상태 확인
  const hasNoData = useMemo(() => {
    return !projectMetrics && !developerMetrics && !teamMetrics;
  }, [projectMetrics, developerMetrics, teamMetrics]);

  // 기간 텍스트 생성
  const dateRangeText = useMemo(() => {
    const koreanDateFormat = 'yyyy년 M월 d일';
    return `${format(startDate, koreanDateFormat, { locale: ko })} ~ ${format(endDate, koreanDateFormat, { locale: ko })}`;
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">개발 메트릭스 대시보드</h1>
        <Badge variant="outline" className="px-3 py-1">
          {dateRangeText}
        </Badge>
      </div>

      <FilterBar onFilterChange={handleFilterChange} />
      
      {/* 로딩 상태 UI 개선 */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* 에러 상태 UI 개선 */}
      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription>
            {error}
            <button 
              className="underline ml-2" 
              onClick={() => {
                setLoading(true);
                setError(null);
                // 데이터 다시 로드 로직
                const loadMetrics = async () => {
                  if (!selectedRepo || selectedRepo === 'all') return;
                  
                  setLoading(true);
                  setError(null);
                  
                  try {
                    // 선택한 저장소의 메트릭스 데이터 로드
                    const projectData = await fetchProjectMetrics(
                      selectedRepo, 
                      startDate, 
                      endDate
                    );
                    setProjectMetrics(projectData);
                    
                    // 사용자 메트릭스 데이터 로드
                    const devData = await fetchDeveloperMetrics(
                      "1", 
                      startDate, 
                      endDate
                    );
                    setDeveloperMetrics(devData);
                    
                    // 팀 메트릭스 데이터 로드
                    const teamData = await fetchTeamMetrics(
                      "team1", 
                      startDate, 
                      endDate
                    );
                    setTeamMetrics(teamData);
                    
                  } catch (err) {
                    console.error('메트릭스 데이터 로드 실패:', err);
                    setError('메트릭스 데이터를 불러오는 중 오류가 발생했습니다.');
                  } finally {
                    setLoading(false);
                  }
                };
                
                loadMetrics();
              }}
            >
              다시 시도
            </button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* 데이터 없음 상태 UI */}
      {!loading && !error && hasNoData && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Inbox className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">데이터가 없습니다</h3>
          <p className="text-sm text-muted-foreground mb-4">
            선택한 기간 또는 저장소에 대한 메트릭스 데이터가 없습니다.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              // 필터 초기화 또는 다른 기간 선택
              setStartDate(subDays(new Date(), 30));
              setEndDate(new Date());
              if (selectedRepo !== 'all') {
                setSelectedRepo('all');
              }
            }}
          >
            다른 기간 선택
          </Button>
        </div>
      )}
      
      {/* 실제 데이터만 사용하고 더미 데이터 폴백 제거 */}
      {!loading && !error && !hasNoData && (
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full border-b rounded-none justify-start max-w-4xl">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="user">개발자</TabsTrigger>
            <TabsTrigger value="repository">저장소</TabsTrigger>
            <TabsTrigger value="team">팀</TabsTrigger>
            <TabsTrigger value="comparison">비교</TabsTrigger>
            <TabsTrigger value="events">이벤트</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectMetrics && (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Pull Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{projectMetrics.prCount}</div>
                      <div className="text-sm text-muted-foreground">
                        병합됨: {projectMetrics.prMergedCount} ({Math.round(projectMetrics.prMergedCount / projectMetrics.prCount * 100)}%)
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>코드 변경</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{projectMetrics.totalAdditions + projectMetrics.totalDeletions} 라인</div>
                      <div className="text-sm text-muted-foreground">
                        추가: {projectMetrics.totalAdditions}, 삭제: {projectMetrics.totalDeletions}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>리뷰 응답 시간</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{Math.round(projectMetrics.avgTimeToFirstReview / 60)} 시간</div>
                      <div className="text-sm text-muted-foreground">
                        평균 첫 리뷰 응답 시간
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>PR 사이클 타임</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{Math.round(projectMetrics.avgTimeToMerge / 60)} 시간</div>
                      <div className="text-sm text-muted-foreground">
                        평균 PR 생성부터 병합까지 시간
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>배포 빈도</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{projectMetrics.deploymentFrequency?.toFixed(1) || "N/A"} 회/일</div>
                      <div className="text-sm text-muted-foreground">
                        일평균 배포 횟수
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>변경 실패율</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{(projectMetrics.changeFailureRate * 100).toFixed(1) || "N/A"}%</div>
                      <div className="text-sm text-muted-foreground">
                        문제가 발생한 배포 비율
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* 개발자 탭 */}
          <TabsContent value="user">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>개발자 활동</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{developerMetrics?.commitCount} 커밋</div>
                  <div className="text-sm text-muted-foreground">
                    활동 일수: {developerMetrics?.activeCommitDays}일 (총 {differenceInDays(new Date(developerMetrics?.endDate), new Date(developerMetrics?.startDate))}일 중)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>코드 변경</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{developerMetrics?.totalAdditions + developerMetrics?.totalDeletions} 라인</div>
                  <div className="text-sm text-muted-foreground">
                    추가: {developerMetrics?.totalAdditions}, 삭제: {developerMetrics?.totalDeletions}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Pull Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{developerMetrics?.prCount} PR</div>
                  <div className="text-sm text-muted-foreground">
                    병합됨: {developerMetrics?.prMergedCount} ({Math.round(developerMetrics?.prMergedCount / (developerMetrics?.prCount || 1) * 100)}%)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>리뷰 활동</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{developerMetrics?.reviewsGivenCount} 리뷰</div>
                  <div className="text-sm text-muted-foreground">
                    PR당 평균 리뷰: {(developerMetrics?.reviewsGivenCount / (developerMetrics?.prCount || 1)).toFixed(1)}개
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 저장소 탭 */}
          <TabsContent value="repository">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>컨트리뷰터 수</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{projectMetrics?.contributorCount || "N/A"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>리뷰 수</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{projectMetrics?.reviewCount || "N/A"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>커밋 수</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{projectMetrics?.commitCount || "N/A"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>코드 변경</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{projectMetrics?.totalAdditions + projectMetrics?.totalDeletions} 라인</div>
                  <div className="text-sm text-muted-foreground">
                    추가: {projectMetrics?.totalAdditions}, 삭제: {projectMetrics?.totalDeletions}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>리뷰 응답 시간</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{Math.round(projectMetrics?.avgTimeToFirstReview / 60) || "N/A"} 시간</div>
                  <div className="text-sm text-muted-foreground">
                    평균 첫 리뷰 응답 시간
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>PR 사이클 타임</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{Math.round(projectMetrics?.avgTimeToMerge / 60) || "N/A"} 시간</div>
                  <div className="text-sm text-muted-foreground">
                    평균 PR 생성부터 병합까지 시간
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>배포 빈도</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{projectMetrics?.deploymentFrequency?.toFixed(1) || "N/A"} 회/일</div>
                  <div className="text-sm text-muted-foreground">
                    일평균 배포 횟수
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>변경 실패율</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{(projectMetrics?.changeFailureRate * 100).toFixed(1) || "N/A"}%</div>
                  <div className="text-sm text-muted-foreground">
                    문제가 발생한 배포 비율
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 팀 탭 */}
          <TabsContent value="team">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>팀 멤버 수</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{teamMetrics?.memberCount || "N/A"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>커밋 수</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{teamMetrics?.commitCount || "N/A"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>리뷰 수</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{teamMetrics?.reviewCount || "N/A"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>코드 변경</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{teamMetrics?.totalAdditions + teamMetrics?.totalDeletions} 라인</div>
                  <div className="text-sm text-muted-foreground">
                    추가: {teamMetrics?.totalAdditions}, 삭제: {teamMetrics?.totalDeletions}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>리뷰 응답 시간</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{Math.round(teamMetrics?.avgTimeToFirstReview / 60) || "N/A"} 시간</div>
                  <div className="text-sm text-muted-foreground">
                    평균 첫 리뷰 응답 시간
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>PR 사이클 타임</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{Math.round(teamMetrics?.avgTimeToMerge / 60) || "N/A"} 시간</div>
                  <div className="text-sm text-muted-foreground">
                    평균 PR 생성부터 병합까지 시간
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>배포 빈도</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{teamMetrics?.deploymentFrequency?.toFixed(1) || "N/A"} 회/일</div>
                  <div className="text-sm text-muted-foreground">
                    일평균 배포 횟수
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>변경 실패율</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{(teamMetrics?.changeFailureRate * 100).toFixed(1) || "N/A"}%</div>
                  <div className="text-sm text-muted-foreground">
                    문제가 발생한 배포 비율
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 