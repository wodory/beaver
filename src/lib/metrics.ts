import { PullRequest, Review, Commit } from '../api/github';
import { MetricsResult, PRStateTransition, DeploymentEvent } from '../types/github';

/**
 * PR 개수 계산
 * 
 * @description
 * 선택한 기간 내에 생성된 PR의 총 개수를 계산합니다.
 * 
 * @formula
 * PR Count = Count( PR 생성시간 ∈ [시작일, 종료일] )
 * 
 * @details
 * 이 함수는 이미 시작일과 종료일로 필터링된 PR 배열을 받아 그 길이를 반환합니다.
 * fetchPullRequests 함수에서 이미 날짜 필터링이 적용되어 있습니다.
 * 
 * @example
 * 2023-01-01부터 2023-01-31까지 생성된 PR이 15개라면, 
 * PR 개수는 15가 됩니다.
 * 
 * @param pullRequests 계산할 PR 목록
 * @returns PR의 총 개수
 */
export function calculatePRCount(pullRequests: PullRequest[]): number {
  return pullRequests.length;
}

/**
 * 코드 변경량(LOC: Lines of Code) 계산
 * 
 * @description
 * PR에 포함된 모든 커밋에서 추가 및 삭제된 라인 수의 합을 계산합니다.
 * 
 * @formula
 * LOC = Sum( lines_added + lines_removed ) for each commit in PRs
 * 
 * @details
 * 각 커밋의 stats 속성에서 추가된 라인(additions)과 삭제된 라인(deletions)을 
 * 합산하여 총 코드 변경량을 계산합니다.
 * 이는 코드 작업량을 대략적으로 측정하는 지표로 활용됩니다.
 * 
 * @example
 * 커밋 1: 추가 100줄, 삭제 50줄
 * 커밋 2: 추가 30줄, 삭제 20줄
 * LOC = (100 + 50) + (30 + 20) = 200
 * 
 * @param commits 계산할 커밋 목록
 * @returns 총 코드 변경 라인 수
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
 * 
 * @description
 * PR에 대한 첫 번째 리뷰가 작성된 시간을 찾습니다.
 * 
 * @details
 * 리뷰 목록을 제출 시간순으로 정렬하고, 가장 빠른 시간의 리뷰를 찾습니다.
 * 리뷰가 없는 경우 undefined를 반환합니다.
 * 이 함수는 리뷰 응답 시간 계산에 활용됩니다.
 * 
 * @param reviews PR에 대한 리뷰 목록
 * @returns 첫 번째 리뷰의 시간 (Date 객체) 또는 undefined (리뷰 없음)
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
 * 
 * @description
 * PR 생성 시점부터 첫 번째 리뷰 코멘트까지 소요된 시간의 평균을 계산합니다.
 * 
 * @formula
 * Review Response Time = Average( first_review_timestamp - PR_created_timestamp )
 * 
 * @details
 * 모든 PR에 대해 생성 시간과 첫 리뷰 시간의 차이를 계산한 후, 평균을 구합니다.
 * 리뷰가 없는 PR은 계산에서 제외됩니다.
 * 이 지표는 팀의 리뷰 대응 속도를 측정하는 데 활용됩니다.
 * 
 * @example
 * PR1: 생성 2023-01-01 10:00, 첫 리뷰 2023-01-03 14:00 => 52시간 
 * PR2: 생성 2023-01-05 10:00, 첫 리뷰 2023-01-06 11:00 => 25시간
 * 평균 리뷰 응답 시간 = (52 + 25) / 2 = 38.5시간
 * 
 * @param pullRequests 계산할 PR 목록
 * @param prDetails PR별 상세 정보 (리뷰 등)
 * @returns 평균 리뷰 응답 시간 (밀리초)
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
 * 
 * @description
 * PR이 생성된 시점부터 병합 또는 종료까지의 평균 시간을 계산합니다.
 * 
 * @formula
 * Cycle Time = Average( PR_merged_timestamp - PR_created_timestamp )
 * 
 * @details
 * 각 PR의 생성 시간과 병합 또는 종료 시간의 차이를 계산한 후, 평균을 구합니다.
 * 병합된 PR은 병합 시간을 사용하고, 병합되지 않았지만 닫힌 PR은 종료 시간을 사용합니다.
 * 아직 열려있는 PR은 계산에서 제외합니다.
 * 이 지표는 코드 변경이 완료되는 데 걸리는 시간을 측정하여 개발 프로세스의 효율성을 평가합니다.
 * 
 * @example
 * PR1: 생성 2023-01-01 10:00, 병합 2023-01-06 15:00 => 5일 5시간 = 125시간
 * PR2: 생성 2023-01-05 10:00, 종료 2023-01-07 15:00 => 2일 5시간 = 53시간
 * 평균 사이클 타임 = (125 + 53) / 2 = 89시간
 * 
 * @param pullRequests 계산할 PR 목록
 * @returns 평균 PR 사이클 타임 (밀리초)
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
 * 배포 빈도 계산 (일별 평균 배포 횟수)
 * 
 * @description
 * 선택한 기간 동안 발생한 일별 평균 배포 횟수를 계산합니다.
 * 
 * @formula
 * Deployment Frequency = Count( 배포 이벤트 ) / 선택 기간(일)
 * 
 * @details
 * 선택한 기간 내의 배포 이벤트 수를 카운트하고, 이를 해당 기간의 일수로 나눕니다.
 * 이 지표는 얼마나 자주 배포가 이루어지는지를 나타내며, CI/CD 파이프라인의 효율성과 
 * 팀의 소프트웨어 제공 능력을 평가하는 데 중요합니다.
 * 
 * @example
 * 2023-01-01부터 2023-01-15까지(15일) 총 6번의 배포가 있었다면,
 * 배포 빈도 = 6 / 15 = 0.4 (일별 평균 0.4회 배포)
 * 이는 약 2.5일마다 한 번 배포한다는 의미입니다.
 * 
 * @param deployments 배포 이벤트 목록
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @returns 일별 평균 배포 횟수
 */
