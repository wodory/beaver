/**
 * 설정 관리 서비스
 * 
 * 애플리케이션의 설정 정보를 관리하는 서비스입니다.
 */
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// 환경 변수에서 DB 연결 문자열 가져오기
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Fg3G0Pyrcklp@ep-bold-water-a1ga74m9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// 기본 사용자 ID (현재는 단일 사용자 시스템)
const DEFAULT_USER_ID = 1;

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

/**
 * 설정 서비스 클래스
 */
export class SettingsService {
  /**
   * 사용자 설정을 가져옵니다.
   * @param userId 사용자 ID (기본값: 1)
   * @returns 사용자 설정 객체
   */
  async getUserSettings(userId: number = DEFAULT_USER_ID): Promise<UserSettings> {
    try {
      const { stdout } = await execPromise(
        `psql "${DATABASE_URL}" -t -c "SELECT notifications_enabled, dark_mode_enabled, auto_update_enabled, refresh_interval, language FROM user_settings WHERE user_id = ${userId};"`
      );

      // 결과가 없으면 기본값 반환
      if (!stdout.trim()) {
        return {
          notificationsEnabled: true,
          darkModeEnabled: false,
          autoUpdateEnabled: true,
          refreshInterval: 5,
          language: 'ko'
        };
      }

      // 결과 파싱
      const [notificationsEnabled, darkModeEnabled, autoUpdateEnabled, refreshInterval, language] = 
        stdout.trim().split('|').map(item => item.trim());

      return {
        notificationsEnabled: notificationsEnabled === 't',
        darkModeEnabled: darkModeEnabled === 't',
        autoUpdateEnabled: autoUpdateEnabled === 't',
        refreshInterval: parseInt(refreshInterval, 10) || 5,
        language: language || 'ko'
      };
    } catch (error) {
      console.error('사용자 설정 조회 실패:', error);
      // 오류 시 기본값 반환
      return {
        notificationsEnabled: true,
        darkModeEnabled: false,
        autoUpdateEnabled: true,
        refreshInterval: 5,
        language: 'ko'
      };
    }
  }

  /**
   * 사용자 설정을 업데이트합니다.
   * @param settings 새 설정 값
   * @param userId 사용자 ID (기본값: 1)
   * @returns 성공 여부
   */
  async updateUserSettings(settings: Partial<UserSettings>, userId: number = DEFAULT_USER_ID): Promise<boolean> {
    try {
      // 업데이트할 필드 구성
      const updateFields = [];
      
      if (settings.notificationsEnabled !== undefined) {
        updateFields.push(`notifications_enabled = ${settings.notificationsEnabled}`);
      }
      
      if (settings.darkModeEnabled !== undefined) {
        updateFields.push(`dark_mode_enabled = ${settings.darkModeEnabled}`);
      }
      
      if (settings.autoUpdateEnabled !== undefined) {
        updateFields.push(`auto_update_enabled = ${settings.autoUpdateEnabled}`);
      }
      
      if (settings.refreshInterval !== undefined) {
        updateFields.push(`refresh_interval = ${settings.refreshInterval}`);
      }
      
      if (settings.language !== undefined) {
        updateFields.push(`language = '${settings.language}'`);
      }
      
      if (updateFields.length === 0) {
        return true; // 업데이트할 필드가 없으면 성공으로 간주
      }
      
      // 쿼리 실행
      await execPromise(
        `psql "${DATABASE_URL}" -c "UPDATE user_settings SET ${updateFields.join(', ')}, updated_at = NOW() WHERE user_id = ${userId};"`
      );
      
      return true;
    } catch (error) {
      console.error('사용자 설정 업데이트 실패:', error);
      return false;
    }
  }

  /**
   * GitHub 설정을 가져옵니다.
   * @param userId 사용자 ID (기본값: 1)
   * @returns GitHub 설정 객체
   */
  async getGitHubSettings(userId: number = DEFAULT_USER_ID): Promise<GitHubSettings> {
    try {
      const { stdout } = await execPromise(
        `psql "${DATABASE_URL}" -t -c "SELECT token, organization, repositories FROM github_settings WHERE user_id = ${userId};"`
      );

      // 결과가 없으면 기본값 반환
      if (!stdout.trim()) {
        return {
          token: '',
          organization: '',
          repositories: []
        };
      }

      // 결과 파싱
      const [token, organization, repositories] = stdout.trim().split('|').map(item => item.trim());

      // repositories는 PostgreSQL 배열 형식으로 저장됨 (예: {repo1,repo2,repo3})
      const repoList = repositories
        ? repositories.replace(/{|}/g, '').split(',').filter(Boolean)
        : [];

      return {
        token: token || '',
        organization: organization || '',
        repositories: repoList
      };
    } catch (error) {
      console.error('GitHub 설정 조회 실패:', error);
      // 오류 시 기본값 반환
      return {
        token: '',
        organization: '',
        repositories: []
      };
    }
  }

