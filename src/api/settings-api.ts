/**
 * 설정 API 클라이언트
 * 
 * 설정을 서버에서 가져오고 저장하는 API 함수들을 제공합니다.
 */
import { UserSettings, GitHubSettings, JiraSettings, AccountsSettings, Account, Repository } from '../types/settings';

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
    
    // 오류 발생 시 로컬 저장소에서 가져오기 시도
    console.log('[DEBUG] 로컬 저장소에서 계정 설정 가져오기 시도');
    const savedSettings = localStorage.getItem('accountsSettings');
    if (savedSettings) {
      console.log('[DEBUG] 로컬 저장소에서 계정 설정 찾음');
      return JSON.parse(savedSettings) as AccountsSettings;
    }
    
    // config.json 파일에서 데이터 로드 시도
    console.log('[DEBUG] config.json 파일에서 계정 설정 가져오기 시도');
    try {
      const response = await fetch('/src/config.json');
      console.log('[DEBUG] config.json 응답 상태:', response.status);
      if (response.ok) {
        const configData = await response.json();
        console.log('[DEBUG] config.json 데이터:', configData);
        
        // config.json 형식에서 Account 형식으로 변환
        const accounts: Account[] = [];
        
        // GitHub 계정 추가
        if (configData.accounts) {
          accounts.push(...configData.accounts.map((account: any) => ({
            id: account.id,
            name: account.name,
            type: account.id.includes('enterprise') ? 'github_enterprise' : account.id,
            url: account.url,
            apiUrl: account.apiUrl,
            token: account.token || '',
            company: account.company,
          })));
        }
        
        // 저장소 변환
        const repositories: Repository[] = configData.repositories?.map((repo: any) => ({
          id: repo.id,
          url: repo.url,
          name: repo.name,
          fullName: repo.fullName,
          type: repo.type,
          accountId: repo.type // 임시로 타입을 accountId로 사용 (이후 업데이트 필요)
        })) || [];
        
        const accountsSettings: AccountsSettings = { accounts, repositories };
        console.log('[DEBUG] 변환된 계정 설정:', accountsSettings);
        localStorage.setItem('accountsSettings', JSON.stringify(accountsSettings));
        
        return accountsSettings;
      }
    } catch (configError) {
      console.error('[DEBUG] config.json 파일 로드 실패:', configError);
    }
    
    // 기본값 반환
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
    
    // 로컬 저장소에도 저장
    localStorage.setItem('accountsSettings', JSON.stringify(updatedSettings));
    
    return updatedSettings;
  } catch (error) {
    console.error('통합 계정 설정 업데이트 실패:', error);
    
    // 오류 발생 시 로컬 저장소에만 저장
    try {
      const savedSettings = localStorage.getItem('accountsSettings');
      const currentSettings = savedSettings ? JSON.parse(savedSettings) as AccountsSettings : {
        accounts: [],
        repositories: []
      };
      
      const updatedSettings: AccountsSettings = { 
        accounts: settings.accounts || currentSettings.accounts,
        repositories: settings.repositories || currentSettings.repositories
      };
      
      localStorage.setItem('accountsSettings', JSON.stringify(updatedSettings));
      
      return updatedSettings;
    } catch (localError) {
      console.error('로컬 저장소 설정 업데이트 실패:', localError);
      throw error; // 원래 오류 던지기
    }
  }
}

/**
 * 저장소 URL에서 저장소 정보를 파싱합니다.
 * @param url 저장소 URL
 * @param accountId 연결할 계정 ID
 * @returns 파싱된 저장소 정보
 */
export function parseRepositoryUrl(url: string, accountId: string): Partial<Repository> {
  // URL에서 .git 확장자 제거 또는 추가
  const normalizedUrl = url.endsWith('.git') ? url : `${url}.git`;
  
  // 정규식으로 URL 파싱
  const match = normalizedUrl.match(/https?:\/\/([^\/]+)\/([^\/]+)\/([^\/\.]+)(\.git)?/);
  
  if (match) {
    const [, domain, owner, name] = match;
    const fullName = `${owner}/${name}`;
    
    // 계정 유형 결정 (github.com이면 github, 아니면 github_enterprise로 가정)
    const type = domain.includes('github.com') ? 'github' : 'github_enterprise';
    
    return {
      url: normalizedUrl,
      name,
      fullName,
      type,
      accountId
    };
  }
  
  // 파싱 실패 시 기본값
  return {
    url,
    name: url.split('/').pop() || '',
    fullName: '',
    type: 'github',
    accountId
  };
}

