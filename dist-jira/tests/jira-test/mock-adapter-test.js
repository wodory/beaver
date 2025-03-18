import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
// ESM 환경에서 __dirname, __filename 에뮬레이션
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 실제 클래스 임포트
import { MockJiraAdapter } from '../../services/jira/MockJiraAdapter.js';
async function testMockAdapter() {
    console.log('MockJiraAdapter 테스트 시작...');
    try {
        // 어댑터 설정
        const config = {
            baseUrl: 'https://mock-jira.example.com',
            username: 'mock-user',
            apiToken: 'mock-token',
            projectKeys: ['MOCK', 'TEST']
        };
        // 어댑터 생성
        console.log('MockJiraAdapter 인스턴스 생성...');
        const adapter = new MockJiraAdapter();
        // 어댑터 초기화
        console.log('MockJiraAdapter 초기화...');
        await adapter.initialize(config);
        // 연결 테스트
        console.log('연결 테스트...');
        const connected = await adapter.testConnection();
        console.log('연결 테스트 결과:', connected ? '성공' : '실패');
        // 프로젝트 목록 가져오기
        console.log('프로젝트 목록 가져오기...');
        const projects = await adapter.getProjects();
        console.log(`${projects.length}개 프로젝트 조회 성공`);
        projects.forEach(project => {
            console.log(`- ${project.key}: ${project.name}`);
        });
        // 완료된 이슈 목록 가져오기
        console.log('완료된 이슈 목록 가져오기...');
        const completedIssues = await adapter.getCompletedIssues({});
        console.log(`${completedIssues.length}개의 완료된 이슈 조회 성공`);
        completedIssues.slice(0, 3).forEach(issue => {
            console.log(`- ${issue.key}: ${issue.summary} (${issue.status})`);
        });
        console.log('MockJiraAdapter 테스트 완료!');
        return true;
    }
    catch (error) {
        console.error('MockJiraAdapter 테스트 실패:', error);
        return false;
    }
}
// 테스트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    testMockAdapter()
        .then((success) => {
        process.exit(success ? 0 : 1);
    })
        .catch((error) => {
        console.error('예기치 않은 오류:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=mock-adapter-test.js.map