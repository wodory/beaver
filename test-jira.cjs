// CommonJS 모듈 시스템으로 작성된 간단한 테스트 파일
console.log('JIRA 테스트 시작 (CommonJS)');

// axios 설치 확인
try {
  const axios = require('axios');
  console.log('axios 설치 확인 완료:', axios.VERSION || '버전 정보 없음');
} catch (error) {
  console.error('axios 설치 확인 실패:', error.message);
}

// 타입스크립트 컴파일 없이 간단한 JIRA API 테스트
const testJiraApi = async () => {
  try {
    // 기본 JIRA API 클라이언트 생성
    const axios = require('axios');
    
    // 환경 변수 확인
    const baseUrl = process.env.JIRA_BASE_URL || 'https://your-domain.atlassian.net';
    const username = process.env.JIRA_USERNAME || 'test@example.com';
    const apiToken = process.env.JIRA_API_TOKEN || 'dummy-token';
    
    // 기본 인증 헤더 생성
    const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');
    
    // 헤더 설정
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    console.log('JIRA API 설정:');
    console.log('- 기본 URL:', baseUrl);
    console.log('- 사용자명:', username);
    console.log('- 토큰:', apiToken ? '설정됨 (숨김)' : '설정되지 않음');
    
    // 실제 JIRA API 호출 대신 목 데이터 반환
    const getMockProjects = () => {
      return [
        { id: '10001', key: 'PROJ', name: '프로젝트 1', description: '테스트 프로젝트 1' },
        { id: '10002', key: 'TEST', name: '프로젝트 2', description: '테스트 프로젝트 2' }
      ];
    };
    
    const getMockIssues = () => {
      return [
        {
          id: '1001',
          key: 'PROJ-1',
          summary: '테스트 이슈 1',
          status: 'Done',
          created: '2023-01-01T10:00:00.000Z',
          updated: '2023-01-05T15:30:00.000Z'
        },
        {
          id: '1002',
          key: 'PROJ-2',
          summary: '테스트 이슈 2',
          status: 'In Progress',
          created: '2023-01-02T09:30:00.000Z',
          updated: '2023-01-06T11:45:00.000Z'
        }
      ];
    };
    
    // Mock 데이터로 테스트
    console.log('\n[Mock 데이터] JIRA 프로젝트:');
    const projects = getMockProjects();
    console.log(`${projects.length}개 프로젝트 조회 성공`);
    projects.forEach(project => {
      console.log(`- ${project.key}: ${project.name}`);
    });
    
    console.log('\n[Mock 데이터] JIRA 이슈:');
    const issues = getMockIssues();
    console.log(`${issues.length}개 이슈 조회 성공`);
    issues.forEach(issue => {
      console.log(`- ${issue.key}: ${issue.summary} (${issue.status})`);
    });
    
    console.log('\nJIRA 테스트 완료');
  } catch (error) {
    console.error('JIRA API 테스트 실패:', error);
  }
};

// 테스트 실행
testJiraApi(); 