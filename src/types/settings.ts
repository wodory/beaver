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
 * 계정 유형 (확장 가능)
 */
export type AccountType = 'github' | 'github_enterprise' | 'jira' | 'gitlab';

/**
 * 계정 인터페이스
 */
export interface Account {
  id: string;           // 계정 식별자 (고유 ID, 영문으로만 구성)
  name: string;         // 표시 이름 (한글, 영문 등 자유롭게 설정 가능)
  type: AccountType;    // 계정 유형
  url: string;          // 서비스 URL (예: https://github.com)
  apiUrl: string;       // API URL (예: https://api.github.com)
  token: string;        // 인증 토큰
  email?: string;       // 이메일 (Jira 등에서 사용)
  company?: string;     // 회사/조직 정보
  additionalInfo?: Record<string, any>; // 추가 정보 (서비스별 특수 설정)
}

/**
 * 저장소 인터페이스
 */
export interface Repository {
  id: number;           // 저장소 ID
  url: string;          // 저장소 URL
  name: string;         // 저장소 이름
  fullName: string;     // 전체 경로 (소유자/저장소)
  type: AccountType;    // 저장소 유형 (github, github_enterprise 등)
  accountId: string;    // 연결된 계정 ID
}

/**
 * 계정 설정 관리 인터페이스
 */
export interface AccountsSettings {
  accounts: Account[];
  repositories: Repository[];
}

/**
 * 도메인 인터페이스 (하위 호환성 유지용)
 * @deprecated 대신 Account 인터페이스 사용
 */
export interface DomainSettings {
  name: string;
  url: string;
  apiUrl: string;
  company?: string;
}

/**
 * GitHub 설정 인터페이스 (하위 호환성 유지용)
 * @deprecated 대신 Account 및 Repository 인터페이스 사용
 */
export interface GitHubSettings {
  token: string;
  organization: string;
  repositories: string[];
  enterpriseUrl?: string;
  
  // GitHub Enterprise 관련 설정
  enterpriseToken?: string;
  enterpriseOrganization?: string;
  domains?: DomainSettings[];
}

/**
 * Jira 설정 인터페이스 (하위 호환성 유지용)
 * @deprecated 대신 Account 인터페이스 사용
 */
export interface JiraSettings {
  url: string;
  email: string;
  apiToken: string;
  projectKey: string;
} 