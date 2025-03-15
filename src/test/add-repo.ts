import dotenv from 'dotenv';
import { addRepository } from '../lib/config-manager';

// .env 파일에서 환경 변수 로드
dotenv.config();

// GitHub 토큰 가져오기
const token = process.env.VITE_GITHUB_TOKEN || '';

if (!token) {
  console.error("GitHub 토큰이 설정되지 않았습니다. .env 파일을 확인해주세요.");
  process.exit(1);
}

async function addRepoToConfig() {
  // 저장소 이름
  const repoName = 'd3-hierarchy';
  
  console.log(`저장소 "${repoName}" 추가 중...`);
  const result = await addRepository(repoName, token);
  
  if (result) {
    console.log(`성공! 저장소가 추가되었습니다:`);
    console.log(`- 이름: ${result.name}`);
    console.log(`- 소유자: ${result.owner}`);
    console.log(`- 전체 이름: ${result.owner}/${result.name}`);
    console.log(`- 설명: ${result.description}`);
  } else {
    console.error(`저장소 "${repoName}" 추가 실패`);
  }
}

// 실행
addRepoToConfig().catch(error => {
  console.error('오류 발생:', error);
}); 