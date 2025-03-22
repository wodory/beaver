/**
 * 데이터베이스에서 토큰 데이터를 안전하게 추출하는 유틸리티
 * 데이터베이스 타입에 따라 다른 방식으로 토큰 데이터를 추출합니다.
 */
import { getDB, DB_TYPE, getDBAdapter } from '../db/index.js';
import { sql } from 'drizzle-orm';

// 쿼리 결과 타입 정의
interface QueryResult {
  [key: string]: any;
}

/**
 * 설정에서 GitHub 토큰을 데이터베이스 레벨에서 안전하게 추출합니다.
 * 
 * @param userId 사용자 ID
 * @returns 추출된 GitHub 토큰 또는 undefined
 */
export async function getGitHubTokenFromSettings(userId: number): Promise<string | undefined> {
  try {
    const dbAdapter = getDBAdapter();
    const db = getDB();
    
    if (DB_TYPE === 'postgresql') {
      // PostgreSQL: JSON 데이터에서 직접 토큰 필드를 추출
      try {
        // 먼저 직접 토큰 필드만 추출하는 쿼리 시도
        const tokenQuery = `
            SELECT jsonb_path_query_first(data, '$.accounts[*] ? (@.type == "github").token') as token
            FROM settings 
            WHERE type = 'accounts' AND user_id = ${userId} 
            LIMIT 1
          `;
        console.log('[DEBUG] GitHub 토큰 필드 직접 추출 쿼리:', tokenQuery);
        const tokenResult = await dbAdapter.query(tokenQuery) as QueryResult[];
        
        // 토큰 필드가 직접 추출된 경우
        if (tokenResult && Array.isArray(tokenResult) && tokenResult.length > 0 && 
            tokenResult[0]?.token && typeof tokenResult[0].token === 'string') {
          console.log('[DEBUG] PostgreSQL에서 직접 토큰 필드 추출 성공');
          return tokenResult[0].token;
        }
        
        // 직접 추출 실패한 경우, GitHub 데이터 전체 추출 후 처리
        const query = `
            SELECT jsonb_path_query(data, '$.accounts[*] ? (@.type == "github")') as github_data
            FROM settings 
            WHERE type = 'accounts' AND user_id = ${userId} 
            LIMIT 1
          `;
        console.log('[DEBUG] 실행할 GitHub 설정 조회 쿼리:', query);
        const result = await dbAdapter.query(query) as QueryResult[];
        
        if (result && Array.isArray(result) && result.length > 0 && result[0]?.github_data) {
          const tokenValue = result[0].github_data.token;
          if (typeof tokenValue === 'string') {
            return tokenValue;
          } else if (tokenValue !== undefined) {
            // 문자열이 아닌 경우 안전하게 변환
            try {
              return String(tokenValue);
            } catch (e) {
              console.warn('[WARN] GitHub 토큰 문자열 변환 실패:', e);
            }
          }
        }
      } catch (dbError) {
        console.error('[ERROR] PostgreSQL 토큰 추출 중 오류:', dbError);
      }
    } else if (DB_TYPE === 'sqlite') {
      // SQLite: 전체 데이터를 가져와 JS에서 처리
      const result = await db.execute(`
        SELECT data FROM settings 
        WHERE type = ? AND user_id = ? 
        LIMIT 1
      `, ['accounts', userId]) as QueryResult[];
      
      if (result && Array.isArray(result) && result.length > 0 && result[0]?.data) {
        try {
          let data = result[0].data;
          // 문자열인 경우 객체로 파싱
          if (typeof data === 'string') {
            data = JSON.parse(data);
          }
          
          if (data.accounts && Array.isArray(data.accounts)) {
            const githubAccount = data.accounts.find((acc: { type: string }) => acc.type === 'github');
            if (githubAccount) {
              if (typeof githubAccount.token === 'string') {
                return githubAccount.token;
              } else if (githubAccount.token !== undefined) {
                // 문자열이 아닌 경우 안전하게 변환
                try {
                  return String(githubAccount.token);
                } catch (e) {
                  console.warn('[WARN] GitHub 토큰 문자열 변환 실패:', e);
                }
              }
            }
          }
        } catch (parseError) {
          console.error('[ERROR] SQLite 데이터 파싱 중 오류:', parseError);
        }
      }
    } else {
      console.warn(`지원되지 않는 데이터베이스 타입: ${DB_TYPE}`);
    }
    
    return undefined;
  } catch (error) {
    console.error('GitHub 토큰 추출 중 오류 발생:', error);
    return undefined;
  }
}

/**
 * 설정에서 GitHub Enterprise 토큰을 데이터베이스 레벨에서 안전하게 추출합니다.
 * 
 * @param userId 사용자 ID
 * @returns 추출된 GitHub Enterprise 토큰 또는 undefined
 */
