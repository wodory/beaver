/**
 * Repository 인터페이스 - GitHub 저장소 정보를 나타냅니다.
 */
export interface Repository {
  name: string;
  owner: string;
  description?: string;
}

/**
 * TimeRange 인터페이스 - 분석을 위한 시간 범위를 나타냅니다.
 */
export interface TimeRange {
  since: string; // 'YYYY-MM-DD' 형식
  until: string; // 'YYYY-MM-DD' 형식
}

/**
 * MetricsResult 인터페이스 - PR 관련 메트릭 계산 결과를 저장합니다.
 */
export interface MetricsResult {
  prCount: number;                // PR 개수
  totalLinesOfCode: number;       // 전체 코드 변경량 (추가 + 삭제)
  avgReviewResponseTime: number;  // 평균 리뷰 응답 시간 (밀리초)
  avgPRCycleTime: number;         // 평균 PR 사이클 타임 (밀리초)
}

/**
 * 사이클 타임 계산을 위한 PR 상태 전이
 */
export interface PRStateTransition {
  prNumber: number;
  created: Date;
  firstReview?: Date;
  merged?: Date;
  closed?: Date;
} 