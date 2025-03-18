/**
 * 개발자 지표 인터페이스
 */
export interface DeveloperMetrics {
  userId: string;
  login: string;
  name?: string;
  
  // 활동 지표
  commitCount: number;
  prCount: number;
  mergedPrCount: number;
  reviewCount: number;
  
  // 코드 지표
  totalAdditions: number;
  totalDeletions: number;
  
  // 시간 지표
  avgTimeToFirstReview?: number; // 분 단위
  avgPrLifespan?: number; // 분 단위
  
  // 기간 정보
  startDate: string;
  endDate: string;
}

/**
 * 프로젝트 지표 인터페이스 
 */
export interface ProjectMetrics {
  repoId: string;
  name: string;
  fullName: string;
  
  // 활동 지표
  commitCount: number;
  prCount: number;
  mergedPrCount: number;
  reviewCount: number;
  authorCount: number;
  
  // 코드 지표
  totalAdditions: number;
  totalDeletions: number;
  
  // PR 지표
  avgTimeToFirstReview?: number; // 분 단위
  avgPrLifespan?: number; // 분 단위
  prMergeRate: number; // 0-1 사이 값
  
  // DORA 지표
  deploymentFrequency?: number; // 일 단위 배포 횟수
  leadTimeForChanges?: number; // 분 단위
  changeFailureRate?: number; // 0-1 사이 값
  meanTimeToRestore?: number; // 분 단위
  
  // 기간 정보
  startDate: string;
  endDate: string;
}

/**
 * 팀 지표 인터페이스
 */
export interface TeamMetrics {
  teamId: string;
  teamName: string;
  memberCount: number;
  
  // 활동 지표
  commitCount: number;
  prCount: number;
  mergedPrCount: number;
  reviewCount: number;
  
  // 코드 지표
  totalAdditions: number;
  totalDeletions: number;
  
  // PR 지표
  avgTimeToFirstReview?: number; // 분 단위
  avgTimeToMerge?: number; // 분 단위
  prMergeRate: number; // 0-1 사이 값
  
  // JIRA 지표
  jiraIssuesCount?: number;
  avgIssueResolutionTime?: number; // 시간 단위
  
  // 기간 정보
  startDate: string;
  endDate: string;
  
  // 팀 내 저장소 정보
  repositories?: string[];
}

/**
 * 시계열 데이터 포인트
 */
export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  category?: string;
} 