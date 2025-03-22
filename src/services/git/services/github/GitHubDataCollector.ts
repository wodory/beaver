import { graphql } from '@octokit/graphql';
// import { Octokit } from '@octokit/rest';
import { getDB } from '../../../../db/index.js';
// import { eq, and, asc, desc, gt, lt } from 'drizzle-orm';
import { eq, and } from 'drizzle-orm';
import { logger } from '../../../../utils/logger.js';
import { isGitHubEnterpriseReachable } from '../../../../utils/network.js';
import { extractToken, getMaskedToken } from '../../../../utils/token.js';
import {
  repositories,
  commits,
  users,
  pullRequests,
  prReviews
} from '../../../../db/schema/index.js';
import { SettingsRepository } from '../../../../repositories/interfaces/SettingsRepository.js';
import { RepositoryInfoRepository } from '../../../../repositories/interfaces/RepositoryInfoRepository.js';
// import { Octokit } from 'octokit';
// import { RequestError } from '@octokit/request-error';
// import { Database } from 'better-sqlite3';
// import path from 'path';
// import * as repositoriesQueries from './graphql/repositories';
// import * as pullRequestsQueries from './graphql/pullRequests';
// import * as branchesQueries from './graphql/branches';
// import * as tagsQueries from './graphql/tags';
// import { 
//   GitHubRepoInfo, 
//   Repository, 
//   SyncStatus 
// } from '../../../../types';

/**
 * GitHub API로부터 커밋, PR, 리뷰 데이터를 수집하는 클래스
 * GraphQL API를 우선 사용하고, 필요한 경우 REST API 폴백
 */
export class GitHubDataCollector {
  private repositoryId: number;
  private graphqlWithAuth: any;
  // private octokit: Octokit;
  private graphqlEndpoint: string;
  private db: any;
  private owner: string = '';
  private repo: string = '';
  private isEnterpriseUrl: boolean = false;
  private enterpriseHost: string = '';

  /**
   * @param repositoryInfoRepository 저장소 정보 레포지토리
   * @param repositoryId 저장소 ID
   * @param accessToken GitHub API 액세스 토큰
   * @param baseUrl GitHub API 기본 URL (기본값: https://api.github.com)
   */
  constructor(
    private readonly repositoryInfoRepository: RepositoryInfoRepository,
    repositoryId: number, 
    accessToken?: unknown, 
    baseUrl: string = 'https://api.github.com'
  ) {
    // 토큰 타입 로깅 (디버깅용)
    logger.debug(`[GitHub] 저장소 ${repositoryId}: 전달된 토큰 타입: ${typeof accessToken}`);
    
    try {
      // 유효성 검사
      if (typeof repositoryId !== 'number' || isNaN(repositoryId)) {
        throw new Error(`유효하지 않은 저장소 ID: ${repositoryId}`);
      }

      this.repositoryId = repositoryId;
      this.db = getDB();
      
      // GitHub Enterprise URL 체크
      this.isEnterpriseUrl = !baseUrl.includes('api.github.com');
      if (this.isEnterpriseUrl) {
        try {
          const url = new URL(baseUrl);
          this.enterpriseHost = url.hostname;
          logger.info(`[GitHub] Enterprise 저장소 ${repositoryId} 초기화: 호스트 ${this.enterpriseHost}, API URL=${baseUrl}`);
        } catch (err) {
          logger.error(`[GitHub] 유효하지 않은 Enterprise URL: ${baseUrl} (저장소 ID: ${repositoryId})`);
        }
      } else {
        logger.info(`[GitHub] 일반 저장소 ${repositoryId} 초기화: API URL=${baseUrl}`);
      }
      
      // GraphQL 엔드포인트 설정 (REST API URL에서 적절한 GraphQL URL로 변환)
      this.graphqlEndpoint = this.normalizeGraphQLEndpoint(baseUrl);
      
      // 안전한 토큰 처리 (객체를 문자열로 변환하는 과정에서 발생하는 오류 방지)
      let processedToken: string | undefined;
      
      try {
        // accessToken이 null/undefined가 아니면 처리 시도
        if (accessToken !== null && accessToken !== undefined) {
          // 안전하게 토큰 추출 시도
          logger.debug(`[GitHub] 저장소 ${repositoryId}: 토큰 추출 시도`);
          processedToken = extractToken(accessToken);
          
          if (processedToken) {
            logger.info(`[GitHub] 저장소 ${repositoryId}: API 토큰 추출 성공 (${getMaskedToken(processedToken)})`);
          } else {
            logger.warn(`[GitHub] 저장소 ${repositoryId}: 유효한 토큰을 추출할 수 없음`);
          }
        } else {
          logger.warn(`[GitHub] 저장소 ${repositoryId}: API 토큰 없음 - 인증되지 않은 요청은 제한될 수 있습니다`);
        }
      } catch (tokenError) {
        logger.error(`[GitHub] 저장소 ${repositoryId}: 토큰 처리 중 오류 발생 - ${tokenError instanceof Error ? tokenError.message : String(tokenError)}`);
        processedToken = undefined;
      }
      
      // GraphQL 클라이언트 초기화
      const headers: Record<string, string> = {};
      
      if (processedToken) {
        // GitHub API 인증 헤더 형식: 'Bearer XXX'
        headers.authorization = `Bearer ${processedToken}`;
        logger.debug(`[GitHub] 저장소 ${repositoryId}: 인증 헤더 설정 완료`);
      } else {
        logger.warn(`[GitHub] 저장소 ${repositoryId}: 인증 헤더 없이 진행 - API 제한이 적용될 수 있음`);
      }
      
      // GraphQL 클라이언트 초기화
      try {
        this.graphqlWithAuth = graphql.defaults({
          baseUrl: this.graphqlEndpoint,
          headers
        });
        logger.debug(`[GitHub] 저장소 ${repositoryId}: GraphQL 클라이언트 초기화 성공`);
      } catch (graphqlError) {
        logger.error(`[GitHub] 저장소 ${repositoryId}: GraphQL 클라이언트 초기화 실패 - ${graphqlError instanceof Error ? graphqlError.message : String(graphqlError)}`);
        throw new Error(`GraphQL 클라이언트 초기화 실패: ${graphqlError instanceof Error ? graphqlError.message : String(graphqlError)}`);
      }
    } catch (initError) {
      logger.error(`[GitHub] 저장소 ${repositoryId} 초기화 중 오류 발생: ${initError instanceof Error ? initError.message : String(initError)}`);
      throw initError;
    }
  }

