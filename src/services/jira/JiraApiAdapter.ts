import { IJiraAdapter, JiraAdapterConfig, JiraIssue, JiraProject, JiraSearchOptions, JiraIssueStats } from './IJiraAdapter.js';
import { logger } from '../../utils/logger.js';
import axios from 'axios';

/**
 * JIRA API 어댑터
 * 
 * 실제 JIRA API와 통신하여 데이터를 가져오는 어댑터
 */
export class JiraApiAdapter implements IJiraAdapter {
  private initialized = false;
  private config: JiraAdapterConfig | null = null;
  private axiosInstance: any = null;
  
  /**
   * JIRA API 클라이언트를 초기화합니다.
   * @param config JIRA 설정
   */
  async initialize(config: JiraAdapterConfig): Promise<void> {
    this.config = config;
    
    // 인증 정보 생성 (Base64 인코딩된 username:apiToken)
    const auth = Buffer.from(`${config.username}:${config.apiToken}`).toString('base64');
    
    // Axios 클라이언트 생성
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000 // 10초 타임아웃
    });
    
    this.initialized = true;
    logger.info(`JIRA API 어댑터가 초기화되었습니다. 기본 URL: ${config.baseUrl}`);
  }
  
  /**
   * JIRA 연결을 테스트합니다.
   */
  async testConnection(): Promise<boolean> {
    if (!this.initialized || !this.axiosInstance) {
      logger.error('JiraApiAdapter가 초기화되지 않았습니다.');
      return false;
    }
    
    try {
      const response = await this.axiosInstance.get('/rest/api/2/myself');
      logger.info(`JIRA API 연결 테스트 성공: ${response.data.displayName}`);
      return true;
    } catch (error) {
      logger.error(`JIRA API 연결 테스트 실패: ${error}`);
      return false;
    }
  }
  
  /**
   * 프로젝트 목록을 가져옵니다.
   */
  async getProjects(): Promise<JiraProject[]> {
    if (!this.initialized || !this.axiosInstance) {
      logger.error('JiraApiAdapter가 초기화되지 않았습니다.');
      return [];
    }
    
    try {
      const response = await this.axiosInstance.get('/rest/api/2/project');
      
      const projects: JiraProject[] = response.data.map((project: any) => ({
        id: project.id,
        key: project.key,
        name: project.name,
        description: project.description || null
      }));
      
      // 특정 프로젝트 키로 필터링
      const filteredProjects = this.config?.projectKeys?.length
        ? projects.filter(project => this.config?.projectKeys?.includes(project.key))
        : projects;
      
      logger.info(`${filteredProjects.length}개의 JIRA 프로젝트를 가져왔습니다.`);
      return filteredProjects;
    } catch (error) {
      logger.error(`JIRA 프로젝트 조회 실패: ${error}`);
      return [];
    }
  }
  
  /**
   * JQL 쿼리를 만듭니다.
   */
  private buildJqlQuery(options: JiraSearchOptions, isCompleted: boolean = false): string {
    const jqlParts: string[] = [];
    
    // 프로젝트 키로 필터링
    if (options.projectKey) {
      jqlParts.push(`project = ${options.projectKey}`);
    } else if (this.config?.projectKeys?.length) {
      jqlParts.push(`project IN (${this.config.projectKeys.join(',')})`);
    }
    
    // 완료된 이슈인 경우
    if (isCompleted) {
      jqlParts.push('status = Done');
      
      // 완료 날짜 범위
      if (options.startDate) {
        jqlParts.push(`resolutiondate >= "${options.startDate}"`);
      }
      
      if (options.endDate) {
        jqlParts.push(`resolutiondate <= "${options.endDate}"`);
      }
    } else {
      // 생성 날짜 범위
      if (options.startDate) {
        jqlParts.push(`created >= "${options.startDate}"`);
      }
      
      if (options.endDate) {
        jqlParts.push(`created <= "${options.endDate}"`);
      }
      
      // 상태 필터링
      if (options.status) {
        jqlParts.push(`status = "${options.status}"`);
      }
    }
    
    // 담당자 필터링
    if (options.assignee) {
      jqlParts.push(`assignee = "${options.assignee}"`);
    }
    
    // 이슈 유형 필터링
    if (options.issueType) {
      jqlParts.push(`issuetype = "${options.issueType}"`);
    }
    
    return jqlParts.join(' AND ');
  }
  
  /**
   * 특정 기간 동안 완료된 이슈 목록을 가져옵니다.
   */
  async getCompletedIssues(options: JiraSearchOptions): Promise<JiraIssue[]> {
    if (!this.initialized || !this.axiosInstance) {
      logger.error('JiraApiAdapter가 초기화되지 않았습니다.');
      return [];
    }
    
    try {
      const jql = this.buildJqlQuery(options, true);
      
      const response = await this.axiosInstance.post('/rest/api/2/search', {
        jql,
        maxResults: 100,
        fields: [
          'key',
          'summary',
          'issuetype',
          'status',
          'created',
          'resolutiondate',
          'assignee',
          'reporter'
        ]
      });
      
      const issues: JiraIssue[] = response.data.issues.map((issue: any) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        type: issue.fields.issuetype.name,
        status: issue.fields.status.name,
        created: issue.fields.created,
        resolutionDate: issue.fields.resolutiondate,
        assignee: issue.fields.assignee ? issue.fields.assignee.name : null,
        reporter: issue.fields.reporter ? issue.fields.reporter.name : null
      }));
      
      logger.info(`${issues.length}개의 완료된 이슈를 가져왔습니다.`);
      return issues;
    } catch (error) {
      logger.error(`완료된 이슈 조회 실패: ${error}`);
      return [];
    }
  }
  
  /**
   * 특정 기간 동안 생성된 이슈 목록을 가져옵니다.
   */
  async getCreatedIssues(options: JiraSearchOptions): Promise<JiraIssue[]> {
    if (!this.initialized || !this.axiosInstance) {
      logger.error('JiraApiAdapter가 초기화되지 않았습니다.');
      return [];
    }
    
    try {
      const jql = this.buildJqlQuery(options);
      
      const response = await this.axiosInstance.post('/rest/api/2/search', {
        jql,
        maxResults: 100,
        fields: [
          'key',
          'summary',
          'issuetype',
          'status',
          'created',
          'resolutiondate',
          'assignee',
          'reporter'
        ]
      });
      
      const issues: JiraIssue[] = response.data.issues.map((issue: any) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        type: issue.fields.issuetype.name,
        status: issue.fields.status.name,
        created: issue.fields.created,
        resolutionDate: issue.fields.resolutiondate,
        assignee: issue.fields.assignee ? issue.fields.assignee.name : null,
        reporter: issue.fields.reporter ? issue.fields.reporter.name : null
      }));
      
      logger.info(`${issues.length}개의 이슈를 가져왔습니다.`);
      return issues;
    } catch (error) {
      logger.error(`이슈 조회 실패: ${error}`);
      return [];
    }
  }
  
  /**
   * 특정 기간 동안의 이슈 통계를 계산합니다.
   */
  async calculateIssueStats(issues: JiraIssue[]): Promise<JiraIssueStats> {
    if (!this.initialized || !this.axiosInstance) {
      logger.error('JiraApiAdapter가 초기화되지 않았습니다.');
      return {
        totalIssues: 0,
        completedIssues: 0,
        averageResolutionTimeInDays: 0,
        issuesByType: {},
        issuesByStatus: {},
        issuesByAssignee: {}
      };
    }
    
    try {
      // 완료된 이슈만 필터링
      const completedIssues = issues.filter(issue => 
        issue.status === 'Done' && issue.resolutionDate !== null && issue.created !== null
      );
      
      // 평균 해결 시간 계산 (일 단위)
      let totalResolutionTime = 0;
      let validIssueCount = 0;
      
      completedIssues.forEach(issue => {
        if (issue.resolutionDate && issue.created) {
          const created = new Date(issue.created);
          const resolved = new Date(issue.resolutionDate);
          const timeDiffInDays = (resolved.getTime() - created.getTime()) / (1000 * 3600 * 24);
          totalResolutionTime += timeDiffInDays;
          validIssueCount++;
        }
      });
      
      const avgResolutionTime = validIssueCount > 0 
        ? totalResolutionTime / validIssueCount 
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
    } catch (error) {
      logger.error(`이슈 통계 계산 실패: ${error}`);
      return {
        totalIssues: 0,
        completedIssues: 0,
        averageResolutionTimeInDays: 0,
        issuesByType: {},
        issuesByStatus: {},
        issuesByAssignee: {}
      };
    }
  }
} 