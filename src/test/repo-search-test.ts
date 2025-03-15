import { Octokit } from "@octokit/rest";
import dotenv from 'dotenv';

// .env 파일에서 환경 변수 로드
dotenv.config();

// GitHub 토큰 가져오기
const token = process.env.VITE_GITHUB_TOKEN || '';

interface RepoInfo {
  name: string;
  owner: string;
  fullName: string;
  description: string;
  isPrivate: boolean;
  url: string;
}

async function findRepositoryOwner(repoName: string): Promise<RepoInfo | null> {
  if (!token) {
    console.error("GitHub 토큰이 설정되지 않았습니다. .env 파일을 확인해주세요.");
    return null;
  }
  
  const octokit = new Octokit({ auth: token });
  
  try {
    console.log(`저장소 "${repoName}" 검색 중...`);
    
    // 1. 저장소 이름으로 검색
    const searchResult = await octokit.search.repos({
      q: `${repoName} in:name`,
      sort: 'stars',
      order: 'desc',
      per_page: 10
    });
    
    console.log(`검색 결과: ${searchResult.data.total_count}개 저장소 발견`);
    
    if (searchResult.data.total_count === 0) {
      console.log("저장소를 찾을 수 없습니다.");
      return null;
    }
    
    // 검색 결과에서 정확히 일치하는 이름 찾기
    const exactMatch = searchResult.data.items.find(
      repo => repo.name.toLowerCase() === repoName.toLowerCase()
    );
    
    if (!exactMatch || !exactMatch.owner) {
      console.log(`정확히 "${repoName}"과 일치하는 저장소가 없습니다. 유사한 저장소 목록:`);
      searchResult.data.items.slice(0, 5).forEach((repo, index) => {
        console.log(`${index + 1}. ${repo.full_name} - ${repo.html_url}`);
      });
      return null;
    }
    
    // 2. 정확히 일치하는 저장소의 정보 추출
    const repoInfo: RepoInfo = {
      name: exactMatch.name,
      owner: exactMatch.owner.login,
      fullName: exactMatch.full_name,
      description: exactMatch.description || '',
      isPrivate: exactMatch.private,
      url: exactMatch.html_url
    };
    
    console.log("\n저장소 정보:");
    console.log(`- 이름: ${repoInfo.name}`);
    console.log(`- 소유자: ${repoInfo.owner}`);
    console.log(`- 전체 이름: ${repoInfo.fullName}`);
    console.log(`- 설명: ${repoInfo.description}`);
    console.log(`- 유형: ${repoInfo.isPrivate ? '비공개' : '공개'}`);
    console.log(`- URL: ${repoInfo.url}`);
    
    // 3. owner/repo 형식으로 추가 정보 가져오기
    console.log("\n저장소 세부 정보 및 콘텐츠 접근 테스트:");
    
    // 저장소 세부 정보 가져오기
    const repoDetails = await octokit.repos.get({
      owner: repoInfo.owner,
      repo: repoInfo.name
    });
    
    console.log(`- 기본 브랜치: ${repoDetails.data.default_branch}`);
    console.log(`- 스타 수: ${repoDetails.data.stargazers_count}`);
    console.log(`- 포크 수: ${repoDetails.data.forks_count}`);
    console.log(`- 생성 일자: ${new Date(repoDetails.data.created_at).toLocaleString()}`);
    
    // 최근 커밋 가져오기
    const commits = await octokit.repos.listCommits({
      owner: repoInfo.owner,
      repo: repoInfo.name,
      per_page: 3
    });
    
    console.log("\n최근 커밋:");
    commits.data.forEach((commit, index) => {
      console.log(`${index + 1}. ${commit.commit.message.split('\n')[0]} - ${commit.commit.author?.name || 'Unknown'}`);
    });
    
    return repoInfo;
    
  } catch (error: any) {
    console.error("오류 발생:", error.message);
    if (error.response) {
      console.error(`상태 코드: ${error.response.status}`);
      console.error(`응답 메시지: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}

// 함수 실행
async function runTest() {
  console.log("GitHub 저장소 이름만으로 검색 테스트 시작\n");
  
  // 사용자가 요청한 저장소 이름으로 테스트
  const repoName = 'd3-hierarchy';
  const repoInfo = await findRepositoryOwner(repoName);
  
  if (repoInfo) {
    console.log(`\n성공! "${repoName}" 저장소의 소유자는 "${repoInfo.owner}"입니다.`);
    
    // config.json 형식에 맞게 정보 출력
    const configEntry = {
      name: repoInfo.name,
      owner: repoInfo.owner,
      description: repoInfo.description
    };
    
    console.log("\nconfig.json에 추가할 수 있는 형식:");
    console.log(JSON.stringify(configEntry, null, 2));
  } else {
    console.log(`\n실패: "${repoName}" 저장소 정보를 가져올 수 없습니다.`);
  }
  
  console.log("\n테스트 완료!");
}

runTest(); 