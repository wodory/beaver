import { PullRequest, Review, Commit } from '../api/github';
import { MetricsResult, PRStateTransition } from '../types/github';

/**
 * PR 개수 계산
 */
export function calculatePRCount(pullRequests: PullRequest[]): number {
  return pullRequests.length;
}

/**
 * 코드 변경량(LOC) 계산
 */
export function calculateLinesOfCode(commits: Commit[]): number {
  return commits.reduce((total, commit) => {
    if (commit.stats) {
      return total + commit.stats.additions + commit.stats.deletions;
    }
    return total;
  }, 0);
}

/**
 * PR에 대한 첫 리뷰 시간 찾기 
 */
export function findFirstReviewTime(reviews: Review[]): Date | undefined {
  if (reviews.length === 0) {
    return undefined;
  }
  
  // 제출 시간순으로 정렬
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
  );
  
  return new Date(sortedReviews[0].submitted_at);
}

/**
 * 평균 리뷰 응답 시간 계산 (밀리초)
 * PR 생성 시점부터 첫 번째 리뷰까지의 시간
 */
export function calculateAverageReviewResponseTime(
  pullRequests: PullRequest[], 
  prDetails: Record<number, { reviews: Review[] }>
): number {
  const responseTimes: number[] = [];
  
  pullRequests.forEach(pr => {
    const details = prDetails[pr.number];
    if (!details || !details.reviews || details.reviews.length === 0) {
      return;
    }
    
    const prCreatedTime = new Date(pr.created_at).getTime();
    const firstReviewTime = findFirstReviewTime(details.reviews);
    
    if (firstReviewTime) {
      const responseTime = firstReviewTime.getTime() - prCreatedTime;
      responseTimes.push(responseTime);
    }
  });
  
  // 평균 계산
  if (responseTimes.length === 0) {
    return 0;
  }
  
  return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
}

/**
 * 평균 PR 사이클 타임 계산 (밀리초)
 * PR 생성 시점부터 병합 또는 종료까지의 시간
 */
export function calculateAveragePRCycleTime(pullRequests: PullRequest[]): number {
  const cycleTimes: number[] = [];
  
  pullRequests.forEach(pr => {
    const prCreatedTime = new Date(pr.created_at).getTime();
    
    // 병합된 PR의 경우 병합 시간, 그렇지 않으면 종료 시간 사용
    const endTimeStr = pr.merged_at || pr.closed_at;
    
    // 아직 열려있는 PR은 건너뜀
    if (!endTimeStr) {
      return;
    }
    
    const endTime = new Date(endTimeStr).getTime();
    const cycleTime = endTime - prCreatedTime;
    cycleTimes.push(cycleTime);
  });
  
  // 평균 계산
  if (cycleTimes.length === 0) {
    return 0;
  }
  
  return cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length;
}

/**
 * 모든 메트릭 계산
 */
export function calculateMetrics(
  pullRequests: PullRequest[],
  prDetails: Record<number, { reviews: Review[], commits: Commit[] }>
): MetricsResult {
  // PR 개수
  const prCount = calculatePRCount(pullRequests);
  
  // 코드 변경량
  let totalLinesOfCode = 0;
  Object.values(prDetails).forEach(detail => {
    totalLinesOfCode += calculateLinesOfCode(detail.commits);
  });
  
  // 리뷰 응답 시간
  const avgReviewResponseTime = calculateAverageReviewResponseTime(pullRequests, prDetails);
  
  // PR 사이클 타임
  const avgPRCycleTime = calculateAveragePRCycleTime(pullRequests);
  
  return {
    prCount,
    totalLinesOfCode,
    avgReviewResponseTime,
    avgPRCycleTime
  };
} 