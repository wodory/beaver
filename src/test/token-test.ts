import { Octokit } from "@octokit/rest";
import dotenv from 'dotenv';
import configData from '../config.json';

// .env 파일에서 환경 변수 로드
dotenv.config();

// GitHub 토큰 가져오기
const token = process.env.VITE_GITHUB_TOKEN;

async function testGitHubToken() {
  console.log("GitHub 토큰 테스트를 시작합니다...");
  
  if (!token) {
    console.error("GitHub 토큰이 설정되지 않았습니다. .env 파일을 확인해주세요.");
    return;
  }
  
  try {
    // Octokit 인스턴스 생성
    const octokit = new Octokit({ auth: token });
    
    // 사용자 정보 가져오기
    const { data: user } = await octokit.users.getAuthenticated();
    console.log("인증된 사용자:", user.login);
    
    // 사용자의 저장소 목록 가져오기 (공개 및 비공개 모두)
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      per_page: 30, // 저장소를 더 많이 가져와서 비공개 저장소도 확인
      sort: "updated",
      direction: "desc"
    });
    
    // 공개/비공개 저장소 분류
    const publicRepos = repos.filter(repo => !repo.private);
    const privateRepos = repos.filter(repo => repo.private);
    
    console.log(`\n===== 사용자 ${user.login}의 저장소 접근 권한 테스트 =====`);
    console.log(`총 저장소 수: ${repos.length}개`);
    console.log(`공개 저장소: ${publicRepos.length}개`);
    console.log(`비공개 저장소: ${privateRepos.length}개`);
    
    // 공개 저장소 목록
    if (publicRepos.length > 0) {
      console.log(`\n공개 저장소 목록 (최대 5개):`);
      publicRepos.slice(0, 5).forEach((repo, index) => {
        console.log(`${index + 1}. ${repo.name} - ${repo.html_url}`);
      });
    }
    
    // 비공개 저장소 목록
    if (privateRepos.length > 0) {
      console.log(`\n비공개 저장소 목록 (최대 5개):`);
      privateRepos.slice(0, 5).forEach((repo, index) => {
        console.log(`${index + 1}. ${repo.name} - ${repo.html_url}`);
      });
    } else {
      console.log("\n비공개 저장소가 없거나 접근 권한이 없습니다.");
    }
    
    // config.json에 설정된 모든 저장소 접근 테스트
    console.log("\n===== config.json에 설정된 저장소 접근 테스트 =====");
    
    for (const repo of configData.repositories) {
      console.log(`\n${repo.owner}/${repo.name} 저장소 테스트 중...`);
      
      try {
        const response = await octokit.repos.get({
          owner: repo.owner,
          repo: repo.name
        });
        
        console.log(`- 접근 성공 (상태 코드: ${response.status})`);
        console.log(`- 저장소 유형: ${response.data.private ? '비공개' : '공개'}`);
        console.log(`- 생성 날짜: ${new Date(response.data.created_at).toLocaleString()}`);
        console.log(`- 기본 브랜치: ${response.data.default_branch}`);
        console.log(`- URL: ${response.data.html_url}`);
        
        // PR 목록 가져오기 테스트
        const { data: prs } = await octokit.pulls.list({
          owner: repo.owner,
          repo: repo.name,
          state: "all",
          per_page: 3
        });
        
        if (prs.length > 0) {
          console.log(`- 최근 PR ${prs.length}개:`);
          prs.forEach((pr, index) => {
            console.log(`  ${index + 1}. #${pr.number}: ${pr.title} (${pr.state}) - ${pr.user?.login}`);
          });
        } else {
          console.log(`- PR이 없습니다.`);
        }
        
        // 커밋 목록 가져오기 테스트
        const { data: commits } = await octokit.repos.listCommits({
          owner: repo.owner,
          repo: repo.name,
          per_page: 3
        });
        
        if (commits.length > 0) {
          console.log(`- 최근 커밋 ${commits.length}개:`);
          commits.forEach((commit, index) => {
            console.log(`  ${index + 1}. ${commit.commit.message.split('\n')[0]} - ${commit.commit.author?.name || 'Unknown'}`);
          });
        } else {
          console.log(`- 커밋이 없습니다.`);
        }
        
      } catch (error: any) {
        console.error(`- 접근 실패: ${error.message}`);
        if (error.response) {
          console.error(`  상태 코드: ${error.response.status}`);
        }
      }
    }
    
  } catch (error: any) {
    console.error("GitHub API 호출 중 오류 발생:", error.message);
    if (error.response) {
      console.error(`상태 코드: ${error.response.status}`);
      console.error(`응답 메시지: ${JSON.stringify(error.response.data)}`);
    }
  }
}

// 함수 실행
testGitHubToken().then(() => {
  console.log("\n테스트 완료!");
}); 