  /**
   * GitHub 설정을 업데이트합니다.
   * @param settings 새 설정 값
   * @param userId 사용자 ID (기본값: 1)
   * @returns 성공 여부
   */
  async updateGitHubSettings(settings: Partial<GitHubSettings>, userId: number = DEFAULT_USER_ID): Promise<boolean> {
    try {
      // 업데이트할 필드 구성
      const updateFields = [];
      
      if (settings.token !== undefined) {
        updateFields.push(`token = '${settings.token}'`);
      }
      
      if (settings.organization !== undefined) {
        updateFields.push(`organization = '${settings.organization}'`);
      }
      
      if (settings.repositories !== undefined) {
        // PostgreSQL 배열 형식으로 변환
        const repoArray = `ARRAY[${settings.repositories.map(repo => `'${repo.replace(/'/g, "''")}'`).join(', ')}]::TEXT[]`;
        updateFields.push(`repositories = ${repoArray}`);
      }
      
      if (updateFields.length === 0) {
        return true; // 업데이트할 필드가 없으면 성공으로 간주
      }
      
      // 쿼리 실행
      await execPromise(
        `psql "${DATABASE_URL}" -c "UPDATE github_settings SET ${updateFields.join(', ')}, updated_at = NOW() WHERE user_id = ${userId};"`
      );
      
      return true;
    } catch (error) {
      console.error('GitHub 설정 업데이트 실패:', error);
      return false;
    }
  }

  /**
   * Jira 설정을 가져옵니다.
   * @param userId 사용자 ID (기본값: 1)
   * @returns Jira 설정 객체
   */
  async getJiraSettings(userId: number = DEFAULT_USER_ID): Promise<JiraSettings> {
    try {
      const { stdout } = await execPromise(
        `psql "${DATABASE_URL}" -t -c "SELECT url, email, api_token, project_key FROM jira_settings WHERE user_id = ${userId};"`
      );

      // 결과가 없으면 기본값 반환
      if (!stdout.trim()) {
        return {
          url: '',
          email: '',
          apiToken: '',
          projectKey: ''
        };
      }

      // 결과 파싱
      const [url, email, apiToken, projectKey] = stdout.trim().split('|').map(item => item.trim());

      return {
        url: url || '',
        email: email || '',
        apiToken: apiToken || '',
        projectKey: projectKey || ''
      };
    } catch (error) {
      console.error('Jira 설정 조회 실패:', error);
      // 오류 시 기본값 반환
      return {
        url: '',
        email: '',
        apiToken: '',
        projectKey: ''
      };
    }
  }

  /**
   * Jira 설정을 업데이트합니다.
   * @param settings 새 설정 값
   * @param userId 사용자 ID (기본값: 1)
   * @returns 성공 여부
   */
  async updateJiraSettings(settings: Partial<JiraSettings>, userId: number = DEFAULT_USER_ID): Promise<boolean> {
    try {
      // 업데이트할 필드 구성
      const updateFields = [];
      
      if (settings.url !== undefined) {
        updateFields.push(`url = '${settings.url}'`);
      }
      
      if (settings.email !== undefined) {
        updateFields.push(`email = '${settings.email}'`);
      }
      
      if (settings.apiToken !== undefined) {
        updateFields.push(`api_token = '${settings.apiToken}'`);
      }
      
      if (settings.projectKey !== undefined) {
        updateFields.push(`project_key = '${settings.projectKey}'`);
      }
      
      if (updateFields.length === 0) {
        return true; // 업데이트할 필드가 없으면 성공으로 간주
      }
      
      // 쿼리 실행
      await execPromise(
        `psql "${DATABASE_URL}" -c "UPDATE jira_settings SET ${updateFields.join(', ')}, updated_at = NOW() WHERE user_id = ${userId};"`
      );
      
      return true;
    } catch (error) {
      console.error('Jira 설정 업데이트 실패:', error);
      return false;
    }
  }
} 