  /**
   * REST API URL을 GraphQL API URL로 변환
   * GitHub Enterprise 3.12 버전은 https://HOSTNAME/api/graphql 형식 사용
   */
  private normalizeGraphQLEndpoint(baseUrl: string): string {
    if (!baseUrl) {
      return 'https://api.github.com/graphql';
    }
    
    let normalizedUrl = baseUrl.trim();
    
    // URL 끝에 슬래시 제거
    normalizedUrl = normalizedUrl.replace(/\/+$/, '');
    
    // GitHub Enterprise URL 처리 (oss.navercorp.com 등의 내부 서버)
    if (this.isEnterpriseUrl) {
      logger.debug(`[GraphQL 변환] 시작: ${baseUrl} (Enterprise)`);
      
      try {
        // GitHub Enterprise는 다양한 엔드포인트 형식을 가질 수 있음
        // 일반적인 형식:
        // - GitHub Enterprise 3.12+: /api/graphql
        // - 일부 버전: /api/v3/graphql 또는 /graphql
        
        // 도메인 추출
        const domainMatch = normalizedUrl.match(/^https?:\/\/([^\/]+)/);
        const domain = domainMatch ? domainMatch[1] : '';
        
        if (!domain) {
          throw new Error('URL에서 도메인을 추출할 수 없습니다');
        }
        
        // 이미 GraphQL 엔드포인트를 포함하는 경우 그대로 사용
        if (normalizedUrl.includes('/graphql')) {
          logger.info(`[GraphQL 변환] 이미 GraphQL 엔드포인트 포함: ${normalizedUrl}`);
          return normalizedUrl;
        }
        
        // REST API URL을 GraphQL URL로 변환
        if (normalizedUrl.includes('/api/v3')) {
          const endpoint = `https://${domain}/api/graphql`;
          logger.info(`[GraphQL 변환] ${baseUrl} -> ${endpoint} (Enterprise REST -> GraphQL)`);
          return endpoint;
        }
        
        // GitHub Enterprise 3.12 이상 버전은 /api/graphql 경로를 사용
        // 기본 도메인만 제공된 경우 기본 GraphQL 엔드포인트 추가
        const endpoint = `https://${domain}/api/graphql`;
        logger.info(`[GraphQL 변환] ${baseUrl} -> ${endpoint} (Enterprise 기본 경로)`);
        return endpoint;
      } catch (err) {
        logger.error(`[GraphQL 변환] 잘못된 URL 형식: ${baseUrl}, 오류: ${err}`);
        // 오류 발생 시 원본 URL 반환
        return normalizedUrl;
      }
    } 
    // 일반 GitHub API URL 처리
    else {
      // 일반적으로 https://api.github.com -> https://api.github.com/graphql
      if (!normalizedUrl.endsWith('/graphql')) {
        normalizedUrl = `${normalizedUrl}/graphql`;
      }
      logger.info(`[GraphQL 변환] ${baseUrl} -> ${normalizedUrl} (표준 GitHub 형식)`);
    }
    
    return normalizedUrl;
  }

  /**
   * 저장소 정보 조회
   */
  async getRepositoryInfo() {
    try {
      const repository = await this.repositoryInfoRepository.findById(this.repositoryId);
      
      if (!repository) {
        throw new Error(`저장소 ID ${this.repositoryId}를 찾을 수 없습니다.`);
      }
      
      // 저장소의 소유자와 이름 구분
      const [owner, name] = repository.fullName.split('/');
      this.owner = owner;
      this.repo = name;
      
      return { repository, owner, name };
    } catch (error) {
      logger.error(`저장소 정보 조회 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * 커밋 데이터 수집 및 저장
   */
  async collectCommits(): Promise<number> {
    try {
      // 저장소 정보 조회
      await this.getRepositoryInfo();
      
      // 기존 DB에서 저장소 정보를 직접 조회하여 lastSyncAt 정보 가져오기
      const repoFromDb = await this.db.query.repositories.findFirst({
        where: eq(repositories.id, this.repositoryId)
      });
      
      const lastSyncAt = repoFromDb?.lastSyncAt || new Date(0);
      
      logger.info(`[GitHub] 커밋 수집 시작: ${this.owner}/${this.repo}, 마지막 동기화: ${lastSyncAt.toISOString()}`);
      
      // 카운터 초기화
      let newCommitCount = 0;
      let hasNextPage = true;
      let cursor = null;
      
      // 페이지네이션을 통한 모든 커밋 수집
      while (hasNextPage) {
        try {
          logger.debug(`[GitHub] 커밋 배치 조회 중... (커서: ${cursor || '처음'})`);
          
          // GraphQL 쿼리 실행
          const { commits, pageInfo } = await this.fetchCommitBatch(
            this.owner, 
            this.repo, 
            lastSyncAt.toISOString(),
            cursor
          );
          
          logger.debug(`[GitHub] 커밋 배치 조회 완료: ${commits.length}개 커밋 조회됨`);
          
          // 수집된 커밋 처리
          const batchCount = await this.saveCommits(commits);
          newCommitCount += batchCount;
          
          // 페이지네이션 정보 업데이트
          hasNextPage = pageInfo.hasNextPage;
          cursor = pageInfo.endCursor;
          
          logger.info(`[GitHub] 커밋 배치 처리 완료: ${batchCount}개 저장됨, 총 ${newCommitCount}개, 다음 페이지: ${hasNextPage}`);
          
          // API 레이트 리밋 방지를 위한 딜레이
          if (hasNextPage) {
            logger.debug(`[GitHub] API 레이트 리밋 방지를 위해 1초 대기`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          // API 호출 에러 처리
          const errorMsg = error instanceof Error ? error.message : String(error);
          logger.error(`[GitHub] 커밋 배치 처리 중 오류 발생: ${errorMsg}`);
          
          // 에러가 GraphQL 관련인지 검증
          if (error instanceof Error && error.message.includes('GraphQL')) {
            logger.error(`[GitHub] GraphQL 오류 세부 정보:`, error);
          }
          
          // 레이트 리밋 에러면 전체 동기화 중단
          if (error instanceof Error && 
             (error.message.includes('rate limit') || 
             error.message.includes('API rate limit exceeded'))) {
            logger.error(`[GitHub] API 레이트 리밋 초과로 동기화 중단`);
            throw error;
          }
          
          // 기타 네트워크 관련 오류 로깅
          if (error instanceof Error && 
             (error.message.includes('ECONNREFUSED') || 
              error.message.includes('ENOTFOUND') ||
              error.message.includes('ETIMEDOUT'))) {
            logger.error(`[GitHub] 네트워크 연결 오류: ${error.message}`);
            throw new Error(`GitHub 서버 연결 오류: ${error.message}. 네트워크 연결 또는 GitHub 서버 가용성을 확인하세요.`);
          }
          
          // 다른 에러의 경우 다음 페이지로 이동 중단
          logger.warn(`[GitHub] 오류로 인해 다음 페이지 조회를 중단합니다.`);
          hasNextPage = false;
        }
      }
      
      logger.info(`[GitHub] 커밋 수집 완료: 총 ${newCommitCount}개의 새 커밋 수집됨`);
      return newCommitCount;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[GitHub] 커밋 수집 중 오류 발생: ${errorMsg}`);
      
      // 스택 트레이스 로깅
      if (error instanceof Error && error.stack) {
        logger.error(`[GitHub] 오류 스택 트레이스: ${error.stack}`);
      }
      
      throw error;
    }
  }

