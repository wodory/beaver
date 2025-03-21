import { graphql } from '@octokit/graphql';
// import { Octokit } from '@octokit/rest';
import { getDB } from '../../../../db/index.js';
// import { eq, and, asc, desc, gt, lt } from 'drizzle-orm';
import { eq, and } from 'drizzle-orm';
import { logger } from '../../../../utils/logger.js';
import {
  repositories,
  commits,
  users,
  pullRequests,
  prReviews
} from '../../../../db/schema/index.js';

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
    
    // REST API 클라이언트 초기화 (폴백용)
    // this.octokit = new Octokit({
    //   auth: accessToken || process.env.GITHUB_TOKEN,
    //   baseUrl: baseUrl ? `${baseUrl}/api/v3` : undefined
    // });
    
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
      const { repository } = await this.getRepositoryInfo();
      const lastSyncAt = repository.lastSyncAt || new Date(0);
      
      logger.info(`커밋 수집 시작: ${this.owner}/${this.repo}, 마지막 동기화: ${lastSyncAt.toISOString()}`);
      
      // 커밋 수집 카운터 초기화
      let newCommitCount = 0;
      let hasNextPage = true;
      let cursor = null;
      
      // 페이지네이션을 통한 모든 커밋 수집
      while (hasNextPage) {
        const { commits: commitData, pageInfo } = await this.fetchCommitBatch(
          this.owner, 
          this.repo, 
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
      logger.error(`커밋 수집 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
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
      logger.error(`GitHub GraphQL API 호출 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
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
      logger.error(`사용자 확인/저장 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
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
      logger.error(`동기화 시간 업데이트 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * 모든 데이터 동기화 (커밋, PR, 리뷰)
   * 저장소의 모든 GitHub 데이터를 동기화하는 메인 메서드
   */
  async syncAll(): Promise<{
    commitCount: number;
    pullRequestCount: number;
    reviewCount: number;
  }> {
    try {
      // 1. 커밋 데이터 수집
      logger.info(`저장소 ID ${this.repositoryId} 커밋 데이터 동기화 시작`);
      const commitCount = await this.collectCommits();
      
      // 2. PR 및 리뷰 데이터 수집
      logger.info(`저장소 ID ${this.repositoryId} PR 데이터 동기화 시작`);
      const { pullRequestCount, reviewCount } = await this.collectPullRequestsAndReviews();
      
      // 3. 동기화 시간 업데이트
      await this.updateLastSyncAt();
      
      // 결과 반환
      return {
        commitCount,
        pullRequestCount,
        reviewCount
      };
    } catch (error) {
      logger.error(`저장소 ID ${this.repositoryId} 데이터 동기화 중 오류: ${error instanceof Error ? error.message : String(error)}`);
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
      const { repository } = await this.getRepositoryInfo();
      const lastSyncAt = repository.lastSyncAt || new Date(0);
      
      logger.info(`PR 및 리뷰 수집 시작: ${this.owner}/${this.repo}, 마지막 동기화: ${lastSyncAt.toISOString()}`);
      
      // 카운터 초기화
      let newPrCount = 0;
      let newReviewCount = 0;
      let hasNextPage = true;
      let cursor = null;
      
      // 페이지네이션을 통한 모든 PR 수집
      while (hasNextPage) {
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
   * GraphQL을 사용하여 PR 및 리뷰 데이터 배치 가져오기
   * @param owner 저장소 소유자
   * @param name 저장소 이름
   * @param since 마지막 동기화 시간 (ISO 문자열)
   * @param cursor 페이지네이션 커서
   * @returns PR 데이터 목록과 페이지네이션 정보
   */
  async fetchPullRequestBatch(owner: string, name: string, since: string, cursor: string | null = null) {
    try {
      // 마지막 동기화 이후 업데이트된 PR만 가져오도록 개선된 쿼리
      const query = `
        query GetRepositoryPullRequests($owner: String!, $name: String!, $since: DateTime, $cursor: String) {
          repository(owner: $owner, name: $name) {
            pullRequests(
              first: 50, 
              after: $cursor, 
              orderBy: {field: UPDATED_AT, direction: DESC},
              filterBy: {since: $since}
            ) {
              nodes {
                number
                title
                body
                state
                isDraft
                createdAt
                updatedAt
                closedAt
                mergedAt
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
                comments(first: 1) {
                  totalCount
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
      
      const result = await this.graphqlWithAuth(query, {
        owner,
        name,
        since,
        cursor
      });
      
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
      logger.error(`GitHub GraphQL API 호출 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
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
          this.extractGitHubId(prData.author.id),
          prData.author.avatarUrl
        ) : null;
        
        // 3. PR 병합자 정보 처리
        let mergedById = null;
        if (prData.mergedBy) {
          mergedById = await this.ensureUser(
            prData.mergedBy.login,
            '',
            prData.mergedBy.login,
            this.extractGitHubId(prData.mergedBy.id)
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
            this.extractGitHubId(reviewData.author.id),
            reviewData.author.avatarUrl
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
  private extractGitHubId(nodeId: string | null): number | null {
    if (!nodeId) return null;
    
    try {
      // Base64 디코딩
      const decoded = Buffer.from(nodeId, 'base64').toString('utf-8');
      // "User:1234" 같은 형식에서 숫자 부분 추출
      const match = decoded.match(/:(\d+)$/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    } catch (error) {
      logger.warn(`GitHub 노드 ID(${nodeId}) 파싱 중 오류: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return null;
  }
} 