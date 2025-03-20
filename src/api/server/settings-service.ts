/**
 * 설정 관리 서버 서비스
 * 
 * 데이터베이스에서 설정 정보를 가져오고 저장하는 서비스입니다.
 */
import { UserSettings, GitHubSettings, JiraSettings } from '../../types/settings.js';
import { getDB, DB_TYPE } from '../../db/index.js';

/**
 * 설정 서비스 클래스
 */
export class SettingsService {
  /**
   * 사용자 설정을 가져옵니다.
   * @param userId 사용자 ID (기본값: 1)
   * @returns 사용자 설정 객체
   */
  async getUserSettings(userId: number = 1): Promise<UserSettings> {
    try {
      const db = getDB();
      
      // 실제 SQL 쿼리 실행 (Drizzle은 type safe query builder이지만, 
      // 여기서는 단순화를 위해 직접 SQL을 사용합니다)
      let result;
      
      if (DB_TYPE === 'postgresql') {
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = $1 AND user_id = $2 
          LIMIT 1
        `, ['user', userId]);
      } else {
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['user', userId]);
      }
      
      if (result && result.length > 0) {
        // PostgreSQL은 data를 JSON으로 저장하고, SQLite는 TEXT로 저장하므로
        // SQLite에서는 JSON.parse가 필요할 수 있습니다
        const data = DB_TYPE === 'sqlite' 
          ? JSON.parse(result[0].data) 
          : result[0].data;
          
        return data as UserSettings;
      }
      
      // 설정이 없으면 기본값 반환
      return {
        notificationsEnabled: true,
        darkModeEnabled: false,
        autoUpdateEnabled: true,
        refreshInterval: 10,
        language: 'ko',
      };
    } catch (error) {
      console.error('사용자 설정 조회 실패:', error);
      // 오류 발생 시 기본값 반환
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
   * @param settings 새 설정 값
   * @param userId 사용자 ID (기본값: 1)
   * @returns 성공 여부
   */
  async updateUserSettings(settings: Partial<UserSettings>, userId: number = 1): Promise<boolean> {
    try {
      const db = getDB();
      
      // 현재 설정 조회
      const currentSettings = await this.getUserSettings(userId);
      
      // 새 설정과 병합
      const updatedSettings = { ...currentSettings, ...settings };
      
      // 설정이 이미 존재하는지 확인
      let checkResult;
      
      if (DB_TYPE === 'postgresql') {
        checkResult = await db.execute(`
          SELECT id FROM settings 
          WHERE type = $1 AND user_id = $2 
          LIMIT 1
        `, ['user', userId]);
      } else {
        checkResult = await db.execute(`
          SELECT id FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['user', userId]);
      }
      
      // JSON 데이터 준비 - SQLite는 문자열로 저장
      const jsonData = DB_TYPE === 'sqlite' 
        ? JSON.stringify(updatedSettings) 
        : updatedSettings;
      
      if (checkResult && checkResult.length > 0) {
        // 업데이트
        if (DB_TYPE === 'postgresql') {
          await db.execute(`
            UPDATE settings 
            SET data = $1, updated_at = NOW() 
            WHERE type = $2 AND user_id = $3
          `, [jsonData, 'user', userId]);
        } else {
          await db.execute(`
            UPDATE settings 
            SET data = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE type = ? AND user_id = ?
          `, [jsonData, 'user', userId]);
        }
      } else {
        // 삽입
        if (DB_TYPE === 'postgresql') {
          await db.execute(`
            INSERT INTO settings (type, user_id, data, created_at, updated_at) 
            VALUES ($1, $2, $3, NOW(), NOW())
          `, ['user', userId, jsonData]);
        } else {
          await db.execute(`
            INSERT INTO settings (type, user_id, data, created_at, updated_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, ['user', userId, jsonData]);
        }
      }
      
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
  async getGitHubSettings(userId: number = 1): Promise<GitHubSettings> {
    try {
      const db = getDB();
      
      let result;
      
      if (DB_TYPE === 'postgresql') {
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = $1 AND user_id = $2 
          LIMIT 1
        `, ['github', userId]);
      } else {
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['github', userId]);
      }
      
      if (result && result.length > 0) {
        const data = DB_TYPE === 'sqlite' 
          ? JSON.parse(result[0].data) 
          : result[0].data;
          
        return data as GitHubSettings;
      }
      
      // 설정이 없으면 기본값 반환
      return {
        token: '',
        organization: '',
        repositories: [],
      };
    } catch (error) {
      console.error('GitHub 설정 조회 실패:', error);
      // 오류 발생 시 기본값 반환
      return {
        token: '',
        organization: '',
        repositories: [],
      };
    }
  }

  /**
   * GitHub 설정을 업데이트합니다.
   * @param settings 새 설정 값
   * @param userId 사용자 ID (기본값: 1)
   * @returns 성공 여부
   */
  async updateGitHubSettings(settings: Partial<GitHubSettings>, userId: number = 1): Promise<boolean> {
    try {
      const db = getDB();
      
      // 현재 설정 조회
      const currentSettings = await this.getGitHubSettings(userId);
      
      // 새 설정과 병합
      const updatedSettings = { ...currentSettings, ...settings };
      
      // 설정이 이미 존재하는지 확인
      let checkResult;
      
      if (DB_TYPE === 'postgresql') {
        checkResult = await db.execute(`
          SELECT id FROM settings 
          WHERE type = $1 AND user_id = $2 
          LIMIT 1
        `, ['github', userId]);
      } else {
        checkResult = await db.execute(`
          SELECT id FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['github', userId]);
      }
      
      // JSON 데이터 준비
      const jsonData = DB_TYPE === 'sqlite' 
        ? JSON.stringify(updatedSettings) 
        : updatedSettings;
      
      if (checkResult && checkResult.length > 0) {
        // 업데이트
        if (DB_TYPE === 'postgresql') {
          await db.execute(`
            UPDATE settings 
            SET data = $1, updated_at = NOW() 
            WHERE type = $2 AND user_id = $3
          `, [jsonData, 'github', userId]);
        } else {
          await db.execute(`
            UPDATE settings 
            SET data = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE type = ? AND user_id = ?
          `, [jsonData, 'github', userId]);
        }
      } else {
        // 삽입
        if (DB_TYPE === 'postgresql') {
          await db.execute(`
            INSERT INTO settings (type, user_id, data, created_at, updated_at) 
            VALUES ($1, $2, $3, NOW(), NOW())
          `, ['github', userId, jsonData]);
        } else {
          await db.execute(`
            INSERT INTO settings (type, user_id, data, created_at, updated_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, ['github', userId, jsonData]);
        }
      }
      
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
  async getJiraSettings(userId: number = 1): Promise<JiraSettings> {
    try {
      const db = getDB();
      
      let result;
      
      if (DB_TYPE === 'postgresql') {
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = $1 AND user_id = $2 
          LIMIT 1
        `, ['jira', userId]);
      } else {
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['jira', userId]);
      }
      
      if (result && result.length > 0) {
        const data = DB_TYPE === 'sqlite' 
          ? JSON.parse(result[0].data) 
          : result[0].data;
          
        return data as JiraSettings;
      }
      
      // 설정이 없으면 기본값 반환
      return {
        url: '',
        email: '',
        apiToken: '',
        projectKey: '',
      };
    } catch (error) {
      console.error('Jira 설정 조회 실패:', error);
      // 오류 발생 시 기본값 반환
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
   * @param settings 새 설정 값
   * @param userId 사용자 ID (기본값: 1)
   * @returns 성공 여부
   */
  async updateJiraSettings(settings: Partial<JiraSettings>, userId: number = 1): Promise<boolean> {
    try {
      const db = getDB();
      
      // 현재 설정 조회
      const currentSettings = await this.getJiraSettings(userId);
      
      // 새 설정과 병합
      const updatedSettings = { ...currentSettings, ...settings };
      
      // 설정이 이미 존재하는지 확인
      let checkResult;
      
      if (DB_TYPE === 'postgresql') {
        checkResult = await db.execute(`
          SELECT id FROM settings 
          WHERE type = $1 AND user_id = $2 
          LIMIT 1
        `, ['jira', userId]);
      } else {
        checkResult = await db.execute(`
          SELECT id FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['jira', userId]);
      }
      
      // JSON 데이터 준비
      const jsonData = DB_TYPE === 'sqlite' 
        ? JSON.stringify(updatedSettings) 
        : updatedSettings;
      
      if (checkResult && checkResult.length > 0) {
        // 업데이트
        if (DB_TYPE === 'postgresql') {
          await db.execute(`
            UPDATE settings 
            SET data = $1, updated_at = NOW() 
            WHERE type = $2 AND user_id = $3
          `, [jsonData, 'jira', userId]);
        } else {
          await db.execute(`
            UPDATE settings 
            SET data = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE type = ? AND user_id = ?
          `, [jsonData, 'jira', userId]);
        }
      } else {
        // 삽입
        if (DB_TYPE === 'postgresql') {
          await db.execute(`
            INSERT INTO settings (type, user_id, data, created_at, updated_at) 
            VALUES ($1, $2, $3, NOW(), NOW())
          `, ['jira', userId, jsonData]);
        } else {
          await db.execute(`
            INSERT INTO settings (type, user_id, data, created_at, updated_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, ['jira', userId, jsonData]);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Jira 설정 업데이트 실패:', error);
      return false;
    }
  }
} 