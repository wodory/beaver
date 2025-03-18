import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";
import { logger } from "../../utils/logger";

// 도메인 타입 정의
interface Domain {
  name: string;
  url: string;
  apiUrl: string;
  company?: string;
}

/**
 * GitHub API를 통해 Pull Request와 리뷰 데이터를 수집하는 클래스
 */
export class GitHubApiCollector {
  private octokit: Octokit;
  private graphqlWithAuth: any;
  private token: string;
  private baseUrl: string;
  private apiUrl: string;
  private graphqlUrl: string;
  private useAuth: boolean = true;

  constructor(domain?: Domain) {
    this.token = process.env.GITHUB_TOKEN || '';
    
    if (domain) {
      // 도메인 정보가 제공된 경우 해당 정보 사용
      this.baseUrl = domain.url;
      this.apiUrl = domain.apiUrl || `${this.baseUrl}/api/v3`;
      this.graphqlUrl = domain.apiUrl ? `${domain.apiUrl.replace('/api/v3', '')}/api/graphql` : `${this.baseUrl}/api/graphql`;
    } else {
      // 환경변수에서 정보 가져오기
      this.baseUrl = process.env.GITHUB_ENTERPRISE_URL || 'https://api.github.com';
      
      if (this.baseUrl === 'https://api.github.com') {
        this.apiUrl = this.baseUrl;
        this.graphqlUrl = 'https://api.github.com/graphql';
      } else {
        this.apiUrl = this.baseUrl.endsWith('/') 
          ? `${this.baseUrl}api/v3` 
          : `${this.baseUrl}/api/v3`;
        this.graphqlUrl = this.baseUrl.endsWith('/') 
          ? `${this.baseUrl}api/graphql` 
          : `${this.baseUrl}/api/graphql`;
      }
    }
    
    if (!this.token) {
      logger.warn('GitHub 토큰이 설정되지 않았습니다. API 호출이 제한될 수 있습니다.');
      this.useAuth = false;
    }
    
    // URL 정보 로그 출력
    logger.info(`GitHub API 기본 URL: ${this.baseUrl}`);
    logger.info(`REST API URL: ${this.apiUrl}`);
    logger.info(`GraphQL API URL: ${this.graphqlUrl}`);
    
    try {
      // Octokit 옵션 설정
      const options: any = {
        baseUrl: this.apiUrl,
        throttle: {
          onRateLimit: (retryAfter: number, _options: any, _octokit: any, retryCount: number) => {
            logger.warn(`GitHub API 호출 제한 도달 - ${retryCount + 1}번째 시도 (${retryAfter}초 후 재시도)`);
            if (retryCount < 3) return true; // 최대 3번 재시도
            return false;
          },
          onSecondaryRateLimit: (retryAfter: number, _options: any, _octokit: any) => {
            logger.warn(`GitHub API 보조 제한 도달 - ${retryAfter}초 후 재시도`);
            return true;
          },
        }
      };
      
      // 인증 옵션 추가
      if (this.useAuth && this.token) {
        options.auth = this.token;
        logger.info('REST API 인증 사용: 토큰 인증 설정됨');
      } else {
        logger.info('REST API 인증 사용하지 않음: 인증 없이 접근 (제한된 요청만 가능)');
      }
      
      this.octokit = new Octokit(options);
    } catch (error) {
      logger.error(`Octokit 초기화 중 오류: ${error}`);
      // 인증 없이 재시도
      this.octokit = new Octokit({
        baseUrl: this.apiUrl
      });
      logger.info('인증 오류로 인해 인증 없이 Octokit 초기화');
    }
    
    try {
      // GraphQL 클라이언트 설정
      const graphqlOptions: any = {
        url: this.graphqlUrl
      };
      
      // 인증 옵션 추가
      if (this.useAuth && this.token) {
        graphqlOptions.headers = {
          authorization: `token ${this.token}` // GitHub에서는 'token ' 접두사 사용
        };
        logger.info('GraphQL API 인증 사용: 토큰 인증 설정됨');
      } else {
        logger.info('GraphQL API 인증 사용하지 않음: 인증 없이 접근 (제한된 요청만 가능)');
      }
      
      this.graphqlWithAuth = graphql.defaults(graphqlOptions);
    } catch (error) {
      logger.error(`GraphQL 클라이언트 초기화 중 오류: ${error}`);
      // 인증 없이 재시도
      this.graphqlWithAuth = graphql.defaults({
        url: this.graphqlUrl
      });
      logger.info('인증 오류로 인해 인증 없이 GraphQL 클라이언트 초기화');
    }
  }

