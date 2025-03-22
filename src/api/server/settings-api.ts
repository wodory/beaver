/**
 * 설정 API 엔드포인트
 */
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SettingsService } from './settings-service.js';
import { UserSettings, GitHubSettings, GitHubEnterpriseSettings, JiraSettings, AccountsSettings } from '../../types/settings.js';
import { getDB } from '../../db/index.js';
import { schemaToUse as schema } from '../../db/index.js';
import { eq, count } from 'drizzle-orm';
import { SyncManager } from '../../services/git/SyncManager.js';
import { logger } from '../../utils/logger.js';

// 기본 사용자 ID (현재는 단일 사용자 시스템)
const DEFAULT_USER_ID = 1;

/**
 * 요청 파라미터 인터페이스
 */
interface IdParams {
  userId?: string;
}

// 저장소 DB 레코드 타입 정의
interface RepositoryRecord {
  id: number;
  name: string;
  fullName: string;
  cloneUrl: string;
  localPath?: string;
  type: string;
  apiUrl?: string;
  apiToken?: string;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SettingsService 인스턴스 생성
 */
const settingsService = new SettingsService();

/**
 * 저장소 테이블 업데이트 함수
 * @param accountsSettings 계정 설정 정보
 */
async function updateRepositoriesTable(accountsSettings: AccountsSettings) {
  try {
    const db = getDB();
    
    // 기존 저장소 정보 확인
    const existingRepos = await db.select().from(schema.repositories) as RepositoryRecord[];
    
    logger.info(`기존 저장소 테이블에 ${existingRepos.length}개의 저장소가 있습니다.`);
    
    // 설정에 있는 저장소의 fullName 목록
    const configRepoFullNames = accountsSettings.repositories.map(repo => repo.fullName);
    logger.info('설정에 있는 저장소 목록:', configRepoFullNames);
    
    // 설정에 없는 저장소 삭제 및 관련 데이터 정리
    for (const existingRepo of existingRepos) {
      if (!configRepoFullNames.includes(existingRepo.fullName)) {
        logger.info(`설정에 없는 저장소 삭제: ${existingRepo.fullName} (ID: ${existingRepo.id})`);
        
        try {
          // 관련 데이터 삭제 (cascading delete 설정이 되어 있어도 확실하게 하기 위해)
          await db.delete(schema.commits)
            .where(eq(schema.commits.repositoryId, existingRepo.id))
            .execute();
          
          await db.delete(schema.pullRequests)
            .where(eq(schema.pullRequests.repositoryId, existingRepo.id))
            .execute();
          
          // 마지막으로 저장소 자체 삭제
          await db.delete(schema.repositories)
            .where(eq(schema.repositories.id, existingRepo.id))
            .execute();
          
          logger.info(`저장소 ${existingRepo.fullName} 및 관련 데이터 삭제 완료`);
        } catch (error) {
          logger.error(`저장소 ${existingRepo.fullName} 삭제 중 오류 발생:`, error);
        }
      }
    }
    
    // 저장소 정보 순회하며 업데이트 또는 추가
    for (const repo of accountsSettings.repositories) {
      // 저장소 이름에서 소유자/이름 추출
      const fullName = repo.fullName;
      const nameOnly = repo.name || fullName.split('/').pop() || fullName;
      
      // 같은 fullName을 가진 저장소가 이미 있는지 확인
      const existingRepo = existingRepos.find(r => r.fullName === fullName);
      
      // API URL 및 토큰 설정
      const ownerAccount = repo.ownerReference ? 
        accountsSettings.accounts.find(a => a.id === repo.owner) : null;
      
      const apiUrl = ownerAccount?.apiUrl || '';
      const apiToken = ownerAccount?.token || '';
      
      try {
        if (existingRepo) {
          // 기존 저장소 업데이트
          logger.info(`저장소 업데이트: ${fullName}`);
          
          await db.update(schema.repositories)
            .set({
              name: nameOnly,
              cloneUrl: repo.url,
              type: repo.type,
              apiUrl: apiUrl,
              apiToken: apiToken,
              updatedAt: new Date()
            })
            .where(eq(schema.repositories.fullName, fullName));
        } else {
          // 새 저장소 추가
          logger.info(`저장소 추가: ${fullName}`);
          
          const result = await db.insert(schema.repositories)
            .values({
              name: nameOnly,
              fullName: fullName,
              cloneUrl: repo.url,
              type: repo.type,
              apiUrl: apiUrl,
              apiToken: apiToken,
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .returning();
          
          // 신규 저장소의 데이터 수집 시작 (백그라운드로 처리)
          const newRepoId = result[0].id;
          logger.info(`새로운 저장소 ${fullName} (ID: ${newRepoId})의 데이터 수집 시작`);
          
          // 비동기로 데이터 수집 시작 (Promise 대기하지 않음)
          syncRepositoryData(newRepoId, apiToken, apiUrl).catch(error => {
            logger.error(`새 저장소 ${fullName} 데이터 수집 중 오류 발생:`, error);
          });
        }
      } catch (error) {
        logger.error(`저장소 ${fullName} 처리 중 오류 발생:`, error);
      }
    }
    
    return true;
  } catch (error) {
    logger.error('저장소 테이블 업데이트 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 저장소 데이터 동기화 함수 (백그라운드 작업용)
 */
async function syncRepositoryData(repoId: number, apiToken?: string, apiUrl?: string): Promise<void> {
  try {
    logger.info(`저장소 ID ${repoId} 데이터 동기화 시작`);
    
    // 동기화 시작 시간 기록
    const startTime = new Date();
    
    // 저장소 정보 확인
    const db = getDB();
    const repository = await db.query.repositories.findFirst({
      where: eq(schema.repositories.id, repoId)
    });
    
    if (!repository) {
      logger.error(`저장소 ID ${repoId}을 찾을 수 없습니다.`);
      return;
    }
    
    // API URL과 토큰 확인 (명시적으로 전달된 것이 없으면 저장소에서 가져옴)
    const tokenToUse = apiToken || repository.apiToken;
    const urlToUse = apiUrl || repository.apiUrl;
    
    // 토큰이 없는 경우 로그 남김
    if (!tokenToUse) {
      logger.warn(`저장소 ID ${repoId} (${repository.fullName}) 동기화 시 API 토큰이 설정되지 않았습니다.`);
    }
    
    if (urlToUse) {
      logger.info(`저장소 ID ${repoId} API URL: ${urlToUse}`);
    }
    
    // 동기화 이력 레코드 생성
    try {
      await db.execute(`
        INSERT INTO sync_history (repository_id, start_time, status, created_at)
        VALUES ($1, $2, 'running', $3)
      `, [repoId, startTime.toISOString(), new Date().toISOString()]);
      
      logger.info(`저장소 ID ${repoId} 동기화 이력 생성 완료`);
    } catch (historyError) {
      // 동기화 이력 테이블이 없는 경우 오류 로그만 남기고 계속 진행
      logger.error(`저장소 ID ${repoId} 동기화 이력 생성 실패:`, historyError);
    }
    
    // 동기화 관리자 초기화
    const syncManager = new SyncManager();
    
    // 동기화 실행
    try {
      await syncManager.syncRepository(repoId);
      logger.info(`저장소 ID ${repoId} 동기화 완료`);
      
      // 동기화 이력 업데이트
      try {
        await db.execute(`
          UPDATE sync_history 
          SET status = 'completed', end_time = $1, updated_at = $1
          WHERE repository_id = $2 
          AND status = 'running'
          ORDER BY created_at DESC
          LIMIT 1
        `, [new Date().toISOString(), repoId]);
      } catch (updateError) {
        logger.error(`저장소 ID ${repoId} 동기화 이력 업데이트 실패:`, updateError);
      }
    } catch (syncError) {
      logger.error(`저장소 ID ${repoId} 데이터 동기화 중 오류 발생:`, syncError);
      
      // 동기화 이력 오류 상태로 업데이트
      try {
        const errorMessage = syncError instanceof Error ? syncError.message : String(syncError);
        await db.execute(`
          UPDATE sync_history 
          SET status = 'failed', end_time = $1, updated_at = $1, error = $2
          WHERE repository_id = $3 
          AND status = 'running'
          ORDER BY created_at DESC
          LIMIT 1
        `, [new Date().toISOString(), errorMessage, repoId]);
      } catch (updateError) {
        logger.error(`저장소 ID ${repoId} 동기화 이력 오류 업데이트 실패:`, updateError);
      }
    }
  } catch (error) {
    logger.error(`저장소 ID ${repoId} 데이터 동기화 중 오류 발생:`, error);
  }
}

/**
 * API 엔드포인트 등록
 * @param fastify Fastify 인스턴스
 */
export async function settingsRoutes(fastify: FastifyInstance) {
  /**
   * 사용자 설정 조회 API
   */
  fastify.get('/api/settings/user/:userId?', async (request: FastifyRequest<{Params: IdParams}>, reply: FastifyReply) => {
    try {
      const userId = request.params.userId ? parseInt(request.params.userId) : DEFAULT_USER_ID;
      const settings = await settingsService.getUserSettings(userId);
      return reply.send(settings);
    } catch (error) {
      console.error('사용자 설정 조회 API 오류:', error);
      return reply.status(500).send({ error: '사용자 설정을 불러올 수 없습니다.' });
    }
  });

  /**
   * 사용자 설정 업데이트 API
   */
  fastify.post('/api/settings/user/:userId?', async (request: FastifyRequest<{Params: IdParams, Body: Partial<UserSettings>}>, reply: FastifyReply) => {
    try {
      const userId = request.params.userId ? parseInt(request.params.userId) : DEFAULT_USER_ID;
      const settings = request.body;
      const success = await settingsService.updateUserSettings(settings, userId);
      
      if (success) {
        const updatedSettings = await settingsService.getUserSettings(userId);
        return reply.send(updatedSettings);
      } else {
        return reply.status(500).send({ error: '사용자 설정을 업데이트할 수 없습니다.' });
      }
    } catch (error) {
      console.error('사용자 설정 업데이트 API 오류:', error);
      return reply.status(500).send({ error: '사용자 설정을 업데이트할 수 없습니다.' });
    }
  });

  /**
   * 계정 설정 조회 API
   */
  fastify.get('/api/settings/accounts/:userId?', async (request: FastifyRequest<{Params: IdParams}>, reply: FastifyReply) => {
    console.log('[DEBUG] 계정 설정 조회 API 호출됨', request.params);
    try {
      const userId = request.params.userId ? parseInt(request.params.userId) : DEFAULT_USER_ID;
      console.log(`[DEBUG] 사용자 ID 변환: ${userId}`);
      
      const settings = await settingsService.getAccountsSettings(userId);
      console.log('[DEBUG] 계정 설정 조회 결과:', settings);
      
      return reply.send(settings);
    } catch (error) {
      console.error('[DEBUG] 계정 설정 조회 API 오류:', error);
      return reply.status(500).send({ error: '계정 설정을 불러올 수 없습니다.' });
    }
  });

  /**
   * 계정 설정 업데이트 API
   */
  fastify.post('/api/settings/accounts/:userId?', async (request: FastifyRequest<{Params: IdParams, Body: Partial<AccountsSettings>}>, reply: FastifyReply) => {
    try {
      const userId = request.params.userId ? parseInt(request.params.userId) : DEFAULT_USER_ID;
      const settings = request.body;
      const success = await settingsService.updateAccountsSettings(settings, userId);
      
      if (success) {
        const updatedSettings = await settingsService.getAccountsSettings(userId);
        
        // repositories 테이블도 함께 업데이트
        if (settings.repositories && settings.repositories.length > 0) {
          console.log('저장소 정보가 업데이트되었습니다. repositories 테이블을 업데이트합니다.');
          await updateRepositoriesTable(updatedSettings);
        }
        
        return reply.send(updatedSettings);
      } else {
        return reply.status(500).send({ error: '계정 설정을 업데이트할 수 없습니다.' });
      }
    } catch (error) {
      console.error('계정 설정 업데이트 API 오류:', error);
      return reply.status(500).send({ error: '계정 설정을 업데이트할 수 없습니다.' });
    }
  });

  /**
   * GitHub 설정 조회 API
   */
  fastify.get('/api/settings/github/:userId?', async (request: FastifyRequest<{Params: IdParams}>, reply: FastifyReply) => {
    try {
      const userId = request.params.userId ? parseInt(request.params.userId) : DEFAULT_USER_ID;
      const settings = await settingsService.getGitHubSettings(userId);
      return reply.send(settings);
    } catch (error) {
      console.error('GitHub 설정 조회 API 오류:', error);
      return reply.status(500).send({ error: 'GitHub 설정을 불러올 수 없습니다.' });
    }
  });

  /**
   * GitHub 설정 업데이트 API
   */
  fastify.post('/api/settings/github/:userId?', async (request: FastifyRequest<{Params: IdParams, Body: Partial<GitHubSettings>}>, reply: FastifyReply) => {
    try {
      const userId = request.params.userId ? parseInt(request.params.userId) : DEFAULT_USER_ID;
      const settings = request.body;
      const success = await settingsService.updateGitHubSettings(settings, userId);
      
      if (success) {
        const updatedSettings = await settingsService.getGitHubSettings(userId);
        return reply.send(updatedSettings);
      } else {
        return reply.status(500).send({ error: 'GitHub 설정을 업데이트할 수 없습니다.' });
      }
    } catch (error) {
      console.error('GitHub 설정 업데이트 API 오류:', error);
      return reply.status(500).send({ error: 'GitHub 설정을 업데이트할 수 없습니다.' });
    }
  });

  /**
   * GitHub Enterprise 설정 조회 API
   */
  fastify.get('/api/settings/github-enterprise/:userId?', async (request: FastifyRequest<{Params: IdParams}>, reply: FastifyReply) => {
    try {
      const userId = request.params.userId ? parseInt(request.params.userId) : DEFAULT_USER_ID;
      const settings = await settingsService.getGitHubEnterpriseSettings(userId);
      return reply.send(settings);
    } catch (error) {
      console.error('GitHub Enterprise 설정 조회 API 오류:', error);
      return reply.status(500).send({ error: 'GitHub Enterprise 설정을 불러올 수 없습니다.' });
    }
  });

  /**
   * GitHub Enterprise 설정 업데이트 API
   */
  fastify.post('/api/settings/github-enterprise/:userId?', async (request: FastifyRequest<{Params: IdParams, Body: Partial<GitHubEnterpriseSettings>}>, reply: FastifyReply) => {
    try {
      const userId = request.params.userId ? parseInt(request.params.userId) : DEFAULT_USER_ID;
      const settings = request.body;
      const success = await settingsService.updateGitHubEnterpriseSettings(settings, userId);
      
      if (success) {
        const updatedSettings = await settingsService.getGitHubEnterpriseSettings(userId);
        return reply.send(updatedSettings);
      } else {
        return reply.status(500).send({ error: 'GitHub Enterprise 설정을 업데이트할 수 없습니다.' });
      }
    } catch (error) {
      console.error('GitHub Enterprise 설정 업데이트 API 오류:', error);
      return reply.status(500).send({ error: 'GitHub Enterprise 설정을 업데이트할 수 없습니다.' });
    }
  });

  /**
   * Jira 설정 조회 API
   */
  fastify.get('/api/settings/jira/:userId?', async (request: FastifyRequest<{Params: IdParams}>, reply: FastifyReply) => {
    try {
      const userId = request.params.userId ? parseInt(request.params.userId) : DEFAULT_USER_ID;
      const settings = await settingsService.getJiraSettings(userId);
      return reply.send(settings);
    } catch (error) {
      console.error('Jira 설정 조회 API 오류:', error);
      return reply.status(500).send({ error: 'Jira 설정을 불러올 수 없습니다.' });
    }
  });

  /**
   * Jira 설정 업데이트 API
   */
  fastify.post('/api/settings/jira/:userId?', async (request: FastifyRequest<{Params: IdParams, Body: Partial<JiraSettings>}>, reply: FastifyReply) => {
    try {
      const userId = request.params.userId ? parseInt(request.params.userId) : DEFAULT_USER_ID;
      const settings = request.body;
      const success = await settingsService.updateJiraSettings(settings, userId);
      
      if (success) {
        const updatedSettings = await settingsService.getJiraSettings(userId);
        return reply.send(updatedSettings);
      } else {
        return reply.status(500).send({ error: 'Jira 설정을 업데이트할 수 없습니다.' });
      }
    } catch (error) {
      console.error('Jira 설정 업데이트 API 오류:', error);
      return reply.status(500).send({ error: 'Jira 설정을 업데이트할 수 없습니다.' });
    }
  });

  /**
   * 데이터가 없는 저장소 목록 조회
   */
  fastify.get('/api/settings/repositories/without-data', async (_, reply) => {
    try {
      const syncManager = new SyncManager();
      try {
        const repositories = await syncManager.getRepositoriesWithoutData();
        
        return {
          success: true,
          repositories: repositories.map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.fullName,
            cloneUrl: repo.cloneUrl,
            type: repo.type
          }))
        };
      } catch (error) {
        // sync_history 테이블이 없는 경우나 다른 DB 오류 처리
        logger.warn('저장소 데이터 조회 중 오류 발생, 모든 저장소를 반환합니다:', error);
        
        // 대체 방법: 모든 저장소 반환
        const allRepositories = await syncManager.getAllRepositories();
        return {
          success: true,
          repositories: allRepositories.map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.fullName,
            cloneUrl: repo.cloneUrl,
            type: repo.type
          }))
        };
      }
    } catch (error) {
      logger.error('데이터가 없는 저장소 목록 조회 중 오류 발생:', error);
      return reply.code(500).send({
        success: false,
        message: `데이터가 없는 저장소 목록 조회 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  });

  /**
   * 데이터 수집 요청
   */
  fastify.post('/api/settings/repositories/:id/sync', async (request: FastifyRequest<{
    Params: { id: string }
  }>, reply) => {
    try {
      const repoId = parseInt(request.params.id, 10);
      
      // DB에서 저장소 정보 조회
      const db = getDB();
      const repository = await db.query.repositories.findFirst({
        where: eq(schema.repositories.id, repoId)
      });
      
      if (!repository) {
        return reply.code(404).send({
          success: false,
          message: `저장소 ID ${repoId}를 찾을 수 없습니다.`
        });
      }
      
      // 백그라운드로 동기화 시작
      logger.info(`저장소 ${repository.fullName} (ID: ${repoId}) 데이터 동기화 요청 수신`);
      
      // 비동기로 데이터 수집 시작 (응답은 즉시 반환)
      syncRepositoryData(repoId, repository.apiToken, repository.apiUrl).catch(error => {
        logger.error(`저장소 ${repository.fullName} 데이터 수집 중 오류 발생:`, error);
      });
      
      return {
        success: true,
        message: `저장소 ${repository.fullName}의 데이터 수집이 백그라운드에서 시작되었습니다.`
      };
    } catch (error) {
      logger.error('저장소 동기화 요청 처리 중 오류 발생:', error);
      return reply.code(500).send({
        success: false,
        message: `저장소 동기화 요청 처리 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  });

  /**
   * 저장소 데이터 상태 조회 API
   * 저장소 목록과 각 저장소의 데이터 수집 상태를 반환합니다.
   */
  fastify.get('/api/settings/repositories/status', async (_, reply) => {
    try {
      const db = getDB();
      
      // 1. 모든 저장소 정보 조회
      const repositories = await db.select().from(schema.repositories);
      
      // 2. 각 저장소의 데이터 수집 상태 확인
      const repoStatus = await Promise.all(repositories.map(async (repo: RepositoryRecord) => {
        // 커밋 수 확인
        const commitCount = await db.select({ count: count() })
          .from(schema.commits)
          .where(eq(schema.commits.repositoryId, repo.id))
          .execute();
        
        // PR 수 확인
        const prCount = await db.select({ count: count() })
          .from(schema.pullRequests)
          .where(eq(schema.pullRequests.repositoryId, repo.id))
          .execute();
        
        return {
          id: repo.id,
          name: repo.name,
          fullName: repo.fullName,
          lastSyncAt: repo.lastSyncAt,
          hasData: commitCount[0].count > 0 && prCount[0].count > 0,
          dataStats: {
            commitCount: commitCount[0].count,
            prCount: prCount[0].count
          }
        };
      }));
      
      return reply.send({
        repositories: repoStatus,
        missingDataRepos: repoStatus.filter(repo => !repo.hasData)
      });
    } catch (error) {
      logger.error('저장소 데이터 상태 조회 중 오류 발생:', error);
      return reply.status(500).send({ error: '저장소 데이터 상태를 조회할 수 없습니다.' });
    }
  });

  /**
   * 데이터가 없는 저장소의 데이터 수집 API
   */
  fastify.post('/api/settings/repositories/sync', async (request: FastifyRequest<{Body: {repositoryIds?: number[], syncAll?: boolean}}>, reply) => {
    try {
      const { repositoryIds, syncAll } = request.body;
      const syncManager = new SyncManager();
      
      // 모든 저장소 동기화가 요청된 경우
      if (syncAll) {
        logger.info('모든 저장소 데이터 동기화 시작');
        // 백그라운드에서 동기화 진행
        syncManager.syncAllRepositories().catch(error => {
          logger.error('모든 저장소 동기화 중 오류 발생:', error);
        });
        
        // 바로 응답
        return reply.send({ 
          message: '모든 저장소 데이터 동기화가 시작되었습니다.', 
          status: 'started' 
        });
      }
      
      // 특정 저장소만 동기화
      if (repositoryIds && repositoryIds.length > 0) {
        logger.info(`${repositoryIds.length}개 저장소 데이터 동기화 시작`);
        
        // 각 저장소를 개별적으로 동기화 (병렬 처리)
        // 백그라운드에서 실행하고 결과는 로그로만 남김
        repositoryIds.forEach(repoId => {
          syncManager.syncRepository(repoId)
            .catch(error => {
              logger.error(`저장소 ID ${repoId} 동기화 중 오류 발생:`, error);
            });
        });
        
        // 바로 응답
        return reply.send({ 
          message: `${repositoryIds.length}개 저장소 데이터 동기화가 시작되었습니다.`, 
          status: 'started',
          repositoryIds
        });
      }
      
      return reply.status(400).send({ error: '동기화할 저장소 ID가 제공되지 않았습니다.' });
    } catch (error) {
      logger.error('저장소 데이터 동기화 요청 중 오류 발생:', error);
      return reply.status(500).send({ error: '저장소 데이터 동기화를 시작할 수 없습니다.' });
    }
  });

  /**
   * 저장소 동기화 이력 조회 API
   */
  fastify.get('/api/settings/repositories/:id/sync-history', async (request: FastifyRequest<{
    Params: { id: string }
  }>, reply) => {
    try {
      const repoId = parseInt(request.params.id, 10);
      
      // DB에서 저장소 정보 조회
      const db = getDB();
      const repository = await db.query.repositories.findFirst({
        where: eq(schema.repositories.id, repoId)
      });
      
      if (!repository) {
        return reply.code(404).send({
          success: false,
          message: `저장소 ID ${repoId}를 찾을 수 없습니다.`
        });
      }
      
      // 동기화 이력 조회 (최근 10개)
      const history = await db.execute(`
        SELECT 
          id,
          repository_id as "repositoryId",
          start_time as "startTime",
          end_time as "endTime",
          status,
          commit_count as "commitCount",
          pull_request_count as "pullRequestCount",
          review_count as "reviewCount",
          error,
          created_at as "createdAt"
        FROM sync_history
        WHERE repository_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `, [repoId]);
      
      return {
        success: true,
        repository: {
          id: repository.id,
          name: repository.name,
          fullName: repository.fullName
        },
        history
      };
    } catch (error) {
      logger.error('동기화 이력 조회 중 오류 발생:', error);
      return reply.code(500).send({
        success: false,
        message: `동기화 이력 조회 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  });

  /**
   * 모든 저장소의 최근 동기화 이력 조회 API
   */
  fastify.get('/api/settings/repositories/sync-history', async (_, reply) => {
    try {
      const db = getDB();
      
      // 각 저장소별 최근 동기화 이력 조회
      const history = await db.execute(`
        WITH latest_history AS (
          SELECT 
            repository_id,
            MAX(created_at) as latest_date
          FROM sync_history
          GROUP BY repository_id
        )
        SELECT 
          sh.id,
          sh.repository_id as "repositoryId",
          r.name as "repositoryName",
          r.full_name as "repositoryFullName",
          sh.start_time as "startTime",
          sh.end_time as "endTime",
          sh.status,
          sh.commit_count as "commitCount",
          sh.pull_request_count as "pullRequestCount",
          sh.review_count as "reviewCount",
          sh.error,
          sh.created_at as "createdAt"
        FROM sync_history sh
        JOIN latest_history lh ON sh.repository_id = lh.repository_id AND sh.created_at = lh.latest_date
        JOIN repositories r ON sh.repository_id = r.id
        ORDER BY sh.created_at DESC
      `);
      
      return {
        success: true,
        history
      };
    } catch (error) {
      logger.error('모든 저장소 동기화 이력 조회 중 오류 발생:', error);
      return reply.code(500).send({
        success: false,
        message: `동기화 이력 조회 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  });

  /**
   * 데이터가 없는 모든 저장소 동기화 API (GET 방식)
   */
  fastify.get('/api/settings/repositories/sync-all-without-data', async (request, reply) => {
    try {
      const { serviceType } = request.query as { serviceType?: string };
      logger.info(`데이터가 없는 저장소 동기화 GET 요청 수신 - 서비스 유형: ${serviceType || '전체'}`);
      
      const syncManager = new SyncManager();
      
      // 데이터가 없는 저장소 목록 조회
      const allRepositoriesWithoutData = await syncManager.getRepositoriesWithoutData();
      
      // 서비스 유형에 따라 필터링
      const repositories = serviceType
        ? allRepositoriesWithoutData.filter(repo => repo.type === serviceType)
        : allRepositoriesWithoutData;
      
      logger.info(`필터링된 데이터가 없는 저장소 수: ${repositories.length}${serviceType ? ` (${serviceType} 유형)` : ''}`);
      
      if (repositories.length === 0) {
        return reply.send({
          message: serviceType 
            ? `${serviceType} 유형에서 데이터가 없는 저장소가 없습니다.` 
            : '데이터가 없는 저장소가 없습니다. 모든 저장소에 이미 데이터가 있습니다.',
          status: 'completed',
          repositoryIds: []
        });
      }
      
      const repositoryIds = repositories.map(repo => repo.id);
      
      logger.info(`데이터가 없는 ${repositoryIds.length}개 저장소 동기화 시작`);
      
      // 각 저장소를 개별적으로 동기화 (백그라운드에서 실행)
      repositoryIds.forEach(repoId => {
        syncManager.syncRepository(repoId)
          .catch(error => {
            logger.error(`저장소 ID ${repoId} 동기화 중 오류 발생:`, error);
          });
      });
      
      // 바로 응답
      return reply.send({
        message: `데이터가 없는 ${repositoryIds.length}개 저장소 동기화가 시작되었습니다.`,
        status: 'started',
        repositoryIds,
        repositories: repositories.map(repo => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.fullName,
          type: repo.type // 저장소 유형도 함께 반환
        }))
      });
    } catch (error) {
      logger.error('데이터가 없는 저장소 동기화 요청 중 오류 발생:', error);
      return reply.status(500).send({
        error: '데이터가 없는 저장소 동기화를 시작할 수 없습니다.',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * 데이터가 없는 모든 저장소 동기화 API (POST 방식)
   */
  fastify.post('/api/settings/repositories/sync-all-without-data', async (request, reply) => {
    try {
      const { serviceType } = request.body as { serviceType?: string };
      logger.info(`데이터가 없는 저장소 동기화 POST 요청 수신 - 서비스 유형: ${serviceType || '전체'}`);
      
      const syncManager = new SyncManager();
      
      // 데이터가 없는 저장소 목록 조회
      const allRepositoriesWithoutData = await syncManager.getRepositoriesWithoutData();
      
      // 서비스 유형에 따라 필터링
      const repositories = serviceType
        ? allRepositoriesWithoutData.filter(repo => repo.type === serviceType)
        : allRepositoriesWithoutData;
      
      logger.info(`필터링된 데이터가 없는 저장소 수: ${repositories.length}${serviceType ? ` (${serviceType} 유형)` : ''}`);
      
      if (repositories.length === 0) {
        return reply.send({
          message: serviceType 
            ? `${serviceType} 유형에서 데이터가 없는 저장소가 없습니다.` 
            : '데이터가 없는 저장소가 없습니다. 모든 저장소에 이미 데이터가 있습니다.',
          status: 'completed',
          repositoryIds: []
        });
      }
      
      const repositoryIds = repositories.map(repo => repo.id);
      
      logger.info(`데이터가 없는 ${repositoryIds.length}개 저장소 동기화 시작`);
      
      // 각 저장소를 개별적으로 동기화 (백그라운드에서 실행)
      repositoryIds.forEach(repoId => {
        syncManager.syncRepository(repoId)
          .catch(error => {
            logger.error(`저장소 ID ${repoId} 동기화 중 오류 발생:`, error);
          });
      });
      
      // 바로 응답
      return reply.send({
        message: `데이터가 없는 ${repositoryIds.length}개 저장소 동기화가 시작되었습니다.`,
        status: 'started',
        repositoryIds,
        repositories: repositories.map(repo => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.fullName,
          type: repo.type // 저장소 유형도 함께 반환
        }))
      });
    } catch (error) {
      logger.error('데이터가 없는 저장소 동기화 요청 중 오류 발생:', error);
      return reply.status(500).send({
        error: '데이터가 없는 저장소 동기화를 시작할 수 없습니다.',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
}