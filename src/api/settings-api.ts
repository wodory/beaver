/**
 * 설정 API 클라이언트
 * 
 * 설정을 서버에서 가져오고 저장하는 API 함수들을 제공합니다.
 */
import { UserSettings, GitHubSettings, JiraSettings } from '../types/settings';

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
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`API 요청 오류 (${url}):`, error);
    throw error;
  }
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