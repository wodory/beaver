import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 밀리초를 읽기 쉬운 시간 포맷으로 변환합니다.
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}일 ${hours % 24}시간`;
  } else if (hours > 0) {
    return `${hours}시간 ${minutes % 60}분`;
  } else if (minutes > 0) {
    return `${minutes}분 ${seconds % 60}초`;
  } else {
    return `${seconds}초`;
  }
}

/**
 * 숫자를 한국어 표기 형식으로 포맷팅합니다.
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

/**
 * 배포 빈도를 사람이 읽기 쉬운 형식으로 변환합니다.
 */
export function formatDeploymentFrequency(frequency: number): string {
  if (frequency >= 1) {
    return `하루 평균 ${frequency.toFixed(1)}회`;
  } else if (frequency >= 1/7) {
    return `주 평균 ${(frequency * 7).toFixed(1)}회`;
  } else if (frequency >= 1/30) {
    return `월 평균 ${(frequency * 30).toFixed(1)}회`;
  } else {
    return `연 평균 ${(frequency * 365).toFixed(1)}회`;
  }
}

/**
 * 결함률을 포맷팅합니다.
 */
export function formatChangeFailureRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

/**
 * 메트릭 결과를 포맷팅합니다.
 * @param value 포맷팅할 값
 * @param isPercentage 백분율 값인지 여부
 * @returns 포맷팅된 문자열 또는 '-' (값이 없는 경우)
 */
export function formatMetricResult(value: number | null, isPercentage: boolean = false): string {
  if (value === null) return '-';
  
  if (isPercentage) {
    // 백분율 포맷팅 (소수점 1자리까지)
    return `${(value * 100).toFixed(1)}%`;
  } else if (value >= 1000) {
    // 1000 이상인 경우 천 단위 구분자 사용
    return formatNumber(Number(value.toFixed(1)));
  } else if (value < 0.01) {
    // 매우 작은 값은 지수 표기법 대신 0으로 표시
    return '0';
  } else {
    // 일반적인 경우 소수점 2자리까지
    return value.toFixed(2);
  }
}
