Project Structure:
├── LICENSE
├── README.md
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
│   └── vite.svg
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── config.json
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
└── yarn.lock


.env.sample
```
1 | # GitHub API 접근을 위한 개인 액세스 토큰 (Personal Access Token)
2 | # 토큰 생성 방법: https://github.com/settings/tokens/new
3 | # 필요한 권한: repo (저장소 접근), user (사용자 정보 접근)
4 | 
5 | VITE_GITHUB_TOKEN=your_github_personal_access_token_here 
```

components.json
```
1 | {
2 |   "$schema": "https://ui.shadcn.com/schema.json",
3 |   "style": "new-york",
4 |   "rsc": false,
5 |   "tsx": true,
6 |   "tailwind": {
7 |     "config": "tailwind.config.js",
8 |     "css": "src/index.css",
9 |     "baseColor": "neutral",
10 |     "cssVariables": true,
11 |     "prefix": ""
12 |   },
13 |   "aliases": {
14 |     "components": "@/components",
15 |     "utils": "@/lib/utils",
16 |     "ui": "@/components/ui",
17 |     "lib": "@/lib",
18 |     "hooks": "@/hooks"
19 |   },
20 |   "iconLibrary": "lucide"
21 | }
```

eslint.config.js
```
1 | import js from '@eslint/js'
2 | import globals from 'globals'
3 | import reactHooks from 'eslint-plugin-react-hooks'
4 | import reactRefresh from 'eslint-plugin-react-refresh'
5 | import tseslint from 'typescript-eslint'
6 | 
7 | export default tseslint.config(
8 |   { ignores: ['dist'] },
9 |   {
10 |     extends: [js.configs.recommended, ...tseslint.configs.recommended],
11 |     files: ['**/*.{ts,tsx}'],
12 |     languageOptions: {
13 |       ecmaVersion: 2020,
14 |       globals: globals.browser,
15 |     },
16 |     plugins: {
17 |       'react-hooks': reactHooks,
18 |       'react-refresh': reactRefresh,
19 |     },
20 |     rules: {
21 |       ...reactHooks.configs.recommended.rules,
22 |       'react-refresh/only-export-components': [
23 |         'warn',
24 |         { allowConstantExport: true },
25 |       ],
26 |     },
27 |   },
28 | )
```

index.html
```
1 | <!doctype html>
2 | <html lang="en">
3 |   <head>
4 |     <meta charset="UTF-8" />
5 |     <link rel="icon" type="image/svg+xml" href="/vite.svg" />
6 |     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
7 |     <title>Vite + React + TS</title>
8 |   </head>
9 |   <body>
10 |     <div id="root"></div>
11 |     <script type="module" src="/src/main.tsx"></script>
12 |   </body>
13 | </html>
```

package.json
```
1 | {
2 |   "name": "beaver",
3 |   "private": true,
4 |   "version": "0.0.0",
5 |   "type": "module",
6 |   "scripts": {
7 |     "dev": "vite",
8 |     "build": "tsc -b && vite build",
9 |     "lint": "eslint .",
10 |     "preview": "vite preview",
11 |     "test": "vitest run",
12 |     "test:watch": "vitest"
13 |   },
14 |   "dependencies": {
15 |     "@octokit/rest": "^21.1.1",
16 |     "@radix-ui/react-dropdown-menu": "^2.1.6",
17 |     "@radix-ui/react-label": "^2.1.2",
18 |     "@radix-ui/react-popover": "^1.1.6",
19 |     "@radix-ui/react-select": "^2.1.6",
20 |     "@radix-ui/react-separator": "^1.1.2",
21 |     "@radix-ui/react-slot": "^1.1.2",
22 |     "@radix-ui/react-tabs": "^1.1.3",
23 |     "@radix-ui/react-tooltip": "^1.1.8",
24 |     "@tailwindcss/vite": "^4.0.14",
25 |     "better-sqlite3": "^11.9.0",
26 |     "class-variance-authority": "^0.7.1",
27 |     "clsx": "^2.1.1",
28 |     "date-fns": "^4.1.0",
29 |     "dotenv": "^16.4.7",
30 |     "lucide-react": "^0.482.0",
31 |     "react": "^19.0.0",
32 |     "react-day-picker": "8.10.1",
33 |     "react-dom": "^19.0.0",
34 |     "recharts": "^2.15.1",
35 |     "tailwind-merge": "^3.0.2",
36 |     "tailwindcss-animate": "^1.0.7",
37 |     "zustand": "^5.0.3"
38 |   },
39 |   "devDependencies": {
40 |     "@eslint/js": "^9.21.0",
41 |     "@testing-library/jest-dom": "^6.6.3",
42 |     "@testing-library/react": "^16.2.0",
43 |     "@types/react": "^19.0.10",
44 |     "@types/react-dom": "^19.0.4",
45 |     "@vitejs/plugin-react": "^4.3.4",
46 |     "autoprefixer": "^10.4.21",
47 |     "eslint": "^9.21.0",
48 |     "eslint-plugin-react-hooks": "^5.1.0",
49 |     "eslint-plugin-react-refresh": "^0.4.19",
50 |     "globals": "^15.15.0",
51 |     "jsdom": "^26.0.0",
52 |     "postcss": "^8.5.3",
53 |     "shadcn": "^2.4.0-canary.14",
54 |     "typescript": "~5.7.2",
55 |     "typescript-eslint": "^8.24.1",
56 |     "vite": "^6.2.0",
57 |     "vitest": "^3.0.8"
58 |   }
59 | }
```

postcss.config.js
```
1 | export default {
2 |   plugins: {
3 |     autoprefixer: {},
4 |   },
5 | } 
```

tailwind.config.js
```
1 | /** @type {import('tailwindcss').Config} */
2 | module.exports = {
3 |   darkMode: ["class"],
4 |   content: [
5 |     "./index.html",
6 |     "./src/**/*.{js,ts,jsx,tsx}",
7 |   ],
8 |   theme: {
9 |     container: {
10 |       center: true,
11 |       padding: "2rem",
12 |       screens: {
13 |         "2xl": "1400px",
14 |       },
15 |     },
16 |     extend: {
17 |       colors: {
18 |         border: "hsl(var(--border))",
19 |         input: "hsl(var(--input))",
20 |         ring: "hsl(var(--ring))",
21 |         background: "hsl(var(--background))",
22 |         foreground: "hsl(var(--foreground))",
23 |         primary: {
24 |           DEFAULT: "hsl(var(--primary))",
25 |           foreground: "hsl(var(--primary-foreground))",
26 |         },
27 |         secondary: {
28 |           DEFAULT: "hsl(var(--secondary))",
29 |           foreground: "hsl(var(--secondary-foreground))",
30 |         },
31 |         destructive: {
32 |           DEFAULT: "hsl(var(--destructive))",
33 |           foreground: "hsl(var(--destructive-foreground, var(--primary-foreground)))",
34 |         },
35 |         muted: {
36 |           DEFAULT: "hsl(var(--muted))",
37 |           foreground: "hsl(var(--muted-foreground))",
38 |         },
39 |         accent: {
40 |           DEFAULT: "hsl(var(--accent))",
41 |           foreground: "hsl(var(--accent-foreground))",
42 |         },
43 |         popover: {
44 |           DEFAULT: "hsl(var(--popover))",
45 |           foreground: "hsl(var(--popover-foreground))",
46 |         },
47 |         card: {
48 |           DEFAULT: "hsl(var(--card))",
49 |           foreground: "hsl(var(--card-foreground))",
50 |         },
51 |       },
52 |       borderRadius: {
53 |         lg: "var(--radius)",
54 |         md: "calc(var(--radius) - 2px)",
55 |         sm: "calc(var(--radius) - 4px)",
56 |       },
57 |       keyframes: {
58 |         "accordion-down": {
59 |           from: { height: "0" },
60 |           to: { height: "var(--radix-accordion-content-height)" },
61 |         },
62 |         "accordion-up": {
63 |           from: { height: "var(--radix-accordion-content-height)" },
64 |           to: { height: "0" },
65 |         },
66 |       },
67 |       animation: {
68 |         "accordion-down": "accordion-down 0.2s ease-out",
69 |         "accordion-up": "accordion-up 0.2s ease-out",
70 |       },
71 |     },
72 |   },
73 |   plugins: [require("tailwindcss-animate")],
74 | } 
```

tsconfig.app.json
```
1 | {
2 |   "compilerOptions": {
3 |     "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
4 |     "target": "ES2020",
5 |     "useDefineForClassFields": true,
6 |     "lib": ["ES2020", "DOM", "DOM.Iterable"],
7 |     "module": "ESNext",
8 |     "skipLibCheck": true,
9 | 
10 |     /* Bundler mode */
11 |     "moduleResolution": "bundler",
12 |     "allowImportingTsExtensions": true,
13 |     "isolatedModules": true,
14 |     "moduleDetection": "force",
15 |     "noEmit": true,
16 |     "jsx": "react-jsx",
17 | 
18 |     /* Linting */
19 |     "strict": true,
20 |     "noUnusedLocals": true,
21 |     "noUnusedParameters": true,
22 |     "noFallthroughCasesInSwitch": true,
23 |     "noUncheckedSideEffectImports": true,
24 | 
25 |     /* Path Alias */
26 |     "baseUrl": ".",
27 |     "paths": {
28 |       "@/*": ["./src/*"]
29 |     }
30 |   },
31 |   "include": ["src"]
32 | }
```

tsconfig.json
```
1 | {
2 |   "compilerOptions": {
3 |     "target": "ES2020",
4 |     "useDefineForClassFields": true,
5 |     "lib": ["ES2020", "DOM", "DOM.Iterable"],
6 |     "module": "ESNext",
7 |     "skipLibCheck": true,
8 | 
9 |     /* Bundler mode */
10 |     "moduleResolution": "bundler",
11 |     "allowImportingTsExtensions": true,
12 |     "isolatedModules": true,
13 |     "noEmit": true,
14 |     "jsx": "react-jsx",
15 | 
16 |     /* Linting */
17 |     "strict": true,
18 |     "noUnusedLocals": true,
19 |     "noUnusedParameters": true,
20 |     "noFallthroughCasesInSwitch": true,
21 | 
22 |     /* Path Alias */
23 |     "baseUrl": ".",
24 |     "paths": {
25 |       "@/*": ["./src/*"]
26 |     }
27 |   },
28 |   "include": ["src"],
29 |   "references": [
30 |     { "path": "./tsconfig.app.json" },
31 |     { "path": "./tsconfig.node.json" }
32 |   ]
33 | }
```

tsconfig.node.json
```
1 | {
2 |   "compilerOptions": {
3 |     "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
4 |     "target": "ES2022",
5 |     "lib": ["ES2023"],
6 |     "module": "ESNext",
7 |     "skipLibCheck": true,
8 | 
9 |     /* Bundler mode */
10 |     "moduleResolution": "bundler",
11 |     "allowImportingTsExtensions": true,
12 |     "isolatedModules": true,
13 |     "moduleDetection": "force",
14 |     "noEmit": true,
15 | 
16 |     /* Linting */
17 |     "strict": true,
18 |     "noUnusedLocals": true,
19 |     "noUnusedParameters": true,
20 |     "noFallthroughCasesInSwitch": true,
21 |     "noUncheckedSideEffectImports": true
22 |   },
23 |   "include": ["vite.config.ts"]
24 | }
```

vite.config.ts
```
1 | import { defineConfig } from 'vite'
2 | import react from '@vitejs/plugin-react'
3 | import path from 'path'
4 | import tailwindcss from '@tailwindcss/vite'
5 | 
6 | // https://vite.dev/config/
7 | export default defineConfig({
8 |   plugins: [
9 |     react(),
10 |     tailwindcss(),
11 |   ],
12 |   resolve: {
13 |     alias: {
14 |       '@': path.resolve(__dirname, './src')
15 |     }
16 |   }
17 | })
```

vitest.config.ts
```
1 | import { defineConfig } from 'vitest/config'
2 | import react from '@vitejs/plugin-react'
3 | import path from 'path'
4 | 
5 | export default defineConfig({
6 |   plugins: [react()],
7 |   test: {
8 |     environment: 'jsdom',
9 |     globals: true,
10 |     setupFiles: ['./src/test/setup.ts'],
11 |   },
12 |   resolve: {
13 |     alias: {
14 |       '@': path.resolve(__dirname, './src')
15 |     }
16 |   }
17 | }) 
```

