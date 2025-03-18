import { IJiraAdapter, JiraIssue, JiraIssueStats, JiraProject, JiraSearchOptions } from './IJiraAdapter.js';
import { JiraApiAdapter } from './JiraApiAdapter.js';
import { MockJiraAdapter } from './MockJiraAdapter.js';
import { JiraConfigManager } from './JiraConfigManager.js';
import { logger } from '../../utils/logger.js';

/**
 * JIRA 데이터 수집기 클래스
 * 실제 JIRA API 또는 Mock 데이터를 사용하여 JIRA 데이터를 수집합니다.
 */
export class JiraDataCollector {
  private adapter: IJiraAdapter;
  private configManager: JiraConfigManager;
  private initialized = false;

  /**
   * JIRA 데이터 수집기 생성자
   * @param useMock - Mock 데이터를 사용할지 여부
   */
  constructor(useMock: boolean = false) {
    // 어댑터 선택 (Mock 또는 실제 API)
    this.adapter = useMock ? new MockJiraAdapter() : new JiraApiAdapter();
    this.configManager = new JiraConfigManager();
    logger.info(`JIRA 데이터 수집기가 생성되었습니다. 모드: ${useMock ? '목업' : '실제 API'}`);
  }

  /**
   * 수집기 초기화
   * @param configPath - 설정 파일 경로 (선택 사항)
   */
  async initialize(configPath?: string): Promise<boolean> {
    try {
      // 설정 로드
      const config = configPath 
        ? this.configManager.loadFromFile(configPath) 
        : this.configManager.loadFromEnv();
      
      // 어댑터 초기화
      await this.adapter.initialize(config);
      
      // 연결 테스트
      const connected = await this.adapter.testConnection();
      if (!connected) {
        logger.error('JIRA 연결 테스트에 실패했습니다.');
        return false;
      }
      
      this.initialized = true;
      logger.info('JIRA 데이터 수집기가 초기화되었습니다.');
      return true;
    } catch (error) {
      logger.error(`JIRA 데이터 수집기 초기화 실패: ${error}`);
      return false;
    }
  }

  /**
   * JIRA 프로젝트 목록 가져오기
   */
  async getProjects(): Promise<JiraProject[]> {
    this.checkInitialized();
    return this.adapter.getProjects();
  }

  /**
   * 완료된 이슈 목록 가져오기
   * @param options - 검색 옵션
   */
  async getCompletedIssues(options: JiraSearchOptions): Promise<JiraIssue[]> {
    this.checkInitialized();
    return this.adapter.getCompletedIssues(options);
  }

  /**
   * 생성된 이슈 목록 가져오기
   * @param options - 검색 옵션
   */
  async getCreatedIssues(options: JiraSearchOptions): Promise<JiraIssue[]> {
    this.checkInitialized();
    return this.adapter.getCreatedIssues(options);
  }

  /**
   * 이슈 목록에 대한 통계 계산하기
   * @param issues - 통계를 계산할 이슈 목록
   */
  async calculateIssueStats(issues: JiraIssue[]): Promise<JiraIssueStats> {
    this.checkInitialized();
    return this.adapter.calculateIssueStats(issues);
  }

  /**
   * 특정 기간 동안의 JIRA 이슈 통계 계산
   * @param options - 검색 옵션
   */
  async getIssueStats(options: JiraSearchOptions): Promise<JiraIssueStats> {
    this.checkInitialized();
    
    // 이슈 목록 가져오기
    const issues = await this.adapter.getCreatedIssues(options);
    if (issues.length === 0) {
      logger.warn('통계를 계산할 이슈가 없습니다.');
      return {
        totalIssues: 0,
        completedIssues: 0,
        averageResolutionTimeInDays: 0,
        issuesByType: {},
        issuesByStatus: {},
        issuesByAssignee: {}
      };
    }
    
    // 통계 계산
    return this.adapter.calculateIssueStats(issues);
  }

  /**
   * 기본 프로젝트 이슈 요약 정보 가져오기
   * @param startDate - 시작 날짜
   * @param endDate - 종료 날짜
   */
  async getProjectSummary(startDate: string, endDate: string): Promise<any> {
    this.checkInitialized();
    
    // 프로젝트 목록 가져오기
    const projects = await this.adapter.getProjects();
    const result: any = {
      projects: [],
      totalIssues: 0,
      totalCompletedIssues: 0,
      issuesByType: {},
      issuesByStatus: {}
    };
    
    // 각 프로젝트에 대한 이슈 통계 수집
    for (const project of projects) {
      const options: JiraSearchOptions = {
        projectKey: project.key,
        startDate,
        endDate
      };
      
      const issues = await this.adapter.getCreatedIssues(options);
      const stats = await this.adapter.calculateIssueStats(issues);
      
      result.projects.push({
        key: project.key,
        name: project.name,
        totalIssues: stats.totalIssues,
        completedIssues: stats.completedIssues,
        averageResolutionTimeInDays: stats.averageResolutionTimeInDays
      });
      
      // 전체 요약에 합산
      result.totalIssues += stats.totalIssues;
      result.totalCompletedIssues += stats.completedIssues;
      
      // 이슈 유형별 합산
      for (const [type, count] of Object.entries(stats.issuesByType)) {
        result.issuesByType[type] = (result.issuesByType[type] || 0) + count;
      }
      
      // 이슈 상태별 합산
      for (const [status, count] of Object.entries(stats.issuesByStatus)) {
        result.issuesByStatus[status] = (result.issuesByStatus[status] || 0) + count;
      }
    }
    
    // 프로젝트 수에 따른 전체 평균 해결 시간 계산
    const projectsWithCompletedIssues = result.projects.filter((p: any) => p.completedIssues > 0);
    if (projectsWithCompletedIssues.length > 0) {
      const totalAvgTime = projectsWithCompletedIssues.reduce(
        (sum: number, p: any) => sum + p.averageResolutionTimeInDays, 0
      );
      result.averageResolutionTimeInDays = totalAvgTime / projectsWithCompletedIssues.length;
    } else {
      result.averageResolutionTimeInDays = 0;
    }
    
    logger.info(`${projects.length}개 프로젝트에 대한 요약 정보를 생성했습니다.`);
    return result;
  }
  
  /**
   * 초기화 확인
   * @private
   */
  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('JIRA 데이터 수집기가 초기화되지 않았습니다. initialize() 메서드를 먼저 호출하세요.');
    }
  }
} 