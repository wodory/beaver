import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TeamActivityChart } from './TeamActivityChart';
import { TeamList } from './TeamList';
import { TeamDateRangePicker } from './TeamDateRangePicker';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { RefreshCw, Calendar, Trash2 } from 'lucide-react';
import { useTeamStore } from '../../store/teamStore';

export function TeamMetricsView() {
  // Zustand 스토어에서 상태와 액션 가져오기
  const {
    teams,
    isTeamsLoading,
    teamsError,
    selectedTeamId,
    selectedTeamName,
    teamMetrics,
    isMetricsLoading,
    metricsError,
    startDate,
    endDate,
    lastUpdated,
    loadTeams,
    selectTeam,
    loadTeamMetrics,
    setDateRange,
    refreshData,
    clearCache
  } = useTeamStore();

  // 컴포넌트 마운트 시 팀 목록 로드
  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleSelectTeam = (teamId: string, teamName: string) => {
    selectTeam(teamId, teamName);
  };
  
  const handleRefresh = () => {
    refreshData();
  };
  
  const handleClearCache = () => {
    clearCache();
    refreshData();
  };
  
  const handleDateRangeChange = (newStartDate: Date, newEndDate: Date) => {
    setDateRange(newStartDate, newEndDate);
  };
  
  const renderDateRange = () => {
    const formatOptions = { locale: ko };
    return (
      <div className="text-sm text-muted-foreground mb-4 flex items-center">
        <Calendar className="w-4 h-4 mr-1" />
        {format(startDate, 'yyyy년 MM월 dd일', formatOptions)} ~ {format(endDate, 'yyyy년 MM월 dd일', formatOptions)}
        {lastUpdated && (
          <span className="ml-4">
            마지막 업데이트: {format(lastUpdated, 'yyyy-MM-dd HH:mm:ss')}
          </span>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">팀 메트릭스</h2>
        <div className="flex items-center space-x-2">
          <TeamDateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
          />
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> 
            새로고침
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearCache}>
            <Trash2 className="h-4 w-4 mr-2" /> 
            캐시 초기화
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <TeamList 
            onSelectTeam={handleSelectTeam} 
            selectedTeamId={selectedTeamId || undefined}
            teams={teams}
            isLoading={isTeamsLoading}
            error={teamsError}
          />
        </div>
        
        <div className="w-full md:w-2/3">
          {!selectedTeamId ? (
            <Card>
              <CardHeader>
                <CardTitle>팀 메트릭스</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">왼쪽에서 팀을 선택하면 해당 팀의 메트릭스가 표시됩니다.</p>
              </CardContent>
            </Card>
          ) : isMetricsLoading ? (
            <Card>
              <CardHeader>
                <CardTitle>메트릭스 로딩 중...</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-[300px] w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-[120px] w-full" />
                  <Skeleton className="h-[120px] w-full" />
                </div>
              </CardContent>
            </Card>
          ) : metricsError ? (
            <Card>
              <CardHeader>
                <CardTitle>오류 발생</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-500">{metricsError}</p>
                <Button 
                  variant="outline" 
                  onClick={() => loadTeamMetrics(true)} 
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> 
                  다시 시도
                </Button>
              </CardContent>
            </Card>
          ) : teamMetrics ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{teamMetrics.teamName} 팀 메트릭스</h2>
                <Button variant="outline" size="sm" onClick={() => loadTeamMetrics(true)}>
                  <RefreshCw className="h-4 w-4 mr-2" /> 
                  새로고침
                </Button>
              </div>
              
              {renderDateRange()}
              
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">개요</TabsTrigger>
                  <TabsTrigger value="activity">활동</TabsTrigger>
                  <TabsTrigger value="pr">PR 관련</TabsTrigger>
                  <TabsTrigger value="jira">JIRA</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">총 커밋 수</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{teamMetrics.commitCount}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">총 PR 수</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{teamMetrics.prCount}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">PR 병합률</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{Math.round(teamMetrics.prMergeRate * 100)}%</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">팀 구성원</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{teamMetrics.memberCount}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {teamMetrics && <TeamActivityChart teamData={teamMetrics} />}
                </TabsContent>
                
                <TabsContent value="activity" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">총 코드 추가 라인</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{teamMetrics.totalAdditions.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">총 코드 삭제 라인</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{teamMetrics.totalDeletions.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="pr" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">평균 첫 리뷰 응답 시간</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {teamMetrics.avgTimeToFirstReview 
                            ? `${Math.round(teamMetrics.avgTimeToFirstReview)}분` 
                            : 'N/A'
                          }
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">평균 PR 병합 소요 시간</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {teamMetrics.avgTimeToMerge 
                            ? `${Math.round(teamMetrics.avgTimeToMerge)}분` 
                            : 'N/A'
                          }
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="jira" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">완료된 JIRA 이슈</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {teamMetrics.jiraIssuesCount?.toString() || 'N/A'}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">평균 이슈 해결 시간</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {teamMetrics.avgIssueResolutionTime 
                            ? `${Math.round(teamMetrics.avgIssueResolutionTime)}시간` 
                            : 'N/A'
                          }
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
} 