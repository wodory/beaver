// 간단한 JIRA 테스트 파일
console.log('간단한 JIRA 테스트 시작...');
// 테스트를 위한 간단한 MockJiraService 클래스
var MockJiraService = /** @class */ (function () {
    function MockJiraService() {
        this.issues = [
            {
                id: '1001',
                key: 'PROJ-1',
                summary: '테스트 이슈 1',
                status: 'Done'
            },
            {
                id: '1002',
                key: 'PROJ-2',
                summary: '테스트 이슈 2',
                status: 'In Progress'
            }
        ];
    }
    MockJiraService.prototype.getIssues = function () {
        return this.issues;
    };
    return MockJiraService;
}());
// 테스트 실행
var jiraService = new MockJiraService();
var issues = jiraService.getIssues();
console.log("".concat(issues.length, "\uAC1C \uC774\uC288 \uC870\uD68C \uC131\uACF5"));
issues.forEach(function (issue) {
    console.log("- ".concat(issue.key, ": ").concat(issue.summary, " (").concat(issue.status, ")"));
});
console.log('테스트 완료');
