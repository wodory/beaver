/**
 * JIRA 이슈 정보 인터페이스
 */
export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  type: string;
  status: string;
  created: string;
  resolutionDate: string | null;
  assignee: string | null;
  reporter: string | null;
}

/**
 * JIRA 프로젝트 정보 인터페이스
 */
export interface JiraProject {
  id: string;
  key: string;
  name: string;
  description?: string | null;
}

/**
 * JIRA 어댑터 구성 인터페이스
 */
export interface JiraAdapterConfig {
  baseUrl: string;
  username: string;
  apiToken: string;
  projectKeys: string[];
}

/**
 * JIRA 이슈 검색 옵션 인터페이스
 */
export interface JiraSearchOptions {
  startDate?: string;
  endDate?: string;
  projectKey?: string;
  assignee?: string;
  issueType?: string;
  status?: string;
}

/**
 * JIRA 이슈 통계 인터페이스
 */
export interface JiraIssueStats {
  totalIssues: number;
  completedIssues: number;
  averageResolutionTimeInDays: number;
  issuesByType: Record<string, number>;
  issuesByStatus: Record<string, number>;
  issuesByAssignee: Record<string, number>;
}

/**
 * JIRA 어댑터 인터페이스
 * 다양한 JIRA API 구현체를 지원하기 위한 인터페이스입니다.
 */
export interface IJiraAdapter {
  /**
   * 어댑터 초기화
   * @param config - JIRA 어댑터 구성
   */
  initialize(config: JiraAdapterConfig): Promise<void>;
  
  /**
   * 연결 테스트
   */
  testConnection(): Promise<boolean>;
  
  /**
   * 프로젝트 목록 조회
   */
  getProjects(): Promise<JiraProject[]>;
  
  /**
   * 완료된 이슈 목록 조회
   * @param options - 이슈 검색 옵션
   */
  getCompletedIssues(options: JiraSearchOptions): Promise<JiraIssue[]>;
  
  /**
   * 생성된 이슈 목록 조회
   * @param options - 이슈 검색 옵션
   */
  getCreatedIssues(options: JiraSearchOptions): Promise<JiraIssue[]>;
  
  /**
   * 이슈 통계 계산
   * @param issues - 통계를 계산할 이슈 목록
   */
  calculateIssueStats(issues: JiraIssue[]): Promise<JiraIssueStats>;
} 