  /**
   * 특정 저장소의 Pull Request 데이터를 수집 (REST API)
   * @param owner 저장소 소유자 (GitHub 계정명)
   * @param repo 저장소 이름
   * @param since 특정 날짜 이후의 PR만 수집 (증분 업데이트)
   */
  async collectPullRequests(owner: string, repo: string, since?: Date): Promise<any[]> {
    try {
      logger.info(`${owner}/${repo} 저장소의 PR 데이터 수집 시작`);
      
      // 페이지네이션을 위한 설정
      let page = 1;
      const perPage = 100;
      let hasMorePRs = true;
      const allPRs: any[] = [];
      
      // since 파라미터가 없으면 현재로부터 90일 전을 기본값으로 설정
      const sinceDate = since || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      
      while (hasMorePRs) {
        try {
          // PR 목록 가져오기 (state: all로 open/closed/merged 모두 가져옴)
          const { data: prs } = await this.octokit.pulls.list({
            owner,
            repo,
            state: 'all',
            per_page: perPage,
            page,
            sort: 'updated',
            direction: 'desc',
          });
          
          if (prs.length === 0) {
            hasMorePRs = false;
            continue;
          }
          
          // 최신 PR부터 가져오므로, 마지막 PR이 지정된 날짜보다 이전이면 중단
          const oldestPRUpdateTime = new Date(prs[prs.length - 1].updated_at);
          if (oldestPRUpdateTime < sinceDate) {
            hasMorePRs = false;
          }
          
          // 지정된 날짜 이후에 업데이트된 PR만 필터링하여 추가
          const filteredPRs = prs.filter(pr => new Date(pr.updated_at) >= sinceDate);
          allPRs.push(...filteredPRs);
          
          // 다음 페이지로
          page++;
          
        } catch (error) {
          logger.error(`PR 목록 가져오기 실패 (${owner}/${repo}): ${error}`);
          hasMorePRs = false; // 에러 발생 시 중단
        }
      }
      
      logger.info(`${owner}/${repo} 저장소의 PR 데이터 수집 완료 (총 ${allPRs.length}개)`);
      return allPRs;
    } catch (error) {
      logger.error(`PR 데이터 수집 중 오류 발생: ${error}`);
      throw error;
    }
  }
  
  /**
   * GraphQL을 사용하여 PR 데이터를 수집 (REST API보다 효율적)
   * @param owner 저장소 소유자
   * @param repo 저장소 이름
   * @param since 특정 날짜 이후의 PR만 수집
   */
  async collectPullRequestsWithGraphQL(owner: string, repo: string, since?: Date): Promise<any[]> {
    try {
      logger.info(`GraphQL을 사용하여 ${owner}/${repo} 저장소의 PR 데이터 수집 시작`);
      
      // since 파라미터가 없으면 현재로부터 90일 전을 기본값으로 설정
      const sinceDate = since || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const sinceISOString = sinceDate.toISOString();
      
      let hasNextPage = true;
      let endCursor: string | null = null;
      const pullRequests: any[] = [];
      
      // 페이지네이션을 통해 모든 PR 가져오기
      while (hasNextPage) {
        // GitHub Enterprise GraphQL 스키마는 GitHub.com과 약간 다를 수 있음
        // since 변수를 쿼리에서 제거하고 나중에 클라이언트 사이드에서 필터링
        const query = `
          query ($owner: String!, $repo: String!, $cursor: String) {
            repository(owner: $owner, name: $repo) {
              pullRequests(first: 100, after: $cursor, orderBy: {field: UPDATED_AT, direction: DESC}) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
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
                    }
                  }
                  mergedBy {
                    login
                    ... on User {
                      id
                      avatarUrl
                    }
                  }
                  reviews(first: 50) {
                    nodes {
                      id
                      author {
                        login
                        ... on User {
                          id
                          avatarUrl
                        }
                      }
                      state
                      body
                      submittedAt
                    }
                  }
                }
              }
            }
          }
        `;
        
        // GraphQL 쿼리 실행 - since 변수 제거함
        const result: any = await this.graphqlWithAuth({
          query,
          owner,
          repo,
          cursor: endCursor
        });
        
        // PR 목록 추출
        const nodes = result.repository.pullRequests.nodes;
        
        // 최신 PR부터 가져오므로, 마지막 PR이 지정된 날짜보다 이전이면 중단
        if (nodes.length > 0) {
          const lastNodeUpdatedAt = new Date(nodes[nodes.length - 1].updatedAt);
          if (lastNodeUpdatedAt < sinceDate) {
            // sinceDate보다 이전인 PR은 필터링
            const filteredNodes = nodes.filter((node: any) => new Date(node.updatedAt) >= sinceDate);
            pullRequests.push(...filteredNodes);
            hasNextPage = false;
            continue;
          } else {
            // 모든 PR이 sinceDate보다 이후인 경우 모두 추가
            pullRequests.push(...nodes);
          }
        }
        
        // 다음 페이지 정보 업데이트
        const pageInfo: { hasNextPage: boolean; endCursor: string | null } = result.repository.pullRequests.pageInfo;
        hasNextPage = pageInfo.hasNextPage;
        endCursor = pageInfo.endCursor;
        
        if (nodes.length === 0) {
          hasNextPage = false;
        }
      }
      
      logger.info(`GraphQL을 사용하여 ${owner}/${repo} 저장소의 PR 데이터 수집 완료 (총 ${pullRequests.length}개)`);
      
      // REST API 형식과 호환되도록 데이터 변환
      return pullRequests.map(pr => {
        return {
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: pr.state,
          draft: pr.isDraft,
          created_at: pr.createdAt,
          updated_at: pr.updatedAt,
          closed_at: pr.closedAt,
          merged_at: pr.mergedAt,
          additions: pr.additions,
          deletions: pr.deletions,
          changed_files: pr.changedFiles,
          user: pr.author ? {
            login: pr.author.login,
            id: pr.author.id,
            avatar_url: pr.author.avatarUrl
          } : null,
          merged_by: pr.mergedBy ? {
            login: pr.mergedBy.login,
            id: pr.mergedBy.id,
            avatar_url: pr.mergedBy.avatarUrl
          } : null,
          reviews: pr.reviews.nodes.map((review: any) => ({
            id: review.id,
            user: review.author ? {
              login: review.author.login,
              id: review.author.id,
              avatar_url: review.author.avatarUrl
            } : null,
            state: review.state,
            body: review.body,
            submitted_at: review.submittedAt
          }))
        };
      });
    } catch (error) {
      logger.error(`GraphQL을 사용한 PR 데이터 수집 중 오류 발생: ${error}`);
      // GraphQL 실패 시 REST API로 폴백
      logger.info(`REST API로 대체하여 시도합니다.`);
      return this.collectPullRequests(owner, repo, since);
    }
  }
  
