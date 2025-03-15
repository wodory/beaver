# GitHub 생산성 대시보드

GitHub Pull Request 데이터를 분석하여 개발 생산성 지표를 시각화하는 대시보드 애플리케이션입니다.

## 주요 기능

- GitHub 저장소의 PR, 커밋, 리뷰 데이터 자동 수집
- 저장소 이름만으로 쉽게 분석 대상 추가 가능
- PR 개수, 코드 변경량(LOC), 리뷰 응답 시간, 사이클 타임 등 주요 지표 계산
- 대시보드를 통한 지표 시각화
- 공개 및 비공개 저장소 모두 지원

## 기술 스택

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn UI
- Zustand (상태 관리)
- Vitest (테스트)
- GitHub API (Octokit)

## 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/beaver.git
cd beaver
```

### 2. 의존성 설치

```bash
yarn install
```

### 3. 환경 변수 설정

GitHub API에 접근하기 위해서는 Personal Access Token이 필요합니다.

1. GitHub 토큰 생성:
   - [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens/new)에서 새 토큰 생성
   - 필요한 권한: `repo` (저장소 접근), `user` (사용자 정보 접근)
   - 생성된 토큰을 안전한 곳에 복사해두세요.

2. `.env` 파일 생성:
   - 프로젝트 루트 디렉토리에 `.env.sample` 파일을 복사하여 `.env` 파일 생성
   ```bash
   cp .env.sample .env
   ```
   - `.env` 파일을 편집하고 `VITE_GITHUB_TOKEN` 값을 생성한 GitHub 토큰으로 설정
   ```
   VITE_GITHUB_TOKEN=your_github_personal_access_token_here
   ```

3. (선택 사항) 분석할 저장소 설정:
   - `src/config.json` 파일에서 분석하고 싶은 GitHub 저장소를 추가/수정

### 4. 애플리케이션 실행

```bash
yarn dev
```

이제 브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 사용할 수 있습니다.

## 저장소 관리

### 저장소 이름만으로 설정에 추가하기

저장소의 소유자(owner) 정보를 모르더라도, 이름만으로 저장소를 추가할 수 있습니다:

```typescript
import { addRepository } from './lib/config-manager';
import dotenv from 'dotenv';

dotenv.config();
const token = process.env.VITE_GITHUB_TOKEN;

// 저장소 이름만으로 추가
await addRepository('저장소_이름', token);
```

## 테스트

테스트를 실행하려면:

```bash
yarn test
```

## 라이센스

[MIT](LICENSE)
