import React, { useState } from 'react';
import { format, formatDistanceToNow, parseISO, compareDesc } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  GitCommit, 
  GitPullRequest, 
  GitPullRequestClosed, 
  MessageSquare, 
  Check, 
  X, 
  MoreHorizontal 
} from 'lucide-react';
import { UserMetrics } from '../../services/metrics/MetricsService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// 활동 유형 정의
type ActivityType = 'commit' | 'pr_open' | 'pr_close' | 'pr_merge' | 'review' | 'comment';

// 활동 항목 타입 정의
interface ActivityItem {
  id: string;
  type: ActivityType;
  date: string;
  title: string;
  description?: string;
  repository?: string;
  status?: 'approved' | 'changes_requested' | 'commented' | 'opened' | 'merged' | 'closed';
}

interface DeveloperTimelineProps {
  userData: UserMetrics;
  items?: ActivityItem[];
}

export function DeveloperTimeline({ userData, items = [] }: DeveloperTimelineProps) {
  const [activityFilter, setActivityFilter] = useState<'all' | ActivityType>('all');
  
  // 모의 데이터 생성
  const mockItems: ActivityItem[] = [
    {
      id: '1',
      type: 'commit',
      date: '2023-03-10T10:30:00Z',
      title: 'Fix navigation bar issues on mobile devices',
      repository: 'frontend-app'
    },
    {
      id: '2',
      type: 'pr_open',
      date: '2023-03-10T11:15:00Z',
      title: 'Feature: Add dark mode support',
      description: 'Implements system preference based dark mode with toggle in settings',
      repository: 'frontend-app',
      status: 'opened'
    },
    {
      id: '3',
      type: 'review',
      date: '2023-03-09T15:45:00Z',
      title: 'Review PR #123: Refactor authentication system',
      description: 'Approved changes with minor suggestions',
      repository: 'auth-service',
      status: 'approved'
    },
    {
      id: '4',
      type: 'pr_merge',
      date: '2023-03-08T17:20:00Z',
      title: 'Merge PR #112: Update dependencies',
      repository: 'backend-api',
      status: 'merged'
    },
    {
      id: '5',
      type: 'comment',
      date: '2023-03-07T09:10:00Z',
      title: 'Comment on PR #98',
      description: 'Suggested alternative approach to handling error states',
      repository: 'data-service'
    },
    {
      id: '6',
      type: 'commit',
      date: '2023-03-06T14:30:00Z',
      title: 'Optimize database queries for user dashboard',
      repository: 'backend-api'
    },
    {
      id: '7',
      type: 'pr_close',
      date: '2023-03-05T11:25:00Z',
      title: 'Close PR #87: Legacy feature removal',
      description: 'Closed without merging due to changing requirements',
      repository: 'frontend-app',
      status: 'closed'
    }
  ];
  
  // 표시할 활동 필터링
  const displayItems = activityFilter === 'all'
    ? [...mockItems, ...(items || [])]
    : [...mockItems, ...(items || [])].filter(item => item.type === activityFilter);
  
  // 날짜순 정렬
  const sortedItems = displayItems.sort((a, b) => 
    compareDesc(parseISO(a.date), parseISO(b.date))
  );
  
  // 활동 아이콘 및 색상 정의
  const getActivityIcon = (type: ActivityType, status?: string) => {
    switch (type) {
      case 'commit':
        return <GitCommit className="h-4 w-4 text-blue-500" />;
      case 'pr_open':
        return <GitPullRequest className="h-4 w-4 text-green-500" />;
      case 'pr_close':
        return <GitPullRequestClosed className="h-4 w-4 text-red-500" />;
      case 'pr_merge':
        return <GitPullRequest className="h-4 w-4 text-purple-500" />;
      case 'review':
        return status === 'approved' 
          ? <Check className="h-4 w-4 text-green-500" />
          : status === 'changes_requested'
            ? <X className="h-4 w-4 text-orange-500" />
            : <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
      default:
        return <MoreHorizontal className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getActivityLabel = (type: ActivityType) => {
    switch (type) {
      case 'commit': return '커밋';
      case 'pr_open': return 'PR 생성';
      case 'pr_close': return 'PR 종료';
      case 'pr_merge': return 'PR 병합';
      case 'review': return '리뷰';
      case 'comment': return '댓글';
      default: return '활동';
    }
  };
  
  const getBadgeVariant = (type: ActivityType, status?: string) => {
    if (type === 'review') {
      switch (status) {
        case 'approved': return 'success';
        case 'changes_requested': return 'destructive';
        default: return 'outline';
      }
    }
    
    switch (type) {
      case 'commit': return 'default';
      case 'pr_open': return 'secondary';
      case 'pr_close': return 'destructive';
      case 'pr_merge': return 'success';
      case 'comment': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div className="flex gap-4 items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userData.avatarUrl} alt={userData.name || userData.login} />
            <AvatarFallback>{userData.name?.[0] || userData.login[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{userData.name || userData.login}의 활동 타임라인</h3>
            <p className="text-sm text-muted-foreground">
              최근 활동 기록: 커밋 {userData.commitCount}건, PR {userData.prCount}건
            </p>
          </div>
        </div>
        
        <Select value={activityFilter} onValueChange={(value: any) => setActivityFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="모든 활동" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 활동</SelectItem>
            <SelectItem value="commit">커밋만</SelectItem>
            <SelectItem value="pr_open">PR 생성</SelectItem>
            <SelectItem value="pr_merge">PR 병합</SelectItem>
            <SelectItem value="review">리뷰</SelectItem>
            <SelectItem value="comment">댓글</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-4">
        {sortedItems.length > 0 ? (
          sortedItems.map((item) => (
            <div key={item.id} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className="p-2 rounded-full border border-border bg-background">
                  {getActivityIcon(item.type, item.status)}
                </div>
                <div className="w-0.5 bg-border flex-grow mt-2"></div>
              </div>
              
              <div className="flex-1 pb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <Badge variant={getBadgeVariant(item.type, item.status) as any}>
                      {getActivityLabel(item.type)}
                    </Badge>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {format(parseISO(item.date), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                    {' '}
                    ({formatDistanceToNow(parseISO(item.date), { locale: ko, addSuffix: true })})
                  </time>
                </div>
                
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                )}
                
                {item.repository && (
                  <div className="text-xs text-muted-foreground mt-2">
                    저장소: <span className="font-medium">{item.repository}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            표시할 활동이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
} 