  /**
   * 커밋 배치 데이터 가져오기
   */
  async fetchCommitBatch(owner: string, name: string, since: string, cursor: string | null = null) {
    try {
      // 배치 조회를 위한 GraphQL 쿼리
      const query = `
        query GetRepositoryCommits($owner: String!, $name: String!, $since: GitTimestamp, $cursor: String) {
          repository(owner: $owner, name: $name) {
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 100, since: $since, after: $cursor) {
                    nodes {
                      oid
                      messageHeadline
                      message
                      committedDate
                      additions
                      deletions
                      changedFiles
                      author {
                        name
                        email
                        user {
                          login
                          id
                          avatarUrl
                        }
                      }
                      committer {
                        name
                        email
                        user {
                          login
                          id
                        }
                      }
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                }
              }
            }
          }
        }
      `;
      
      const variables = {
        owner,
        name,
        since,
        cursor
      };
      
      // 개선된 GraphQL 쿼리 메서드 사용
      const result = await this.gitHubGraphQLQuery(query, variables);
      
      // 결과에서 커밋 데이터 추출
      const historyData = result.repository?.defaultBranchRef?.target?.history;
      if (!historyData) {
        logger.warn(`저장소 ${owner}/${name}에서 커밋 데이터를 찾을 수 없습니다.`);
        return { commits: [], pageInfo: { hasNextPage: false, endCursor: null } };
      }
      
      const commits = historyData.nodes;
      const pageInfo = historyData.pageInfo;
      
      return { commits, pageInfo };
    } catch (error) {
      logger.error(`커밋 배치 처리 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      return { commits: [], pageInfo: { hasNextPage: false, endCursor: null } };
    }
  }

  /**
   * 커밋 데이터 저장
   */
  async saveCommits(commitsData: any[]): Promise<number> {
    if (!commitsData || commitsData.length === 0) {
      return 0;
    }
    
    let savedCount = 0;
    
    for (const commitData of commitsData) {
      try {
        // 이미 존재하는 커밋인지 확인
        const existingCommit = await this.db.query.commits.findFirst({
          where: eq(commits.id, commitData.oid)
        });
        
        if (existingCommit) {
          logger.debug(`이미 존재하는 커밋 건너뜀: ${commitData.oid}`);
          continue;
        }
        
        // 작성자 정보 확인/저장
        const authorId = await this.ensureUser(
          commitData.author.name,
          commitData.author.email,
          commitData.author.user?.login,
          // 숫자를 문자열로 변환
          commitData.author.user?.id ? commitData.author.user.id.toString() : null
        );
        
        // 커미터 정보 확인/저장
        const committerId = await this.ensureUser(
          commitData.committer.name,
          commitData.committer.email,
          commitData.committer.user?.login,
          // 숫자를 문자열로 변환
          commitData.committer.user?.id ? commitData.committer.user.id.toString() : null
        );
        
        // 커밋 데이터 저장
        await this.db.insert(commits).values({
          id: commitData.oid,
          repositoryId: this.repositoryId,
          authorId,
          committerId,
          message: commitData.message,
          committedAt: new Date(commitData.committedDate).toISOString(),
          additions: commitData.additions,
          deletions: commitData.deletions,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        savedCount++;
      } catch (error) {
        logger.error(`커밋 ${commitData.oid} 저장 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
        // 한 커밋이 실패해도 계속 진행
      }
    }
    
    return savedCount;
  }

