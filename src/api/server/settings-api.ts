/**
 * 설정 API 엔드포인트
 */
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SettingsService } from './settings-service.js';
import { UserSettings, GitHubSettings, JiraSettings, AccountsSettings } from '../../types/settings.js';
import { getDB } from '../../db/index.js';
import { schemaToUse as schema } from '../../db/index.js';
import { eq } from 'drizzle-orm';

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
    
    console.log(`기존 저장소 테이블에 ${existingRepos.length}개의 저장소가 있습니다.`);
    
    // 저장소 정보 순회하며 업데이트 또는 추가
    for (const repo of accountsSettings.repositories) {
      // 저장소 이름에서 소유자/이름 추출
      const fullName = repo.fullName;
      const nameOnly = repo.name || fullName.split('/').pop() || fullName;
      
      // 같은 fullName을 가진 저장소가 이미 있는지 확인
      const existingRepo = existingRepos.find(r => r.fullName === fullName);
      
      if (existingRepo) {
        // 기존 저장소 업데이트
        console.log(`저장소 업데이트: ${fullName}`);
        
        await db.update(schema.repositories)
          .set({
            name: nameOnly,
            cloneUrl: repo.url,
            type: repo.type,
            apiUrl: repo.ownerReference ? 
              accountsSettings.accounts.find(a => a.id === repo.owner)?.apiUrl || '' : '',
            updatedAt: new Date()
          })
          .where(eq(schema.repositories.fullName, fullName));
      } else {
        // 새 저장소 추가
        console.log(`저장소 추가: ${fullName}`);
        
        await db.insert(schema.repositories)
          .values({
            name: nameOnly,
            fullName: fullName,
            cloneUrl: repo.url,
            type: repo.type,
            apiUrl: repo.ownerReference ? 
              accountsSettings.accounts.find(a => a.id === repo.owner)?.apiUrl || '' : '',
            apiToken: repo.ownerReference ? 
              accountsSettings.accounts.find(a => a.id === repo.owner)?.token || '' : '',
            createdAt: new Date(),
            updatedAt: new Date()
          });
      }
    }
    
    console.log('저장소 테이블 업데이트를 완료했습니다.');
    return true;
  } catch (error) {
    console.error('저장소 테이블 업데이트 실패:', error);
    return false;
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
} 