.notes/PRD.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: false
5 | ---
6 | # Product Requirements Document (PRD) – 개발자 생산성 대시보드
7 | 
8 | ## 1. 개요 (Overview)
9 | - **프로젝트 이름**: **개발자 생산성 대시보드** (Developer Productivity Dashboard)  
10 | - **목적**: 조직 내 **개발자** 및 **프로젝트**의 생산성을 측정하고, 데이터 기반 인사이트를 통해 **효율성 개선**을 지원하는 대시보드를 개발합니다.  
11 | - **주요 기능**:  
12 |   - 개발자 및 프로젝트의 **Pull Request(PR)** 활동 현황 분석  
13 |   - **코드 리뷰 응답 시간**, **PR 병합 속도** 등의 **주요 생산성 지표 시각화**  
14 |   - **글로벌 빅테크 및 국내 IT기업**의 벤치마킹 데이터 비교  
15 |   - **실시간 데이터 갱신** 및 **기간별/프로젝트별 필터링** 지원  
16 |   - Github API 및 오픈소스 활용한 **데이터 수집 및 분석** 기능  
17 | 
18 | ## 2. 기능 요구 사항 (Functional Requirements)
19 | - **데이터 수집**: Github API를 통해 **PR, 커밋, 코드 리뷰 데이터**를 자동 수집하고, 프로젝트 메타데이터(팀, 저장소, 태그 등)를 저장 및 관리합니다.  
20 | - **지표 측정 및 분석**: 수집된 데이터로부터 **PR 개수**, **코드 변경량(LOC)**, **리뷰 응답 시간**, **PR 사이클 타임**(생성~병합 소요 시간), **배포 빈도**, **결함률** 등 핵심 지표를 계산합니다. 각 지표에 대한 공식과 계산 로직을 적용하고, 결과를 해석 가능한 형태로 제공해야 합니다. *(예: PR 병합 시간은 팀 효율성의 지표로 사용됩니다 ([Developer Productivity: Effective Ways to Measure and Strategies to Improve](mdc:https:/techhub.asia/how-to-measure-developer-productivity/#:~:text=,mentoring%2C%20and%20participating%20in%20discussions)))* 또한, **배포 빈도** 등 **DORA** 연구의 핵심 지표를 반영하여 DevOps 성능을 평가합니다 ([Developer Productivity: Effective Ways to Measure and Strategies to Improve](mdc:https:/techhub.asia/how-to-measure-developer-productivity/#:~:text=,team%20release%20code%20into%20production)).  
21 | - **대시보드 UI/UX**: 대시보드는 **개인별/프로젝트별 PR 활동 요약**과 **지표별 그래프**를 제공합니다. 막대 차트, 선 그래프 등의 시각 요소와 KPI 카드 위젯으로 구성하여 한눈에 성과를 파악할 수 있게 합니다. 기간 선택 및 프로젝트별 **필터 기능**을 제공하여 사용자가 원하는 범위의 데이터를 볼 수 있습니다. UI 구현에는 **shadcn UI 컴포넌트**와 **Tailwind CSS**를 활용하여 일관된 디자인을 적용합니다.  
22 | - **데이터 갱신 및 성능 최적화**: GitHub의 최신 데이터를 **실시간 동기화**하거나 일정 주기로 업데이트합니다. **Zustand**로 상태를 관리하며 데이터 캐싱을 적용해 불필요한 API 호출을 줄이고 성능을 높입니다. 대시보드 로딩 속도를 위해 필요한 데이터만 선택적으로 요청하고, API Rate Limit에 대비하여 백오프(backoff) 전략을 포함합니다.
23 | 
24 | ## 3. 기술 요구 사항 (Technical Requirements)
25 | - **프론트엔드**: Vite + React 기반으로 개발하며, 상태 관리는 Zustand를 이용합니다. 스타일링은 Tailwind CSS를 사용하고, UI 구성에는 shadcn 컴포넌트를 활용합니다. 테스트 코드는 Vitest로 작성합니다.  
26 | - **백엔드**: 별도의 서버 없이 **Github API**와 관련 오픈소스 라이브러리(예: Octokit)를 활용하여 데이터 수집 및 처리를 수행합니다. (초기 버전에서는 클라이언트 사이드 처리 위주)  
27 | - **데이터베이스**: **없음** (초기 버전에서는 데이터베이스를 사용하지 않고 클라이언트에서 데이터를 처리합니다. 추후 필요한 경우 도입 검토)  
28 | - **배포**: Vercel 또는 Netlify를 통해 프론트엔드 애플리케이션을 **CI/CD 파이프라인**으로 쉽게 배포할 수 있도록 구성합니다.
29 | 
30 | ## 4. 데이터 요구 사항 (Data Requirements)
31 | - **수집할 데이터**:  
32 |   - **PR 정보**: PR 생성 시간, 생성자, 병합 여부와 병합 시각, 리뷰어 및 리뷰 코멘트 내역 등  
33 |   - **커밋 정보**: PR에 속한 모든 커밋의 변경 라인 수 (추가된 줄, 삭제된 줄)  
34 |   - **프로젝트 메타데이터**: 프로젝트 식별 정보(레포지토리 이름), 팀/부서명, 프로젝트 태그 등  
35 | - **지표 계산 방법**:  
36 |   - **PR 수**: 선택 기간 내 생성된 Pull Request의 총 개수  
37 |   - **코드 변경량 (LOC)**: 해당 기간 PR들의 모든 커밋에서 추가/삭제된 코드 라인 총합  
38 |   - **리뷰 응답 시간**: PR 생성 시각부터 **첫 번째 리뷰 코멘트**까지 걸린 시간 (평균 및 중앙값 산출)  
39 |   - **PR 사이클 타임**: PR 생성부터 최종 **병합 완료**까지 소요된 시간 (평균 및 중앙값 산출)  
40 |   - **배포 빈도**: 제품 배포(릴리즈) 횟수 또는 main 브랜치에 병합된 PR의 배포 주기 (DORA의 **Deployment Frequency** 지표와 연관) ([Developer Productivity: Effective Ways to Measure and Strategies to Improve](mdc:https:/techhub.asia/how-to-measure-developer-productivity/#:~:text=,team%20release%20code%20into%20production))  
41 |   - **결함률**: 배포된 변경사항 중 **실패(롤백 또는 장애 발생)**한 비율 (DORA의 **Change Failure Rate** 지표와 연관) ([Developer Productivity: Effective Ways to Measure and Strategies to Improve](mdc:https:/techhub.asia/how-to-measure-developer-productivity/#:~:text=,prepared%20team))  
42 | 
43 | ## 5. UI/UX 요구 사항 (UI/UX Requirements)
44 | - **레이아웃**: 대시보드의 기본 레이아웃을 정의하고 핵심 지표를 한눈에 볼 수 있도록 **상단에 요약 지표 카드**, **하단에 상세 그래프 영역** 등을 배치합니다.  
45 | - **필터 및 조회**: 화면 상단에 기간 선택(date range picker), 프로젝트 선택 드롭다운 등의 **필터 UI**를 제공하여 사용자 요청에 따라 대시보드 내용을 갱신합니다. 필터 적용 결과는 즉각적으로 시각화에 반영됩니다.  
46 | - **차트와 카드**: 각 지표는 가장 효과적으로 전달될 수 있는 **시각화 차트**로 표현합니다 (예: 추이는 선형 그래프, 비교는 막대 그래프). 주요 KPI는 카드 형태로 요약 표시합니다. 이를 통해 사용자들이 **가독성 높게** 데이터를 이해할 수 있도록 합니다.  
47 | - **반응형 디자인**: 다양한 해상도와 기기에서 사용 가능하도록 **반응형 UI**를 구현합니다. 또한 사용성 향상을 위해 **다크 모드 지원**도 검토합니다.
48 | 
49 | ## 6. 성능 및 확장성 고려 (Performance & Scalability)
50 | - **API 호출 최적화**: 필요한 데이터만 선별적으로 **REST API 호출**을 수행하여 Rate Limit 초과를 방지합니다. 응답 데이터는 가능한 캐시하여 동일한 요청을 반복하지 않습니다.  
51 | - **상태 캐싱**: **Zustand**를 이용해 클라이언트 상태와 fetched 데이터를 캐싱함으로써 화면 전환이나 재렌더링 시 불필요한 재요청을 막고 성능을 향상시킵니다.  
52 | - **실시간 갱신**: 최신 생산성 지표를 확인할 수 있도록 **실시간 데이터 갱신**을 고려합니다. WebSocket 연결 또는 일정 주기의 폴링(polling)으로 데이터를 주기적으로 동기화하여 대시보드를 최신 상태로 유지합니다.  
53 | - **확장성**: 향후 데이터 증가나 기능 확장에 대비해 코드를 모듈화하고 인터페이스를 추상화합니다. 필요 시 백엔드 서버나 데이터베이스 도입이 용이하도록 구조를 설계해 둡니다.
54 | 
55 | ## 7. 벤치마킹 및 비교 (Benchmark & Comparison)
56 | - **업계 사례 분석**: Google, Microsoft, LinkedIn 등의 **글로벌 빅테크 기업**과 네이버, 카카오 등의 **국내 IT기업**에서 개발자 생산성을 측정하는 사례를 연구하여 벤치마킹합니다. 이들 기업은 전담 팀을 두어 개발 생산성 지표를 모니터링하고, **단일 지표로 생산성을 판단하지 않는 철학**을 가지고 있습니다 ([Measuring Developer Productivity: Real-World Examples](mdc:https:/newsletter.pragmaticengineer.com/p/measuring-developer-productivity-bae#:~:text=Whether%20measuring%20a%20tool%2C%20process%2C,helping%20to%20surface%20potential%20tradeoffs)). 예를 들어, Microsoft 산하의 LinkedIn은 **Developer Insights** 전담 팀을 운영하며 개발자 생산성과 만족도를 종합적으로 분석하고 있습니다 ([Measuring Developer Productivity: Real-World Examples](mdc:https:/newsletter.pragmaticengineer.com/p/measuring-developer-productivity-bae#:~:text=LinkedIn%20employs%20more%20than%2010%2C000,the%20internal%20tools%20they%20use)). 이러한 모범 사례를 참고하여 본 대시보드에 적용할 지표와 방법론을 선정합니다.  
57 | - **DORA 지표 반영**: DevOps Research & Assessment(DORA)에서 제시한 **4대 핵심 개발 지표**를 대시보드 설계에 반영합니다. **배포 빈도**, **변경 리드 타임**, **변경 실패율**, **평균 복구 시간**과 같은 지표들은 소프트웨어 전달 성능을 나타내는 업계 표준으로 자리잡고 있습니다 ([Developer Productivity: Effective Ways to Measure and Strategies to Improve](mdc:https:/techhub.asia/how-to-measure-developer-productivity/#:~:text=The%20DORA%20,and%20enhance%20overall%20software%20quality)). 본 프로젝트에서는 이 중 **배포 빈도**와 **실패율** 등을 우선적으로 측정하여 우리 팀의 DevOps 성과를 업계 표준과 비교 평가할 수 있도록 합니다.
58 | 
59 | ## 8. 프로젝트 일정 및 마일스톤 (Timeline & Milestones)
60 | 1. **1주차**: 프로젝트 환경 설정 완료 (Vite 초기 설정, Tailwind CSS 구성, Zustand 상태 관리 셋업)  
61 | 2. **2~3주차**: Github API 연동 개발 및 **데이터 수집 모듈** 구현 (PR 목록, 커밋 내역 불러오기 기능)  
62 | 3. **4~5주차**: 수집 데이터 기반 **지표 계산 로직** 개발 (PR 통계, 리뷰 시간 등 산출)  
63 | 4. **6~7주차**: 대시보드 **UI 디자인** 확정 및 레이아웃 개발 (컴포넌트 배치 및 스타일링)  
64 | 5. **8~9주차**: **필터링 및 데이터 갱신 기능** 구현 (기간별, 프로젝트별 필터 + 실시간 업데이트)  
65 | 6. **10~12주차**: 전체 시스템 **최적화 및 테스트**, **배포 준비** (코드 리팩토링, 성능 점검, 버그 수정, Vercel 배포)  
66 | 
67 | ## 9. 위험 요소 및 대응 방안 (Risks & Mitigations)
68 | - **Github API 제한**: GitHub API 호출 한도 초과 및 응답 지연 우려가 있습니다. **해결**: 요청 횟수를 줄이기 위해 결과 캐싱, 지수적 백오프 전략을 적용하고, 필요한 경우 GitHub API의 **GraphQL** 적용이나 API 사용 범위 협의를 고려합니다.  
69 | - **기술 복잡도 (주니어 개발자)**: 상태 관리, 데이터 시각화 등 초기 진입장벽이 있을 수 있습니다. **해결**: Task 분할을 통한 **단계별 개발 가이드**를 제공하고, 코드 리뷰와 멘토링을 통해 팀 내 기술 공유를 활성화합니다.  
70 | - **지표 해석 오류**: 산출된 생산성 지표에 대한 오해나 잘못된 해석 가능성이 있습니다. **해결**: 지표의 의미와 한계를 문서화하고 **개발자 교육 세션**을 통해 공유합니다. 또한 지표는 절대적인 평가가 아닌 개선 방향을 위한 참고로 활용하도록 안내합니다.
71 | 
72 | ## 10. 통합 및 확장성 계획 (Integration & Scalability Plan)
73 | - **CI/CD 도구 연동**: Jenkins, CircleCI 등 CI/CD 도구와의 연동을 통해 배포 관련 지표를 자동으로 수집합니다.
74 | - **이슈 트래커 통합**: Jira, Linear 등 이슈 트래킹 시스템과 연동하여 작업 추적 데이터를 수집합니다.
75 | - **다중 VCS 지원**: GitHub 외에도 GitLab, Bitbucket 등 다양한 버전 관리 시스템 지원 계획을 수립합니다.
76 | - **API 확장**: 향후 다른 시스템에서도 대시보드 데이터를 활용할 수 있도록 REST API 제공 계획을 검토합니다.
```

.notes/tasklist.mdc
```
1 | ---
2 | description: Tasklist to build the simple productivity dashboard
3 | globs: 
4 | alwaysApply: false
5 | ---
6 | ## 0. 개발 원칙
7 | 
8 | - beaver 폴더를 / 폴더로 작업할 것 (하위에 다시 beaver 폴더 생성 절대 금지)
9 | - 프레임워크의 공식 문서를 참고해서 개발
10 | - 문제나 오류가 발생하면 문제와 해결책을 제시한 후 멈출 것. 절대 대안을 스스로 결정해서 실행하지 말 것. 
11 | - 패키지 관리자는 yarn을 사용.
12 | 
13 | ## 1. 수집할 데이터
14 | 
15 | - **Github Pull Request (PR) 데이터**  
16 |   - PR ID, 작성자, 생성 시간, 병합 시간, 상태(열림/병합/닫힘)  
17 |   - 첫 번째 리뷰 코멘트 시간 및 전체 리뷰 내역 (리뷰어, 코멘트 내용, 승인 여부 등)
18 | 
19 | - **Github Commit 데이터**  
20 |   - 각 PR에 포함된 커밋 목록  
21 |   - 각 커밋의 코드 변경 라인 수 (추가, 삭제)
22 | 
23 | - **프로젝트 메타데이터**  
24 |   - 레포지토리명, 프로젝트/팀 태그 등  
25 |   - (옵션) CI/CD 로그 데이터: 배포 이벤트, 빌드 시간 등
26 | 
27 | ---
28 | 
29 | ## 2. 측정 지표 및 구체적인 추출 공식
30 | 
31 | - **PR 개수**  
32 |   - **정의**: 선택한 기간 내에 생성된 PR의 총 개수  
33 |   - **공식**:  
34 |     ```
35 |     PR Count = Count( PR 생성시간 ∈ [시작일, 종료일] )
36 |     ```
37 | 
38 | - **코드 변경량 (LOC: Lines of Code)**  
39 |   - **정의**: PR에 포함된 모든 커밋에서 추가 및 삭제된 라인 수의 합  
40 |   - **공식**:  
41 |     ```
42 |     LOC = Sum( lines_added + lines_removed ) for each commit in PRs
43 |     ```
44 | 
45 | - **리뷰 응답 시간 (Review Response Time)**  
46 |   - **정의**: PR 생성 후 첫 번째 리뷰 코멘트까지 소요된 시간의 평균  
47 |   - **공식**:  
48 |     ```
49 |     Review Response Time = Average( first_review_timestamp - PR_created_timestamp )
50 |     ```
51 | 
52 | - **PR 사이클 타임 (Cycle Time)**  
53 |   - **정의**: PR이 생성된 시점부터 병합 완료 시점까지의 시간  
54 |   - **공식**:  
55 |     ```
56 |     Cycle Time = Average( PR_merged_timestamp - PR_created_timestamp )
57 |     ```
58 | 
59 | - **배포 빈도 (Deployment Frequency)** *(옵션)*  
60 |   - **정의**: 선택한 기간 동안 발생한 배포 건수  
61 |   - **공식**:  
62 |     ```
63 |     Deployment Frequency = Count( 배포 이벤트 ) / 선택 기간
64 |     ```
65 | 
66 | - **결함률 (Change Failure Rate)** *(옵션)*  
67 |   - **정의**: 배포 후 문제(버그, 롤백 등)가 발생한 비율  
68 |   - **공식**:  
69 |     ```
70 |     Change Failure Rate = (Count( 배포 후 문제 발생 ) / Count( 전체 배포 )) * 100
71 |     ```
72 | 
73 | ---
74 | 
75 | ## 3. 대시보드 개발 Tasklist
76 | 
77 | ### **Task 1: 프로젝트 환경 셋업 (예상 2일)**
78 | - **목표**: Vite, Tailwind, shadcn, Zustand, Vitest, SQLite, react fetch를 활용하여 기본 프로젝트 환경 구성  
79 | - **세부 단계**:
80 |   1. **프로젝트 생성**:  
81 |      - Vite로 React 기반 프로젝트 생성  
82 |        ```bash
83 |        npm create vite@latest project-dashboard --template react
84 |        ```
85 |   2. **Tailwind CSS 설정**:  
86 |      - Tailwind CSS 및 PostCSS 설정 파일(`tailwind.config.js`, `postcss.config.js`) 구성  
87 |   3. **shadcn UI 구성요소 설치 및 설정**:  
88 |      - shadcn UI 컴포넌트를 설치하고 기본 테마 커스터마이징  
89 |   4. **Zustand 설치 및 기본 스토어 설정**:  
90 |      - 전역 상태 관리를 위한 기본 스토어 생성  
91 |   5. **Vitest 설치 및 기본 테스트 환경 구성**:  
92 |      - 테스트 스크립트 작성 및 실행 확인 
93 |   6. **SQLite 설치 및 기본 테스트 환경 구성**:  
94 |      - 설치 및 실행 확인
95 |      - 이후 다른 DB 변경 가능성 높음. 반드시 어뎁터를 구성하여 DB 교체에 대응할 수 있어야 함. 
96 | ---
97 | 
98 | ### **Task 2: Github 데이터 수집 모듈 구현 (예상 5일)**
99 | - **목표**: Github API를 통해 PR, 커밋, 리뷰 데이터를 자동 수집  
100 | - **세부 단계**:
101 |   1. **Octokit 설치**:  
102 |      - `npm install @octokit/rest`
103 |   2. **환경 변수 설정**:  
104 |      - Github Personal Access Token을 `.env` 파일에 저장  
105 |        ```
106 |        VITE_GITHUB_TOKEN=your_github_token_here
107 |        ```
108 |   3. **프로젝트 설정**: 
109 |      - config.json 파일에 분석 대상 github 주소를 지정한다. 
110 |      - 이 주소로 프로젝트를 실행/테스트한다. 
111 |   4. **API 호출 함수 작성**:  
112 |      - PR 데이터: `octokit.pulls.list`  
113 |      - 커밋 데이터: `octokit.pulls.listCommits`  
114 |      - 리뷰 데이터: `octokit.pulls.listReviews`  
115 |      - 예) `src/api/github.ts` 파일에 API 함수 구현
116 |   5. **데이터 필터링**:  
117 |      - 선택한 기간, 프로젝트 등 조건에 맞게 데이터 필터링  
118 |   6. **테스트 작성**:  
119 |      - Vitest를 활용하여 모듈 단위 테스트 작성 (Mock 데이터 포함)
120 | 
121 | ---
122 | 
123 | ### **Task 3: 데이터 처리 및 지표 계산 모듈 개발 (예상 4일)**
124 | - **목표**: 수집한 데이터를 기반으로 앞서 정의한 지표를 계산하는 로직 구현  
125 | - **세부 단계**:
126 |   1. **데이터 파싱 함수 구현**:  
127 |      - PR마다 첫 리뷰 코멘트 시간, 커밋별 코드 변경량 추출
128 |   2. **지표 계산 함수 작성**:  
129 |      - 각 공식에 맞춰 PR 개수, LOC, 리뷰 응답 시간, 사이클 타임 계산
130 |   3. **결과를 상태 관리(Zustand)에 저장**:  
131 |      - 계산된 결과를 전역 스토어에 저장해 UI에 연결
132 |   4. **Vitest로 단위 테스트 작성**
133 | 
134 | ---
135 | 
136 | ### **Task 4: 대시보드 UI 컴포넌트 개발 (예상 7일)**
137 | - **목표**: shadcn UI와 Tailwind CSS를 사용하여 지표를 시각화하는 컴포넌트 제작  
138 | - **세부 단계**:
139 |   1. **디자인 목업 작성**:  
140 |      - Figma 또는 간단한 스케치로 레이아웃 구성
141 |      - 환경 설정 반드시 구현. (특히 분석 대상 URL 입력) 
142 |   2. **각 위젯(카드, 차트 등) 개발**:  
143 |      - 예: PR 개수 카드, 평균 리뷰 시간 차트, 사이클 타임 차트 등  
144 |      - 차트 라이브러리 (예: Chart.js, Recharts)를 Vite와 호환되게 추가
145 |   3. **데이터 연결**:  
146 |      - Zustand store에서 계산된 데이터를 각 컴포넌트에 props로 전달  
147 |   4. **반응형 디자인 및 스타일링**:  
148 |      - Tailwind CSS를 활용해 반응형 레이아웃 구현
149 |   5. **컴포넌트 테스트**:  
150 |      - Vitest로 UI 컴포넌트 렌더링 및 인터랙션 테스트
151 | 
152 | ---
153 | 
154 | ### **Task 5: 필터링 및 날짜 선택 기능 개발 (예상 3일)**
155 | - **목표**: 사용자가 연간, 월간, 사용자 지정 기간 및 프로젝트별로 데이터를 필터링할 수 있는 인터페이스 구현  
156 | - **세부 단계**:
157 |   1. **날짜 선택 컴포넌트 개발**:  
158 |      - react-date-range 같은 라이브러리 또는 커스텀 컴포넌트 사용  
159 |   2. **프로젝트/팀 선택 드롭다운 구성**
160 |   3. **필터 변경 시 데이터 재조회 및 스토어 업데이트 로직 구현**
161 |   4. **업데이트 단추** 
162 |   5. **테스트**:  
163 |      - Vitest로 필터 기능 및 상태 업데이트 테스트
164 | 
165 | ---
166 | 
167 | ### **Task 6: 데이터 갱신 기능 개발 (예상 3일)**
168 | - **목표**: Dashboard 사용자가 [업데이트] 단추를 누르면 데이터를 새로고침  
169 | - **세부 단계**:
170 |   1. **업데이트 기능 구현**:  
171 |      - 사용자 UI에서 이벤트 발생 -> Github API 호출
172 |   2. **데이터 갱신 시 Zustand store 업데이트**  
173 |   3. **반영 테스트 (Vitest로 로직 검증)**
174 | 
175 | ---
176 | 
177 | ### **Task 7: 최종 통합 및 배포 준비 (예상 2일)**
178 | - **목표**: 모든 모듈 통합, 종합 테스트 및 배포 준비  
179 | - **세부 단계**:
180 |   1. **모듈 통합 및 End-to-End 테스트 작성**
181 |   2. **Vite 빌드 최적화 및 배포 스크립트 작성**  
182 |      - 예: Vercel 또는 Netlify에 배포
183 |   3. **개발자 가이드 및 README 작성**
184 | 
185 | ---
186 | 
187 | ## 4. 구체적인 구현 가이드 예시: Github PR 데이터 수집
188 | 
189 | ### **목표**:  
190 | Github API를 활용해 PR 데이터를 수집하고, 이를 기반으로 지표를 계산하여 대시보드에 표시
191 | 
192 | ### **구현 단계**:
193 | 
194 | 1. **Octokit 설치 및 설정**  
195 |    - **설치**:  
196 |      ```bash
197 |      npm install @octokit/rest
198 |      ```
199 |    - **환경 변수 설정**:  
200 |      - `.env` 파일에 아래와 같이 입력  
201 |        ```
202 |        VITE_GITHUB_TOKEN=your_github_token_here
203 |        ```
204 | 
205 | 2. **API 모듈 작성 (예: `src/api/github.ts`)**:
206 |    ```typescript
207 |    import { Octokit } from "@octokit/rest";
208 | 
209 |    const octokit = new Octokit({ auth: import.meta.env.VITE_GITHUB_TOKEN });
210 | 
211 |    // PR 데이터 수집 함수
212 |    export async function fetchPullRequests(owner: string, repo: string, since: string, until: string) {
213 |      const { data } = await octokit.pulls.list({
214 |        owner,
215 |        repo,
216 |        state: "all",
217 |        per_page: 100,
218 |      });
219 |      // 선택 기간에 맞게 필터링
220 |      return data.filter(pr => {
221 |        const createdAt = new Date(pr.created_at);
222 |        return createdAt >= new Date(since) && createdAt <= new Date(until);
223 |      });
224 |    }
225 |    ```
226 | 3. **리뷰 데이터 수집**  
227 |    - 각 PR에 대해 `octokit.pulls.listReviews`를 호출하여 리뷰 타임스탬프 및 상태를 수집  
228 |    - 이를 통해 ‘첫 리뷰 코멘트 시간’ 등 지표를 계산
229 | 
230 | 4. **상태 관리 연동 (예: Zustand 사용)**  
231 |    - `src/store/dashboardStore.ts` 파일에서 스토어 구성:
232 |    ```typescript
233 |    import create from 'zustand';
234 |    import { fetchPullRequests } from '../api/github';
235 | 
236 |    interface DashboardState {
237 |      prs: any[];
238 |      setPRs: (prs: any[]) => void;
239 |      updatePRs: () => Promise<void>;
240 |    }
241 | 
242 |    export const useDashboardStore = create<DashboardState>((set) => ({
243 |      prs: [],
244 |      setPRs: (prs) => set({ prs }),
245 |      updatePRs: async () => {
246 |        const prs = await fetchPullRequests("owner", "repo", "2023-01-01", "2023-12-31");
247 |        set({ prs });
248 |      }
249 |    }));
250 |    ```
251 | 5. **테스트 작성**  
252 |    - Vitest를 이용해 API 함수와 스토어 업데이트 기능에 대한 단위 테스트 작성  
253 |    - Mock 데이터를 사용하여 예상 결과 검증
254 | 
255 | ---
256 | 
257 | **to do**
258 | - [ ] 근무 시간 연동
259 | - [ ] github enterprise 처리 (도메인 연동)
260 | - [ ] 여러 저장소 체크 -> 차트로 값 비교.
261 | - [ ] 저장소별/개인별 종합 점수 가능?
```

src/App.css
```
1 | #root {
2 |   display: flex;
3 |   flex-direction: column;
4 |   min-height: 100vh;
5 |   width: 100%;
6 | }
7 | 
8 | html, body {
9 |   margin: 0;
10 |   padding: 0;
11 |   height: 100%;
12 |   width: 100%;
13 | }
14 | 
15 | body {
16 |   font-family: sans-serif;
17 |   -webkit-font-smoothing: antialiased;
18 |   -moz-osx-font-smoothing: grayscale;
19 | }
20 | 
21 | @keyframes fade-in {
22 |   from {
23 |     opacity: 0;
24 |   }
25 |   to {
26 |     opacity: 1;
27 |   }
28 | }
29 | 
30 | .animate-fade-in {
31 |   animation: fade-in 0.5s ease-in-out;
32 | }
33 | 
34 | /* 차트 컨테이너 스타일 */
35 | .chart-container {
36 |   min-height: 300px;
37 |   width: 100%;
38 | }
39 | 
40 | /* 카드 호버 효과 */
41 | .card-hover:hover {
42 |   transform: translateY(-2px);
43 |   transition: transform 0.2s ease-in-out;
44 |   box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
45 | }
```

src/App.tsx
```
1 | import Dashboard from './components/dashboard/Dashboard'
2 | import './App.css'
3 | 
4 | function App() {
5 |   return (
6 |     <div className="min-h-screen w-full" style={{ backgroundColor: 'hsl(var(--background))' }}>
7 |       <Dashboard />
8 |     </div>
9 |   )
10 | }
11 | 
12 | export default App
```

src/config.json
```
1 | {
2 |   "repositories": [
3 |     {
4 |       "name": "react",
5 |       "owner": "facebook",
6 |       "description": "Facebook의 React 라이브러리"
7 |     },
8 |     {
9 |       "name": "arch_flow",
10 |       "owner": "wodory",
11 |       "description": "wodory의 arch_flow 저장소"
12 |     },
13 |     {
14 |       "name": "backyard",
15 |       "owner": "wodory",
16 |       "description": "wodory의 backyard 저장소"
17 |     },
18 |     {
19 |       "name": "d3-hierarchy",
20 |       "owner": "d3",
21 |       "description": "2D layout algorithms for visualizing hierarchical data."
22 |     }
23 |   ],
24 |   "defaultTimeRange": {
25 |     "since": "2023-01-01",
26 |     "until": "2023-12-31"
27 |   },
28 |   "refreshInterval": 300000
29 | }
```

src/index.css
```
1 | @tailwind base;
2 | @tailwind components;
3 | @tailwind utilities;
4 | 
5 | :root {
6 |   --background: 0 0% 100%;
7 |   --foreground: 222.2 84% 4.9%;
8 | 
9 |   --card: 0 0% 100%;
10 |   --card-foreground: 222.2 84% 4.9%;
11 | 
12 |   --popover: 0 0% 100%;
13 |   --popover-foreground: 222.2 84% 4.9%;
14 | 
15 |   --primary: 222.2 47.4% 11.2%;
16 |   --primary-foreground: 210 40% 98%;
17 | 
18 |   --secondary: 210 40% 96.1%;
19 |   --secondary-foreground: 222.2 47.4% 11.2%;
20 | 
21 |   --muted: 210 40% 96.1%;
22 |   --muted-foreground: 215.4 16.3% 46.9%;
23 | 
24 |   --accent: 210 40% 96.1%;
25 |   --accent-foreground: 222.2 47.4% 11.2%;
26 | 
27 |   --destructive: 0 84.2% 60.2%;
28 |   --destructive-foreground: 210 40% 98%;
29 | 
30 |   --border: 214.3 31.8% 91.4%;
31 |   --input: 214.3 31.8% 91.4%;
32 |   --ring: 222.2 84% 4.9%;
33 | 
34 |   --radius: 0.5rem;
35 | 
36 |   /* 차트 색상 */
37 |   --chart-1: 12 76% 61%;
38 |   --chart-2: 173 58% 39%;
39 |   --chart-3: 197 37% 24%;
40 |   --chart-4: 43 74% 66%;
41 |   --chart-5: 27 87% 67%;
42 | }
43 | 
44 | .dark {
45 |   --background: 222.2 84% 4.9%;
46 |   --foreground: 210 40% 98%;
47 | 
48 |   --card: 222.2 84% 4.9%;
49 |   --card-foreground: 210 40% 98%;
50 | 
51 |   --popover: 222.2 84% 4.9%;
52 |   --popover-foreground: 210 40% 98%;
53 | 
54 |   --primary: 210 40% 98%;
55 |   --primary-foreground: 222.2 47.4% 11.2%;
56 | 
57 |   --secondary: 217.2 32.6% 17.5%;
58 |   --secondary-foreground: 210 40% 98%;
59 | 
60 |   --muted: 217.2 32.6% 17.5%;
61 |   --muted-foreground: 215 20.2% 65.1%;
62 | 
63 |   --accent: 217.2 32.6% 17.5%;
64 |   --accent-foreground: 210 40% 98%;
65 | 
66 |   --destructive: 0 62.8% 30.6%;
67 |   --destructive-foreground: 210 40% 98%;
68 | 
69 |   --border: 217.2 32.6% 17.5%;
70 |   --input: 217.2 32.6% 17.5%;
71 |   --ring: 212.7 26.8% 83.9%;
72 | 
73 |   /* 차트 색상 - 다크모드 */
74 |   --chart-1: 220 70% 50%;
75 |   --chart-2: 160 60% 45%;
76 |   --chart-3: 30 80% 55%;
77 |   --chart-4: 280 65% 60%;
78 |   --chart-5: 340 75% 55%;
79 | }
80 | 
81 | @layer base {
82 |   * {
83 |     border-color: hsl(var(--border));
84 |   }
85 |   body {
86 |     background-color: hsl(var(--background));
87 |     color: hsl(var(--foreground));
88 |     font-feature-settings: "rlig" 1, "calt" 1;
89 |   }
90 | }
91 | 
92 | .card-hover:hover {
93 |   transform: translateY(-2px);
94 |   transition: transform 0.2s ease-in-out;
95 |   box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
96 | }
```

src/main.tsx
```
1 | import { StrictMode } from 'react'
2 | import { createRoot } from 'react-dom/client'
3 | import './index.css'
4 | import App from './App.tsx'
5 | 
6 | createRoot(document.getElementById('root')!).render(
7 |   <StrictMode>
8 |     <App />
9 |   </StrictMode>,
10 | )
```

src/vite-env.d.ts
```
1 | /// <reference types="vite/client" />
```

src/api/github.ts
```
1 | import { Octokit } from "@octokit/rest";
2 | import { DeploymentEvent } from "../types/github";
3 | 
4 | // Octokit 인스턴스 생성
5 | const octokit = new Octokit({ auth: import.meta.env.VITE_GITHUB_TOKEN });
6 | 
7 | // 타입 정의
8 | export interface PullRequest {
9 |   id: number;
10 |   number: number;
11 |   title: string;
12 |   user: {
13 |     login: string;
14 |   };
15 |   created_at: string;
16 |   merged_at: string | null;
17 |   closed_at: string | null;
18 |   state: string;
19 |   html_url: string;
20 | }
21 | 
22 | export interface Review {
23 |   id: number;
24 |   user: {
25 |     login: string;
26 |   };
27 |   state: string;
28 |   submitted_at: string;
29 |   body: string;
30 | }
31 | 
32 | export interface Commit {
33 |   sha: string;
34 |   commit: {
35 |     message: string;
36 |     author: {
37 |       name: string;
38 |       date: string;
39 |     };
40 |   };
41 |   stats?: {
42 |     additions: number;
43 |     deletions: number;
44 |     total: number;
45 |   };
46 | }
47 | 
48 | /**
49 |  * PR 데이터 수집 함수
50 |  */
51 | export async function fetchPullRequests(owner: string, repo: string, since: string, until: string): Promise<PullRequest[]> {
52 |   try {
53 |     const { data } = await octokit.pulls.list({
54 |       owner,
55 |       repo,
56 |       state: "all",
57 |       per_page: 100,
58 |     });
59 |     
60 |     // 선택 기간에 맞게 필터링
61 |     return data.filter(pr => {
62 |       const createdAt = new Date(pr.created_at);
63 |       return createdAt >= new Date(since) && createdAt <= new Date(until);
64 |     }) as PullRequest[];
65 |   } catch (error) {
66 |     console.error("PR 데이터 가져오기 오류:", error);
67 |     throw error;
68 |   }
69 | }
70 | 
71 | /**
72 |  * PR에 대한 코멘트 목록 가져오기
73 |  */
74 | export async function fetchPullRequestComments(owner: string, repo: string, pullNumber: number): Promise<any[]> {
75 |   try {
76 |     const { data } = await octokit.pulls.listComments({
77 |       owner,
78 |       repo,
79 |       pull_number: pullNumber,
80 |     });
81 |     
82 |     return data;
83 |   } catch (error) {
84 |     console.error(`PR #${pullNumber} 코멘트 가져오기 오류:`, error);
85 |     throw error;
86 |   }
87 | }
88 | 
89 | /**
90 |  * PR 리뷰 데이터 가져오기
91 |  */
92 | export async function fetchPullRequestReviews(owner: string, repo: string, pullNumber: number): Promise<Review[]> {
93 |   try {
94 |     const { data } = await octokit.pulls.listReviews({
95 |       owner,
96 |       repo,
97 |       pull_number: pullNumber,
98 |     });
99 |     
100 |     return data as Review[];
101 |   } catch (error) {
102 |     console.error(`PR #${pullNumber} 리뷰 데이터 가져오기 오류:`, error);
103 |     throw error;
104 |   }
105 | }
106 | 
107 | /**
108 |  * PR에 포함된 커밋 목록 가져오기
109 |  */
110 | export async function fetchPullRequestCommits(owner: string, repo: string, pullNumber: number): Promise<Commit[]> {
111 |   try {
112 |     const { data } = await octokit.pulls.listCommits({
113 |       owner,
114 |       repo,
115 |       pull_number: pullNumber,
116 |     });
117 |     
118 |     return data as Commit[];
119 |   } catch (error) {
120 |     console.error(`PR #${pullNumber} 커밋 가져오기 오류:`, error);
121 |     throw error;
122 |   }
123 | }
124 | 
125 | /**
126 |  * 커밋의 상세 정보(변경된 라인 수 등) 가져오기
127 |  */
128 | export async function fetchCommitDetails(owner: string, repo: string, sha: string): Promise<Commit> {
129 |   try {
130 |     const { data } = await octokit.repos.getCommit({
131 |       owner,
132 |       repo,
133 |       ref: sha,
134 |     });
135 |     
136 |     // 필요한 정보만 추출하여 반환
137 |     return {
138 |       sha: data.sha,
139 |       commit: data.commit,
140 |       stats: data.stats
141 |     } as Commit;
142 |   } catch (error) {
143 |     console.error(`커밋 ${sha} 상세 정보 가져오기 오류:`, error);
144 |     throw error;
145 |   }
146 | }
147 | 
148 | /**
149 |  * 배포 데이터 가져오기 (GitHub Deployments API 사용)
150 |  */
151 | export async function fetchDeployments(owner: string, repo: string): Promise<DeploymentEvent[]> {
152 |   try {
153 |     const { data } = await octokit.repos.listDeployments({
154 |       owner,
155 |       repo,
156 |       per_page: 100,
157 |     });
158 |     
159 |     // DeploymentEvent 형식으로 변환
160 |     const deployments: DeploymentEvent[] = await Promise.all(
161 |       data.map(async (deployment) => {
162 |         // 배포 상태 조회
163 |         const { data: statuses } = await octokit.repos.listDeploymentStatuses({
164 |           owner,
165 |           repo,
166 |           deployment_id: deployment.id,
167 |         });
168 |         
169 |         // 최신 상태 가져오기
170 |         const latestStatus = statuses[0];
171 |         
172 |         return {
173 |           id: deployment.id,
174 |           repository: `${owner}/${repo}`,
175 |           environment: deployment.environment || 'unknown',
176 |           created_at: deployment.created_at,
177 |           completed_at: latestStatus?.created_at,
178 |           status: (latestStatus?.state === 'success') ? 'success' : 
179 |                  (latestStatus?.state === 'failure' || latestStatus?.state === 'error') ? 'failure' : 'pending',
180 |           has_issues: latestStatus?.state === 'failure' || latestStatus?.state === 'error',
181 |           created_by: deployment.creator?.login || 'unknown'
182 |         } as DeploymentEvent;
183 |       })
184 |     );
185 |     
186 |     return deployments;
187 |   } catch (error) {
188 |     console.error("배포 데이터 가져오기 오류:", error);
189 |     throw error;
190 |   }
191 | }
192 | 
193 | /**
194 |  * 배포 상태에 따라 결함 여부 판단
195 |  */
196 | export function hasDeploymentIssues(status: string): boolean {
197 |   return status === 'failure' || status === 'error';
198 | } 
```

src/store/dashboardStore.ts
```
1 | import { create } from 'zustand'
2 | import { 
3 |   fetchPullRequests, 
4 |   fetchPullRequestReviews, 
5 |   fetchPullRequestCommits,
6 |   fetchCommitDetails,
7 |   fetchDeployments,
8 |   PullRequest,
9 |   Review,
10 |   Commit
11 | } from '../api/github';
12 | import { Repository, TimeRange, MetricsResult, DeploymentEvent } from '../types/github';
13 | import { calculateMetrics } from '../lib/metrics';
14 | 
15 | // 대시보드 상태와 인터페이스를 정의합니다
16 | interface DashboardState {
17 |   // 필터링 상태
18 |   startDate: Date | null;
19 |   endDate: Date | null;
20 |   selectedRepo: string | null;
21 |   repositories: string[];
22 |   
23 |   // 데이터 상태
24 |   events: any[];
25 |   isLoading: boolean;
26 |   error: string | null;
27 |   
28 |   // 계산된 메트릭스
29 |   leadTimeForChanges: number | null;
30 |   deploymentFrequency: number | null;
31 |   changeFailureRate: number | null;
32 |   meanTimeToRestore: number | null;
33 |   
34 |   // 액션
35 |   setStartDate: (date: Date | null) => void;
36 |   setEndDate: (date: Date | null) => void;
37 |   setSelectedRepo: (repo: string | null) => void;
38 |   setEvents: (events: any[]) => void;
39 |   loadEvents: () => void;
40 |   loadMetrics: (startDate: Date, endDate: Date, repo: string) => void;
41 | }
42 | 
43 | export const useDashboardStore = create<DashboardState>((set, get) => ({
44 |   // 필터링 상태
45 |   startDate: null,
46 |   endDate: null,
47 |   selectedRepo: null,
48 |   repositories: ['owner/repo1', 'owner/repo2', 'owner/repo3'], // 예시 저장소 목록
49 |   
50 |   // 데이터 상태
51 |   events: [],
52 |   isLoading: false,
53 |   error: null,
54 |   
55 |   // 계산된 메트릭스
56 |   leadTimeForChanges: null,
57 |   deploymentFrequency: null,
58 |   changeFailureRate: null,
59 |   meanTimeToRestore: null,
60 |   
61 |   // 액션
62 |   setStartDate: (date) => set({ startDate: date }),
63 |   setEndDate: (date) => set({ endDate: date }),
64 |   setSelectedRepo: (repo) => set({ selectedRepo: repo }),
65 |   setEvents: (events) => set({ events }),
66 |   
67 |   // 이벤트 데이터 로드
68 |   loadEvents: () => {
69 |     set({ isLoading: true, error: null });
70 |     
71 |     // 실제 API 호출 대신 더미 데이터 사용 (나중에 수정)
72 |     setTimeout(() => {
73 |       const dummyEvents = [
74 |         { 
75 |           type: 'DeploymentEvent',
76 |           repo: 'owner/repo1',
77 |           created_at: '2023-04-01T10:00:00Z',
78 |           status: 'success'
79 |         },
80 |         { 
81 |           type: 'DeploymentEvent',
82 |           repo: 'owner/repo1',
83 |           created_at: '2023-04-03T11:00:00Z',
84 |           status: 'failure'
85 |         },
86 |         { 
87 |           type: 'DeploymentEvent',
88 |           repo: 'owner/repo2',
89 |           created_at: '2023-04-02T09:00:00Z',
90 |           status: 'success'
91 |         }
92 |       ];
93 |       
94 |       set({
95 |         events: dummyEvents,
96 |         isLoading: false
97 |       });
98 |     }, 500);
99 |   },
100 |   
101 |   // 메트릭스 계산
102 |   loadMetrics: (startDate, endDate, repo) => {
103 |     set({ isLoading: true, error: null });
104 |     
105 |     // 실제 계산 대신 더미 데이터 사용 (나중에 수정)
106 |     setTimeout(() => {
107 |       set({
108 |         leadTimeForChanges: 24.5, // 시간
109 |         deploymentFrequency: 0.8, // 일당 배포 수
110 |         changeFailureRate: 0.15, // 15%
111 |         meanTimeToRestore: 4.2, // 시간
112 |         isLoading: false
113 |       });
114 |     }, 500);
115 |   }
116 | }));
117 | 
118 | // useStore라는 이름으로도 내보냅니다
119 | export const useStore = useDashboardStore; 
```

src/lib/config-manager.ts
```
1 | import { Octokit } from "@octokit/rest";
2 | import { Repository, TimeRange } from '../types/github';
3 | import configData from '../config.json';
4 | import fs from 'fs';
5 | import path from 'path';
6 | import { fileURLToPath } from 'url';
7 | 
8 | // ESM 환경에서 현재 파일 경로 가져오기
9 | const __filename = fileURLToPath(import.meta.url);
10 | const __dirname = path.dirname(__filename);
11 | 
12 | // 설정 파일 경로
13 | const CONFIG_PATH = path.resolve(__dirname, '../config.json');
14 | 
15 | /**
16 |  * 설정 파일 인터페이스
17 |  */
18 | export interface Config {
19 |   repositories: Repository[];
20 |   defaultTimeRange: TimeRange;
21 |   refreshInterval: number;
22 | }
23 | 
24 | /**
25 |  * 설정 파일에서 저장소 목록 가져오기
26 |  */
27 | export function getRepositories(): Repository[] {
28 |   return configData.repositories;
29 | }
30 | 
31 | /**
32 |  * 설정 파일에서 기본 시간 범위 가져오기
33 |  */
34 | export function getDefaultTimeRange(): TimeRange {
35 |   return configData.defaultTimeRange;
36 | }
37 | 
38 | /**
39 |  * 설정 파일에서 새로고침 간격(밀리초) 가져오기
40 |  */
41 | export function getRefreshInterval(): number {
42 |   return configData.refreshInterval;
43 | }
44 | 
45 | /**
46 |  * 전체 설정 가져오기
47 |  */
48 | export function getConfig(): Config {
49 |   return configData as Config;
50 | }
51 | 
52 | /**
53 |  * 저장소 이름만으로 GitHub API를 사용하여 소유자 정보 찾기
54 |  */
55 | export async function findRepositoryOwner(repoName: string, token: string): Promise<Repository | null> {
56 |   const octokit = new Octokit({ auth: token });
57 |   
58 |   try {
59 |     // 저장소 이름으로 검색
60 |     const searchResult = await octokit.search.repos({
61 |       q: `${repoName} in:name`,
62 |       sort: 'stars',
63 |       order: 'desc',
64 |       per_page: 10
65 |     });
66 |     
67 |     if (searchResult.data.total_count === 0) {
68 |       return null;
69 |     }
70 |     
71 |     // 검색 결과에서 정확히 일치하는 이름 찾기
72 |     const exactMatch = searchResult.data.items.find(
73 |       repo => repo.name.toLowerCase() === repoName.toLowerCase()
74 |     );
75 |     
76 |     if (!exactMatch || !exactMatch.owner) {
77 |       return null;
78 |     }
79 |     
80 |     // 저장소 정보 반환
81 |     return {
82 |       name: exactMatch.name,
83 |       owner: exactMatch.owner.login,
84 |       description: exactMatch.description || `${exactMatch.owner.login}의 ${exactMatch.name} 저장소`
85 |     };
86 |     
87 |   } catch (error) {
88 |     console.error('저장소 검색 중 오류 발생:', error);
89 |     return null;
90 |   }
91 | }
92 | 
93 | /**
94 |  * 설정 파일에 저장소 추가
95 |  */
96 | export async function addRepository(
97 |   repoNameOrConfig: string | Repository, 
98 |   token: string
99 | ): Promise<Repository | null> {
100 |   // 현재 설정 로드
101 |   const config = getConfig();
102 |   let newRepo: Repository | null = null;
103 |   
104 |   // 문자열(저장소 이름)이 전달된 경우, API로 소유자 검색
105 |   if (typeof repoNameOrConfig === 'string') {
106 |     newRepo = await findRepositoryOwner(repoNameOrConfig, token);
107 |     if (!newRepo) {
108 |       console.error(`저장소 "${repoNameOrConfig}"을(를) 찾을 수 없습니다.`);
109 |       return null;
110 |     }
111 |   } else {
112 |     // 저장소 객체가 전달된 경우, 그대로 사용
113 |     newRepo = repoNameOrConfig;
114 |     
115 |     // owner가 없는 경우, API로 검색 시도
116 |     if (!newRepo.owner) {
117 |       const foundRepo = await findRepositoryOwner(newRepo.name, token);
118 |       if (!foundRepo) {
119 |         console.error(`저장소 "${newRepo.name}"의 소유자를 찾을 수 없습니다.`);
120 |         return null;
121 |       }
122 |       newRepo = foundRepo;
123 |     }
124 |   }
125 |   
126 |   // 이미 있는 저장소인지 확인
127 |   const exists = config.repositories.some(
128 |     repo => repo.name === newRepo?.name && repo.owner === newRepo?.owner
129 |   );
130 |   
131 |   if (exists) {
132 |     console.log(`저장소 "${newRepo.owner}/${newRepo.name}"은(는) 이미 설정에 있습니다.`);
133 |     return newRepo;
134 |   }
135 |   
136 |   // 새 저장소 추가
137 |   config.repositories.push(newRepo);
138 |   
139 |   // 설정 파일 업데이트
140 |   await saveConfig(config);
141 |   
142 |   console.log(`저장소 "${newRepo.owner}/${newRepo.name}"이(가) 설정에 추가되었습니다.`);
143 |   return newRepo;
144 | }
145 | 
146 | /**
147 |  * 설정 파일에서 저장소 제거
148 |  */
149 | export async function removeRepository(owner: string, name: string): Promise<boolean> {
150 |   // 현재 설정 로드
151 |   const config = getConfig();
152 |   
153 |   // 저장소 찾기
154 |   const index = config.repositories.findIndex(
155 |     repo => repo.owner === owner && repo.name === name
156 |   );
157 |   
158 |   if (index === -1) {
159 |     console.error(`저장소 "${owner}/${name}"을(를) 찾을 수 없습니다.`);
160 |     return false;
161 |   }
162 |   
163 |   // 저장소 제거
164 |   config.repositories.splice(index, 1);
165 |   
166 |   // 설정 파일 업데이트
167 |   await saveConfig(config);
168 |   
169 |   console.log(`저장소 "${owner}/${name}"이(가) 설정에서 제거되었습니다.`);
170 |   return true;
171 | }
172 | 
173 | /**
174 |  * 설정 파일 저장
175 |  */
176 | async function saveConfig(config: Config): Promise<void> {
177 |   try {
178 |     await fs.promises.writeFile(
179 |       CONFIG_PATH,
180 |       JSON.stringify(config, null, 2),
181 |       'utf-8'
182 |     );
183 |   } catch (error) {
184 |     console.error('설정 파일 저장 중 오류 발생:', error);
185 |     throw error;
186 |   }
187 | } 
```

src/lib/config.ts
```
1 | import { Repository, TimeRange } from '../types/github';
2 | import configData from '../config.json';
3 | 
4 | /**
5 |  * 설정 파일 인터페이스
6 |  */
7 | export interface Config {
8 |   repositories: Repository[];
9 |   defaultTimeRange: TimeRange;
10 |   refreshInterval: number;
11 | }
12 | 
13 | /**
14 |  * 설정 파일에서 저장소 목록 가져오기
15 |  */
16 | export function getRepositories(): Repository[] {
17 |   return configData.repositories;
18 | }
19 | 
20 | /**
21 |  * 설정 파일에서 기본 시간 범위 가져오기
22 |  */
23 | export function getDefaultTimeRange(): TimeRange {
24 |   return configData.defaultTimeRange;
25 | }
26 | 
27 | /**
28 |  * 설정 파일에서 새로고침 간격(밀리초) 가져오기
29 |  */
30 | export function getRefreshInterval(): number {
31 |   return configData.refreshInterval;
32 | }
33 | 
34 | /**
35 |  * 전체 설정 가져오기
36 |  */
37 | export function getConfig(): Config {
38 |   return configData as Config;
39 | } 
```

src/lib/metrics.ts
```
1 | import { PullRequest, Review, Commit } from '../api/github';
2 | import { MetricsResult, PRStateTransition, DeploymentEvent } from '../types/github';
3 | 
4 | /**
5 |  * PR 개수 계산
6 |  * 
7 |  * @description
8 |  * 선택한 기간 내에 생성된 PR의 총 개수를 계산합니다.
9 |  * 
10 |  * @formula
11 |  * PR Count = Count( PR 생성시간 ∈ [시작일, 종료일] )
12 |  * 
13 |  * @details
14 |  * 이 함수는 이미 시작일과 종료일로 필터링된 PR 배열을 받아 그 길이를 반환합니다.
15 |  * fetchPullRequests 함수에서 이미 날짜 필터링이 적용되어 있습니다.
16 |  * 
17 |  * @example
18 |  * 2023-01-01부터 2023-01-31까지 생성된 PR이 15개라면, 
19 |  * PR 개수는 15가 됩니다.
20 |  * 
21 |  * @param pullRequests 계산할 PR 목록
22 |  * @returns PR의 총 개수
23 |  */
24 | export function calculatePRCount(pullRequests: PullRequest[]): number {
25 |   return pullRequests.length;
26 | }
27 | 
28 | /**
29 |  * 코드 변경량(LOC: Lines of Code) 계산
30 |  * 
31 |  * @description
32 |  * PR에 포함된 모든 커밋에서 추가 및 삭제된 라인 수의 합을 계산합니다.
33 |  * 
34 |  * @formula
35 |  * LOC = Sum( lines_added + lines_removed ) for each commit in PRs
36 |  * 
37 |  * @details
38 |  * 각 커밋의 stats 속성에서 추가된 라인(additions)과 삭제된 라인(deletions)을 
39 |  * 합산하여 총 코드 변경량을 계산합니다.
40 |  * 이는 코드 작업량을 대략적으로 측정하는 지표로 활용됩니다.
41 |  * 
42 |  * @example
43 |  * 커밋 1: 추가 100줄, 삭제 50줄
44 |  * 커밋 2: 추가 30줄, 삭제 20줄
45 |  * LOC = (100 + 50) + (30 + 20) = 200
46 |  * 
47 |  * @param commits 계산할 커밋 목록
48 |  * @returns 총 코드 변경 라인 수
49 |  */
50 | export function calculateLinesOfCode(commits: Commit[]): number {
51 |   return commits.reduce((total, commit) => {
52 |     if (commit.stats) {
53 |       return total + commit.stats.additions + commit.stats.deletions;
54 |     }
55 |     return total;
56 |   }, 0);
57 | }
58 | 
59 | /**
60 |  * PR에 대한 첫 리뷰 시간 찾기
61 |  * 
62 |  * @description
63 |  * PR에 대한 첫 번째 리뷰가 작성된 시간을 찾습니다.
64 |  * 
65 |  * @details
66 |  * 리뷰 목록을 제출 시간순으로 정렬하고, 가장 빠른 시간의 리뷰를 찾습니다.
67 |  * 리뷰가 없는 경우 undefined를 반환합니다.
68 |  * 이 함수는 리뷰 응답 시간 계산에 활용됩니다.
69 |  * 
70 |  * @param reviews PR에 대한 리뷰 목록
71 |  * @returns 첫 번째 리뷰의 시간 (Date 객체) 또는 undefined (리뷰 없음)
72 |  */
73 | export function findFirstReviewTime(reviews: Review[]): Date | undefined {
74 |   if (reviews.length === 0) {
75 |     return undefined;
76 |   }
77 |   
78 |   // 제출 시간순으로 정렬
79 |   const sortedReviews = [...reviews].sort(
80 |     (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
81 |   );
82 |   
83 |   return new Date(sortedReviews[0].submitted_at);
84 | }
85 | 
86 | /**
87 |  * 평균 리뷰 응답 시간 계산 (밀리초)
88 |  * 
89 |  * @description
90 |  * PR 생성 시점부터 첫 번째 리뷰 코멘트까지 소요된 시간의 평균을 계산합니다.
91 |  * 
92 |  * @formula
93 |  * Review Response Time = Average( first_review_timestamp - PR_created_timestamp )
94 |  * 
95 |  * @details
96 |  * 모든 PR에 대해 생성 시간과 첫 리뷰 시간의 차이를 계산한 후, 평균을 구합니다.
97 |  * 리뷰가 없는 PR은 계산에서 제외됩니다.
98 |  * 이 지표는 팀의 리뷰 대응 속도를 측정하는 데 활용됩니다.
99 |  * 
100 |  * @example
101 |  * PR1: 생성 2023-01-01 10:00, 첫 리뷰 2023-01-03 14:00 => 52시간 
102 |  * PR2: 생성 2023-01-05 10:00, 첫 리뷰 2023-01-06 11:00 => 25시간
103 |  * 평균 리뷰 응답 시간 = (52 + 25) / 2 = 38.5시간
104 |  * 
105 |  * @param pullRequests 계산할 PR 목록
106 |  * @param prDetails PR별 상세 정보 (리뷰 등)
107 |  * @returns 평균 리뷰 응답 시간 (밀리초)
108 |  */
109 | export function calculateAverageReviewResponseTime(
110 |   pullRequests: PullRequest[], 
111 |   prDetails: Record<number, { reviews: Review[] }>
112 | ): number {
113 |   const responseTimes: number[] = [];
114 |   
115 |   pullRequests.forEach(pr => {
116 |     const details = prDetails[pr.number];
117 |     if (!details || !details.reviews || details.reviews.length === 0) {
118 |       return;
119 |     }
120 |     
121 |     const prCreatedTime = new Date(pr.created_at).getTime();
122 |     const firstReviewTime = findFirstReviewTime(details.reviews);
123 |     
124 |     if (firstReviewTime) {
125 |       const responseTime = firstReviewTime.getTime() - prCreatedTime;
126 |       responseTimes.push(responseTime);
127 |     }
128 |   });
129 |   
130 |   // 평균 계산
131 |   if (responseTimes.length === 0) {
132 |     return 0;
133 |   }
134 |   
135 |   return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
136 | }
137 | 
138 | /**
139 |  * 평균 PR 사이클 타임 계산 (밀리초)
140 |  * 
141 |  * @description
142 |  * PR이 생성된 시점부터 병합 또는 종료까지의 평균 시간을 계산합니다.
143 |  * 
144 |  * @formula
145 |  * Cycle Time = Average( PR_merged_timestamp - PR_created_timestamp )
146 |  * 
147 |  * @details
148 |  * 각 PR의 생성 시간과 병합 또는 종료 시간의 차이를 계산한 후, 평균을 구합니다.
149 |  * 병합된 PR은 병합 시간을 사용하고, 병합되지 않았지만 닫힌 PR은 종료 시간을 사용합니다.
150 |  * 아직 열려있는 PR은 계산에서 제외합니다.
151 |  * 이 지표는 코드 변경이 완료되는 데 걸리는 시간을 측정하여 개발 프로세스의 효율성을 평가합니다.
152 |  * 
153 |  * @example
154 |  * PR1: 생성 2023-01-01 10:00, 병합 2023-01-06 15:00 => 5일 5시간 = 125시간
155 |  * PR2: 생성 2023-01-05 10:00, 종료 2023-01-07 15:00 => 2일 5시간 = 53시간
156 |  * 평균 사이클 타임 = (125 + 53) / 2 = 89시간
157 |  * 
158 |  * @param pullRequests 계산할 PR 목록
159 |  * @returns 평균 PR 사이클 타임 (밀리초)
160 |  */
161 | export function calculateAveragePRCycleTime(pullRequests: PullRequest[]): number {
162 |   const cycleTimes: number[] = [];
163 |   
164 |   pullRequests.forEach(pr => {
165 |     const prCreatedTime = new Date(pr.created_at).getTime();
166 |     
167 |     // 병합된 PR의 경우 병합 시간, 그렇지 않으면 종료 시간 사용
168 |     const endTimeStr = pr.merged_at || pr.closed_at;
169 |     
170 |     // 아직 열려있는 PR은 건너뜀
171 |     if (!endTimeStr) {
172 |       return;
173 |     }
174 |     
175 |     const endTime = new Date(endTimeStr).getTime();
176 |     const cycleTime = endTime - prCreatedTime;
177 |     cycleTimes.push(cycleTime);
178 |   });
179 |   
180 |   // 평균 계산
181 |   if (cycleTimes.length === 0) {
182 |     return 0;
183 |   }
184 |   
185 |   return cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length;
186 | }
187 | 
188 | /**
189 |  * 배포 빈도 계산 (일별 평균 배포 횟수)
190 |  * 
191 |  * @description
192 |  * 선택한 기간 동안 발생한 일별 평균 배포 횟수를 계산합니다.
193 |  * 
194 |  * @formula
195 |  * Deployment Frequency = Count( 배포 이벤트 ) / 선택 기간(일)
196 |  * 
197 |  * @details
198 |  * 선택한 기간 내의 배포 이벤트 수를 카운트하고, 이를 해당 기간의 일수로 나눕니다.
199 |  * 이 지표는 얼마나 자주 배포가 이루어지는지를 나타내며, CI/CD 파이프라인의 효율성과 
200 |  * 팀의 소프트웨어 제공 능력을 평가하는 데 중요합니다.
201 |  * 
202 |  * @example
203 |  * 2023-01-01부터 2023-01-15까지(15일) 총 6번의 배포가 있었다면,
204 |  * 배포 빈도 = 6 / 15 = 0.4 (일별 평균 0.4회 배포)
205 |  * 이는 약 2.5일마다 한 번 배포한다는 의미입니다.
206 |  * 
207 |  * @param deployments 배포 이벤트 목록
208 |  * @param startDate 시작 날짜
209 |  * @param endDate 종료 날짜
210 |  * @returns 일별 평균 배포 횟수
211 |  */
212 | export function calculateDeploymentFrequency(
213 |   deployments: DeploymentEvent[],
214 |   startDate: Date,
215 |   endDate: Date
216 | ): number {
217 |   // 선택 기간 내의 배포 이벤트만 필터링
218 |   const deploymentsInRange = deployments.filter(deployment => {
219 |     const deploymentDate = new Date(deployment.created_at);
220 |     return deploymentDate >= startDate && deploymentDate <= endDate;
221 |   });
222 | 
223 |   // 배포 횟수 계산
224 |   const deploymentCount = deploymentsInRange.length;
225 |   
226 |   // 선택 기간 계산 (일 수)
227 |   const periodInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
228 |   
229 |   // 기간이 0이면 0 반환 (divide by zero 방지)
230 |   if (periodInDays === 0) {
231 |     return 0;
232 |   }
233 |   
234 |   // 배포 빈도 = 배포 횟수 / 선택 기간 (일 수)
235 |   return deploymentCount / periodInDays;
236 | }
237 | 
238 | /**
239 |  * 결함률 계산 (배포 후 문제가 발생한 비율)
240 |  * 
241 |  * @description
242 |  * 배포 후 문제(버그, 롤백 등)가 발생한 비율을 계산합니다.
243 |  * 
244 |  * @formula
245 |  * Change Failure Rate = (Count( 배포 후 문제 발생 ) / Count( 전체 배포 )) * 100
246 |  * 
247 |  * @details
248 |  * 전체 배포 중 문제가 발생한 배포의 비율을 백분율로 계산합니다.
249 |  * 이 지표는 배포된 변경사항의 품질과 안정성을 측정하며, 낮을수록 좋습니다.
250 |  * 배포 후 문제는 배포 이벤트의 has_issues 속성으로 결정됩니다.
251 |  * 
252 |  * @example
253 |  * 총 10번의 배포 중 2번에서 문제가 발생했다면,
254 |  * 결함률 = (2 / 10) * 100 = 20%
255 |  * 
256 |  * @param deployments 배포 이벤트 목록
257 |  * @returns 결함률 (백분율)
258 |  */
259 | export function calculateChangeFailureRate(
260 |   deployments: DeploymentEvent[]
261 | ): number {
262 |   if (deployments.length === 0) {
263 |     return 0;
264 |   }
265 | 
266 |   // 문제가 발생한 배포 수 카운트
267 |   const failedDeployments = deployments.filter(deployment => deployment.has_issues);
268 | 
269 |   // 결함률 계산 (백분율)
270 |   return (failedDeployments.length / deployments.length) * 100;
271 | }
272 | 
273 | /**
274 |  * 모든 메트릭 계산
275 |  * 
276 |  * @description
277 |  * PR 및 배포 데이터를 기반으로 모든 지표를 계산하여 종합적인 메트릭 결과를 생성합니다.
278 |  * 
279 |  * @details
280 |  * 이 함수는 다음 지표들을 계산합니다:
281 |  * 1. PR 개수: 선택 기간 내 생성된 PR의 총 개수
282 |  * 2. 코드 변경량: PR에 포함된 모든 커밋의 추가 및 삭제 라인 수 합계
283 |  * 3. 평균 리뷰 응답 시간: PR 생성부터 첫 리뷰까지의 평균 시간
284 |  * 4. 평균 PR 사이클 타임: PR 생성부터 병합/종료까지의 평균 시간
285 |  * 5. 배포 빈도: 일별 평균 배포 횟수
286 |  * 6. 결함률: 문제가 발생한 배포의 비율
287 |  * 
288 |  * @param pullRequests 계산할 PR 목록
289 |  * @param prDetails PR별 상세 정보 (리뷰, 커밋 등)
290 |  * @param deployments 배포 이벤트 목록 (선택적)
291 |  * @returns 모든 지표가 포함된 종합 메트릭 결과
292 |  */
293 | export function calculateMetrics(
294 |   pullRequests: PullRequest[],
295 |   prDetails: Record<number, { reviews: Review[], commits: Commit[] }>,
296 |   deployments: DeploymentEvent[] = []
297 | ): MetricsResult {
298 |   // PR 개수
299 |   const prCount = calculatePRCount(pullRequests);
300 |   
301 |   // 코드 변경량
302 |   let totalLinesOfCode = 0;
303 |   Object.values(prDetails).forEach(detail => {
304 |     totalLinesOfCode += calculateLinesOfCode(detail.commits);
305 |   });
306 |   
307 |   // 리뷰 응답 시간
308 |   const avgReviewResponseTime = calculateAverageReviewResponseTime(pullRequests, prDetails);
309 |   
310 |   // PR 사이클 타임
311 |   const avgPRCycleTime = calculateAveragePRCycleTime(pullRequests);
312 |   
313 |   // 시간 범위 결정 (첫 번째 PR과 마지막 PR 사이)
314 |   const startDate = new Date(Math.min(...pullRequests.map(pr => new Date(pr.created_at).getTime())));
315 |   const endDate = new Date();
316 | 
317 |   // 배포 빈도 (옵션)
318 |   const deploymentFrequency = calculateDeploymentFrequency(deployments, startDate, endDate);
319 |   
320 |   // 결함률 (옵션)
321 |   const changeFailureRate = calculateChangeFailureRate(deployments);
322 |   
323 |   return {
324 |     prCount,
325 |     totalLinesOfCode,
326 |     avgReviewResponseTime,
327 |     avgPRCycleTime,
328 |     deploymentFrequency,
329 |     changeFailureRate
330 |   };
331 | } 
```

src/lib/utils.ts
```
1 | import { clsx, type ClassValue } from "clsx"
2 | import { twMerge } from "tailwind-merge"
3 | 
4 | export function cn(...inputs: ClassValue[]) {
5 |   return twMerge(clsx(inputs))
6 | }
7 | 
8 | /**
9 |  * 밀리초를 읽기 쉬운 시간 포맷으로 변환합니다.
10 |  */
11 | export function formatDuration(ms: number): string {
12 |   const seconds = Math.floor(ms / 1000);
13 |   const minutes = Math.floor(seconds / 60);
14 |   const hours = Math.floor(minutes / 60);
15 |   const days = Math.floor(hours / 24);
16 | 
17 |   if (days > 0) {
18 |     return `${days}일 ${hours % 24}시간`;
19 |   } else if (hours > 0) {
20 |     return `${hours}시간 ${minutes % 60}분`;
21 |   } else if (minutes > 0) {
22 |     return `${minutes}분 ${seconds % 60}초`;
23 |   } else {
24 |     return `${seconds}초`;
25 |   }
26 | }
27 | 
28 | /**
29 |  * 숫자를 한국어 표기 형식으로 포맷팅합니다.
30 |  */
31 | export function formatNumber(num: number): string {
32 |   return num.toLocaleString('ko-KR');
33 | }
34 | 
35 | /**
36 |  * 배포 빈도를 사람이 읽기 쉬운 형식으로 변환합니다.
37 |  */
38 | export function formatDeploymentFrequency(frequency: number): string {
39 |   if (frequency >= 1) {
40 |     return `하루 평균 ${frequency.toFixed(1)}회`;
41 |   } else if (frequency >= 1/7) {
42 |     return `주 평균 ${(frequency * 7).toFixed(1)}회`;
43 |   } else if (frequency >= 1/30) {
44 |     return `월 평균 ${(frequency * 30).toFixed(1)}회`;
45 |   } else {
46 |     return `연 평균 ${(frequency * 365).toFixed(1)}회`;
47 |   }
48 | }
49 | 
50 | /**
51 |  * 결함률을 포맷팅합니다.
52 |  */
53 | export function formatChangeFailureRate(rate: number): string {
54 |   return `${rate.toFixed(1)}%`;
55 | }
56 | 
57 | /**
58 |  * 메트릭 결과를 포맷팅합니다.
59 |  * @param value 포맷팅할 값
60 |  * @param isPercentage 백분율 값인지 여부
61 |  * @returns 포맷팅된 문자열 또는 '-' (값이 없는 경우)
62 |  */
63 | export function formatMetricResult(value: number | null, isPercentage: boolean = false): string {
64 |   if (value === null) return '-';
65 |   
66 |   if (isPercentage) {
67 |     // 백분율 포맷팅 (소수점 1자리까지)
68 |     return `${(value * 100).toFixed(1)}%`;
69 |   } else if (value >= 1000) {
70 |     // 1000 이상인 경우 천 단위 구분자 사용
71 |     return formatNumber(Number(value.toFixed(1)));
72 |   } else if (value < 0.01) {
73 |     // 매우 작은 값은 지수 표기법 대신 0으로 표시
74 |     return '0';
75 |   } else {
76 |     // 일반적인 경우 소수점 2자리까지
77 |     return value.toFixed(2);
78 |   }
79 | }
```

src/test/add-repo.ts
```
1 | import dotenv from 'dotenv';
2 | import { addRepository } from '../lib/config-manager';
3 | 
4 | // .env 파일에서 환경 변수 로드
5 | dotenv.config();
6 | 
7 | // GitHub 토큰 가져오기
8 | const token = process.env.VITE_GITHUB_TOKEN || '';
9 | 
10 | if (!token) {
11 |   console.error("GitHub 토큰이 설정되지 않았습니다. .env 파일을 확인해주세요.");
12 |   process.exit(1);
13 | }
14 | 
15 | async function addRepoToConfig() {
16 |   // 저장소 이름
17 |   const repoName = 'd3-hierarchy';
18 |   
19 |   console.log(`저장소 "${repoName}" 추가 중...`);
20 |   const result = await addRepository(repoName, token);
21 |   
22 |   if (result) {
23 |     console.log(`성공! 저장소가 추가되었습니다:`);
24 |     console.log(`- 이름: ${result.name}`);
25 |     console.log(`- 소유자: ${result.owner}`);
26 |     console.log(`- 전체 이름: ${result.owner}/${result.name}`);
27 |     console.log(`- 설명: ${result.description}`);
28 |   } else {
29 |     console.error(`저장소 "${repoName}" 추가 실패`);
30 |   }
31 | }
32 | 
33 | // 실행
34 | addRepoToConfig().catch(error => {
35 |   console.error('오류 발생:', error);
36 | }); 
```

src/test/config-manager-test.ts
```
1 | import dotenv from 'dotenv';
2 | import { addRepository, removeRepository, getRepositories } from '../lib/config-manager';
3 | 
4 | // .env 파일에서 환경 변수 로드
5 | dotenv.config();
6 | 
7 | // GitHub 토큰 가져오기
8 | const token = process.env.VITE_GITHUB_TOKEN || '';
9 | 
10 | if (!token) {
11 |   console.error("GitHub 토큰이 설정되지 않았습니다. .env 파일을 확인해주세요.");
12 |   process.exit(1);
13 | }
14 | 
15 | async function testAddingRepositoryByName() {
16 |   console.log("===== 저장소 이름만으로 저장소 추가 테스트 =====");
17 |   
18 |   // 처음 저장소 목록 출력
19 |   const initialRepos = getRepositories();
20 |   console.log("\n현재 설정된 저장소 목록:");
21 |   initialRepos.forEach((repo, index) => {
22 |     console.log(`${index + 1}. ${repo.owner}/${repo.name} - ${repo.description}`);
23 |   });
24 |   
25 |   // 테스트할 저장소 이름
26 |   const testRepoName = 'd3-hierarchy';
27 |   
28 |   console.log(`\n저장소 이름 "${testRepoName}"만으로 추가 시도 중...`);
29 |   const addedRepo = await addRepository(testRepoName, token);
30 |   
31 |   if (addedRepo) {
32 |     // 추가된 후 저장소 목록 출력
33 |     const updatedRepos = getRepositories();
34 |     console.log("\n업데이트된 저장소 목록:");
35 |     updatedRepos.forEach((repo, index) => {
36 |       console.log(`${index + 1}. ${repo.owner}/${repo.name} - ${repo.description}`);
37 |     });
38 |     
39 |     // 테스트 목적으로 추가한 저장소 제거
40 |     console.log(`\n테스트를 위해 추가한 저장소 "${addedRepo.owner}/${addedRepo.name}" 제거 중...`);
41 |     const removed = await removeRepository(addedRepo.owner, addedRepo.name);
42 |     
43 |     if (removed) {
44 |       console.log("저장소가 성공적으로 제거되었습니다.");
45 |     } else {
46 |       console.error("저장소 제거 실패");
47 |     }
48 |   } else {
49 |     console.error("저장소 추가 실패");
50 |   }
51 |   
52 |   // 최종 저장소 목록 출력
53 |   const finalRepos = getRepositories();
54 |   console.log("\n최종 저장소 목록:");
55 |   finalRepos.forEach((repo, index) => {
56 |     console.log(`${index + 1}. ${repo.owner}/${repo.name} - ${repo.description}`);
57 |   });
58 | }
59 | 
60 | // 테스트 실행
61 | async function runTests() {
62 |   console.log("저장소 관리 모듈 테스트 시작\n");
63 |   
64 |   try {
65 |     await testAddingRepositoryByName();
66 |     console.log("\n테스트 완료!");
67 |   } catch (error) {
68 |     console.error("테스트 중 오류 발생:", error);
69 |   }
70 | }
71 | 
72 | runTests(); 
```

src/test/deployment.test.ts
```
1 | import { describe, it, expect, vi } from 'vitest';
2 | import { fetchDeployments, hasDeploymentIssues } from '../api/github';
3 | import { DeploymentEvent } from '../types/github';
4 | 
5 | // Octokit 목킹
6 | vi.mock('@octokit/rest', () => {
7 |   return {
8 |     Octokit: vi.fn().mockImplementation(() => ({
9 |       repos: {
10 |         listDeployments: vi.fn().mockResolvedValue({
11 |           data: [
12 |             {
13 |               id: 1,
14 |               environment: 'production',
15 |               created_at: '2023-06-12T12:00:00Z',
16 |               creator: { login: 'user1' }
17 |             },
18 |             {
19 |               id: 2,
20 |               environment: 'staging',
21 |               created_at: '2023-06-14T14:00:00Z',
22 |               creator: { login: 'user2' }
23 |             }
24 |           ]
25 |         }),
26 |         listDeploymentStatuses: vi.fn().mockImplementation(({ deployment_id }) => {
27 |           // deployment_id에.따라 다른 상태 반환
28 |           if (deployment_id === 1) {
29 |             return Promise.resolve({
30 |               data: [
31 |                 {
32 |                   state: 'success',
33 |                   created_at: '2023-06-12T12:05:00Z'
34 |                 }
35 |               ]
36 |             });
37 |           } else {
38 |             return Promise.resolve({
39 |               data: [
40 |                 {
41 |                   state: 'failure',
42 |                   created_at: '2023-06-14T14:05:00Z'
43 |                 }
44 |               ]
45 |             });
46 |           }
47 |         })
48 |       }
49 |     }))
50 |   };
51 | });
52 | 
53 | describe('배포 관련 기능 테스트', () => {
54 |   describe('fetchDeployments', () => {
55 |     it('GitHub API에서 배포 데이터를 가져와 DeploymentEvent 형식으로 변환해야 함', async () => {
56 |       const deployments = await fetchDeployments('test', 'repo');
57 |       
58 |       expect(deployments).toHaveLength(2);
59 |       expect(deployments[0].id).toBe(1);
60 |       expect(deployments[0].environment).toBe('production');
61 |       expect(deployments[0].status).toBe('success');
62 |       expect(deployments[0].has_issues).toBe(false);
63 |       
64 |       expect(deployments[1].id).toBe(2);
65 |       expect(deployments[1].status).toBe('failure');
66 |       expect(deployments[1].has_issues).toBe(true);
67 |     });
68 |   });
69 |   
70 |   describe('hasDeploymentIssues', () => {
71 |     it('성공 상태일 때 false를 반환해야 함', () => {
72 |       expect(hasDeploymentIssues('success')).toBe(false);
73 |     });
74 |     
75 |     it('실패 상태일 때 true를 반환해야 함', () => {
76 |       expect(hasDeploymentIssues('failure')).toBe(true);
77 |       expect(hasDeploymentIssues('error')).toBe(true);
78 |     });
79 |   });
80 | }); 
```

src/test/github.test.ts
```
1 | import { describe, expect, it, vi, beforeEach } from 'vitest';
2 | import { 
3 |   fetchPullRequests, 
4 |   fetchPullRequestReviews, 
5 |   fetchPullRequestCommits, 
6 |   fetchCommitDetails 
7 | } from '../api/github';
8 | 
9 | // Octokit 모듈을 모킹
10 | vi.mock('@octokit/rest', () => {
11 |   return {
12 |     Octokit: vi.fn().mockImplementation(() => ({
13 |       pulls: {
14 |         list: vi.fn().mockResolvedValue({
15 |           data: [
16 |             {
17 |               id: 1,
18 |               number: 101,
19 |               title: '테스트 PR',
20 |               user: { login: 'testuser' },
21 |               created_at: '2023-06-15T10:00:00Z',
22 |               merged_at: '2023-06-16T15:30:00Z',
23 |               closed_at: '2023-06-16T15:30:00Z',
24 |               state: 'closed',
25 |               html_url: 'https://github.com/test/repo/pull/101'
26 |             },
27 |             {
28 |               id: 2,
29 |               number: 102,
30 |               title: '오래된 PR',
31 |               user: { login: 'olduser' },
32 |               created_at: '2022-01-01T10:00:00Z',
33 |               merged_at: null,
34 |               closed_at: null,
35 |               state: 'open',
36 |               html_url: 'https://github.com/test/repo/pull/102'
37 |             }
38 |           ]
39 |         }),
40 |         listReviews: vi.fn().mockResolvedValue({
41 |           data: [
42 |             {
43 |               id: 1001,
44 |               user: { login: 'reviewer1' },
45 |               state: 'APPROVED',
46 |               submitted_at: '2023-06-16T12:00:00Z',
47 |               body: '좋은 PR입니다!'
48 |             }
49 |           ]
50 |         }),
51 |         listCommits: vi.fn().mockResolvedValue({
52 |           data: [
53 |             {
54 |               sha: 'abc123',
55 |               commit: {
56 |                 message: '테스트 커밋',
57 |                 author: {
58 |                   name: 'Test User',
59 |                   date: '2023-06-15T11:00:00Z'
60 |                 }
61 |               }
62 |             }
63 |           ]
64 |         }),
65 |         listComments: vi.fn().mockResolvedValue({
66 |           data: [
67 |             {
68 |               id: 2001,
69 |               user: { login: 'commenter1' },
70 |               created_at: '2023-06-16T11:30:00Z',
71 |               body: '코멘트 테스트'
72 |             }
73 |           ]
74 |         })
75 |       },
76 |       repos: {
77 |         getCommit: vi.fn().mockResolvedValue({
78 |           data: {
79 |             sha: 'abc123',
80 |             commit: {
81 |               message: '테스트 커밋',
82 |               author: {
83 |                 name: 'Test User',
84 |                 date: '2023-06-15T11:00:00Z'
85 |               }
86 |             },
87 |             stats: {
88 |               additions: 10,
89 |               deletions: 5,
90 |               total: 15
91 |             }
92 |           }
93 |         })
94 |       }
95 |     }))
96 |   };
97 | });
98 | 
99 | describe('Github API 모듈', () => {
100 |   // 각 테스트 전에 모킹된 함수 초기화
101 |   beforeEach(() => {
102 |     vi.clearAllMocks();
103 |   });
104 | 
105 |   describe('fetchPullRequests', () => {
106 |     it('지정된 기간의 PR을 필터링하여 반환해야 함', async () => {
107 |       const result = await fetchPullRequests('test', 'repo', '2023-01-01', '2023-12-31');
108 |       
109 |       // 2023년 내의 PR만 필터링되어야 함
110 |       expect(result.length).toBe(1);
111 |       expect(result[0].id).toBe(1);
112 |       expect(result[0].title).toBe('테스트 PR');
113 |     });
114 |   });
115 | 
116 |   describe('fetchPullRequestReviews', () => {
117 |     it('PR에 대한 리뷰를 가져와야 함', async () => {
118 |       const reviews = await fetchPullRequestReviews('test', 'repo', 101);
119 |       
120 |       expect(reviews.length).toBe(1);
121 |       expect(reviews[0].id).toBe(1001);
122 |       expect(reviews[0].state).toBe('APPROVED');
123 |     });
124 |   });
125 | 
126 |   describe('fetchPullRequestCommits', () => {
127 |     it('PR에 포함된 커밋을 가져와야 함', async () => {
128 |       const commits = await fetchPullRequestCommits('test', 'repo', 101);
129 |       
130 |       expect(commits.length).toBe(1);
131 |       expect(commits[0].sha).toBe('abc123');
132 |       expect(commits[0].commit.message).toBe('테스트 커밋');
133 |     });
134 |   });
135 | 
136 |   describe('fetchCommitDetails', () => {
137 |     it('커밋의 상세 정보를 가져와야 함', async () => {
138 |       const commit = await fetchCommitDetails('test', 'repo', 'abc123');
139 |       
140 |       expect(commit.sha).toBe('abc123');
141 |       expect(commit.stats).toBeDefined();
142 |       expect(commit.stats?.additions).toBe(10);
143 |       expect(commit.stats?.deletions).toBe(5);
144 |     });
145 |   });
146 | }); 
```

src/test/metrics.test.ts
```
1 | import { describe, it, expect } from 'vitest';
2 | import { 
3 |   calculatePRCount, 
4 |   calculateLinesOfCode, 
5 |   findFirstReviewTime, 
6 |   calculateAverageReviewResponseTime, 
7 |   calculateAveragePRCycleTime,
8 |   calculateDeploymentFrequency,
9 |   calculateChangeFailureRate,
10 |   calculateMetrics
11 | } from '../lib/metrics';
12 | import { PullRequest, Review, Commit } from '../api/github';
13 | import { DeploymentEvent } from '../types/github';
14 | 
15 | // 테스트용 목 데이터
16 | const mockPullRequests: PullRequest[] = [
17 |   {
18 |     id: 1,
19 |     number: 101,
20 |     title: 'PR 1',
21 |     user: { login: 'user1' },
22 |     created_at: '2023-06-10T10:00:00Z',
23 |     merged_at: '2023-06-15T15:00:00Z',
24 |     closed_at: '2023-06-15T15:00:00Z',
25 |     state: 'closed',
26 |     html_url: 'https://github.com/test/repo/pull/101'
27 |   },
28 |   {
29 |     id: 2,
30 |     number: 102,
31 |     title: 'PR 2',
32 |     user: { login: 'user2' },
33 |     created_at: '2023-06-12T10:00:00Z',
34 |     merged_at: null,
35 |     closed_at: '2023-06-14T15:00:00Z',
36 |     state: 'closed',
37 |     html_url: 'https://github.com/test/repo/pull/102'
38 |   },
39 |   {
40 |     id: 3,
41 |     number: 103,
42 |     title: 'PR 3',
43 |     user: { login: 'user3' },
44 |     created_at: '2023-06-14T10:00:00Z',
45 |     merged_at: null,
46 |     closed_at: null,
47 |     state: 'open',
48 |     html_url: 'https://github.com/test/repo/pull/103'
49 |   }
50 | ];
51 | 
52 | const mockReviews: Record<number, Review[]> = {
53 |   101: [
54 |     {
55 |       id: 1001,
56 |       user: { login: 'reviewer1' },
57 |       state: 'APPROVED',
58 |       submitted_at: '2023-06-12T14:00:00Z',
59 |       body: '좋은 PR입니다!'
60 |     },
61 |     {
62 |       id: 1002,
63 |       user: { login: 'reviewer2' },
64 |       state: 'COMMENTED',
65 |       submitted_at: '2023-06-13T10:00:00Z',
66 |       body: '코멘트입니다'
67 |     }
68 |   ],
69 |   102: [
70 |     {
71 |       id: 1003,
72 |       user: { login: 'reviewer1' },
73 |       state: 'CHANGES_REQUESTED',
74 |       submitted_at: '2023-06-13T11:00:00Z',
75 |       body: '수정이 필요합니다'
76 |     }
77 |   ],
78 |   103: []
79 | };
80 | 
81 | const mockCommits: Record<number, Commit[]> = {
82 |   101: [
83 |     {
84 |       sha: 'abc123',
85 |       commit: {
86 |         message: '기능 추가',
87 |         author: {
88 |           name: 'User 1',
89 |           date: '2023-06-10T11:00:00Z'
90 |         }
91 |       },
92 |       stats: {
93 |         additions: 100,
94 |         deletions: 50,
95 |         total: 150
96 |       }
97 |     }
98 |   ],
99 |   102: [
100 |     {
101 |       sha: 'def456',
102 |       commit: {
103 |         message: '버그 수정',
104 |         author: {
105 |           name: 'User 2',
106 |           date: '2023-06-12T11:00:00Z'
107 |         }
108 |       },
109 |       stats: {
110 |         additions: 30,
111 |         deletions: 20,
112 |         total: 50
113 |       }
114 |     },
115 |     {
116 |       sha: 'ghi789',
117 |       commit: {
118 |         message: '리팩토링',
119 |         author: {
120 |           name: 'User 2',
121 |           date: '2023-06-13T11:00:00Z'
122 |         }
123 |       },
124 |       stats: {
125 |         additions: 40,
126 |         deletions: 40,
127 |         total: 80
128 |       }
129 |     }
130 |   ],
131 |   103: [
132 |     {
133 |       sha: 'jkl012',
134 |       commit: {
135 |         message: '신규 기능',
136 |         author: {
137 |           name: 'User 3',
138 |           date: '2023-06-14T11:00:00Z'
139 |         }
140 |       },
141 |       stats: {
142 |         additions: 200,
143 |         deletions: 0,
144 |         total: 200
145 |       }
146 |     }
147 |   ]
148 | };
149 | 
150 | const mockPrDetails: Record<number, { reviews: Review[], commits: Commit[] }> = {
151 |   101: { reviews: mockReviews[101], commits: mockCommits[101] },
152 |   102: { reviews: mockReviews[102], commits: mockCommits[102] },
153 |   103: { reviews: mockReviews[103], commits: mockCommits[103] }
154 | };
155 | 
156 | // 테스트용 배포 데이터
157 | const mockDeployments: DeploymentEvent[] = [
158 |   {
159 |     id: 1,
160 |     repository: 'test/repo',
161 |     environment: 'production',
162 |     created_at: '2023-06-12T12:00:00Z',
163 |     completed_at: '2023-06-12T12:05:00Z',
164 |     status: 'success',
165 |     has_issues: false,
166 |     created_by: 'user1'
167 |   },
168 |   {
169 |     id: 2,
170 |     repository: 'test/repo',
171 |     environment: 'production',
172 |     created_at: '2023-06-14T15:00:00Z',
173 |     completed_at: '2023-06-14T15:10:00Z',
174 |     status: 'failure',
175 |     has_issues: true,
176 |     created_by: 'user2'
177 |   },
178 |   {
179 |     id: 3,
180 |     repository: 'test/repo',
181 |     environment: 'staging',
182 |     created_at: '2023-06-16T10:00:00Z',
183 |     completed_at: '2023-06-16T10:03:00Z',
184 |     status: 'success',
185 |     has_issues: false,
186 |     created_by: 'user3'
187 |   }
188 | ];
189 | 
190 | describe('메트릭 계산 함수 테스트', () => {
191 |   describe('calculatePRCount', () => {
192 |     it('PR 개수를 정확하게 계산해야 함', () => {
193 |       const count = calculatePRCount(mockPullRequests);
194 |       expect(count).toBe(3);
195 |     });
196 |   });
197 | 
198 |   describe('calculateLinesOfCode', () => {
199 |     it('커밋의 코드 변경량을 정확하게 계산해야 함', () => {
200 |       const loc1 = calculateLinesOfCode(mockCommits[101]);
201 |       expect(loc1).toBe(150); // 100 + 50
202 | 
203 |       const loc2 = calculateLinesOfCode(mockCommits[102]);
204 |       expect(loc2).toBe(130); // 30 + 20 + 40 + 40
205 |     });
206 |   });
207 | 
208 |   describe('findFirstReviewTime', () => {
209 |     it('첫 번째 리뷰 시간을 정확하게 찾아야 함', () => {
210 |       const firstReviewTime = findFirstReviewTime(mockReviews[101]);
211 |       expect(firstReviewTime).toEqual(new Date('2023-06-12T14:00:00Z'));
212 |     });
213 | 
214 |     it('리뷰가 없을 경우 undefined를 반환해야 함', () => {
215 |       const firstReviewTime = findFirstReviewTime(mockReviews[103]);
216 |       expect(firstReviewTime).toBeUndefined();
217 |     });
218 |   });
219 | 
220 |   describe('calculateAverageReviewResponseTime', () => {
221 |     it('평균 리뷰 응답 시간을 정확하게 계산해야 함', () => {
222 |       const avgTime = calculateAverageReviewResponseTime(
223 |         mockPullRequests, 
224 |         { 101: { reviews: mockReviews[101] }, 102: { reviews: mockReviews[102] } }
225 |       );
226 |       
227 |       // PR 101: 2023-06-12T14:00:00Z - 2023-06-10T10:00:00Z = 2일 4시간 = 52시간 = 187,200,000 밀리초
228 |       // PR 102: 2023-06-13T11:00:00Z - 2023-06-12T10:00:00Z = 1일 1시간 = 25시간 = 90,000,000 밀리초
229 |       // 평균: (187,200,000 + 90,000,000) / 2 = 138,600,000 밀리초
230 |       
231 |       // 단순화된 계산 (하루를 정확히 86,400,000 밀리초로 계산)
232 |       const pr1ResponseTime = new Date('2023-06-12T14:00:00Z').getTime() - new Date('2023-06-10T10:00:00Z').getTime();
233 |       const pr2ResponseTime = new Date('2023-06-13T11:00:00Z').getTime() - new Date('2023-06-12T10:00:00Z').getTime();
234 |       const expectedAvgTime = (pr1ResponseTime + pr2ResponseTime) / 2;
235 |       
236 |       expect(avgTime).toBeCloseTo(expectedAvgTime, -4); // 소수점 4자리 오차 허용
237 |     });
238 |   });
239 | 
240 |   describe('calculateAveragePRCycleTime', () => {
241 |     it('평균 PR 사이클 타임을 정확하게 계산해야 함', () => {
242 |       const avgCycleTime = calculateAveragePRCycleTime(mockPullRequests);
243 |       
244 |       // PR 101: 2023-06-15T15:00:00Z - 2023-06-10T10:00:00Z = 5일 5시간 = 125시간
245 |       // PR 102: 2023-06-14T15:00:00Z - 2023-06-12T10:00:00Z = 2일 5시간 = 53시간
246 |       // PR 103: 아직 열려있어 계산에서 제외
247 |       // 평균: (125시간 + 53시간) / 2 = 89시간
248 |       
249 |       // 단순화된 계산 (하루를 정확히 86,400,000 밀리초로 계산)
250 |       const pr1CycleTime = new Date('2023-06-15T15:00:00Z').getTime() - new Date('2023-06-10T10:00:00Z').getTime();
251 |       const pr2CycleTime = new Date('2023-06-14T15:00:00Z').getTime() - new Date('2023-06-12T10:00:00Z').getTime();
252 |       const expectedAvgCycleTime = (pr1CycleTime + pr2CycleTime) / 2;
253 |       
254 |       expect(avgCycleTime).toBeCloseTo(expectedAvgCycleTime, -4); // 소수점 4자리 오차 허용
255 |     });
256 |   });
257 | 
258 |   describe('calculateDeploymentFrequency', () => {
259 |     it('선택 기간 내 배포 빈도를 정확하게 계산해야 함', () => {
260 |       const startDate = new Date('2023-06-10T00:00:00Z');
261 |       const endDate = new Date('2023-06-15T00:00:00Z');
262 |       
263 |       const frequency = calculateDeploymentFrequency(mockDeployments, startDate, endDate);
264 |       
265 |       // 2023-06-10 ~ 2023-06-15는 5일 기간
266 |       // 이 기간 내에 2개의 배포가 있음 => 2/5 = 0.4 (일당 배포 횟수)
267 |       expect(frequency).toBeCloseTo(0.4, 2);
268 |     });
269 |     
270 |     it('기간 외 배포는 계산하지 않아야 함', () => {
271 |       const startDate = new Date('2023-06-15T00:00:00Z');
272 |       const endDate = new Date('2023-06-17T00:00:00Z');
273 |       
274 |       const frequency = calculateDeploymentFrequency(mockDeployments, startDate, endDate);
275 |       
276 |       // 2023-06-15 ~ 2023-06-17는 2일 기간
277 |       // 이 기간 내에 1개의 배포가 있음 => 1/2 = 0.5 (일당 배포 횟수)
278 |       expect(frequency).toBeCloseTo(0.5, 2);
279 |     });
280 |     
281 |     it('기간이 0일 경우 0을 반환해야 함', () => {
282 |       const sameDate = new Date('2023-06-15T00:00:00Z');
283 |       
284 |       const frequency = calculateDeploymentFrequency(mockDeployments, sameDate, sameDate);
285 |       
286 |       expect(frequency).toBe(0);
287 |     });
288 |   });
289 |   
290 |   describe('calculateChangeFailureRate', () => {
291 |     it('결함률을 정확하게 계산해야 함', () => {
292 |       const failureRate = calculateChangeFailureRate(mockDeployments);
293 |       
294 |       // 전체 3개 배포 중 1개에 문제 발생 => 33.33%
295 |       expect(failureRate).toBeCloseTo(33.33, 1);
296 |     });
297 |     
298 |     it('배포가 없을 경우 0을 반환해야 함', () => {
299 |       const failureRate = calculateChangeFailureRate([]);
300 |       
301 |       expect(failureRate).toBe(0);
302 |     });
303 |   });
304 | 
305 |   describe('calculateMetrics', () => {
306 |     it('모든 메트릭을 정확하게 계산해야 함', () => {
307 |       const metrics = calculateMetrics(mockPullRequests, mockPrDetails, mockDeployments);
308 |       
309 |       // PR 개수
310 |       expect(metrics.prCount).toBe(3);
311 |       
312 |       // 코드 변경량: 150 + 130 + 200 = 480
313 |       expect(metrics.totalLinesOfCode).toBe(480);
314 |       
315 |       // 배포 빈도 및 결함률도 계산되어야 함
316 |       expect(metrics.deploymentFrequency).toBeDefined();
317 |       expect(metrics.changeFailureRate).toBeCloseTo(33.33, 1);
318 |       
319 |       // 리뷰 응답 시간 및 사이클 타임은 이전 테스트와 동일
320 |       expect(metrics.avgReviewResponseTime).toBeGreaterThan(0);
321 |       expect(metrics.avgPRCycleTime).toBeGreaterThan(0);
322 |     });
323 |     
324 |     it('배포 데이터가 없을 경우에도 다른 메트릭이 계산되어야 함', () => {
325 |       const metrics = calculateMetrics(mockPullRequests, mockPrDetails);
326 |       
327 |       expect(metrics.prCount).toBe(3);
328 |       expect(metrics.totalLinesOfCode).toBe(480);
329 |       expect(metrics.deploymentFrequency).toBe(0);
330 |       expect(metrics.changeFailureRate).toBe(0);
331 |     });
332 |   });
333 | }); 
```

src/test/repo-search-test.ts
```
1 | import { Octokit } from "@octokit/rest";
2 | import dotenv from 'dotenv';
3 | 
4 | // .env 파일에서 환경 변수 로드
5 | dotenv.config();
6 | 
7 | // GitHub 토큰 가져오기
8 | const token = process.env.VITE_GITHUB_TOKEN || '';
9 | 
10 | interface RepoInfo {
11 |   name: string;
12 |   owner: string;
13 |   fullName: string;
14 |   description: string;
15 |   isPrivate: boolean;
16 |   url: string;
17 | }
18 | 
19 | async function findRepositoryOwner(repoName: string): Promise<RepoInfo | null> {
20 |   if (!token) {
21 |     console.error("GitHub 토큰이 설정되지 않았습니다. .env 파일을 확인해주세요.");
22 |     return null;
23 |   }
24 |   
25 |   const octokit = new Octokit({ auth: token });
26 |   
27 |   try {
28 |     console.log(`저장소 "${repoName}" 검색 중...`);
29 |     
30 |     // 1. 저장소 이름으로 검색
31 |     const searchResult = await octokit.search.repos({
32 |       q: `${repoName} in:name`,
33 |       sort: 'stars',
34 |       order: 'desc',
35 |       per_page: 10
36 |     });
37 |     
38 |     console.log(`검색 결과: ${searchResult.data.total_count}개 저장소 발견`);
39 |     
40 |     if (searchResult.data.total_count === 0) {
41 |       console.log("저장소를 찾을 수 없습니다.");
42 |       return null;
43 |     }
44 |     
45 |     // 검색 결과에서 정확히 일치하는 이름 찾기
46 |     const exactMatch = searchResult.data.items.find(
47 |       repo => repo.name.toLowerCase() === repoName.toLowerCase()
48 |     );
49 |     
50 |     if (!exactMatch || !exactMatch.owner) {
51 |       console.log(`정확히 "${repoName}"과 일치하는 저장소가 없습니다. 유사한 저장소 목록:`);
52 |       searchResult.data.items.slice(0, 5).forEach((repo, index) => {
53 |         console.log(`${index + 1}. ${repo.full_name} - ${repo.html_url}`);
54 |       });
55 |       return null;
56 |     }
57 |     
58 |     // 2. 정확히 일치하는 저장소의 정보 추출
59 |     const repoInfo: RepoInfo = {
60 |       name: exactMatch.name,
61 |       owner: exactMatch.owner.login,
62 |       fullName: exactMatch.full_name,
63 |       description: exactMatch.description || '',
64 |       isPrivate: exactMatch.private,
65 |       url: exactMatch.html_url
66 |     };
67 |     
68 |     console.log("\n저장소 정보:");
69 |     console.log(`- 이름: ${repoInfo.name}`);
70 |     console.log(`- 소유자: ${repoInfo.owner}`);
71 |     console.log(`- 전체 이름: ${repoInfo.fullName}`);
72 |     console.log(`- 설명: ${repoInfo.description}`);
73 |     console.log(`- 유형: ${repoInfo.isPrivate ? '비공개' : '공개'}`);
74 |     console.log(`- URL: ${repoInfo.url}`);
75 |     
76 |     // 3. owner/repo 형식으로 추가 정보 가져오기
77 |     console.log("\n저장소 세부 정보 및 콘텐츠 접근 테스트:");
78 |     
79 |     // 저장소 세부 정보 가져오기
80 |     const repoDetails = await octokit.repos.get({
81 |       owner: repoInfo.owner,
82 |       repo: repoInfo.name
83 |     });
84 |     
85 |     console.log(`- 기본 브랜치: ${repoDetails.data.default_branch}`);
86 |     console.log(`- 스타 수: ${repoDetails.data.stargazers_count}`);
87 |     console.log(`- 포크 수: ${repoDetails.data.forks_count}`);
88 |     console.log(`- 생성 일자: ${new Date(repoDetails.data.created_at).toLocaleString()}`);
89 |     
90 |     // 최근 커밋 가져오기
91 |     const commits = await octokit.repos.listCommits({
92 |       owner: repoInfo.owner,
93 |       repo: repoInfo.name,
94 |       per_page: 3
95 |     });
96 |     
97 |     console.log("\n최근 커밋:");
98 |     commits.data.forEach((commit, index) => {
99 |       console.log(`${index + 1}. ${commit.commit.message.split('\n')[0]} - ${commit.commit.author?.name || 'Unknown'}`);
100 |     });
101 |     
102 |     return repoInfo;
103 |     
104 |   } catch (error: any) {
105 |     console.error("오류 발생:", error.message);
106 |     if (error.response) {
107 |       console.error(`상태 코드: ${error.response.status}`);
108 |       console.error(`응답 메시지: ${JSON.stringify(error.response.data)}`);
109 |     }
110 |     return null;
111 |   }
112 | }
113 | 
114 | // 함수 실행
115 | async function runTest() {
116 |   console.log("GitHub 저장소 이름만으로 검색 테스트 시작\n");
117 |   
118 |   // 사용자가 요청한 저장소 이름으로 테스트
119 |   const repoName = 'd3-hierarchy';
120 |   const repoInfo = await findRepositoryOwner(repoName);
121 |   
122 |   if (repoInfo) {
123 |     console.log(`\n성공! "${repoName}" 저장소의 소유자는 "${repoInfo.owner}"입니다.`);
124 |     
125 |     // config.json 형식에 맞게 정보 출력
126 |     const configEntry = {
127 |       name: repoInfo.name,
128 |       owner: repoInfo.owner,
129 |       description: repoInfo.description
130 |     };
131 |     
132 |     console.log("\nconfig.json에 추가할 수 있는 형식:");
133 |     console.log(JSON.stringify(configEntry, null, 2));
134 |   } else {
135 |     console.log(`\n실패: "${repoName}" 저장소 정보를 가져올 수 없습니다.`);
136 |   }
137 |   
138 |   console.log("\n테스트 완료!");
139 | }
140 | 
141 | runTest(); 
```

src/test/setup.ts
```
1 | import '@testing-library/jest-dom' 
```

src/types/better-sqlite3.d.ts
```
1 | declare module 'better-sqlite3' {
2 |   interface Database {
3 |     prepare(sql: string): Statement;
4 |     close(): void;
5 |   }
6 | 
7 |   interface Statement {
8 |     run(...params: any[]): any;
9 |     all(...params: any[]): any[];
10 |   }
11 | 
12 |   export default function(path: string): Database;
13 | } 
```

src/types/github.ts
```
1 | /**
2 |  * Repository 인터페이스 - GitHub 저장소 정보를 나타냅니다.
3 |  */
4 | export interface Repository {
5 |   name: string;
6 |   owner: string;
7 |   description?: string;
8 | }
9 | 
10 | /**
11 |  * TimeRange 인터페이스 - 분석을 위한 시간 범위를 나타냅니다.
12 |  */
13 | export interface TimeRange {
14 |   since: string; // 'YYYY-MM-DD' 형식
15 |   until: string; // 'YYYY-MM-DD' 형식
16 | }
17 | 
18 | /**
19 |  * MetricsResult 인터페이스 - PR 관련 메트릭 계산 결과를 저장합니다.
20 |  */
21 | export interface MetricsResult {
22 |   prCount: number;                // PR 개수
23 |   totalLinesOfCode: number;       // 전체 코드 변경량 (추가 + 삭제)
24 |   avgReviewResponseTime: number;  // 평균 리뷰 응답 시간 (밀리초)
25 |   avgPRCycleTime: number;         // 평균 PR 사이클 타임 (밀리초)
26 |   deploymentFrequency?: number;   // 배포 빈도 (옵션)
27 |   changeFailureRate?: number;     // 결함률 (옵션)
28 | }
29 | 
30 | /**
31 |  * 사이클 타임 계산을 위한 PR 상태 전이
32 |  */
33 | export interface PRStateTransition {
34 |   prNumber: number;
35 |   created: Date;
36 |   firstReview?: Date;
37 |   merged?: Date;
38 |   closed?: Date;
39 | }
40 | 
41 | /**
42 |  * 배포 이벤트 인터페이스 - 배포 관련 정보를 나타냅니다.
43 |  */
44 | export interface DeploymentEvent {
45 |   id: number;
46 |   repository: string;
47 |   environment: string;
48 |   created_at: string;
49 |   completed_at?: string;
50 |   status: 'success' | 'failure' | 'pending';
51 |   has_issues: boolean;
52 |   created_by: string;
53 | } 
```

src/lib/db/adapter.ts
```
1 | // 데이터베이스 어댑터 인터페이스
2 | export interface DatabaseAdapter {
3 |   query<T>(sql: string, params?: any[]): Promise<T[]>;
4 |   execute(sql: string, params?: any[]): Promise<void>;
5 |   close(): Promise<void>;
6 | }
7 | 
8 | // 추상 어댑터 클래스
9 | export abstract class BaseAdapter implements DatabaseAdapter {
10 |   abstract query<T>(sql: string, params?: any[]): Promise<T[]>;
11 |   abstract execute(sql: string, params?: any[]): Promise<void>;
12 |   abstract close(): Promise<void>;
13 | } 
```

src/lib/db/index.ts
```
1 | export * from './adapter';
2 | export * from './sqlite-adapter'; 
```

src/lib/db/sqlite-adapter.ts
```
1 | import Database from 'better-sqlite3';
2 | import { BaseAdapter } from './adapter';
3 | 
4 | export class SQLiteAdapter extends BaseAdapter {
5 |   private db: Database.Database;
6 | 
7 |   constructor(dbPath: string) {
8 |     super();
9 |     this.db = new Database(dbPath);
10 |   }
11 | 
12 |   async query<T>(sql: string, params: any[] = []): Promise<T[]> {
13 |     try {
14 |       const stmt = this.db.prepare(sql);
15 |       return stmt.all(...params) as T[];
16 |     } catch (error) {
17 |       console.error('SQLite query error:', error);
18 |       throw error;
19 |     }
20 |   }
21 | 
22 |   async execute(sql: string, params: any[] = []): Promise<void> {
23 |     try {
24 |       const stmt = this.db.prepare(sql);
25 |       stmt.run(...params);
26 |     } catch (error) {
27 |       console.error('SQLite execute error:', error);
28 |       throw error;
29 |     }
30 |   }
31 | 
32 |   async close(): Promise<void> {
33 |     this.db.close();
34 |   }
35 | } 
```

src/components/dashboard/ChangeFailureRateChart.tsx
```
1 | import React, { useMemo } from 'react';
2 | import { 
3 |   ChartContainer,
4 |   LineChart, 
5 |   Line, 
6 |   XAxis, 
7 |   YAxis, 
8 |   CartesianGrid, 
9 |   Tooltip, 
10 |   ResponsiveContainer 
11 | } from '@/components/ui/chart';
12 | import { useStore } from '@/store/dashboardStore';
13 | import { format, eachDayOfInterval, startOfDay } from 'date-fns';
14 | import { ko } from 'date-fns/locale';
15 | import { calculateChangeFailureRate } from '@/lib/metrics';
16 | 
17 | interface EventData {
18 |   type: string;
19 |   repo: string;
20 |   created_at: string;
21 |   status: string;
22 |   [key: string]: any;
23 | }
24 | 
25 | /**
26 |  * 변경 실패율 추이 차트 컴포넌트
27 |  * 선택된 기간의 일별 변경 실패율을 라인 차트로 시각화합니다.
28 |  */
29 | const ChangeFailureRateChart: React.FC = () => {
30 |   const { events, startDate, endDate, selectedRepo } = useStore();
31 | 
32 |   // 차트 데이터 계산 로직
33 |   const chartData = useMemo(() => {
34 |     if (!startDate || !endDate || !events.length) return [];
35 | 
36 |     // 선택된 기간의 모든 날짜 배열 생성
37 |     const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
38 |     
39 |     // 각 날짜별 변경 실패율 계산
40 |     return dateRange.map(date => {
41 |       const dayStart = startOfDay(date);
42 |       const dayEnd = new Date(dayStart);
43 |       dayEnd.setDate(dayStart.getDate() + 1);
44 |       
45 |       // 해당 날짜 범위의 이벤트 필터링
46 |       const dayEvents = events.filter((event: EventData) => 
47 |         event.repo === selectedRepo &&
48 |         new Date(event.created_at) >= dayStart &&
49 |         new Date(event.created_at) < dayEnd
50 |       );
51 |       
52 |       // 해당 날짜의 변경 실패율 계산
53 |       const failureRate = calculateChangeFailureRate(dayEvents);
54 |       
55 |       return {
56 |         date: format(date, 'MM.dd', { locale: ko }),
57 |         rate: failureRate !== null ? Math.round(failureRate * 100) : 0,
58 |       };
59 |     });
60 |   }, [events, startDate, endDate, selectedRepo]);
61 | 
62 |   // 차트 설정
63 |   const chartConfig = {
64 |     failureRate: {
65 |       label: '실패율 (%)',
66 |       color: 'hsl(var(--destructive))',
67 |     },
68 |   };
69 | 
70 |   return (
71 |     <ChartContainer config={chartConfig} className="h-full w-full">
72 |       <LineChart data={chartData}>
73 |         <CartesianGrid strokeDasharray="3 3" vertical={false} />
74 |         <XAxis 
75 |           dataKey="date" 
76 |           tick={{ fontSize: 12 }}
77 |           tickLine={false}
78 |         />
79 |         <YAxis 
80 |           domain={[0, 100]}
81 |           tickFormatter={(value: number) => `${value}%`}
82 |           tick={{ fontSize: 12 }}
83 |           tickLine={false}
84 |           axisLine={false}
85 |         />
86 |         <Tooltip 
87 |           formatter={(value: number) => [`${value}%`, '실패율']}
88 |         />
89 |         <Line 
90 |           type="monotone" 
91 |           dataKey="rate" 
92 |           name="failureRate" 
93 |           strokeWidth={2}
94 |           dot={{ r: 4 }}
95 |           activeDot={{ r: 6 }}
96 |         />
97 |       </LineChart>
98 |     </ChartContainer>
99 |   );
100 | };
101 | 
102 | export default ChangeFailureRateChart; 
```

src/components/dashboard/Dashboard.tsx
```
1 | import React, { useEffect } from 'react';
2 | import { useStore } from '@/store/dashboardStore';
3 | import { format } from 'date-fns';
4 | import { ko } from 'date-fns/locale';
5 | import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
6 | import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
7 | import { DatePicker } from '@/components/ui/date-picker';
8 | import { Button } from '@/components/ui/button';
9 | import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
10 | import { formatMetricResult } from '@/lib/utils';
11 | import DeploymentFrequencyChart from './DeploymentFrequencyChart';
12 | import ChangeFailureRateChart from './ChangeFailureRateChart';
13 | 
14 | const Dashboard: React.FC = () => {
15 |   const { 
16 |     startDate, 
17 |     endDate, 
18 |     setStartDate, 
19 |     setEndDate, 
20 |     selectedRepo,
21 |     setSelectedRepo,
22 |     repositories,
23 |     leadTimeForChanges,
24 |     changeFailureRate,
25 |     deploymentFrequency,
26 |     meanTimeToRestore,
27 |     loadEvents,
28 |     loadMetrics
29 |   } = useStore();
30 | 
31 |   // 컴포넌트 마운트 시 이벤트 데이터 로드
32 |   useEffect(() => {
33 |     loadEvents();
34 |   }, [loadEvents]);
35 | 
36 |   // 필터 변경 시 지표 계산
37 |   useEffect(() => {
38 |     if (startDate && endDate && selectedRepo) {
39 |       loadMetrics(startDate, endDate, selectedRepo);
40 |     }
41 |   }, [startDate, endDate, selectedRepo, loadMetrics]);
42 | 
43 |   return (
44 |     <div className="container mx-auto p-4">
45 |       <div className="mb-8">
46 |         <h1 className="text-3xl font-bold mb-6">DORA 메트릭스 대시보드</h1>
47 |         
48 |         {/* 필터 섹션 */}
49 |         <div className="flex flex-wrap gap-4 mb-6 items-end">
50 |           <div className="flex flex-col gap-2">
51 |             <label className="text-sm font-medium">시작일</label>
52 |             <DatePicker
53 |               selected={startDate}
54 |               onSelect={setStartDate}
55 |               placeholder="시작일 선택"
56 |             />
57 |           </div>
58 |           
59 |           <div className="flex flex-col gap-2">
60 |             <label className="text-sm font-medium">종료일</label>
61 |             <DatePicker
62 |               selected={endDate}
63 |               onSelect={setEndDate}
64 |               placeholder="종료일 선택"
65 |             />
66 |           </div>
67 |           
68 |           <div className="flex flex-col gap-2">
69 |             <label className="text-sm font-medium">저장소</label>
70 |             <Select value={selectedRepo || ''} onValueChange={setSelectedRepo}>
71 |               <SelectTrigger className="w-[200px]">
72 |                 <SelectValue placeholder="저장소 선택" />
73 |               </SelectTrigger>
74 |               <SelectContent>
75 |                 {repositories.map((repo: string) => (
76 |                   <SelectItem key={repo} value={repo}>
77 |                     {repo}
78 |                   </SelectItem>
79 |                 ))}
80 |               </SelectContent>
81 |             </Select>
82 |           </div>
83 |           
84 |           <Button 
85 |             variant="outline" 
86 |             onClick={() => {
87 |               if (startDate && endDate && selectedRepo) {
88 |                 loadMetrics(startDate, endDate, selectedRepo);
89 |               }
90 |             }}
91 |           >
92 |             적용
93 |           </Button>
94 |         </div>
95 |       </div>
96 |       
97 |       {/* 메트릭스 카드 섹션 */}
98 |       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
99 |         {/* 배포 빈도 카드 */}
100 |         <Card>
101 |           <CardHeader className="pb-2">
102 |             <CardTitle className="text-sm font-medium">배포 빈도</CardTitle>
103 |           </CardHeader>
104 |           <CardContent>
105 |             <div className="text-2xl font-bold">{formatMetricResult(deploymentFrequency)}</div>
106 |             <p className="text-xs text-muted-foreground mt-1">단위: 배포/일</p>
107 |           </CardContent>
108 |         </Card>
109 |         
110 |         {/* 변경 리드 타임 카드 */}
111 |         <Card>
112 |           <CardHeader className="pb-2">
113 |             <CardTitle className="text-sm font-medium">변경 리드 타임</CardTitle>
114 |           </CardHeader>
115 |           <CardContent>
116 |             <div className="text-2xl font-bold">{formatMetricResult(leadTimeForChanges)}</div>
117 |             <p className="text-xs text-muted-foreground mt-1">단위: 시간</p>
118 |           </CardContent>
119 |         </Card>
120 |         
121 |         {/* 변경 실패율 카드 */}
122 |         <Card>
123 |           <CardHeader className="pb-2">
124 |             <CardTitle className="text-sm font-medium">변경 실패율</CardTitle>
125 |           </CardHeader>
126 |           <CardContent>
127 |             <div className="text-2xl font-bold">{formatMetricResult(changeFailureRate, true)}</div>
128 |             <p className="text-xs text-muted-foreground mt-1">단위: %</p>
129 |           </CardContent>
130 |         </Card>
131 |         
132 |         {/* 복구 시간 카드 */}
133 |         <Card>
134 |           <CardHeader className="pb-2">
135 |             <CardTitle className="text-sm font-medium">평균 복구 시간</CardTitle>
136 |           </CardHeader>
137 |           <CardContent>
138 |             <div className="text-2xl font-bold">{formatMetricResult(meanTimeToRestore)}</div>
139 |             <p className="text-xs text-muted-foreground mt-1">단위: 시간</p>
140 |           </CardContent>
141 |         </Card>
142 |       </div>
143 |       
144 |       {/* 탭 섹션 - 추가적인 차트 및 정보 */}
145 |       <div className="mt-8">
146 |         <Tabs defaultValue="charts">
147 |           <TabsList>
148 |             <TabsTrigger value="charts">차트</TabsTrigger>
149 |             <TabsTrigger value="details">상세 정보</TabsTrigger>
150 |           </TabsList>
151 |           
152 |           <TabsContent value="charts" className="mt-4">
153 |             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
154 |               {/* 배포 빈도 차트 */}
155 |               <Card>
156 |                 <CardHeader>
157 |                   <CardTitle>시간별 배포 빈도</CardTitle>
158 |                 </CardHeader>
159 |                 <CardContent className="h-80">
160 |                   <DeploymentFrequencyChart />
161 |                 </CardContent>
162 |               </Card>
163 |               
164 |               {/* 변경 실패율 차트 */}
165 |               <Card>
166 |                 <CardHeader>
167 |                   <CardTitle>변경 실패율 추이</CardTitle>
168 |                 </CardHeader>
169 |                 <CardContent className="h-80">
170 |                   <ChangeFailureRateChart />
171 |                 </CardContent>
172 |               </Card>
173 |             </div>
174 |           </TabsContent>
175 |           
176 |           <TabsContent value="details">
177 |             <Card>
178 |               <CardHeader>
179 |                 <CardTitle>데이터 상세 정보</CardTitle>
180 |               </CardHeader>
181 |               <CardContent>
182 |                 <p>선택한 기간: {startDate && endDate ? `${format(startDate, 'yyyy년 MM월 dd일', { locale: ko })} ~ ${format(endDate, 'yyyy년 MM월 dd일', { locale: ko })}` : '기간을 선택해주세요'}</p>
183 |                 <p>선택한 저장소: {selectedRepo || '저장소를 선택해주세요'}</p>
184 |                 {/* 추가 데이터 표시 영역 */}
185 |               </CardContent>
186 |             </Card>
187 |           </TabsContent>
188 |         </Tabs>
189 |       </div>
190 |     </div>
191 |   );
192 | };
193 | 
194 | export default Dashboard; 
```

src/components/dashboard/DeploymentFrequencyChart.tsx
```
1 | import React, { useMemo } from 'react';
2 | import { 
3 |   ChartContainer,
4 |   BarChart, 
5 |   Bar, 
6 |   XAxis, 
7 |   YAxis, 
8 |   CartesianGrid, 
9 |   Tooltip, 
10 |   ResponsiveContainer 
11 | } from '@/components/ui/chart';
12 | import { useStore } from '@/store/dashboardStore';
13 | import { format, eachDayOfInterval, startOfDay } from 'date-fns';
14 | import { ko } from 'date-fns/locale';
15 | 
16 | interface EventData {
17 |   type: string;
18 |   repo: string;
19 |   created_at: string;
20 |   status: string;
21 |   [key: string]: any;
22 | }
23 | 
24 | /**
25 |  * 배포 빈도 차트 컴포넌트
26 |  * 선택된 기간의 일별 배포 횟수를 바 차트로 시각화합니다.
27 |  */
28 | const DeploymentFrequencyChart: React.FC = () => {
29 |   const { events, startDate, endDate, selectedRepo } = useStore();
30 | 
31 |   // 차트 데이터 계산 로직
32 |   const chartData = useMemo(() => {
33 |     if (!startDate || !endDate || !events.length) return [];
34 | 
35 |     // 선택된 기간의 모든 날짜 배열 생성
36 |     const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
37 |     
38 |     // 각 날짜별 배포 이벤트 카운트
39 |     return dateRange.map(date => {
40 |       const dayStart = startOfDay(date);
41 |       const dayEnd = new Date(dayStart);
42 |       dayEnd.setDate(dayStart.getDate() + 1);
43 |       
44 |       // 해당 날짜 범위의 배포 이벤트 필터링
45 |       const deploymentCount = events.filter((event: EventData) => 
46 |         event.type === 'DeploymentEvent' &&
47 |         event.repo === selectedRepo &&
48 |         new Date(event.created_at) >= dayStart &&
49 |         new Date(event.created_at) < dayEnd
50 |       ).length;
51 |       
52 |       return {
53 |         date: format(date, 'MM.dd', { locale: ko }),
54 |         count: deploymentCount,
55 |       };
56 |     });
57 |   }, [events, startDate, endDate, selectedRepo]);
58 | 
59 |   // 차트 설정
60 |   const chartConfig = {
61 |     deployments: {
62 |       label: '배포 횟수',
63 |       color: 'hsl(var(--primary))',
64 |     },
65 |   };
66 | 
67 |   return (
68 |     <ChartContainer config={chartConfig} className="h-full w-full">
69 |       <BarChart data={chartData}>
70 |         <CartesianGrid strokeDasharray="3 3" vertical={false} />
71 |         <XAxis 
72 |           dataKey="date" 
73 |           tick={{ fontSize: 12 }}
74 |           tickLine={false}
75 |         />
76 |         <YAxis 
77 |           allowDecimals={false}
78 |           tick={{ fontSize: 12 }}
79 |           tickLine={false}
80 |           axisLine={false}
81 |         />
82 |         <Tooltip />
83 |         <Bar 
84 |           dataKey="count" 
85 |           name="deployments" 
86 |           radius={[4, 4, 0, 0]}
87 |         />
88 |       </BarChart>
89 |     </ChartContainer>
90 |   );
91 | };
92 | 
93 | export default DeploymentFrequencyChart; 
```

src/components/ui/button.tsx
```
1 | import * as React from "react"
2 | import { Slot } from "@radix-ui/react-slot"
3 | import { cva, type VariantProps } from "class-variance-authority"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | const buttonVariants = cva(
8 |   "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
9 |   {
10 |     variants: {
11 |       variant: {
12 |         default:
13 |           "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
14 |         destructive:
15 |           "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
16 |         outline:
17 |           "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
18 |         secondary:
19 |           "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
20 |         ghost:
21 |           "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
22 |         link: "text-primary underline-offset-4 hover:underline",
23 |       },
24 |       size: {
25 |         default: "h-9 px-4 py-2 has-[>svg]:px-3",
26 |         sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
27 |         lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
28 |         icon: "size-9",
29 |       },
30 |     },
31 |     defaultVariants: {
32 |       variant: "default",
33 |       size: "default",
34 |     },
35 |   }
36 | )
37 | 
38 | function Button({
39 |   className,
40 |   variant,
41 |   size,
42 |   asChild = false,
43 |   ...props
44 | }: React.ComponentProps<"button"> &
45 |   VariantProps<typeof buttonVariants> & {
46 |     asChild?: boolean
47 |   }) {
48 |   const Comp = asChild ? Slot : "button"
49 | 
50 |   return (
51 |     <Comp
52 |       data-slot="button"
53 |       className={cn(buttonVariants({ variant, size, className }))}
54 |       {...props}
55 |     />
56 |   )
57 | }
58 | 
59 | export { Button, buttonVariants }
```

src/components/ui/calendar.tsx
```
1 | import * as React from "react"
2 | import { ChevronLeft, ChevronRight } from "lucide-react"
3 | import { DayPicker } from "react-day-picker"
4 | 
5 | import { cn } from "@/lib/utils"
6 | import { buttonVariants } from "@/components/ui/button"
7 | 
8 | function Calendar({
9 |   className,
10 |   classNames,
11 |   showOutsideDays = true,
12 |   ...props
13 | }: React.ComponentProps<typeof DayPicker>) {
14 |   return (
15 |     <DayPicker
16 |       showOutsideDays={showOutsideDays}
17 |       className={cn("p-3", className)}
18 |       classNames={{
19 |         months: "flex flex-col sm:flex-row gap-2",
20 |         month: "flex flex-col gap-4",
21 |         caption: "flex justify-center pt-1 relative items-center w-full",
22 |         caption_label: "text-sm font-medium",
23 |         nav: "flex items-center gap-1",
24 |         nav_button: cn(
25 |           buttonVariants({ variant: "outline" }),
26 |           "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
27 |         ),
28 |         nav_button_previous: "absolute left-1",
29 |         nav_button_next: "absolute right-1",
30 |         table: "w-full border-collapse space-x-1",
31 |         head_row: "flex",
32 |         head_cell:
33 |           "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
34 |         row: "flex w-full mt-2",
35 |         cell: cn(
36 |           "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
37 |           props.mode === "range"
38 |             ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
39 |             : "[&:has([aria-selected])]:rounded-md"
40 |         ),
41 |         day: cn(
42 |           buttonVariants({ variant: "ghost" }),
43 |           "size-8 p-0 font-normal aria-selected:opacity-100"
44 |         ),
45 |         day_range_start:
46 |           "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
47 |         day_range_end:
48 |           "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
49 |         day_selected:
50 |           "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
51 |         day_today: "bg-accent text-accent-foreground",
52 |         day_outside:
53 |           "day-outside text-muted-foreground aria-selected:text-muted-foreground",
54 |         day_disabled: "text-muted-foreground opacity-50",
55 |         day_range_middle:
56 |           "aria-selected:bg-accent aria-selected:text-accent-foreground",
57 |         day_hidden: "invisible",
58 |         ...classNames,
59 |       }}
60 |       components={{
61 |         IconLeft: ({ className, ...props }) => (
62 |           <ChevronLeft className={cn("size-4", className)} {...props} />
63 |         ),
64 |         IconRight: ({ className, ...props }) => (
65 |           <ChevronRight className={cn("size-4", className)} {...props} />
66 |         ),
67 |       }}
68 |       {...props}
69 |     />
70 |   )
71 | }
72 | 
73 | export { Calendar }
```

src/components/ui/card.tsx
```
1 | import * as React from "react"
2 | 
3 | import { cn } from "@/lib/utils"
4 | 
5 | function Card({ className, ...props }: React.ComponentProps<"div">) {
6 |   return (
7 |     <div
8 |       data-slot="card"
9 |       className={cn(
10 |         "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
11 |         className
12 |       )}
13 |       {...props}
14 |     />
15 |   )
16 | }
17 | 
18 | function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
19 |   return (
20 |     <div
21 |       data-slot="card-header"
22 |       className={cn(
23 |         "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
24 |         className
25 |       )}
26 |       {...props}
27 |     />
28 |   )
29 | }
30 | 
31 | function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
32 |   return (
33 |     <div
34 |       data-slot="card-title"
35 |       className={cn("leading-none font-semibold", className)}
36 |       {...props}
37 |     />
38 |   )
39 | }
40 | 
41 | function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
42 |   return (
43 |     <div
44 |       data-slot="card-description"
45 |       className={cn("text-muted-foreground text-sm", className)}
46 |       {...props}
47 |     />
48 |   )
49 | }
50 | 
51 | function CardAction({ className, ...props }: React.ComponentProps<"div">) {
52 |   return (
53 |     <div
54 |       data-slot="card-action"
55 |       className={cn(
56 |         "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
57 |         className
58 |       )}
59 |       {...props}
60 |     />
61 |   )
62 | }
63 | 
64 | function CardContent({ className, ...props }: React.ComponentProps<"div">) {
65 |   return (
66 |     <div
67 |       data-slot="card-content"
68 |       className={cn("px-6", className)}
69 |       {...props}
70 |     />
71 |   )
72 | }
73 | 
74 | function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
75 |   return (
76 |     <div
77 |       data-slot="card-footer"
78 |       className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
79 |       {...props}
80 |     />
81 |   )
82 | }
83 | 
84 | export {
85 |   Card,
86 |   CardHeader,
87 |   CardFooter,
88 |   CardTitle,
89 |   CardAction,
90 |   CardDescription,
91 |   CardContent,
92 | }
```

src/components/ui/chart.tsx
```
1 | import * as React from "react"
2 | import * as RechartsPrimitive from "recharts"
3 | 
4 | import { cn } from "@/lib/utils"
5 | 
6 | // Format: { THEME_NAME: CSS_SELECTOR }
7 | const THEMES = { light: "", dark: ".dark" } as const
8 | 
9 | // Recharts 컴포넌트를 재내보냅니다
10 | export const {
11 |   ResponsiveContainer,
12 |   AreaChart,
13 |   BarChart,
14 |   LineChart,
15 |   ComposedChart,
16 |   PieChart,
17 |   RadarChart,
18 |   RadialBarChart,
19 |   ScatterChart,
20 |   Treemap,
21 |   Area,
22 |   Bar,
23 |   Line,
24 |   Scatter,
25 |   XAxis,
26 |   YAxis,
27 |   CartesianGrid,
28 |   Tooltip,
29 |   Legend,
30 |   Cell,
31 |   Pie,
32 |   Radar,
33 |   RadialBar,
34 |   PolarAngleAxis,
35 |   PolarGrid,
36 |   PolarRadiusAxis,
37 |   ReferenceLine,
38 |   ReferenceArea,
39 |   ReferenceDot,
40 |   ErrorBar,
41 |   Brush
42 | } = RechartsPrimitive;
43 | 
44 | // 페이로드에서 아이템 구성을 추출하는 헬퍼 함수
45 | export function getPayloadConfigFromPayload(
46 |   config: ChartConfig,
47 |   payload: any,
48 |   key: string
49 | ) {
50 |   if (typeof payload !== "object" || payload === null) {
51 |     return null;
52 |   }
53 | 
54 |   const payloadPayload =
55 |     "payload" in payload &&
56 |     typeof payload.payload === "object" &&
57 |     payload.payload !== null
58 |       ? payload.payload
59 |       : undefined;
60 | 
61 |   let configLabelKey: string = key;
62 | 
63 |   if (
64 |     key in payload &&
65 |     typeof payload[key as keyof typeof payload] === "string"
66 |   ) {
67 |     configLabelKey = payload[key as keyof typeof payload] as string;
68 |   } else if (
69 |     payloadPayload &&
70 |     key in payloadPayload &&
71 |     typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
72 |   ) {
73 |     configLabelKey = payloadPayload[
74 |       key as keyof typeof payloadPayload
75 |     ] as string;
76 |   }
77 | 
78 |   return configLabelKey in config
79 |     ? config[configLabelKey]
80 |     : "dataKey" in payload && typeof payload.dataKey === "string" && payload.dataKey in config
81 |     ? config[payload.dataKey]
82 |     : null;
83 | }
84 | 
85 | export type ChartConfig = {
86 |   [k in string]: {
87 |     label?: React.ReactNode
88 |     icon?: React.ComponentType
89 |   } & (
90 |     | { color?: string; theme?: never }
91 |     | { color?: never; theme: Record<keyof typeof THEMES, string> }
92 |   )
93 | }
94 | 
95 | type ChartContextProps = {
96 |   config: ChartConfig
97 | }
98 | 
99 | const ChartContext = React.createContext<ChartContextProps | null>(null)
100 | 
101 | function useChart() {
102 |   const context = React.useContext(ChartContext)
103 | 
104 |   if (!context) {
105 |     throw new Error("useChart must be used within a <ChartContainer />")
106 |   }
107 | 
108 |   return context
109 | }
110 | 
111 | export function ChartContainer({
112 |   id,
113 |   className,
114 |   children,
115 |   config,
116 |   ...props
117 | }: React.ComponentProps<"div"> & {
118 |   config: ChartConfig
119 |   children: React.ComponentProps<
120 |     typeof RechartsPrimitive.ResponsiveContainer
121 |   >["children"]
122 | }) {
123 |   const uniqueId = React.useId()
124 |   const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`
125 | 
126 |   return (
127 |     <ChartContext.Provider value={{ config }}>
128 |       <div
129 |         data-slot="chart"
130 |         data-chart={chartId}
131 |         className={cn(
132 |           "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
133 |           className
134 |         )}
135 |         {...props}
136 |       >
137 |         <ChartStyle id={chartId} config={config} />
138 |         <RechartsPrimitive.ResponsiveContainer>
139 |           {children}
140 |         </RechartsPrimitive.ResponsiveContainer>
141 |       </div>
142 |     </ChartContext.Provider>
143 |   )
144 | }
145 | 
146 | const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
147 |   const colorConfig = Object.entries(config).filter(
148 |     ([, config]) => config.theme || config.color
149 |   )
150 | 
151 |   if (!colorConfig.length) {
152 |     return null
153 |   }
154 | 
155 |   return (
156 |     <style
157 |       dangerouslySetInnerHTML={{
158 |         __html: Object.entries(THEMES)
159 |           .map(
160 |             ([theme, prefix]) => `
161 | ${prefix} [data-chart=${id}] {
162 | ${colorConfig
163 |   .map(([key, itemConfig]) => {
164 |     const color =
165 |       itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
166 |       itemConfig.color
167 |     return color ? `  --color-${key}: ${color};` : null
168 |   })
169 |   .join("\n")}
170 | }
171 | `
172 |           )
173 |           .join("\n"),
174 |       }}
175 |     />
176 |   )
177 | }
178 | 
179 | export const ChartTooltip = RechartsPrimitive.Tooltip
180 | 
181 | export function ChartTooltipContent({
182 |   active,
183 |   payload,
184 |   className,
185 |   indicator = "dot",
186 |   hideLabel = false,
187 |   hideIndicator = false,
188 |   label,
189 |   labelFormatter,
190 |   labelClassName,
191 |   formatter,
192 |   color,
193 |   nameKey,
194 |   labelKey,
195 | }: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
196 |   React.ComponentProps<"div"> & {
197 |     hideLabel?: boolean
198 |     hideIndicator?: boolean
199 |     indicator?: "line" | "dot" | "dashed"
200 |     nameKey?: string
201 |     labelKey?: string
202 |   }) {
203 |   const { config } = useChart()
204 | 
205 |   const tooltipLabel = React.useMemo(() => {
206 |     if (hideLabel || !payload?.length) {
207 |       return null
208 |     }
209 | 
210 |     const [item] = payload
211 |     const key = `${labelKey || item?.dataKey || item?.name || "value"}`
212 |     const itemConfig = getPayloadConfigFromPayload(config, item, key)
213 |     const value =
214 |       !labelKey && typeof label === "string"
215 |         ? config[label as keyof typeof config]?.label || label
216 |         : itemConfig?.label
217 | 
218 |     if (labelFormatter) {
219 |       return (
220 |         <div className={cn("font-medium", labelClassName)}>
221 |           {labelFormatter(value, payload)}
222 |         </div>
223 |       )
224 |     }
225 | 
226 |     if (!value) {
227 |       return null
228 |     }
229 | 
230 |     return <div className={cn("font-medium", labelClassName)}>{value}</div>
231 |   }, [
232 |     label,
233 |     labelFormatter,
234 |     payload,
235 |     hideLabel,
236 |     labelClassName,
237 |     config,
238 |     labelKey,
239 |   ])
240 | 
241 |   if (!active || !payload?.length) {
242 |     return null
243 |   }
244 | 
245 |   const nestLabel = payload.length === 1 && indicator !== "dot"
246 | 
247 |   return (
248 |     <div
249 |       className={cn(
250 |         "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
251 |         className
252 |       )}
253 |     >
254 |       {!nestLabel ? tooltipLabel : null}
255 |       <div className="grid gap-1.5">
256 |         {payload.map((item, index) => {
257 |           const key = `${nameKey || item.name || item.dataKey || "value"}`
258 |           const itemConfig = getPayloadConfigFromPayload(config, item, key)
259 |           const indicatorColor = color || item.payload?.fill || item.color
260 | 
261 |           return (
262 |             <div
263 |               key={item.dataKey || index}
264 |               className={cn(
265 |                 "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
266 |                 indicator === "dot" && "items-center"
267 |               )}
268 |             >
269 |               {formatter && item?.value !== undefined && item.name ? (
270 |                 formatter(item.value, item.name, item, index, item.payload)
271 |               ) : (
272 |                 <>
273 |                   {itemConfig?.icon ? (
274 |                     <itemConfig.icon />
275 |                   ) : (
276 |                     !hideIndicator && (
277 |                       <div
278 |                         className={cn(
279 |                           "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
280 |                           {
281 |                             "h-2.5 w-2.5": indicator === "dot",
282 |                             "w-1": indicator === "line",
283 |                             "w-0 border-[1.5px] border-dashed bg-transparent":
284 |                               indicator === "dashed",
285 |                             "my-0.5": nestLabel && indicator === "dashed",
286 |                           }
287 |                         )}
288 |                         style={
289 |                           {
290 |                             "--color-bg": indicatorColor,
291 |                             "--color-border": indicatorColor,
292 |                           } as React.CSSProperties
293 |                         }
294 |                       />
295 |                     )
296 |                   )}
297 |                   <div
298 |                     className={cn(
299 |                       "flex flex-1 justify-between leading-none",
300 |                       nestLabel ? "items-end" : "items-center"
301 |                     )}
302 |                   >
303 |                     <div className="grid gap-1.5">
304 |                       {nestLabel ? tooltipLabel : null}
305 |                       <span className="text-muted-foreground">
306 |                         {itemConfig?.label || item.name}
307 |                       </span>
308 |                     </div>
309 |                     {item.value && (
310 |                       <span className="text-foreground font-mono font-medium tabular-nums">
311 |                         {item.value.toLocaleString()}
312 |                       </span>
313 |                     )}
314 |                   </div>
315 |                 </>
316 |               )}
317 |             </div>
318 |           )
319 |         })}
320 |       </div>
321 |     </div>
322 |   )
323 | }
324 | 
325 | export const ChartLegend = RechartsPrimitive.Legend
326 | 
327 | export function ChartLegendContent({
328 |   className,
329 |   hideIcon = false,
330 |   ...props
331 | }: React.ComponentProps<typeof RechartsPrimitive.Legend> &
332 |   React.ComponentProps<"div"> & {
333 |     hideIcon?: boolean
334 |   }) {
335 |   const { config } = useChart()
336 | 
337 |   return (
338 |     <div
339 |       className={cn("flex flex-wrap [&_.recharts-legend-item]:mr-0", className)}
340 |       {...props}
341 |     >
342 |       <RechartsPrimitive.Legend
343 |         content={({ payload }) => {
344 |           if (!payload || !payload.length) {
345 |             return null
346 |           }
347 | 
348 |           return (
349 |             <div
350 |               role="list"
351 |               className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"
352 |             >
353 |               {payload.map((entry, index) => {
354 |                 const itemConfig = getPayloadConfigFromPayload(
355 |                   config,
356 |                   entry,
357 |                   "name"
358 |                 )
359 |                 const indicatorColor = entry.color
360 | 
361 |                 return (
362 |                   <div
363 |                     role="listitem"
364 |                     key={`item-${index}`}
365 |                     className="[&>svg]:text-muted-foreground inline-flex items-center"
366 |                   >
367 |                     {itemConfig?.icon ? (
368 |                       <itemConfig.icon />
369 |                     ) : (
370 |                       !hideIcon && (
371 |                         <div
372 |                           className="mr-1 h-2.5 w-2.5 shrink-0 rounded-sm"
373 |                           style={{ backgroundColor: indicatorColor }}
374 |                         />
375 |                       )
376 |                     )}
377 |                     <span>{itemConfig?.label || entry.value}</span>
378 |                   </div>
379 |                 )
380 |               })}
381 |             </div>
382 |           )
383 |         }}
384 |       />
385 |     </div>
386 |   )
387 | }
```

src/components/ui/date-picker.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import { format } from "date-fns"
5 | import { Calendar as CalendarIcon } from "lucide-react"
6 | 
7 | import { cn } from "@/lib/utils"
8 | import { Button } from "@/components/ui/button"
9 | import { Calendar } from "@/components/ui/calendar"
10 | import {
11 |   Popover,
12 |   PopoverContent,
13 |   PopoverTrigger,
14 | } from "@/components/ui/popover"
15 | 
16 | interface DatePickerProps {
17 |   date?: Date | undefined;
18 |   setDate?: (date: Date | undefined) => void;
19 |   selected?: Date | null;
20 |   onSelect?: (date: Date | null) => void;
21 |   placeholder?: string;
22 | }
23 | 
24 | export function DatePicker({ 
25 |   date, 
26 |   setDate, 
27 |   selected, 
28 |   onSelect,
29 |   placeholder = "날짜 선택" 
30 | }: DatePickerProps) {
31 |   // date와 selected, setDate와 onSelect를 함께 지원하기 위한 처리
32 |   const selectedDate = selected || date;
33 |   const handleDateChange = (newDate: Date | undefined) => {
34 |     if (onSelect) {
35 |       onSelect(newDate || null);
36 |     }
37 |     if (setDate) {
38 |       setDate(newDate);
39 |     }
40 |   };
41 | 
42 |   return (
43 |     <Popover>
44 |       <PopoverTrigger asChild>
45 |         <Button
46 |           variant={"outline"}
47 |           className={cn(
48 |             "w-full justify-start text-left font-normal",
49 |             !selectedDate && "text-muted-foreground"
50 |           )}
51 |         >
52 |           <CalendarIcon className="mr-2 h-4 w-4" />
53 |           {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
54 |         </Button>
55 |       </PopoverTrigger>
56 |       <PopoverContent className="w-auto p-0">
57 |         <Calendar
58 |           mode="single"
59 |           selected={selectedDate}
60 |           onSelect={handleDateChange}
61 |           initialFocus
62 |         />
63 |       </PopoverContent>
64 |     </Popover>
65 |   )
66 | } 
```

src/components/ui/dropdown-menu.tsx
```
1 | import * as React from "react"
2 | import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
3 | import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | function DropdownMenu({
8 |   ...props
9 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
10 |   return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
11 | }
12 | 
13 | function DropdownMenuPortal({
14 |   ...props
15 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
16 |   return (
17 |     <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
18 |   )
19 | }
20 | 
21 | function DropdownMenuTrigger({
22 |   ...props
23 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
24 |   return (
25 |     <DropdownMenuPrimitive.Trigger
26 |       data-slot="dropdown-menu-trigger"
27 |       {...props}
28 |     />
29 |   )
30 | }
31 | 
32 | function DropdownMenuContent({
33 |   className,
34 |   sideOffset = 4,
35 |   ...props
36 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
37 |   return (
38 |     <DropdownMenuPrimitive.Portal>
39 |       <DropdownMenuPrimitive.Content
40 |         data-slot="dropdown-menu-content"
41 |         sideOffset={sideOffset}
42 |         className={cn(
43 |           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
44 |           className
45 |         )}
46 |         {...props}
47 |       />
48 |     </DropdownMenuPrimitive.Portal>
49 |   )
50 | }
51 | 
52 | function DropdownMenuGroup({
53 |   ...props
54 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
55 |   return (
56 |     <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
57 |   )
58 | }
59 | 
60 | function DropdownMenuItem({
61 |   className,
62 |   inset,
63 |   variant = "default",
64 |   ...props
65 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
66 |   inset?: boolean
67 |   variant?: "default" | "destructive"
68 | }) {
69 |   return (
70 |     <DropdownMenuPrimitive.Item
71 |       data-slot="dropdown-menu-item"
72 |       data-inset={inset}
73 |       data-variant={variant}
74 |       className={cn(
75 |         "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
76 |         className
77 |       )}
78 |       {...props}
79 |     />
80 |   )
81 | }
82 | 
83 | function DropdownMenuCheckboxItem({
84 |   className,
85 |   children,
86 |   checked,
87 |   ...props
88 | }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
89 |   return (
90 |     <DropdownMenuPrimitive.CheckboxItem
91 |       data-slot="dropdown-menu-checkbox-item"
92 |       className={cn(
93 |         "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
94 |         className
95 |       )}
96 |       checked={checked}
97 |       {...props}
98 |     >
99 |       <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
100 |         <DropdownMenuPrimitive.ItemIndicator>
101 |           <CheckIcon className="size-4" />
102 |         </DropdownMenuPrimitive.ItemIndicator>
103 |       </span>
104 |       {children}
105 |     </DropdownMenuPrimitive.CheckboxItem>
106 |   )
107 | }
108 | 
109 | function DropdownMenuRadioGroup({
110 |   ...props
111 | }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
112 |   return (
113 |     <DropdownMenuPrimitive.RadioGroup
114 |       data-slot="dropdown-menu-radio-group"
115 |       {...props}
116 |     />
117 |   )
118 | }
119 | 
120 | function DropdownMenuRadioItem({
121 |   className,
122 |   children,
123 |   ...props
124 | }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
125 |   return (
126 |     <DropdownMenuPrimitive.RadioItem
127 |       data-slot="dropdown-menu-radio-item"
128 |       className={cn(
129 |         "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
130 |         className
131 |       )}
132 |       {...props}
133 |     >
134 |       <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
135 |         <DropdownMenuPrimitive.ItemIndicator>
136 |           <CircleIcon className="size-2 fill-current" />
137 |         </DropdownMenuPrimitive.ItemIndicator>
138 |       </span>
139 |       {children}
140 |     </DropdownMenuPrimitive.RadioItem>
141 |   )
142 | }
143 | 
144 | function DropdownMenuLabel({
145 |   className,
146 |   inset,
147 |   ...props
148 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
149 |   inset?: boolean
150 | }) {
151 |   return (
152 |     <DropdownMenuPrimitive.Label
153 |       data-slot="dropdown-menu-label"
154 |       data-inset={inset}
155 |       className={cn(
156 |         "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
157 |         className
158 |       )}
159 |       {...props}
160 |     />
161 |   )
162 | }
163 | 
164 | function DropdownMenuSeparator({
165 |   className,
166 |   ...props
167 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
168 |   return (
169 |     <DropdownMenuPrimitive.Separator
170 |       data-slot="dropdown-menu-separator"
171 |       className={cn("bg-border -mx-1 my-1 h-px", className)}
172 |       {...props}
173 |     />
174 |   )
175 | }
176 | 
177 | function DropdownMenuShortcut({
178 |   className,
179 |   ...props
180 | }: React.ComponentProps<"span">) {
181 |   return (
182 |     <span
183 |       data-slot="dropdown-menu-shortcut"
184 |       className={cn(
185 |         "text-muted-foreground ml-auto text-xs tracking-widest",
186 |         className
187 |       )}
188 |       {...props}
189 |     />
190 |   )
191 | }
192 | 
193 | function DropdownMenuSub({
194 |   ...props
195 | }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
196 |   return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
197 | }
198 | 
199 | function DropdownMenuSubTrigger({
200 |   className,
201 |   inset,
202 |   children,
203 |   ...props
204 | }: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
205 |   inset?: boolean
206 | }) {
207 |   return (
208 |     <DropdownMenuPrimitive.SubTrigger
209 |       data-slot="dropdown-menu-sub-trigger"
210 |       data-inset={inset}
211 |       className={cn(
212 |         "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
213 |         className
214 |       )}
215 |       {...props}
216 |     >
217 |       {children}
218 |       <ChevronRightIcon className="ml-auto size-4" />
219 |     </DropdownMenuPrimitive.SubTrigger>
220 |   )
221 | }
222 | 
223 | function DropdownMenuSubContent({
224 |   className,
225 |   ...props
226 | }: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
227 |   return (
228 |     <DropdownMenuPrimitive.SubContent
229 |       data-slot="dropdown-menu-sub-content"
230 |       className={cn(
231 |         "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
232 |         className
233 |       )}
234 |       {...props}
235 |     />
236 |   )
237 | }
238 | 
239 | export {
240 |   DropdownMenu,
241 |   DropdownMenuPortal,
242 |   DropdownMenuTrigger,
243 |   DropdownMenuContent,
244 |   DropdownMenuGroup,
245 |   DropdownMenuLabel,
246 |   DropdownMenuItem,
247 |   DropdownMenuCheckboxItem,
248 |   DropdownMenuRadioGroup,
249 |   DropdownMenuRadioItem,
250 |   DropdownMenuSeparator,
251 |   DropdownMenuShortcut,
252 |   DropdownMenuSub,
253 |   DropdownMenuSubTrigger,
254 |   DropdownMenuSubContent,
255 | }
```

src/components/ui/label.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as LabelPrimitive from "@radix-ui/react-label"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Label({
9 |   className,
10 |   ...props
11 | }: React.ComponentProps<typeof LabelPrimitive.Root>) {
12 |   return (
13 |     <LabelPrimitive.Root
14 |       data-slot="label"
15 |       className={cn(
16 |         "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
17 |         className
18 |       )}
19 |       {...props}
20 |     />
21 |   )
22 | }
23 | 
24 | export { Label }
```

src/components/ui/popover.tsx
```
1 | import * as React from "react"
2 | import * as PopoverPrimitive from "@radix-ui/react-popover"
3 | 
4 | import { cn } from "@/lib/utils"
5 | 
6 | function Popover({
7 |   ...props
8 | }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
9 |   return <PopoverPrimitive.Root data-slot="popover" {...props} />
10 | }
11 | 
12 | function PopoverTrigger({
13 |   ...props
14 | }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
15 |   return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
16 | }
17 | 
18 | function PopoverContent({
19 |   className,
20 |   align = "center",
21 |   sideOffset = 4,
22 |   ...props
23 | }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
24 |   return (
25 |     <PopoverPrimitive.Portal>
26 |       <PopoverPrimitive.Content
27 |         data-slot="popover-content"
28 |         align={align}
29 |         sideOffset={sideOffset}
30 |         className={cn(
31 |           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 shadow-md outline-hidden",
32 |           className
33 |         )}
34 |         {...props}
35 |       />
36 |     </PopoverPrimitive.Portal>
37 |   )
38 | }
39 | 
40 | function PopoverAnchor({
41 |   ...props
42 | }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
43 |   return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
44 | }
45 | 
46 | export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
```

src/components/ui/select.tsx
```
1 | import * as React from "react"
2 | import * as SelectPrimitive from "@radix-ui/react-select"
3 | import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | function Select({
8 |   ...props
9 | }: React.ComponentProps<typeof SelectPrimitive.Root>) {
10 |   return <SelectPrimitive.Root data-slot="select" {...props} />
11 | }
12 | 
13 | function SelectGroup({
14 |   ...props
15 | }: React.ComponentProps<typeof SelectPrimitive.Group>) {
16 |   return <SelectPrimitive.Group data-slot="select-group" {...props} />
17 | }
18 | 
19 | function SelectValue({
20 |   ...props
21 | }: React.ComponentProps<typeof SelectPrimitive.Value>) {
22 |   return <SelectPrimitive.Value data-slot="select-value" {...props} />
23 | }
24 | 
25 | function SelectTrigger({
26 |   className,
27 |   size = "default",
28 |   children,
29 |   ...props
30 | }: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
31 |   size?: "sm" | "default"
32 | }) {
33 |   return (
34 |     <SelectPrimitive.Trigger
35 |       data-slot="select-trigger"
36 |       data-size={size}
37 |       className={cn(
38 |         "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
39 |         className
40 |       )}
41 |       {...props}
42 |     >
43 |       {children}
44 |       <SelectPrimitive.Icon asChild>
45 |         <ChevronDownIcon className="size-4 opacity-50" />
46 |       </SelectPrimitive.Icon>
47 |     </SelectPrimitive.Trigger>
48 |   )
49 | }
50 | 
51 | function SelectContent({
52 |   className,
53 |   children,
54 |   position = "popper",
55 |   ...props
56 | }: React.ComponentProps<typeof SelectPrimitive.Content>) {
57 |   return (
58 |     <SelectPrimitive.Portal>
59 |       <SelectPrimitive.Content
60 |         data-slot="select-content"
61 |         className={cn(
62 |           "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
63 |           position === "popper" &&
64 |             "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
65 |           className
66 |         )}
67 |         position={position}
68 |         {...props}
69 |       >
70 |         <SelectScrollUpButton />
71 |         <SelectPrimitive.Viewport
72 |           className={cn(
73 |             "p-1",
74 |             position === "popper" &&
75 |               "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
76 |           )}
77 |         >
78 |           {children}
79 |         </SelectPrimitive.Viewport>
80 |         <SelectScrollDownButton />
81 |       </SelectPrimitive.Content>
82 |     </SelectPrimitive.Portal>
83 |   )
84 | }
85 | 
86 | function SelectLabel({
87 |   className,
88 |   ...props
89 | }: React.ComponentProps<typeof SelectPrimitive.Label>) {
90 |   return (
91 |     <SelectPrimitive.Label
92 |       data-slot="select-label"
93 |       className={cn("px-2 py-1.5 text-sm font-medium", className)}
94 |       {...props}
95 |     />
96 |   )
97 | }
98 | 
99 | function SelectItem({
100 |   className,
101 |   children,
102 |   ...props
103 | }: React.ComponentProps<typeof SelectPrimitive.Item>) {
104 |   return (
105 |     <SelectPrimitive.Item
106 |       data-slot="select-item"
107 |       className={cn(
108 |         "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
109 |         className
110 |       )}
111 |       {...props}
112 |     >
113 |       <span className="absolute right-2 flex size-3.5 items-center justify-center">
114 |         <SelectPrimitive.ItemIndicator>
115 |           <CheckIcon className="size-4" />
116 |         </SelectPrimitive.ItemIndicator>
117 |       </span>
118 |       <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
119 |     </SelectPrimitive.Item>
120 |   )
121 | }
122 | 
123 | function SelectSeparator({
124 |   className,
125 |   ...props
126 | }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
127 |   return (
128 |     <SelectPrimitive.Separator
129 |       data-slot="select-separator"
130 |       className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
131 |       {...props}
132 |     />
133 |   )
134 | }
135 | 
136 | function SelectScrollUpButton({
137 |   className,
138 |   ...props
139 | }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
140 |   return (
141 |     <SelectPrimitive.ScrollUpButton
142 |       data-slot="select-scroll-up-button"
143 |       className={cn(
144 |         "flex cursor-default items-center justify-center py-1",
145 |         className
146 |       )}
147 |       {...props}
148 |     >
149 |       <ChevronUpIcon className="size-4" />
150 |     </SelectPrimitive.ScrollUpButton>
151 |   )
152 | }
153 | 
154 | function SelectScrollDownButton({
155 |   className,
156 |   ...props
157 | }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
158 |   return (
159 |     <SelectPrimitive.ScrollDownButton
160 |       data-slot="select-scroll-down-button"
161 |       className={cn(
162 |         "flex cursor-default items-center justify-center py-1",
163 |         className
164 |       )}
165 |       {...props}
166 |     >
167 |       <ChevronDownIcon className="size-4" />
168 |     </SelectPrimitive.ScrollDownButton>
169 |   )
170 | }
171 | 
172 | export {
173 |   Select,
174 |   SelectContent,
175 |   SelectGroup,
176 |   SelectItem,
177 |   SelectLabel,
178 |   SelectScrollDownButton,
179 |   SelectScrollUpButton,
180 |   SelectSeparator,
181 |   SelectTrigger,
182 |   SelectValue,
183 | }
```

src/components/ui/separator.tsx
```
1 | import * as React from "react"
2 | import * as SeparatorPrimitive from "@radix-ui/react-separator"
3 | 
4 | import { cn } from "@/lib/utils"
5 | 
6 | function Separator({
7 |   className,
8 |   orientation = "horizontal",
9 |   decorative = true,
10 |   ...props
11 | }: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
12 |   return (
13 |     <SeparatorPrimitive.Root
14 |       data-slot="separator-root"
15 |       decorative={decorative}
16 |       orientation={orientation}
17 |       className={cn(
18 |         "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
19 |         className
20 |       )}
21 |       {...props}
22 |     />
23 |   )
24 | }
25 | 
26 | export { Separator }
```

src/components/ui/skeleton.tsx
```
1 | import { cn } from "@/lib/utils"
2 | 
3 | function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
4 |   return (
5 |     <div
6 |       data-slot="skeleton"
7 |       className={cn("bg-accent animate-pulse rounded-md", className)}
8 |       {...props}
9 |     />
10 |   )
11 | }
12 | 
13 | export { Skeleton }
```

src/components/ui/tabs.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as TabsPrimitive from "@radix-ui/react-tabs"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function Tabs({
9 |   className,
10 |   ...props
11 | }: React.ComponentProps<typeof TabsPrimitive.Root>) {
12 |   return (
13 |     <TabsPrimitive.Root
14 |       data-slot="tabs"
15 |       className={cn("flex flex-col gap-2", className)}
16 |       {...props}
17 |     />
18 |   )
19 | }
20 | 
21 | function TabsList({
22 |   className,
23 |   ...props
24 | }: React.ComponentProps<typeof TabsPrimitive.List>) {
25 |   return (
26 |     <TabsPrimitive.List
27 |       data-slot="tabs-list"
28 |       className={cn(
29 |         "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
30 |         className
31 |       )}
32 |       {...props}
33 |     />
34 |   )
35 | }
36 | 
37 | function TabsTrigger({
38 |   className,
39 |   ...props
40 | }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
41 |   return (
42 |     <TabsPrimitive.Trigger
43 |       data-slot="tabs-trigger"
44 |       className={cn(
45 |         "data-[state=active]:bg-background data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/50 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
46 |         className
47 |       )}
48 |       {...props}
49 |     />
50 |   )
51 | }
52 | 
53 | function TabsContent({
54 |   className,
55 |   ...props
56 | }: React.ComponentProps<typeof TabsPrimitive.Content>) {
57 |   return (
58 |     <TabsPrimitive.Content
59 |       data-slot="tabs-content"
60 |       className={cn("flex-1 outline-none", className)}
61 |       {...props}
62 |     />
63 |   )
64 | }
65 | 
66 | export { Tabs, TabsList, TabsTrigger, TabsContent }
```

src/components/ui/tooltip.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as TooltipPrimitive from "@radix-ui/react-tooltip"
5 | 
6 | import { cn } from "@/lib/utils"
7 | 
8 | function TooltipProvider({
9 |   delayDuration = 0,
10 |   ...props
11 | }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
12 |   return (
13 |     <TooltipPrimitive.Provider
14 |       data-slot="tooltip-provider"
15 |       delayDuration={delayDuration}
16 |       {...props}
17 |     />
18 |   )
19 | }
20 | 
21 | function Tooltip({
22 |   ...props
23 | }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
24 |   return (
25 |     <TooltipProvider>
26 |       <TooltipPrimitive.Root data-slot="tooltip" {...props} />
27 |     </TooltipProvider>
28 |   )
29 | }
30 | 
31 | function TooltipTrigger({
32 |   ...props
33 | }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
34 |   return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
35 | }
36 | 
37 | function TooltipContent({
38 |   className,
39 |   sideOffset = 0,
40 |   children,
41 |   ...props
42 | }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
43 |   return (
44 |     <TooltipPrimitive.Portal>
45 |       <TooltipPrimitive.Content
46 |         data-slot="tooltip-content"
47 |         sideOffset={sideOffset}
48 |         className={cn(
49 |           "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance",
50 |           className
51 |         )}
52 |         {...props}
53 |       >
54 |         {children}
55 |         <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
56 |       </TooltipPrimitive.Content>
57 |     </TooltipPrimitive.Portal>
58 |   )
59 | }
60 | 
61 | export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```
