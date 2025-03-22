import { RepositoryInfo } from '../IGitServiceAdapter';
import { logger } from '../../../utils/logger.js';
import { getMaskedToken } from '../../../utils/token.js';
import { SettingsService } from '../../../api/server/settings-service.js';

/**
 * API 인증 정보 인터페이스
 */
export interface ApiCredentials {
  apiToken: string;
  apiUrl?: string;
}

/**
 * 토큰 관리 클래스
 * 
 * 저장소 유형에 맞는 API 토큰과 URL을 관리합니다.
 */
export class TokenManager {
  private settingsService: SettingsService;
  
  constructor() {
    this.settingsService = new SettingsService();
  }
  
  /**
   * 저장소 유형에 맞는 API 토큰과 URL을 제공합니다.
   * 
   * @param repoInfo 저장소 정보
   * @returns API 인증 정보
   */
  async getApiCredentials(repoInfo: RepositoryInfo): Promise<ApiCredentials> {
    try {
      // 저장소 자체에 토큰이 있는 경우 사용
      if (repoInfo.apiToken) {
        logger.info(`저장소 ${repoInfo.name}에 설정된 토큰 사용`);
        return {
          apiToken: repoInfo.apiToken,
          apiUrl: repoInfo.apiUrl
        };
      }
      
      // 저장소 유형에 따라 토큰 가져오기
      switch (repoInfo.type) {
        case 'github': {
          const settings = await this.settingsService.getGitHubSettings();
          if (settings && settings.token) {
            const maskedToken = getMaskedToken(settings.token);
            logger.info(`GitHub 토큰 사용: ${maskedToken}`);
            return {
              apiToken: settings.token,
              apiUrl: 'https://api.github.com'
            };
          }
          break;
        }
        case 'github-enterprise': {
          const settings = await this.settingsService.getGitHubEnterpriseSettings();
          if (settings && settings.enterpriseToken && settings.enterpriseUrl) {
            const maskedToken = getMaskedToken(settings.enterpriseToken);
            logger.info(`GitHub Enterprise 토큰 사용: ${maskedToken}`);
            return {
              apiToken: settings.enterpriseToken,
              apiUrl: settings.enterpriseUrl
            };
          }
          break;
        }
        default:
          logger.warn(`지원되지 않는 저장소 유형: ${repoInfo.type}`);
      }
      
      // 기본 값으로 빈 토큰 반환
      logger.warn(`저장소 ${repoInfo.name}에 대한 API 토큰을 찾을 수 없습니다.`);
      return { apiToken: '' };
    } catch (error) {
      logger.error(`API 인증 정보 가져오기 중 오류 발생:`, error);
      return { apiToken: '' };
    }
  }
  
  /**
   * 토큰의 유효성을 검증합니다.
   * 
   * @param token API 토큰
   * @returns 유효성 여부
   */
  validateToken(token: string): boolean {
    if (!token) {
      logger.warn('API 토큰이 제공되지 않았습니다.');
      return false;
    }
    
    // 기본적으로 길이만 확인
    if (token.length < 10) {
      logger.warn('API 토큰이 너무 짧습니다 (최소 10자 이상).');
      return false;
    }
    
    return true;
  }
} 