export function calculateDeploymentFrequency(
  deployments: DeploymentEvent[],
  startDate: Date,
  endDate: Date
): number {
  // 선택 기간 내의 배포 이벤트만 필터링
  const deploymentsInRange = deployments.filter(deployment => {
    const deploymentDate = new Date(deployment.created_at);
    return deploymentDate >= startDate && deploymentDate <= endDate;
  });

  // 배포 횟수 계산
  const deploymentCount = deploymentsInRange.length;
  
  // 선택 기간 계산 (일 수)
  const periodInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // 기간이 0이면 0 반환 (divide by zero 방지)
  if (periodInDays === 0) {
    return 0;
  }
  
  // 배포 빈도 = 배포 횟수 / 선택 기간 (일 수)
  return deploymentCount / periodInDays;
}

/**
 * 결함률 계산 (배포 후 문제가 발생한 비율)
 * 
 * @description
 * 배포 후 문제(버그, 롤백 등)가 발생한 비율을 계산합니다.
 * 
 * @formula
 * Change Failure Rate = (Count( 배포 후 문제 발생 ) / Count( 전체 배포 )) * 100
 * 
 * @details
 * 전체 배포 중 문제가 발생한 배포의 비율을 백분율로 계산합니다.
 * 이 지표는 배포된 변경사항의 품질과 안정성을 측정하며, 낮을수록 좋습니다.
 * 배포 후 문제는 배포 이벤트의 has_issues 속성으로 결정됩니다.
 * 
 * @example
 * 총 10번의 배포 중 2번에서 문제가 발생했다면,
 * 결함률 = (2 / 10) * 100 = 20%
 * 
 * @param deployments 배포 이벤트 목록
 * @returns 결함률 (백분율)
 */
export function calculateChangeFailureRate(
  deployments: DeploymentEvent[]
): number {
  if (deployments.length === 0) {
    return 0;
  }

  // 문제가 발생한 배포 수 카운트
  const failedDeployments = deployments.filter(deployment => deployment.has_issues);

  // 결함률 계산 (백분율)
  return (failedDeployments.length / deployments.length) * 100;
}

/**
 * 모든 메트릭 계산
 * 
 * @description
 * PR 및 배포 데이터를 기반으로 모든 지표를 계산하여 종합적인 메트릭 결과를 생성합니다.
 * 
 * @details
 * 이 함수는 다음 지표들을 계산합니다:
 * 1. PR 개수: 선택 기간 내 생성된 PR의 총 개수
 * 2. 코드 변경량: PR에 포함된 모든 커밋의 추가 및 삭제 라인 수 합계
 * 3. 평균 리뷰 응답 시간: PR 생성부터 첫 리뷰까지의 평균 시간
 * 4. 평균 PR 사이클 타임: PR 생성부터 병합/종료까지의 평균 시간
 * 5. 배포 빈도: 일별 평균 배포 횟수
 * 6. 결함률: 문제가 발생한 배포의 비율
 * 
 * @param pullRequests 계산할 PR 목록
 * @param prDetails PR별 상세 정보 (리뷰, 커밋 등)
 * @param deployments 배포 이벤트 목록 (선택적)
 * @returns 모든 지표가 포함된 종합 메트릭 결과
 */
export function calculateMetrics(
  pullRequests: PullRequest[],
  prDetails: Record<number, { reviews: Review[], commits: Commit[] }>,
  deployments: DeploymentEvent[] = []
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
  
  // 시간 범위 결정 (첫 번째 PR과 마지막 PR 사이)
  const startDate = new Date(Math.min(...pullRequests.map(pr => new Date(pr.created_at).getTime())));
  const endDate = new Date();

  // 배포 빈도 (옵션)
  const deploymentFrequency = calculateDeploymentFrequency(deployments, startDate, endDate);
  
  // 결함률 (옵션)
  const changeFailureRate = calculateChangeFailureRate(deployments);
  
  return {
    prCount,
    totalLinesOfCode,
    avgReviewResponseTime,
    avgPRCycleTime,
    deploymentFrequency,
    changeFailureRate
  };
} 