export async function getGitHubEnterpriseTokenFromSettings(userId: number): Promise<string | undefined> {
  try {
    const dbAdapter = getDBAdapter();
    const db = getDB();
    
    if (DB_TYPE === 'postgresql') {
      // PostgreSQL: JSON 데이터에서 직접 토큰 필드를 추출
      try {
        // 먼저 직접 토큰 필드만 추출하는 쿼리 시도
        const tokenQuery = `
            SELECT jsonb_path_query_first(data, '$.accounts[*] ? (@.type == "github_enterprise").token') as token
            FROM settings 
            WHERE type = 'accounts' AND user_id = ${userId} 
            LIMIT 1
          `;
        console.log('[DEBUG] GitHub Enterprise 토큰 필드 직접 추출 쿼리:', tokenQuery);
        const tokenResult = await dbAdapter.query(tokenQuery) as QueryResult[];
        
        // 토큰 필드가 직접 추출된 경우
        if (tokenResult && Array.isArray(tokenResult) && tokenResult.length > 0 && 
            tokenResult[0]?.token && typeof tokenResult[0].token === 'string') {
          console.log('[DEBUG] PostgreSQL에서 직접 Enterprise 토큰 필드 추출 성공');
          return tokenResult[0].token;
        }
        
        // 직접 추출 실패한 경우, GitHub Enterprise 데이터 전체 추출 후 처리
        const query = `
            SELECT jsonb_path_query(data, '$.accounts[*] ? (@.type == "github_enterprise")') as enterprise_data
            FROM settings 
            WHERE type = 'accounts' AND user_id = ${userId} 
            LIMIT 1
          `;
        console.log('[DEBUG] 실행할 GitHub Enterprise 설정 조회 쿼리:', query);
        const result = await dbAdapter.query(query) as QueryResult[];
        
        if (result && Array.isArray(result) && result.length > 0 && result[0]?.enterprise_data) {
          const tokenValue = result[0].enterprise_data.token;
          if (typeof tokenValue === 'string') {
            return tokenValue;
          } else if (tokenValue !== undefined) {
            // 문자열이 아닌 경우 안전하게 변환
            try {
              return String(tokenValue);
            } catch (e) {
              console.warn('[WARN] GitHub Enterprise 토큰 문자열 변환 실패:', e);
            }
          }
        }
      } catch (dbError) {
        console.error('[ERROR] PostgreSQL Enterprise 토큰 추출 중 오류:', dbError);
      }
    } else if (DB_TYPE === 'sqlite') {
      // SQLite: 전체 데이터를 가져와 JS에서 처리
      const result = await db.execute(`
        SELECT data FROM settings 
        WHERE type = ? AND user_id = ? 
        LIMIT 1
      `, ['accounts', userId]) as QueryResult[];
      
      if (result && Array.isArray(result) && result.length > 0 && result[0]?.data) {
        try {
          let data = result[0].data;
          // 문자열인 경우 객체로 파싱
          if (typeof data === 'string') {
            data = JSON.parse(data);
          }
          
          if (data.accounts && Array.isArray(data.accounts)) {
            const enterpriseAccount = data.accounts.find((acc: { type: string }) => acc.type === 'github_enterprise');
            if (enterpriseAccount) {
              if (typeof enterpriseAccount.token === 'string') {
                return enterpriseAccount.token;
              } else if (enterpriseAccount.token !== undefined) {
                // 문자열이 아닌 경우 안전하게 변환
                try {
                  return String(enterpriseAccount.token);
                } catch (e) {
                  console.warn('[WARN] GitHub Enterprise 토큰 문자열 변환 실패:', e);
                }
              }
            }
          }
        } catch (parseError) {
          console.error('[ERROR] SQLite 데이터 파싱 중 오류:', parseError);
        }
      }
    } else {
      console.warn(`지원되지 않는 데이터베이스 타입: ${DB_TYPE}`);
    }
    
    return undefined;
  } catch (error) {
    console.error('GitHub Enterprise 토큰 추출 중 오류 발생:', error);
    return undefined;
  }
}

/**
 * 설정에서 토큰을 안전하게 추출합니다.
 * 
 * @param result DB 쿼리 결과
 * @param fieldPath 필드 경로 (예: 'token', 'github_data.token')
 * @returns 추출된 문자열 토큰 또는 undefined
 */
export function extractTokenFromResult(result: any, fieldPath: string): string | undefined {
  if (!result) return undefined;
  
  try {
    // 경로를 점(.)으로 분리
    const parts = fieldPath.split('.');
    let value = result;
    
    // 점 표기법으로 중첩된 필드에 접근
    for (const part of parts) {
      if (!value || typeof value !== 'object') return undefined;
      value = value[part];
    }
    
    // 토큰이 객체일 경우 문자열로 변환
    if (value && typeof value === 'object' && value.token) {
      return String(value.token);
    }
    
    // 문자열이 아닌 경우 문자열로 변환
    if (value !== undefined) {
      return value ? String(value) : undefined;
    }
    
    return undefined;
  } catch (error) {
    console.error('토큰 추출 중 오류 발생:', error);
    return undefined;
  }
}

/**
 * PostgreSQL 데이터베이스에서 안전하게 설정 데이터의 특정 JSON 필드를 문자열로 추출합니다.
 * 
 * @param type 설정 타입 (예: 'github', 'accounts')
 * @param userId 사용자 ID
 * @param jsonPath JSON 경로 (예: '$.token', '$.accounts[*].token')
 * @returns 추출된 문자열 값 또는 undefined
 */
export async function extractJsonFieldAsString(
  type: string, 
  userId: number, 
  jsonPath: string
): Promise<string | undefined> {
  if (DB_TYPE !== 'postgresql') {
    console.warn('extractJsonFieldAsString은 PostgreSQL에서만 지원됩니다.');
    return undefined;
  }
  
  try {
    const db = getDB();
    const result = await db.execute(sql`
      SELECT jsonb_path_query_first(data, ${jsonPath}) as value
      FROM settings
      WHERE type = ${type} AND user_id = ${userId}
      LIMIT 1
    `);
    
    if (result && result.length > 0 && result[0]?.value !== undefined) {
      const value = result[0].value;
      
      // 문자열인 경우 바로 반환
      if (typeof value === 'string') {
        return value;
      }
      
      // 객체나 다른 타입인 경우 안전하게 문자열로 변환
      try {
        if (value !== null) {
          return String(value);
        }
      } catch (e) {
        console.error('JSON 필드 문자열 변환 실패:', e);
      }
    }
    
    return undefined;
  } catch (error) {
    console.error('PostgreSQL JSON 필드 추출 중 오류:', error);
    return undefined;
  }
} 