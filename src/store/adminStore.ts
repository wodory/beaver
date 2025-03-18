import { create } from 'zustand';

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  cloneUrl: string;
  localPath?: string;
  isActive: boolean;
  lastSyncAt?: string;
  description?: string;
}

export interface GitHubToken {
  token: string;
  isValid: boolean;
  scope?: string;
  createdAt?: string;
}

export interface JiraConfig {
  baseUrl: string;
  username: string;
  apiToken: string;
  isConfigured: boolean;
}

export interface AdminState {
  // 저장소 관리 관련 상태
  repositories: Repository[];
  isRepositoriesLoading: boolean;
  repositoriesError: string | null;
  
  // 시스템 설정 관련 상태
  githubToken: GitHubToken | null;
  jiraConfig: JiraConfig | null;
  isSettingsLoading: boolean;
  settingsError: string | null;
  
  // 팀 정보 관련 상태
  teamConfig: Record<string, { members: string[] }> | null;
  isTeamConfigLoading: boolean;
  teamConfigError: string | null;
  
  // 동기화 관련 상태
  isSyncing: boolean;
  syncError: string | null;
  syncProgress: number; // 0-100
  
  // 액션 함수들
  loadRepositories: () => Promise<void>;
  addRepository: (repositoryUrl: string) => Promise<void>;
  removeRepository: (repositoryId: string) => Promise<void>;
  toggleRepositoryActive: (repositoryId: string, isActive: boolean) => Promise<void>;
  syncRepository: (repositoryId: string) => Promise<void>;
  
  loadSettings: () => Promise<void>;
  saveGitHubToken: (token: string) => Promise<void>;
  saveJiraConfig: (config: Partial<JiraConfig>) => Promise<void>;
  
  loadTeamConfig: () => Promise<void>;
  saveTeamConfig: (config: Record<string, { members: string[] }>) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // 초기 상태
  repositories: [],
  isRepositoriesLoading: false,
  repositoriesError: null,
  
  githubToken: null,
  jiraConfig: null,
  isSettingsLoading: false,
  settingsError: null,
  
  teamConfig: null,
  isTeamConfigLoading: false,
  teamConfigError: null,
  
  isSyncing: false,
  syncError: null,
  syncProgress: 0,
  
  // 저장소 관리 액션
  loadRepositories: async () => {
    set({ isRepositoriesLoading: true, repositoriesError: null });
    
    try {
      // 실제 API 구현 시 사용할 코드
      // const response = await fetch('/api/repositories');
      // const data = await response.json();
      
      // 개발용 더미 데이터
      await new Promise(resolve => setTimeout(resolve, 500));
      const dummyData: Repository[] = [
        {
          id: 'repo1',
          name: 'beaver',
          fullName: 'acme/beaver',
          cloneUrl: 'https://github.com/acme/beaver.git',
          localPath: '/home/git/repos/beaver',
          isActive: true,
          lastSyncAt: new Date().toISOString(),
          description: '개발 데이터 수집 및 분석 시스템'
        },
        {
          id: 'repo2',
          name: 'frontend',
          fullName: 'acme/frontend',
          cloneUrl: 'https://github.com/acme/frontend.git',
          localPath: '/home/git/repos/frontend',
          isActive: true,
          lastSyncAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          description: '프론트엔드 애플리케이션'
        },
        {
          id: 'repo3',
          name: 'backend',
          fullName: 'acme/backend',
          cloneUrl: 'https://github.com/acme/backend.git',
          localPath: '/home/git/repos/backend',
          isActive: false,
          lastSyncAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          description: '백엔드 API 서버'
        }
      ];
      
      set({ repositories: dummyData, isRepositoriesLoading: false });
    } catch (error: any) {
      console.error('저장소 목록 로드 오류:', error);
      set({
        isRepositoriesLoading: false,
        repositoriesError: error.message || '저장소 목록을 불러오는 중 오류가 발생했습니다.'
      });
    }
  },
  
