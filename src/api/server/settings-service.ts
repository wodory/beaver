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
import { getGitHubTokenFromSettings, getGitHubEnterpriseTokenFromSettings } from '../../utils/token-extractor.js';

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
        // PostgreSQL - 문자열 쿼리 직접 사용
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
      console.log('[INFO] GitHub 설정 조회 중...');
      
      // 안전한 토큰 추출 유틸리티 사용
      const token = await getGitHubTokenFromSettings(userId);
      
      // 계정 설정에서 GitHub 계정 정보 조회
      const dbAdapter = getDBAdapter();
      let result;
      
      if (DB_TYPE === 'postgresql') {
        const query = `
          SELECT jsonb_path_query(data, '$.accounts[*] ? (@.type == "github")') as github_data
          FROM settings 
          WHERE type = 'accounts' AND user_id = ${userId} 
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 GitHub 설정 조회 쿼리:', query);
        result = await dbAdapter.query(query);
      } else if (DB_TYPE === 'sqlite') {
        // SQLite: 전체 데이터를 가져와 JS에서 처리
        const settings = await this.getAccountsSettings(userId);
        const githubAccount = settings.accounts.find(account => account.type === 'github');
        
        if (githubAccount) {
          return {
            username: githubAccount.username || '',
            token: token || githubAccount.token || '',
            url: githubAccount.url || '',
            apiUrl: githubAccount.apiUrl || 'https://api.github.com'
          };
        }
      } else {
        console.warn(`지원되지 않는 데이터베이스 타입: ${DB_TYPE}`);
      }
      
      if (result && Array.isArray(result) && result.length > 0) {
        try {
          // PostgreSQL 결과 처리
          if (DB_TYPE === 'postgresql') {
            const githubData = result[0].github_data;
            if (githubData) {
              console.log('[INFO] GitHub 설정 로드됨:', { 
                username: githubData.username || '미설정',
                token: token ? '설정됨' : '미설정',
                url: githubData.url || '미설정',
                apiUrl: githubData.apiUrl || 'https://api.github.com'
              });
              
              return {
                username: githubData.username || '',
                // 안전하게 추출한 토큰 사용
                token: token || '',
                url: githubData.url || '',
                apiUrl: githubData.apiUrl || 'https://api.github.com'
              };
            }
          }
          
          // DB 자료 처리
          const data = result[0].data ? JSON.parse(result[0].data) : {};
          
          return {
            username: data.username || '',
            token: token || data.token || '',
            url: data.url || '',
            apiUrl: data.apiUrl || 'https://api.github.com'
          };
        } catch (parseError) {
          console.error('GitHub 설정 JSON 파싱 실패:', parseError);
          return this.getDefaultGitHubSettings();
        }
      }
      
      // 설정이 없거나 파싱 실패 시 기본값 반환
      return this.getDefaultGitHubSettings();
    } catch (error) {
      console.error('GitHub 설정 조회 실패:', error);
      return this.getDefaultGitHubSettings();
    }
  }
  
  /**
   * 기본 GitHub 설정을 반환합니다.
   * @returns 기본 GitHub 설정 객체
   */
  getDefaultGitHubSettings(): GitHubSettings {
    return {
      username: '',
      token: '',
      url: '',
      apiUrl: 'https://api.github.com'
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
      const dbAdapter = getDBAdapter();
      
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
        checkResult = await dbAdapter.query(checkQuery);
      } else {
        const db = getDB();
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
          await dbAdapter.query(updateQuery);
        } else {
          const db = getDB();
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
          await dbAdapter.query(insertQuery);
        } else {
          const db = getDB();
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
      // userId를 문자열로 변환
      const userIdStr = String(userId);
      let result;
      
      // 기존 enterpriseToken이 있으면 함께 사용
      let enterpriseToken: string | undefined;
      
      // Enterprise 토큰 값이 이미 있는지 확인
      try {
        const tokenResult = await getGitHubEnterpriseTokenFromSettings(userId);
        enterpriseToken = tokenResult;
      } catch (tokenError) {
        console.warn('GitHub Enterprise 토큰 조회 실패:', tokenError);
      }
      
      // 데이터베이스 타입에 따라 다른 쿼리 실행
      if (DB_TYPE === 'postgresql') {
        const query = `
          SELECT 
            jsonb_path_query_first(data, '$.accounts[*] ? (@.type == "github_enterprise")') as enterprise_data
          FROM settings 
          WHERE type = 'accounts' AND user_id = ${userIdStr} 
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 GitHub Enterprise 설정 조회 쿼리:', query);
        const dbAdapter = getDBAdapter();
        result = await dbAdapter.query(query);
      } else if (DB_TYPE === 'sqlite') {
        // SQLite: 전체 데이터를 가져와 JS에서 처리
        const settings = await this.getAccountsSettings(userIdStr);
        // Account 타입의 enterpriseAccount에서 안전하게 값 추출
        const enterpriseAccount = settings.accounts.find(account => account.type === 'github_enterprise');
        
        if (enterpriseAccount) {
          // additionalInfo를 통해 Account 인터페이스에 없는 속성에 안전하게 접근
          // org 속성은 Account 타입에 있으므로 직접 접근 가능
          const orgValue = enterpriseAccount.org || '';
          
          // additionalInfo 객체를 통해 확장 필드에 접근
          const additionalInfo = enterpriseAccount.additionalInfo || {};
          const repositoriesValue = Array.isArray(additionalInfo.repositories) ? 
                                  additionalInfo.repositories : [];
          const domainsValue = Array.isArray(additionalInfo.domains) ? 
                             additionalInfo.domains : [];
          
          // 결과 객체 구성
          return {
            enterpriseToken: enterpriseToken || enterpriseAccount.token || '',
            enterpriseUrl: enterpriseAccount.apiUrl || '',
            enterpriseOrganization: orgValue,
            organization: orgValue,
            repositories: repositoriesValue,
            domains: domainsValue
          };
        }
      } else {
        console.warn(`지원되지 않는 데이터베이스 타입: ${DB_TYPE}`);
      }
      
      if (result && Array.isArray(result) && result.length > 0) {
        try {
          // PostgreSQL 결과 처리
          if (DB_TYPE === 'postgresql') {
            const enterpriseData = result[0].enterprise_data;
            if (enterpriseData) {
              console.log('[INFO] GitHub Enterprise 설정 로드됨:', {
                enterpriseToken: enterpriseToken ? '설정됨' : '미설정',
                enterpriseUrl: enterpriseData.apiUrl || '미설정',
                enterpriseOrganization: typeof enterpriseData.organization === 'string' ? enterpriseData.organization : '미설정',
                organization: typeof enterpriseData.organization === 'string' ? enterpriseData.organization : '미설정'
              });
              
              // enterpriseData에서 안전하게 속성 추출
              const orgValue = enterpriseData.organization || '';
              const repositoriesValue = Array.isArray(enterpriseData.repositories) ? 
                                      enterpriseData.repositories : [];
              const domainsValue = Array.isArray(enterpriseData.domains) ? 
                                  enterpriseData.domains : [];
              
              return {
                // 안전하게 추출한 토큰 사용
                enterpriseToken: enterpriseToken || '',
                enterpriseUrl: enterpriseData.apiUrl || '',
                enterpriseOrganization: orgValue,
                organization: orgValue,
                repositories: repositoriesValue,
                domains: domainsValue
              };
            }
          }
          
          const data = result[0].data ? JSON.parse(result[0].data) : {};
          
          return {
            enterpriseToken: enterpriseToken || data.enterpriseToken || '',
            enterpriseUrl: data.enterpriseUrl || '',
            enterpriseOrganization: data.enterpriseOrganization || '',
            organization: data.organization || '',
            repositories: data.repositories || [],
            domains: data.domains || []
          };
        } catch (parseError) {
          console.error('GitHub Enterprise 설정 JSON 파싱 실패:', parseError);
          return this.getDefaultGitHubEnterpriseSettings();
        }
      }
      
      // 설정이 없거나 파싱 실패 시 기본값 반환
      return this.getDefaultGitHubEnterpriseSettings();
    } catch (error) {
      console.error('GitHub Enterprise 설정 조회 실패:', error);
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
      const dbAdapter = getDBAdapter();
      
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
        checkResult = await dbAdapter.query(checkQuery);
      } else {
        const db = getDB();
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
          await dbAdapter.query(updateQuery);
        } else {
          const db = getDB();
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
          await dbAdapter.query(insertQuery);
        } else {
          const db = getDB();
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
   * Jira 설정을 가져옵니다.
   * @param userId 사용자 ID (기본값: 1)
   * @returns Jira 설정 객체
   */
  async getJiraSettings(userId: number = DEFAULT_USER_ID): Promise<JiraSettings> {
    try {
      const db = getDB();
      const dbAdapter = getDBAdapter();
      
      let result: any[] = [];
      
      if (DB_TYPE === 'postgresql') {
        // PostgreSQL - 문자열 쿼리 직접 사용
        const query = `
          SELECT "data" FROM "settings" 
          WHERE "type" = 'jira' AND "user_id" = ${userId} 
          LIMIT 1
        `;
        console.log('[DEBUG] 실행할 Jira 설정 조회 쿼리:', query);
        result = await dbAdapter.query(query);
      } else {
        // SQLite
        result = await db.execute(`
          SELECT data FROM settings 
          WHERE type = ? AND user_id = ? 
          LIMIT 1
        `, ['jira', userId]);
      }
      
      if (result && Array.isArray(result) && result.length > 0) {
        try {
          let data: any;
          
          // PostgreSQL은 첫 번째 행의 data 필드에서 설정 조회
          if (DB_TYPE === 'postgresql') {
            data = result[0].data;
          } else {
            // SQLite는 첫 번째 행의 data 필드에서 설정 조회 후 JSON 파싱
            data = JSON.parse(result[0].data);
          }
          
          return {
            url: data.url || '',
            email: data.email || '',
            apiToken: data.apiToken || '',
            projectKey: data.projectKey || ''
          };
        } catch (parseError) {
          console.error('Jira 설정 JSON 파싱 실패:', parseError);
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
   * 기본 Jira 설정을 반환합니다.
   * @returns 기본 Jira 설정 객체
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
   * Jira 설정을 업데이트합니다.
   * @param settings 새 설정 값
   * @param userId 사용자 ID (기본값: 1)
   * @returns 성공 여부
   */
  async updateJiraSettings(settings: Partial<JiraSettings>, userId: number = DEFAULT_USER_ID): Promise<boolean> {
    try {
      const dbAdapter = getDBAdapter();
      
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
        checkResult = await dbAdapter.query(checkQuery);
      } else {
        const db = getDB();
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
          await dbAdapter.query(updateQuery);
        } else {
          const db = getDB();
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
          await dbAdapter.query(insertQuery);
        } else {
          const db = getDB();
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
   * 
   * @param userId 사용자 ID (기본값: 1)
   * @returns 계정 설정 정보
   */
  async getAccountsSettings(userId: number | string = DEFAULT_USER_ID): Promise<AccountsSettings> {
    try {
      console.log('[INFO] 계정 설정 조회 중...');
      const userIdStr = typeof userId === 'number' ? String(userId) : userId;
      // 항상 DB에서 최신 데이터 가져오기 (캐싱 비활성화)
      const dbAdapter = getDBAdapter();
      console.log(`[DEBUG] DB 연결 타입: ${DB_TYPE}`);
      
      let result: any[] = [];
      
      console.log('[DEBUG] PostgreSQL 쿼리 실행');
      // sql 태그드 템플릿이 아닌 execute 메서드 사용
      const query = `
        SELECT "data" FROM "settings" 
        WHERE "type" = 'accounts' AND "user_id" = ${userIdStr}
        LIMIT 1
      `;
      console.log('[DEBUG] 실행할 쿼리:', query);
      result = await dbAdapter.query(query);
      
      console.log('[DEBUG] DB 쿼리 결과:', result);
      
      if (result && Array.isArray(result) && result.length > 0) {
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
      const dbAdapter = getDBAdapter();
      
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
        checkResult = await dbAdapter.query(checkQuery);
      } else {
        const db = getDB();
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
          await dbAdapter.query(updateQuery);
        } else {
          const db = getDB();
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
          await dbAdapter.query(insertQuery);
        } else {
          const db = getDB();
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