/**
 * 설정 관리 서버 서비스
 * 
 * 데이터베이스에서 설정 정보를 가져오고 저장하는 서비스입니다.
 */
import { UserSettings, GitHubSettings, JiraSettings, DomainSettings, AccountsSettings } from '../../types/settings.js';
import { getDB, DB_TYPE } from '../../db/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// config.json에서 도메인 정보 로드
let domains: DomainSettings[] = [];
try {
  const configPath = path.resolve(__dirname, '../../../src/config.json');
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    domains = configData.domain || [];
    console.log('도메인 정보를 config.json에서 로드했습니다.');
  }
} catch (error) {
  console.error('config.json 로드 중 오류 발생:', error);
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
  async getUserSettings(userId: number = 1): Promise<UserSettings> {
    try {
      const db = getDB();
      
      // 실제 SQL 쿼리 실행 (Drizzle은 type safe query builder이지만, 
      // 여기서는 단순화를 위해 직접 SQL을 사용합니다)
      let result;
      
      if (DB_TYPE === 'postgresql') {
        // PostgreSQL - unsafe 메서드를 사용하여 raw 쿼리 실행
        const query = `SELECT "data" FROM "settings" WHERE "type" = 'user' AND "user_id" = ${userId} LIMIT 1`;
        console.log('[DEBUG] 실행할 사용자 설정 쿼리:', query);
        result = await db.unsafe(query);
      } else {
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['user', userId]);
      }
      
      if (result && result.length > 0) {
        // 항상 JSON.parse 실행 - PostgreSQL에서도 문자열로 저장/변환되어 있을 수 있음
        try {
          const rawData = result[0].data;
          const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
          return data as UserSettings;
        } catch (e) {
          console.warn('사용자 설정 JSON 파싱 실패, 원본 데이터 사용:', e);
          return result[0].data;
        }
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
        const checkQuery = `SELECT "id" FROM "settings" WHERE "type" = 'user' AND "user_id" = ${userId} LIMIT 1`;
        console.log('[DEBUG] 실행할 사용자 설정 확인 쿼리:', checkQuery);
        checkResult = await db.unsafe(checkQuery);
      } else {
        checkResult = await db.execute(`
          SELECT id FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['user', userId]);
      }
      
      // JSON 데이터 준비 - 모든 DB에서 문자열로 저장
      const jsonData = JSON.stringify(updatedSettings);
      
      if (checkResult && checkResult.length > 0) {
        // 업데이트
        if (DB_TYPE === 'postgresql') {
          // JSON 데이터의 작은 따옴표 escape 처리
          const escapedJsonData = jsonData.replace(/'/g, "''");
          
          const updateQuery = `
            UPDATE "settings" 
            SET "data" = '${escapedJsonData}'::jsonb, "updated_at" = NOW() 
            WHERE "type" = 'user' AND "user_id" = ${userId}
          `;
          console.log('[DEBUG] 실행할 사용자 설정 업데이트 쿼리 (데이터 길이):', updateQuery.length);
          await db.unsafe(updateQuery);
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
          // JSON 데이터의 작은 따옴표 escape 처리
          const escapedJsonData = jsonData.replace(/'/g, "''");
          
          const insertQuery = `
            INSERT INTO "settings" ("type", "user_id", "data", "created_at", "updated_at") 
            VALUES ('user', ${userId}, '${escapedJsonData}'::jsonb, NOW(), NOW())
          `;
          console.log('[DEBUG] 실행할 사용자 설정 삽입 쿼리 (데이터 길이):', insertQuery.length);
          await db.unsafe(insertQuery);
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
        const query = `
          SELECT "data" FROM "settings" 
          WHERE "type" = 'github' AND "user_id" = ${userId} 
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 GitHub 설정 조회 쿼리:', query);
        result = await db.execute(query);
      } else {
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['github', userId]);
      }
      
      // 결과 로깅
      console.log(`[DEBUG] getGitHubSettings 결과: ${JSON.stringify(result)}`);
      
      if (result && result.length > 0) {
        try {
          const data = typeof result[0].data === 'string' 
            ? JSON.parse(result[0].data) 
            : result[0].data;
          
          // 로드된 도메인 정보 추가
          return {
            ...data,
            domains: domains // config.json에서 로드한 도메인 정보 추가
          };
        } catch (parseError) {
          console.error('GitHub 설정 파싱 실패:', parseError);
          return this.getDefaultGitHubSettings();
        }
      }
      
      return this.getDefaultGitHubSettings();
    } catch (error) {
      console.error('GitHub 설정 조회 실패:', error);
      return this.getDefaultGitHubSettings();
    }
  }
  
  /**
   * 기본 GitHub 설정을 반환합니다.
   * @returns 기본 GitHub 설정
   */
  getDefaultGitHubSettings(): GitHubSettings {
    return {
      token: '',
      organization: '',
      repositories: [],
      domains: domains // config.json에서 로드한 도메인 정보 추가
    };
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
      
      // 도메인 정보는 클라이언트에서 업데이트하지 않음
      const { domains: _, ...settingsWithoutDomains } = settings;
      
      // 새 설정과 병합
      const updatedSettings = { 
        ...currentSettings, 
        ...settingsWithoutDomains,
        domains: undefined // 도메인 정보는 DB에 저장하지 않음
      };
      
      // 설정이 이미 존재하는지 확인
      let checkResult;
      
      if (DB_TYPE === 'postgresql') {
        const checkQuery = `
          SELECT "id" FROM "settings" 
          WHERE "type" = 'github' AND "user_id" = ${userId} 
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 확인 쿼리:', checkQuery);
        checkResult = await db.execute(checkQuery);
      } else {
        checkResult = await db.execute(`
          SELECT id FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['github', userId]);
      }
      
      // JSON 데이터 준비
      const jsonData = JSON.stringify(updatedSettings);
      
      if (checkResult && checkResult.length > 0) {
        // 업데이트
        if (DB_TYPE === 'postgresql') {
          // JSON 데이터에 따옴표가 
          // 포함되어 있으므로 SQL 인젝션 방지를 위해 escape 처리
          const escapedJsonData = jsonData.replace(/'/g, "''");
          
          const updateQuery = `
            UPDATE "settings" 
            SET "data" = '${escapedJsonData}'::jsonb, "updated_at" = NOW() 
            WHERE "type" = 'github' AND "user_id" = ${userId}
          `;
          console.log('[DEBUG] 실행할 업데이트 쿼리 (데이터 길이):', updateQuery.length);
          await db.execute(updateQuery);
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
          // JSON 데이터에 따옴표가 
          // 포함되어 있으므로 SQL 인젝션 방지를 위해 escape 처리
          const escapedJsonData = jsonData.replace(/'/g, "''");
          
          const insertQuery = `
            INSERT INTO "settings" ("type", "user_id", "data", "created_at", "updated_at") 
            VALUES ('github', ${userId}, '${escapedJsonData}'::jsonb, NOW(), NOW())
          `;
          console.log('[DEBUG] 실행할 삽입 쿼리 (데이터 길이):', insertQuery.length);
          await db.execute(insertQuery);
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
   * 기본 Jira 설정을 반환합니다.
   * @returns 기본 Jira 설정
   */
  getDefaultJiraSettings(): JiraSettings {
    return {
      url: '',
      email: '',
      apiToken: '',
      projectKey: ''
    };
  }

  /**
   * Jira 설정을 조회합니다.
   * @param userId 사용자 ID (기본값: 1)
   * @returns Jira 설정
   */
  async getJiraSettings(userId: number = 1): Promise<JiraSettings> {
    try {
      const db = getDB();
      
      let result;
      if (DB_TYPE === 'postgresql') {
        const query = `
          SELECT "data" FROM "settings" 
          WHERE "type" = 'jira' AND "user_id" = ${userId} 
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 Jira 설정 조회 쿼리:', query);
        result = await db.execute(query);
      } else {
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['jira', userId]);
      }
      
      // 결과 로깅
      console.log(`[DEBUG] getJiraSettings 결과: ${JSON.stringify(result)}`);
      
      if (result && result.length > 0) {
        try {
          const data = typeof result[0].data === 'string' 
            ? JSON.parse(result[0].data) 
            : result[0].data;
          
          // 데이터 유효성 확인 및 기본값 적용
          return {
            url: data.url || '',
            email: data.email || '',
            apiToken: data.apiToken || '',
            projectKey: data.projectKey || ''
          };
        } catch (parseError) {
          console.error('Jira 설정 파싱 실패:', parseError);
          return this.getDefaultJiraSettings();
        }
      }
      
      return this.getDefaultJiraSettings();
    } catch (error) {
      console.error('Jira 설정 조회 실패:', error);
      return this.getDefaultJiraSettings();
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
        const checkQuery = `
          SELECT "id" FROM "settings" 
          WHERE "type" = 'jira' AND "user_id" = ${userId} 
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 확인 쿼리:', checkQuery);
        checkResult = await db.execute(checkQuery);
      } else {
        checkResult = await db.execute(`
          SELECT id FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['jira', userId]);
      }
      
      // JSON 데이터 준비
      const jsonData = JSON.stringify(updatedSettings);
      
      if (checkResult && checkResult.length > 0) {
        // 업데이트
        if (DB_TYPE === 'postgresql') {
          // JSON 데이터에 따옴표가 
          // 포함되어 있으므로 SQL 인젝션 방지를 위해 escape 처리
          const escapedJsonData = jsonData.replace(/'/g, "''");
          
          const updateQuery = `
            UPDATE "settings" 
            SET "data" = '${escapedJsonData}'::jsonb, "updated_at" = NOW() 
            WHERE "type" = 'jira' AND "user_id" = ${userId}
          `;
          console.log('[DEBUG] 실행할 업데이트 쿼리 (데이터 길이):', updateQuery.length);
          await db.execute(updateQuery);
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
          // JSON 데이터에 따옴표가 
          // 포함되어 있으므로 SQL 인젝션 방지를 위해 escape 처리
          const escapedJsonData = jsonData.replace(/'/g, "''");
          
          const insertQuery = `
            INSERT INTO "settings" ("type", "user_id", "data", "created_at", "updated_at") 
            VALUES ('jira', ${userId}, '${escapedJsonData}'::jsonb, NOW(), NOW())
          `;
          console.log('[DEBUG] 실행할 삽입 쿼리 (데이터 길이):', insertQuery.length);
          await db.execute(insertQuery);
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

  /**
   * 계정 설정을 가져옵니다.
   * @param userId 사용자 ID (기본값: 1)
   * @returns 계정 설정 객체
   */
  async getAccountsSettings(userId: number = 1): Promise<AccountsSettings> {
    console.log(`[DEBUG] getAccountsSettings 메서드 호출됨 (userId: ${userId})`);
    try {
      const db = getDB();
      console.log(`[DEBUG] DB 연결 타입: ${DB_TYPE}`);
      
      let result;
      
      if (DB_TYPE === 'postgresql') {
        console.log('[DEBUG] PostgreSQL 쿼리 실행');
        // sql 태그드 템플릿이 아닌 execute 메서드 사용
        const query = `
          SELECT "data" FROM "settings" 
          WHERE "type" = 'accounts' AND "user_id" = ${userId}
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 쿼리:', query);
        result = await db.execute(query);
      } else {
        console.log('[DEBUG] SQLite 쿼리 실행');
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['accounts', userId]);
      }
      
      console.log('[DEBUG] DB 쿼리 결과:', result);
      
      if (result && result.length > 0) {
        // 항상 JSON.parse 실행 - PostgreSQL에서도 문자열로 저장/변환되어 있을 수 있음
        try {
          const rawData = result[0].data;
          console.log('[DEBUG] 원본 데이터 타입:', typeof rawData);
          console.log('[DEBUG] 원본 데이터:', rawData);
          
          const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
          console.log('[DEBUG] 파싱된 데이터:', data);
          return data as AccountsSettings;
        } catch (e) {
          console.warn('[DEBUG] 계정 설정 JSON 파싱 실패, 원본 데이터 사용:', e);
          return result[0].data;
        }
      }
      
      console.log('[DEBUG] DB에서 설정을 찾을 수 없음, 기본값 반환');
      // 설정이 없으면 기본값 반환
      return {
        accounts: [],
        repositories: []
      };
    } catch (error) {
      console.error('[DEBUG] 계정 설정 조회 실패:', error);
      // 오류 발생 시 기본값 반환
      return {
        accounts: [],
        repositories: []
      };
    }
  }

  /**
   * 계정 설정을 업데이트합니다.
   * @param settings 새 설정 값
   * @param userId 사용자 ID (기본값: 1)
   * @returns 성공 여부
   */
  async updateAccountsSettings(settings: Partial<AccountsSettings>, userId: number = 1): Promise<boolean> {
    try {
      const db = getDB();
      
      // 현재 설정 조회
      const currentSettings = await this.getAccountsSettings(userId);
      
      // 새 설정과 병합
      const updatedSettings = { 
        ...currentSettings, 
        ...settings,
        accounts: settings.accounts || currentSettings.accounts,
        repositories: settings.repositories || currentSettings.repositories
      };
      
      // 설정이 이미 존재하는지 확인
      let checkResult;
      
      if (DB_TYPE === 'postgresql') {
        // execute 사용하여 raw 쿼리 실행
        const checkQuery = `
          SELECT "id" FROM "settings" 
          WHERE "type" = 'accounts' AND "user_id" = ${userId}
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 확인 쿼리:', checkQuery);
        checkResult = await db.execute(checkQuery);
      } else {
        checkResult = await db.execute(`
          SELECT id FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['accounts', userId]);
      }
      
      // JSON 데이터 준비 - 모든 DB에서 문자열로 저장
      const jsonData = JSON.stringify(updatedSettings);
      
      if (checkResult && checkResult.length > 0) {
        // 업데이트
        if (DB_TYPE === 'postgresql') {
          // JSON 데이터에 따옴표가
          // 포함되어 있으므로 SQL 인젝션 방지를 위해 escape 처리
          // PostgreSQL의 escape_literal 함수와 같은 효과를 내기 위해
          // 작은 따옴표를 두 개로 치환
          const escapedJsonData = jsonData.replace(/'/g, "''");
          
          const updateQuery = `
            UPDATE "settings" 
            SET "data" = '${escapedJsonData}'::jsonb, "updated_at" = NOW() 
            WHERE "type" = 'accounts' AND "user_id" = ${userId}
          `;
          console.log('[DEBUG] 실행할 업데이트 쿼리 (데이터 길이):', updateQuery.length);
          await db.execute(updateQuery);
        } else {
          await db.execute(`
            UPDATE settings 
            SET data = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE type = ? AND user_id = ?
          `, [jsonData, 'accounts', userId]);
        }
      } else {
        // 삽입
        if (DB_TYPE === 'postgresql') {
          // JSON 데이터에 따옴표가
          // 포함되어 있으므로 SQL 인젝션 방지를 위해 escape 처리
          const escapedJsonData = jsonData.replace(/'/g, "''");
          
          const insertQuery = `
            INSERT INTO "settings" ("type", "user_id", "data", "created_at", "updated_at") 
            VALUES ('accounts', ${userId}, '${escapedJsonData}'::jsonb, NOW(), NOW())
          `;
          console.log('[DEBUG] 실행할 삽입 쿼리 (데이터 길이):', insertQuery.length);
          await db.execute(insertQuery);
        } else {
          await db.execute(`
            INSERT INTO settings (type, user_id, data, created_at, updated_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, ['accounts', userId, jsonData]);
        }
      }
      
      return true;
    } catch (error) {
      console.error('계정 설정 업데이트 실패:', error);
      return false;
    }
  }
} 