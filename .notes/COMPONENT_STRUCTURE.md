# 컴포넌트 구조 및 상호 관계

## 전체 구조 개요

```
App
├── AppSidebar (네비게이션)
├── SiteHeader (헤더)
└── 메인 콘텐츠 영역
    ├── DashboardPage
    │   └── DashboardContainer
    │       ├── useDashboardData (커스텀 훅)
    │       └── DashboardView
    │           ├── 차트 컴포넌트들
    │           └── 데이터 표시 컴포넌트들
    │
    ├── TeamMetricsPage
    │   └── TeamMetricsContainer
    │       ├── useTeamMetricsData (커스텀 훅)
    │       └── TeamMetricsContent
    │           ├── 팀 성과 지표 컴포넌트들
    │           └── 팀 활동 컴포넌트들
    │
    ├── SettingsPage
    │   └── SettingsContainer
    │       └── SettingsView
    │           ├── 일반 설정 탭
    │           ├── GitHub 연동 탭
    │           └── 시스템 설정 탭
    │
    └── AdminPage
        └── AdminContainer
            └── AdminView
                ├── 사용자 관리 탭
                └── 시스템 관리 탭
```

## 파일 구조

```
src/
├── pages/                    # 페이지 컴포넌트 (평면적 구조)
│   ├── AdminPage.tsx
│   ├── DashboardPage.tsx
│   ├── SettingsPage.tsx
│   └── TeamMetricsPage.tsx
│
├── components/               # 기능별 컴포넌트
│   ├── admin/                # 관리자 관련 컴포넌트
│   │   ├── AdminContainer.tsx
│   │   └── AdminView.tsx
│   │
│   ├── dashboard/            # 대시보드 관련 컴포넌트
│   │   ├── DashboardContainer.tsx
│   │   └── DashboardView.tsx
│   │
│   ├── settings/             # 설정 관련 컴포넌트
│   │   ├── SettingsContainer.tsx
│   │   └── SettingsView.tsx
│   │
│   ├── team/                 # 팀 관련 컴포넌트
│   │   ├── TeamMetricsContainer.tsx
│   │   └── TeamMetricsContent.tsx
│   │
│   ├── layouts/              # 레이아웃 컴포넌트
│   │   ├── AppSidebar.tsx
│   │   └── SiteHeader.tsx
│   │
│   └── ui/                   # UI 컴포넌트
│
└── hooks/                    # 커스텀 훅
    ├── useDashboardData.ts
    └── useTeamMetricsData.ts
```

## 컴포넌트 타입별 책임

### 페이지 컴포넌트 (Pages)
- 경로/라우팅의 진입점
- 컨테이너 컴포넌트를 감싸는 레이아웃
- 페이지 제목 및 설명 제공
- 예: `DashboardPage`, `TeamMetricsPage`, `SettingsPage`, `AdminPage`

### 컨테이너 컴포넌트 (Containers)
- 상태 관리 및 데이터 처리 로직
- API 호출 및 데이터 변환
- 이벤트 핸들러 정의
- 자식 컴포넌트에 데이터 및 콜백 전달
- 예: `DashboardContainer`, `TeamMetricsContainer`, `SettingsContainer`, `AdminContainer`

### 프레젠테이션 컴포넌트 (Views/Content)
- UI 표현만 담당
- props로 받은 데이터 표시
- 사용자 상호작용 발생 시 콜백 호출
- 상태를 직접 관리하지 않음 (UI 상태는 예외)
- 예: `DashboardView`, `TeamMetricsContent`, `SettingsView`, `AdminView`

### 커스텀 훅 (Custom Hooks)
- 재사용 가능한 로직 캡슐화
- 데이터 fetching 및 가공
- 컴포넌트 로직에서 분리된 상태 관리
- 예: `useDashboardData`, `useTeamMetricsData`

## 데이터 흐름

```
API/외부 데이터 → 커스텀 훅 → 컨테이너 컴포넌트 → 프레젠테이션 컴포넌트 → UI 렌더링
사용자 상호작용 → 프레젠테이션 컴포넌트 → 컨테이너 컴포넌트 → 데이터 업데이트 → UI 업데이트
```

## 주요 컴포넌트 상호작용 예시

### 대시보드 흐름
1. `DashboardPage`: 페이지 진입점, 타이틀 표시, `DashboardContainer` 렌더링
2. `DashboardContainer`: 
   - `useDashboardData` 훅을 사용하여 데이터 로드
   - 필터 상태 (날짜 범위, 선택된 저장소 등) 관리
   - 이벤트 핸들러 정의 (탭 변경, 필터 변경 등)
   - `DashboardView`에 데이터 및 콜백 전달
3. `DashboardView`: 
   - 받은 데이터로 UI 렌더링
   - 사용자 상호작용 시 콜백 함수 호출

### 설정 페이지 흐름
1. `SettingsPage`: 페이지 진입점, 타이틀 표시, `SettingsContainer` 렌더링
2. `SettingsContainer`: 
   - 설정 데이터 로드 및 관리
   - 설정 변경 핸들러 정의
   - `SettingsView`에 데이터 및 콜백 전달
3. `SettingsView`: 
   - 설정 UI 렌더링
   - 사용자가 설정 변경 시 콜백 함수 호출

## 컴포넌트 간 의존성 방향

```
Pages → Containers → Views/Content
       ↑
       └── Custom Hooks
```

- 페이지 컴포넌트는 컨테이너 컴포넌트에 의존
- 컨테이너 컴포넌트는 커스텀 훅과 프레젠테이션 컴포넌트에 의존
- 프레젠테이션 컴포넌트는 다른 컴포넌트에 의존하지 않음
- 커스텀 훅은 다른 컴포넌트에 의존하지 않음 