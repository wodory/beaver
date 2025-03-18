import { dbAdapter } from '../../db';
import { schemaToUse as schema } from '../../db';
import { eq, and, gte, lte, sql, desc, asc, count } from 'drizzle-orm';
import { logger } from '../../utils/logger';

/**
 * 사용자 지표
 */
export interface UserMetrics {
  // 사용자 기본 정보
  userId: number;
  login: string;
  name?: string;
  avatarUrl?: string;
  
  // 커밋 관련 지표
  commitCount: number;
  totalAdditions: number;
  totalDeletions: number;
  
  // PR 관련 지표
  prCount: number;
  prMergedCount: number;
  
  // 리뷰 관련 지표
  reviewsGivenCount: number;
  
  // 활동 지표
  activeCommitDays: number;  // 커밋한 고유 일자 수
  activePrDays: number;      // PR 생성한 고유 일자 수
  
  // 시간 범위
  startDate: Date;
  endDate: Date;
}

/**
 * 저장소 지표
 */
export interface RepositoryMetrics {
  // 저장소 기본 정보
  repositoryId: number;
  name: string;
  fullName: string;
  
  // 활동 지표
  commitCount: number;
  contributorCount: number;
  prCount: number;
  prMergedCount: number;
  reviewCount: number;
  
  // 코드 지표
  totalAdditions: number;
  totalDeletions: number;
  
  // PR 리뷰 시간
  avgTimeToFirstReview: number | null;  // 평균 첫 리뷰까지 소요 시간 (분)
  avgTimeToMerge: number | null;        // 평균 병합까지 소요 시간 (분)
  
  // 시간 범위
  startDate: Date;
  endDate: Date;
}

/**
 * 팀 지표
 */
export interface TeamMetrics {
  // 팀 기본 정보
  teamId: string;
  teamName: string;
  memberCount: number;
  
  // 활동 지표
  commitCount: number;
  prCount: number;
  prMergedCount: number;
  reviewCount: number;
  
  // 코드 지표
  totalAdditions: number;
  totalDeletions: number;
  
  // PR 리뷰 시간
  avgTimeToFirstReview: number | null;  // 평균 첫 리뷰까지 소요 시간 (분)
  avgTimeToMerge: number | null;        // 평균 병합까지 소요 시간 (분)
  
  // JIRA 지표 
  jiraIssuesCompletedCount: number;
  avgIssueResolutionTime: number | null;  // 평균 이슈 해결 시간 (시간)
  
  // 시간 범위
  startDate: Date;
  endDate: Date;
}

/**
 * 지표 서비스
 * 
 * 수집된 데이터를 기반으로 메트릭을 계산합니다.
 */
