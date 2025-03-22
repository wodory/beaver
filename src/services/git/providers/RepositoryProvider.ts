import { getDB } from '../../../db/index.js';
import { sql } from 'drizzle-orm';
import { RepositoryInfo } from '../IGitServiceAdapter';
import { logger } from '../../../utils/logger.js';

/**
 * 저장소 정보 제공자 클래스
 * 
 * DB로부터 저장소 정보를 조회하고 관리하는 책임을 가집니다.
 */
export class RepositoryProvider {
  /**
   * 특정 저장소의 정보를 가져옵니다.
   * 
   * @param repoId 저장소 ID
   * @returns 저장소 정보 또는 null (존재하지 않는 경우)
   */
  async getRepository(repoId: number): Promise<RepositoryInfo | null> {
    try {
      const db = getDB();
      if (!db) {
        throw new Error('데이터베이스가 초기화되지 않았습니다.');
      }

      // Drizzle ORM을 사용하여 저장소 조회
      const result = await db.execute(
        sql`SELECT * FROM repositories WHERE id = ${repoId}`
      );
      
      if (result && result.length > 0) {
        return this.mapRepositoryResult(result[0]);
      }
      
      logger.warn(`저장소를 찾을 수 없습니다 (ID: ${repoId})`);
      return null;
    } catch (error) {
      logger.error(`저장소 정보 조회 중 오류 발생 (ID: ${repoId}):`, error);
      throw error;
    }
  }
  
  /**
   * 모든 저장소 목록을 가져옵니다.
   * 
   * @returns 저장소 정보 배열
   */
  async getAllRepositories(): Promise<RepositoryInfo[]> {
    try {
      const db = getDB();
      if (!db) {
        throw new Error('데이터베이스가 초기화되지 않았습니다.');
      }
      
      // 모든 저장소 조회
      const result = await db.execute(
        sql`SELECT * FROM repositories ORDER BY name ASC`
      );
      
      if (result && result.length > 0) {
        return result.map(this.mapRepositoryResult);
      }
      
      return [];
    } catch (error) {
      logger.error('모든 저장소 정보 조회 중 오류 발생:', error);
      throw error;
    }
  }
  
  /**
   * 데이터가 없는 저장소 목록을 조회합니다.
   * 
   * @returns 데이터가 없는 저장소 정보 배열
   */
  async getRepositoriesWithoutData(): Promise<RepositoryInfo[]> {
    try {
      const db = getDB();
      if (!db) {
        throw new Error('데이터베이스가 초기화되지 않았습니다.');
      }
      
      // 커밋이 없는 저장소 조회
      const result = await db.execute(sql`
        SELECT r.* FROM repositories r
        LEFT JOIN (
          SELECT repository_id, COUNT(*) as commit_count 
          FROM commits 
          GROUP BY repository_id
        ) c ON r.id = c.repository_id
        WHERE c.commit_count IS NULL OR c.commit_count = 0
        ORDER BY r.name ASC
      `);
      
      if (result && result.length > 0) {
        return result.map(this.mapRepositoryResult);
      }
      
      return [];
    } catch (error) {
      logger.error('데이터가 없는 저장소 조회 중 오류 발생:', error);
      throw error;
    }
  }
  
  /**
   * 저장소의 마지막 동기화 시간을 초기화합니다.
   * 
   * @param repoId 저장소 ID
   */
  async resetLastSyncAt(repoId: number): Promise<void> {
    try {
      const db = getDB();
      if (!db) {
        throw new Error('데이터베이스가 초기화되지 않았습니다.');
      }
      
      // 마지막 동기화 시간 초기화
      await db.execute(sql`
        UPDATE repositories
        SET last_sync_at = NULL
        WHERE id = ${repoId}
      `);
      
      logger.info(`저장소 마지막 동기화 시간 초기화 완료 (ID: ${repoId})`);
    } catch (error) {
      logger.error(`저장소 마지막 동기화 시간 초기화 중 오류 발생 (ID: ${repoId}):`, error);
      throw error;
    }
  }
  
  /**
   * DB 결과를 RepositoryInfo 객체로 매핑합니다.
   * 
   * @param result DB 조회 결과
   * @returns 저장소 정보 객체
   */
  private mapRepositoryResult(result: any): RepositoryInfo {
    return {
      id: result.id,
      name: result.name,
      fullName: result.full_name,
      cloneUrl: result.clone_url,
      type: result.type,
      apiUrl: result.api_url,
      lastSyncAt: result.last_sync_at
    };
  }
} 