  /**
   * 사용자 정보 확인 및 저장
   * 이메일 또는 GitHub ID로 사용자를 찾고, 없으면 생성
   */
  async ensureUser(
    name: string, 
    email: string, 
    login: string | null = null, 
    // githubIdOrString: string | number | null = null,
    avatarUrl: string | null = null
  ): Promise<number> {
    try {
      // 이메일로 사용자 찾기
      const db = getDB();
      let user = null;
      
      // 사용자 조회 우선순위:
      // 1. login(GitHub 사용자명)으로 조회
      // 2. 이메일로 조회
      if (login) {
        // login으로 사용자 조회
        const usersByLogin = await db.select()
          .from(users)
          .where(eq(users.login, login));
        
        if (usersByLogin && usersByLogin.length > 0) {
          user = usersByLogin[0];
        }
      }
      
      if (!user && email) {
        // 이메일로 사용자 조회
        const usersByEmail = await db.select()
          .from(users)
          .where(eq(users.email, email));
        
        if (usersByEmail && usersByEmail.length > 0) {
          user = usersByEmail[0];
        }
      }
      
      // 사용자가 이미 존재하는 경우
      if (user) {
        // 업데이트가 필요한지 확인 (login 또는 avatarUrl이 없는 경우)
        if ((login && !user.login) || (avatarUrl && !user.avatarUrl)) {
          // 사용자 정보 업데이트
          await db.update(users)
            .set({
              login: login || user.login,
              name: name || user.name,
              email: email || user.email,
              avatarUrl: avatarUrl || user.avatarUrl,
              updatedAt: new Date()
            })
            .where(eq(users.id, user.id));
        }
        
        return user.id;
      } else {
        // 사용자가 존재하지 않는 경우, 새로 생성
        const result = await db.insert(users)
          .values({
            login: login || email.split('@')[0], // login이 없으면 이메일 앞부분 사용
            name,
            email,
            avatarUrl,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        if (result && result.length > 0) {
          return result[0].id;
        } else {
          throw new Error('사용자 생성 실패');
        }
      }
    } catch (error) {
      logger.error(`사용자 (${name}, ${email}, ${login}) 저장 중 오류 발생:`, error);
      throw error;
    }
  }

  /**
   * 마지막 동기화 시간 업데이트
   */
  public async updateLastSyncAt(): Promise<void> {
    try {
      // 현재 시간을 마지막 동기화 시간으로 설정
      await this.db.update(repositories)
        .set({
          lastSyncAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(repositories.id, this.repositoryId));
      
      logger.info(`저장소 ID ${this.repositoryId} 마지막 동기화 시간 업데이트 완료`);
    } catch (error) {
      logger.error(`마지막 동기화 시간 업데이트 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      // 실패해도 진행
    }
  }

  /**
   * 모든 데이터 동기화 (커밋, PR, 리뷰)
   */
  async syncAll(): Promise<{
    commitCount: number;
    pullRequestCount: number;
    reviewCount: number;
  }> {
    try {
      // 저장소 정보 가져오기
      await this.getRepositoryInfo();
      
      // 저장소 상세 정보 로깅
      logger.info(`저장소 ID ${this.repositoryId} 전체 데이터 동기화 시작`);
      
      // GitHub Enterprise 서버 접근성 확인
      if (this.isEnterpriseUrl) {
        const enterpriseUrl = `https://${this.enterpriseHost}`;
        const isReachable = await isGitHubEnterpriseReachable(enterpriseUrl);
        
        if (!isReachable) {
          throw new Error(`GitHub Enterprise 서버(${this.enterpriseHost})에 접근할 수 없습니다. 사내망(VPN) 연결이 필요합니다.`);
        }
        
        // GraphQL 엔드포인트 유효성 검증
        logger.info(`[GitHub] Enterprise GraphQL 엔드포인트 검증 시작: ${this.graphqlEndpoint}`);
        const isEndpointValid = await this.validateGraphQLEndpoint();
        
        if (!isEndpointValid) {
          logger.error(`[GitHub] GraphQL 엔드포인트 ${this.graphqlEndpoint}가 유효하지 않습니다.`);
          throw new Error(`GitHub Enterprise GraphQL API 엔드포인트에 접근할 수 없습니다. 토큰과 URL을 확인하세요.`);
        }
      }
      
      // 1. 커밋 데이터 동기화
      logger.info(`저장소 ID ${this.repositoryId} 커밋 데이터 동기화 시작`);
      const commitCount = await this.collectCommits();
      logger.info(`저장소 ID ${this.repositoryId} 커밋 데이터 동기화 완료: ${commitCount}개 커밋`);
      
      // 2. PR 및 리뷰 데이터 동기화
      logger.info(`저장소 ID ${this.repositoryId} PR 데이터 동기화 시작`);
      const { pullRequestCount, reviewCount } = await this.collectPullRequestsAndReviews();
      logger.info(`저장소 ID ${this.repositoryId} PR 데이터 동기화 완료: ${pullRequestCount}개 PR, ${reviewCount}개 리뷰`);
      
      // 3. 마지막 동기화 시간 업데이트
      await this.updateLastSyncAt();
      
      logger.info(`저장소 ID ${this.repositoryId} 전체 데이터 동기화 완료`);
      
      return {
        commitCount,
        pullRequestCount,
        reviewCount
      };
    } catch (error) {
      logger.error(`저장소 ID ${this.repositoryId} 동기화 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * PR 및 리뷰 데이터 수집
   * GraphQL API를 사용하여 PR 및 연관된 리뷰 데이터를 수집하고 DB에 저장
   */
  async collectPullRequestsAndReviews(): Promise<{
    pullRequestCount: number;
    reviewCount: number;
  }> {
    try {
      // 저장소 정보 조회
      await this.getRepositoryInfo();
      
      // 기존 DB에서 저장소 정보를 직접 조회하여 lastSyncAt 정보 가져오기
      const repoFromDb = await this.db.query.repositories.findFirst({
        where: eq(repositories.id, this.repositoryId)
      });
      
      const lastSyncAt = repoFromDb?.lastSyncAt || new Date(0);
      
      logger.info(`PR 및 리뷰 수집 시작: ${this.owner}/${this.repo}, 마지막 동기화: ${lastSyncAt.toISOString()}`);
      
      // 카운터 초기화
      let newPrCount = 0;
      let newReviewCount = 0;
      let hasNextPage = true;
      let cursor = null;
      
      // 페이지네이션을 통한 모든 PR 수집
      while (hasNextPage) {
        try {
          const { pullRequests: prData, pageInfo } = await this.fetchPullRequestBatch(
            this.owner, 
            this.repo, 
            lastSyncAt.toISOString(),
            cursor
          );
          
          // 수집된 PR 및 리뷰 처리
          const { prCount, reviewCount } = await this.savePullRequestsAndReviews(prData);
          newPrCount += prCount;
          newReviewCount += reviewCount;
          
          // 페이지네이션 정보 업데이트
          hasNextPage = pageInfo.hasNextPage;
          cursor = pageInfo.endCursor;
          
          logger.info(`PR 배치 처리 완료: ${prCount}개 PR, ${reviewCount}개 리뷰 저장, 다음 페이지: ${hasNextPage}`);
        } catch (error) {
          // API 호출 에러 처리
          logger.error(`PR 배치 처리 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
          
          // 레이트 리밋 에러면 전체 동기화 중단
          if (error instanceof Error && 
             (error.message.includes('rate limit') || 
             error.message.includes('API rate limit exceeded'))) {
            throw error;
          }
          
          // 다른 에러의 경우 다음 페이지로 이동
          hasNextPage = false;
        }
      }
      
      logger.info(`PR 및 리뷰 수집 완료: 총 ${newPrCount}개의 새 PR, ${newReviewCount}개의 새 리뷰 수집됨`);
      return {
        pullRequestCount: newPrCount,
        reviewCount: newReviewCount
      };
    } catch (error) {
      logger.error(`PR 및 리뷰 수집 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * PR 배치 데이터 가져오기
   */
  async fetchPullRequestBatch(owner: string, name: string, since: string, cursor: string | null = null) {
    try {
      // 배치 조회를 위한 GraphQL 쿼리
      const query = `
        query GetRepositoryPullRequests($owner: String!, $name: String!, $since: DateTime, $cursor: String) {
          repository(owner: $owner, name: $name) {
            pullRequests(first: 30, after: $cursor, orderBy: {field: UPDATED_AT, direction: DESC}) {
              nodes {
                number
                title
                body
                state
                createdAt
                updatedAt
                closedAt
                mergedAt
                isDraft
                additions
                deletions
                changedFiles
                author {
                  login
                  ... on User {
                    id
                    avatarUrl
                    name
                    email
                  }
                }
                mergedBy {
                  login
                  ... on User {
                    id
                  }
                }
                reviews(first: 50) {
                  nodes {
                    id
                    state
                    body
                    submittedAt
                    author {
                      login
                      ... on User {
                        id
                        avatarUrl
                      }
                    }
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `;
      
      const variables = {
        owner,
        name,
        since,
        cursor
      };
      
      // 개선된 GraphQL 쿼리 메서드 사용
      const result = await this.gitHubGraphQLQuery(query, variables);
      
      // 결과에서 PR 데이터 추출
      const prData = result.repository?.pullRequests;
      if (!prData) {
        logger.warn(`저장소 ${owner}/${name}에서 PR 데이터를 찾을 수 없습니다.`);
        return { pullRequests: [], pageInfo: { hasNextPage: false, endCursor: null } };
      }
      
      // updatedAt이 since 이후인 PR만 필터링
      const filteredPRs = prData.nodes.filter((pr: any) => {
        return new Date(pr.updatedAt) >= new Date(since);
      });
      
      return { 
        pullRequests: filteredPRs, 
        pageInfo: prData.pageInfo 
      };
    } catch (error) {
      logger.error(`PR 배치 처리 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      return { pullRequests: [], pageInfo: { hasNextPage: false, endCursor: null } };
    }
  }

  /**
   * PR 및 리뷰 데이터 저장
   */
  async savePullRequestsAndReviews(prDataList: any[]): Promise<{
    prCount: number;
    reviewCount: number;
  }> {
    if (!prDataList || prDataList.length === 0) {
      return { prCount: 0, reviewCount: 0 };
    }
    
    let savedPrCount = 0;
    let savedReviewCount = 0;
    
    for (const prData of prDataList) {
      try {
        // 1. 이미 존재하는 PR인지 확인
        let prId = null;
        const existingPR = await this.db.query.pullRequests.findFirst({
          where: and(
            eq(pullRequests.repositoryId, this.repositoryId),
            eq(pullRequests.number, prData.number)
          )
        });
        
        // 2. PR 작성자 정보 처리
        const authorId = prData.author ? await this.ensureUser(
          prData.author.name || prData.author.login,
          prData.author.email || '',
          prData.author.login,
          // 숫자를 문자열로 변환
          this.extractGitHubId(prData.author.id) ? this.extractGitHubId(prData.author.id) : null
        ) : null;
        
        // 3. PR 병합자 정보 처리
        let mergedById = null;
        if (prData.mergedBy) {
          mergedById = await this.ensureUser(
            prData.mergedBy.login,
            '',
            prData.mergedBy.login,
            // 숫자를 문자열로 변환
            this.extractGitHubId(prData.mergedBy.id) ? this.extractGitHubId(prData.mergedBy.id) : null
          );
        }
        
        // 4. PR 상태 결정 (open, closed, merged)
        let prState = prData.state.toLowerCase();
        // GitHub GraphQL API는 MERGED 상태를 직접 제공하지 않음
        // mergedAt이 있으면 merged 상태로 간주
        if (prState === 'closed' && prData.mergedAt) {
          prState = 'merged';
        }
        
        // 5. PR 저장 또는 업데이트
        if (existingPR) {
          // 이미 존재하는 PR 업데이트
          await this.db.update(pullRequests)
            .set({
              title: prData.title,
              body: prData.body || '',
              state: prState,
              authorId,
              isDraft: prData.isDraft || false,
              additions: prData.additions || 0,
              deletions: prData.deletions || 0,
              changedFiles: prData.changedFiles || 0,
              updatedAt: new Date(prData.updatedAt).toISOString(),
              closedAt: prData.closedAt ? new Date(prData.closedAt).toISOString() : null,
              mergedAt: prData.mergedAt ? new Date(prData.mergedAt).toISOString() : null,
              mergedBy: mergedById
            })
            .where(eq(pullRequests.id, existingPR.id));
          
          prId = existingPR.id;
          logger.debug(`기존 PR #${prData.number} 업데이트 완료`);
        } else {
          // 새 PR 추가
          const result = await this.db.insert(pullRequests)
            .values({
              repositoryId: this.repositoryId,
              number: prData.number,
              title: prData.title,
              body: prData.body || '',
              state: prState,
              authorId,
              isDraft: prData.isDraft || false,
              additions: prData.additions || 0,
              deletions: prData.deletions || 0,
              changedFiles: prData.changedFiles || 0,
              createdAt: new Date(prData.createdAt).toISOString(),
              updatedAt: new Date(prData.updatedAt).toISOString(),
              closedAt: prData.closedAt ? new Date(prData.closedAt).toISOString() : null,
              mergedAt: prData.mergedAt ? new Date(prData.mergedAt).toISOString() : null,
              mergedBy: mergedById
            })
            .returning();
          
          prId = result[0].id;
          savedPrCount++;
          logger.debug(`새 PR #${prData.number} 저장 완료`);
        }
        
        // 6. PR 리뷰 처리
        if (prData.reviews && prData.reviews.nodes && prId) {
          const reviewsCount = await this.saveReviews(prId, prData.number, prData.reviews.nodes);
          savedReviewCount += reviewsCount;
        }
      } catch (error) {
        logger.error(`PR #${prData.number} 저장 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
        // 한 PR이 실패해도 계속 진행
      }
    }
    
    return {
      prCount: savedPrCount,
      reviewCount: savedReviewCount
    };
  }

  /**
   * PR 리뷰 데이터 저장
   */
  async saveReviews(pullRequestId: number, prNumber: number, reviewsData: any[]): Promise<number> {
    if (!reviewsData || reviewsData.length === 0) {
      return 0;
    }
    
    let savedCount = 0;
    
    for (const reviewData of reviewsData) {
      try {
        // 1. 이미 존재하는 리뷰인지 확인
        const existingReview = await this.db.query.prReviews.findFirst({
          where: and(
            eq(prReviews.pullRequestId, pullRequestId),
            eq(prReviews.id, reviewData.id.toString())
          )
        });
        
        if (existingReview) {
          logger.debug(`이미 존재하는 리뷰 건너뜀: PR #${prNumber}, 리뷰 ID ${reviewData.id}`);
          continue;
        }
        
        // 2. 리뷰어 정보 처리
        let reviewerId = null;
        if (reviewData.author) {
          reviewerId = await this.ensureUser(
            reviewData.author.login,
            '',
            reviewData.author.login,
            // 숫자를 문자열로 변환
            this.extractGitHubId(reviewData.author.id) ? this.extractGitHubId(reviewData.author.id) : null
          );
        }
        
        // 3. 리뷰 상태 정규화
        let reviewState = 'COMMENTED';
        if (reviewData.state) {
          reviewState = reviewData.state.toUpperCase();
        }
        
        // 4. 리뷰 저장
        await this.db.insert(prReviews)
          .values({
            id: reviewData.id.toString(),
            pullRequestId,
            reviewerId,
            state: reviewState,
            body: reviewData.body || '',
            submittedAt: new Date(reviewData.submittedAt).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        
        savedCount++;
      } catch (error) {
        logger.error(`리뷰 저장 중 오류 발생: PR #${prNumber}, 리뷰 ID ${reviewData.id}, 오류: ${error instanceof Error ? error.message : String(error)}`);
        // 한 리뷰가 실패해도 계속 진행
      }
    }
    
    return savedCount;
  }

  /**
   * GitHub 노드 ID에서 숫자 ID 추출
   * GitHub GraphQL API는 "MDQ6VXNlcjE=" 같은 형식의 글로벌 ID를 사용
   */
  private extractGitHubId(nodeId: string | null): string | null {
    if (!nodeId) return null;
    
    try {
      // Base64 디코딩
      const decoded = Buffer.from(nodeId, 'base64').toString('utf-8');
      // "User:1234" 같은 형식에서 숫자 부분 추출
      const match = decoded.match(/:(\d+)$/);
      if (match && match[1]) {
        return match[1]; // 문자열로 직접 반환
      }
    } catch (error) {
      logger.warn(`GitHub 노드 ID(${nodeId}) 파싱 중 오류: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return null;
  }

  /**
   * GitHub GraphQL 엔드포인트 유효성 검증
   * 다양한 엔드포인트 형식 시도
   */
  private async validateGraphQLEndpoint(): Promise<boolean> {
    logger.info(`[GitHub] GraphQL 엔드포인트 검증 시작: ${this.graphqlEndpoint}`);
    
    // 테스트 쿼리 정의 (간단한 쿼리로 수정)
    const testQuery = `query { viewer { login } }`;
    
    try {
      // GraphQL 엔드포인트 검증 쿼리 실행
      const result = await this.gitHubGraphQLQuery(testQuery, {});
      
      if (result && result.viewer) {
        logger.info(`[GitHub] GraphQL 엔드포인트 검증 성공: 사용자 ${result.viewer.login}`);
        return true;
      } else {
        logger.warn(`[GitHub] GraphQL 엔드포인트 응답이 예상과 다릅니다: ${JSON.stringify(result)}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[GitHub] GraphQL 엔드포인트 검증 실패: ${errorMessage}`);
      
      // 인증 오류 처리
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Bad credentials')) {
        logger.error('[GitHub] 인증 오류: 액세스 토큰이 올바르지 않거나 필요한 권한이 없습니다.');
        throw new Error('GitHub API 인증 오류: 액세스 토큰을 확인하세요. Bearer 형식의 토큰이 필요합니다.');
      }
      
      // 404 Not Found 오류 처리
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        logger.error(`[GitHub] 엔드포인트를 찾을 수 없음: ${this.graphqlEndpoint}`);
      }
      
      // 실패한 경우 대체 엔드포인트 시도 (GitHub Enterprise 문서 참고)
      if (this.isEnterpriseUrl) {
        // 도메인 추출
        const domainMatch = this.graphqlEndpoint.match(/^https?:\/\/([^\/]+)/);
        const domain = domainMatch ? domainMatch[1] : this.enterpriseHost;
        
        // 대체 엔드포인트 목록 - GitHub Enterprise 3.12에 맞게 우선순위 설정
        const alternativeEndpoints = [
          `https://${domain}/api/graphql`,       // GitHub Enterprise 3.12+ 기본 형식
          `https://${domain}/graphql`,           // 일부 버전에서 사용
          `https://${domain}/api/v3/graphql`,    // 레거시 형식
          `https://${domain}/enterprise/api/graphql`   // 일부 배포에서 사용
        ];
        
        // 이미 시도한 엔드포인트를 추적하는 Set
        const triedEndpoints = new Set([this.graphqlEndpoint]);
        
        // 대체 엔드포인트 순차적 시도
        for (const endpoint of alternativeEndpoints) {
          // 이미 시도한 엔드포인트는 건너뛰기
          if (triedEndpoints.has(endpoint)) {
            continue;
          }
          
          triedEndpoints.add(endpoint);
          logger.warn(`[GitHub] 대체 GraphQL 엔드포인트 시도: ${endpoint}`);
          
          // GraphQL 클라이언트 재설정
          this.graphqlEndpoint = endpoint;
          this.graphqlWithAuth = graphql.defaults({
            baseUrl: endpoint,
            headers: this.graphqlWithAuth.defaults.headers
          });
          
          try {
            // 테스트 쿼리 재실행
            const testResult = await this.gitHubGraphQLQuery(testQuery, {});
            if (testResult && testResult.viewer) {
              logger.info(`[GitHub] 대체 GraphQL 엔드포인트 ${endpoint} 검증 성공: 사용자 ${testResult.viewer.login}`);
              return true;
            }
          } catch (altError) {
            // 대체 엔드포인트도 실패
            const altErrorMsg = altError instanceof Error ? altError.message : String(altError);
            logger.debug(`[GitHub] 대체 GraphQL 엔드포인트 ${endpoint} 검증 실패: ${altErrorMsg}`);
            
            // 인증 오류면 더 이상 시도하지 않음 (토큰이 잘못된 경우)
            if (altErrorMsg.includes('Unauthorized') || altErrorMsg.includes('Bad credentials')) {
              logger.error('[GitHub] 모든 엔드포인트에서 인증 오류 발생: 액세스 토큰을 확인하세요.');
              throw new Error('GitHub API 인증 오류: 액세스 토큰을 확인하세요. Bearer 형식의 토큰이 필요합니다.');
            }
          }
        }
        
        // 모든 대체 엔드포인트가 실패한 경우
        logger.error('[GitHub] 모든 GraphQL 엔드포인트 시도가 실패했습니다.');
        throw new Error(`GitHub Enterprise GraphQL API 엔드포인트에 접근할 수 없습니다. 
          다음 엔드포인트를 시도했습니다: ${Array.from(triedEndpoints).join(', ')}`);
      }
      
      return false;
    }
  }
  
  /**
   * GitHub GraphQL API 쿼리 실행
   * 오류 처리 및 재시도 로직 포함
   */
  private async gitHubGraphQLQuery(query: string, variables: any, retryCount: number = 0): Promise<any> {
    try {
      // GraphQL 쿼리 실행
      const result = await this.graphqlWithAuth(query, variables);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // 레이트 리밋 오류 처리 (429 Too Many Requests)
      if (errorMessage.includes('rate limit') || errorMessage.includes('limit exceeded')) {
        logger.warn(`[GitHub] GraphQL API 레이트 리밋 도달: ${errorMessage}`);
        
        // 최대 3번까지 재시도
        if (retryCount < 3) {
          const waitTime = Math.pow(2, retryCount) * 1000; // 지수 백오프
          logger.info(`[GitHub] ${waitTime}ms 후 GraphQL 쿼리 재시도 (${retryCount + 1}/3)`);
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.gitHubGraphQLQuery(query, variables, retryCount + 1);
        }
      }
      
      // GitHub Enterprise 문서 URL이 반환되는 경우 
      if (errorMessage.includes('docs.github.com/enterprise-server')) {
        logger.error(`[GitHub] GraphQL 엔드포인트 문제 - 문서 URL이 반환됨: ${errorMessage}`);
        throw new Error(`GitHub Enterprise GraphQL API 엔드포인트가 올바르지 않습니다. 현재: ${this.graphqlEndpoint}`);
      }
      
      // 인증 오류 처리
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Bad credentials')) {
        logger.error(`[GitHub] GraphQL API 인증 오류: ${errorMessage}`);
        throw new Error(`GitHub API 인증 오류: 액세스 토큰을 확인하세요`);
      }
      
      // 기타 오류
      throw error;
    }
  }

  /**
   * 저장소 동기화를 위한 정적 팩토리 메서드
   * 설정에서 올바른 계정 타입과 토큰을 가져와 GitHubDataCollector 인스턴스를 생성합니다.
   */
  public static async createForRepository(repositoryId: number): Promise<GitHubDataCollector> {
    // 환경 변수에 따라 적절한 레포지토리 구현체 선택
    let settingsRepo: SettingsRepository;
    let repoInfoRepo: RepositoryInfoRepository;
    
    logger.info(`[GitHubDataCollector] 저장소 ID ${repositoryId}에 대한 데이터 수집기 생성 중...`);
    
    // Drizzle DB 모듈 임포트
    const db = await import('../../../../db/index.js');
    
    if (db.DB_TYPE === 'sqlite') {
      logger.info(`[GitHubDataCollector] SQLite DB 사용: ${db.DB_TYPE}`);
      // 기존 구현체 불러오기
      const { SQLiteAdapter } = await import('../../../../db/adapters/SQLiteAdapter.js');
      const sqliteFilePath = process.env.SQLITE_FILE_PATH || ':memory:';
      const sqliteAdapter = new SQLiteAdapter(sqliteFilePath);
      await sqliteAdapter.initialize();
      
      const { SQLiteSettingsRepository } = await import('../../../../repositories/implementations/SQLiteSettingsRepository.js');
      const { SQLiteRepositoryInfoRepository } = await import('../../../../repositories/implementations/SQLiteRepositoryInfoRepository.js');
      
      settingsRepo = new SQLiteSettingsRepository(sqliteAdapter);
      repoInfoRepo = new SQLiteRepositoryInfoRepository(sqliteAdapter);
    } else {
      logger.info(`[GitHubDataCollector] PostgreSQL DB 사용: ${db.DB_TYPE}`);
      const { PostgresSettingsRepository } = await import('../../../../repositories/implementations/PostgresSettingsRepository.js');
      const { PostgresRepositoryInfoRepository } = await import('../../../../repositories/implementations/PostgresRepositoryInfoRepository.js');
      
      settingsRepo = new PostgresSettingsRepository();
      repoInfoRepo = new PostgresRepositoryInfoRepository();
    }
    
    try {
      // 저장소 정보 조회
      logger.info(`[GitHubDataCollector] 저장소 정보 조회 중... (ID: ${repositoryId})`);
      const repository = await repoInfoRepo.findById(repositoryId);
      
      if (!repository) {
        const errorMsg = `저장소 ID ${repositoryId}를 찾을 수 없습니다.`;
        logger.error(`[GitHubDataCollector] ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      logger.info(`[GitHubDataCollector] 저장소 타입: ${repository.type}`);
      
      // 저장소 타입에 따른 API 토큰 및 URL 설정
      let accessToken: string | undefined;
      let baseUrl: string | undefined = repository.apiUrl;
      
      // 설정 정보 조회 - 리포지토리 사용
      const accountsSettings = await settingsRepo.getSettings('1', 'accounts');
      
      if (!accountsSettings) {
        const errorMsg = '계정 설정을 찾을 수 없습니다.';
        logger.error(`[GitHubDataCollector] ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      if (repository.type === 'github_enterprise') {
        // GitHub Enterprise 설정 로드
        logger.info(`[GitHubDataCollector] GitHub Enterprise 설정 로드 중...`);
        const enterpriseSettings = await accountsSettings.getGitHubEnterpriseSettings?.() || { enterpriseUrl: '', enterpriseToken: '' };
        
        // 안전한 액세스 토큰 가져오기
        try {
          accessToken = repository.apiToken || enterpriseSettings.enterpriseToken;
          logger.debug(`[GitHubDataCollector] Enterprise 토큰 타입: ${typeof accessToken}`);
        } catch (tokenAccessError) {
          logger.error(`[GitHubDataCollector] Enterprise 토큰 액세스 중 오류: ${tokenAccessError instanceof Error ? tokenAccessError.message : String(tokenAccessError)}`);
          accessToken = undefined;
        }
        
        // API URL이 없는 경우 설정에서 가져옴
        if (!baseUrl && enterpriseSettings.enterpriseUrl) {
          baseUrl = enterpriseSettings.enterpriseUrl;
          logger.info(`[GitHubDataCollector] Enterprise API URL 설정됨: ${baseUrl}`);
        }
        
        // 토큰 유효성 검증 (안전하게 처리)
        if (!accessToken) {
          const errorMsg = `GitHub Enterprise 토큰이 설정되지 않았습니다.`;
          logger.error(`[GitHubDataCollector] ${errorMsg}`);
          throw new Error(errorMsg);
        } else {
          try {
            const tokenStr = extractToken(accessToken);
            if (!tokenStr || tokenStr.length < 30) {
              logger.warn(`[GitHubDataCollector] GitHub Enterprise 토큰이 너무 짧거나 유효하지 않습니다. 유효한지 확인하세요.`);
            } else {
              try {
                logger.info(`[GitHubDataCollector] GitHub Enterprise 토큰 설정됨 (${getMaskedToken(tokenStr)})`);
              } catch (maskError) {
                logger.error(`[GitHubDataCollector] 토큰 마스킹 중 오류: ${maskError instanceof Error ? maskError.message : String(maskError)}`);
                logger.info(`[GitHubDataCollector] GitHub Enterprise 토큰 설정됨 (마스킹 실패)`);
              }
            }
          } catch (tokenError) {
            logger.error(`[GitHubDataCollector] 토큰 처리 중 오류: ${tokenError instanceof Error ? tokenError.message : String(tokenError)}`);
            logger.warn(`[GitHubDataCollector] 토큰 처리 실패, 일부 기능이 제한될 수 있습니다.`);
          }
        }
      } else if (repository.type === 'github') {
        // GitHub 설정 로드
        logger.info(`[GitHubDataCollector] GitHub 설정 로드 중...`);
        const githubSettings = await accountsSettings.getGitHubSettings?.() || { token: '' };
        
        // 저장소 자체 토큰 우선 사용, 없으면 전역 설정 사용 (안전하게 액세스)
        try {
          accessToken = repository.apiToken || githubSettings.token;
          logger.debug(`[GitHubDataCollector] GitHub 토큰 타입: ${typeof accessToken}`);
        } catch (tokenAccessError) {
          logger.error(`[GitHubDataCollector] GitHub 토큰 액세스 중 오류: ${tokenAccessError instanceof Error ? tokenAccessError.message : String(tokenAccessError)}`);
          accessToken = undefined;
        }
        
        // API URL이 없으면 기본 GitHub API URL 사용
        if (!baseUrl) {
          baseUrl = 'https://api.github.com';
          logger.info(`[GitHubDataCollector] 기본 GitHub API URL 설정됨: ${baseUrl}`);
        }
        
        // 토큰 유효성 검증 (안전하게 처리)
        if (!accessToken) {
          logger.warn(`[GitHubDataCollector] GitHub 토큰이 설정되지 않았습니다. API 요청 제한이 적용됩니다.`);
        } else {
          try {
            const tokenStr = extractToken(accessToken);
            if (!tokenStr || tokenStr.length < 30) {
              logger.warn(`[GitHubDataCollector] GitHub 토큰이 너무 짧거나 유효하지 않습니다. 유효한지 확인하세요.`);
            } else {
              try {
                logger.info(`[GitHubDataCollector] GitHub 토큰 설정됨 (${getMaskedToken(tokenStr)})`);
              } catch (maskError) {
                logger.error(`[GitHubDataCollector] 토큰 마스킹 중 오류: ${maskError instanceof Error ? maskError.message : String(maskError)}`);
                logger.info(`[GitHubDataCollector] GitHub 토큰 설정됨 (마스킹 실패)`);
              }
            }
          } catch (tokenError) {
            logger.error(`[GitHubDataCollector] 토큰 처리 중 오류: ${tokenError instanceof Error ? tokenError.message : String(tokenError)}`);
            logger.warn(`[GitHubDataCollector] 토큰 처리 실패, 일부 기능이 제한될 수 있습니다.`);
          }
        }
      } else {
        // 기타 저장소 타입 (안전하게 토큰 액세스)
        try {
          accessToken = repository.apiToken;
          
          if (accessToken) {
            try {
              logger.info(`[GitHubDataCollector] 저장소 자체 토큰 사용 (${getMaskedToken(accessToken)})`);
            } catch (maskError) {
              logger.error(`[GitHubDataCollector] 토큰 마스킹 중 오류: ${maskError instanceof Error ? maskError.message : String(maskError)}`);
              logger.info(`[GitHubDataCollector] 저장소 자체 토큰 사용 (마스킹 실패)`);
            }
          } else {
            logger.info(`[GitHubDataCollector] 저장소 자체 토큰: 없음`);
          }
        } catch (tokenAccessError) {
          logger.error(`[GitHubDataCollector] 저장소 토큰 액세스 중 오류: ${tokenAccessError instanceof Error ? tokenAccessError.message : String(tokenAccessError)}`);
          accessToken = undefined;
        }
      }
      
      // GitHubDataCollector 인스턴스 생성 및 반환
      logger.info(`[GitHubDataCollector] 데이터 수집기 초기화 완료, ID: ${repositoryId}, URL: ${baseUrl || 'default'}`);
      
      try {
        // 안전한 인스턴스 생성
        return new GitHubDataCollector(repoInfoRepo, repositoryId, accessToken, baseUrl);
      } catch (initError) {
        logger.error(`[GitHubDataCollector] 인스턴스 생성 중 오류 발생: ${initError instanceof Error ? initError.message : String(initError)}`);
        
        if (initError instanceof Error && initError.stack) {
          logger.error(`[GitHubDataCollector] 스택 트레이스: ${initError.stack}`);
        }
        
        // 오류 세부 정보 로깅 및 재전달
        throw new Error(`GitHubDataCollector 인스턴스 생성 실패: ${initError instanceof Error ? initError.message : String(initError)}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[GitHubDataCollector] 데이터 수집기 생성 중 오류 발생: ${errorMsg}`);
      
      if (error instanceof Error && error.stack) {
        logger.error(`[GitHubDataCollector] 스택 트레이스: ${error.stack}`);
      }
      
      throw error;
    }
  }
}