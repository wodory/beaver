import dotenv from 'dotenv';
import { addRepository, removeRepository, getRepositories } from '../lib/config-manager';

// .env 파일에서 환경 변수 로드
dotenv.config();

// GitHub 토큰 가져오기
const token = process.env.VITE_GITHUB_TOKEN || '';

if (!token) {
  console.error("GitHub 토큰이 설정되지 않았습니다. .env 파일을 확인해주세요.");
  process.exit(1);
}

async function testAddingRepositoryByName() {
  console.log("===== 저장소 이름만으로 저장소 추가 테스트 =====");
  
  // 처음 저장소 목록 출력
  const initialRepos = getRepositories();
  console.log("\n현재 설정된 저장소 목록:");
  initialRepos.forEach((repo, index) => {
    console.log(`${index + 1}. ${repo.owner}/${repo.name} - ${repo.description}`);
  });
  
  // 테스트할 저장소 이름
  const testRepoName = 'd3-hierarchy';
  
  console.log(`\n저장소 이름 "${testRepoName}"만으로 추가 시도 중...`);
  const addedRepo = await addRepository(testRepoName, token);
  
  if (addedRepo) {
    // 추가된 후 저장소 목록 출력
    const updatedRepos = getRepositories();
    console.log("\n업데이트된 저장소 목록:");
    updatedRepos.forEach((repo, index) => {
      console.log(`${index + 1}. ${repo.owner}/${repo.name} - ${repo.description}`);
    });
    
    // 테스트 목적으로 추가한 저장소 제거
    console.log(`\n테스트를 위해 추가한 저장소 "${addedRepo.owner}/${addedRepo.name}" 제거 중...`);
    const removed = await removeRepository(addedRepo.owner, addedRepo.name);
    
    if (removed) {
      console.log("저장소가 성공적으로 제거되었습니다.");
    } else {
      console.error("저장소 제거 실패");
    }
  } else {
    console.error("저장소 추가 실패");
  }
  
  // 최종 저장소 목록 출력
  const finalRepos = getRepositories();
  console.log("\n최종 저장소 목록:");
  finalRepos.forEach((repo, index) => {
    console.log(`${index + 1}. ${repo.owner}/${repo.name} - ${repo.description}`);
  });
}

// 테스트 실행
async function runTests() {
  console.log("저장소 관리 모듈 테스트 시작\n");
  
  try {
    await testAddingRepositoryByName();
    console.log("\n테스트 완료!");
  } catch (error) {
    console.error("테스트 중 오류 발생:", error);
  }
}

runTests(); 