export class MetricsService {
  /**
   * 특정 사용자의 지표를 계산합니다.
   * 
   * @param userId 사용자 ID
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 사용자 지표
   */
  async getUserMetrics(userId: number, startDate: Date, endDate: Date): Promise<UserMetrics | null> {
    if (!dbAdapter.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    // 사용자 존재하는지 확인
    const users = await dbAdapter.select(
      dbAdapter.db.select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
    );
    
    if (users.length === 0) {
      logger.error(`ID가 ${userId}인 사용자가 존재하지 않습니다.`);
      return null;
    }
    
    const user = users[0];
    
    // 시간 범위 내의 커밋 통계 계산
    const commitsResult = await dbAdapter.query(
      dbAdapter.db.select({
        commitCount: count(schema.commits.id),
        totalAdditions: sql`SUM(${schema.commits.additions})`,
        totalDeletions: sql`SUM(${schema.commits.deletions})`,
        activeDays: sql`COUNT(DISTINCT DATE(${schema.commits.committedAt}))`
      })
        .from(schema.commits)
        .where(
          and(
            eq(schema.commits.authorId, userId),
            gte(schema.commits.committedAt, startDate),
            lte(schema.commits.committedAt, endDate)
          )
        )
    );
    
    // 시간 범위 내의 PR 통계 계산
    const prsResult = await dbAdapter.query(
      dbAdapter.db.select({
        prCount: count(schema.pullRequests.id),
        prMergedCount: sql`SUM(CASE WHEN ${schema.pullRequests.state} = 'merged' OR ${schema.pullRequests.state} = 'MERGED' THEN 1 ELSE 0 END)`,
        activeDays: sql`COUNT(DISTINCT DATE(${schema.pullRequests.createdAt}))`
      })
        .from(schema.pullRequests)
        .where(
          and(
            eq(schema.pullRequests.authorId, userId),
            gte(schema.pullRequests.createdAt, startDate),
            lte(schema.pullRequests.createdAt, endDate)
          )
        )
    );
    
    // 리뷰 카운트 계산
    const reviewsResult = await dbAdapter.query(
      dbAdapter.db.select({
        reviewsGivenCount: count(schema.prReviews.id)
      })
        .from(schema.prReviews)
        .where(
          and(
            eq(schema.prReviews.authorId, userId),
            gte(schema.prReviews.submittedAt, startDate),
            lte(schema.prReviews.submittedAt, endDate)
          )
        )
    );
    
    // 결과 조합
    const commitStats = commitsResult[0] || { commitCount: 0, totalAdditions: 0, totalDeletions: 0, activeDays: 0 };
    const prStats = prsResult[0] || { prCount: 0, prMergedCount: 0, activeDays: 0 };
    const reviewStats = reviewsResult[0] || { reviewsGivenCount: 0 };
    
    return {
      userId,
      login: user.login,
      name: user.name,
      avatarUrl: user.avatarUrl,
      
      commitCount: Number(commitStats.commitCount) || 0,
      totalAdditions: Number(commitStats.totalAdditions) || 0,
      totalDeletions: Number(commitStats.totalDeletions) || 0,
      
      prCount: Number(prStats.prCount) || 0,
      prMergedCount: Number(prStats.prMergedCount) || 0,
      
      reviewsGivenCount: Number(reviewStats.reviewsGivenCount) || 0,
      
      activeCommitDays: Number(commitStats.activeDays) || 0,
      activePrDays: Number(prStats.activeDays) || 0,
      
      startDate,
      endDate
    };
  }
  
  /**
   * 특정 저장소의 지표를 계산합니다.
   * 
   * @param repoId 저장소 ID
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 저장소 지표
   */
  async getRepositoryMetrics(repoId: number, startDate: Date, endDate: Date): Promise<RepositoryMetrics | null> {
    if (!dbAdapter.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    // 저장소 존재하는지 확인
    const repos = await dbAdapter.select(
      dbAdapter.db.select()
        .from(schema.repositories)
        .where(eq(schema.repositories.id, repoId))
    );
    
    if (repos.length === 0) {
      logger.error(`ID가 ${repoId}인 저장소가 존재하지 않습니다.`);
      return null;
    }
    
    const repo = repos[0];
    
    // 커밋 통계 계산
    const commitStats = await dbAdapter.query(
      dbAdapter.db.select({
        commitCount: count(schema.commits.id),
        totalAdditions: sql`SUM(${schema.commits.additions})`,
        totalDeletions: sql`SUM(${schema.commits.deletions})`,
        contributorCount: sql`COUNT(DISTINCT ${schema.commits.authorId})`
      })
        .from(schema.commits)
        .where(
          and(
            eq(schema.commits.repositoryId, repoId),
            gte(schema.commits.committedAt, startDate),
            lte(schema.commits.committedAt, endDate)
          )
        )
    );
    
    // PR 통계 계산
    const prStats = await dbAdapter.query(
      dbAdapter.db.select({
        prCount: count(schema.pullRequests.id),
        prMergedCount: sql`SUM(CASE WHEN ${schema.pullRequests.state} = 'merged' OR ${schema.pullRequests.state} = 'MERGED' THEN 1 ELSE 0 END)`
      })
        .from(schema.pullRequests)
        .where(
          and(
            eq(schema.pullRequests.repositoryId, repoId),
            gte(schema.pullRequests.createdAt, startDate),
            lte(schema.pullRequests.createdAt, endDate)
          )
        )
    );
    
    // 리뷰 통계 계산
    const reviewStats = await dbAdapter.query(
      dbAdapter.db.select({
        reviewCount: count(schema.prReviews.id)
      })
        .from(schema.prReviews)
        .innerJoin(
          schema.pullRequests,
          eq(schema.prReviews.pullRequestId, schema.pullRequests.id)
        )
        .where(
          and(
            eq(schema.pullRequests.repositoryId, repoId),
            gte(schema.prReviews.submittedAt, startDate),
            lte(schema.prReviews.submittedAt, endDate)
          )
        )
    );
    
    // PR 리뷰 시간 계산
    const reviewTimeStats = await dbAdapter.query(`
      SELECT 
        AVG(CASE WHEN first_review_time IS NOT NULL THEN 
          TIMESTAMPDIFF(MINUTE, created_at, first_review_time) 
        ELSE NULL END) as avg_time_to_review,
        AVG(CASE WHEN closed_at IS NOT NULL THEN 
          TIMESTAMPDIFF(MINUTE, created_at, closed_at) 
        ELSE NULL END) as avg_time_to_close
      FROM (
        SELECT 
          pr.id,
          pr.created_at,
          pr.closed_at,
          (SELECT MIN(rev.submitted_at) 
           FROM pr_reviews rev 
           WHERE rev.pull_request_id = pr.id) as first_review_time
        FROM pull_requests pr
        WHERE pr.repository_id = ? 
          AND pr.created_at >= ?
          AND pr.created_at <= ?
      ) pr_with_review_times
    `, [repoId, startDate, endDate]);
    
    // 결과 조합
    const commitResult = commitStats[0] || { commitCount: 0, totalAdditions: 0, totalDeletions: 0, contributorCount: 0 };
    const prResult = prStats[0] || { prCount: 0, prMergedCount: 0 };
    const reviewResult = reviewStats[0] || { reviewCount: 0 };
    const reviewTimeResult = reviewTimeStats[0] || { avg_time_to_review: null, avg_time_to_close: null };
    
    return {
      repositoryId: repoId,
      name: repo.name,
      fullName: repo.fullName,
      
      commitCount: Number(commitResult.commitCount) || 0,
      contributorCount: Number(commitResult.contributorCount) || 0,
      prCount: Number(prResult.prCount) || 0,
      prMergedCount: Number(prResult.prMergedCount) || 0,
      reviewCount: Number(reviewResult.reviewCount) || 0,
      
      totalAdditions: Number(commitResult.totalAdditions) || 0,
      totalDeletions: Number(commitResult.totalDeletions) || 0,
      
      avgTimeToFirstReview: reviewTimeResult.avg_time_to_review !== null ? Number(reviewTimeResult.avg_time_to_review) : null,
      avgTimeToMerge: reviewTimeResult.avg_time_to_close !== null ? Number(reviewTimeResult.avg_time_to_close) : null,
      
      startDate,
      endDate
    };
  }
  
  /**
   * 여러 저장소를 포함하는 팀 지표를 계산합니다.
   * 
   * @param teamId 팀 ID
   * @param teamName 팀 이름
   * @param repoIds 팀 소속 저장소 ID 목록
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 팀 지표
   */
  async getTeamMetrics(
    teamId: string,
    teamName: string,
    repoIds: number[],
    startDate: Date,
    endDate: Date
  ): Promise<TeamMetrics | null> {
    if (!dbAdapter.db || repoIds.length === 0) {
      return null;
    }
    
    // 커밋 통계 계산
    const commitStats = await dbAdapter.query(
      dbAdapter.db.select({
        commitCount: count(schema.commits.id),
        totalAdditions: sql`SUM(${schema.commits.additions})`,
        totalDeletions: sql`SUM(${schema.commits.deletions})`,
        contributorCount: sql`COUNT(DISTINCT ${schema.commits.authorId})`
      })
        .from(schema.commits)
        .where(
          and(
            sql`${schema.commits.repositoryId} IN (${repoIds.join(',')})`,
            gte(schema.commits.committedAt, startDate),
            lte(schema.commits.committedAt, endDate)
          )
        )
    );
    
    // PR 통계 계산
    const prStats = await dbAdapter.query(
      dbAdapter.db.select({
        prCount: count(schema.pullRequests.id),
        prMergedCount: sql`SUM(CASE WHEN ${schema.pullRequests.state} = 'merged' OR ${schema.pullRequests.state} = 'MERGED' THEN 1 ELSE 0 END)`
      })
        .from(schema.pullRequests)
        .where(
          and(
            sql`${schema.pullRequests.repositoryId} IN (${repoIds.join(',')})`,
            gte(schema.pullRequests.createdAt, startDate),
            lte(schema.pullRequests.createdAt, endDate)
          )
        )
    );
    
    // 리뷰 통계 계산
    const reviewStats = await dbAdapter.query(
      dbAdapter.db.select({
        reviewCount: count(schema.prReviews.id)
      })
        .from(schema.prReviews)
        .innerJoin(
          schema.pullRequests,
          eq(schema.prReviews.pullRequestId, schema.pullRequests.id)
        )
        .where(
          and(
            sql`${schema.pullRequests.repositoryId} IN (${repoIds.join(',')})`,
            gte(schema.prReviews.submittedAt, startDate),
            lte(schema.prReviews.submittedAt, endDate)
          )
        )
    );
    
    // PR 리뷰 시간 계산
    const reviewTimeStats = await dbAdapter.query(`
      SELECT 
        AVG(CASE WHEN first_review_time IS NOT NULL THEN 
          TIMESTAMPDIFF(MINUTE, created_at, first_review_time) 
        ELSE NULL END) as avg_time_to_review,
        AVG(CASE WHEN closed_at IS NOT NULL THEN 
          TIMESTAMPDIFF(MINUTE, created_at, closed_at) 
        ELSE NULL END) as avg_time_to_close
      FROM (
        SELECT 
          pr.id,
          pr.created_at,
          pr.closed_at,
          (SELECT MIN(rev.submitted_at) 
           FROM pr_reviews rev 
           WHERE rev.pull_request_id = pr.id) as first_review_time
        FROM pull_requests pr
        WHERE pr.repository_id IN (${repoIds.join(',')})
          AND pr.created_at >= ?
          AND pr.created_at <= ?
      ) pr_with_review_times
    `, [startDate, endDate]);
    
    // JIRA 이슈 통계 계산
    let jiraStats = {
      issueCount: 0,
      avgResolutionTime: null
    };
    
    try {
      const jiraResults = await dbAdapter.query(`
        SELECT 
          COUNT(*) as issue_count,
          AVG(CASE WHEN resolved_at IS NOT NULL THEN 
            TIMESTAMPDIFF(HOUR, created_at, resolved_at) 
          ELSE NULL END) as avg_resolution_time
        FROM jira_issues
        WHERE repository_id IN (${repoIds.join(',')})
          AND created_at >= ?
          AND created_at <= ?
          AND status IN ('Done', 'Closed', 'Resolved')
      `, [startDate, endDate]);
      
      if (jiraResults.length > 0) {
        jiraStats = {
          issueCount: Number(jiraResults[0].issue_count) || 0,
          avgResolutionTime: jiraResults[0].avg_resolution_time !== null ? Number(jiraResults[0].avg_resolution_time) : null
        };
      }
    } catch (error) {
      logger.error(`JIRA 통계 계산 중 오류: ${error}`);
    }
    
    // 결과 조합
    const commitResult = commitStats[0] || { commitCount: 0, totalAdditions: 0, totalDeletions: 0, contributorCount: 0 };
    const prResult = prStats[0] || { prCount: 0, prMergedCount: 0 };
    const reviewResult = reviewStats[0] || { reviewCount: 0 };
    const reviewTimeResult = reviewTimeStats[0] || { avg_time_to_review: null, avg_time_to_close: null };
    
    return {
      teamId,
      teamName,
      memberCount: Number(commitResult.contributorCount) || 0,
      
      commitCount: Number(commitResult.commitCount) || 0,
      prCount: Number(prResult.prCount) || 0,
      prMergedCount: Number(prResult.prMergedCount) || 0,
      reviewCount: Number(reviewResult.reviewCount) || 0,
      
      totalAdditions: Number(commitResult.totalAdditions) || 0,
      totalDeletions: Number(commitResult.totalDeletions) || 0,
      
      avgTimeToFirstReview: reviewTimeResult.avg_time_to_review !== null ? Number(reviewTimeResult.avg_time_to_review) : null,
      avgTimeToMerge: reviewTimeResult.avg_time_to_close !== null ? Number(reviewTimeResult.avg_time_to_close) : null,
      
      jiraIssuesCompletedCount: jiraStats.issueCount,
      avgIssueResolutionTime: jiraStats.avgResolutionTime,
      
      startDate,
      endDate
    };
  }
} 