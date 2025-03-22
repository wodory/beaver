/**
 * 설정 관리 서버 서비스
 * 
 * 데이터베이스에서 설정 정보를 가져오고 저장하는 서비스입니다.
 */
import { UserSettings, GitHubSettings, GitHubEnterpriseSettings, JiraSettings, DomainSettings, AccountsSettings } from '../../types/settings.js';
import { getDB, DB_TYPE, getDBAdapter } from '../../db/index.js';
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

// 기본 사용자 ID
const DEFAULT_USER_ID = 1;

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
      const db = getDB();
      const dbAdapter = getDBAdapter();
      
      // 실제 SQL 쿼리 실행 (Drizzle은 type safe query builder이지만, 
      // 여기서는 단순화를 위해 직접 SQL을 사용합니다)
      let result;
      
      if (DB_TYPE === 'postgresql') {
        // PostgreSQL - 어댑터 쿼리 메소드 사용
        const query = `SELECT "data" FROM "settings" WHERE "type" = 'user' AND "user_id" = ${userId} LIMIT 1`;
        console.log('[DEBUG] 실행할 사용자 설정 쿼리:', query);
        result = await dbAdapter.query(query);
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
          console.log('[DEBUG] 파싱된 사용자 설정 데이터 로드됨', data);
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
  async updateUserSettings(settings: Partial<UserSettings>, userId: number = DEFAULT_USER_ID): Promise<boolean> {
    try {
      const db = getDB();
      const dbAdapter = getDBAdapter();
      
      // 현재 설정 조회
      const currentSettings = await this.getUserSettings(userId);
      
      // 새 설정과 병합
      const updatedSettings = { ...currentSettings, ...settings };
      
      // 설정이 이미 존재하는지 확인
      let checkResult;
      
      if (DB_TYPE === 'postgresql') {
        const checkQuery = `SELECT "id" FROM "settings" WHERE "type" = 'user' AND "user_id" = ${userId} LIMIT 1`;
        console.log('[DEBUG] 실행할 사용자 설정 확인 쿼리:', checkQuery);
        checkResult = await dbAdapter.query(checkQuery);
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
          await dbAdapter.query(updateQuery);
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
          await dbAdapter.query(insertQuery);
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
  async getGitHubSettings(userId: number = DEFAULT_USER_ID): Promise<GitHubSettings> {
    try {
      const db = getDB();
      
      let result;
      if (DB_TYPE === 'postgresql') {
        // PostgreSQL에서는 JSONB 경로 쿼리를 사용하여 계정 설정에서 GitHub 타입의 계정 정보를 검색
        const query = `
          SELECT jsonb_path_query(data, '$.accounts[*] ? (@.type == "github")') as github_data
          FROM settings 
          WHERE type = 'accounts' AND user_id = ${userId} 
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 GitHub 설정 조회 쿼리:', query);
        result = await db.execute(query);
      } else {
        // SQLite 등의 다른 DB에서는 계정 설정을 조회한 후 JavaScript에서 처리
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = 'accounts' AND user_id = ? 
          LIMIT 1
        `, [userId]);
      }
      
      // 결과 로깅
      console.log(`[DEBUG] getGitHubSettings 결과: ${JSON.stringify(result)}`);
      
      // 계정 설정이 있는 경우
      if (result && result.length > 0) {
        try {
          const data = typeof result[0].data === 'string' 
            ? JSON.parse(result[0].data) 
            : result[0].data;
          
          // PostgreSQL 케이스: github_data 필드에서 정보 추출
          if (result[0].github_data) {
            const githubAccount = typeof result[0].github_data === 'string'
              ? JSON.parse(result[0].github_data)
              : result[0].github_data;
            
            return {
              token: githubAccount.token || '',
              organization: githubAccount.org || '',
              repositories: []
            };
          }
          
          // SQLite 등: data에서 github 계정 검색
          if (data.accounts && Array.isArray(data.accounts)) {
            const githubAccount = data.accounts.find((acc: { type: string }) => acc.type === 'github');
            
            if (githubAccount) {
              return {
                token: githubAccount.token || '',
                organization: githubAccount.org || '',
                repositories: []
              };
            }
          }
          
          // 계정 설정은 있지만 GitHub 계정은 없는 경우
          console.log('[DEBUG] 계정 설정에서 GitHub 계정을 찾을 수 없습니다.');
          return this.getDefaultGitHubSettings();
        } catch (parseError) {
          console.error('GitHub 설정 데이터 파싱 중 오류 발생:', parseError);
          return this.getDefaultGitHubSettings();
        }
      }
      
      // 기존 방식으로 시도: github 타입으로 직접 조회
      console.log('[DEBUG] 계정 설정에서 GitHub 정보를 찾지 못했습니다. 직접 조회를 시도합니다.');
      
      if (DB_TYPE === 'postgresql') {
        const query = `
          SELECT "data" FROM "settings" 
          WHERE "type" = 'github' AND "user_id" = ${userId} 
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 GitHub 직접 조회 쿼리:', query);
        result = await db.execute(query);
      } else {
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['github', userId]);
      }
      
      console.log(`[DEBUG] GitHub 직접 조회 결과: ${JSON.stringify(result)}`);
      
      if (result && result.length > 0) {
        try {
          const data = typeof result[0].data === 'string' 
            ? JSON.parse(result[0].data) 
            : result[0].data;
          
          return {
            token: data.token || '',
            organization: data.organization || '',
            repositories: data.repositories || []
          };
        } catch (parseError) {
          console.error('GitHub 설정 데이터 파싱 중 오류 발생:', parseError);
          return this.getDefaultGitHubSettings();
        }
      }
      
      // 설정이 없는 경우 기본값 반환
      console.log('[DEBUG] GitHub 설정이 없습니다. 기본값을 반환합니다.');
      return this.getDefaultGitHubSettings();
    } catch (error) {
      console.error('GitHub 설정 조회 중 오류 발생:', error);
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
      repositories: []
    };
  }

  /**
   * GitHub 설정을 업데이트합니다.
   * @param settings 새 설정 값
   * @param userId 사용자 ID (기본값: 1)
   * @returns 성공 여부
   */
  async updateGitHubSettings(settings: Partial<GitHubSettings>, userId: number = DEFAULT_USER_ID): Promise<boolean> {
    try {
      const db = getDB();
      
      // 현재 설정 조회
      const currentSettings = await this.getGitHubSettings(userId);
      
      // 새 설정과 병합
      const updatedSettings = { 
        ...currentSettings, 
        ...settings
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
   * GitHub Enterprise 설정을 가져옵니다.
   * @param userId 사용자 ID (기본값: 1)
   * @returns GitHub Enterprise 설정 객체
   */
  async getGitHubEnterpriseSettings(userId: number = DEFAULT_USER_ID): Promise<GitHubEnterpriseSettings> {
    try {
      const db = getDB();
      
      let result;
      if (DB_TYPE === 'postgresql') {
        // PostgreSQL에서는 JSONB 경로 쿼리를 사용하여 계정 설정에서 GitHub Enterprise 타입의 계정 정보를 검색
        const query = `
          SELECT jsonb_path_query(data, '$.accounts[*] ? (@.type == "github_enterprise")') as enterprise_data
          FROM settings 
          WHERE type = 'accounts' AND user_id = ${userId} 
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 GitHub Enterprise 설정 조회 쿼리:', query);
        result = await db.execute(query);
      } else {
        // SQLite 등의 다른 DB에서는 계정 설정을 조회한 후 JavaScript에서 처리
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = 'accounts' AND user_id = ? 
          LIMIT 1
        `, [userId]);
      }
      
      // 결과 로깅
      console.log(`[DEBUG] getGitHubEnterpriseSettings 결과: ${JSON.stringify(result)}`);
      
      // 계정 설정이 있는 경우
      if (result && result.length > 0) {
        try {
          const data = typeof result[0].data === 'string' 
            ? JSON.parse(result[0].data) 
            : result[0].data;
          
          // PostgreSQL 케이스: enterprise_data 필드에서 정보 추출
          if (result[0].enterprise_data) {
            const enterpriseAccount = typeof result[0].enterprise_data === 'string'
              ? JSON.parse(result[0].enterprise_data)
              : result[0].enterprise_data;
            
            return {
              enterpriseToken: enterpriseAccount.token || '',
              enterpriseUrl: enterpriseAccount.apiUrl || enterpriseAccount.url || '',
              enterpriseOrganization: enterpriseAccount.org || '',
              organization: enterpriseAccount.org || '',
              repositories: [],
              domains: []
            };
          }
          
          // SQLite 등: data에서 github_enterprise 계정 검색
          if (data.accounts && Array.isArray(data.accounts)) {
            const enterpriseAccount = data.accounts.find((acc: { type: string }) => acc.type === 'github_enterprise');
            
            if (enterpriseAccount) {
              return {
                enterpriseToken: enterpriseAccount.token || '',
                enterpriseUrl: enterpriseAccount.apiUrl || enterpriseAccount.url || '',
                enterpriseOrganization: enterpriseAccount.org || '',
                organization: enterpriseAccount.org || '',
                repositories: [],
                domains: []
              };
            }
          }
          
          // 계정 설정은 있지만 GitHub Enterprise 계정은 없는 경우
          console.log('[DEBUG] 계정 설정에서 GitHub Enterprise 계정을 찾을 수 없습니다.');
          return this.getDefaultGitHubEnterpriseSettings();
        } catch (parseError) {
          console.error('GitHub Enterprise 설정 데이터 파싱 중 오류 발생:', parseError);
          return this.getDefaultGitHubEnterpriseSettings();
        }
      }
      
      // 기존 방식으로 시도: github_enterprise 타입으로 직접 조회
      console.log('[DEBUG] 계정 설정에서 GitHub Enterprise 정보를 찾지 못했습니다. 직접 조회를 시도합니다.');
      
      if (DB_TYPE === 'postgresql') {
        const query = `
          SELECT "data" FROM "settings" 
          WHERE "type" = 'github_enterprise' AND "user_id" = ${userId} 
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 GitHub Enterprise 직접 조회 쿼리:', query);
        result = await db.execute(query);
      } else {
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['github_enterprise', userId]);
      }
      
      console.log(`[DEBUG] GitHub Enterprise 직접 조회 결과: ${JSON.stringify(result)}`);
      
      if (result && result.length > 0) {
        try {
          const data = typeof result[0].data === 'string' 
            ? JSON.parse(result[0].data) 
            : result[0].data;
          
          return {
            enterpriseToken: data.enterpriseToken || '',
            enterpriseUrl: data.enterpriseUrl || '',
            enterpriseOrganization: data.enterpriseOrganization || '',
            organization: data.organization || '',
            repositories: data.repositories || [],
            domains: data.domains || []
          };
        } catch (parseError) {
          console.error('GitHub Enterprise 설정 데이터 파싱 중 오류 발생:', parseError);
          return this.getDefaultGitHubEnterpriseSettings();
        }
      }
      
      // 설정이 없는 경우 기본값 반환
      console.log('[DEBUG] GitHub Enterprise 설정이 없습니다. 기본값을 반환합니다.');
      return this.getDefaultGitHubEnterpriseSettings();
    } catch (error) {
      console.error('GitHub Enterprise 설정 조회 중 오류 발생:', error);
      return this.getDefaultGitHubEnterpriseSettings();
    }
  }
  
  /**
   * 기본 GitHub Enterprise 설정을 반환합니다.
   * @returns 기본 GitHub Enterprise 설정
   */
  getDefaultGitHubEnterpriseSettings(): GitHubEnterpriseSettings {
    return {
      enterpriseToken: '',
      enterpriseUrl: '',
      enterpriseOrganization: '',
      organization: '',
      repositories: [],
      domains: domains // config.json에서 로드한 도메인 정보 추가
    };
  }

  /**
   * GitHub Enterprise 설정을 업데이트합니다.
   * @param settings 새 설정 값
   * @param userId 사용자 ID (기본값: 1)
   * @returns 성공 여부
   */
  async updateGitHubEnterpriseSettings(settings: Partial<GitHubEnterpriseSettings>, userId: number = DEFAULT_USER_ID): Promise<boolean> {
    try {
      const db = getDB();
      
      // 현재 설정 조회
      const currentSettings = await this.getGitHubEnterpriseSettings(userId);
      
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
          WHERE "type" = 'github_enterprise' AND "user_id" = ${userId} 
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 확인 쿼리:', checkQuery);
        checkResult = await db.execute(checkQuery);
      } else {
        checkResult = await db.execute(`
          SELECT id FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['github_enterprise', userId]);
      }
      
      // JSON 데이터 준비
      const jsonData = JSON.stringify(updatedSettings);
      
      if (checkResult && checkResult.length > 0) {
        // 업데이트
        if (DB_TYPE === 'postgresql') {
          const escapedJsonData = jsonData.replace(/'/g, "''");
          
          const updateQuery = `
            UPDATE "settings" 
            SET "data" = '${escapedJsonData}'::jsonb, "updated_at" = NOW() 
            WHERE "type" = 'github_enterprise' AND "user_id" = ${userId}
          `;
          console.log('[DEBUG] 실행할 업데이트 쿼리 (데이터 길이):', updateQuery.length);
          await db.execute(updateQuery);
        } else {
          await db.execute(`
            UPDATE settings 
            SET data = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE type = ? AND user_id = ?
          `, [jsonData, 'github_enterprise', userId]);
        }
      } else {
        // 삽입
        if (DB_TYPE === 'postgresql') {
          const escapedJsonData = jsonData.replace(/'/g, "''");
          
          const insertQuery = `
            INSERT INTO "settings" ("type", "user_id", "data", "created_at", "updated_at") 
            VALUES ('github_enterprise', ${userId}, '${escapedJsonData}'::jsonb, NOW(), NOW())
          `;
          console.log('[DEBUG] 실행할 삽입 쿼리 (데이터 길이):', insertQuery.length);
          await db.execute(insertQuery);
        } else {
          await db.execute(`
            INSERT INTO settings (type, user_id, data, created_at, updated_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, ['github_enterprise', userId, jsonData]);
        }
      }
      
      return true;
    } catch (error) {
      console.error('GitHub Enterprise 설정 업데이트 실패:', error);
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
  async getJiraSettings(userId: number = DEFAULT_USER_ID): Promise<JiraSettings> {
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
  async updateJiraSettings(settings: Partial<JiraSettings>, userId: number = DEFAULT_USER_ID): Promise<boolean> {
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
  async getAccountsSettings(userId: number = DEFAULT_USER_ID): Promise<AccountsSettings> {
    console.log(`[DEBUG] getAccountsSettings 메서드 호출됨 (userId: ${userId})`);
    try {
      // 항상 DB에서 최신 데이터 가져오기 (캐싱 비활성화)
      const db = getDB();
      console.log(`[DEBUG] DB 연결 타입: ${DB_TYPE}`);
      
      let result;
      
      console.log('[DEBUG] PostgreSQL 쿼리 실행');
      // sql 태그드 템플릿이 아닌 execute 메서드 사용
      const query = `
        SELECT "data" FROM "settings" 
        WHERE "type" = 'accounts' AND "user_id" = ${userId}
        LIMIT 1
      `;
      console.log('[DEBUG] 실행할 쿼리:', query);
      result = await db.execute(query);
      
      console.log('[DEBUG] DB 쿼리 결과:', result);
      
      if (result && result.length > 0) {
        // 항상 JSON.parse 실행 - PostgreSQL에서도 문자열로 저장/변환되어 있을 수 있음
        try {
          const rawData = result[0].data;
          console.log('[DEBUG] 원본 데이터 타입:', typeof rawData);
          
          const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
          console.log('[DEBUG] 파싱된 계정 설정 데이터 로드됨');
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
  async updateAccountsSettings(settings: Partial<AccountsSettings>, userId: number = DEFAULT_USER_ID): Promise<boolean> {
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