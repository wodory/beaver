/**
 * 설정 API 엔드포인트
 */
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SettingsService } from './settings-service.js';
import { UserSettings, GitHubSettings, JiraSettings, AccountsSettings } from '../../types/settings.js';

// 기본 사용자 ID (현재는 단일 사용자 시스템)
const DEFAULT_USER_ID = 1;

/**
 * 요청 파라미터 인터페이스
 */
interface IdParams {
  userId?: string;
}

/**
 * SettingsService 인스턴스 생성
 */
const settingsService = new SettingsService();

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