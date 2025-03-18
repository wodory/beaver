import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { GitHubApiCollector } from '../services/github/GitHubApiCollector';
import dotenv from 'dotenv';
import fs from 'fs';

// ESM 환경에서 __filename 에뮬레이션
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 로드
dotenv.config();

// config.json 로드
const configPath = join(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

/**
 * GitHub API 테스트 실행
 */
async function runGitHubApiTest() {
  console.log('GitHub API 테스트 시작...');
  
  try {
    // GitHub 토큰 설정 확인
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error('GITHUB_TOKEN이 설정되지 않았습니다. .env 파일을 확인해주세요.');
      return false;
    }
    
    // 일부 토큰 문자열 출력하여 설정 확인
    console.log(`GitHub 토큰: ${token.substring(0, 10)}... (앞 10자리만 표시)`);
    
    // config.json에서 테스트 저장소 정보 가져오기
    const testRepos = config.test_repo;
    if (!testRepos || testRepos.length === 0) {
      console.error('config.json에 테스트 저장소 정보가 없습니다.');
      return false;
    }
    
    // 첫 번째 테스트 저장소 선택
    const testRepo = testRepos[0];
    console.log(`테스트할 저장소 정보: ${JSON.stringify(testRepo, null, 2)}`);
    
    // 도메인 정보 가져오기
    const domains = config.domain;
    const repoDomain = domains.find((d: { name: string }) => d.name === testRepo.type);
    
    if (!repoDomain) {
      console.error(`저장소 타입 ${testRepo.type}에 해당하는 도메인 정보를 찾을 수 없습니다.`);
      return false;
    }
    
    console.log(`도메인 정보: ${JSON.stringify(repoDomain, null, 2)}`);
    
    // GitHub Enterprise URL 설정
    if (testRepo.type === 'github_enterprise') {
      process.env.GITHUB_ENTERPRISE_URL = repoDomain.url;
      console.log(`GitHub Enterprise URL 설정됨: ${process.env.GITHUB_ENTERPRISE_URL}`);
    } else {
      process.env.GITHUB_ENTERPRISE_URL = '';
    }
    
    // 저장소 정보 파싱
    const repoFullName = testRepo.fullName.split('/');
    if (repoFullName.length !== 2) {
      console.error(`저장소 전체 이름 형식이 올바르지 않습니다: ${testRepo.fullName}`);
      return false;
    }
    
    const owner = repoFullName[0];
    const repo = repoFullName[1];
    
    console.log(`테스트할 저장소: ${owner}/${repo}`);
    
    // GitHub API 수집기 초기화 (도메인 정보 전달)
    const githubApiCollector = new GitHubApiCollector(repoDomain);
    
    // 30일 전 날짜 계산
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    console.log(`${owner}/${repo} 저장소의 PR 데이터를 가져오는 중...`);
    
    // GraphQL API로 PR 데이터 수집 (기본)
    console.log('GraphQL API 사용:');
    const graphQLData = await githubApiCollector.collectRepositoryData(owner, repo, thirtyDaysAgo);
    console.log(`GraphQL API로 수집된 PR 개수: ${graphQLData.prs.length}`);
    
    if (graphQLData.prs.length > 0) {
      const samplePR = graphQLData.prs[0];
      console.log('\nGraphQL API 샘플 PR 데이터:');
      console.log(`- PR #${samplePR.number}: ${samplePR.title}`);
      console.log(`- 상태: ${samplePR.state}`);
      console.log(`- 작성자: ${samplePR.user?.login || 'Unknown'}`);
      console.log(`- 추가된 라인: ${samplePR.additions}, 삭제된 라인: ${samplePR.deletions}`);
      console.log(`- 리뷰 개수: ${samplePR.reviews?.length || 0}`);
    }
    
    // REST API로 PR 데이터 수집 (비교용)
    console.log('\nREST API 사용:');
    const restData = await githubApiCollector.collectRepositoryData(owner, repo, thirtyDaysAgo, false);
    console.log(`REST API로 수집된 PR 개수: ${restData.prs.length}`);
    
    if (restData.prs.length > 0) {
      const samplePR = restData.prs[0];
      console.log('\nREST API 샘플 PR 데이터:');
      console.log(`- PR #${samplePR.number}: ${samplePR.title}`);
      console.log(`- 상태: ${samplePR.state}`);
      console.log(`- 작성자: ${samplePR.user?.login || 'Unknown'}`);
      console.log(`- 추가된 라인: ${samplePR.additions}, 삭제된 라인: ${samplePR.deletions}`);
      console.log(`- 리뷰 개수: ${samplePR.reviews?.length || 0}`);
    }
    
    console.log('\nGitHub API 테스트 완료!');
    return true;
  } catch (error) {
    console.error('GitHub API 테스트 실패:', error);
    return false;
  }
}

// 메인 함수로 실행될 때만 테스트 수행
if (import.meta.url === `file://${process.argv[1]}`) {
  runGitHubApiTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('예기치 않은 오류:', error);
      process.exit(1);
    });
} 