/**
 * 사용자 설정을 가져옵니다.
 */
export async function fetchUserSettings(): Promise<UserSettings> {
  try {
    return await apiRequest<UserSettings>('/settings/user');
  } catch (error) {
    console.error('사용자 설정 가져오기 실패:', error);
    
    // 오류 발생 시 로컬 저장소에서 가져오기 시도
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings) as UserSettings;
    }
    
    // 기본값 반환
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
    
    // 로컬 저장소에도 저장
    localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    
    return updatedSettings;
  } catch (error) {
    console.error('사용자 설정 업데이트 실패:', error);
    
    // 오류 발생 시 로컬 저장소에만 저장
    try {
      const savedSettings = localStorage.getItem('userSettings');
      const currentSettings = savedSettings ? JSON.parse(savedSettings) as UserSettings : {
        notificationsEnabled: true,
        darkModeEnabled: false,
        autoUpdateEnabled: true,
        refreshInterval: 10,
        language: 'ko',
      };
      
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      
      return updatedSettings;
    } catch (localError) {
      console.error('로컬 저장소 설정 업데이트 실패:', localError);
      throw error; // 원래 오류 던지기
    }
  }
}

/**
 * GitHub 설정을 가져옵니다.
 */
export async function fetchGitHubSettings(): Promise<GitHubSettings> {
  try {
    return await apiRequest<GitHubSettings>('/settings/github');
  } catch (error) {
    console.error('GitHub 설정 가져오기 실패:', error);
    
    // 오류 발생 시 로컬 저장소에서 가져오기 시도
    const savedSettings = localStorage.getItem('githubSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings) as GitHubSettings;
    }
    
    // 기본값 반환
    return {
      token: '',
      organization: '',
      repositories: [],
    };
  }
}

/**
 * GitHub 설정을 업데이트합니다.
 */
export async function updateGitHubSettingsApi(settings: Partial<GitHubSettings>): Promise<GitHubSettings> {
  try {
    const updatedSettings = await apiRequest<GitHubSettings>('/settings/github', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    
    // 로컬 저장소에도 저장
    localStorage.setItem('githubSettings', JSON.stringify(updatedSettings));
    
    return updatedSettings;
  } catch (error) {
    console.error('GitHub 설정 업데이트 실패:', error);
    
    // 오류 발생 시 로컬 저장소에만 저장
    try {
      const savedSettings = localStorage.getItem('githubSettings');
      const currentSettings = savedSettings ? JSON.parse(savedSettings) as GitHubSettings : {
        token: '',
        organization: '',
        repositories: [],
      };
      
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem('githubSettings', JSON.stringify(updatedSettings));
      
      return updatedSettings;
    } catch (localError) {
      console.error('로컬 저장소 설정 업데이트 실패:', localError);
      throw error; // 원래 오류 던지기
    }
  }
}

/**
 * Jira 설정을 가져옵니다.
 */
export async function fetchJiraSettings(): Promise<JiraSettings> {
  try {
    return await apiRequest<JiraSettings>('/settings/jira');
  } catch (error) {
    console.error('Jira 설정 가져오기 실패:', error);
    
    // 오류 발생 시 로컬 저장소에서 가져오기 시도
    const savedSettings = localStorage.getItem('jiraSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings) as JiraSettings;
    }
    
    // 기본값 반환
    return {
      url: '',
      email: '',
      apiToken: '',
      projectKey: '',
    };
  }
}

/**
 * Jira 설정을 업데이트합니다.
 */
export async function updateJiraSettingsApi(settings: Partial<JiraSettings>): Promise<JiraSettings> {
  try {
    const updatedSettings = await apiRequest<JiraSettings>('/settings/jira', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    
    // 로컬 저장소에도 저장
    localStorage.setItem('jiraSettings', JSON.stringify(updatedSettings));
    
    return updatedSettings;
  } catch (error) {
    console.error('Jira 설정 업데이트 실패:', error);
    
    // 오류 발생 시 로컬 저장소에만 저장
    try {
      const savedSettings = localStorage.getItem('jiraSettings');
      const currentSettings = savedSettings ? JSON.parse(savedSettings) as JiraSettings : {
        url: '',
        email: '',
        apiToken: '',
        projectKey: '',
      };
      
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem('jiraSettings', JSON.stringify(updatedSettings));
      
      return updatedSettings;
    } catch (localError) {
      console.error('로컬 저장소 설정 업데이트 실패:', localError);
      throw error; // 원래 오류 던지기
    }
  }
} 