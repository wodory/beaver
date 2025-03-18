import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
// ESM 환경에서 __dirname, __filename 에뮬레이션
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { MockJiraAdapter } from '../../services/jira/MockJiraAdapter.js';
/**
 * 간단한 JIRA 테스트 함수
 */
async function runSimpleTest() {
    console.log('간단한 JIRA 테스트 시작...');
    try {
        // 모의 어댑터 설정
        const config = {
            baseUrl: 'https://mock-jira.example.com',
            username: 'mock-user',
            apiToken: 'mock-token',
            projectKeys: ['PROJ']
        };
        // 모의 JIRA 어댑터 생성 및 초기화
        const adapter = new MockJiraAdapter();
        await adapter.initialize(config);
        // 테스트 데이터 가져오기
        const issues = await adapter.getCreatedIssues({});
        console.log(`${issues.length}개 이슈 조회 성공`);
        issues.slice(0, 2).forEach(issue => {
            console.log(`- ${issue.key}: ${issue.summary} (${issue.status})`);
        });
        console.log('테스트 완료');
        return true;
    }
    catch (error) {
        console.error('테스트 실패:', error);
        return false;
    }
}
// 테스트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    runSimpleTest()
        .then(success => process.exit(success ? 0 : 1))
        .catch(error => {
        console.error('예기치 않은 오류:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=simple-test.js.map