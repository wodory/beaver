/**
 * 설정 관련 훅
 */
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchUserSettings, 
  updateUserSettingsApi, 
  fetchGitHubSettings, 
  updateGitHubSettingsApi, 
  fetchJiraSettings, 
  updateJiraSettingsApi 
} from '../api/settings-api';
import { UserSettings, GitHubSettings, JiraSettings } from '../types/settings';

/**
 * 사용자 설정 관리 훅
 * @returns 사용자 설정 관련 상태 및 함수
 */
export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // 설정 불러오기
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserSettings();
      setSettings(data);
    } catch (err) {
      console.error('사용자 설정 불러오기 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  }, []);

  // 설정 업데이트
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedSettings = await updateUserSettingsApi(newSettings);
      setSettings(updatedSettings);
      return true;
    } catch (err) {
      console.error('사용자 설정 업데이트 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 설정 불러오기
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings,
  };
}

/**
 * GitHub 설정 관리 훅
 * @returns GitHub 설정 관련 상태 및 함수
 */
export function useGitHubSettings() {
  const [settings, setSettings] = useState<GitHubSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // 설정 불러오기
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGitHubSettings();
      setSettings(data);
    } catch (err) {
      console.error('GitHub 설정 불러오기 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  }, []);

  // 설정 업데이트
  const updateSettings = useCallback(async (newSettings: Partial<GitHubSettings>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedSettings = await updateGitHubSettingsApi(newSettings);
      setSettings(updatedSettings);
      return true;
    } catch (err) {
      console.error('GitHub 설정 업데이트 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 설정 불러오기
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings,
  };
}

/**
 * Jira 설정 관리 훅
 * @returns Jira 설정 관련 상태 및 함수
 */
export function useJiraSettings() {
  const [settings, setSettings] = useState<JiraSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // 설정 불러오기
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchJiraSettings();
      setSettings(data);
    } catch (err) {
      console.error('Jira 설정 불러오기 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  }, []);

  // 설정 업데이트
  const updateSettings = useCallback(async (newSettings: Partial<JiraSettings>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedSettings = await updateJiraSettingsApi(newSettings);
      setSettings(updatedSettings);
      return true;
    } catch (err) {
      console.error('Jira 설정 업데이트 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 설정 불러오기
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings,
  };
} 