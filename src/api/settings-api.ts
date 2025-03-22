/**
 * 설정 API 클라이언트
 * 
 * 설정을 서버에서 가져오고 저장하는 API 함수들을 제공합니다.
 */
import { UserSettings, GitHubSettings, GitHubEnterpriseSettings, JiraSettings, AccountsSettings, Account, Repository } from '../types/settings';

// API 기본 URL
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

/**
 * API 요청 기본 함수
 * @param url API 경로
 * @param options 요청 옵션
 * @returns 요청 결과
 */
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    console.log(`[DEBUG] API 요청 시작: ${API_BASE_URL}${url}`, options);
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log(`[DEBUG] API 응답 상태: ${response.status}`, response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] API 오류 응답: ${errorText}`);
      throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
    }

    const data = await response.json() as T;
    console.log(`[DEBUG] API 응답 데이터:`, data);
    return data;
  } catch (error) {
    console.error(`[DEBUG] API 요청 오류 (${url}):`, error);
    throw error;
  }
}

/**
 * 통합 계정 설정을 가져옵니다.
 */
export async function fetchAccountsSettings(): Promise<AccountsSettings> {
  console.log('[DEBUG] fetchAccountsSettings 함수 호출됨');
  try {
    console.log('[DEBUG] API 서버에서 계정 설정 가져오기 시도');
    return await apiRequest<AccountsSettings>('/settings/accounts');
  } catch (error) {
    console.error('[DEBUG] 통합 계정 설정 가져오기 실패:', error);
    
    // 오류 발생 시 기본값 반환
    console.log('[DEBUG] 기본 빈 계정 설정 반환');
    return {
      accounts: [],
      repositories: []
    };
  }
}

/**
 * 통합 계정 설정을 업데이트합니다.
 */
export async function updateAccountsSettings(settings: Partial<AccountsSettings>): Promise<AccountsSettings> {
  try {
    const updatedSettings = await apiRequest<AccountsSettings>('/settings/accounts', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    
    return updatedSettings;
  } catch (error) {
    console.error('통합 계정 설정 업데이트 실패:', error);
    throw new Error('계정 설정을 업데이트하는 데 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
  }
}

/**
 * 저장소 URL에서 저장소 정보를 파싱합니다.
 * @param url 저장소 URL
 * @param owner 저장소 소유자 (계정 ID)
 * @returns 파싱된 저장소 정보
 */
export function parseRepositoryUrl(url: string, owner: string): Partial<Repository> {
  try {
    // URL 객체로 파싱
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // 경로 부분이 2개 이상인 경우 (owner/repo 형식)
    if (pathParts.length >= 2) {
      const repoOwner = pathParts[0];
      const name = pathParts[1].replace('.git', '');
      const fullName = `${repoOwner}/${name}`;
      
      // 계정 유형 결정 (github.com이면 github, 아니면 github_enterprise로 가정)
      const type = hostname.includes('github.com') ? 'github' : 'github_enterprise';
      
      return {
        url: url,
        name,
        fullName,
        type,
        owner
      };
    }
  } catch (error) {
    console.error('URL 파싱 오류:', error);
  }
  
  // 파싱 실패 시 기본값
  return {
    url,
    name: url.split('/').pop()?.replace('.git', '') || '',
    fullName: '',
    type: 'github',
    owner
  };
}

/**
 * 사용자 설정을 가져옵니다.
 */
export async function fetchUserSettings(): Promise<UserSettings> {
  try {
    const settings = await apiRequest<UserSettings>('/settings/user');
    return settings;
  } catch (error) {
    console.error('사용자 설정 로드 실패:', error);
    return {
      notificationsEnabled: true,
      darkModeEnabled: false,
      autoUpdateEnabled: true,
      refreshInterval: 10,
      language: 'ko',
    };
  }
}

/**
 * 사용자 설정을 업데이트합니다.
 */
export async function updateUserSettingsApi(settings: Partial<UserSettings>): Promise<UserSettings> {
  try {
    const updatedSettings = await apiRequest<UserSettings>('/settings/user', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    
    return updatedSettings;
  } catch (error) {
    console.error('사용자 설정 업데이트 실패:', error);
    throw new Error('사용자 설정을 업데이트하는 데 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
  }
}

/**
 * GitHub 설정을 가져옵니다.
 */
export async function fetchGitHubSettings(): Promise<GitHubSettings> {
  try {
    const settings = await apiRequest<GitHubSettings>('/settings/github');
    return settings;
  } catch (error) {
    console.error('GitHub 설정 로드 실패:', error);
    return { token: '', organization: '', repositories: [] };
  }
}

/**
 * GitHub 설정을 업데이트합니다.
 */
export async function updateGitHubSettings(settings: Partial<GitHubSettings>): Promise<GitHubSettings> {
  try {
    const updatedSettings = await apiRequest<GitHubSettings>('/settings/github', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    
    return updatedSettings;
  } catch (error) {
    console.error('GitHub 설정 업데이트 실패:', error);
    throw new Error('GitHub 설정을 업데이트하는 데 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
  }
}

/**
 * GitHub Enterprise 설정을 가져옵니다.
 */
export async function fetchGitHubEnterpriseSettings(): Promise<GitHubEnterpriseSettings> {
  try {
    const settings = await apiRequest<GitHubEnterpriseSettings>('/settings/github-enterprise');
    return settings;
  } catch (error) {
    console.error('GitHub Enterprise 설정 로드 실패:', error);
    return { 
      enterpriseToken: '', 
      enterpriseUrl: '', 
      enterpriseOrganization: '', 
      organization: '', 
      repositories: [] 
    };
  }
}

/**
 * GitHub Enterprise 설정을 업데이트합니다.
 */
export async function updateGitHubEnterpriseSettings(settings: Partial<GitHubEnterpriseSettings>): Promise<GitHubEnterpriseSettings> {
  try {
    const updatedSettings = await apiRequest<GitHubEnterpriseSettings>('/settings/github-enterprise', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    
    return updatedSettings;
  } catch (error) {
    console.error('GitHub Enterprise 설정 업데이트 실패:', error);
    throw new Error('GitHub Enterprise 설정을 업데이트하는 데 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
  }
}

/**
 * Jira 설정을 가져옵니다.
 */
export async function fetchJiraSettings(): Promise<JiraSettings> {
  try {
    const settings = await apiRequest<JiraSettings>('/settings/jira');
    return settings;
  } catch (error) {
    console.error('Jira 설정 로드 실패:', error);
    return { url: '', email: '', apiToken: '', projectKey: '' };
  }
}

/**
 * Jira 설정을 업데이트합니다.
 */
export async function updateJiraSettings(settings: Partial<JiraSettings>): Promise<JiraSettings> {
  try {
    const updatedSettings = await apiRequest<JiraSettings>('/settings/jira', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    
    return updatedSettings;
  } catch (error) {
    console.error('Jira 설정 업데이트 실패:', error);
    throw new Error('Jira 설정을 업데이트하는 데 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
  }
} 