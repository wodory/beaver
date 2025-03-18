import { IJiraAdapter, JiraAdapterConfig, JiraIssue, JiraProject, JiraSearchOptions, JiraIssueStats } from './IJiraAdapter.js';
import { logger } from '../../utils/logger.js';

/**
 * Mock JIRA 어댑터
 * 
 * 개발 및 테스트를 위한 가상의 JIRA 데이터를 제공하는 어댑터
 */
export class MockJiraAdapter implements IJiraAdapter {
  private config: JiraAdapterConfig | null = null;
  private initialized = false;
  private mockProjects: JiraProject[] = [];
  private mockIssues: JiraIssue[] = [];
  
  /**
   * Mock 데이터를 초기화합니다.
   * @param config JIRA 설정
   */
  async initialize(config: JiraAdapterConfig): Promise<void> {
    this.config = config;
    this.initialized = true;
    this.mockProjects = this.initializeMockProjects();
    this.mockIssues = this.initializeMockIssues();
    logger.info(`Mock JIRA 어댑터가 초기화되었습니다. ${this.mockProjects.length}개의 프로젝트와 ${this.mockIssues.length}개의 이슈가 생성되었습니다.`);
  }
  
  /**
   * Mock 프로젝트 데이터를 생성합니다.
   */
  private initializeMockProjects(): JiraProject[] {
    const projects: JiraProject[] = [];
    const projectKeys = this.config?.projectKeys || ['MOCK', 'TEST'];
    
    projectKeys.forEach((key, index) => {
      projects.push({
        id: `${index + 1}`,
        key: key,
        name: `${key} 프로젝트`,
        description: `${key} 프로젝트에 대한 설명입니다.`
      });
    });
    
    return projects;
  }
  
  /**
   * Mock 이슈 데이터를 생성합니다.
   */
  private initializeMockIssues(): JiraIssue[] {
    const issues: JiraIssue[] = [];
    const issueTypes = ['Bug', 'Task', 'Story', 'Epic'];
    const statuses = ['To Do', 'In Progress', 'In Review', 'Done'];
    const assignees = ['user1', 'user2', 'user3', null];
    
    // 각 프로젝트에 대해 10개의 이슈 생성
    this.mockProjects.forEach(project => {
      for (let i = 1; i <= 10; i++) {
        const created = new Date();
        created.setDate(created.getDate() - Math.floor(Math.random() * 30)); // 최근 30일 이내
        
        const resolutionDate = Math.random() > 0.3 ? new Date() : null;
        if (resolutionDate) {
          resolutionDate.setDate(created.getDate() + Math.floor(Math.random() * 10)); // 생성 후 10일 이내
        }
        
        issues.push({
          id: `${project.key}-${i}`,
          key: `${project.key}-${i}`,
          summary: `${project.key} 테스트 이슈 ${i}`,
          type: issueTypes[Math.floor(Math.random() * issueTypes.length)],
          status: resolutionDate ? 'Done' : statuses[Math.floor(Math.random() * (statuses.length - 1))],
          created: created.toISOString(),
          resolutionDate: resolutionDate ? resolutionDate.toISOString() : null,
          assignee: assignees[Math.floor(Math.random() * assignees.length)],
          reporter: `reporter${Math.floor(Math.random() * 3) + 1}`
        });
      }
    });
    
    return issues;
  }
  
  /**
   * 연결 테스트 (항상 성공)
   */
  async testConnection(): Promise<boolean> {
    if (!this.initialized) {
      logger.error('Mock JIRA 어댑터가 초기화되지 않았습니다.');
      return false;
    }
    logger.info('Mock JIRA 어댑터 연결 테스트 성공');
    return true;
  }
  
  /**
   * Mock 프로젝트 목록 반환
   */
  async getProjects(): Promise<JiraProject[]> {
    if (!this.initialized) {
      logger.error('Mock JIRA 어댑터가 초기화되지 않았습니다.');
      return [];
    }
    logger.info(`${this.mockProjects.length}개의 JIRA 프로젝트를 가져왔습니다.`);
    return [...this.mockProjects];
  }
  
  /**
   * 완료된 이슈 목록을 반환
   */
  async getCompletedIssues(options: JiraSearchOptions): Promise<JiraIssue[]> {
    if (!this.initialized) {
      logger.error('Mock JIRA 어댑터가 초기화되지 않았습니다.');
      return [];
    }
    
    // 필터링 기능 구현
    let filtered = this.mockIssues.filter(issue => issue.status === 'Done' && issue.resolutionDate !== null);
    
    // 날짜 필터링
    if (options.startDate) {
      const startDate = new Date(options.startDate);
      filtered = filtered.filter(issue => {
        if (!issue.resolutionDate) return false;
        return new Date(issue.resolutionDate) >= startDate;
      });
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate);
      filtered = filtered.filter(issue => {
        if (!issue.resolutionDate) return false;
        return new Date(issue.resolutionDate) <= endDate;
      });
    }
    