  addRepository: async (repositoryUrl: string) => {
    // URL 형식 검증
    if (!repositoryUrl.startsWith('https://github.com/') && 
        !repositoryUrl.startsWith('git@github.com:')) {
      set({ 
        repositoriesError: '유효한 GitHub 저장소 URL을 입력해 주세요. (https://github.com/user/repo 또는 git@github.com:user/repo)' 
      });
      return;
    }
    
    try {
      // 이미 있는 저장소인지 확인
      const fullName = repositoryUrl.replace(/^https:\/\/github\.com\/|^git@github\.com:/, '')
                                     .replace(/\.git$/, '')
                                     .replace(/\/$/, '');
      
      const existingRepo = get().repositories.find(repo => 
        repo.fullName.toLowerCase() === fullName.toLowerCase()
      );
      
      if (existingRepo) {
        set({ repositoriesError: '이미 등록된 저장소입니다.' });
        return;
      }
      
      // 실제 API 구현 시 사용할 코드
      // await fetch('/api/repositories', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url: repositoryUrl })
      // });
      
      // 개발용 더미 데이터
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 성공 시 목록 다시 로드
      get().loadRepositories();
    } catch (error: any) {
      console.error('저장소 추가 오류:', error);
      set({
        repositoriesError: error.message || '저장소를 추가하는 중 오류가 발생했습니다.'
      });
    }
  },
  
  removeRepository: async (repositoryId: string) => {
    try {
      // 실제 API 구현 시 사용할 코드
      // await fetch(`/api/repositories/${repositoryId}`, {
      //   method: 'DELETE'
      // });
      
      // 개발용 더미 데이터
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 로컬 상태 업데이트
      set({
        repositories: get().repositories.filter(repo => repo.id !== repositoryId)
      });
    } catch (error: any) {
      console.error('저장소 삭제 오류:', error);
      set({
        repositoriesError: error.message || '저장소를 삭제하는 중 오류가 발생했습니다.'
      });
    }
  },
  
  toggleRepositoryActive: async (repositoryId: string, isActive: boolean) => {
    try {
      // 실제 API 구현 시 사용할 코드
      // await fetch(`/api/repositories/${repositoryId}/active`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ isActive })
      // });
      
      // 개발용 더미 데이터
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 로컬 상태 업데이트
      set({
        repositories: get().repositories.map(repo => 
          repo.id === repositoryId ? { ...repo, isActive } : repo
        )
      });
    } catch (error: any) {
      console.error('저장소 활성화 상태 변경 오류:', error);
      set({
        repositoriesError: error.message || '저장소 활성화 상태를 변경하는 중 오류가 발생했습니다.'
      });
    }
  },
  
  syncRepository: async (repositoryId: string) => {
    if (get().isSyncing) {
      console.warn('이미 동기화가 진행 중입니다.');
      return;
    }
    
    set({ isSyncing: true, syncError: null, syncProgress: 0 });
    
    try {
      // 실제 API 구현 시 사용할 코드
      // const response = await fetch(`/api/sync/repositories/${repositoryId}`, {
      //   method: 'POST'
      // });
      // const data = await response.json();
      
      // 개발용 더미 데이터 - 진행 상황 시뮬레이션
      for (let i = 1; i <= 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        set({ syncProgress: i * 10 });
      }
      
      // 동기화 완료 후 저장소 목록 다시 로드
      await get().loadRepositories();
      
      set({ isSyncing: false, syncProgress: 100 });
    } catch (error: any) {
      console.error('저장소 동기화 오류:', error);
      set({
        isSyncing: false,
        syncError: error.message || '저장소 동기화 중 오류가 발생했습니다.',
        syncProgress: 0
      });
    }
  },
  
