import { Octokit } from "@octokit/rest";
import { DeploymentEvent } from "../types/github";

// Octokit 인스턴스 생성 함수
const createOctokit = () => {
  // 먼저 로컬 스토리지에서 토큰 확인
  const tokenFromStorage = localStorage.getItem('github_token');
  
  // 환경 변수에서 토큰 또는 로컬 스토리지에서 가져온 토큰 사용
  const token = import.meta.env.VITE_GITHUB_TOKEN || tokenFromStorage || '';
  
  // 토큰 상태 디버깅 로그 추가
  console.log('GitHub 토큰 상태:', {
    tokenFromEnv: Boolean(import.meta.env.VITE_GITHUB_TOKEN),
    tokenFromStorage: Boolean(tokenFromStorage),
    finalTokenUsed: Boolean(token),
    tokenLength: token ? token.length : 0
  });

  // 유효하지 않은 토큰이 설정되었을 수 있음을 확인
  if (token && token.length < 10) {
    console.warn('GitHub 토큰이 너무 짧습니다. 유효한 토큰인지 확인하세요.');
  }
  
  return new Octokit({ 
    auth: token,
    request: {
      retries: 3,
      retryAfter: 60,
    }
  });
};

// 지연 함수
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API 요청 래퍼 함수 - 재시도 메커니즘 추가
async function fetchWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await apiCall();
    } catch (error: any) {
      console.error('GitHub API 요청 오류:', error);
      
      // 토큰 상태 로그 (오류 발생 시)
      const tokenFromStorage = localStorage.getItem('github_token');
      const token = import.meta.env.VITE_GITHUB_TOKEN || tokenFromStorage || '';
      console.log('오류 발생 시 토큰 상태:', {
        hasToken: Boolean(token),
        tokenLength: token ? token.length : 0
      });
      
      if (error.status === 403 && error.message && error.message.includes('rate limit')) {
        // 속도 제한 오류
        if (retries >= maxRetries) {
          // 최대 재시도 횟수 초과
          if (!token) {
            throw new Error(`GitHub API 속도 제한에 도달했습니다. GitHub 토큰을 설정해야 합니다. 화면 우측 상단의 "GitHub 토큰 설정" 버튼을 클릭하여 토큰을 설정해 주세요. (${error.message})`);
          } else {
            throw new Error(`GitHub API 속도 제한에 도달했습니다. 설정된 토큰이 유효하지 않거나 권한이 부족할 수 있습니다. 토큰을 확인하고 다시 시도해 주세요. (${error.message})`);
          }
        }
        
        retries++;
        console.warn(`GitHub API 속도 제한에 도달했습니다. ${delay/1000}초 후 재시도 (${retries}/${maxRetries})...`);
        
        // 지수 백오프로 대기 시간 증가
        await sleep(delay);
        delay *= 2;
        
        // Octokit 인스턴스 재생성 (토큰이 업데이트되었을 경우를 대비)
        octokit = createOctokit();
        continue;
      }
      
      // 다른 종류의 오류 처리
      if (error.status === 401) {
        throw new Error(`GitHub 인증 오류: 토큰이 유효하지 않습니다. 토큰을 확인하고 다시 시도해 주세요. (${error.message})`);
      } else if (error.status === 404) {
        throw new Error(`요청한 리소스를 찾을 수 없습니다. 저장소 이름이 올바른지 확인해 주세요. (${error.message})`);
      } else if (error.status >= 500) {
        throw new Error(`GitHub 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. (${error.message})`);
      }
      
      // 기타 오류
      throw error;
    }
  }
}

// Octokit 인스턴스 생성
let octokit = createOctokit();

// 타입 정의
export interface PullRequest {
  id: number;
  number: number;
  title: string;
  user: {
    login: string;
  };
  created_at: string;
  merged_at: string | null;
  closed_at: string | null;
  state: string;
  html_url: string;
}

export interface Review {
  id: number;
  user: {
    login: string;
  };
  state: string;
  submitted_at: string;
  body: string;
}

export interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

/**
 * PR 데이터 수집 함수
 */
