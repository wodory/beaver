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