  /**
   * 특정 PR의 리뷰 데이터를 수집
   * @param owner 저장소 소유자
   * @param repo 저장소 이름
   * @param prNumber PR 번호
   */
  async collectPRReviews(owner: string, repo: string, prNumber: number): Promise<any[]> {
    try {
      logger.debug(`PR #${prNumber} 리뷰 수집 시작`);
      
      // PR 리뷰 목록 가져오기
      const { data: reviews } = await this.octokit.pulls.listReviews({
        owner,
        repo,
        pull_number: prNumber,
        per_page: 100, // 대부분의 PR은 100개 이하의 리뷰를 가짐
      });
      
      logger.debug(`PR #${prNumber} 리뷰 수집 완료 (총 ${reviews.length}개)`);
      return reviews;
    } catch (error) {
      logger.error(`PR #${prNumber} 리뷰 수집 중 오류 발생: ${error}`);
      return []; // 실패 시 빈 배열 반환
    }
  }
  
  /**
   * 특정 PR의 코드 변경 통계를 가져옴
   * @param owner 저장소 소유자
   * @param repo 저장소 이름
   * @param prNumber PR 번호
   */
  async getPullRequestStats(owner: string, repo: string, prNumber: number): Promise<any> {
    try {
      logger.debug(`PR #${prNumber} 코드 변경 통계 가져오기 시작`);
      
      const { data: pr } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber
      });
      
      logger.debug(`PR #${prNumber} 코드 변경 통계 - 추가: ${pr.additions}, 삭제: ${pr.deletions}, 파일 변경: ${pr.changed_files}`);
      
      return {
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files
      };
    } catch (error) {
      logger.error(`PR #${prNumber} 코드 변경 통계 가져오기 실패: ${error}`);
      return {
        additions: 0,
        deletions: 0,
        changed_files: 0
      };
    }
  }
  
  /**
   * 특정 저장소의 PR와 리뷰 데이터를 모두 수집
   * @param owner 저장소 소유자
   * @param repo 저장소 이름
   * @param since 특정 날짜 이후의 데이터만 수집
   * @param useGraphQL GraphQL API를 사용할지 여부 (기본: true)
   */
  async collectRepositoryData(owner: string, repo: string, since?: Date, useGraphQL: boolean = true): Promise<any> {
    try {
      logger.info(`저장소 ${owner}/${repo} 데이터 수집 시작 (GraphQL: ${useGraphQL ? '사용' : '미사용'})`);
      
      let prs;
      
      // PR 데이터 수집 (GraphQL 또는 REST API)
      if (useGraphQL) {
        prs = await this.collectPullRequestsWithGraphQL(owner, repo, since);
      } else {
        // REST API로 PR 수집
        prs = await this.collectPullRequests(owner, repo, since);
        
        // 각 PR에 대한 리뷰 및 코드 변경 통계 수집
        prs = await Promise.all(
          prs.map(async (pr) => {
            // PR의 코드 변경 통계 수집
            if (!pr.additions || !pr.deletions || !pr.changed_files) {
              const stats = await this.getPullRequestStats(owner, repo, pr.number);
              pr.additions = stats.additions;
              pr.deletions = stats.deletions;
              pr.changed_files = stats.changed_files;
            }
            
            // PR의 리뷰 수집
            const reviews = await this.collectPRReviews(owner, repo, pr.number);
            return {
              ...pr,
              reviews
            };
          })
        );
      }
      
      logger.info(`저장소 ${owner}/${repo} 데이터 수집 완료`);
      
      return {
        prs: prs
      };
    } catch (error) {
      logger.error(`저장소 데이터 수집 중 오류 발생: ${error}`);
      throw error;
    }
  }
} 