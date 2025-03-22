import { CommitInfo, IGitServiceAdapter, PullRequestInfo, RepositoryInfo, ReviewInfo, UserInfo } from '../IGitServiceAdapter';
import simpleGit, { SimpleGit } from 'simple-git';
import { mkdir } from 'fs/promises';
import path from 'path';
import { GitHubAdapter } from './GitHubAdapter.js';
import { logger } from '../../../utils/logger.js';
import { getDB } from '../../../db/index.js';
import { eq } from 'drizzle-orm';
import { repositories } from '../../../db/schema/index.js';

/**
 * GitHub Enterprise 어댑터
 * GitHubAdapter를 상속받아 Enterprise 버전에 특화된 기능만 오버라이드
 */
export class GitHubEnterpriseAdapter extends GitHubAdapter {
  /**
   * @param apiUrl GitHub Enterprise API URL (예: https://oss.navercorp.com/api/v3)
   * @param apiToken GitHub Enterprise 액세스 토큰
   * @param repositoryId 선택적 저장소 ID (데이터베이스에서 조회 시 사용)
   */
  constructor(apiUrl: string, apiToken?: string, repositoryId?: number) {
    super(apiToken || '', apiUrl, repositoryId);
    logger.info(`[GitHub Enterprise] 어댑터 초기화: ${apiUrl}`);
  }

  /**
   * 저장소 클론 또는 업데이트
   * Enterprise 버전 전용 로직 포함
   */
  async cloneOrUpdateRepository(repoInfo: RepositoryInfo, localPath: string): Promise<string> {
    const repoPath = path.join(localPath, repoInfo.name);
    
    try {
      // 디렉토리 생성
      await mkdir(repoPath, { recursive: true });
      
      const git: SimpleGit = simpleGit();
      // 이미 클론되어 있는지 확인
      const isRepo = await git.cwd(repoPath).checkIsRepo().catch(() => false);
      
      if (isRepo) {
        // 이미 클론된 저장소면 업데이트
        logger.info(`[GitHub Enterprise] 저장소 ${repoInfo.fullName} 업데이트 중...`);
        await git.cwd(repoPath).pull();
      } else {
        // 새로 클론
        logger.info(`[GitHub Enterprise] 저장소 ${repoInfo.fullName} 클론 중...`);
        
        // 인증이 필요한 경우 토큰 사용
        let cloneUrl = repoInfo.cloneUrl;
        const token = this.getApiToken();
        if (token && cloneUrl.startsWith('https://')) {
          // GitHub Enterprise URL에 토큰 추가
          const urlObj = new URL(cloneUrl);
          cloneUrl = cloneUrl.replace(`${urlObj.origin}/`, `${urlObj.origin.replace('https://', `https://${token}@`)}/`);
        }
        
        await git.clone(cloneUrl, repoPath);
      }
      
      return repoPath;
    } catch (error) {
      logger.error(`[GitHub Enterprise] 저장소 ${repoInfo.fullName} 처리 중 오류 발생:`, error);
      throw error;
    }
  }

  /**
   * 저장소의 커밋 데이터 수집
   * (현재는 GitHub Enterprise API 연동이 구현되지 않아 throw error)
   */
  async collectCommits(repoInfo: RepositoryInfo, localPath: string, since?: Date): Promise<CommitInfo[]> {
    console.log(`GitHub Enterprise: ${repoInfo.fullName} 저장소의 커밋 데이터 수집 중...`);
    throw new Error('GitHub Enterprise API를 이용한 커밋 데이터 수집은 아직 구현되지 않았습니다.');
  }

  /**
   * 저장소의 PR 데이터 수집
   * (현재는 GitHub Enterprise API 연동이 구현되지 않아 throw error)
   */
  async collectPullRequests(repoInfo: RepositoryInfo, since?: Date): Promise<PullRequestInfo[]> {
    console.log(`GitHub Enterprise: ${repoInfo.fullName} 저장소의 PR 데이터 수집 중...`);
    throw new Error('GitHub Enterprise API를 이용한 PR 데이터 수집은 아직 구현되지 않았습니다.');
  }

  /**
   * PR의 리뷰 데이터 수집
   * (현재는 GitHub Enterprise API 연동이 구현되지 않아 throw error)
   */
  async collectPullRequestReviews(repoInfo: RepositoryInfo, prNumber: number): Promise<ReviewInfo[]> {
    console.log(`GitHub Enterprise: PR #${prNumber}의 리뷰 데이터 수집 중...`);
    throw new Error('GitHub Enterprise API를 이용한 리뷰 데이터 수집은 아직 구현되지 않았습니다.');
  }

  /**
   * 저장소 사용자 정보 수집
   * (현재는 GitHub Enterprise API 연동이 구현되지 않아 throw error)
   */
  async collectUsers(repoInfo: RepositoryInfo): Promise<UserInfo[]> {
    console.log(`GitHub Enterprise: ${repoInfo.fullName} 저장소의 사용자 정보 수집 중...`);
    throw new Error('GitHub Enterprise API를 이용한 사용자 정보 수집은 아직 구현되지 않았습니다.');
  }

  /**
   * 팩토리 메서드 - 저장소 ID로부터 어댑터 생성
   */
  static async createFromRepositoryId(repositoryId: number): Promise<GitHubEnterpriseAdapter> {
    try {
      const db = getDB();
      const repository = await db.query.repositories.findFirst({
        where: eq(repositories.id, repositoryId)
      });
      
      if (!repository) {
        throw new Error(`저장소 ID ${repositoryId}를 찾을 수 없습니다.`);
      }
      
      // 저장소 타입 확인
      if (repository.type !== 'github-enterprise') {
        throw new Error(`저장소 ${repositoryId}는 GitHub Enterprise 타입이 아닙니다. 현재 타입: ${repository.type}`);
      }
      
      // 저장소에 연결된 계정 설정 조회
      if (!repository.settingsId) {
        throw new Error(`저장소 ${repositoryId}에 연결된 설정이 없습니다.`);
      }
      
      // 계정 설정 조회
      const accountSettings = await db.query.settings.findFirst({
        where: eq(db.schema.settings.id, repository.settingsId)
      });
      
      if (!accountSettings) {
        throw new Error(`저장소 ${repositoryId}에 대한 계정 설정을 찾을 수 없습니다.`);
      }
      
      // 설정 데이터 파싱
      let settingsData;
      try {
        settingsData = typeof accountSettings.data === 'string' 
          ? JSON.parse(accountSettings.data) 
          : accountSettings.data;
      } catch (error) {
        throw new Error(`저장소 ${repositoryId}의 계정 설정 데이터를 파싱할 수 없습니다.`);
      }
      
      // GitHub Enterprise 토큰 확인
      if (!settingsData.enterpriseToken) {
        throw new Error(`GitHub Enterprise 토큰이 설정되지 않았습니다. 설정에서 enterpriseToken을 확인하세요.`);
      }
      
      // API URL 확인
      const apiUrl = accountSettings.apiUrl || settingsData.enterpriseUrl;
      if (!apiUrl) {
        throw new Error(`GitHub Enterprise URL이 설정되지 않았습니다. 설정에서 enterpriseUrl을 확인하세요.`);
      }
      
      // 어댑터 생성 및 반환
      return new GitHubEnterpriseAdapter(apiUrl + '/api/v3', settingsData.enterpriseToken, repositoryId);
    } catch (error: any) {
      logger.error(`GitHubEnterpriseAdapter 생성 중 오류 발생: ${error.message}`);
      throw error;
    }
  }
} 