import { Octokit } from "@octokit/rest";

// Octokit 인스턴스 생성
const octokit = new Octokit({ auth: import.meta.env.VITE_GITHUB_TOKEN });

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
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state: "all",
      per_page: 100,
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
    const { data } = await octokit.pulls.listComments({
      owner,
      repo,
      pull_number: pullNumber,
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
    const { data } = await octokit.pulls.listReviews({
      owner,
      repo,
      pull_number: pullNumber,
    });
    
    return data as Review[];
  } catch (error) {
    console.error(`PR #${pullNumber} 리뷰 데이터 가져오기 오류:`, error);
    throw error;
  }
}

/**
 * PR에 포함된 커밋 목록 가져오기
 */
export async function fetchPullRequestCommits(owner: string, repo: string, pullNumber: number): Promise<Commit[]> {
  try {
    const { data } = await octokit.pulls.listCommits({
      owner,
      repo,
      pull_number: pullNumber,
    });
    
    return data as Commit[];
  } catch (error) {
    console.error(`PR #${pullNumber} 커밋 가져오기 오류:`, error);
    throw error;
  }
}

/**
 * 커밋의 상세 정보(변경된 라인 수 등) 가져오기
 */
export async function fetchCommitDetails(owner: string, repo: string, sha: string): Promise<Commit> {
  try {
    const { data } = await octokit.repos.getCommit({
      owner,
      repo,
      ref: sha,
    });
    
    // 필요한 정보만 추출하여 반환
    return {
      sha: data.sha,
      commit: data.commit,
      stats: data.stats
    } as Commit;
  } catch (error) {
    console.error(`커밋 ${sha} 상세 정보 가져오기 오류:`, error);
    throw error;
  }
} 