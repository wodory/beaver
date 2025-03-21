import { graphql } from '@octokit/graphql';
import { getDB } from '../../../../db/index.js';
import { eq, and, asc, desc, gt, lt } from 'drizzle-orm';
import { logger } from '../../../../utils/logger.js';
import {
  repositories,
  commits,
  users,
  pullRequests,
  prReviews
} from '../../../../db/schema/index.js';

/**
 * GitHub GraphQL API로부터 커밋, PR, 리뷰 데이터를 수집하는 클래스
 */
export class GitHubDataCollector {
  private repositoryId: number;
  private graphqlWithAuth: any;
  private graphqlEndpoint: string;
  private db: any;

  /**
   * @param repositoryId 저장소 ID
   * @param accessToken GitHub API 액세스 토큰
   * @param baseUrl GitHub API 기본 URL (기본값: https://api.github.com)
   */
  constructor(repositoryId: number, accessToken?: string, baseUrl: string = 'https://api.github.com') {
    this.repositoryId = repositoryId;
    this.db = getDB();
    
    // GraphQL 엔드포인트 설정 (REST API URL에서 적절한 GraphQL URL로 변환)
    this.graphqlEndpoint = this.normalizeGraphQLEndpoint(baseUrl);
    
    // GraphQL 클라이언트 초기화
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.authorization = `token ${accessToken}`;
    }
    
    this.graphqlWithAuth = graphql.defaults({
      baseUrl: this.graphqlEndpoint,
      headers
    });
    
    logger.info(`GitHubDataCollector 초기화: 저장소 ID ${repositoryId}, GraphQL 엔드포인트 ${this.graphqlEndpoint}`);
  }

  /**
   * REST API URL을 GraphQL 엔드포인트 URL로 변환
   */
  private normalizeGraphQLEndpoint(baseUrl: string): string {
    // REST API URL을 GraphQL URL로 변환
    // 일반적으로 https://api.github.com -> https://api.github.com/graphql
    // 또는 https://github.example.com/api/v3 -> https://github.example.com/api/graphql
    const normalizedUrl = baseUrl.replace(/\/v3\/?$/, '');
    return normalizedUrl.endsWith('/graphql') ? normalizedUrl : `${normalizedUrl}/graphql`;
  }

  /**
   * 저장소 정보 조회
   */
  async getRepositoryInfo() {
    try {
      if (!this.db) {
        throw new Error('데이터베이스가 초기화되지 않았습니다.');
      }
      
      const repository = await this.db.query.repositories.findFirst({
        where: eq(repositories.id, this.repositoryId)
      });
      
      if (!repository) {
        throw new Error(`저장소 ID ${this.repositoryId}를 찾을 수 없습니다.`);
      }
      
      const [owner, name] = repository.fullName.split('/');
      return { repository, owner, name };
    } catch (error) {
      logger.error(`저장소 정보 조회 중 오류 발생: ${error.message}`);
      throw error;
    }
  }

  /**
   * 커밋 데이터 수집 및 저장
   */
  async collectCommits(): Promise<number> {
    try {
      const { repository, owner, name } = await this.getRepositoryInfo();
      const lastSyncAt = repository.lastSyncAt || new Date(0);
      
      logger.info(`커밋 수집 시작: ${owner}/${name}, 마지막 동기화: ${lastSyncAt.toISOString()}`);
      
      // 커밋 수집 카운터 초기화
      let newCommitCount = 0;
      let hasNextPage = true;
      let cursor = null;
      
      // 페이지네이션을 통한 모든 커밋 수집
      while (hasNextPage) {
        const { commits: commitData, pageInfo } = await this.fetchCommitBatch(
          owner, 
          name, 
          lastSyncAt.toISOString(),
          cursor
        );
        
        // 수집된 커밋 처리
        const savedCount = await this.saveCommits(commitData);
        newCommitCount += savedCount;
        
        // 페이지네이션 정보 업데이트
        hasNextPage = pageInfo.hasNextPage;
        cursor = pageInfo.endCursor;
        
        logger.info(`커밋 배치 처리 완료: ${savedCount}개 저장, 다음 페이지: ${hasNextPage}`);
      }
      
      logger.info(`커밋 수집 완료: 총 ${newCommitCount}개의 새 커밋 수집됨`);
      return newCommitCount;
    } catch (error) {
      logger.error(`커밋 수집 중 오류 발생: ${error.message}`);
      throw error;
    }
  }

  /**
   * GraphQL을 사용하여 커밋 데이터 배치 가져오기
   */
  async fetchCommitBatch(owner: string, name: string, since: string, cursor: string | null = null) {
    try {
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
      
      const result = await this.graphqlWithAuth(query, {
        owner,
        name,
        since,
        cursor
      });
      
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
      logger.error(`GitHub GraphQL API 호출 중 오류 발생: ${error.message}`);
      throw error;
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
          commitData.author.user?.id,
          commitData.author.user?.avatarUrl
        );
        
        // 커미터 정보 확인/저장
        const committerId = await this.ensureUser(
          commitData.committer.name,
          commitData.committer.email,
          commitData.committer.user?.login,
          commitData.committer.user?.id
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
        logger.error(`커밋 ${commitData.oid} 저장 중 오류 발생: ${error.message}`);
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
    githubId: number | null = null,
    avatarUrl: string | null = null
  ): Promise<number> {
    try {
      let user = null;
      
      // 1. GitHub ID로 사용자 찾기
      if (githubId) {
        user = await this.db.query.users.findFirst({
          where: eq(users.githubId, githubId)
        });
      }
      
      // 2. 이메일로 사용자 찾기
      if (!user && email) {
        user = await this.db.query.users.findFirst({
          where: eq(users.email, email)
        });
      }
      
      // 3. 로그인으로 사용자 찾기
      if (!user && login) {
        user = await this.db.query.users.findFirst({
          where: eq(users.login, login)
        });
      }
      
      // 사용자가 없으면 새로 생성
      if (!user) {
        const result = await this.db.insert(users).values({
          name,
          email,
          login: login || name,
          githubId: githubId || null,
          avatarUrl: avatarUrl || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }).returning();
        
        user = result[0];
        logger.info(`새 사용자 추가: ${name} (${email || login})`);
      } else if ((githubId && !user.githubId) || (avatarUrl && !user.avatarUrl)) {
        // GitHub ID나 아바타 URL 등 추가 정보 업데이트
        await this.db.update(users)
          .set({ 
            githubId: githubId || user.githubId,
            avatarUrl: avatarUrl || user.avatarUrl,
            updatedAt: new Date().toISOString()
          })
          .where(eq(users.id, user.id));
          
        logger.info(`사용자 정보 업데이트: ID ${user.id} ${user.name || user.login}`);
      }
      
      return user.id;
    } catch (error) {
      logger.error(`사용자 확인/저장 중 오류 발생: ${error.message}`);
      throw error;
    }
  }

  /**
   * 마지막 동기화 시간 업데이트
   */
  async updateLastSyncAt(): Promise<void> {
    try {
      await this.db.update(repositories)
        .set({ 
          lastSyncAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .where(eq(repositories.id, this.repositoryId));
        
      logger.info(`저장소 ${this.repositoryId}의 마지막 동기화 시간 업데이트 완료`);
    } catch (error) {
      logger.error(`동기화 시간 업데이트 중 오류 발생: ${error.message}`);
      throw error;
    }
  }
} 