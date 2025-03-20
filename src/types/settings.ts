/**
 * 설정 관련 인터페이스 정의
 */

/**
 * 사용자 설정 인터페이스
 */
export interface UserSettings {
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
  autoUpdateEnabled: boolean;
  refreshInterval: number;
  language: string;
}

/**
 * GitHub 설정 인터페이스
 */
export interface GitHubSettings {
  token: string;
  organization: string;
  repositories: string[];
}

/**
 * Jira 설정 인터페이스
 */
export interface JiraSettings {
  url: string;
  email: string;
  apiToken: string;
  projectKey: string;
} 