export async function fetchPullRequests(owner: string, repo: string, since: string, until: string): Promise<PullRequest[]> {
  try {
    const data = await fetchWithRetry(async () => {
      const response = await octokit.pulls.list({
        owner,
        repo,
        state: "all",
        per_page: 100,
      });
      return response.data;
    });
    
    // 선택 기간에 맞게 필터링
    return data.filter(pr => {
      const createdAt = new Date(pr.created_at);
      return createdAt >= new Date(since) && createdAt <= new Date(until);
    }) as PullRequest[];
  } catch (error) {
    console.error("PR 데이터 가져오기 오류:", error);
    throw error;
  }
}

/**
 * PR에 대한 코멘트 목록 가져오기
 */
export async function fetchPullRequestComments(owner: string, repo: string, pullNumber: number): Promise<any[]> {
  try {
    const data = await fetchWithRetry(async () => {
      const response = await octokit.pulls.listComments({
        owner,
        repo,
        pull_number: pullNumber,
      });
      return response.data;
    });
    
    return data;
  } catch (error) {
    console.error(`PR #${pullNumber} 코멘트 가져오기 오류:`, error);
    throw error;
  }
}

/**
 * PR 리뷰 데이터 가져오기
 */
export async function fetchPullRequestReviews(owner: string, repo: string, pullNumber: number): Promise<Review[]> {
  try {
    const data = await fetchWithRetry(async () => {
      const response = await octokit.pulls.listReviews({
        owner,
        repo,
        pull_number: pullNumber,
      });
      return response.data;
    });
    
    return data as Review[];
  } catch (error) {
    console.error(`PR #${pullNumber} 리뷰 가져오기 오류:`, error);
    throw error;
  }
}

/**
 * PR 커밋 목록 가져오기
 */
export async function fetchPullRequestCommits(owner: string, repo: string, pullNumber: number): Promise<Commit[]> {
  try {
    const data = await fetchWithRetry(async () => {
      const response = await octokit.pulls.listCommits({
        owner,
        repo,
        pull_number: pullNumber,
      });
      return response.data;
    });
    
    return data as Commit[];
  } catch (error) {
    console.error(`PR #${pullNumber} 커밋 가져오기 오류:`, error);
    throw error;
  }
}

/**
 * 커밋 상세 정보 가져오기
 */
export async function fetchCommitDetails(owner: string, repo: string, sha: string): Promise<Commit> {
  try {
    const data = await fetchWithRetry(async () => {
      const response = await octokit.repos.getCommit({
        owner,
        repo,
        ref: sha,
      });
      return response.data;
    });
    
    return data as unknown as Commit;
  } catch (error) {
    console.error(`커밋 ${sha} 상세정보 가져오기 오류:`, error);
    throw error;
  }
}

/**
 * 배포 이벤트 가져오기 (이 프로젝트에서는 PR 이벤트로 대체)
 */
export async function fetchDeployments(owner: string, repo: string): Promise<DeploymentEvent[]> {
  try {
    // 이 함수는 실제 배포 정보를 가져오는 것이 아닌 
    // PR 이벤트를 배포 이벤트로 변환하여 제공합니다.
    // 실제 배포 이벤트는 GitHub Deployments API 또는 
    // GitHub Actions 워크플로우 실행 정보를 활용할 수 있습니다.
    
    const data = await fetchWithRetry(async () => {
      const response = await octokit.pulls.list({
        owner,
        repo,
        state: "closed",
        per_page: 100,
      });
      return response.data;
    });
    
    // PR 데이터를 DeploymentEvent로 변환
    const deploymentEvents: DeploymentEvent[] = data
      .filter(pr => pr.merged_at !== null) // 머지된 PR만 배포로 간주
      .map(pr => ({
        id: pr.id,
        created_at: pr.merged_at || pr.closed_at || pr.created_at,
        environment: 'production',
        has_issues: Math.random() < 0.2, // 20% 확률로 이슈 있음으로 설정
        repository: `${owner}/${repo}`,
        description: pr.title,
      }));
    
    return deploymentEvents;
  } catch (error) {
    console.error("배포 이벤트 가져오기 오류:", error);
    throw error;
  }
}

/**
 * 배포 상태가 실패인지 확인하는 함수
 */
export function hasDeploymentIssues(status: string): boolean {
  const failedStatuses = ['error', 'failure', 'failed', 'rejected'];
  return failedStatuses.includes(status.toLowerCase());
} 