  // 시스템 설정 액션
  loadSettings: async () => {
    set({ isSettingsLoading: true, settingsError: null });
    
    try {
      // 실제 API 구현 시 사용할 코드
      // const response = await fetch('/api/settings');
      // const data = await response.json();
      
      // 개발용 더미 데이터
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ 
        githubToken: {
          token: '****************************',
          isValid: true,
          scope: 'repo,user',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        jiraConfig: {
          baseUrl: 'https://acme.atlassian.net',
          username: 'jira-api@acme.com',
          apiToken: '************',
          isConfigured: true
        },
        isSettingsLoading: false
      });
    } catch (error: any) {
      console.error('설정 로드 오류:', error);
      set({
        isSettingsLoading: false,
        settingsError: error.message || '설정을 불러오는 중 오류가 발생했습니다.'
      });
    }
  },
  
  saveGitHubToken: async (token: string) => {
    try {
      // 토큰 형식 검증
      if (!token || token.length < 30) {
        set({ settingsError: '유효한 GitHub 토큰을 입력해 주세요.' });
        return;
      }
      
      // 실제 API 구현 시 사용할 코드
      // await fetch('/api/settings/github-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token })
      // });
      
      // 개발용 더미 데이터
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ 
        githubToken: {
          token: token.substring(0, 4) + '*'.repeat(token.length - 8) + token.substring(token.length - 4),
          isValid: true,
          scope: 'repo,user',
          createdAt: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('GitHub 토큰 저장 오류:', error);
      set({
        settingsError: error.message || 'GitHub 토큰을 저장하는 중 오류가 발생했습니다.'
      });
    }
  },
  
  saveJiraConfig: async (config: Partial<JiraConfig>) => {
    try {
      const currentConfig = get().jiraConfig || {
        baseUrl: '',
        username: '',
        apiToken: '',
        isConfigured: false
      };
      
      // 설정 검증
      if (config.baseUrl && !config.baseUrl.match(/^https?:\/\//)) {
        set({ settingsError: '유효한 JIRA URL을 입력해 주세요.' });
        return;
      }
      
      // 실제 API 구현 시 사용할 코드
      // await fetch('/api/settings/jira-config', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config)
      // });
      
      // 개발용 더미 데이터
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedConfig: JiraConfig = {
        ...currentConfig,
        ...config,
        isConfigured: Boolean(
          (config.baseUrl || currentConfig.baseUrl) && 
          (config.username || currentConfig.username) && 
          (config.apiToken || currentConfig.apiToken)
        )
      };
      
      set({ jiraConfig: updatedConfig });
    } catch (error: any) {
      console.error('JIRA 설정 저장 오류:', error);
      set({
        settingsError: error.message || 'JIRA 설정을 저장하는 중 오류가 발생했습니다.'
      });
    }
  },
  
  // 팀 설정 액션
  loadTeamConfig: async () => {
    set({ isTeamConfigLoading: true, teamConfigError: null });
    
    try {
      // 실제 API 구현 시 사용할 코드
      // const response = await fetch('/api/teams/config');
      // const data = await response.json();
      
      // 개발용 더미 데이터
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ 
        teamConfig: {
          'frontend-team': {
            members: ['user1', 'user2', 'user3', 'user4', 'user5']
          },
          'backend-team': {
            members: ['user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12']
          },
          'infra-team': {
            members: ['user13', 'user14', 'user15']
          },
          'data-team': {
            members: ['user16', 'user17', 'user18', 'user19']
          }
        },
        isTeamConfigLoading: false
      });
    } catch (error: any) {
      console.error('팀 설정 로드 오류:', error);
      set({
        isTeamConfigLoading: false,
        teamConfigError: error.message || '팀 설정을 불러오는 중 오류가 발생했습니다.'
      });
    }
  },
  
  saveTeamConfig: async (config: Record<string, { members: string[] }>) => {
    try {
      // 실제 API 구현 시 사용할 코드
      // await fetch('/api/teams/config', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config)
      // });
      
      // 개발용 더미 데이터
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ teamConfig: config });
    } catch (error: any) {
      console.error('팀 설정 저장 오류:', error);
      set({
        teamConfigError: error.message || '팀 설정을 저장하는 중 오류가 발생했습니다.'
      });
    }
  }
})); 