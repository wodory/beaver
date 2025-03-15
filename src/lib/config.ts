import { Repository, TimeRange } from '../types/github';
import configData from '../config.json';

/**
 * 설정 파일 인터페이스
 */
export interface Config {
  repositories: Repository[];
  defaultTimeRange: TimeRange;
  refreshInterval: number;
}

/**
 * 설정 파일에서 저장소 목록 가져오기
 */
export function getRepositories(): Repository[] {
  return configData.repositories;
}

/**
 * 설정 파일에서 기본 시간 범위 가져오기
 */
export function getDefaultTimeRange(): TimeRange {
  return configData.defaultTimeRange;
}

/**
 * 설정 파일에서 새로고침 간격(밀리초) 가져오기
 */
export function getRefreshInterval(): number {
  return configData.refreshInterval;
}

/**
 * 전체 설정 가져오기
 */
export function getConfig(): Config {
  return configData as Config;
} 