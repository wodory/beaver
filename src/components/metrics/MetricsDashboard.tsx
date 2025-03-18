import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserActivityChart } from './UserActivityChart';
import { RepositoryActivityChart } from './RepositoryActivityChart';
import { TeamActivityChart } from './TeamActivityChart';
import { UserMetrics, RepositoryMetrics, TeamMetrics } from '../../services/metrics/MetricsService';
import { MetricCard } from './metric-card';
import { ComparisonChart } from './ComparisonChart';
import { ActivityHeatmap } from './ActivityHeatmap';
import { DeveloperTimeline } from './DeveloperTimeline';
import { TimelineChart, TimelineEvent } from './TimelineChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format, addDays, subDays, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

// 필터 상태 타입 정의
interface FilterState {
  project: string;
  startDate: Date | null;
  endDate: Date | null;
  datePreset?: string;
}

interface MetricsDashboardProps {
  filterState: FilterState;
}

// 임시 차트 데이터
const generateChartData = (days: number, min: number, max: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = addDays(today, -i);
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      value: Math.floor(Math.random() * (max - min + 1)) + min
    });
  }
  
  return data;
};

export function MetricsDashboard({ filterState }: MetricsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock 데이터 생성
  const mockUserData = useMemo<UserMetrics>(() => ({
    userId: 1,
    login: 'user1',
    name: '사용자 1',
    avatarUrl: 'https://github.com/identicons/user1.png',
    commitCount: 125,
    totalAdditions: 5240,
    totalDeletions: 2130,
    prCount: 34,
    prMergedCount: 28,
    reviewsGivenCount: 62,
    activeCommitDays: 18,
    activePrDays: 12,
    startDate: filterState.startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: filterState.endDate || new Date()
  }), [filterState.startDate, filterState.endDate]);

  const mockRepoData = useMemo<RepositoryMetrics>(() => ({
    repositoryId: 1,
    name: '프로젝트 A',
    fullName: 'org/프로젝트-A',
    commitCount: 345,
    contributorCount: 8,
    prCount: 78,
    prMergedCount: 65,
    reviewCount: 142,
    totalAdditions: 15240,
    totalDeletions: 8130,
    avgTimeToFirstReview: 240, // 4시간
    avgTimeToMerge: 1440, // 24시간
    startDate: filterState.startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: filterState.endDate || new Date()
  }), [filterState.startDate, filterState.endDate]);

  const mockTeamData = useMemo<TeamMetrics>(() => ({
    teamId: 'team1',
    teamName: '개발팀 A',
    memberCount: 6,
    commitCount: 520,
    prCount: 95,
    prMergedCount: 82,
    reviewCount: 187,
    totalAdditions: 28450,
    totalDeletions: 12340,
    avgTimeToFirstReview: 180, // 3시간
    avgTimeToMerge: 1200, // 20시간
    jiraIssuesCompletedCount: 28,
    avgIssueResolutionTime: 72, // 72시간
    startDate: filterState.startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: filterState.endDate || new Date()
  }), [filterState.startDate, filterState.endDate]);

  // 기간 텍스트 생성
  const getPeriodText = (filter: FilterState) => {
    if (!filter.startDate || !filter.endDate) {
      return "전체 기간";
    }
    
    const dayDiff = differenceInDays(filter.endDate, filter.startDate);
    
    if (dayDiff <= 0) {
      return "당일";
    } else if (dayDiff < 7) {
      return `최근 ${dayDiff}일`;
    } else if (dayDiff === 7) {
      return "최근 1주";
    } else if (dayDiff <= 31) {
      return `최근 ${Math.ceil(dayDiff / 7)}주`;
    } else if (dayDiff <= 92) {
      return `최근 ${Math.ceil(dayDiff / 30)}개월`;
    } else {
      return `${format(filter.startDate, 'yyyy.MM.dd', { locale: ko })} ~ ${format(filter.endDate, 'yyyy.MM.dd', { locale: ko })}`;
    }
  };

  // 임시 차트 데이터 생성
  const commitData = useMemo(() => generateChartData(30, 10, 100), []);
  const prData = useMemo(() => generateChartData(30, 5, 25), []);
  const reviewData = useMemo(() => generateChartData(30, 0, 50), []);

  // 타임라인 이벤트 데이터 생성 함수 
  const generateTimelineEvents = (): TimelineEvent[] => {
    const now = new Date();
    const startDate = filterState.startDate || subDays(now, 30);
    const endDate = filterState.endDate || now;
    const days = differenceInDays(endDate, startDate);
    const events: TimelineEvent[] = [];

    // 커밋 이벤트 생성
    for (let i = 0; i <= days; i += Math.floor(Math.random() * 2) + 1) {
      const date = addDays(startDate, i);
      if (date > endDate) break;

      const commitCount = Math.floor(Math.random() * 8) + 1;
      events.push({
        id: `commit-${i}`,
        date: date.toISOString(),
        type: 'commit',
        value: commitCount,
        label: `${commitCount}개의 커밋`,
        description: `파일 ${Math.floor(Math.random() * 10) + 1}개 변경됨`
      });
    }

    // PR 이벤트 생성
    for (let i = 2; i <= days - 2; i += Math.floor(Math.random() * 4) + 3) {
      const date = addDays(startDate, i);
      if (date > endDate) break;

      events.push({
        id: `pr-${i}`,
        date: date.toISOString(),
        type: 'pr',
        value: Math.floor(Math.random() * 2) + 1,
        label: `PR #${Math.floor(Math.random() * 100) + 1}`,
        description: '기능 구현 및 버그 수정'
      });
    }

    // 이슈 이벤트 생성
    for (let i = 1; i <= days - 1; i += Math.floor(Math.random() * 5) + 2) {
      const date = addDays(startDate, i);
      if (date > endDate) break;

      events.push({
        id: `issue-${i}`,
        date: date.toISOString(),
        type: 'issue',
        value: Math.floor(Math.random() * 3) + 1,
        label: `이슈 #${Math.floor(Math.random() * 100) + 1}`,
        description: `새로운 이슈: ${Math.random() > 0.5 ? '버그' : '기능 요청'}`
      });
    }

    // 리뷰 이벤트 생성
    for (let i = 3; i <= days - 3; i += Math.floor(Math.random() * 4) + 2) {
      const date = addDays(startDate, i);
      if (date > endDate) break;

      events.push({
        id: `review-${i}`,
        date: date.toISOString(),
        type: 'review',
        value: Math.floor(Math.random() * 4) + 1,
        label: `PR #${Math.floor(Math.random() * 100) + 1} 리뷰`,
        description: `${Math.random() > 0.7 ? '승인됨' : Math.random() > 0.5 ? '변경 요청됨' : '코멘트 추가됨'}`
      });
    }

    // 릴리스 이벤트 생성
    const releaseInterval = Math.max(5, Math.floor(days / 3));
    for (let i = releaseInterval; i <= days; i += releaseInterval) {
      const date = addDays(startDate, i);
      if (date > endDate) break;

      const versionParts = [1, Math.floor(i / releaseInterval), Math.floor(Math.random() * 10)];
      events.push({
        id: `release-${i}`,
        date: date.toISOString(),
        type: 'release',
        value: Math.floor(Math.random() * 2) + 3,
        label: `v${versionParts.join('.')} 릴리스`,
        description: '새로운 버전 배포'
      });
    }

    return events;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight">GitHub 메트릭스 대시보드</h1>
        <p className="text-muted-foreground">
          {getPeriodText(filterState)} 동안의 개발 활동 지표를 확인하세요.
        </p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full border-b rounded-none justify-start max-w-4xl">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="user">개발자</TabsTrigger>
          <TabsTrigger value="repository">저장소</TabsTrigger>
          <TabsTrigger value="team">팀</TabsTrigger>
          <TabsTrigger value="comparison">비교</TabsTrigger>
          <TabsTrigger value="events">이벤트</TabsTrigger>
        </TabsList>

        {/* 개요 대시보드 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="총 커밋 수"
              value="1,248"
              subValue={`${mockUserData.commitCount + mockRepoData.commitCount + mockTeamData.commitCount} 건`}
              change={{ value: 8, trend: "up" }}
              status="Elite"
              tooltip="모든 저장소의 총 커밋 수입니다."
            />
            <MetricCard
              title="총 PR 수"
              value="256"
              subValue={`${mockUserData.prCount + mockRepoData.prCount + mockTeamData.prCount} 건`}
              change={{ value: 12, trend: "up" }}
              status="High"
              tooltip="모든 저장소의 총 Pull Request 수입니다."
            />
            <MetricCard
              title="평균 PR 리드 타임"
              value="2.4일"
              subValue="업계 평균 3.6일"
              change={{ value: 15, trend: "down" }}
              status="Elite"
              tooltip="PR 생성부터 병합까지 소요된 평균 시간입니다."
            />
            <MetricCard
              title="코드 변경량"
              value="74.6K"
              subValue="추가: 56.2K, 삭제: 18.4K"
              change={{ value: 24, trend: "up" }}
              status="High"
              tooltip="총 코드 추가 및 삭제 라인 수입니다."
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">커밋 추이</CardTitle>
                <CardDescription>일일 커밋 수 변화 그래프</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={commitData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), 'MM.dd')}
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value} 건`, '커밋 수']}
                        labelFormatter={(label) => format(new Date(label), 'yyyy년 MM월 dd일')}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="var(--chart-deployment-frequency)" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">활발한 저장소 TOP 5</CardTitle>
                <CardDescription>커밋 수 기준</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {['프로젝트 A', '프로젝트 B', '프로젝트 C', '프로젝트 D', '프로젝트 E'].map((repo, i) => (
                    <div key={i} className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{repo}</span>
                        <span className="text-sm text-muted-foreground">{120 - i * 15} 커밋</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${(120 - i * 15) / 120 * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">PR 현황</CardTitle>
                <CardDescription>일일 PR 수 변화 그래프</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={prData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), 'MM.dd')}
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value} 건`, 'PR 수']}
                        labelFormatter={(label) => format(new Date(label), 'yyyy년 MM월 dd일')}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="var(--chart-change-failure-rate)" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">활발한 개발자 TOP 5</CardTitle>
                <CardDescription>커밋 수 기준</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {['개발자 A', '개발자 B', '개발자 C', '개발자 D', '개발자 E'].map((dev, i) => (
                    <div key={i} className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{dev}</span>
                        <span className="text-sm text-muted-foreground">{85 - i * 10} 커밋</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${(85 - i * 10) / 85 * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 개발자 지표 뷰 */}
        <TabsContent value="user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>개발자 활동 지표</CardTitle>
              <CardDescription>
                개발자별 커밋, PR, 코드 변경량 등의 활동 지표를 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserActivityChart userData={mockUserData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 저장소 지표 뷰 */}
        <TabsContent value="repository" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>저장소 활동 지표</CardTitle>
              <CardDescription>
                저장소별 커밋, PR, 리뷰 등의 활동 지표를 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RepositoryActivityChart repoData={mockRepoData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 팀 지표 뷰 */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>팀 활동 지표</CardTitle>
              <CardDescription>
                팀별 생산성 및 협업 지표를 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamActivityChart teamData={mockTeamData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 비교 분석 뷰 */}
        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>팀 간 커밋 비교</CardTitle>
                <CardDescription>
                  팀별 커밋 수 비교 분석
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  팀 간 커밋 비교 차트가 들어갈 자리입니다.
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>프로젝트 간 PR 비교</CardTitle>
                <CardDescription>
                  프로젝트별 PR 수 비교 분석
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  프로젝트 간 PR 비교 차트가 들어갈 자리입니다.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 이벤트 탭 컨텐츠 추가 */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-4">
              <TimelineChart
                title="개발 활동 타임라인"
                description="최근 개발 활동을 시간 순으로 시각화합니다."
                events={generateTimelineEvents()}
                height={400}
                referenceDate={
                  filterState.startDate && filterState.endDate
                    ? new Date(
                        filterState.startDate.getTime() +
                          (filterState.endDate.getTime() - filterState.startDate.getTime()) / 2
                      ).toISOString()
                    : undefined
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 