    // 프로젝트 키로 필터링
    if (options.projectKey) {
      filtered = filtered.filter(issue => issue.key.startsWith(options.projectKey));
    }
    
    // 담당자로 필터링
    if (options.assignee) {
      filtered = filtered.filter(issue => issue.assignee === options.assignee);
    }
    
    // 이슈 타입으로 필터링
    if (options.issueType) {
      filtered = filtered.filter(issue => issue.type === options.issueType);
    }
    
    logger.info(`${filtered.length}개의 완료된 이슈를 가져왔습니다.`);
    return filtered;
  }
  
  /**
   * 생성된 이슈 목록을 반환
   */
  async getCreatedIssues(options: JiraSearchOptions): Promise<JiraIssue[]> {
    if (!this.initialized) {
      logger.error('Mock JIRA 어댑터가 초기화되지 않았습니다.');
      return [];
    }
    
    // 모든 이슈에서 시작
    let filtered = [...this.mockIssues];
    
    // 날짜 필터링
    if (options.startDate) {
      const startDate = new Date(options.startDate);
      filtered = filtered.filter(issue => new Date(issue.created) >= startDate);
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate);
      filtered = filtered.filter(issue => new Date(issue.created) <= endDate);
    }
    
    // 프로젝트 키로 필터링
    if (options.projectKey) {
      filtered = filtered.filter(issue => issue.key.startsWith(options.projectKey));
    }
    
    // 담당자로 필터링
    if (options.assignee) {
      filtered = filtered.filter(issue => issue.assignee === options.assignee);
    }
    
    // 이슈 타입으로 필터링
    if (options.issueType) {
      filtered = filtered.filter(issue => issue.type === options.issueType);
    }
    
    // 상태로 필터링
    if (options.status) {
      filtered = filtered.filter(issue => issue.status === options.status);
    }
    
    logger.info(`${filtered.length}개의 이슈를 가져왔습니다.`);
    return filtered;
  }
  
  /**
   * 이슈 통계를 계산합니다.
   * @param issues - 분석할 이슈 목록
   */
  async calculateIssueStats(issues: JiraIssue[]): Promise<JiraIssueStats> {
    if (!this.initialized) {
      logger.error('Mock JIRA 어댑터가 초기화되지 않았습니다.');
      return {
        totalIssues: 0,
        completedIssues: 0,
        averageResolutionTimeInDays: 0,
        issuesByType: {},
        issuesByStatus: {},
        issuesByAssignee: {}
      };
    }
    
    // 완료된 이슈만 필터링
    const completedIssues = issues.filter(issue => 
      issue.status === 'Done' && issue.resolutionDate !== null && issue.created !== null
    );
    
    // 평균 해결 시간 계산 (일 단위)
    let totalResolutionTime = 0;
    completedIssues.forEach(issue => {
      if (issue.resolutionDate && issue.created) {
        const created = new Date(issue.created);
        const resolved = new Date(issue.resolutionDate);
        const timeDiffInDays = (resolved.getTime() - created.getTime()) / (1000 * 3600 * 24);
        totalResolutionTime += timeDiffInDays;
      }
    });
    
    const avgResolutionTime = completedIssues.length > 0 
      ? totalResolutionTime / completedIssues.length 
      : 0;
    
    // 유형별 이슈 수 계산
    const issuesByType: Record<string, number> = {};
    issues.forEach(issue => {
      if (issue.type) {
        issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
      }
    });
    
    // 상태별 이슈 수 계산
    const issuesByStatus: Record<string, number> = {};
    issues.forEach(issue => {
      issuesByStatus[issue.status] = (issuesByStatus[issue.status] || 0) + 1;
    });
    
    // 담당자별 이슈 수 계산
    const issuesByAssignee: Record<string, number> = {};
    issues.forEach(issue => {
      const assignee = issue.assignee || 'Unassigned';
      issuesByAssignee[assignee] = (issuesByAssignee[assignee] || 0) + 1;
    });
    
    logger.info('이슈 통계 계산 완료');
    
    return {
      totalIssues: issues.length,
      completedIssues: completedIssues.length,
      averageResolutionTimeInDays: avgResolutionTime,
      issuesByType,
      issuesByStatus,
      issuesByAssignee
    };
  }
} 