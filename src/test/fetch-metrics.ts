import path from 'path';
import { fileURLToPath } from 'url';
import { 
  fetchPullRequests, 
  fetchPullRequestReviews, 
  fetchPullRequestCommits,
  fetchCommitDetails,
  fetchDeployments
} from '../api/github';
import { calculateMetrics } from '../lib/metrics';

// ESM 호환성을 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // facebook/react 저장소 정보
  const owner = 'facebook';
  const repo = 'react';
  
  // 기간 설정: 2025년 2월 1일부터 오늘까지
  const since = '2025-02-01T00:00:00Z';
  const until = new Date().toISOString();
  
  console.log(`${owner}/${repo} 저장소의 ${since} ~ ${until} 기간 메트릭스 조회 중...`);
  
  try {
    // PR 데이터 가져오기
    const pullRequests = await fetchPullRequests(owner, repo, since, until);
    console.log(`가져온 PR 개수: ${pullRequests.length}`);
    
    // PR 상세 정보 가져오기
    const prDetails: Record<number, { reviews: any[], commits: any[] }> = {};
    
    // 시간 단축을 위해 최대 10개의 PR만 상세 조회
    const limitedPRs = pullRequests.slice(0, 10);
    
    for (const pr of limitedPRs) {
      const prNumber = pr.number;
      
      // 리뷰 및 커밋 데이터 가져오기
      const [reviews, commits] = await Promise.all([
        fetchPullRequestReviews(owner, repo, prNumber),
        fetchPullRequestCommits(owner, repo, prNumber)
      ]);
      
      // 커밋 상세 정보 가져오기
      const commitDetails = await Promise.all(
        commits.map(commit => fetchCommitDetails(owner, repo, commit.sha))
      );
      
      // 결과 저장
      prDetails[prNumber] = {
        reviews,
        commits: commitDetails
      };
      
      console.log(`PR #${prNumber} 상세 정보 처리 완료`);
    }
    
    // 배포 데이터 가져오기
    const deployments = await fetchDeployments(owner, repo);
    
    // 메트릭스 계산
    const metrics = calculateMetrics(pullRequests, prDetails, deployments);
    
    // 결과 출력
    console.log('\n====== 측정 결과 ======');
    console.log(`1. PR 개수: ${metrics.prCount}개`);
    console.log(`2. 코드 변경량: ${metrics.totalLinesOfCode}줄`);
    console.log(`3. 평균 리뷰 응답 시간: ${(metrics.avgReviewResponseTime / (1000 * 60 * 60)).toFixed(2)}시간`);
    console.log(`4. 평균 PR 사이클 타임: ${(metrics.avgPRCycleTime / (1000 * 60 * 60)).toFixed(2)}시간`);
    console.log(`5. 배포 빈도: ${metrics.deploymentFrequency?.toFixed(4) || '측정 불가'} 회/일`);
    console.log(`6. 결함률: ${metrics.changeFailureRate?.toFixed(2) || '측정 불가'}%`);
    
  } catch (error) {
    console.error('메트릭스 계산 오류:', error);
  }
}

// 스크립트 실행
main().catch(console.error); 