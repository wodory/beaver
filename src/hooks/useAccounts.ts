/**
 * 통합 계정 관리를 위한 훅
 */
import { useState, useEffect, useCallback } from 'react';
import { 
  AccountsSettings, 
  Account, 
  Repository,
  AccountType
} from '../types/settings';
import { 
  fetchAccountsSettings, 
  updateAccountsSettings,
  parseRepositoryUrl
} from '../api/settings-api';

/**
 * 통합 계정 관리 훅
 * @returns 계정 및 저장소 관리를 위한 상태와 함수들
 */
export function useAccounts() {
  const [settings, setSettings] = useState<AccountsSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // 설정 불러오기
  const loadSettings = useCallback(async () => {
    console.log('[DEBUG] useAccounts - loadSettings 함수 호출됨');
    try {
      setLoading(true);
      setError(null);
      console.log('[DEBUG] useAccounts - fetchAccountsSettings 호출 전');
      const data = await fetchAccountsSettings();
      console.log('[DEBUG] useAccounts - fetchAccountsSettings 결과:', data);
      setSettings(data);
    } catch (err) {
      console.error('[DEBUG] useAccounts - 계정 설정 불러오기 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
      console.log('[DEBUG] useAccounts - 로딩 상태 종료');
    }
  }, []);

  // 설정 업데이트
  const updateSettings = useCallback(async (newSettings: Partial<AccountsSettings>) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!settings) {
        throw new Error('현재 설정이 로드되지 않았습니다.');
      }
      
      const updatedSettings = await updateAccountsSettings({
        ...settings,
        ...newSettings
      });
      
      setSettings(updatedSettings);
      return true;
    } catch (err) {
      console.error('계정 설정 업데이트 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [settings]);

  // 계정 추가
  const addAccount = useCallback(async (account: Omit<Account, 'id'> & { id?: string }) => {
    try {
      if (!settings) {
        throw new Error('현재 설정이 로드되지 않았습니다.');
      }
      
      // id가 없으면 username을 기반으로 생성
      const accountId = account.id || account.username.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // 복합 유니크 키(id + type)로 유일성 검사
      const isDuplicate = settings.accounts.some(a => a.id === accountId && a.type === account.type);
      if (isDuplicate) {
        throw new Error(`동일한 서비스(${account.type})에 ID '${accountId}'의 계정이 이미 존재합니다.`);
      }
      
      const newAccount: Account = {
        ...account,
        id: accountId
      };
      
      const updatedAccounts = [...settings.accounts, newAccount];
      return await updateSettings({ accounts: updatedAccounts });
    } catch (err) {
      console.error('계정 추가 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
      return false;
    }
  }, [settings, updateSettings]);

  // 계정 업데이트
  const updateAccount = useCallback(async (accountId: string, accountType: AccountType, accountData: Partial<Account>) => {
    try {
      if (!settings) {
        throw new Error('현재 설정이 로드되지 않았습니다.');
      }
      
      // 복합 키(id + type)로 계정 찾기
      const accountIndex = settings.accounts.findIndex(a => a.id === accountId && a.type === accountType);
      if (accountIndex === -1) {
        throw new Error(`ID '${accountId}'와 타입 '${accountType}'에 해당하는 계정을 찾을 수 없습니다.`);
      }
      
      // 타입을 변경하는 경우, 복합 유니크 키 검사
      if (accountData.type && accountData.type !== accountType) {
        const isDuplicate = settings.accounts.some(a => 
          a.id === accountId && a.type === accountData.type && settings.accounts.indexOf(a) !== accountIndex
        );
        if (isDuplicate) {
          throw new Error(`동일한 서비스(${accountData.type})에 ID '${accountId}'의 계정이 이미 존재합니다.`);
        }
      }
      
      const updatedAccounts = [...settings.accounts];
      updatedAccounts[accountIndex] = {
        ...updatedAccounts[accountIndex],
        ...accountData
      };
      
      return await updateSettings({ accounts: updatedAccounts });
    } catch (err) {
      console.error('계정 업데이트 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
      return false;
    }
  }, [settings, updateSettings]);

  // 계정 삭제
  const deleteAccount = useCallback(async (accountId: string, accountType: AccountType) => {
    try {
      if (!settings) {
        throw new Error('현재 설정이 로드되지 않았습니다.');
      }
      
      // 복합 키(id + type)로 계정 찾기
      const account = settings.accounts.find(a => a.id === accountId && a.type === accountType);
      if (!account) {
        throw new Error(`ID '${accountId}'와 타입 '${accountType}'에 해당하는 계정을 찾을 수 없습니다.`);
      }
      
      // 연결된 저장소가 있는지 확인
      const linkedRepositories = settings.repositories.filter(r => r.owner === accountId);
      if (linkedRepositories.length > 0) {
        throw new Error(`이 계정에 연결된 저장소(${linkedRepositories.length}개)가 있어 삭제할 수 없습니다.`);
      }
      
      const updatedAccounts = settings.accounts.filter(a => !(a.id === accountId && a.type === accountType));
      return await updateSettings({ accounts: updatedAccounts });
    } catch (err) {
      console.error('계정 삭제 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
      return false;
    }
  }, [settings, updateSettings]);

  // 저장소 추가
  const addRepository = useCallback(async (repository: Omit<Repository, 'id'>) => {
    try {
      if (!settings) {
        throw new Error('현재 설정이 로드되지 않았습니다.');
      }
      
      // 계정 존재 확인
      const account = settings.accounts.find(a => a.id === repository.owner);
      if (!account) {
        throw new Error(`ID '${repository.owner}'의 계정을 찾을 수 없습니다.`);
      }
      
      // settings.repositories가 undefined일 경우 빈 배열로 초기화
      const repositories = settings.repositories || [];
      
      // ID 자동 생성
      const maxId = repositories.reduce((max, repo) => Math.max(max, repo.id || 0), 0);
      const newRepository: Repository = {
        ...repository,
        id: maxId + 1,
        ownerReference: `${repository.owner}@${account.type}` // owner@type 형식의 참조 생성
      };
      
      const updatedRepositories = [...repositories, newRepository];
      return await updateSettings({ repositories: updatedRepositories });
    } catch (err) {
      console.error('저장소 추가 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
      return false;
    }
  }, [settings, updateSettings]);

  // URL로 저장소 추가
  const addRepositoryByUrl = useCallback(async (url: string, accountId: string) => {
    try {
      if (!settings) {
        throw new Error('현재 설정이 로드되지 않았습니다.');
      }
      
      // 계정 존재 확인
      const account = settings.accounts.find(a => a.id === accountId);
      if (!account) {
        throw new Error(`ID '${accountId}'의 계정을 찾을 수 없습니다.`);
      }
      
      // URL 파싱
      const repoInfo = parseRepositoryUrl(url, accountId);
      
      // 이미 존재하는 저장소인지 확인
      const existingRepo = settings.repositories.find(
        r => r.url === repoInfo.url || (r.fullName === repoInfo.fullName && r.type === repoInfo.type)
      );
      
      if (existingRepo) {
        throw new Error(`저장소 '${repoInfo.fullName}'이(가) 이미 존재합니다.`);
      }
      
      // ID 자동 생성
      const maxId = settings.repositories.reduce((max, repo) => Math.max(max, repo.id || 0), 0);
      const newRepository: Repository = {
        id: maxId + 1,
        url: repoInfo.url!,
        name: repoInfo.name!,
        fullName: repoInfo.fullName!,
        type: repoInfo.type as AccountType,
        owner: accountId,
        ownerReference: `${accountId}@${account.type}`
      };
      
      const updatedRepositories = [...settings.repositories, newRepository];
      return await updateSettings({ repositories: updatedRepositories });
    } catch (err) {
      console.error('URL로 저장소 추가 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
      return false;
    }
  }, [settings, updateSettings]);

  // 저장소 업데이트
  const updateRepository = useCallback(async (repoId: number, repoData: Partial<Repository>) => {
    try {
      if (!settings) {
        throw new Error('현재 설정이 로드되지 않았습니다.');
      }
      
      // settings.repositories가 undefined일 경우 빈 배열로 초기화
      const repositories = settings.repositories || [];
      
      const repoIndex = repositories.findIndex(r => r.id === repoId);
      if (repoIndex === -1) {
        throw new Error(`ID '${repoId}'의 저장소를 찾을 수 없습니다.`);
      }
      
      const updatedRepositories = [...repositories];
      updatedRepositories[repoIndex] = {
        ...updatedRepositories[repoIndex],
        ...repoData
      };
      
      return await updateSettings({ repositories: updatedRepositories });
    } catch (err) {
      console.error('저장소 업데이트 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
      return false;
    }
  }, [settings, updateSettings]);

  // 저장소 삭제
  const deleteRepository = useCallback(async (repoId: number) => {
    try {
      if (!settings) {
        throw new Error('현재 설정이 로드되지 않았습니다.');
      }
      
      // settings.repositories가 undefined일 경우 빈 배열로 초기화
      const repositories = settings.repositories || [];
      
      const updatedRepositories = repositories.filter(r => r.id !== repoId);
      return await updateSettings({ repositories: updatedRepositories });
    } catch (err) {
      console.error('저장소 삭제 오류:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
      return false;
    }
  }, [settings, updateSettings]);

  // 특정 계정 유형의 계정 목록 가져오기
  const getAccountsByType = useCallback((type: AccountType) => {
    if (!settings) return [];
    return settings.accounts.filter(account => account.type === type);
  }, [settings]);

  // 특정 계정에 연결된 저장소 목록 가져오기
  const getRepositoriesByAccount = useCallback((accountId: string) => {
    if (!settings) return [];
    return settings.repositories.filter(repo => repo.owner === accountId);
  }, [settings]);

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
    addAccount,
    updateAccount,
    deleteAccount,
    addRepository,
    addRepositoryByUrl,
    updateRepository,
    deleteRepository,
    getAccountsByType,
    getRepositoriesByAccount
  };
} 