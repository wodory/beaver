# Beaver - GitHub 메트릭 수집 도구

Beaver는 GitHub, GitHub Enterprise, GitLab 등 다양한 Git 저장소에서 커밋, PR, 리뷰 데이터를 수집하고 분석하는 도구입니다.

## 설치 및 실행 가이드

### 필수 조건

- Node.js 16 이상
- npm 또는 yarn
- Git

### 설치 방법

1. 저장소 복제

```bash
git clone <저장소 URL>
cd beaver
```

2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

3. 데이터베이스 초기화

```bash
# SQLite 데이터베이스 초기화 (기본 설정)
npx tsx src/scripts/init-database.ts
```

4. 테스트 실행 (선택 사항)

```bash
# Git 동기화 테스트
npx tsx src/scripts/test-git-sync.ts
```

### 환경 변수 설정 (선택 사항)

`.env` 파일을 프로젝트 루트에 생성하여 다음과 같이 설정할 수 있습니다:

```
# 데이터베이스 타입 (sqlite 또는 postgresql)
DB_TYPE=sqlite

# SQLite 파일 경로 (SQLite 사용 시)
SQLITE_DB_PATH=./data/github-metrics.db

# PostgreSQL 연결 문자열 (PostgreSQL 사용 시)
DATABASE_URL=postgresql://localhost:5432/github_metrics
```

## 개발 현황

현재 개발 진행 상황:

- ✅ Phase 1: 데이터베이스 스키마 설계 및 저장소 관리 모듈 구현 완료
- ✅ Phase 2 (Task 2.1): Git 서비스 어댑터 구현 완료
- 🔄 **다음 작업**: Phase 2 (Task 2.2)부터 진행 예정

### 다음 단계 안내

`tasklist_metric_v02.mdc` 파일의 Task 2.2부터 구현을 진행해야 합니다. 이 작업은 실제 Git 서비스 API와 연동하여 데이터를 수집하는 기능을 구현하는 단계입니다.

## 설정 파일

`src/config.json` 파일에서 저장소 정보를 설정할 수 있습니다:

```json
{
  "repositories": [
    {
      "id": 1,
      "name": "repo1",
      "fullName": "owner/repo1",
      "cloneUrl": "https://github.com/owner/repo1.git",
      "type": "github",
      "apiUrl": "https://api.github.com"
    }
  ]
}
```

## 폴더 구조

```
src/
├── config.json        # 설정 파일
├── db/                # 데이터베이스 관련 코드
│   ├── adapters/      # 데이터베이스 어댑터
│   ├── migrations/    # 마이그레이션 파일
│   ├── schema/        # PostgreSQL 스키마
│   └── schema-sqlite/ # SQLite 스키마
├── scripts/           # 스크립트 파일
│   ├── init-database.ts  # DB 초기화
│   └── test-git-sync.ts  # 동기화 테스트
└── services/          # 서비스 모듈
    ├── git/           # Git 서비스 관련 코드
    └── repository-manager.ts # 저장소 관리
```

## JIRA 모듈 사용 가이드

### 개요
JIRA API 통합 모듈은 JIRA 이슈 및 프로젝트 데이터를 수집하고 분석할 수 있는 기능을 제공합니다. 이 모듈은 어댑터 패턴을 사용하여 실제 JIRA API와 모의(Mock) 데이터 소스를 모두 지원합니다.

### 주요 기능
- JIRA 프로젝트 목록 조회
- 완료된 이슈 및 생성된 이슈 목록 조회
- 다양한 검색 옵션을 통한 이슈 필터링
- 이슈 통계 계산 (유형별, 상태별, 담당자별)
- 프로젝트 요약 정보 생성

### 설정 방법
1. `.env` 파일에 JIRA 관련 환경 변수 설정:
```
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_USERNAME=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEYS=PROJ1,PROJ2,PROJ3
USE_MOCK_JIRA=false
```

2. 모의 데이터 사용 방법:
개발 또는 테스트 목적으로 실제 JIRA API 대신 모의 데이터를 사용할 수 있습니다. 이 경우 `USE_MOCK_JIRA=true`로 설정하세요.

### 샘플 코드
```typescript
import { JiraDataCollector } from './services/jira/JiraDataCollector';
import { JiraSearchOptions } from './services/jira/IJiraAdapter';

// 수집기 초기화 (true: 모의 데이터 사용, false: 실제 API 사용)
const jiraCollector = new JiraDataCollector(false);
await jiraCollector.initialize();

// 검색 옵션 설정
const searchOptions: JiraSearchOptions = {
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  projectKey: 'PROJ1'
};

// 이슈 목록 조회
const issues = await jiraCollector.getCreatedIssues(searchOptions);

// 이슈 통계 계산
const stats = await jiraCollector.calculateIssueStats(issues);
console.log(`총 이슈 수: ${stats.totalIssues}`);
console.log(`완료된 이슈 수: ${stats.completedIssues}`);
console.log(`평균 해결 시간: ${stats.averageResolutionTimeInDays.toFixed(2)}일`);
```

### 모듈 구조
- `IJiraAdapter.ts`: 인터페이스 정의
- `JiraApiAdapter.ts`: 실제 JIRA API 호출 구현
- `MockJiraAdapter.ts`: 모의 데이터 제공 구현
- `JiraDataCollector.ts`: 데이터 수집 및 처리 로직
- `JiraConfigManager.ts`: 환경 설정 관리

### 테스트
JIRA 모듈 테스트를 실행하려면:
```bash
yarn tsc -p tsconfig.jira.json && node dist-jira/tests/jira-test/simple-test.js
```

모의 어댑터 테스트:
```bash
yarn tsc -p tsconfig.jira.json && node dist-jira/tests/jira-test/mock-adapter-test.js
```
