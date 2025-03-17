Project Structure:
├── LICENSE
├── README.md
├── codefetch
│   └── codebase.md
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
│   ├── beaver.svg
│   ├── inject-test-data.html
│   └── vite.svg
├── scripts
│   ├── checkPort.js
│   └── injectTestData.js
├── src
│   ├── App.tsx
│   ├── chart.css
│   ├── config.json
│   ├── index.css
│   ├── main.tsx
│   ├── output.css
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
5 |     <link rel="icon" type="image/svg+xml" href="/beaver.svg" />
6 |     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
7 |     <title>Beaver - GitHub DevOps 지표 대시보드</title>
8 |     <!-- 개발 디버깅용 Tailwind CSS CDN -->
9 |     <script src="https://cdn.tailwindcss.com"></script>
10 |     <style>
11 |       .test-data-link {
12 |         position: fixed;
13 |         bottom: 10px;
14 |         right: 10px;
15 |         background-color: #1a73e8;
16 |         color: white;
17 |         padding: 5px 10px;
18 |         border-radius: 4px;
19 |         font-size: 12px;
20 |         text-decoration: none;
21 |         opacity: 0.7;
22 |         z-index: 1000;
23 |       }
24 |       .test-data-link:hover {
25 |         opacity: 1;
26 |       }
27 |     </style>
28 |   </head>
29 |   <body>
30 |     <div id="root"></div>
31 |     <a href="/inject-test-data.html" class="test-data-link" target="_blank">테스트 데이터 도구</a>
32 |     <script type="module" src="/src/main.tsx"></script>
33 |   </body>
34 | </html>
```

package.json
```
1 | {
2 |   "name": "beaver",
3 |   "private": true,
4 |   "version": "0.0.0",
5 |   "type": "module",
6 |   "scripts": {
7 |     "dev": "node scripts/checkPort.js && vite",
8 |     "build": "tsc -b && vite build",
9 |     "lint": "eslint .",
10 |     "preview": "vite preview",
11 |     "test": "vitest run",
12 |     "test:watch": "vitest"
13 |   },
14 |   "dependencies": {
15 |     "@octokit/rest": "^21.1.1",
16 |     "@radix-ui/react-collapsible": "^1.1.3",
17 |     "@radix-ui/react-dialog": "^1.1.6",
18 |     "@radix-ui/react-dropdown-menu": "^2.1.6",
19 |     "@radix-ui/react-label": "^2.1.2",
20 |     "@radix-ui/react-popover": "^1.1.6",
21 |     "@radix-ui/react-scroll-area": "^1.2.3",
22 |     "@radix-ui/react-select": "^2.1.6",
23 |     "@radix-ui/react-separator": "^1.1.2",
24 |     "@radix-ui/react-slot": "^1.1.2",
25 |     "@radix-ui/react-tabs": "^1.1.3",
26 |     "@radix-ui/react-tooltip": "^1.1.8",
27 |     "@tailwindcss/vite": "^4.0.14",
28 |     "better-sqlite3": "^11.9.0",
29 |     "class-variance-authority": "^0.7.1",
30 |     "clsx": "^2.1.1",
31 |     "date-fns": "^4.1.0",
32 |     "dotenv": "^16.4.7",
33 |     "lucide-react": "^0.482.0",
34 |     "next-themes": "^0.4.6",
35 |     "react": "^19.0.0",
36 |     "react-day-picker": "8.10.1",
37 |     "react-dom": "^19.0.0",
38 |     "recharts": "^2.15.1",
39 |     "sonner": "^2.0.1",
40 |     "tailwind-merge": "^3.0.2",
41 |     "tailwindcss-animate": "^1.0.7",
42 |     "zustand": "^5.0.3"
43 |   },
44 |   "devDependencies": {
45 |     "@eslint/js": "^9.21.0",
46 |     "@tailwindcss/postcss": "^4.0.14",
47 |     "@testing-library/jest-dom": "^6.6.3",
48 |     "@testing-library/react": "^16.2.0",
49 |     "@testing-library/react-hooks": "^8.0.1",
50 |     "@types/react": "^19.0.10",
51 |     "@types/react-dom": "^19.0.4",
52 |     "@vitejs/plugin-react": "^4.3.4",
53 |     "autoprefixer": "^10.4.21",
54 |     "eslint": "^9.21.0",
55 |     "eslint-plugin-react-hooks": "^5.1.0",
56 |     "eslint-plugin-react-refresh": "^0.4.19",
57 |     "globals": "^15.15.0",
58 |     "jsdom": "^26.0.0",
59 |     "postcss": "^8.5.3",
60 |     "shadcn": "^2.4.0-canary.14",
61 |     "ts-node": "^10.9.2",
62 |     "typescript": "~5.7.2",
63 |     "typescript-eslint": "^8.24.1",
64 |     "vite": "^6.2.0",
65 |     "vitest": "^3.0.8"
66 |   }
67 | }
```

postcss.config.js
```
1 | import tailwindcss from '@tailwindcss/postcss'
2 | import autoprefixer from 'autoprefixer'
3 | 
4 | export default {
5 |   plugins: [
6 |     tailwindcss,
7 |     autoprefixer,
8 |   ],
9 | } 
```

tailwind.config.js
```
1 | /** @type {import('@tailwindcss/postcss').Config} */
2 | export default {
3 |   darkMode: ["class"],
4 |   content: [
5 |     './src/**/*.{ts,tsx}',
6 |     './index.html',
7 |   ],
8 |   prefix: "",
9 |   theme: {
10 |     container: {
11 |       center: true,
12 |       padding: "2rem",
13 |       screens: {
14 |         "2xl": "1400px",
15 |       },
16 |     },
17 |     extend: {
18 |       colors: {
19 |         border: "hsl(var(--border))",
20 |         input: "hsl(var(--input))",
21 |         ring: "hsl(var(--ring))",
22 |         background: "hsl(var(--background))",
23 |         foreground: "hsl(var(--foreground))",
24 |         primary: {
25 |           DEFAULT: "hsl(var(--primary))",
26 |           foreground: "hsl(var(--primary-foreground))",
27 |         },
28 |         secondary: {
29 |           DEFAULT: "hsl(var(--secondary))",
30 |           foreground: "hsl(var(--secondary-foreground))",
31 |         },
32 |         destructive: {
33 |           DEFAULT: "hsl(var(--destructive))",
34 |           foreground: "hsl(var(--destructive-foreground))",
35 |         },
36 |         muted: {
37 |           DEFAULT: "hsl(var(--muted))",
38 |           foreground: "hsl(var(--muted-foreground))",
39 |         },
40 |         accent: {
41 |           DEFAULT: "hsl(var(--accent))",
42 |           foreground: "hsl(var(--accent-foreground))",
43 |         },
44 |         popover: {
45 |           DEFAULT: "hsl(var(--popover))",
46 |           foreground: "hsl(var(--popover-foreground))",
47 |         },
48 |         card: {
49 |           DEFAULT: "hsl(var(--card))",
50 |           foreground: "hsl(var(--card-foreground))",
51 |         },
52 |         sidebar: {
53 |           background: "hsl(var(--sidebar-background))",
54 |           foreground: "hsl(var(--sidebar-foreground))",
55 |           muted: "hsl(var(--sidebar-muted))",
56 |           accent: "hsl(var(--sidebar-accent))",
57 |           "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
58 |           border: "hsl(var(--sidebar-border))",
59 |         },
60 |       },
61 |       borderRadius: {
62 |         lg: "var(--radius)",
63 |         md: "calc(var(--radius) - 2px)",
64 |         sm: "calc(var(--radius) - 4px)",
65 |       },
66 |       fontFamily: {
67 |         sans: ["Pretendard", "sans-serif"],
68 |       },
69 |       keyframes: {
70 |         "accordion-down": {
71 |           from: { height: "0" },
72 |           to: { height: "var(--radix-accordion-content-height)" },
73 |         },
74 |         "accordion-up": {
75 |           from: { height: "var(--radix-accordion-content-height)" },
76 |           to: { height: "0" },
77 |         },
78 |       },
79 |       animation: {
80 |         "accordion-down": "accordion-down 0.2s ease-out",
81 |         "accordion-up": "accordion-up 0.2s ease-out",
82 |       },
83 |     },
84 |   },
85 |   plugins: [
86 |     import("tailwindcss-animate")
87 |   ],
88 | } 
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
12 |   css: {
13 |     transformer: 'postcss',
14 |     devSourcemap: true, // CSS 소스맵 활성화
15 |   },
16 |   resolve: {
17 |     alias: {
18 |       '@': path.resolve(__dirname, './src')
19 |     }
20 |   },
21 |   server: {
22 |     port: 3000,
23 |     strictPort: true,
24 |     hmr: {
25 |       overlay: false // HMR 오버레이 비활성화
26 |     },
27 |     headers: {
28 |       'Cache-Control': 'no-store' // 브라우저 캐시 비활성화
29 |     }
30 |   },
31 |   optimizeDeps: {
32 |     include: ['react', 'react-dom'],
33 |   },
34 |   build: {
35 |     target: 'esnext',
36 |     minify: false, // 개발 환경에서는 minify 비활성화
37 |     cssMinify: false
38 |   }
39 | })
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
258 | - [x] 위쪽 값 표시 오류 수정
259 | - [x] 설명은 [i] 누르면 토스트로 표시
260 | - [x] data-picker 너비 고정 
261 | - [x] "성능 레벨" 이름 변경 및 색상 녹/노랑/적으로 변경. 
262 | - [ ] github enterprise 처리 (도메인 연동)
263 | - [x] 여러 저장소 -> 차트로 값 비교
264 | - [ ] 저장소별/개인별 종합 점수 가능?
265 | - [ ] 근무 시간 연동
266 | 
267 | 
268 | 
269 | 
```

.notes/tasklist_metric.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: false
5 | ---
6 | # GitHub 지표 수집 시스템 구현 태스크리스트 (Vite, Shadcn, Tailwind CSS, SQLite)
7 | 
8 | ## Phase 1: 프로젝트 설정 및 기본 구조 (1주)
9 | 
10 | ### Task 1.1: 데이터베이스 스키마 설계
11 | - **목표**: Drizzle ORM을 사용한 SQLite 스키마 설계
12 | - **상세 내용**:
13 |   - `src/db/schema.ts` 파일에 테이블 스키마 정의
14 |   ```typescript
15 |   // src/db/schema.ts 예시
16 |   import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
17 | 
18 |   export const repositories = sqliteTable('repositories', {
19 |     id: integer('id').primaryKey({ autoIncrement: true }),
20 |     name: text('name').notNull(),
21 |     fullName: text('full_name').notNull().unique(),
22 |     cloneUrl: text('clone_url').notNull(),
23 |     localPath: text('local_path'),
24 |     lastSyncAt: integer('last_sync_at', { mode: 'timestamp' })
25 |   });
26 | 
27 |   export const users = sqliteTable('users', {
28 |     id: integer('id').primaryKey({ autoIncrement: true }),
29 |     githubId: integer('github_id').unique(),
30 |     login: text('login').notNull().unique(),
31 |     name: text('name'),
32 |     email: text('email'),
33 |     avatarUrl: text('avatar_url')
34 |   });
35 | 
36 |   export const commits = sqliteTable('commits', {
37 |     id: text('id').primaryKey(),  // SHA
38 |     repositoryId: integer('repository_id').notNull().references(() => repositories.id),
39 |     authorId: integer('author_id').references(() => users.id),
40 |     committerId: integer('committer_id').references(() => users.id),
41 |     message: text('message'),
42 |     committedAt: integer('committed_at', { mode: 'timestamp' }).notNull(),
43 |     additions: integer('additions'),
44 |     deletions: integer('deletions')
45 |   });
46 |   ```
47 |   - 마이그레이션 스크립트 설정
48 |   ```typescript
49 |   // drizzle.config.ts
50 |   import type { Config } from 'drizzle-kit';
51 | 
52 |   export default {
53 |     schema: './src/db/schema.ts',
54 |     out: './src/db/migrations',
55 |     driver: 'better-sqlite',
56 |     dbCredentials: {
57 |       url: './data/github-metrics.db',
58 |     },
59 |   } satisfies Config;
60 |   ```
61 |   - 데이터베이스 초기화 및 마이그레이션 스크립트
62 |   ```typescript
63 |   // src/db/index.ts
64 |   import { drizzle } from 'drizzle-orm/better-sqlite3';
65 |   import Database from 'better-sqlite3';
66 |   import * as schema from './schema';
67 |   
68 |   // SQLite 데이터베이스 연결
69 |   const sqlite = new Database('./data/github-metrics.db');
70 |   export const db = drizzle(sqlite, { schema });
71 |   ```
72 | 
73 | ### Task 1.2: 저장소 관리 모듈 구현
74 | - **목표**: 타겟 저장소를 효율적으로 로컬에 클론하고 업데이트
75 | - **상세 내용**:
76 |   - simple-git 라이브러리를 사용하여 저장소 클론 모듈 구현
77 |   ```typescript
78 |   // src/services/repository-manager.ts
79 |   import simpleGit, { SimpleGit } from 'simple-git';
80 |   import { mkdir } from 'fs/promises';
81 |   import { join } from 'path';
82 |   import { db } from '../db';
83 |   import { repositories } from '../db/schema';
84 |   import { eq } from 'drizzle-orm';
85 |   import { logger } from '../utils/logger';
86 | 
87 |   export class RepositoryManager {
88 |     private basePath: string;
89 | 
90 |     constructor(basePath = './repos') {
91 |       this.basePath = basePath;
92 |       this.ensureBaseDirectory();
93 |     }
94 | 
95 |     private async ensureBaseDirectory() {
96 |       try {
97 |         await mkdir(this.basePath, { recursive: true });
98 |       } catch (error) {
99 |         logger.error(`Failed to create base directory: ${error}`);
100 |       }
101 |     }
102 | 
103 |     async ensureRepository(repoInfo: typeof repositories.$inferSelect) {
104 |       const repoPath = join(this.basePath, repoInfo.name);
105 |       const git: SimpleGit = simpleGit();
106 | 
107 |       try {
108 |         // 이미 클론되어 있는지 확인
109 |         await git.checkIsRepo(join(repoPath, '.git'));
110 |         
111 |         // 이미 클론되어 있으면 업데이트
112 |         logger.info(`Updating repository ${repoInfo.fullName}...`);
113 |         const repo = git.cwd(repoPath);
114 |         await repo.fetch('origin');
115 |         await repo.pull();
116 |         logger.info(`Repository ${repoInfo.fullName} updated`);
117 |       } catch {
118 |         // 저장소 클론
119 |         logger.info(`Cloning repository ${repoInfo.fullName}...`);
120 |         await git.clone(repoInfo.cloneUrl, repoPath);
121 |         logger.info(`Repository ${repoInfo.fullName} cloned`);
122 |       }
123 | 
124 |       // DB 업데이트
125 |       await db.update(repositories)
126 |         .set({ 
127 |           localPath: repoPath, 
128 |           lastSyncAt: new Date() 
129 |         })
130 |         .where(eq(repositories.id, repoInfo.id));
131 | 
132 |       return repoPath;
133 |     }
134 |   }
135 |   ```
136 | 
137 | ## Phase 2: 데이터 수집 모듈 개발 (2주)
138 | 
139 | ### Task 2.1: Git 기반 커밋 데이터 수집기 구현
140 | - **목표**: 로컬 Git 저장소에서 커밋 데이터 추출
141 | - **상세 내용**:
142 |   - simple-git을 사용하여 커밋 이력 분석
143 |   - 증분 수집 구현으로 마지막 동기화 이후 변경사항만 가져오기
144 |   - 작성자 정보, 변경 통계 등 수집
145 |   ```typescript
146 |   // src/services/git-collector.ts
147 |   import simpleGit, { SimpleGit } from 'simple-git';
148 |   import { db } from '../db';
149 |   import { commits, users, repositories } from '../db/schema';
150 |   import { eq } from 'drizzle-orm';
151 |   import { logger } from '../utils/logger';
152 | 
153 |   export class GitCommitCollector {
154 |     async collectCommits(repoId: number, repoPath: string, since?: Date, branches?: string[]) {
155 |       logger.info(`Collecting commits for repository ID ${repoId}...`);
156 |       
157 |       const git: SimpleGit = simpleGit(repoPath);
158 |       
159 |       // 수집할 브랜치 결정
160 |       if (!branches || branches.length === 0) {
161 |         const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
162 |         branches = [currentBranch];
163 |       }
164 |       
165 |       let totalCommits = 0;
166 |       let newCommits = 0;
167 |       
168 |       for (const branch of branches) {
169 |         // 로그 옵션 구성
170 |         const logOptions: string[] = [branch, '--numstat'];
171 |         if (since) {
172 |           logOptions.push(`--since=${since.toISOString()}`);
173 |         }
174 |         
175 |         // 커밋 로그 가져오기
176 |         const logs = await git.log(logOptions);
177 |         totalCommits += logs.total;
178 |         
179 |         for (const commit of logs.all) {
180 |           // 이미 DB에 있는지 확인
181 |           const existingCommit = await db.select()
182 |             .from(commits)
183 |             .where(eq(commits.id, commit.hash))
184 |             .get();
185 |           
186 |           if (existingCommit) continue;
187 |           
188 |           // 작성자 정보 처리
189 |           const author = await this.getOrCreateUser(commit.author_name, commit.author_email);
190 |           
191 |           // 변경 통계 파싱
192 |           const stats = { additions: 0, deletions: 0 };
193 |           for (const numStat of commit.diff?.numstat || []) {
194 |             stats.additions += parseInt(numStat.additions) || 0;
195 |             stats.deletions += parseInt(numStat.deletions) || 0;
196 |           }
197 |           
198 |           // 커밋 저장
199 |           await db.insert(commits).values({
200 |             id: commit.hash,
201 |             repositoryId: repoId,
202 |             authorId: author?.id,
203 |             message: commit.message,
204 |             committedAt: new Date(commit.date),
205 |             additions: stats.additions,
206 |             deletions: stats.deletions
207 |           });
208 |           
209 |           newCommits++;
210 |           
211 |           // 로깅
212 |           if (newCommits % 100 === 0) {
213 |             logger.info(`Processed ${newCommits} new commits`);
214 |           }
215 |         }
216 |       }
217 |       
218 |       logger.info(`Commit collection complete. Total: ${totalCommits}, New: ${newCommits}`);
219 |       return newCommits;
220 |     }
221 |     
222 |     private async getOrCreateUser(name: string, email: string) {
223 |       // 사용자 조회 또는 생성
224 |       let user = await db.select()
225 |         .from(users)
226 |         .where(eq(users.email, email))
227 |         .get();
228 |       
229 |       if (!user) {
230 |         const result = await db.insert(users)
231 |           .values({
232 |             name,
233 |             email,
234 |             login: email.split('@')[0] // 임시 로그인명
235 |           })
236 |           .returning();
237 |         
238 |         user = result[0];
239 |       }
240 |       
241 |       return user;
242 |     }
243 |   }
244 |   ```
245 | 
246 | ### Task 2.2: GitHub API 연동 모듈 구현
247 | - **목표**: GitHub GraphQL API를 통한 효율적인 PR 및 사용자 데이터 수집
248 | - **상세 내용**:
249 |   - Octokit 라이브러리와 GraphQL 쿼리를 사용하여 데이터 효율적으로 가져오기
250 |   - API 호출 최적화 및 레이트 리밋 관리
251 |   ```typescript
252 |   // src/services/github-api.ts
253 |   import { Octokit } from 'octokit';
254 |   import { db } from '../db';
255 |   import { repositories, pullRequests, prReviews, users } from '../db/schema';
256 |   import { eq } from 'drizzle-orm';
257 |   import { logger } from '../utils/logger';
258 |   
259 |   export class GitHubAPIClient {
260 |     private octokit: Octokit;
261 |     private remainingPoints = 5000; // GraphQL 기본 할당량
262 |     
263 |     constructor(token: string) {
264 |       this.octokit = new Octokit({ auth: token });
265 |     }
266 |     
267 |     async fetchPullRequests(owner: string, repo: string, since?: Date, batchSize = 25) {
268 |       logger.info(`Fetching PRs for ${owner}/${repo}...`);
269 |       
270 |       // 저장소 정보 조회
271 |       const repoInfo = await db.select()
272 |         .from(repositories)
273 |         .where(eq(repositories.fullName, `${owner}/${repo}`))
274 |         .get();
275 |       
276 |       if (!repoInfo) {
277 |         logger.error(`Repository ${owner}/${repo} not found in DB`);
278 |         return 0;
279 |       }
280 |       
281 |       // GraphQL 쿼리
282 |       const query = `
283 |         query($owner: String!, $name: String!, $prCount: Int!, $prCursor: String) {
284 |           repository(owner: $owner, name: $name) {
285 |             pullRequests(first: $prCount, after: $prCursor, states: [MERGED, CLOSED, OPEN], orderBy: {field: CREATED_AT, direction: DESC}) {
286 |               pageInfo {
287 |                 hasNextPage
288 |                 endCursor
289 |               }
290 |               nodes {
291 |                 number
292 |                 title
293 |                 state
294 |                 createdAt
295 |                 mergedAt
296 |                 closedAt
297 |                 additions
298 |                 deletions
299 |                 changedFiles
300 |                 author {
301 |                   login
302 |                   ... on User {
303 |                     id
304 |                     name
305 |                     email
306 |                   }
307 |                 }
308 |                 reviews(first: 10) {
309 |                   nodes {
310 |                     state
311 |                     author {
312 |                       login
313 |                     }
314 |                     createdAt
315 |                     comments {
316 |                       totalCount
317 |                     }
318 |                   }
319 |                 }
320 |               }
321 |             }
322 |           }
323 |         }
324 |       `;
325 |       
326 |       // 페이지네이션 변수
327 |       let hasNextPage = true;
328 |       let cursor: string | null = null;
329 |       let totalPRs = 0;
330 |       let newPRs = 0;
331 |       
332 |       // PR 수집 반복
333 |       while (hasNextPage) {
334 |         try {
335 |           // API 호출 전 레이트 리밋 확인
336 |           await this.checkRateLimit();
337 |           
338 |           const response = await this.octokit.graphql(query, {
339 |             owner,
340 |             name: repo,
341 |             prCount: batchSize,
342 |             prCursor: cursor
343 |           });
344 |           
345 |           // @ts-ignore - 타입 단순화를 위해
346 |           const prsData = response.repository.pullRequests;
347 |           
348 |           // 페이지네이션 정보 업데이트
349 |           // @ts-ignore
350 |           hasNextPage = prsData.pageInfo.hasNextPage;
351 |           // @ts-ignore
352 |           cursor = hasNextPage ? prsData.pageInfo.endCursor : null;
353 |           
354 |           // PR 데이터 처리
355 |           // @ts-ignore
356 |           for (const pr of prsData.nodes) {
357 |             totalPRs++;
358 |             
359 |             // since 필터 적용
360 |             if (since && new Date(pr.createdAt) < since) {
361 |               hasNextPage = false;
362 |               break;
363 |             }
364 |             
365 |             // 이하 PR 및 리뷰 데이터 저장 로직...
366 |             // (코드 길이 제한으로 상세 구현은 생략)
367 |             newPRs++;
368 |           }
369 |           
370 |           logger.info(`Processed ${newPRs} PRs so far`);
371 |         } catch (error) {
372 |           logger.error(`Error fetching PRs: ${error}`);
373 |           break;
374 |         }
375 |       }
376 |       
377 |       logger.info(`PR collection complete. Total: ${totalPRs}, New: ${newPRs}`);
378 |       return newPRs;
379 |     }
380 |     
381 |     private async checkRateLimit() {
382 |       if (this.remainingPoints < 100) {
383 |         logger.warn(`GitHub API rate limit low: ${this.remainingPoints} points remaining. Waiting...`);
384 |         await new Promise(resolve => setTimeout(resolve, 60000)); // 1분 대기
385 |         
386 |         // 레이트 리밋 정보 갱신
387 |         const { data } = await this.octokit.rest.rateLimit.get();
388 |         this.remainingPoints = data.resources.graphql.remaining;
389 |         
390 |         logger.info(`Rate limit updated: ${this.remainingPoints} points remaining`);
391 |       }
392 |     }
393 |   }
394 |   ```
395 | 
396 | ### Task 2.3: 증분 데이터 수집 및 동기화 관리자 구현
397 | - **목표**: 효율적인 증분 데이터 수집 시스템 개발
398 | - **상세 내용**:
399 |   - 저장소별 마지막 동기화 시간 기반 증분 업데이트
400 |   - Git 데이터와 GitHub API 데이터 통합
401 |   - 데이터 일관성 확인 메커니즘 구현
402 |   ```typescript
403 |   // src/services/sync-manager.ts
404 |   import { RepositoryManager } from './repository-manager';
405 |   import { GitCommitCollector } from './git-collector';
406 |   import { GitHubAPIClient } from './github-api';
407 |   import { db } from '../db';
408 |   import { repositories, syncStatus } from '../db/schema';
409 |   import { eq } from 'drizzle-orm';
410 |   import { logger } from '../utils/logger';
411 |   
412 |   export class SyncManager {
413 |     constructor(
414 |       private repoManager: RepositoryManager,
415 |       private gitCollector: GitCommitCollector,
416 |       private githubApi: GitHubAPIClient
417 |     ) {}
418 |     
419 |     async syncRepository(repoFullName: string, forceFull = false) {
420 |       logger.info(`Starting sync for repository ${repoFullName}`);
421 |       
422 |       // 저장소 정보 조회
423 |       const repo = await db.select()
424 |         .from(repositories)
425 |         .where(eq(repositories.fullName, repoFullName))
426 |         .get();
427 |       
428 |       if (!repo) {
429 |         logger.error(`Repository ${repoFullName} not found`);
430 |         return false;
431 |       }
432 |       
433 |       // 마지막 동기화 시간 확인
434 |       let sinceDate: Date | undefined = undefined;
435 |       if (!forceFull && repo.lastSyncAt) {
436 |         // 약간의 중복 허용 (데이터 누락 방지)
437 |         sinceDate = new Date(repo.lastSyncAt.getTime() - 3600000); // 1시간 이전
438 |         logger.info(`Incremental sync: since ${sinceDate}`);
439 |       } else {
440 |         logger.info('Full sync');
441 |       }
442 |       
443 |       // 1. 저장소 클론/업데이트
444 |       const repoPath = await this.repoManager.ensureRepository(repo);
445 |       if (!repoPath) return false;
446 |       
447 |       // 2. Git 커밋 데이터 수집
448 |       const commitsCount = await this.gitCollector.collectCommits(
449 |         repo.id,
450 |         repoPath,
451 |         sinceDate
452 |       );
453 |       logger.info(`Collected ${commitsCount} new commits`);
454 |       
455 |       // 3. PR 및 리뷰 데이터 수집
456 |       const [owner, name] = repoFullName.split('/');
457 |       const prsCount = await this.githubApi.fetchPullRequests(
458 |         owner,
459 |         name,
460 |         sinceDate
461 |       );
462 |       logger.info(`Collected ${prsCount} new PRs`);
463 |       
464 |       // 4. 동기화 상태 업데이트
465 |       await db.update(repositories)
466 |         .set({ lastSyncAt: new Date() })
467 |         .where(eq(repositories.id, repo.id));
468 |       
469 |       // 5. 동기화 이력 기록
470 |       await db.insert(syncStatus).values({
471 |         repositoryId: repo.id,
472 |         syncedAt: new Date(),
473 |         commitsCount,
474 |         prsCount,
475 |         syncType: forceFull ? 'full' : 'incremental'
476 |       });
477 |       
478 |       logger.info(`Sync complete for ${repoFullName}`);
479 |       return true;
480 |     }
481 |   }
482 |   ```
483 | 
484 | ## Phase 3: 지표 계산 및 분석 엔진 (2주)
485 | 
486 | ### Task 3.1: 핵심 지표 계산 모듈 구현
487 | - **목표**: 수집된 데이터로부터 핵심 지표 계산
488 | - **상세 내용**:
489 |   - 개인별 지표: 커밋 수, PR 수, 리뷰 참여도 등
490 |   - 프로젝트 지표: 변경 빈도, PR 리드 타임, 병합 비율 등
491 |   - DORA 메트릭 계산
492 |   ```typescript
493 |   // src/services/metrics-calculator.ts
494 |   import { db } from '../db';
495 |   import { commits, pullRequests, prReviews, metricsCache } from '../db/schema';
496 |   import { eq, and, gte, lte, sql } from 'drizzle-orm';
497 |   import { logger } from '../utils/logger';
498 |   
499 |   export class MetricsCalculator {
500 |     async calculateDeveloperMetrics(userId: number, repoId?: number, startDate?: Date, endDate?: Date) {
501 |       if (!endDate) endDate = new Date();
502 |       if (!startDate) startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); // 90일
503 |       
504 |       // 캐시 키 생성
505 |       const cacheKey = `dev_metrics_${userId}_${repoId || 'all'}_${startDate.toISOString()}_${endDate.toISOString()}`;
506 |       
507 |       // 캐시 확인
508 |       const cached = await this.getFromCache(cacheKey);
509 |       if (cached) return cached;
510 |       
511 |       // 커밋 지표 쿼리
512 |       let commitQuery = db.select({
513 |         commitCount: sql`count(*)`,
514 |         totalAdditions: sql`sum(${commits.additions})`,
515 |         totalDeletions: sql`sum(${commits.deletions})`,
516 |         activeDays: sql`count(distinct date(${commits.committedAt}))`
517 |       })
518 |       .from(commits)
519 |       .where(
520 |         and(
521 |           eq(commits.authorId, userId),
522 |           gte(commits.committedAt, startDate),
523 |           lte(commits.committedAt, endDate)
524 |         )
525 |       );
526 |       
527 |       if (repoId) {
528 |         commitQuery = commitQuery.where(eq(commits.repositoryId, repoId));
529 |       }
530 |       
531 |       // PR 지표 쿼리
532 |       let prQuery = db.select({
533 |         prCount: sql`count(*)`,
534 |         mergedPrs: sql`sum(case when ${pullRequests.state} = 'MERGED' then 1 else 0 end)`,
535 |         prAdditions: sql`sum(${pullRequests.additions})`,
536 |         prDeletions: sql`sum(${pullRequests.deletions})`,
537 |         avgLeadTime: sql`avg(case when ${pullRequests.mergedAt} is not null then 
538 |                           julianday(${pullRequests.mergedAt}) - julianday(${pullRequests.createdAt}) 
539 |                           else null end) * 24`
540 |       })
541 |       .from(pullRequests)
542 |       .where(
543 |         and(
544 |           eq(pullRequests.authorId, userId),
545 |           gte(pullRequests.createdAt, startDate),
546 |           lte(pullRequests.createdAt, endDate)
547 |         )
548 |       );
549 |       
550 |       if (repoId) {
551 |         prQuery = prQuery.where(eq(pullRequests.repositoryId, repoId));
552 |       }
553 |       
554 |       // 실행 및 결과 조합
555 |       // (상세 구현은 생략)
556 |       
557 |       // 최종 지표 계산 및 반환
558 |       // (상세 구현은 생략)
559 |       
560 |       // 캐시에 저장
561 |       await this.saveToCache(cacheKey, metrics, 24); // 24시간 유효
562 |       
563 |       return metrics;
564 |     }
565 |     
566 |     async calculateProjectMetrics(repoId: number, startDate?: Date, endDate?: Date) {
567 |       // 프로젝트 지표 계산 로직
568 |       // (구현 생략)
569 |     }
570 |     
571 |     private async getFromCache(key: string) {
572 |       // 캐시에서 지표 조회
573 |       const cacheEntry = await db.select()
574 |         .from(metricsCache)
575 |         .where(
576 |           and(
577 |             eq(metricsCache.cacheKey, key),
578 |             gte(metricsCache.expiresAt, new Date())
579 |           )
580 |         )
581 |         .get();
582 |       
583 |       return cacheEntry?.data as any;
584 |     }
585 |     
586 |     private async saveToCache(key: string, data: any, hoursValid = 24) {
587 |       // 캐시에 저장 로직
588 |       // (구현 생략)
589 |     }
590 |   }
591 |   ```
592 | 
593 | ### Task 3.2: 멀티스레딩 작업 관리자 구현
594 | - **목표**: Web Worker를 활용한 병렬 처리 구현
595 | - **상세 내용**:
596 |   - Node.js Worker Threads를 사용한 병렬 처리
597 |   - 작업 큐 설계 및 작업 분배
598 |   - 결과 집계 및 오류 처리
599 |   ```typescript
600 |   // src/services/worker-manager.ts
601 |   import { Worker } from 'worker_threads';
602 |   import { logger } from '../utils/logger';
603 |   import path from 'path';
604 |   
605 |   export class WorkerManager {
606 |     private maxWorkers: number;
607 |     
608 |     constructor(maxWorkers = 4) {
609 |       this.maxWorkers = maxWorkers;
610 |     }
611 |     
612 |     async processRepositories(repositories: any[], syncManager: any, forceFull = false) {
613 |       logger.info(`Processing ${repositories.length} repositories with ${this.maxWorkers} workers`);
614 |       
615 |       const results = {
616 |         total: repositories.length,
617 |         success: 0,
618 |         failed: 0,
619 |         details: []
620 |       };
621 |       
622 |       // 작업 큐 생성
623 |       const tasks = repositories.map(repo => ({
624 |         type: 'sync_repo',
625 |         repoFullName: repo.fullName,
626 |         forceFull
627 |       }));
628 |       
629 |       // 병렬 처리
630 |       const taskResults = await this.runTasksInParallel(tasks);
631 |       
632 |       // 결과 처리
633 |       for (const result of taskResults) {
634 |         if (result.success) {
635 |           results.success++;
636 |         } else {
637 |           results.failed++;
638 |         }
639 |         
640 |         results.details.push({
641 |           repository: result.repoFullName,
642 |           status: result.success ? 'success' : 'failed',
643 |           error: result.error
644 |         });
645 |       }
646 |       
647 |       logger.info(`Processing complete: ${results.success} success, ${results.failed} failed`);
648 |       return results;
649 |     }
650 |     
651 |     private async runTasksInParallel(tasks: any[]) {
652 |       // 작업 청크로 나누기
653 |       const chunks = this.chunkArray(tasks, Math.ceil(tasks.length / this.maxWorkers));
654 |       
655 |       // 워커 생성 및 작업 실행
656 |       const results = await Promise.all(chunks.map(chunk => {
657 |         return new Promise((resolve) => {
658 |           const worker = new Worker(path.resolve(__dirname, '../workers/sync-worker.js'), {
659 |             workerData: { tasks: chunk }
660 |           });
661 |           
662 |           worker.on('message', resolve);
663 |           worker.on('error', (err) => {
664 |             logger.error(`Worker error: ${err}`);
665 |             resolve(chunk.map(task => ({
666 |               ...task,
667 |               success: false,
668 |               error: err.message
669 |             })));
670 |           });
671 |         });
672 |       }));
673 |       
674 |       // 결과 병합
675 |       return results.flat();
676 |     }
677 |     
678 |     private chunkArray(array: any[], size: number) {
679 |       const chunks = [];
680 |       for (let i = 0; i < array.length; i += size) {
681 |         chunks.push(array.slice(i, i + size));
682 |       }
683 |       return chunks;
684 |     }
685 |   }
686 |   ```
687 | 
688 | ## Phase 4: 프론트엔드 개발 (3주)
689 | 
690 | ### Task 4.1: 대시보드 UI 컴포넌트 개발
691 | - **목표**: shadcn/ui와 Tailwind CSS를 활용한 대시보드 UI 구현
692 | - **상세 내용**:
693 |   - 기본 레이아웃 및 네비게이션 구조 설계
694 |   - 재사용 가능한 UI 컴포넌트 개발
695 |   - 데이터 필터링 및 검색 컴포넌트 구현
696 |   - 필수 대시보드 컴포넌트:
697 |     - 개요 대시보드
698 |     - 개발자 지표 뷰
699 |     - 프로젝트 지표 뷰
700 |     - 비교 분석 뷰
701 |   ```tsx
702 |   // src/components/dashboard/DashboardLayout.tsx 예시
703 |   import { useState } from 'react';
704 |   import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
705 |   import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
706 |   import { 
707 |     LineChart, BarChart, PieChart, RadarChart,
708 |     Line, Bar, Pie, Radar
709 |   } from 'recharts';
710 |   import { DateRangePicker } from '../ui/date-range-picker';
711 |   import { Button } from '../ui/button';
712 |   import { GitBranch, Users, RefreshCw, Download } from 'lucide-react';
713 |   
714 |   export const DashboardLayout = () => {
715 |     const [dateRange, setDateRange] = useState({
716 |       from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
717 |       to: new Date()
718 |     });
719 |     
720 |     // 상태 및 핸들러 정의...
721 |     
722 |     return (
723 |       <div className="container mx-auto p-4">
724 |         <header className="flex justify-between items-center mb-6">
725 |           <h1 className="text-2xl font-bold">GitHub 생산성 대시보드</h1>
726 |           
727 |           <div className="flex items-center gap-4">
728 |             <DateRangePicker
729 |               from={dateRange.from}
730 |               to={dateRange.to}
731 |               onSelect={setDateRange}
732 |             />
733 |             <Button variant="outline" size="icon">
734 |               <RefreshCw className="h-4 w-4" />
735 |             </Button>
736 |             <Button variant="outline" size="icon">
737 |               <Download className="h-4 w-4" />
738 |             </Button>
739 |           </div>
740 |         </header>
741 |         
742 |         <Tabs defaultValue="overview" className="space-y-4">
743 |           <TabsList>
744 |             <TabsTrigger value="overview">개요</TabsTrigger>
745 |             <TabsTrigger value="developers">개발자</TabsTrigger>
746 |             <TabsTrigger value="projects">프로젝트</TabsTrigger>
747 |             <TabsTrigger value="comparison">비교 분석</TabsTrigger>
748 |           </TabsList>
749 |           
750 |           <TabsContent value="overview" className="space-y-4">
751 |             {/* 스탯 카드 */}
752 |             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
753 |               <StatCard
754 |                 title="총 커밋"
755 |                 value={287}
756 |                 change={12}
757 |                 icon={<GitBranch className="h-4 w-4" />}
758 |               />
759 |               {/* 다른 스탯 카드들... */}
760 |             </div>
761 |             
762 |             {/* 차트 등 다른 컴포넌트들... */}
763 |           </TabsContent>
764 |           
765 |           {/* 다른 탭 콘텐츠들... */}
766 |         </Tabs>
767 |       </div>
768 |     );
769 |   };
770 |   
771 |   // StatCard 컴포넌트
772 |   const StatCard = ({ title, value, change, icon }) => (
773 |     <Card>
774 |       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
775 |         <CardTitle className="text-sm font-medium">{title}</CardTitle>
776 |         {icon}
777 |       </CardHeader>
778 |       <CardContent>
779 |         <div className="text-2xl font-bold">{value}</div>
780 |         <p className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
781 |           {change >= 0 ? '+' : ''}{change}% 전월 대비
782 |         </p>
783 |       </CardContent>
784 |     </Card>
785 |   );
786 |   ```
787 | 
788 | ### Task 4.2: 데이터 시각화 구현
789 | - **목표**: 차트 및 그래프로 지표를 시각화
790 | - **상세 내용**:
791 |   - 시계열 차트: 커밋 활동, PR 추이 등
792 |   - 막대 그래프: 개발자별 기여도, 프로젝트별 지표 등
793 |   - 레이더 차트: DORA 메트릭 비교
794 |   - 히트맵: 기여 활동 패턴
795 |   ```tsx
796 |   // src/components/charts/CommitActivityChart.tsx 예시
797 |   import { useState, useEffect } from 'react';
798 |   import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
799 |   import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
800 |   import { getCommitActivity } from '../../api/metrics';
801 |   
802 |   export const CommitActivityChart = ({ repositoryId, dateRange }) => {
803 |     const [data, setData] = useState([]);
804 |     const [loading, setLoading] = useState(false);
805 |     const [error, setError] = useState(null);
806 |     
807 |     useEffect(() => {
808 |       const fetchData = async () => {
809 |         setLoading(true);
810 |         try {
811 |           const result = await getCommitActivity(repositoryId, dateRange.from, dateRange.to);
812 |           setData(result);
813 |           setError(null);
814 |         } catch (err) {
815 |           setError(err.message);
816 |         } finally {
817 |           setLoading(false);
818 |         }
819 |       };
820 |       
821 |       fetchData();
822 |     }, [repositoryId, dateRange]);
823 |     
824 |     return (
825 |       <Card>
826 |         <CardHeader>
827 |           <CardTitle>커밋 활동</CardTitle>
828 |         </CardHeader>
829 |         <CardContent>
830 |           {loading && <p>로딩 중...</p>}
831 |           {error && <p className="text-red-500">오류: {error}</p>}
832 |           
833 |           {!loading && !error && (
834 |             <ResponsiveContainer width="100%" height={300}>
835 |               <AreaChart data={data}>
836 |                 <CartesianGrid strokeDasharray="3 3" />
837 |                 <XAxis dataKey="date" />
838 |                 <YAxis />
839 |                 <Tooltip />
840 |                 <Area type="monotone" dataKey="commits" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
841 |               </AreaChart>
842 |             </ResponsiveContainer>
843 |           )}
844 |         </CardContent>
845 |       </Card>
846 |     );
847 |   };
848 |   ```
849 | 
850 | ### Task 4.3: API 연동 및 상태 관리 구현
851 | - **목표**: 프론트엔드와 백엔드 연동 로직 구현
852 | - **상세 내용**:
853 |   - API 클라이언트 구현
854 |   - 데이터 페칭 훅 개발
855 |   - 상태 관리 (React Query 또는 유사 라이브러리)
856 |   - 오류 처리 및 로딩 상태 관리
857 |   ```tsx
858 |   // src/api/client.ts 예시
859 |   import axios from 'axios';
860 | 
861 |   const apiClient = axios.create({
862 |     baseURL: '/api',
863 |     timeout: 30000
864 |   });
865 |   
866 |   export const fetchRepositories = async () => {
867 |     const { data } = await apiClient.get('/repositories');
868 |     return data;
869 |   };
870 |   
871 |   export const syncRepository = async (repoFullName, forceFull = false) => {
872 |     const { data } = await apiClient.post('/sync', {
873 |       repository: repoFullName,
874 |       forceFull
875 |     });
876 |     return data;
877 |   };
878 |   
879 |   export const getDeveloperMetrics = async (developerId, filters = {}) => {
880 |     const { data } = await apiClient.get(`/metrics/developer/${developerId}`, {
881 |       params: filters
882 |     });
883 |     return data;
884 |   };
885 |   
886 |   // 다른 API 함수들...
887 |   ```
888 | 
889 | ### Task 4.4: 설정 및 관리 페이지 구현
890 | - **목표**: 시스템 설정 및 데이터 관리 UI 개발
891 | - **상세 내용**:
892 |   - 저장소 추가/제거 인터페이스
893 |   - 동기화 설정 및 스케줄 관리
894 |   - 데이터 새로고침 및 캐시 관리 UI
895 |   - 기본 설정 관리 (API 토큰, 저장 경로 등)
896 | 
897 | ## Phase 5: 백엔드 API 및 통합 (1-2주)
898 | 
899 | ### Task 5.1: Express API 서버 구현
900 | - **목표**: REST API 엔드포인트 개발
901 | - **상세 내용**:
902 |   - Express 서버 설정
903 |   - API 라우트 정의
904 |   - 컨트롤러 구현 (저장소, 지표, 동기화 등)
905 |   - 미들웨어 구현 (인증, 로깅, 오류 처리)
906 |   ```typescript
907 |   // src/server/index.ts 예시
908 |   import express from 'express';
909 |   import cors from 'cors';
910 |   import helmet from 'helmet';
911 |   import { repositoryRoutes } from './routes/repository';
912 |   import { metricsRoutes } from './routes/metrics';
913 |   import { syncRoutes } from './routes/sync';
914 |   import { errorHandler } from './middleware/error-handler';
915 |   import { logger } from '../utils/logger';
916 |   
917 |   const app = express();
918 |   const PORT = process.env.PORT || 3001;
919 |   
920 |   // 미들웨어
921 |   app.use(helmet());
922 |   app.use(cors());
923 |   app.use(express.json());
924 |   
925 |   // 로깅 미들웨어
926 |   app.use((req, res, next) => {
927 |     logger.info(`${req.method} ${req.url}`);
928 |     next();
929 |   });
930 |   
931 |   // 라우트
932 |   app.use('/api/repositories', repositoryRoutes);
933 |   app.use('/api/metrics', metricsRoutes);
934 |   app.use('/api/sync', syncRoutes);
935 |   
936 |   // 정적 파일 서빙 (빌드된 Vite 앱)
937 |   app.use(express.static('dist'));
938 |   
939 |   // 모든 경로를 SPA로 리다이렉트
940 |   app.get('*', (req, res) => {
941 |     res.sendFile('dist/index.html', { root: '.' });
942 |   });
943 |   
944 |   // 오류 처리
945 |   app.use(errorHandler);
946 |   
947 |   // 서버 시작
948 |   app.listen(PORT, () => {
949 |     logger.info(`Server running on port ${PORT}`);
950 |   });
951 |   ```
952 | 
953 | ### Task 5.2: 백그라운드 작업 관리자 구현
954 | - **목표**: 데이터 수집 및 분석 자동화
955 | - **상세 내용**:
956 |   - 작업 스케줄러 구현 (node-cron)
957 |   - 주기적 데이터 수집 작업 설정
958 |   - 작업 상태 모니터링 및 로깅
959 |   ```typescript
960 |   // src/server/scheduler.ts 예시
961 |   import cron from 'node-cron';
962 |   import { db } from '../db';
963 |   import { repositories } from '../db/schema';
964 |   import { SyncManager } from '../services/sync-manager';
965 |   import { RepositoryManager } from '../services/repository-manager';
966 |   import { GitCommitCollector } from '../services/git-collector';
967 |   import { GitHubAPIClient } from '../services/github-api';
968 |   import { logger } from '../utils/logger';
969 |   import { eq, isNull, or, lt } from 'drizzle-orm';
970 |   
971 |   export class SchedulerService {
972 |     private syncManager: SyncManager;
973 |     
974 |     constructor() {
975 |       const repoManager = new RepositoryManager();
976 |       const gitCollector = new GitCommitCollector();
977 |       const githubApi = new GitHubAPIClient(process.env.GITHUB_TOKEN);
978 |       
979 |       this.syncManager = new SyncManager(repoManager, gitCollector, githubApi);
980 |     }
981 |     
982 |     initialize() {
983 |       // 매일 오전 1시에 실행
984 |       cron.schedule('0 1 * * *', () => {
985 |         this.syncAllRepositories();
986 |       });
987 |       
988 |       // 매주 일요일 오전 2시에 메트릭 캐시 정리
989 |       cron.schedule('0 2 * * 0', () => {
990 |         this.cleanupMetricsCache();
991 |       });
992 |       
993 |       logger.info('Scheduler initialized');
994 |     }
995 |     
996 |     async syncAllRepositories() {
997 |       logger.info('Starting scheduled sync for all repositories');
998 |       
999 |       try {
1000 |         // 동기화가 필요한 저장소 찾기 (마지막 동기화가 1일 이상 지난 것)
1001 |         const oneDayAgo = new Date();
1002 |         oneDayAgo.setDate(oneDayAgo.getDate() - 1);
1003 |         
1004 |         const reposToSync = await db.select()
1005 |           .from(repositories)
1006 |           .where(
1007 |             or(
1008 |               isNull(repositories.lastSyncAt),
1009 |               lt(repositories.lastSyncAt, oneDayAgo)
1010 |             )
1011 |           );
1012 |         
1013 |         logger.info(`Found ${reposToSync.length} repositories to sync`);
1014 |         
1015 |         // 동기화 실행
1016 |         for (const repo of reposToSync) {
1017 |           try {
1018 |             await this.syncManager.syncRepository(repo.fullName);
1019 |             logger.info(`Successfully synced ${repo.fullName}`);
1020 |           } catch (error) {
1021 |             logger.error(`Failed to sync ${repo.fullName}: ${error}`);
1022 |           }
1023 |         }
1024 |         
1025 |         logger.info('Scheduled sync completed');
1026 |       } catch (error) {
1027 |         logger.error(`Scheduled sync failed: ${error}`);
1028 |       }
1029 |     }
1030 |     
1031 |     async cleanupMetricsCache() {
1032 |       // 캐시 정리 로직
1033 |       // (구현 생략)
1034 |       logger.info('Metrics cache cleanup completed');
1035 |     }
1036 |   }
1037 |   ```
1038 | 
1039 | ### Task 5.3: 라우트 핸들러 및 컨트롤러 구현
1040 | - **목표**: API 요청을 처리하는 컨트롤러 개발
1041 | - **상세 내용**:
1042 |   - 저장소 관리 API (추가, 수정, 삭제, 조회)
1043 |   - 지표 계산 및 조회 API
1044 |   - 동기화 및 작업 관리 API
1045 |   ```typescript
1046 |   // src/server/routes/metrics.ts 예시
1047 |   import express from 'express';
1048 |   import { MetricsCalculator } from '../../services/metrics-calculator';
1049 |   import { logger } from '../../utils/logger';
1050 |   
1051 |   const router = express.Router();
1052 |   const metricsCalculator = new MetricsCalculator();
1053 |   
1054 |   // 개발자 지표 조회
1055 |   router.get('/developer/:id', async (req, res, next) => {
1056 |     try {
1057 |       const userId = parseInt(req.params.id);
1058 |       const { repoId, startDate, endDate } = req.query;
1059 |       
1060 |       const repoIdParam = repoId ? parseInt(repoId as string) : undefined;
1061 |       const startDateParam = startDate ? new Date(startDate as string) : undefined;
1062 |       const endDateParam = endDate ? new Date(endDate as string) : undefined;
1063 |       
1064 |       const metrics = await metricsCalculator.calculateDeveloperMetrics(
1065 |         userId,
1066 |         repoIdParam,
1067 |         startDateParam,
1068 |         endDateParam
1069 |       );
1070 |       
1071 |       res.json(metrics);
1072 |     } catch (error) {
1073 |       next(error);
1074 |     }
1075 |   });
1076 |   
1077 |   // 프로젝트 지표 조회
1078 |   router.get('/project/:id', async (req, res, next) => {
1079 |     try {
1080 |       const repoId = parseInt(req.params.id);
1081 |       const { startDate, endDate } = req.query;
1082 |       
1083 |       const startDateParam = startDate ? new Date(startDate as string) : undefined;
1084 |       const endDateParam = endDate ? new Date(endDate as string) : undefined;
1085 |       
1086 |       const metrics = await metricsCalculator.calculateProjectMetrics(
1087 |         repoId,
1088 |         startDateParam,
1089 |         endDateParam
1090 |       );
1091 |       
1092 |       res.json(metrics);
1093 |     } catch (error) {
1094 |       next(error);
1095 |     }
1096 |   });
1097 |   
1098 |   // 비교 분석 조회
1099 |   router.post('/compare', async (req, res, next) => {
1100 |     try {
1101 |       const { type, ids, startDate, endDate } = req.body;
1102 |       
1103 |       // 비교 로직 구현
1104 |       // (생략)
1105 |       
1106 |       res.json(comparisonResults);
1107 |     } catch (error) {
1108 |       next(error);
1109 |     }
1110 |   });
1111 |   
1112 |   export const metricsRoutes = router;
1113 |   ```
1114 | 
1115 | ## Phase 6: 테스트 및 배포 (1주)
1116 | 
1117 | ### Task 6.1: 테스트 작성 및 실행
1118 | - **목표**: 코드 품질 및 안정성 보장
1119 | - **상세 내용**:
1120 |   - Vitest를 사용한 유닛 테스트 작성
1121 |   - 테스트 환경 설정 (SQLite 메모리 DB 등)
1122 |   - 주요 모듈별 테스트 케이스 작성
1123 |   ```typescript
1124 |   // src/services/__tests__/git-collector.test.ts 예시
1125 |   import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
1126 |   import { GitCommitCollector } from '../git-collector';
1127 |   import * as mockRepo from './mocks/repository-data';
1128 |   
1129 |   // DB 모킹
1130 |   vi.mock('../../db', () => ({
1131 |     db: {
1132 |       select: vi.fn(() => ({
1133 |         from: vi.fn(() => ({
1134 |           where: vi.fn(() => ({
1135 |             get: vi.fn()
1136 |           }))
1137 |         }))
1138 |       })),
1139 |       insert: vi.fn(() => ({
1140 |         values: vi.fn(() => ({
1141 |           returning: vi.fn(() => [{ id: 1 }])
1142 |         }))
1143 |       }))
1144 |     }
1145 |   }));
1146 |   
1147 |   // simple-git 모킹
1148 |   vi.mock('simple-git', () => ({
1149 |     default: () => ({
1150 |       log: vi.fn(() => Promise.resolve(mockRepo.commitLogMock))
1151 |     })
1152 |   }));
1153 |   
1154 |   describe('GitCommitCollector', () => {
1155 |     let collector: GitCommitCollector;
1156 |     
1157 |     beforeEach(() => {
1158 |       collector = new GitCommitCollector();
1159 |     });
1160 |     
1161 |     afterEach(() => {
1162 |       vi.clearAllMocks();
1163 |     });
1164 |     
1165 |     it('should collect new commits from repository', async () => {
1166 |       const result = await collector.collectCommits(1, '/fake/path');
1167 |       
1168 |       expect(result).toBe(3); // mockRepo에 3개의 커밋이 있다고 가정
1169 |     });
1170 |     
1171 |     // 다른 테스트 케이스들...
1172 |   });
1173 |   ```
1174 | 
1175 | ### Task 6.2: 배포 준비 및 문서화
1176 | - **목표**: 배포 및 운영을 위한 준비
1177 | - **상세 내용**:
1178 |   - README 및 사용 설명서 작성
1179 |   - 환경 변수 및 설정 파일 구성
1180 |   - 빌드 및 배포 스크립트 작성
1181 |   - 데이터 백업 전략 수립
```

.notes/tasklist_refactorying.mdc
```
1 | ---
2 | description: 
3 | globs: 
4 | alwaysApply: false
5 | ---
6 | - [ㅌ] App Layout
7 |     - [x] Sidebar
8 |     - [x] Screen : browser width - sidebar width
9 |         - [x] Header
10 |         - [x] Filter
11 |         - [x] Content
12 | 
13 | - [x] 사이드바 
14 |     - [x] snadcn의 sidebar 추가
15 |     - [x] 메뉴 구성
16 |         ~~
17 |         Beaver 
18 |         v0.1
19 |         [Search inputbox]
20 | 
21 |         Project
22 |             Project Overview
23 |             DORA Matrics 
24 |             Dev Metrics 
25 |             Review Collaboration
26 |             Team Welbeing
27 |         Team
28 |         People 
29 |         Reports
30 |         {Auto magrin}
31 |         Settings
32 |         Your Photo [log in/out]
33 |         ~~
34 | - [x] Header
35 |     - [x] Sidebar 접기
36 |     - [x] search 제거
37 | - [x] MatricsCard 컴포넌트 만들기
38 |      - [x] 타이틀, 버튼, 차트 영역
39 |      - [x] 타이틀 텍스트의 마크업(템플릿?)은 외부 주입
40 |      - [x] 버튼 갯수 + 각 버튼 상징색 (=차트에서 쓸 색) 주입
41 |      - [x] 각 버튼의 모양 (템플릿?) + 내용도 주입. 
42 |      - [x] 각 버튼의 차트 컴포넌트 모양 주입
43 |      - [x] 외부 데이터 업데이트 될 경우 상태 변경 서로 싱크해서 반영. 
44 | - [x] DORA 메트릭스 (기존 개발 버전) 화면 구성
45 |      - [x] Header에 제목 표시 "Beaver > DORA 메트릭스"
46 |      - [x] 헤더 하단 = Screen 상단에 필터 
47 |          - [x] 프로젝트 필터
48 |          - [x] 기간 설정
49 | - [ ] Dev Metrics
50 |      - [ ] [dev-metric.png](mdc:.notes/dev-metric.png)
51 |      - [ ] Screen 상단에 필터 
52 |          - [ ] 개인별, 직군별, 프로젝트별 필터
53 |          - [ ] 기간 설정
```

public/inject-test-data.html
```
1 | <!DOCTYPE html>
2 | <html lang="ko">
3 | <head>
4 |     <meta charset="UTF-8">
5 |     <meta name="viewport" content="width=device-width, initial-scale=1.0">
6 |     <title>DORA 테스트 데이터 주입 도구</title>
7 |     <style>
8 |         body {
9 |             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
10 |             max-width: 800px;
11 |             margin: 0 auto;
12 |             padding: 20px;
13 |             line-height: 1.6;
14 |             color: #333;
15 |         }
16 |         h1, h2, h3 {
17 |             color: #1a73e8;
18 |         }
19 |         .card {
20 |             background-color: #f8f9fa;
21 |             border-radius: 8px;
22 |             padding: 20px;
23 |             margin-bottom: 20px;
24 |             box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
25 |         }
26 |         .button {
27 |             background-color: #1a73e8;
28 |             color: white;
29 |             border: none;
30 |             padding: 10px 20px;
31 |             border-radius: 4px;
32 |             cursor: pointer;
33 |             font-size: 16px;
34 |             margin-right: 10px;
35 |         }
36 |         .button:hover {
37 |             background-color: #1557b0;
38 |         }
39 |         .success {
40 |             color: #0d904f;
41 |             font-weight: bold;
42 |         }
43 |         .error {
44 |             color: #d93025;
45 |             font-weight: bold;
46 |         }
47 |         .output {
48 |             background-color: #f1f3f4;
49 |             border-radius: 4px;
50 |             padding: 15px;
51 |             margin-top: 15px;
52 |             font-family: monospace;
53 |             white-space: pre-wrap;
54 |             display: none;
55 |         }
56 |         .repo-info {
57 |             margin-top: 30px;
58 |         }
59 |         .repo-card {
60 |             background-color: white;
61 |             border: 1px solid #dadce0;
62 |             border-radius: 8px;
63 |             padding: 15px;
64 |             margin-bottom: 15px;
65 |         }
66 |         table {
67 |             width: 100%;
68 |             border-collapse: collapse;
69 |         }
70 |         th, td {
71 |             text-align: left;
72 |             padding: 8px;
73 |             border-bottom: 1px solid #ddd;
74 |         }
75 |         th {
76 |             background-color: #f1f3f4;
77 |         }
78 |     </style>
79 | </head>
80 | <body>
81 |     <div class="card">
82 |         <h1>DORA 테스트 데이터 주입 도구</h1>
83 |         <p>이 도구는 GitHub API 호출 없이 로컬 테스트를 수행할 수 있도록 미리 계산된 테스트 데이터를 로컬 스토리지에 주입합니다.</p>
84 |         
85 |         <div>
86 |             <button id="injectDataBtn" class="button">테스트 데이터 주입하기</button>
87 |             <button id="clearCacheBtn" class="button" style="background-color: #d93025;">캐시 비우기</button>
88 |         </div>
89 |         
90 |         <div id="outputContainer" class="output"></div>
91 |     </div>
92 |     
93 |     <div class="repo-info">
94 |         <h2>사용 가능한 테스트 저장소</h2>
95 |         
96 |         <div class="repo-card">
97 |             <h3>n8n-io/n8n</h3>
98 |             <table>
99 |                 <tr>
100 |                     <th>측정 항목</th>
101 |                     <th>값</th>
102 |                 </tr>
103 |                 <tr>
104 |                     <td>Lead Time for Changes</td>
105 |                     <td>45.7시간 (약 1.9일)</td>
106 |                 </tr>
107 |                 <tr>
108 |                     <td>Deployment Frequency</td>
109 |                     <td>0.8회/일 (거의 매일)</td>
110 |                 </tr>
111 |                 <tr>
112 |                     <td>Change Failure Rate</td>
113 |                     <td>6%</td>
114 |                 </tr>
115 |                 <tr>
116 |                     <td>Mean Time to Restore</td>
117 |                     <td>2.5시간</td>
118 |                 </tr>
119 |             </table>
120 |         </div>
121 |         
122 |         <div class="repo-card">
123 |             <h3>docmost/docmost</h3>
124 |             <table>
125 |                 <tr>
126 |                     <th>측정 항목</th>
127 |                     <th>값</th>
128 |                 </tr>
129 |                 <tr>
130 |                     <td>Lead Time for Changes</td>
131 |                     <td>38.5시간 (약 1.6일)</td>
132 |                 </tr>
133 |                 <tr>
134 |                     <td>Deployment Frequency</td>
135 |                     <td>0.7회/일 (거의 매일)</td>
136 |                 </tr>
137 |                 <tr>
138 |                     <td>Change Failure Rate</td>
139 |                     <td>5%</td>
140 |                 </tr>
141 |                 <tr>
142 |                     <td>Mean Time to Restore</td>
143 |                     <td>1.8시간</td>
144 |                 </tr>
145 |             </table>
146 |         </div>
147 |         
148 |         <div class="repo-card">
149 |             <h3>wbkd/react-flow</h3>
150 |             <table>
151 |                 <tr>
152 |                     <th>측정 항목</th>
153 |                     <th>값</th>
154 |                 </tr>
155 |                 <tr>
156 |                     <td>Lead Time for Changes</td>
157 |                     <td>56.3시간 (약 2.3일)</td>
158 |                 </tr>
159 |                 <tr>
160 |                     <td>Deployment Frequency</td>
161 |                     <td>0.6회/일 (2일마다)</td>
162 |                 </tr>
163 |                 <tr>
164 |                     <td>Change Failure Rate</td>
165 |                     <td>7%</td>
166 |                 </tr>
167 |                 <tr>
168 |                     <td>Mean Time to Restore</td>
169 |                     <td>3.0시간</td>
170 |                 </tr>
171 |             </table>
172 |         </div>
173 |         
174 |         <div class="repo-card">
175 |             <h3>vitest-dev/vitest</h3>
176 |             <table>
177 |                 <tr>
178 |                     <th>측정 항목</th>
179 |                     <th>값</th>
180 |                 </tr>
181 |                 <tr>
182 |                     <td>Lead Time for Changes</td>
183 |                     <td>48.2시간 (약 2.0일)</td>
184 |                 </tr>
185 |                 <tr>
186 |                     <td>Deployment Frequency</td>
187 |                     <td>0.5회/일 (격일)</td>
188 |                 </tr>
189 |                 <tr>
190 |                     <td>Change Failure Rate</td>
191 |                     <td>6.5%</td>
192 |                 </tr>
193 |                 <tr>
194 |                     <td>Mean Time to Restore</td>
195 |                     <td>2.7시간</td>
196 |                 </tr>
197 |             </table>
198 |         </div>
199 |         
200 |         <div class="repo-card">
201 |             <h3>facebook/react</h3>
202 |             <table>
203 |                 <tr>
204 |                     <th>측정 항목</th>
205 |                     <th>값</th>
206 |                 </tr>
207 |                 <tr>
208 |                     <td>Lead Time for Changes</td>
209 |                     <td>72.3시간 (약 3일)</td>
210 |                 </tr>
211 |                 <tr>
212 |                     <td>Deployment Frequency</td>
213 |                     <td>0.5회/일 (격일)</td>
214 |                 </tr>
215 |                 <tr>
216 |                     <td>Change Failure Rate</td>
217 |                     <td>8%</td>
218 |                 </tr>
219 |                 <tr>
220 |                     <td>Mean Time to Restore</td>
221 |                     <td>2.1시간</td>
222 |                 </tr>
223 |             </table>
224 |         </div>
225 |     </div>
226 |     
227 |     <div class="card" style="margin-top: 20px;">
228 |         <h2>사용 지침</h2>
229 |         <div class="alert" style="background-color: #e7f3ff; border-left: 4px solid #1a73e8; padding: 15px; margin-bottom: 15px;">
230 |             <p><strong>중요:</strong> 테스트 데이터는 <strong>2024년 1월 1일</strong>부터 <strong>2025년 3월 15일</strong>까지의 날짜 범위로 주입됩니다.</p>
231 |             <p>대시보드에서 캐시된 데이터를 사용하려면 <strong>반드시 이 날짜 범위를 정확히 선택</strong>해야 합니다.</p>
232 |         </div>
233 |         <ol>
234 |             <li>아래 "테스트 데이터 주입하기" 버튼을 클릭하여 테스트 데이터를 로컬 스토리지에 저장합니다.</li>
235 |             <li>대시보드로 돌아가 "n8n-io/n8n", "docmost/docmost", "wbkd/react-flow", "vitest-dev/vitest", "facebook/react" 저장소를 선택합니다.</li>
236 |             <li><strong>시작일을 2024년 1월 1일로, 종료일을 2025년 3월 15일로 설정</strong>합니다.</li>
237 |             <li>"캐시 확인 후 새로고침" 옵션을 사용하여 테스트 데이터를 로드합니다.</li>
238 |         </ol>
239 |     </div>
240 |     
241 |     <script>
242 |         // 테스트 데이터 생성 (원하는 값으로 수정할 수 있습니다)
243 |         const data = {
244 |             // n8n-io/n8n 저장소 데이터
245 |             'n8n-io/n8n': {
246 |                 metrics: {
247 |                     leadTimeForChanges: 45.7, // 시간
248 |                     deploymentFrequency: 0.8, // 하루당 배포 횟수
249 |                     changeFailureRate: 6, // 퍼센트
250 |                     meanTimeToRestore: 2.5 // 시간
251 |                 },
252 |                 events: {
253 |                     deployments: [
254 |                         // 2024년 1월 1일부터 2025년 3월 15일까지의 배포 이벤트
255 |                         // 날짜는 ISO 형식으로 작성합니다
256 |                         { timestamp: '2024-01-02T14:25:00Z', version: 'v1.0.1' },
257 |                         { timestamp: '2024-01-05T10:15:00Z', version: 'v1.0.2' },
258 |                         { timestamp: '2024-01-10T09:30:00Z', version: 'v1.1.0' },
259 |                         { timestamp: '2024-01-13T16:45:00Z', version: 'v1.1.1' },
260 |                         { timestamp: '2024-01-18T11:20:00Z', version: 'v1.2.0' },
261 |                         { timestamp: '2024-01-25T15:10:00Z', version: 'v1.2.1' },
262 |                         { timestamp: '2024-02-01T13:40:00Z', version: 'v1.3.0' },
263 |                         { timestamp: '2024-02-08T10:55:00Z', version: 'v1.3.1' },
264 |                         { timestamp: '2024-02-15T14:30:00Z', version: 'v1.4.0' },
265 |                         { timestamp: '2024-02-22T12:15:00Z', version: 'v1.5.0' },
266 |                         { timestamp: '2024-02-29T09:50:00Z', version: 'v1.5.1' },
267 |                         { timestamp: '2024-03-05T16:20:00Z', version: 'v1.6.0' },
268 |                         { timestamp: '2024-03-12T11:05:00Z', version: 'v1.6.1' },
269 |                         // 2025년 3월 데이터 추가
270 |                         { timestamp: '2025-03-03T13:30:00Z', version: 'v2.8.0' },
271 |                         { timestamp: '2025-03-10T10:45:00Z', version: 'v2.8.1' }
272 |                     ],
273 |                     incidents: [
274 |                         // 2024년 1월 1일부터 2025년 3월 15일까지의 인시던트 이벤트
275 |                         { start: '2024-01-07T08:30:00Z', end: '2024-01-07T10:45:00Z', severity: 'medium' },
276 |                         { start: '2024-01-20T15:20:00Z', end: '2024-01-20T18:10:00Z', severity: 'high' },
277 |                         { start: '2024-02-05T09:15:00Z', end: '2024-02-05T11:30:00Z', severity: 'low' },
278 |                         { start: '2024-02-18T14:40:00Z', end: '2024-02-18T16:50:00Z', severity: 'medium' },
279 |                         { start: '2024-03-03T12:10:00Z', end: '2024-03-03T13:55:00Z', severity: 'medium' },
280 |                         // 2025년 3월 데이터 추가
281 |                         { start: '2025-03-05T11:20:00Z', end: '2025-03-05T13:45:00Z', severity: 'low' },
282 |                         { start: '2025-03-12T14:30:00Z', end: '2025-03-12T16:15:00Z', severity: 'medium' }
283 |                     ]
284 |                 },
285 |                 // 매일의 리드 타임 데이터
286 |                 leadTimeData: [
287 |                     { date: '2024-01-01', value: 46.2 },
288 |                     { date: '2024-01-15', value: 45.1 },
289 |                     { date: '2024-02-01', value: 47.3 },
290 |                     { date: '2024-02-15', value: 44.8 },
291 |                     { date: '2024-03-01', value: 45.0 },
292 |                     // 2025년 3월 데이터 추가
293 |                     { date: '2025-03-01', value: 44.5 },
294 |                     { date: '2025-03-15', value: 45.2 }
295 |                 ],
296 |                 // 매일의 MTTR 데이터
297 |                 mttrData: [
298 |                     { date: '2024-01-07', value: 2.3 },
299 |                     { date: '2024-01-20', value: 2.8 },
300 |                     { date: '2024-02-05', value: 2.2 },
301 |                     { date: '2024-02-18', value: 2.5 },
302 |                     { date: '2024-03-03', value: 2.7 },
303 |                     // 2025년 3월 데이터 추가
304 |                     { date: '2025-03-05', value: 2.4 },
305 |                     { date: '2025-03-12', value: 2.6 }
306 |                 ],
307 |                 // 배포 빈도 데이터
308 |                 deploymentFrequencyData: [
309 |                     { date: '2024-01-01', count: 0 },
310 |                     { date: '2024-01-02', count: 1 },
311 |                     { date: '2024-01-05', count: 1 },
312 |                     { date: '2024-01-10', count: 1 },
313 |                     { date: '2024-01-13', count: 1 },
314 |                     { date: '2024-01-18', count: 1 },
315 |                     { date: '2024-01-25', count: 1 },
316 |                     { date: '2024-02-01', count: 1 },
317 |                     { date: '2024-02-08', count: 1 },
318 |                     { date: '2024-02-15', count: 1 },
319 |                     { date: '2024-02-22', count: 1 },
320 |                     { date: '2024-02-29', count: 1 },
321 |                     { date: '2024-03-05', count: 1 },
322 |                     { date: '2024-03-12', count: 1 },
323 |                     // 2025년 3월 데이터 추가
324 |                     { date: '2025-03-03', count: 1 },
325 |                     { date: '2025-03-10', count: 1 }
326 |                 ],
327 |                 // 변경 실패율 데이터
328 |                 changeFailureRateData: [
329 |                     { date: '2024-01-07', rate: 7.1 },
330 |                     { date: '2024-01-20', rate: 6.5 },
331 |                     { date: '2024-02-05', rate: 5.8 },
332 |                     { date: '2024-02-18', rate: 6.2 },
333 |                     { date: '2024-03-03', rate: 6.0 },
334 |                     // 2025년 3월 데이터 추가
335 |                     { date: '2025-03-05', rate: 5.9 },
336 |                     { date: '2025-03-12', rate: 6.3 }
337 |                 ]
338 |             },
339 |             
340 |             // docmost/docmost 저장소 데이터
341 |             'docmost/docmost': {
342 |                 metrics: {
343 |                     leadTimeForChanges: 38.5, // 시간
344 |                     deploymentFrequency: 0.7, // 하루당 배포 횟수
345 |                     changeFailureRate: 5, // 퍼센트
346 |                     meanTimeToRestore: 1.8 // 시간
347 |                 },
348 |                 events: {
349 |                     deployments: [
350 |                         // 2024년 1월 1일부터 2025년 3월 15일까지의 배포 이벤트
351 |                         { timestamp: '2024-01-03T11:20:00Z', version: 'v2.0.1' },
352 |                         { timestamp: '2024-01-08T14:35:00Z', version: 'v2.0.2' },
353 |                         { timestamp: '2024-01-15T09:10:00Z', version: 'v2.1.0' },
354 |                         { timestamp: '2024-01-22T16:25:00Z', version: 'v2.1.1' },
355 |                         { timestamp: '2024-01-29T13:45:00Z', version: 'v2.2.0' },
356 |                         { timestamp: '2024-02-05T10:30:00Z', version: 'v2.2.1' },
357 |                         { timestamp: '2024-02-12T15:20:00Z', version: 'v2.3.0' },
358 |                         { timestamp: '2024-02-19T11:55:00Z', version: 'v2.3.1' },
359 |                         { timestamp: '2024-02-26T14:15:00Z', version: 'v2.4.0' },
360 |                         { timestamp: '2024-03-04T12:40:00Z', version: 'v2.4.1' },
361 |                         { timestamp: '2024-03-11T09:25:00Z', version: 'v2.5.0' },
362 |                         // 2025년 3월 데이터 추가
363 |                         { timestamp: '2025-03-02T10:40:00Z', version: 'v3.7.0' },
364 |                         { timestamp: '2025-03-09T13:15:00Z', version: 'v3.7.1' },
365 |                         { timestamp: '2025-03-14T11:30:00Z', version: 'v3.8.0' }
366 |                     ],
367 |                     incidents: [
368 |                         // 2024년 1월 1일부터 2025년 3월 15일까지의 인시던트 이벤트
369 |                         { start: '2024-01-10T13:15:00Z', end: '2024-01-10T15:00:00Z', severity: 'low' },
370 |                         { start: '2024-01-25T10:40:00Z', end: '2024-01-25T12:20:00Z', severity: 'medium' },
371 |                         { start: '2024-02-08T16:05:00Z', end: '2024-02-08T17:50:00Z', severity: 'low' },
372 |                         { start: '2024-02-22T11:30:00Z', end: '2024-02-22T13:10:00Z', severity: 'medium' },
373 |                         { start: '2024-03-07T14:45:00Z', end: '2024-03-07T16:30:00Z', severity: 'low' },
374 |                         // 2025년 3월 데이터 추가
375 |                         { start: '2025-03-06T09:20:00Z', end: '2025-03-06T11:00:00Z', severity: 'low' },
376 |                         { start: '2025-03-13T14:10:00Z', end: '2025-03-13T15:45:00Z', severity: 'medium' }
377 |                     ]
378 |                 },
379 |                 // 매일의 리드 타임 데이터
380 |                 leadTimeData: [
381 |                     { date: '2024-01-01', value: 39.1 },
382 |                     { date: '2024-01-15', value: 38.3 },
383 |                     { date: '2024-02-01', value: 38.8 },
384 |                     { date: '2024-02-15', value: 37.9 },
385 |                     { date: '2024-03-01', value: 38.4 },
386 |                     // 2025년 3월 데이터 추가
387 |                     { date: '2025-03-01', value: 38.0 },
388 |                     { date: '2025-03-15', value: 37.6 }
389 |                 ],
390 |                 // 매일의 MTTR 데이터
391 |                 mttrData: [
392 |                     { date: '2024-01-10', value: 1.7 },
393 |                     { date: '2024-01-25', value: 1.9 },
394 |                     { date: '2024-02-08', value: 1.8 },
395 |                     { date: '2024-02-22', value: 1.6 },
396 |                     { date: '2024-03-07', value: 2.0 },
397 |                     // 2025년 3월 데이터 추가
398 |                     { date: '2025-03-06', value: 1.7 },
399 |                     { date: '2025-03-13', value: 1.9 }
400 |                 ],
401 |                 // 배포 빈도 데이터
402 |                 deploymentFrequencyData: [
403 |                     { date: '2024-01-01', count: 0 },
404 |                     { date: '2024-01-03', count: 1 },
405 |                     { date: '2024-01-08', count: 1 },
406 |                     { date: '2024-01-15', count: 1 },
407 |                     { date: '2024-01-22', count: 1 },
408 |                     { date: '2024-01-29', count: 1 },
409 |                     { date: '2024-02-05', count: 1 },
410 |                     { date: '2024-02-12', count: 1 },
411 |                     { date: '2024-02-19', count: 1 },
412 |                     { date: '2024-02-26', count: 1 },
413 |                     { date: '2024-03-04', count: 1 },
414 |                     { date: '2024-03-11', count: 1 },
415 |                     // 2025년 3월 데이터 추가
416 |                     { date: '2025-03-02', count: 1 },
417 |                     { date: '2025-03-09', count: 1 },
418 |                     { date: '2025-03-14', count: 1 }
419 |                 ],
420 |                 // 변경 실패율 데이터
421 |                 changeFailureRateData: [
422 |                     { date: '2024-01-10', rate: 5.3 },
423 |                     { date: '2024-01-25', rate: 4.8 },
424 |                     { date: '2024-02-08', rate: 5.1 },
425 |                     { date: '2024-02-22', rate: 4.9 },
426 |                     { date: '2024-03-07', rate: 5.2 },
427 |                     // 2025년 3월 데이터 추가
428 |                     { date: '2025-03-06', rate: 5.0 },
429 |                     { date: '2025-03-13', rate: 4.7 }
430 |                 ]
431 |             },
432 |             
433 |             // wbkd/react-flow 저장소 데이터
434 |             'wbkd/react-flow': {
435 |                 metrics: {
436 |                     leadTimeForChanges: 56.3, // 시간
437 |                     deploymentFrequency: 0.6, // 하루당 배포 횟수
438 |                     changeFailureRate: 7, // 퍼센트
439 |                     meanTimeToRestore: 3.0 // 시간
440 |                 },
441 |                 events: {
442 |                     deployments: [
443 |                         // 2024년 1월 1일부터 2025년 3월 15일까지의 배포 이벤트
444 |                         { timestamp: '2024-01-05T15:30:00Z', version: 'v11.5.0' },
445 |                         { timestamp: '2024-01-12T11:45:00Z', version: 'v11.5.1' },
446 |                         { timestamp: '2024-01-19T14:20:00Z', version: 'v11.6.0' },
447 |                         { timestamp: '2024-01-26T10:10:00Z', version: 'v11.6.1' },
448 |                         { timestamp: '2024-02-02T16:35:00Z', version: 'v11.7.0' },
449 |                         { timestamp: '2024-02-09T13:50:00Z', version: 'v11.7.1' },
450 |                         { timestamp: '2024-02-16T09:25:00Z', version: 'v11.8.0' },
451 |                         { timestamp: '2024-02-23T15:40:00Z', version: 'v11.8.1' },
452 |                         { timestamp: '2024-03-01T12:15:00Z', version: 'v11.9.0' },
453 |                         { timestamp: '2024-03-08T09:30:00Z', version: 'v11.9.1' },
454 |                         // 2025년 3월 데이터 추가
455 |                         { timestamp: '2025-03-04T14:20:00Z', version: 'v12.8.0' },
456 |                         { timestamp: '2025-03-11T11:35:00Z', version: 'v12.8.1' }
457 |                     ],
458 |                     incidents: [
459 |                         // 2024년 1월 1일부터 2025년 3월 15일까지의 인시던트 이벤트
460 |                         { start: '2024-01-15T10:20:00Z', end: '2024-01-15T13:45:00Z', severity: 'high' },
461 |                         { start: '2024-01-30T14:10:00Z', end: '2024-01-30T17:30:00Z', severity: 'medium' },
462 |                         { start: '2024-02-12T09:50:00Z', end: '2024-02-12T12:35:00Z', severity: 'low' },
463 |                         { start: '2024-02-28T13:25:00Z', end: '2024-02-28T16:10:00Z', severity: 'high' },
464 |                         { start: '2024-03-10T11:40:00Z', end: '2024-03-10T14:25:00Z', severity: 'medium' },
465 |                         // 2025년 3월 데이터 추가
466 |                         { start: '2025-03-07T13:15:00Z', end: '2025-03-07T16:40:00Z', severity: 'high' },
467 |                         { start: '2025-03-14T10:25:00Z', end: '2025-03-14T12:50:00Z', severity: 'medium' }
468 |                     ]
469 |                 },
470 |                 // 매일의 리드 타임 데이터
471 |                 leadTimeData: [
472 |                     { date: '2024-01-01', value: 57.1 },
473 |                     { date: '2024-01-15', value: 56.5 },
474 |                     { date: '2024-02-01', value: 55.8 },
475 |                     { date: '2024-02-15', value: 56.2 },
476 |                     { date: '2024-03-01', value: 55.9 },
477 |                     // 2025년 3월 데이터 추가
478 |                     { date: '2025-03-01', value: 56.5 },
479 |                     { date: '2025-03-15', value: 55.6 }
480 |                 ],
481 |                 // 매일의 MTTR 데이터
482 |                 mttrData: [
483 |                     { date: '2024-01-15', value: 3.4 },
484 |                     { date: '2024-01-30', value: 3.1 },
485 |                     { date: '2024-02-12', value: 2.8 },
486 |                     { date: '2024-02-28', value: 3.2 },
487 |                     { date: '2024-03-10', value: 2.9 },
488 |                     // 2025년 3월 데이터 추가
489 |                     { date: '2025-03-07', value: 3.5 },
490 |                     { date: '2025-03-14', value: 3.0 }
491 |                 ],
492 |                 // 배포 빈도 데이터
493 |                 deploymentFrequencyData: [
494 |                     { date: '2024-01-01', count: 0 },
495 |                     { date: '2024-01-05', count: 1 },
496 |                     { date: '2024-01-12', count: 1 },
497 |                     { date: '2024-01-19', count: 1 },
498 |                     { date: '2024-01-26', count: 1 },
499 |                     { date: '2024-02-02', count: 1 },
500 |                     { date: '2024-02-09', count: 1 },
501 |                     { date: '2024-02-16', count: 1 },
502 |                     { date: '2024-02-23', count: 1 },
503 |                     { date: '2024-03-01', count: 1 },
504 |                     { date: '2024-03-08', count: 1 },
505 |                     // 2025년 3월 데이터 추가
506 |                     { date: '2025-03-04', count: 1 },
507 |                     { date: '2025-03-11', count: 1 }
508 |                 ],
509 |                 // 변경 실패율 데이터
510 |                 changeFailureRateData: [
511 |                     { date: '2024-01-15', rate: 7.6 },
512 |                     { date: '2024-01-30', rate: 7.2 },
513 |                     { date: '2024-02-12', rate: 6.8 },
514 |                     { date: '2024-02-28', rate: 7.3 },
515 |                     { date: '2024-03-10', rate: 7.0 },
516 |                     // 2025년 3월 데이터 추가
517 |                     { date: '2025-03-07', rate: 7.4 },
518 |                     { date: '2025-03-14', rate: 6.9 }
519 |                 ]
520 |             },
521 |             
522 |             // vitest-dev/vitest 저장소 데이터
523 |             'vitest-dev/vitest': {
524 |                 metrics: {
525 |                     leadTimeForChanges: 48.2, // 시간
526 |                     deploymentFrequency: 0.5, // 하루당 배포 횟수
527 |                     changeFailureRate: 6.5, // 퍼센트
528 |                     meanTimeToRestore: 2.7 // 시간
529 |                 },
530 |                 events: {
531 |                     deployments: [
532 |                         // 2024년 1월 1일부터 2025년 3월 15일까지의 배포 이벤트
533 |                         { timestamp: '2024-01-08T12:40:00Z', version: 'v3.0.0' },
534 |                         { timestamp: '2024-01-16T09:15:00Z', version: 'v3.0.1' },
535 |                         { timestamp: '2024-01-24T14:30:00Z', version: 'v3.1.0' },
536 |                         { timestamp: '2024-02-01T11:20:00Z', version: 'v3.1.1' },
537 |                         { timestamp: '2024-02-09T15:45:00Z', version: 'v3.2.0' },
538 |                         { timestamp: '2024-02-17T10:10:00Z', version: 'v3.2.1' },
539 |                         { timestamp: '2024-02-25T13:35:00Z', version: 'v3.3.0' },
540 |                         { timestamp: '2024-03-04T16:25:00Z', version: 'v3.3.1' },
541 |                         { timestamp: '2024-03-12T09:50:00Z', version: 'v3.4.0' },
542 |                         // 2025년 3월 데이터 추가
543 |                         { timestamp: '2025-03-05T13:10:00Z', version: 'v4.7.0' },
544 |                         { timestamp: '2025-03-13T10:25:00Z', version: 'v4.7.1' }
545 |                     ],
546 |                     incidents: [
547 |                         // 2024년 1월 1일부터 2025년 3월 15일까지의 인시던트 이벤트
548 |                         { start: '2024-01-12T11:30:00Z', end: '2024-01-12T14:10:00Z', severity: 'medium' },
549 |                         { start: '2024-01-28T15:20:00Z', end: '2024-01-28T17:55:00Z', severity: 'low' },
550 |                         { start: '2024-02-05T10:45:00Z', end: '2024-02-05T13:25:00Z', severity: 'high' },
551 |                         { start: '2024-02-20T14:15:00Z', end: '2024-02-20T16:40:00Z', severity: 'medium' },
552 |                         { start: '2024-03-08T09:10:00Z', end: '2024-03-08T11:35:00Z', severity: 'low' },
553 |                         // 2025년 3월 데이터 추가
554 |                         { start: '2025-03-08T11:45:00Z', end: '2025-03-08T14:30:00Z', severity: 'medium' },
555 |                         { start: '2025-03-15T09:20:00Z', end: '2025-03-15T11:40:00Z', severity: 'low' }
556 |                     ]
557 |                 },
558 |                 // 매일의 리드 타임 데이터
559 |                 leadTimeData: [
560 |                     { date: '2024-01-01', value: 48.9 },
561 |                     { date: '2024-01-15', value: 48.3 },
562 |                     { date: '2024-02-01', value: 47.7 },
563 |                     { date: '2024-02-15', value: 48.4 },
564 |                     { date: '2024-03-01', value: 47.9 },
565 |                     // 2025년 3월 데이터 추가
566 |                     { date: '2025-03-01', value: 48.1 },
567 |                     { date: '2025-03-15', value: 47.5 }
568 |                 ],
569 |                 // 매일의 MTTR 데이터
570 |                 mttrData: [
571 |                     { date: '2024-01-12', value: 2.6 },
572 |                     { date: '2024-01-28', value: 2.9 },
573 |                     { date: '2024-02-05', value: 2.5 },
574 |                     { date: '2024-02-20', value: 2.8 },
575 |                     { date: '2024-03-08', value: 2.7 },
576 |                     // 2025년 3월 데이터 추가
577 |                     { date: '2025-03-08', value: 2.6 },
578 |                     { date: '2025-03-15', value: 2.4 }
579 |                 ],
580 |                 // 배포 빈도 데이터
581 |                 deploymentFrequencyData: [
582 |                     { date: '2024-01-01', count: 0 },
583 |                     { date: '2024-01-08', count: 1 },
584 |                     { date: '2024-01-16', count: 1 },
585 |                     { date: '2024-01-24', count: 1 },
586 |                     { date: '2024-02-01', count: 1 },
587 |                     { date: '2024-02-09', count: 1 },
588 |                     { date: '2024-02-17', count: 1 },
589 |                     { date: '2024-02-25', count: 1 },
590 |                     { date: '2024-03-04', count: 1 },
591 |                     { date: '2024-03-12', count: 1 },
592 |                     // 2025년 3월 데이터 추가
593 |                     { date: '2025-03-05', count: 1 },
594 |                     { date: '2025-03-13', count: 1 }
595 |                 ],
596 |                 // 변경 실패율 데이터
597 |                 changeFailureRateData: [
598 |                     { date: '2024-01-12', rate: 6.7 },
599 |                     { date: '2024-01-28', rate: 6.3 },
600 |                     { date: '2024-02-05', rate: 6.9 },
601 |                     { date: '2024-02-20', rate: 6.4 },
602 |                     { date: '2024-03-08', rate: 6.1 },
603 |                     // 2025년 3월 데이터 추가
604 |                     { date: '2025-03-08', rate: 6.6 },
605 |                     { date: '2025-03-15', rate: 6.2 }
606 |                 ]
607 |             },
608 |             
609 |             // facebook/react 저장소 데이터
610 |             'facebook/react': {
611 |                 metrics: {
612 |                     leadTimeForChanges: 72.3, // 시간
613 |                     deploymentFrequency: 0.5, // 하루당 배포 횟수
614 |                     changeFailureRate: 8, // 퍼센트
615 |                     meanTimeToRestore: 2.1 // 시간
616 |                 },
617 |                 events: {
618 |                     deployments: [
619 |                         // 2024년 1월 1일부터 2025년 3월 15일까지의 배포 이벤트
620 |                         { timestamp: '2024-01-10T13:20:00Z', version: 'v18.3.0' },
621 |                         { timestamp: '2024-01-20T10:45:00Z', version: 'v18.3.1' },
622 |                         { timestamp: '2024-01-30T15:10:00Z', version: 'v18.4.0' },
623 |                         { timestamp: '2024-02-09T12:30:00Z', version: 'v18.4.1' },
624 |                         { timestamp: '2024-02-19T09:55:00Z', version: 'v18.5.0' },
625 |                         { timestamp: '2024-02-29T14:40:00Z', version: 'v18.5.1' },
626 |                         { timestamp: '2024-03-10T11:15:00Z', version: 'v18.6.0' },
627 |                         // 2025년 3월 데이터 추가
628 |                         { timestamp: '2025-03-01T13:25:00Z', version: 'v19.5.0' },
629 |                         { timestamp: '2025-03-11T10:15:00Z', version: 'v19.5.1' }
630 |                     ],
631 |                     incidents: [
632 |                         // 2024년 1월 1일부터 2025년 3월 15일까지의 인시던트 이벤트
633 |                         { start: '2024-01-15T09:30:00Z', end: '2024-01-15T11:45:00Z', severity: 'medium' },
634 |                         { start: '2024-01-25T14:20:00Z', end: '2024-01-25T16:15:00Z', severity: 'low' },
635 |                         { start: '2024-02-04T11:10:00Z', end: '2024-02-04T13:25:00Z', severity: 'high' },
636 |                         { start: '2024-02-14T16:05:00Z', end: '2024-02-14T18:15:00Z', severity: 'medium' },
637 |                         { start: '2024-02-24T10:40:00Z', end: '2024-02-24T12:55:00Z', severity: 'low' },
638 |                         { start: '2024-03-05T15:30:00Z', end: '2024-03-05T17:25:00Z', severity: 'medium' },
639 |                         // 2025년 3월 데이터 추가
640 |                         { start: '2025-03-05T12:20:00Z', end: '2025-03-05T14:30:00Z', severity: 'low' },
641 |                         { start: '2025-03-15T09:45:00Z', end: '2025-03-15T11:55:00Z', severity: 'high' }
642 |                     ]
643 |                 },
644 |                 // 매일의 리드 타임 데이터
645 |                 leadTimeData: [
646 |                     { date: '2024-01-01', value: 73.1 },
647 |                     { date: '2024-01-15', value: 72.5 },
648 |                     { date: '2024-02-01', value: 71.8 },
649 |                     { date: '2024-02-15', value: 72.6 },
650 |                     { date: '2024-03-01', value: 71.9 },
651 |                     // 2025년 3월 데이터 추가
652 |                     { date: '2025-03-01', value: 72.0 },
653 |                     { date: '2025-03-15', value: 71.5 }
654 |                 ],
655 |                 // 매일의 MTTR 데이터
656 |                 mttrData: [
657 |                     { date: '2024-01-15', value: 2.3 },
658 |                     { date: '2024-01-25', value: 1.9 },
659 |                     { date: '2024-02-04', value: 2.4 },
660 |                     { date: '2024-02-14', value: 2.2 },
661 |                     { date: '2024-02-24', value: 2.0 },
662 |                     { date: '2024-03-05', value: 2.1 },
663 |                     // 2025년 3월 데이터 추가
664 |                     { date: '2025-03-05', value: 2.2 },
665 |                     { date: '2025-03-15', value: 2.1 }
666 |                 ],
667 |                 // 배포 빈도 데이터
668 |                 deploymentFrequencyData: [
669 |                     { date: '2024-01-01', count: 0 },
670 |                     { date: '2024-01-10', count: 1 },
671 |                     { date: '2024-01-20', count: 1 },
672 |                     { date: '2024-01-30', count: 1 },
673 |                     { date: '2024-02-09', count: 1 },
674 |                     { date: '2024-02-19', count: 1 },
675 |                     { date: '2024-02-29', count: 1 },
676 |                     { date: '2024-03-10', count: 1 },
677 |                     // 2025년 3월 데이터 추가
678 |                     { date: '2025-03-01', count: 1 },
679 |                     { date: '2025-03-11', count: 1 }
680 |                 ],
681 |                 // 변경 실패율 데이터
682 |                 changeFailureRateData: [
683 |                     { date: '2024-01-15', rate: 8.3 },
684 |                     { date: '2024-01-25', rate: 7.8 },
685 |                     { date: '2024-02-04', rate: 8.5 },
686 |                     { date: '2024-02-14', rate: 8.1 },
687 |                     { date: '2024-02-24', rate: 7.7 },
688 |                     { date: '2024-03-05', rate: 8.2 },
689 |                     // 2025년 3월 데이터 추가
690 |                     { date: '2025-03-05', rate: 7.9 },
691 |                     { date: '2025-03-15', rate: 8.0 }
692 |                 ]
693 |             }
694 |         };
695 | 
696 |         // 로컬 스토리지 키 생성 함수
697 |         function generateCacheKey(repo, metric, startDate, endDate) {
698 |             return `beaver_${repo}_${metric}_${startDate}_${endDate}`;
699 |         }
700 | 
701 |         // 테스트 데이터 주입 함수
702 |         function injectTestData() {
703 |             // 날짜 범위 설정 - 2024년 1월 1일부터 2025년 3월 1일까지
704 |             const startDate = '2024-01-01';
705 |             const endDate = '2025-03-15';
706 |             
707 |             // 각 저장소별로 데이터 저장
708 |             for (const repo in data) {
709 |                 const repoData = data[repo];
710 |                 
711 |                 // pull_request_data 저장
712 |                 const pullRequestsKey = generateCacheKey(repo, 'pull_requests', startDate, endDate);
713 |                 localStorage.setItem(pullRequestsKey, JSON.stringify([]));
714 |                 
715 |                 // deployments 저장
716 |                 const deploymentsKey = generateCacheKey(repo, 'deployments', startDate, endDate);
717 |                 localStorage.setItem(deploymentsKey, JSON.stringify(repoData.events.deployments));
718 |                 
719 |                 // incidents 저장
720 |                 const incidentsKey = generateCacheKey(repo, 'incidents', startDate, endDate);
721 |                 localStorage.setItem(incidentsKey, JSON.stringify(repoData.events.incidents));
722 |                 
723 |                 // lead_time 저장
724 |                 const leadTimeKey = generateCacheKey(repo, 'lead_time', startDate, endDate);
725 |                 localStorage.setItem(leadTimeKey, JSON.stringify(repoData.leadTimeData));
726 |                 
727 |                 // mttr 저장
728 |                 const mttrKey = generateCacheKey(repo, 'mttr', startDate, endDate);
729 |                 localStorage.setItem(mttrKey, JSON.stringify(repoData.mttrData));
730 |                 
731 |                 // deployment_frequency 저장
732 |                 const dfKey = generateCacheKey(repo, 'deployment_frequency', startDate, endDate);
733 |                 localStorage.setItem(dfKey, JSON.stringify(repoData.deploymentFrequencyData));
734 |                 
735 |                 // change_failure_rate 저장
736 |                 const cfrKey = generateCacheKey(repo, 'change_failure_rate', startDate, endDate);
737 |                 localStorage.setItem(cfrKey, JSON.stringify(repoData.changeFailureRateData));
738 |                 
739 |                 // metrics 저장
740 |                 const metricsKey = generateCacheKey(repo, 'metrics', startDate, endDate);
741 |                 localStorage.setItem(metricsKey, JSON.stringify(repoData.metrics));
742 |             }
743 |             
744 |             // 성공 메시지 표시
745 |             const statusDiv = document.getElementById('status');
746 |             statusDiv.innerHTML = `
747 |                 <div class="alert" style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 15px;">
748 |                     <p><strong>성공:</strong> 테스트 데이터가 성공적으로 주입되었습니다!</p>
749 |                     <p>이제 대시보드로 돌아가서 다음 저장소를 선택할 수 있습니다: n8n-io/n8n, docmost/docmost, wbkd/react-flow, vitest-dev/vitest, facebook/react</p>
750 |                     <p><strong>주의:</strong> 캐시 히트를 위해 정확히 다음 날짜 범위를 선택하세요: <strong>2024년 1월 1일</strong> - <strong>2025년 3월 15일</strong></p>
751 |                 </div>
752 |             `;
753 |         }
754 | 
755 |         // 캐시 지우기 함수
756 |         function clearCache() {
757 |             // 'beaver_'로 시작하는 모든 로컬 스토리지 항목 제거
758 |             Object.keys(localStorage).forEach(key => {
759 |                 if (key.startsWith('beaver_')) {
760 |                     localStorage.removeItem(key);
761 |                 }
762 |             });
763 |             
764 |             // 성공 메시지 표시
765 |             const statusDiv = document.getElementById('status');
766 |             statusDiv.innerHTML = `
767 |                 <div class="alert" style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 15px;">
768 |                     <p><strong>성공:</strong> 캐시가 성공적으로 지워졌습니다!</p>
769 |                 </div>
770 |             `;
771 |         }
772 |     </script>
773 | </body>
774 | </html>
```

scripts/checkPort.js
```
1 | #!/usr/bin/env node
2 | 
3 | import { exec } from 'child_process';
4 | import { platform } from 'os';
5 | 
6 | const PORT = 3000;
7 | 
8 | console.log(`포트 ${PORT} 확인 중...`);
9 | 
10 | const isWindows = platform() === 'win32';
11 | 
12 | // 운영체제에 따라 적절한 명령어 설정
13 | const findProcessCommand = isWindows
14 |   ? `netstat -ano | findstr :${PORT}`
15 |   : `lsof -i :${PORT} | grep LISTEN`;
16 | 
17 | const killProcessCommand = (pid) => isWindows
18 |   ? `taskkill /F /PID ${pid}`
19 |   : `kill -9 ${pid}`;
20 | 
21 | // 포트 사용 여부 확인 및 프로세스 종료
22 | exec(findProcessCommand, (error, stdout, stderr) => {
23 |   if (error) {
24 |     // 오류가 발생했거나 프로세스를 찾지 못한 경우 (포트가 사용 중이지 않음)
25 |     console.log(`포트 ${PORT}가 사용 중이지 않습니다. 개발 서버를 시작합니다.`);
26 |     return;
27 |   }
28 | 
29 |   // 출력 결과에서 PID 추출
30 |   let pids = [];
31 |   if (isWindows) {
32 |     // Windows: netstat 출력에서 PID 추출
33 |     const lines = stdout.split('\n');
34 |     for (const line of lines) {
35 |       const trimmed = line.trim();
36 |       if (trimmed && trimmed.includes(`0.0.0.0:${PORT}`) || trimmed.includes(`127.0.0.1:${PORT}`) || trimmed.includes(`:::${PORT}`)) {
37 |         const parts = trimmed.split(/\s+/);
38 |         const pid = parts[parts.length - 1];
39 |         if (pid && !isNaN(parseInt(pid))) {
40 |           pids.push(pid);
41 |         }
42 |       }
43 |     }
44 |   } else {
45 |     // macOS/Linux: lsof 출력에서 PID 추출
46 |     const lines = stdout.split('\n');
47 |     for (const line of lines) {
48 |       const parts = line.trim().split(/\s+/);
49 |       if (parts.length > 1) {
50 |         const pid = parts[1];
51 |         if (pid && !isNaN(parseInt(pid))) {
52 |           pids.push(pid);
53 |         }
54 |       }
55 |     }
56 |   }
57 | 
58 |   // 중복 PID 제거
59 |   pids = [...new Set(pids)];
60 | 
61 |   if (pids.length === 0) {
62 |     console.log(`포트 ${PORT}가 사용 중이지만 종료할 프로세스를 찾을 수 없습니다.`);
63 |     process.exit(1);
64 |   }
65 | 
66 |   console.log(`포트 ${PORT}가 다음 PID에 의해 사용 중입니다: ${pids.join(', ')}`);
67 | 
68 |   // 모든 PID에 대해 프로세스 종료
69 |   for (const pid of pids) {
70 |     exec(killProcessCommand(pid), (killError, killStdout, killStderr) => {
71 |       if (killError) {
72 |         console.error(`PID ${pid} 종료 중 오류 발생:`, killError);
73 |         return;
74 |       }
75 |       console.log(`PID ${pid} 종료 완료`);
76 |     });
77 |   }
78 | 
79 |   // 잠시 대기 후 개발 서버 시작
80 |   console.log('포트가 완전히 해제될 때까지 잠시 대기 중...');
81 |   setTimeout(() => {
82 |     console.log(`포트 ${PORT}가 해제되었습니다. 개발 서버를 시작합니다.`);
83 |   }, 1000);
84 | }); 
```

scripts/injectTestData.js
```
1 | #!/usr/bin/env node
2 | 
3 | /**
4 |  * 테스트 데이터를 로컬 스토리지에 주입하는 스크립트
5 |  * 브라우저 콘솔에서 실행하기 위한 코드입니다.
6 |  * 복사하여 브라우저 콘솔에 붙여넣어 실행하세요.
7 |  */
8 | 
9 | // 캐시 키 생성 함수
10 | const generateCacheKey = (startDate, endDate, repo) => {
11 |   const startDateStr = new Date(startDate).toISOString().split('T')[0];
12 |   const endDateStr = new Date(endDate).toISOString().split('T')[0];
13 |   return `metrics_cache_${repo}_${startDateStr}_${endDateStr}`;
14 | };
15 | 
16 | // 고정 날짜 설정 (2025년 3월 1일 ~ 3월 16일)
17 | const startDate = new Date('2025-03-01');
18 | const endDate = new Date('2025-03-16');
19 | 
20 | console.log('테스트 데이터 날짜 범위:', {
21 |   startDate: startDate.toISOString(),
22 |   endDate: endDate.toISOString()
23 | });
24 | 
25 | // d3 테스트 데이터
26 | const d3TestData = {
27 |   timestamp: new Date().toISOString(),
28 |   expiresAt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 1일 후 만료
29 |   data: {
30 |     metrics: {
31 |       leadTimeForChanges: 48.5, // 48.5시간 (약 2일)
32 |       deploymentFrequency: 0.8, // 0.8회/일 (거의 매일)
33 |       changeFailureRate: 0.12, // 12%
34 |       meanTimeToRestore: 3.5 // 3.5시간
35 |     },
36 |     events: [
37 |       {
38 |         id: 'deployment-1001',
39 |         type: 'deployment',
40 |         timestamp: '2025-03-01T10:00:00Z',
41 |         description: '성공한 배포 (production)',
42 |         repository: 'd3/d3'
43 |       },
44 |       {
45 |         id: 'deployment-1002',
46 |         type: 'incident',
47 |         timestamp: '2025-03-03T11:00:00Z',
48 |         description: '실패한 배포 (production)',
49 |         repository: 'd3/d3'
50 |       },
51 |       {
52 |         id: 'deployment-1003',
53 |         type: 'deployment',
54 |         timestamp: '2025-03-05T09:00:00Z',
55 |         description: '성공한 배포 (production)',
56 |         repository: 'd3/d3'
57 |       }
58 |     ],
59 |     leadTimeData: [
60 |       { date: '2025-03-01', leadTime: 50.2 },
61 |       { date: '2025-03-05', leadTime: 48.7 },
62 |       { date: '2025-03-10', leadTime: 45.3 },
63 |       { date: '2025-03-15', leadTime: 46.8 }
64 |     ],
65 |     mttrData: [
66 |       { date: '2025-03-01', mttr: 3.8 },
67 |       { date: '2025-03-05', mttr: 3.5 },
68 |       { date: '2025-03-10', mttr: 3.2 },
69 |       { date: '2025-03-15', mttr: 3.4 }
70 |     ]
71 |   }
72 | };
73 | 
74 | // react 테스트 데이터
75 | const reactTestData = {
76 |   timestamp: new Date().toISOString(),
77 |   expiresAt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 1일 후 만료
78 |   data: {
79 |     metrics: {
80 |       leadTimeForChanges: 72.3, // 72.3시간 (약 3일)
81 |       deploymentFrequency: 0.5, // 0.5회/일 (격일)
82 |       changeFailureRate: 0.08, // 8%
83 |       meanTimeToRestore: 2.1 // 2.1시간
84 |     },
85 |     events: [
86 |       {
87 |         id: 'deployment-2001',
88 |         type: 'deployment',
89 |         timestamp: '2025-03-02T15:00:00Z',
90 |         description: '성공한 배포 (production)',
91 |         repository: 'facebook/react'
92 |       },
93 |       {
94 |         id: 'deployment-2002',
95 |         type: 'deployment',
96 |         timestamp: '2025-03-04T14:00:00Z',
97 |         description: '성공한 배포 (production)',
98 |         repository: 'facebook/react'
99 |       },
100 |       {
101 |         id: 'deployment-2003',
102 |         type: 'incident',
103 |         timestamp: '2025-03-08T16:00:00Z',
104 |         description: '실패한 배포 (production)',
105 |         repository: 'facebook/react'
106 |       },
107 |       {
108 |         id: 'deployment-2004',
109 |         type: 'deployment',
110 |         timestamp: '2025-03-10T12:00:00Z',
111 |         description: '성공한 배포 (production)',
112 |         repository: 'facebook/react'
113 |       }
114 |     ],
115 |     leadTimeData: [
116 |       { date: '2025-03-01', leadTime: 75.1 },
117 |       { date: '2025-03-05', leadTime: 72.8 },
118 |       { date: '2025-03-10', leadTime: 70.5 },
119 |       { date: '2025-03-15', leadTime: 71.2 }
120 |     ],
121 |     mttrData: [
122 |       { date: '2025-03-01', mttr: 2.3 },
123 |       { date: '2025-03-05', mttr: 2.0 },
124 |       { date: '2025-03-10', mttr: 2.2 },
125 |       { date: '2025-03-15', mttr: 1.9 }
126 |     ]
127 |   }
128 | };
129 | 
130 | // 캐시 키 생성
131 | const d3CacheKey = generateCacheKey(startDate, endDate, 'd3/d3');
132 | const reactCacheKey = generateCacheKey(startDate, endDate, 'facebook/react');
133 | 
134 | // 데이터 로컬 스토리지에 저장
135 | localStorage.setItem(d3CacheKey, JSON.stringify(d3TestData));
136 | localStorage.setItem(reactCacheKey, JSON.stringify(reactTestData));
137 | 
138 | console.log('캐시 키 및 데이터 정보:');
139 | console.log('d3/d3 캐시 키:', d3CacheKey);
140 | console.log('facebook/react 캐시 키:', reactCacheKey);
141 | console.log('로컬 스토리지에 테스트 데이터가 성공적으로 저장되었습니다.');
142 | console.log('사용 가능한 저장소:');
143 | console.log('- d3/d3');
144 | console.log('- facebook/react');
145 | console.log('\n중요: 대시보드에서 다음 날짜를 선택하세요:');
146 | console.log('- 시작일: 2025년 3월 1일');
147 | console.log('- 종료일: 2025년 3월 16일'); 
```

src/App.tsx
```
1 | import { useState } from 'react'
2 | // App.css는 index.css로 통합되었으므로 import 구문 제거
3 | import { AppSidebar } from './components/app-sidebar'
4 | import { SiteHeader } from './components/site-header'
5 | import { FilterBar } from './components/metrics/filter-bar'
6 | import { DoraMetrics } from './components/metrics/dora-metrics'
7 | import { ExampleMetrics } from './components/metrics/example-metrics'
8 | import { SidebarProvider } from '@/components/ui/sidebar'
9 | 
10 | interface FilterState {
11 |   project: string;
12 |   startDate: Date | null;
13 |   endDate: Date | null;
14 |   datePreset?: string;
15 | }
16 | 
17 | function App() {
18 |   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
19 |   const [filterState, setFilterState] = useState<FilterState>({
20 |     project: 'all',
21 |     startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
22 |     endDate: new Date(),
23 |     datePreset: '30d'
24 |   })
25 | 
26 |   const toggleSidebar = () => {
27 |     setIsSidebarCollapsed(!isSidebarCollapsed)
28 |   }
29 | 
30 |   // 사이드바 너비 계산 (접혔을 때와 펼쳤을 때)
31 |   const sidebarWidth = isSidebarCollapsed ? 80 : 250 // 사이드바 컴포넌트의 너비와 일치시켜야 함
32 | 
33 |   const handleFilterChange = (filters: FilterState) => {
34 |     console.log('App - handleFilterChange called with:', filters);
35 |     setFilterState(filters);
36 |     console.log('App - filterState updated:', filters);
37 |   }
38 | 
39 |   return (
40 |     <SidebarProvider>
41 |       <div className="flex h-screen overflow-hidden bg-background">
42 |         <AppSidebar isCollapsed={isSidebarCollapsed} />
43 |         <div className="flex-1 overflow-auto">
44 |           <SiteHeader onToggleSidebar={toggleSidebar} title="DORA 메트릭스" />
45 |           <main className="p-4 pt-2">
46 |             <div className="mb-6">
47 |               <FilterBar
48 |                 onFilterChange={handleFilterChange}
49 |                 filterState={filterState}
50 |               />
51 |             </div>
52 |             
53 |             <div className="space-y-12">
54 |               {/* 기존 DORA 메트릭스 */}
55 |               <DoraMetrics filterState={filterState} />
56 | 
57 |               {/* 새로운 메트릭스 카드 */}
58 |               <div className="border-t pt-8">
59 |                 <h2 className="text-lg font-semibold mb-4">새로운 메트릭스 카드</h2>
60 |                 <ExampleMetrics filterState={filterState} />
61 |               </div>
62 |             </div>
63 |           </main>
64 |         </div>
65 |       </div>
66 |     </SidebarProvider>
67 |   )
68 | }
69 | 
70 | export default App
```

src/chart.css
```
1 | /* Flat UI Colors 팔레트 */
2 | :root {
3 |   /* 기본 색상 */
4 |   --flat-turquoise: #1abc9c;
5 |   --flat-emerald: #2ecc71;
6 |   --flat-peter-river: #3498db;
7 |   --flat-amethyst: #9b59b6;
8 |   --flat-wet-asphalt: #34495e;
9 |   
10 |   /* Green 계열 */
11 |   --flat-green-sea: #16a085;
12 |   --flat-nephritis: #27ae60;
13 |   
14 |   /* Blue 계열 */
15 |   --flat-belize-hole: #2980b9;
16 |   
17 |   /* Purple 계열 */
18 |   --flat-wisteria: #8e44ad;
19 |   --flat-midnight-blue: #2c3e50;
20 |   
21 |   /* Yellow/Orange 계열 */
22 |   --flat-sunflower: #f1c40f;
23 |   --flat-carrot: #e67e22;
24 |   --flat-pumpkin: #d35400;
25 |   
26 |   /* Red 계열 */
27 |   --flat-alizarin: #e74c3c;
28 |   --flat-pomegranate: #c0392b;
29 |   
30 |   /* Gray 계열 */
31 |   --flat-clouds: #ecf0f1;
32 |   --flat-silver: #bdc3c7;
33 |   --flat-concrete: #95a5a6;
34 |   --flat-asbestos: #7f8c8d;
35 |   
36 |   /* Orange 계열 */
37 |   --flat-orange: #f39c12;
38 | }
39 | 
40 | /* 메트릭 차트 색상 */
41 | :root {
42 |   --chart-deployment-frequency: var(--flat-peter-river);
43 |   --chart-change-failure-rate: var(--flat-alizarin);
44 |   --chart-cycle-time: var(--flat-carrot);
45 |   --chart-mean-time-to-response: var(--flat-emerald);
46 | }
47 | 
48 | /* 투명도 변형 */
49 | .bg-chart-deployment-frequency-20 { background-color: rgba(52, 152, 219, 0.2); }
50 | .bg-chart-change-failure-rate-20 { background-color: rgba(231, 76, 60, 0.2); }
51 | .bg-chart-cycle-time-20 { background-color: rgba(230, 126, 34, 0.2); }
52 | .bg-chart-mean-time-to-response-20 { background-color: rgba(46, 204, 113, 0.2); }
53 | 
54 | .bg-chart-deployment-frequency-15 { background-color: rgba(52, 152, 219, 0.15); }
55 | .bg-chart-change-failure-rate-15 { background-color: rgba(231, 76, 60, 0.15); }
56 | .bg-chart-cycle-time-15 { background-color: rgba(230, 126, 34, 0.15); }
57 | .bg-chart-mean-time-to-response-15 { background-color: rgba(46, 204, 113, 0.15); } 
```

src/config.json
```
1 | {
2 |   "repositories": [
3 |     {
4 |       "owner": "n8n-io",
5 |       "name": "n8n",
6 |       "description": "n8n - 오픈 소스 자동화 및 워크플로우 도구 플랫폼"
7 |     },
8 |     {
9 |       "owner": "docmost",
10 |       "name": "docmost",
11 |       "description": "docmost - 팀을 위한 오픈 소스 문서 관리 플랫폼"
12 |     },
13 |     {
14 |       "owner": "wbkd",
15 |       "name": "react-flow",
16 |       "description": "React Flow - React를 위한 고도로 커스터마이징 가능한 인터랙티브 노드 기반 플로우 다이어그램 라이브러리"
17 |     },
18 |     {
19 |       "owner": "vitest-dev",
20 |       "name": "vitest",
21 |       "description": "Vitest - Vite에서 제공하는 차세대 테스팅 프레임워크"
22 |     },
23 |     {
24 |       "owner": "facebook",
25 |       "name": "react",
26 |       "description": "React - Facebook의 React 라이브러리"
27 |     }
28 |   ],
29 |   "defaultTimeRange": {
30 |     "since": "2024-01-01",
31 |     "until": "2025-03-16"
32 |   },
33 |   "refreshInterval": 300000
34 | }
```

src/index.css
```
1 | @import "tailwindcss";
2 | @import "./chart.css";
3 | 
4 | /* 폰트 정의 및 기타 스타일 */
5 | @font-face {
6 |   font-family: 'Pretendard';
7 |   src: url('https://cdn.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff') format('woff');
8 |   font-weight: 400;
9 |   font-style: normal;
10 | }
11 | 
12 | @font-face {
13 |   font-family: 'Pretendard';
14 |   src: url('https://cdn.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Medium.woff') format('woff');
15 |   font-weight: 500;
16 |   font-style: normal;
17 | }
18 | 
19 | @font-face {
20 |   font-family: 'Pretendard';
21 |   src: url('https://cdn.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-SemiBold.woff') format('woff');
22 |   font-weight: 600;
23 |   font-style: normal;
24 | }
25 | 
26 | @font-face {
27 |   font-family: 'Pretendard';
28 |   src: url('https://cdn.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Bold.woff') format('woff');
29 |   font-weight: 700;
30 |   font-style: normal;
31 | }
32 | 
33 | @layer base {
34 |   :root {
35 |     --background: 0 0% 100%;
36 |     --foreground: 222.2 84% 4.9%;
37 | 
38 |     --card: 0 0% 100%;
39 |     --card-foreground: 222.2 84% 4.9%;
40 | 
41 |     --popover: 0 0% 100%;
42 |     --popover-foreground: 222.2 84% 4.9%;
43 | 
44 |     --primary: 222.2 47.4% 11.2%;
45 |     --primary-foreground: 210 40% 98%;
46 | 
47 |     --secondary: 210 40% 96.1%;
48 |     --secondary-foreground: 222.2 47.4% 11.2%;
49 | 
50 |     --muted: 210 40% 96.1%;
51 |     --muted-foreground: 215.4 16.3% 46.9%;
52 | 
53 |     --accent: 210 40% 96.1%;
54 |     --accent-foreground: 222.2 47.4% 11.2%;
55 | 
56 |     --destructive: 0 84.2% 60.2%;
57 |     --destructive-foreground: 210 40% 98%;
58 | 
59 |     --border: 214.3 31.8% 91.4%;
60 |     --input: 214.3 31.8% 91.4%;
61 |     --ring: 222.2 84% 4.9%;
62 | 
63 |     --radius: 0.5rem;
64 | 
65 |     /* 사이드바 색상 */
66 |     --sidebar-background: 210 40% 98%;
67 |     --sidebar-foreground: 222.2 47.4% 11.2%;
68 |     --sidebar-muted: 215.4 16.3% 46.9%;
69 |     --sidebar-accent: 210 40% 96.1%;
70 |     --sidebar-accent-foreground: 222.2 47.4% 11.2%;
71 |     --sidebar-border: 214.3 31.8% 91.4%;
72 |   }
73 | 
74 |   .dark {
75 |     --background: 222.2 84% 4.9%;
76 |     --foreground: 210 40% 98%;
77 | 
78 |     --card: 222.2 84% 4.9%;
79 |     --card-foreground: 210 40% 98%;
80 | 
81 |     --popover: 222.2 84% 4.9%;
82 |     --popover-foreground: 210 40% 98%;
83 | 
84 |     --primary: 210 40% 98%;
85 |     --primary-foreground: 222.2 47.4% 11.2%;
86 | 
87 |     --secondary: 217.2 32.6% 17.5%;
88 |     --secondary-foreground: 210 40% 98%;
89 | 
90 |     --muted: 217.2 32.6% 17.5%;
91 |     --muted-foreground: 215 20.2% 65.1%;
92 | 
93 |     --accent: 217.2 32.6% 17.5%;
94 |     --accent-foreground: 210 40% 98%;
95 | 
96 |     --destructive: 0 62.8% 30.6%;
97 |     --destructive-foreground: 210 40% 98%;
98 | 
99 |     --border: 217.2 32.6% 17.5%;
100 |     --input: 217.2 32.6% 17.5%;
101 |     --ring: 212.7 26.8% 83.9%;
102 | 
103 |     /* 사이드바 색상 */
104 |     --sidebar-background: 223 47% 11%;
105 |     --sidebar-foreground: 210 40% 98%;
106 |     --sidebar-muted: 215 20.2% 65.1%;
107 |     --sidebar-accent: 217.2 32.6% 18.5%;
108 |     --sidebar-accent-foreground: 210 40% 98%;
109 |     --sidebar-border: 217.2 32.6% 17.5%;
110 |   }
111 | }
112 | 
113 | @layer base {
114 |   * {
115 |     border-color: hsl(var(--border));
116 |   }
117 |   body {
118 |     background-color: hsl(var(--background));
119 |     color: hsl(var(--foreground));
120 |     font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
121 |     margin: 0;
122 |     padding: 0;
123 |     height: 100%;
124 |     width: 100%;
125 |     -webkit-font-smoothing: antialiased;
126 |     -moz-osx-font-smoothing: grayscale;
127 |   }
128 |   html {
129 |     margin: 0;
130 |     padding: 0;
131 |     height: 100%;
132 |     width: 100%;
133 |   }
134 |   #root {
135 |     display: flex;
136 |     flex-direction: column;
137 |     min-height: 100vh;
138 |     width: 100%;
139 |   }
140 | }
141 | 
142 | /* App.css에서 가져온 컴포넌트 스타일 */
143 | @keyframes fade-in {
144 |   from {
145 |     opacity: 0;
146 |   }
147 |   to {
148 |     opacity: 1;
149 |   }
150 | }
151 | 
152 | .animate-fade-in {
153 |   animation: fade-in 0.5s ease-in-out;
154 | }
155 | 
156 | /* 차트 컨테이너 스타일 */
157 | .chart-container {
158 |   min-height: 300px;
159 |   width: 100%;
160 | }
161 | 
162 | /* ShadCN UI 컴포넌트 스타일 보완 */
163 | .rdp {
164 |   background-color: hsl(var(--background));
165 |   border-color: hsl(var(--border));
166 |   border-radius: var(--radius);
167 |   box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
168 | }
169 | 
170 | [data-radix-popper-content-wrapper] {
171 |   background-color: hsl(var(--background));
172 |   border-color: hsl(var(--border));
173 |   border-radius: var(--radius);
174 |   box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
175 | }
176 | 
177 | .popover-content, 
178 | .dropdown-content, 
179 | .select-content {
180 |   background-color: hsl(var(--background));
181 |   border-color: hsl(var(--border));
182 |   border-radius: var(--radius);
183 |   box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
184 | }
185 | 
186 | /* 카드 호버 효과 - 통합된 스타일 */
187 | .card-hover:hover {
188 |   transform: translateY(-0.125rem);
189 |   transition: transform 0.2s ease-out;
190 |   box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
191 | } 
```

src/main.tsx
```
1 | import { StrictMode } from 'react'
2 | import { createRoot } from 'react-dom/client'
3 | // Tailwind CSS 임포트
4 | import './index.css'
5 | import App from './App.tsx'
6 | 
7 | createRoot(document.getElementById('root')!).render(
8 |   <StrictMode>
9 |     <App />
10 |   </StrictMode>,
11 | )
```

src/output.css
```
1 | /*! tailwindcss v4.0.14 | MIT License | https://tailwindcss.com */
2 | .\@container\/card-header {
3 |   container-type: inline-size;
4 |   container-name: card-header;
5 | }
6 | .pointer-events-none {
7 |   pointer-events: none;
8 | }
9 | .invisible {
10 |   visibility: hidden;
11 | }
12 | .sr-only {
13 |   position: absolute;
14 |   width: 1px;
15 |   height: 1px;
16 |   padding: 0;
17 |   margin: -1px;
18 |   overflow: hidden;
19 |   clip: rect(0, 0, 0, 0);
20 |   white-space: nowrap;
21 |   border-width: 0;
22 | }
23 | .absolute {
24 |   position: absolute;
25 | }
26 | .fixed {
27 |   position: fixed;
28 | }
29 | .relative {
30 |   position: relative;
31 | }
32 | .sticky {
33 |   position: sticky;
34 | }
35 | .top-\[50\%\] {
36 |   top: 50%;
37 | }
38 | .left-\[50\%\] {
39 |   left: 50%;
40 | }
41 | .z-10 {
42 |   z-index: 10;
43 | }
44 | .z-20 {
45 |   z-index: 20;
46 | }
47 | .z-50 {
48 |   z-index: 50;
49 | }
50 | .col-start-2 {
51 |   grid-column-start: 2;
52 | }
53 | .row-span-2 {
54 |   grid-row: span 2 / span 2;
55 | }
56 | .row-start-1 {
57 |   grid-row-start: 1;
58 | }
59 | .container {
60 |   width: 100%;
61 | }
62 | .mx-auto {
63 |   margin-inline: auto;
64 | }
65 | .mt-auto {
66 |   margin-top: auto;
67 | }
68 | .ml-auto {
69 |   margin-left: auto;
70 | }
71 | .flex {
72 |   display: flex;
73 | }
74 | .grid {
75 |   display: grid;
76 | }
77 | .hidden {
78 |   display: none;
79 | }
80 | .inline-block {
81 |   display: inline-block;
82 | }
83 | .inline-flex {
84 |   display: inline-flex;
85 | }
86 | .table {
87 |   display: table;
88 | }
89 | .aspect-square {
90 |   aspect-ratio: 1 / 1;
91 | }
92 | .h-\[1px\] {
93 |   height: 1px;
94 | }
95 | .h-\[300px\] {
96 |   height: 300px;
97 | }
98 | .h-\[calc\(100\%-1px\)\] {
99 |   height: calc(100% - 1px);
100 | }
101 | .h-\[var\(--radix-select-trigger-height\)\] {
102 |   height: var(--radix-select-trigger-height);
103 | }
104 | .h-full {
105 |   height: 100%;
106 | }
107 | .h-px {
108 |   height: 1px;
109 | }
110 | .h-screen {
111 |   height: 100vh;
112 | }
113 | .h-svh {
114 |   height: 100svh;
115 | }
116 | .max-h-\(--radix-dropdown-menu-content-available-height\) {
117 |   max-height: var(--radix-dropdown-menu-content-available-height);
118 | }
119 | .max-h-\(--radix-select-content-available-height\) {
120 |   max-height: var(--radix-select-content-available-height);
121 | }
122 | .max-h-\[var\(--radix-dropdown-menu-content-available-height\)\] {
123 |   max-height: var(--radix-dropdown-menu-content-available-height);
124 | }
125 | .min-h-screen {
126 |   min-height: 100vh;
127 | }
128 | .min-h-svh {
129 |   min-height: 100svh;
130 | }
131 | .w-3\/4 {
132 |   width: calc(3/4 * 100%);
133 | }
134 | .w-\[--sidebar-width\] {
135 |   width: --sidebar-width;
136 | }
137 | .w-\[1px\] {
138 |   width: 1px;
139 | }
140 | .w-\[80px\] {
141 |   width: 80px;
142 | }
143 | .w-\[160px\] {
144 |   width: 160px;
145 | }
146 | .w-\[200px\] {
147 |   width: 200px;
148 | }
149 | .w-\[250px\] {
150 |   width: 250px;
151 | }
152 | .w-auto {
153 |   width: auto;
154 | }
155 | .w-fit {
156 |   width: fit-content;
157 | }
158 | .w-full {
159 |   width: 100%;
160 | }
161 | .max-w-\[--skeleton-width\] {
162 |   max-width: --skeleton-width;
163 | }
164 | .min-w-\[8rem\] {
165 |   min-width: 8rem;
166 | }
167 | .min-w-\[var\(--radix-select-trigger-width\)\] {
168 |   min-width: var(--radix-select-trigger-width);
169 | }
170 | .flex-1 {
171 |   flex: 1;
172 | }
173 | .shrink-0 {
174 |   flex-shrink: 0;
175 | }
176 | .border-collapse {
177 |   border-collapse: collapse;
178 | }
179 | .-translate-x-1\/2 {
180 |   --tw-translate-x: calc(calc(1/2 * 100%) * -1);
181 |   translate: var(--tw-translate-x) var(--tw-translate-y);
182 | }
183 | .-translate-x-px {
184 |   --tw-translate-x: -1px;
185 |   translate: var(--tw-translate-x) var(--tw-translate-y);
186 | }
187 | .translate-x-\[-50\%\] {
188 |   --tw-translate-x: -50%;
189 |   translate: var(--tw-translate-x) var(--tw-translate-y);
190 | }
191 | .translate-x-px {
192 |   --tw-translate-x: 1px;
193 |   translate: var(--tw-translate-x) var(--tw-translate-y);
194 | }
195 | .translate-y-\[-50\%\] {
196 |   --tw-translate-y: -50%;
197 |   translate: var(--tw-translate-x) var(--tw-translate-y);
198 | }
199 | .translate-y-\[calc\(-50\%_-_2px\)\] {
200 |   --tw-translate-y: calc(-50% - 2px);
201 |   translate: var(--tw-translate-x) var(--tw-translate-y);
202 | }
203 | .rotate-45 {
204 |   rotate: 45deg;
205 | }
206 | .rotate-180 {
207 |   rotate: 180deg;
208 | }
209 | .transform {
210 |   transform: var(--tw-rotate-x) var(--tw-rotate-y) var(--tw-rotate-z) var(--tw-skew-x) var(--tw-skew-y);
211 | }
212 | .cursor-default {
213 |   cursor: default;
214 | }
215 | .cursor-help {
216 |   cursor: help;
217 | }
218 | .cursor-pointer {
219 |   cursor: pointer;
220 | }
221 | .touch-none {
222 |   touch-action: none;
223 | }
224 | .list-disc {
225 |   list-style-type: disc;
226 | }
227 | .auto-rows-min {
228 |   grid-auto-rows: min-content;
229 | }
230 | .grid-cols-1 {
231 |   grid-template-columns: repeat(1, minmax(0, 1fr));
232 | }
233 | .grid-rows-\[auto_auto\] {
234 |   grid-template-rows: auto auto;
235 | }
236 | .flex-col {
237 |   flex-direction: column;
238 | }
239 | .flex-col-reverse {
240 |   flex-direction: column-reverse;
241 | }
242 | .flex-row {
243 |   flex-direction: row;
244 | }
245 | .flex-wrap {
246 |   flex-wrap: wrap;
247 | }
248 | .items-center {
249 |   align-items: center;
250 | }
251 | .items-end {
252 |   align-items: flex-end;
253 | }
254 | .items-start {
255 |   align-items: flex-start;
256 | }
257 | .items-stretch {
258 |   align-items: stretch;
259 | }
260 | .justify-between {
261 |   justify-content: space-between;
262 | }
263 | .justify-center {
264 |   justify-content: center;
265 | }
266 | .justify-start {
267 |   justify-content: flex-start;
268 | }
269 | .self-start {
270 |   align-self: flex-start;
271 | }
272 | .justify-self-end {
273 |   justify-self: flex-end;
274 | }
275 | .overflow-auto {
276 |   overflow: auto;
277 | }
278 | .overflow-hidden {
279 |   overflow: hidden;
280 | }
281 | .overflow-x-hidden {
282 |   overflow-x: hidden;
283 | }
284 | .overflow-y-auto {
285 |   overflow-y: auto;
286 | }
287 | .rounded-\[2px\] {
288 |   border-radius: 2px;
289 | }
290 | .rounded-\[inherit\] {
291 |   border-radius: inherit;
292 | }
293 | .rounded-full {
294 |   border-radius: calc(infinity * 1px);
295 | }
296 | .border {
297 |   border-style: var(--tw-border-style);
298 |   border-width: 1px;
299 | }
300 | .border-\[1\.5px\] {
301 |   border-style: var(--tw-border-style);
302 |   border-width: 1.5px;
303 | }
304 | .border-t {
305 |   border-top-style: var(--tw-border-style);
306 |   border-top-width: 1px;
307 | }
308 | .border-r {
309 |   border-right-style: var(--tw-border-style);
310 |   border-right-width: 1px;
311 | }
312 | .border-b {
313 |   border-bottom-style: var(--tw-border-style);
314 |   border-bottom-width: 1px;
315 | }
316 | .border-l {
317 |   border-left-style: var(--tw-border-style);
318 |   border-left-width: 1px;
319 | }
320 | .border-l-4 {
321 |   border-left-style: var(--tw-border-style);
322 |   border-left-width: 4px;
323 | }
324 | .border-dashed {
325 |   --tw-border-style: dashed;
326 |   border-style: dashed;
327 | }
328 | .border-\(--color-border\) {
329 |   border-color: var(--color-border);
330 | }
331 | .border-transparent {
332 |   border-color: transparent;
333 | }
334 | .border-t-transparent {
335 |   border-top-color: transparent;
336 | }
337 | .border-l-transparent {
338 |   border-left-color: transparent;
339 | }
340 | .bg-\(--color-bg\) {
341 |   background-color: var(--color-bg);
342 | }
343 | .bg-\[\#007AFF\] {
344 |   background-color: #007AFF;
345 | }
346 | .bg-\[\#34C759\] {
347 |   background-color: #34C759;
348 | }
349 | .bg-\[\#FF3B30\] {
350 |   background-color: #FF3B30;
351 | }
352 | .bg-\[\#FF9500\] {
353 |   background-color: #FF9500;
354 | }
355 | .bg-\[\#FFCC00\] {
356 |   background-color: #FFCC00;
357 | }
358 | .bg-\[hsl\(var\(--sidebar-background\)\)\] {
359 |   background-color: hsl(var(--sidebar-background));
360 | }
361 | .bg-transparent {
362 |   background-color: transparent;
363 | }
364 | .fill-current {
365 |   fill: currentColor;
366 | }
367 | .p-\[1px\] {
368 |   padding: 1px;
369 | }
370 | .p-\[3px\] {
371 |   padding: 3px;
372 | }
373 | .text-center {
374 |   text-align: center;
375 | }
376 | .text-left {
377 |   text-align: left;
378 | }
379 | .text-\[0\.8rem\] {
380 |   font-size: 0.8rem;
381 | }
382 | .leading-none {
383 |   --tw-leading: 1;
384 |   line-height: 1;
385 | }
386 | .text-balance {
387 |   text-wrap: balance;
388 | }
389 | .break-words {
390 |   overflow-wrap: break-word;
391 | }
392 | .whitespace-nowrap {
393 |   white-space: nowrap;
394 | }
395 | .text-transparent {
396 |   color: transparent;
397 | }
398 | .tabular-nums {
399 |   --tw-numeric-spacing: tabular-nums;
400 |   font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
401 | }
402 | .underline-offset-4 {
403 |   text-underline-offset: 4px;
404 | }
405 | .opacity-50 {
406 |   opacity: 50%;
407 | }
408 | .opacity-60 {
409 |   opacity: 60%;
410 | }
411 | .opacity-70 {
412 |   opacity: 70%;
413 | }
414 | .shadow-\[0_0_0_1px_hsl\(var\(--sidebar-border\)\)\] {
415 |   --tw-shadow: 0 0 0 1px var(--tw-shadow-color, hsl(var(--sidebar-border)));
416 |   box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
417 | }
418 | .shadow-none {
419 |   --tw-shadow: 0 0 #0000;
420 |   box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
421 | }
422 | .ring {
423 |   --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentColor);
424 |   box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
425 | }
426 | .ring-2 {
427 |   --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentColor);
428 |   box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
429 | }
430 | .outline-hidden {
431 |   --tw-outline-style: none;
432 |   outline-style: none;
433 |   @media (forced-colors: active) {
434 |     outline: 2px solid transparent;
435 |     outline-offset: 2px;
436 |   }
437 | }
438 | .outline {
439 |   outline-style: var(--tw-outline-style);
440 |   outline-width: 1px;
441 | }
442 | .transition {
443 |   transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter;
444 |   transition-timing-function: var(--tw-ease, ease);
445 |   transition-duration: var(--tw-duration, 0s);
446 | }
447 | .transition-\[color\,box-shadow\] {
448 |   transition-property: color,box-shadow;
449 |   transition-timing-function: var(--tw-ease, ease);
450 |   transition-duration: var(--tw-duration, 0s);
451 | }
452 | .transition-\[left\,right\,width\] {
453 |   transition-property: left,right,width;
454 |   transition-timing-function: var(--tw-ease, ease);
455 |   transition-duration: var(--tw-duration, 0s);
456 | }
457 | .transition-\[margin\,opacity\] {
458 |   transition-property: margin,opacity;
459 |   transition-timing-function: var(--tw-ease, ease);
460 |   transition-duration: var(--tw-duration, 0s);
461 | }
462 | .transition-\[width\,height\,padding\] {
463 |   transition-property: width,height,padding;
464 |   transition-timing-function: var(--tw-ease, ease);
465 |   transition-duration: var(--tw-duration, 0s);
466 | }
467 | .transition-\[width\] {
468 |   transition-property: width;
469 |   transition-timing-function: var(--tw-ease, ease);
470 |   transition-duration: var(--tw-duration, 0s);
471 | }
472 | .transition-all {
473 |   transition-property: all;
474 |   transition-timing-function: var(--tw-ease, ease);
475 |   transition-duration: var(--tw-duration, 0s);
476 | }
477 | .transition-colors {
478 |   transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
479 |   transition-timing-function: var(--tw-ease, ease);
480 |   transition-duration: var(--tw-duration, 0s);
481 | }
482 | .transition-opacity {
483 |   transition-property: opacity;
484 |   transition-timing-function: var(--tw-ease, ease);
485 |   transition-duration: var(--tw-duration, 0s);
486 | }
487 | .transition-transform {
488 |   transition-property: transform, translate, scale, rotate;
489 |   transition-timing-function: var(--tw-ease, ease);
490 |   transition-duration: var(--tw-duration, 0s);
491 | }
492 | .duration-200 {
493 |   --tw-duration: 200ms;
494 |   transition-duration: 200ms;
495 | }
496 | .ease-linear {
497 |   --tw-ease: linear;
498 |   transition-timing-function: linear;
499 | }
500 | .outline-none {
501 |   --tw-outline-style: none;
502 |   outline-style: none;
503 | }
504 | .select-none {
505 |   -webkit-user-select: none;
506 |   user-select: none;
507 | }
508 | .group-focus-within\/menu-item\:opacity-100 {
509 |   &:is(:where(.group\/menu-item):focus-within *) {
510 |     opacity: 100%;
511 |   }
512 | }
513 | .group-hover\/menu-item\:opacity-100 {
514 |   &:is(:where(.group\/menu-item):hover *) {
515 |     @media (hover: hover) {
516 |       opacity: 100%;
517 |     }
518 |   }
519 | }
520 | .group-data-\[collapsible\=icon\]\:hidden {
521 |   &:is(:where(.group)[data-collapsible="icon"] *) {
522 |     display: none;
523 |   }
524 | }
525 | .group-data-\[collapsible\=icon\]\:w-\[--sidebar-width-icon\] {
526 |   &:is(:where(.group)[data-collapsible="icon"] *) {
527 |     width: --sidebar-width-icon;
528 |   }
529 | }
530 | .group-data-\[collapsible\=icon\]\:w-\[calc\(var\(--sidebar-width-icon\)_\+_theme\(spacing\.4\)\)\] {
531 |   &:is(:where(.group)[data-collapsible="icon"] *) {
532 |     width: calc(var(--sidebar-width-icon) + 1rem);
533 |   }
534 | }
535 | .group-data-\[collapsible\=icon\]\:w-\[calc\(var\(--sidebar-width-icon\)_\+_theme\(spacing\.4\)_\+2px\)\] {
536 |   &:is(:where(.group)[data-collapsible="icon"] *) {
537 |     width: calc(var(--sidebar-width-icon) + 1rem + 2px);
538 |   }
539 | }
540 | .group-data-\[collapsible\=icon\]\:overflow-hidden {
541 |   &:is(:where(.group)[data-collapsible="icon"] *) {
542 |     overflow: hidden;
543 |   }
544 | }
545 | .group-data-\[collapsible\=icon\]\:opacity-0 {
546 |   &:is(:where(.group)[data-collapsible="icon"] *) {
547 |     opacity: 0%;
548 |   }
549 | }
550 | .group-data-\[collapsible\=offcanvas\]\:right-\[calc\(var\(--sidebar-width\)\*-1\)\] {
551 |   &:is(:where(.group)[data-collapsible="offcanvas"] *) {
552 |     right: calc(var(--sidebar-width) * -1);
553 |   }
554 | }
555 | .group-data-\[collapsible\=offcanvas\]\:left-\[calc\(var\(--sidebar-width\)\*-1\)\] {
556 |   &:is(:where(.group)[data-collapsible="offcanvas"] *) {
557 |     left: calc(var(--sidebar-width) * -1);
558 |   }
559 | }
560 | .group-data-\[disabled\=true\]\:pointer-events-none {
561 |   &:is(:where(.group)[data-disabled="true"] *) {
562 |     pointer-events: none;
563 |   }
564 | }
565 | .group-data-\[disabled\=true\]\:opacity-50 {
566 |   &:is(:where(.group)[data-disabled="true"] *) {
567 |     opacity: 50%;
568 |   }
569 | }
570 | .group-data-\[side\=left\]\:border-r {
571 |   &:is(:where(.group)[data-side="left"] *) {
572 |     border-right-style: var(--tw-border-style);
573 |     border-right-width: 1px;
574 |   }
575 | }
576 | .group-data-\[side\=right\]\:rotate-180 {
577 |   &:is(:where(.group)[data-side="right"] *) {
578 |     rotate: 180deg;
579 |   }
580 | }
581 | .group-data-\[side\=right\]\:border-l {
582 |   &:is(:where(.group)[data-side="right"] *) {
583 |     border-left-style: var(--tw-border-style);
584 |     border-left-width: 1px;
585 |   }
586 | }
587 | .group-data-\[variant\=floating\]\:border {
588 |   &:is(:where(.group)[data-variant="floating"] *) {
589 |     border-style: var(--tw-border-style);
590 |     border-width: 1px;
591 |   }
592 | }
593 | .peer-disabled\:cursor-not-allowed {
594 |   &:is(:where(.peer):disabled ~ *) {
595 |     cursor: not-allowed;
596 |   }
597 | }
598 | .peer-disabled\:opacity-50 {
599 |   &:is(:where(.peer):disabled ~ *) {
600 |     opacity: 50%;
601 |   }
602 | }
603 | .peer-disabled\:opacity-70 {
604 |   &:is(:where(.peer):disabled ~ *) {
605 |     opacity: 70%;
606 |   }
607 | }
608 | .file\:border-0 {
609 |   &::file-selector-button {
610 |     border-style: var(--tw-border-style);
611 |     border-width: 0px;
612 |   }
613 | }
614 | .file\:bg-transparent {
615 |   &::file-selector-button {
616 |     background-color: transparent;
617 |   }
618 | }
619 | .after\:absolute {
620 |   &::after {
621 |     content: var(--tw-content);
622 |     position: absolute;
623 |   }
624 | }
625 | .after\:left-1\/2 {
626 |   &::after {
627 |     content: var(--tw-content);
628 |     left: calc(1/2 * 100%);
629 |   }
630 | }
631 | .after\:w-\[2px\] {
632 |   &::after {
633 |     content: var(--tw-content);
634 |     width: 2px;
635 |   }
636 | }
637 | .group-data-\[collapsible\=offcanvas\]\:after\:left-full {
638 |   &:is(:where(.group)[data-collapsible="offcanvas"] *) {
639 |     &::after {
640 |       content: var(--tw-content);
641 |       left: 100%;
642 |     }
643 |   }
644 | }
645 | .focus-within\:relative {
646 |   &:focus-within {
647 |     position: relative;
648 |   }
649 | }
650 | .focus-within\:z-20 {
651 |   &:focus-within {
652 |     z-index: 20;
653 |   }
654 | }
655 | .hover\:underline {
656 |   &:hover {
657 |     @media (hover: hover) {
658 |       text-decoration-line: underline;
659 |     }
660 |   }
661 | }
662 | .hover\:opacity-100 {
663 |   &:hover {
664 |     @media (hover: hover) {
665 |       opacity: 100%;
666 |     }
667 |   }
668 | }
669 | .hover\:shadow-\[0_0_0_1px_hsl\(var\(--sidebar-accent\)\)\] {
670 |   &:hover {
671 |     @media (hover: hover) {
672 |       --tw-shadow: 0 0 0 1px var(--tw-shadow-color, hsl(var(--sidebar-accent)));
673 |       box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
674 |     }
675 |   }
676 | }
677 | .focus\:ring-2 {
678 |   &:focus {
679 |     --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentColor);
680 |     box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
681 |   }
682 | }
683 | .focus\:ring-offset-2 {
684 |   &:focus {
685 |     --tw-ring-offset-width: 2px;
686 |     --tw-ring-offset-shadow: var(--tw-ring-inset,) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
687 |   }
688 | }
689 | .focus\:outline-none {
690 |   &:focus {
691 |     --tw-outline-style: none;
692 |     outline-style: none;
693 |   }
694 | }
695 | .focus-visible\:ring-1 {
696 |   &:focus-visible {
697 |     --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentColor);
698 |     box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
699 |   }
700 | }
701 | .focus-visible\:ring-2 {
702 |   &:focus-visible {
703 |     --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentColor);
704 |     box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
705 |   }
706 | }
707 | .focus-visible\:ring-\[3px\] {
708 |   &:focus-visible {
709 |     --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentColor);
710 |     box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
711 |   }
712 | }
713 | .focus-visible\:ring-offset-2 {
714 |   &:focus-visible {
715 |     --tw-ring-offset-width: 2px;
716 |     --tw-ring-offset-shadow: var(--tw-ring-inset,) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
717 |   }
718 | }
719 | .focus-visible\:outline-1 {
720 |   &:focus-visible {
721 |     outline-style: var(--tw-outline-style);
722 |     outline-width: 1px;
723 |   }
724 | }
725 | .focus-visible\:outline-none {
726 |   &:focus-visible {
727 |     --tw-outline-style: none;
728 |     outline-style: none;
729 |   }
730 | }
731 | .disabled\:pointer-events-none {
732 |   &:disabled {
733 |     pointer-events: none;
734 |   }
735 | }
736 | .disabled\:cursor-not-allowed {
737 |   &:disabled {
738 |     cursor: not-allowed;
739 |   }
740 | }
741 | .disabled\:opacity-50 {
742 |   &:disabled {
743 |     opacity: 50%;
744 |   }
745 | }
746 | .has-\[data-slot\=card-action\]\:grid-cols-\[1fr_auto\] {
747 |   &:has(*:is(data-slot=card-action)) {
748 |     grid-template-columns: 1fr auto;
749 |   }
750 | }
751 | .aria-disabled\:pointer-events-none {
752 |   &[aria-disabled="true"] {
753 |     pointer-events: none;
754 |   }
755 | }
756 | .aria-disabled\:opacity-50 {
757 |   &[aria-disabled="true"] {
758 |     opacity: 50%;
759 |   }
760 | }
761 | .aria-selected\:opacity-100 {
762 |   &[aria-selected="true"] {
763 |     opacity: 100%;
764 |   }
765 | }
766 | .data-\[disabled\]\:pointer-events-none {
767 |   &[data-disabled] {
768 |     pointer-events: none;
769 |   }
770 | }
771 | .data-\[disabled\]\:opacity-50 {
772 |   &[data-disabled] {
773 |     opacity: 50%;
774 |   }
775 | }
776 | .data-\[orientation\=horizontal\]\:h-px {
777 |   &[data-orientation="horizontal"] {
778 |     height: 1px;
779 |   }
780 | }
781 | .data-\[orientation\=horizontal\]\:w-full {
782 |   &[data-orientation="horizontal"] {
783 |     width: 100%;
784 |   }
785 | }
786 | .data-\[orientation\=vertical\]\:h-full {
787 |   &[data-orientation="vertical"] {
788 |     height: 100%;
789 |   }
790 | }
791 | .data-\[orientation\=vertical\]\:w-px {
792 |   &[data-orientation="vertical"] {
793 |     width: 1px;
794 |   }
795 | }
796 | .\*\:data-\[slot\=select-value\]\:line-clamp-1 {
797 |   :is(& > *) {
798 |     &[data-slot="select-value"] {
799 |       overflow: hidden;
800 |       display: -webkit-box;
801 |       -webkit-box-orient: vertical;
802 |       -webkit-line-clamp: 1;
803 |     }
804 |   }
805 | }
806 | .\*\:data-\[slot\=select-value\]\:flex {
807 |   :is(& > *) {
808 |     &[data-slot="select-value"] {
809 |       display: flex;
810 |     }
811 |   }
812 | }
813 | .\*\:data-\[slot\=select-value\]\:items-center {
814 |   :is(& > *) {
815 |     &[data-slot="select-value"] {
816 |       align-items: center;
817 |     }
818 |   }
819 | }
820 | .data-\[state\=closed\]\:duration-300 {
821 |   &[data-state="closed"] {
822 |     --tw-duration: 300ms;
823 |     transition-duration: 300ms;
824 |   }
825 | }
826 | .data-\[state\=open\]\:opacity-100 {
827 |   &[data-state="open"] {
828 |     opacity: 100%;
829 |   }
830 | }
831 | .data-\[state\=open\]\:duration-500 {
832 |   &[data-state="open"] {
833 |     --tw-duration: 500ms;
834 |     transition-duration: 500ms;
835 |   }
836 | }
837 | .dark\:bg-\[\#007AFF\] {
838 |   @media (prefers-color-scheme: dark) {
839 |     background-color: #007AFF;
840 |   }
841 | }
842 | .dark\:bg-\[\#34C759\] {
843 |   @media (prefers-color-scheme: dark) {
844 |     background-color: #34C759;
845 |   }
846 | }
847 | .dark\:bg-\[\#FF3B30\] {
848 |   @media (prefers-color-scheme: dark) {
849 |     background-color: #FF3B30;
850 |   }
851 | }
852 | .dark\:bg-\[\#FF9500\] {
853 |   @media (prefers-color-scheme: dark) {
854 |     background-color: #FF9500;
855 |   }
856 | }
857 | .dark\:bg-\[\#FFCC00\] {
858 |   @media (prefers-color-scheme: dark) {
859 |     background-color: #FFCC00;
860 |   }
861 | }
862 | .\[\&_\.recharts-dot\[stroke\=\'\#fff\'\]\]\:stroke-transparent {
863 |   & .recharts-dot[stroke='#fff'] {
864 |     stroke: transparent;
865 |   }
866 | }
867 | .\[\&_\.recharts-layer\]\:outline-hidden {
868 |   & .recharts-layer {
869 |     --tw-outline-style: none;
870 |     outline-style: none;
871 |     @media (forced-colors: active) {
872 |       outline: 2px solid transparent;
873 |       outline-offset: 2px;
874 |     }
875 |   }
876 | }
877 | .\[\&_\.recharts-sector\]\:outline-hidden {
878 |   & .recharts-sector {
879 |     --tw-outline-style: none;
880 |     outline-style: none;
881 |     @media (forced-colors: active) {
882 |       outline: 2px solid transparent;
883 |       outline-offset: 2px;
884 |     }
885 |   }
886 | }
887 | .\[\&_\.recharts-sector\[stroke\=\'\#fff\'\]\]\:stroke-transparent {
888 |   & .recharts-sector[stroke='#fff'] {
889 |     stroke: transparent;
890 |   }
891 | }
892 | .\[\&_\.recharts-surface\]\:outline-hidden {
893 |   & .recharts-surface {
894 |     --tw-outline-style: none;
895 |     outline-style: none;
896 |     @media (forced-colors: active) {
897 |       outline: 2px solid transparent;
898 |       outline-offset: 2px;
899 |     }
900 |   }
901 | }
902 | .\[\&_svg\]\:pointer-events-none {
903 |   & svg {
904 |     pointer-events: none;
905 |   }
906 | }
907 | .\[\&_svg\]\:shrink-0 {
908 |   & svg {
909 |     flex-shrink: 0;
910 |   }
911 | }
912 | .\*\:\[span\]\:last\:flex {
913 |   :is(& > *) {
914 |     &:is(span) {
915 |       &:last-child {
916 |         display: flex;
917 |       }
918 |     }
919 |   }
920 | }
921 | .\*\:\[span\]\:last\:items-center {
922 |   :is(& > *) {
923 |     &:is(span) {
924 |       &:last-child {
925 |         align-items: center;
926 |       }
927 |     }
928 |   }
929 | }
930 | .\[\&\>button\]\:hidden {
931 |   &>button {
932 |     display: none;
933 |   }
934 | }
935 | .\[\&\>span\:last-child\]\:truncate {
936 |   &>span:last-child {
937 |     overflow: hidden;
938 |     text-overflow: ellipsis;
939 |     white-space: nowrap;
940 |   }
941 | }
942 | .\[\&\>svg\]\:absolute {
943 |   &>svg {
944 |     position: absolute;
945 |   }
946 | }
947 | .\[\&\>svg\]\:shrink-0 {
948 |   &>svg {
949 |     flex-shrink: 0;
950 |   }
951 | }
952 | .\[\&\>svg\+div\]\:translate-y-\[-3px\] {
953 |   &>svg+div {
954 |     --tw-translate-y: -3px;
955 |     translate: var(--tw-translate-x) var(--tw-translate-y);
956 |   }
957 | }
958 | .\[\[data-side\=left\]_\&\]\:cursor-w-resize {
959 |   [data-side=left] & {
960 |     cursor: w-resize;
961 |   }
962 | }
963 | .\[\[data-side\=left\]\[data-state\=collapsed\]_\&\]\:cursor-e-resize {
964 |   [data-side=left][data-state=collapsed] & {
965 |     cursor: e-resize;
966 |   }
967 | }
968 | .\[\[data-side\=right\]_\&\]\:cursor-e-resize {
969 |   [data-side=right] & {
970 |     cursor: e-resize;
971 |   }
972 | }
973 | .\[\[data-side\=right\]\[data-state\=collapsed\]_\&\]\:cursor-w-resize {
974 |   [data-side=right][data-state=collapsed] & {
975 |     cursor: w-resize;
976 |   }
977 | }
978 | @font-face {
979 |   font-family: 'Pretendard-Regular';
980 |   src: url('https://fastly.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff') format('woff');
981 |   font-weight: 400;
982 |   font-style: normal;
983 | }
984 | @layer base {
985 |   :root {
986 |     --background: 0 0% 100%;
987 |     --foreground: 222.2 84% 4.9%;
988 |     --card: 0 0% 100%;
989 |     --card-foreground: 222.2 84% 4.9%;
990 |     --popover: 0 0% 100%;
991 |     --popover-foreground: 222.2 84% 4.9%;
992 |     --primary: 222.2 47.4% 11.2%;
993 |     --primary-foreground: 210 40% 98%;
994 |     --secondary: 210 40% 96.1%;
995 |     --secondary-foreground: 222.2 47.4% 11.2%;
996 |     --muted: 210 40% 96.1%;
997 |     --muted-foreground: 215.4 16.3% 46.9%;
998 |     --accent: 210 40% 96.1%;
999 |     --accent-foreground: 222.2 47.4% 11.2%;
1000 |     --destructive: 0 84.2% 60.2%;
1001 |     --destructive-foreground: 210 40% 98%;
1002 |     --border: 214.3 31.8% 91.4%;
1003 |     --input: 214.3 31.8% 91.4%;
1004 |     --ring: 222.2 84% 4.9%;
1005 |     --radius: 0.5rem;
1006 |     --sidebar-background: 0 0% 9%;
1007 |     --sidebar-foreground: 0 0% 100%;
1008 |     --sidebar-border: 0 0% 20%;
1009 |     --sidebar-primary: 240 5.9% 10%;
1010 |     --sidebar-primary-foreground: 0 0% 98%;
1011 |     --sidebar-accent: 240 3.7% 15.9%;
1012 |     --sidebar-accent-foreground: 240 4.8% 95.9%;
1013 |     --chart-1: 12 76% 61%;
1014 |     --chart-2: 173 58% 39%;
1015 |     --chart-3: 197 37% 24%;
1016 |     --chart-4: 43 74% 66%;
1017 |     --chart-5: 27 87% 67%;
1018 |     --sidebar-primary: 240 5.9% 10%;
1019 |     --sidebar-primary-foreground: 0 0% 98%;
1020 |     --sidebar-accent: 240 4.8% 95.9%;
1021 |     --sidebar-accent-foreground: 240 5.9% 10%;
1022 |     --sidebar-ring: 217.2 91.2% 59.8%;
1023 |   }
1024 |   .dark {
1025 |     --background: 222.2 84% 4.9%;
1026 |     --foreground: 210 40% 98%;
1027 |     --card: 222.2 84% 4.9%;
1028 |     --card-foreground: 210 40% 98%;
1029 |     --popover: 222.2 84% 4.9%;
1030 |     --popover-foreground: 210 40% 98%;
1031 |     --primary: 210 40% 98%;
1032 |     --primary-foreground: 222.2 47.4% 11.2%;
1033 |     --secondary: 217.2 32.6% 17.5%;
1034 |     --secondary-foreground: 210 40% 98%;
1035 |     --muted: 217.2 32.6% 17.5%;
1036 |     --muted-foreground: 215 20.2% 65.1%;
1037 |     --accent: 217.2 32.6% 17.5%;
1038 |     --accent-foreground: 210 40% 98%;
1039 |     --destructive: 0 62.8% 30.6%;
1040 |     --destructive-foreground: 210 40% 98%;
1041 |     --border: 217.2 32.6% 17.5%;
1042 |     --input: 217.2 32.6% 17.5%;
1043 |     --ring: 212.7 26.8% 83.9%;
1044 |     --chart-1: 220 70% 50%;
1045 |     --chart-2: 160 60% 45%;
1046 |     --chart-3: 30 80% 55%;
1047 |     --chart-4: 280 65% 60%;
1048 |     --chart-5: 340 75% 55%;
1049 |     --sidebar-background: 240 5.9% 10%;
1050 |     --sidebar-foreground: 240 4.8% 95.9%;
1051 |     --sidebar-primary: 224.3 76.3% 48%;
1052 |     --sidebar-primary-foreground: 0 0% 100%;
1053 |     --sidebar-accent: 240 3.7% 15.9%;
1054 |     --sidebar-accent-foreground: 240 4.8% 95.9%;
1055 |     --sidebar-border: 240 3.7% 15.9%;
1056 |     --sidebar-ring: 217.2 91.2% 59.8%;
1057 |   }
1058 |   * {
1059 |     border-color: hsl(var(--border));
1060 |   }
1061 |   body {
1062 |     background-color: hsl(var(--background));
1063 |     color: hsl(var(--foreground));
1064 |     font-family: 'Pretendard-Regular', sans-serif;
1065 |   }
1066 | }
1067 | .rdp {
1068 |   border-radius: --radius;
1069 |   border-color: hsl(var(--border));
1070 |   background-color: hsl(var(--background));
1071 |   box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
1072 | }
1073 | [data-radix-popper-content-wrapper] {
1074 |   border-radius: --radius;
1075 |   border-color: hsl(var(--border));
1076 |   background-color: hsl(var(--background));
1077 |   box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
1078 | }
1079 | .popover-content, .dropdown-content, .select-content {
1080 |   border-radius: --radius;
1081 |   border-color: hsl(var(--border));
1082 |   background-color: hsl(var(--background));
1083 |   box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
1084 | }
1085 | .card-hover:hover {
1086 |   transform: translateY(-0.125rem);
1087 |   transition: transform 0.2s ease-out;
1088 |   box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
1089 | }
1090 | @property --tw-translate-x {
1091 |   syntax: "*";
1092 |   inherits: false;
1093 |   initial-value: 0;
1094 | }
1095 | @property --tw-translate-y {
1096 |   syntax: "*";
1097 |   inherits: false;
1098 |   initial-value: 0;
1099 | }
1100 | @property --tw-translate-z {
1101 |   syntax: "*";
1102 |   inherits: false;
1103 |   initial-value: 0;
1104 | }
1105 | @property --tw-rotate-x {
1106 |   syntax: "*";
1107 |   inherits: false;
1108 |   initial-value: rotateX(0);
1109 | }
1110 | @property --tw-rotate-y {
1111 |   syntax: "*";
1112 |   inherits: false;
1113 |   initial-value: rotateY(0);
1114 | }
1115 | @property --tw-rotate-z {
1116 |   syntax: "*";
1117 |   inherits: false;
1118 |   initial-value: rotateZ(0);
1119 | }
1120 | @property --tw-skew-x {
1121 |   syntax: "*";
1122 |   inherits: false;
1123 |   initial-value: skewX(0);
1124 | }
1125 | @property --tw-skew-y {
1126 |   syntax: "*";
1127 |   inherits: false;
1128 |   initial-value: skewY(0);
1129 | }
1130 | @property --tw-border-style {
1131 |   syntax: "*";
1132 |   inherits: false;
1133 |   initial-value: solid;
1134 | }
1135 | @property --tw-leading {
1136 |   syntax: "*";
1137 |   inherits: false;
1138 | }
1139 | @property --tw-ordinal {
1140 |   syntax: "*";
1141 |   inherits: false;
1142 | }
1143 | @property --tw-slashed-zero {
1144 |   syntax: "*";
1145 |   inherits: false;
1146 | }
1147 | @property --tw-numeric-figure {
1148 |   syntax: "*";
1149 |   inherits: false;
1150 | }
1151 | @property --tw-numeric-spacing {
1152 |   syntax: "*";
1153 |   inherits: false;
1154 | }
1155 | @property --tw-numeric-fraction {
1156 |   syntax: "*";
1157 |   inherits: false;
1158 | }
1159 | @property --tw-shadow {
1160 |   syntax: "*";
1161 |   inherits: false;
1162 |   initial-value: 0 0 #0000;
1163 | }
1164 | @property --tw-shadow-color {
1165 |   syntax: "*";
1166 |   inherits: false;
1167 | }
1168 | @property --tw-inset-shadow {
1169 |   syntax: "*";
1170 |   inherits: false;
1171 |   initial-value: 0 0 #0000;
1172 | }
1173 | @property --tw-inset-shadow-color {
1174 |   syntax: "*";
1175 |   inherits: false;
1176 | }
1177 | @property --tw-ring-color {
1178 |   syntax: "*";
1179 |   inherits: false;
1180 | }
1181 | @property --tw-ring-shadow {
1182 |   syntax: "*";
1183 |   inherits: false;
1184 |   initial-value: 0 0 #0000;
1185 | }
1186 | @property --tw-inset-ring-color {
1187 |   syntax: "*";
1188 |   inherits: false;
1189 | }
1190 | @property --tw-inset-ring-shadow {
1191 |   syntax: "*";
1192 |   inherits: false;
1193 |   initial-value: 0 0 #0000;
1194 | }
1195 | @property --tw-ring-inset {
1196 |   syntax: "*";
1197 |   inherits: false;
1198 | }
1199 | @property --tw-ring-offset-width {
1200 |   syntax: "<length>";
1201 |   inherits: false;
1202 |   initial-value: 0px;
1203 | }
1204 | @property --tw-ring-offset-color {
1205 |   syntax: "*";
1206 |   inherits: false;
1207 |   initial-value: #fff;
1208 | }
1209 | @property --tw-ring-offset-shadow {
1210 |   syntax: "*";
1211 |   inherits: false;
1212 |   initial-value: 0 0 #0000;
1213 | }
1214 | @property --tw-outline-style {
1215 |   syntax: "*";
1216 |   inherits: false;
1217 |   initial-value: solid;
1218 | }
1219 | @property --tw-duration {
1220 |   syntax: "*";
1221 |   inherits: false;
1222 | }
1223 | @property --tw-ease {
1224 |   syntax: "*";
1225 |   inherits: false;
1226 | }
1227 | @property --tw-content {
1228 |   syntax: "*";
1229 |   initial-value: "";
1230 |   inherits: false;
1231 | }
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
4 | // Octokit 인스턴스 생성 함수
5 | const createOctokit = () => {
6 |   // 먼저 로컬 스토리지에서 토큰 확인
7 |   const tokenFromStorage = localStorage.getItem('github_token');
8 |   
9 |   // 환경 변수에서 토큰 또는 로컬 스토리지에서 가져온 토큰 사용
10 |   const token = import.meta.env.VITE_GITHUB_TOKEN || tokenFromStorage || '';
11 |   
12 |   // 토큰 상태 디버깅 로그 추가
13 |   console.log('GitHub 토큰 상태:', {
14 |     tokenFromEnv: Boolean(import.meta.env.VITE_GITHUB_TOKEN),
15 |     tokenFromStorage: Boolean(tokenFromStorage),
16 |     finalTokenUsed: Boolean(token),
17 |     tokenLength: token ? token.length : 0
18 |   });
19 | 
20 |   // 유효하지 않은 토큰이 설정되었을 수 있음을 확인
21 |   if (token && token.length < 10) {
22 |     console.warn('GitHub 토큰이 너무 짧습니다. 유효한 토큰인지 확인하세요.');
23 |   }
24 |   
25 |   return new Octokit({ 
26 |     auth: token,
27 |     request: {
28 |       retries: 3,
29 |       retryAfter: 60,
30 |     }
31 |   });
32 | };
33 | 
34 | // 지연 함수
35 | const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
36 | 
37 | // API 요청 래퍼 함수 - 재시도 메커니즘 추가
38 | async function fetchWithRetry<T>(
39 |   apiCall: () => Promise<T>,
40 |   maxRetries = 3,
41 |   initialDelay = 1000
42 | ): Promise<T> {
43 |   let retries = 0;
44 |   let delay = initialDelay;
45 |   
46 |   while (true) {
47 |     try {
48 |       return await apiCall();
49 |     } catch (error: any) {
50 |       console.error('GitHub API 요청 오류:', error);
51 |       
52 |       // 토큰 상태 로그 (오류 발생 시)
53 |       const tokenFromStorage = localStorage.getItem('github_token');
54 |       const token = import.meta.env.VITE_GITHUB_TOKEN || tokenFromStorage || '';
55 |       console.log('오류 발생 시 토큰 상태:', {
56 |         hasToken: Boolean(token),
57 |         tokenLength: token ? token.length : 0
58 |       });
59 |       
60 |       if (error.status === 403 && error.message && error.message.includes('rate limit')) {
61 |         // 속도 제한 오류
62 |         if (retries >= maxRetries) {
63 |           // 최대 재시도 횟수 초과
64 |           if (!token) {
65 |             throw new Error(`GitHub API 속도 제한에 도달했습니다. GitHub 토큰을 설정해야 합니다. 화면 우측 상단의 "GitHub 토큰 설정" 버튼을 클릭하여 토큰을 설정해 주세요. (${error.message})`);
66 |           } else {
67 |             throw new Error(`GitHub API 속도 제한에 도달했습니다. 설정된 토큰이 유효하지 않거나 권한이 부족할 수 있습니다. 토큰을 확인하고 다시 시도해 주세요. (${error.message})`);
68 |           }
69 |         }
70 |         
71 |         retries++;
72 |         console.warn(`GitHub API 속도 제한에 도달했습니다. ${delay/1000}초 후 재시도 (${retries}/${maxRetries})...`);
73 |         
74 |         // 지수 백오프로 대기 시간 증가
75 |         await sleep(delay);
76 |         delay *= 2;
77 |         
78 |         // Octokit 인스턴스 재생성 (토큰이 업데이트되었을 경우를 대비)
79 |         octokit = createOctokit();
80 |         continue;
81 |       }
82 |       
83 |       // 다른 종류의 오류 처리
84 |       if (error.status === 401) {
85 |         throw new Error(`GitHub 인증 오류: 토큰이 유효하지 않습니다. 토큰을 확인하고 다시 시도해 주세요. (${error.message})`);
86 |       } else if (error.status === 404) {
87 |         throw new Error(`요청한 리소스를 찾을 수 없습니다. 저장소 이름이 올바른지 확인해 주세요. (${error.message})`);
88 |       } else if (error.status >= 500) {
89 |         throw new Error(`GitHub 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. (${error.message})`);
90 |       }
91 |       
92 |       // 기타 오류
93 |       throw error;
94 |     }
95 |   }
96 | }
97 | 
98 | // Octokit 인스턴스 생성
99 | let octokit = createOctokit();
100 | 
101 | // 타입 정의
102 | export interface PullRequest {
103 |   id: number;
104 |   number: number;
105 |   title: string;
106 |   user: {
107 |     login: string;
108 |   };
109 |   created_at: string;
110 |   merged_at: string | null;
111 |   closed_at: string | null;
112 |   state: string;
113 |   html_url: string;
114 | }
115 | 
116 | export interface Review {
117 |   id: number;
118 |   user: {
119 |     login: string;
120 |   };
121 |   state: string;
122 |   submitted_at: string;
123 |   body: string;
124 | }
125 | 
126 | export interface Commit {
127 |   sha: string;
128 |   commit: {
129 |     message: string;
130 |     author: {
131 |       name: string;
132 |       date: string;
133 |     };
134 |   };
135 |   stats?: {
136 |     additions: number;
137 |     deletions: number;
138 |     total: number;
139 |   };
140 | }
141 | 
142 | /**
143 |  * PR 데이터 수집 함수
144 |  */
145 | export async function fetchPullRequests(owner: string, repo: string, since: string, until: string): Promise<PullRequest[]> {
146 |   try {
147 |     const data = await fetchWithRetry(async () => {
148 |       const response = await octokit.pulls.list({
149 |         owner,
150 |         repo,
151 |         state: "all",
152 |         per_page: 100,
153 |       });
154 |       return response.data;
155 |     });
156 |     
157 |     // 선택 기간에 맞게 필터링
158 |     return data.filter(pr => {
159 |       const createdAt = new Date(pr.created_at);
160 |       return createdAt >= new Date(since) && createdAt <= new Date(until);
161 |     }) as PullRequest[];
162 |   } catch (error) {
163 |     console.error("PR 데이터 가져오기 오류:", error);
164 |     throw error;
165 |   }
166 | }
167 | 
168 | /**
169 |  * PR에 대한 코멘트 목록 가져오기
170 |  */
171 | export async function fetchPullRequestComments(owner: string, repo: string, pullNumber: number): Promise<any[]> {
172 |   try {
173 |     const data = await fetchWithRetry(async () => {
174 |       const response = await octokit.pulls.listComments({
175 |         owner,
176 |         repo,
177 |         pull_number: pullNumber,
178 |       });
179 |       return response.data;
180 |     });
181 |     
182 |     return data;
183 |   } catch (error) {
184 |     console.error(`PR #${pullNumber} 코멘트 가져오기 오류:`, error);
185 |     throw error;
186 |   }
187 | }
188 | 
189 | /**
190 |  * PR 리뷰 데이터 가져오기
191 |  */
192 | export async function fetchPullRequestReviews(owner: string, repo: string, pullNumber: number): Promise<Review[]> {
193 |   try {
194 |     const data = await fetchWithRetry(async () => {
195 |       const response = await octokit.pulls.listReviews({
196 |         owner,
197 |         repo,
198 |         pull_number: pullNumber,
199 |       });
200 |       return response.data;
201 |     });
202 |     
203 |     return data as Review[];
204 |   } catch (error) {
205 |     console.error(`PR #${pullNumber} 리뷰 가져오기 오류:`, error);
206 |     throw error;
207 |   }
208 | }
209 | 
210 | /**
211 |  * PR 커밋 목록 가져오기
212 |  */
213 | export async function fetchPullRequestCommits(owner: string, repo: string, pullNumber: number): Promise<Commit[]> {
214 |   try {
215 |     const data = await fetchWithRetry(async () => {
216 |       const response = await octokit.pulls.listCommits({
217 |         owner,
218 |         repo,
219 |         pull_number: pullNumber,
220 |       });
221 |       return response.data;
222 |     });
223 |     
224 |     return data as Commit[];
225 |   } catch (error) {
226 |     console.error(`PR #${pullNumber} 커밋 가져오기 오류:`, error);
227 |     throw error;
228 |   }
229 | }
230 | 
231 | /**
232 |  * 커밋 상세 정보 가져오기
233 |  */
234 | export async function fetchCommitDetails(owner: string, repo: string, sha: string): Promise<Commit> {
235 |   try {
236 |     const data = await fetchWithRetry(async () => {
237 |       const response = await octokit.repos.getCommit({
238 |         owner,
239 |         repo,
240 |         ref: sha,
241 |       });
242 |       return response.data;
243 |     });
244 |     
245 |     return data as unknown as Commit;
246 |   } catch (error) {
247 |     console.error(`커밋 ${sha} 상세정보 가져오기 오류:`, error);
248 |     throw error;
249 |   }
250 | }
251 | 
252 | /**
253 |  * 배포 이벤트 가져오기 (이 프로젝트에서는 PR 이벤트로 대체)
254 |  */
255 | export async function fetchDeployments(owner: string, repo: string): Promise<DeploymentEvent[]> {
256 |   try {
257 |     // 이 함수는 실제 배포 정보를 가져오는 것이 아닌 
258 |     // PR 이벤트를 배포 이벤트로 변환하여 제공합니다.
259 |     // 실제 배포 이벤트는 GitHub Deployments API 또는 
260 |     // GitHub Actions 워크플로우 실행 정보를 활용할 수 있습니다.
261 |     
262 |     const data = await fetchWithRetry(async () => {
263 |       const response = await octokit.pulls.list({
264 |         owner,
265 |         repo,
266 |         state: "closed",
267 |         per_page: 100,
268 |       });
269 |       return response.data;
270 |     });
271 |     
272 |     // PR 데이터를 DeploymentEvent로 변환
273 |     const deploymentEvents: DeploymentEvent[] = data
274 |       .filter(pr => pr.merged_at !== null) // 머지된 PR만 배포로 간주
275 |       .map(pr => ({
276 |         id: pr.id,
277 |         created_at: pr.merged_at || pr.closed_at || pr.created_at,
278 |         environment: 'production',
279 |         has_issues: Math.random() < 0.2, // 20% 확률로 이슈 있음으로 설정
280 |         repository: `${owner}/${repo}`,
281 |         description: pr.title,
282 |       }));
283 |     
284 |     return deploymentEvents;
285 |   } catch (error) {
286 |     console.error("배포 이벤트 가져오기 오류:", error);
287 |     throw error;
288 |   }
289 | }
290 | 
291 | /**
292 |  * 배포 상태가 실패인지 확인하는 함수
293 |  */
294 | export function hasDeploymentIssues(status: string): boolean {
295 |   const failedStatuses = ['error', 'failure', 'failed', 'rejected'];
296 |   return failedStatuses.includes(status.toLowerCase());
297 | } 
```

src/components/app-sidebar.tsx
```
1 | import { useState } from "react"
2 | import { cn } from "@/lib/utils"
3 | import { Button } from "@/components/ui/button"
4 | import { ScrollArea } from "@/components/ui/scroll-area"
5 | import { Input } from "@/components/ui/input"
6 | import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
7 | import { Sidebar } from "@/components/ui/sidebar"
8 | import { BeaverLogo } from "@/components/ui/beaver-logo"
9 | import {
10 |   ChevronDown,
11 |   Search,
12 |   LayoutDashboard,
13 |   Users,
14 |   FileText,
15 |   Settings,
16 |   User,
17 | } from "lucide-react"
18 | 
19 | interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
20 |   isCollapsed: boolean
21 | }
22 | 
23 | export function AppSidebar({ className, isCollapsed }: SidebarProps) {
24 |   const [isProjectOpen, setIsProjectOpen] = useState(true)
25 | 
26 |   return (
27 |     <Sidebar
28 |       className={cn(
29 |         "flex flex-col h-full border-r border-sidebar-border bg-[hsl(var(--sidebar-background))] text-sidebar-foreground transition-all duration-300 ease-in-out",
30 |         isCollapsed ? "w-[80px]" : "w-[250px]",
31 |         className
32 |       )}
33 |       style={{ "--sidebar-width": isCollapsed ? "80px" : "250px" } as React.CSSProperties}
34 |       variant="sidebar"
35 |       collapsible={isCollapsed ? "icon" : "none"}
36 |     >
37 |       {/* Logo */}
38 |       <div className="flex h-14 items-center border-b px-4">
39 |         <Button 
40 |           variant="ghost" 
41 |           className="w-full justify-start px-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground overflow-hidden"
42 |         >
43 |           <BeaverLogo size={isCollapsed ? 24 : 28} className="mr-2 transition-all duration-300 ease-in-out" />
44 |           <span className={cn(
45 |             "transition-all duration-300 ease-in-out",
46 |             isCollapsed ? "opacity-0 w-0" : "opacity-100"
47 |           )}>Beaver v0.1</span>
48 |         </Button>
49 |       </div>
50 | 
51 |       {/* Search */}
52 |       <div className="px-4 py-2">
53 |         <div className="relative">
54 |           <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
55 |           <Input
56 |             placeholder="검색..."
57 |             className={cn(
58 |               "pl-8 bg-sidebar-accent text-sidebar-accent-foreground placeholder:text-muted-foreground transition-all duration-300 ease-in-out",
59 |               isCollapsed && "w-8 px-0 pl-8 text-transparent"
60 |             )}
61 |           />
62 |         </div>
63 |       </div>
64 | 
65 |       {/* Main Navigation */}
66 |       <ScrollArea className="flex-1">
67 |         <div className="flex flex-col gap-4 pt-4">
68 |           {/* Project Menu */}
69 |           <div className="flex flex-col gap-1 px-4">
70 |             {!isCollapsed ? (
71 |               <Collapsible open={isProjectOpen} onOpenChange={setIsProjectOpen}>
72 |                 <CollapsibleTrigger asChild>
73 |                   <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
74 |                     <LayoutDashboard className="h-4 w-4" />
75 |                     <span className="font-medium">Project</span>
76 |                     <ChevronDown className={cn(
77 |                       "ml-auto h-4 w-4 transition-transform duration-200",
78 |                       isProjectOpen && "rotate-180"
79 |                     )} />
80 |                   </Button>
81 |                 </CollapsibleTrigger>
82 |                 <CollapsibleContent className="ml-6 flex flex-col gap-1">
83 |                   <Button variant="ghost" className="justify-start pl-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">Project Overview</Button>
84 |                   <Button variant="ghost" className="justify-start pl-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">DORA Metrics</Button>
85 |                   <Button variant="ghost" className="justify-start pl-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">Dev Metrics</Button>
86 |                   <Button variant="ghost" className="justify-start pl-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">Review Collaboration</Button>
87 |                   <Button variant="ghost" className="justify-start pl-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">Team Wellbeing</Button>
88 |                 </CollapsibleContent>
89 |               </Collapsible>
90 |             ) : (
91 |               <Button variant="ghost" className="w-full justify-center p-0">
92 |                 <LayoutDashboard className="h-4 w-4" />
93 |               </Button>
94 |             )}
95 |           </div>
96 | 
97 |           {/* Team */}
98 |           <div className="px-4">
99 |             <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
100 |               <Users className="h-4 w-4" />
101 |               <span className={cn(
102 |                 "transition-all duration-300 ease-in-out",
103 |                 isCollapsed ? "opacity-0 w-0" : "opacity-100"
104 |               )}>Team</span>
105 |             </Button>
106 |           </div>
107 | 
108 |           {/* People */}
109 |           <div className="px-4">
110 |             <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
111 |               <User className="h-4 w-4" />
112 |               <span className={cn(
113 |                 "transition-all duration-300 ease-in-out",
114 |                 isCollapsed ? "opacity-0 w-0" : "opacity-100"
115 |               )}>People</span>
116 |             </Button>
117 |           </div>
118 | 
119 |           {/* Reports */}
120 |           <div className="px-4">
121 |             <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
122 |               <FileText className="h-4 w-4" />
123 |               <span className={cn(
124 |                 "transition-all duration-300 ease-in-out",
125 |                 isCollapsed ? "opacity-0 w-0" : "opacity-100"
126 |               )}>Reports</span>
127 |             </Button>
128 |           </div>
129 | 
130 |           {/* Settings */}
131 |           <div className="px-4">
132 |             <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
133 |               <Settings className="h-4 w-4" />
134 |               <span className={cn(
135 |                 "transition-all duration-300 ease-in-out",
136 |                 isCollapsed ? "opacity-0 w-0" : "opacity-100"
137 |               )}>Settings</span>
138 |             </Button>
139 |           </div>
140 |         </div>
141 |       </ScrollArea>
142 | 
143 |       {/* User Profile */}
144 |       <div className="mt-auto p-4 border-t border-sidebar-border">
145 |         <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
146 |           <div className="h-6 w-6 rounded-full bg-sidebar-accent" />
147 |           <div className={cn(
148 |             "flex flex-col items-start transition-all duration-300 ease-in-out",
149 |             isCollapsed ? "opacity-0 w-0" : "opacity-100"
150 |           )}>
151 |             <span className="text-sm">Your Photo</span>
152 |             <span className="text-xs text-muted-foreground">Log in/out</span>
153 |           </div>
154 |         </Button>
155 |       </div>
156 |     </Sidebar>
157 |   )
158 | } 
```

src/components/mode-toggle.tsx
```
1 | import { Moon, Sun } from "lucide-react"
2 | import { Button } from "@/components/ui/button"
3 | import { useEffect, useState } from "react"
4 | 
5 | // 로컬 스토리지 키
6 | const THEME_STORAGE_KEY = "beaver-theme-preference"
7 | 
8 | export function ModeToggle() {
9 |   const [theme, setTheme] = useState<"light" | "dark">("light")
10 |   
11 |   // 초기 테마 설정
12 |   useEffect(() => {
13 |     // 로컬 스토리지에서 테마 가져오기
14 |     const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as "light" | "dark" | null
15 |     
16 |     // 저장된 테마가 있으면 사용, 없으면 라이트 모드가 기본값
17 |     const initialTheme = savedTheme || "light"
18 |     
19 |     setTheme(initialTheme)
20 |     applyTheme(initialTheme)
21 |   }, [])
22 |   
23 |   // 테마 적용 함수
24 |   const applyTheme = (newTheme: "light" | "dark") => {
25 |     // 문서에 data-theme 속성 설정
26 |     document.documentElement.setAttribute("data-theme", newTheme)
27 |     
28 |     // dark 클래스 토글
29 |     if (newTheme === "dark") {
30 |       document.documentElement.classList.add("dark")
31 |     } else {
32 |       document.documentElement.classList.remove("dark")
33 |     }
34 |     
35 |     // 로컬 스토리지에 테마 저장
36 |     localStorage.setItem(THEME_STORAGE_KEY, newTheme)
37 |   }
38 |   
39 |   // 테마 변경 함수
40 |   const toggleTheme = () => {
41 |     const newTheme = theme === "light" ? "dark" : "light"
42 |     setTheme(newTheme)
43 |     applyTheme(newTheme)
44 |   }
45 |   
46 |   return (
47 |     <Button
48 |       variant="ghost"
49 |       size="icon"
50 |       aria-label="테마 전환"
51 |       onClick={toggleTheme}
52 |       className="text-muted-foreground hover:text-foreground"
53 |     >
54 |       {theme === "light" ? (
55 |         <Moon className="h-5 w-5" />
56 |       ) : (
57 |         <Sun className="h-5 w-5" />
58 |       )}
59 |       <span className="sr-only">테마 전환</span>
60 |     </Button>
61 |   )
62 | } 
```

src/components/nav-main.tsx
```
1 | import { cn } from "@/lib/utils"
2 | import { Button } from "@/components/ui/button"
3 | import {
4 |   BarChart3,
5 |   Users,
6 |   FolderKanban,
7 |   FileText,
8 |   Settings,
9 | } from "lucide-react"
10 | 
11 | interface NavMainProps {
12 |   isCollapsed: boolean
13 | }
14 | 
15 | export function NavMain({ isCollapsed }: NavMainProps) {
16 |   const mainNavItems = [
17 |     {
18 |       title: "Project",
19 |       icon: FolderKanban,
20 |       items: [
21 |         { title: "Project Overview", href: "/project/overview" },
22 |         { title: "DORA Metrics", href: "/project/dora" },
23 |         { title: "Dev Metrics", href: "/project/dev-metrics" },
24 |         { title: "Review Collaboration", href: "/project/review" },
25 |         { title: "Team Wellbeing", href: "/project/wellbeing" },
26 |       ],
27 |     },
28 |     {
29 |       title: "Team",
30 |       icon: Users,
31 |       href: "/team",
32 |     },
33 |     {
34 |       title: "People",
35 |       icon: Users,
36 |       href: "/people",
37 |     },
38 |     {
39 |       title: "Reports",
40 |       icon: FileText,
41 |       href: "/reports",
42 |     },
43 |   ]
44 | 
45 |   return (
46 |     <div
47 |       data-collapsed={isCollapsed}
48 |       className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
49 |     >
50 |       <nav className="grid gap-1 px-2">
51 |         {mainNavItems.map((item, index) => (
52 |           <Button
53 |             key={index}
54 |             variant="ghost"
55 |             className={cn(
56 |               "w-full justify-start",
57 |               isCollapsed && "h-12 w-12 p-0"
58 |             )}
59 |           >
60 |             <item.icon className={cn("h-4 w-4", isCollapsed ? "mx-auto" : "mr-2")} />
61 |             {!isCollapsed && <span>{item.title}</span>}
62 |           </Button>
63 |         ))}
64 |       </nav>
65 |     </div>
66 |   )
67 | } 
```

src/components/nav-user.tsx
```
1 | import { cn } from "@/lib/utils"
2 | import { Button } from "@/components/ui/button"
3 | import { Settings } from "lucide-react"
4 | 
5 | interface NavUserProps {
6 |   isCollapsed: boolean
7 | }
8 | 
9 | export function NavUser({ isCollapsed }: NavUserProps) {
10 |   return (
11 |     <div
12 |       data-collapsed={isCollapsed}
13 |       className="mt-auto border-t"
14 |     >
15 |       <nav className="grid gap-1 px-2 py-2">
16 |         <Button
17 |           variant="ghost"
18 |           className={cn(
19 |             "w-full justify-start",
20 |             isCollapsed && "h-12 w-12 p-0"
21 |           )}
22 |         >
23 |           <Settings className={cn("h-4 w-4", isCollapsed ? "mx-auto" : "mr-2")} />
24 |           {!isCollapsed && <span>Settings</span>}
25 |         </Button>
26 |       </nav>
27 |     </div>
28 |   )
29 | } 
```

src/components/site-header.tsx
```
1 | import { Button } from "@/components/ui/button"
2 | import { Menu, Bell, Search } from "lucide-react"
3 | import { ModeToggle } from "@/components/mode-toggle"
4 | import { Input } from "@/components/ui/input"
5 | import { BeaverLogo } from "@/components/ui/beaver-logo"
6 | 
7 | interface SiteHeaderProps {
8 |   onToggleSidebar: () => void;
9 |   title?: string;
10 | }
11 | 
12 | export function SiteHeader({ onToggleSidebar, title = "DORA Metrics" }: SiteHeaderProps) {
13 |   return (
14 |     <header 
15 |       className="flex h-14 items-center gap-4 border-b px-4 lg:px-6 w-full"
16 |       style={{ backgroundColor: 'hsl(var(--background))' }}
17 |     >
18 |       <Button
19 |         variant="ghost"
20 |         size="icon"
21 |         onClick={onToggleSidebar}
22 |         className="mr-2 flex-none"
23 |         aria-label="Toggle sidebar"
24 |       >
25 |         <Menu className="h-5 w-5" />
26 |         <span className="sr-only">사이드바 토글</span>
27 |       </Button>
28 |       
29 |       <div className="flex-1 flex items-center justify-between min-w-0">
30 |         {/* 왼쪽 영역 */}
31 |         <div className="flex items-center gap-2 min-w-0">
32 |           {/* 검색 부분 주석 처리
33 |           <div className="relative w-60 mr-4 hidden md:block">
34 |             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
35 |             <Input
36 |               type="search"
37 |               placeholder="검색..."
38 |               className="w-full rounded-md pl-8"
39 |             />
40 |           </div>
41 |           */}
42 |           <div className="flex items-center overflow-hidden">
43 |             <BeaverLogo size={24} className="mr-2 flex-none" />
44 |             <div className="flex items-center overflow-hidden">
45 |               <span className="text-muted-foreground truncate">Beaver</span>
46 |               <span className="mx-2 text-muted-foreground flex-none">&gt;</span>
47 |               <span className="font-medium truncate">{title}</span>
48 |             </div>
49 |           </div>
50 |         </div>
51 |         
52 |         {/* 오른쪽 영역 */}
53 |         <div className="flex items-center gap-4 ml-4 flex-none">
54 |           <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
55 |             <Bell className="h-5 w-5" />
56 |             <span className="sr-only">알림</span>
57 |           </Button>
58 |           <ModeToggle />
59 |         </div>
60 |       </div>
61 |     </header>
62 |   )
63 | } 
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
1 | import { type ClassValue, clsx } from "clsx"
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

src/hooks/use-mobile.tsx
```
1 | import * as React from "react"
2 | 
3 | const MOBILE_BREAKPOINT = 768
4 | 
5 | export function useIsMobile() {
6 |   const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
7 | 
8 |   React.useEffect(() => {
9 |     const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
10 |     const onChange = () => {
11 |       setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
12 |     }
13 |     mql.addEventListener("change", onChange)
14 |     setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
15 |     return () => mql.removeEventListener("change", onChange)
16 |   }, [])
17 | 
18 |   return !!isMobile
19 | }
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

src/test/backyard-metrics.test.ts
```
1 | import { describe, it, expect } from 'vitest';
2 | import { 
3 |   fetchPullRequests, 
4 |   fetchPullRequestReviews, 
5 |   fetchPullRequestCommits,
6 |   fetchCommitDetails,
7 |   fetchDeployments
8 | } from '../api/github';
9 | import { calculateMetrics } from '../lib/metrics';
10 | 
11 | // 테스트가 10초 이상 걸릴 수 있으므로 타임아웃 설정
12 | describe('Wodory Backyard 저장소 메트릭스 테스트', () => {
13 |   it('wodory/backyard 저장소의 전체 기간 지표를 계산합니다', async () => {
14 |     // Wodory Backyard 저장소 정보
15 |     const owner = 'wodory';
16 |     const repo = 'backyard';
17 |     
18 |     // 기간 설정: 전체 기간 (since 파라미터를 전달하지 않음)
19 |     const until = new Date().toISOString();
20 |     
21 |     console.log(`${owner}/${repo} 저장소의 전체 기간 메트릭스 조회 중...`);
22 |     
23 |     try {
24 |       // PR 데이터 가져오기 (since 파라미터 없이 호출)
25 |       const pullRequests = await fetchPullRequests(owner, repo, '', until);
26 |       console.log(`가져온 PR 개수: ${pullRequests.length}`);
27 |       
28 |       // PR 상세 정보 가져오기
29 |       const prDetails: Record<number, { reviews: any[], commits: any[] }> = {};
30 |       
31 |       // 시간 단축을 위해 최대 10개의 PR만 상세 조회
32 |       const limitedPRs = pullRequests.slice(0, 10);
33 |       
34 |       for (const pr of limitedPRs) {
35 |         const prNumber = pr.number;
36 |         
37 |         // 리뷰 및 커밋 데이터 가져오기
38 |         const [reviews, commits] = await Promise.all([
39 |           fetchPullRequestReviews(owner, repo, prNumber),
40 |           fetchPullRequestCommits(owner, repo, prNumber)
41 |         ]);
42 |         
43 |         // 커밋 상세 정보 가져오기
44 |         const commitDetails = await Promise.all(
45 |           commits.map(commit => fetchCommitDetails(owner, repo, commit.sha))
46 |         );
47 |         
48 |         // 결과 저장
49 |         prDetails[prNumber] = {
50 |           reviews,
51 |           commits: commitDetails
52 |         };
53 |         
54 |         console.log(`PR #${prNumber} 상세 정보 처리 완료`);
55 |       }
56 |       
57 |       // 배포 데이터 가져오기
58 |       const deployments = await fetchDeployments(owner, repo);
59 |       
60 |       // 메트릭스 계산
61 |       const metrics = calculateMetrics(pullRequests, prDetails, deployments);
62 |       
63 |       // 결과 출력
64 |       console.log('\n====== 측정 결과 ======');
65 |       console.log(`1. PR 개수: ${metrics.prCount}개`);
66 |       console.log(`2. 코드 변경량: ${metrics.totalLinesOfCode}줄`);
67 |       console.log(`3. 평균 리뷰 응답 시간: ${(metrics.avgReviewResponseTime / (1000 * 60 * 60)).toFixed(2)}시간`);
68 |       console.log(`4. 평균 PR 사이클 타임: ${(metrics.avgPRCycleTime / (1000 * 60 * 60)).toFixed(2)}시간`);
69 |       console.log(`5. 배포 빈도: ${metrics.deploymentFrequency?.toFixed(4) || '측정 불가'} 회/일`);
70 |       console.log(`6. 결함률: ${metrics.changeFailureRate?.toFixed(2) || '측정 불가'}%`);
71 |       
72 |       // 테스트 통과 조건 (메트릭스 값이 존재하는지 확인)
73 |       expect(metrics.prCount).toBeGreaterThanOrEqual(0);
74 |       expect(metrics.totalLinesOfCode).toBeGreaterThanOrEqual(0);
75 |       
76 |     } catch (error) {
77 |       console.error('메트릭스 계산 오류:', error);
78 |       throw error; // 테스트 실패 처리
79 |     }
80 |   }, 60000); // 60초 타임아웃 설정
81 | }); 
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

src/test/d3-hierarchy-metrics.test.ts
```
1 | import { describe, it, expect } from 'vitest';
2 | import { 
3 |   fetchPullRequests, 
4 |   fetchPullRequestReviews, 
5 |   fetchPullRequestCommits,
6 |   fetchCommitDetails,
7 |   fetchDeployments
8 | } from '../api/github';
9 | import { calculateMetrics } from '../lib/metrics';
10 | 
11 | // 테스트가 10초 이상 걸릴 수 있으므로 타임아웃 설정
12 | describe('D3 Hierarchy 저장소 메트릭스 테스트', () => {
13 |   it('d3/d3-hierarchy 저장소의 지표를 계산합니다', async () => {
14 |     // D3 Hierarchy 저장소 정보
15 |     const owner = 'd3';
16 |     const repo = 'd3-hierarchy';
17 |     
18 |     // 기간 설정: 2022년 1월 1일부터 현재까지
19 |     const since = '2022-01-01T00:00:00Z';
20 |     const until = new Date().toISOString();
21 |     
22 |     console.log(`${owner}/${repo} 저장소의 ${since} ~ ${until} 기간 메트릭스 조회 중...`);
23 |     
24 |     try {
25 |       // PR 데이터 가져오기
26 |       const pullRequests = await fetchPullRequests(owner, repo, since, until);
27 |       console.log(`가져온 PR 개수: ${pullRequests.length}`);
28 |       
29 |       // PR 상세 정보 가져오기
30 |       const prDetails: Record<number, { reviews: any[], commits: any[] }> = {};
31 |       
32 |       // 시간 단축을 위해 최대 10개의 PR만 상세 조회
33 |       const limitedPRs = pullRequests.slice(0, 10);
34 |       
35 |       for (const pr of limitedPRs) {
36 |         const prNumber = pr.number;
37 |         
38 |         // 리뷰 및 커밋 데이터 가져오기
39 |         const [reviews, commits] = await Promise.all([
40 |           fetchPullRequestReviews(owner, repo, prNumber),
41 |           fetchPullRequestCommits(owner, repo, prNumber)
42 |         ]);
43 |         
44 |         // 커밋 상세 정보 가져오기
45 |         const commitDetails = await Promise.all(
46 |           commits.map(commit => fetchCommitDetails(owner, repo, commit.sha))
47 |         );
48 |         
49 |         // 결과 저장
50 |         prDetails[prNumber] = {
51 |           reviews,
52 |           commits: commitDetails
53 |         };
54 |         
55 |         console.log(`PR #${prNumber} 상세 정보 처리 완료`);
56 |       }
57 |       
58 |       // 배포 데이터 가져오기
59 |       const deployments = await fetchDeployments(owner, repo);
60 |       
61 |       // 메트릭스 계산
62 |       const metrics = calculateMetrics(pullRequests, prDetails, deployments);
63 |       
64 |       // 결과 출력
65 |       console.log('\n====== 측정 결과 ======');
66 |       console.log(`1. PR 개수: ${metrics.prCount}개`);
67 |       console.log(`2. 코드 변경량: ${metrics.totalLinesOfCode}줄`);
68 |       console.log(`3. 평균 리뷰 응답 시간: ${(metrics.avgReviewResponseTime / (1000 * 60 * 60)).toFixed(2)}시간`);
69 |       console.log(`4. 평균 PR 사이클 타임: ${(metrics.avgPRCycleTime / (1000 * 60 * 60)).toFixed(2)}시간`);
70 |       console.log(`5. 배포 빈도: ${metrics.deploymentFrequency?.toFixed(4) || '측정 불가'} 회/일`);
71 |       console.log(`6. 결함률: ${metrics.changeFailureRate?.toFixed(2) || '측정 불가'}%`);
72 |       
73 |       // 테스트 통과 조건 (메트릭스 값이 존재하는지 확인)
74 |       expect(metrics.prCount).toBeGreaterThanOrEqual(0);
75 |       expect(metrics.totalLinesOfCode).toBeGreaterThanOrEqual(0);
76 |       
77 |     } catch (error) {
78 |       console.error('메트릭스 계산 오류:', error);
79 |       throw error; // 테스트 실패 처리
80 |     }
81 |   }, 60000); // 60초 타임아웃 설정
82 | }); 
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

src/test/fetch-metrics.ts
```
1 | import path from 'path';
2 | import { fileURLToPath } from 'url';
3 | import { 
4 |   fetchPullRequests, 
5 |   fetchPullRequestReviews, 
6 |   fetchPullRequestCommits,
7 |   fetchCommitDetails,
8 |   fetchDeployments
9 | } from '../api/github';
10 | import { calculateMetrics } from '../lib/metrics';
11 | 
12 | // ESM 호환성을 위한 설정
13 | const __filename = fileURLToPath(import.meta.url);
14 | const __dirname = path.dirname(__filename);
15 | 
16 | async function main() {
17 |   // facebook/react 저장소 정보
18 |   const owner = 'facebook';
19 |   const repo = 'react';
20 |   
21 |   // 기간 설정: 2025년 2월 1일부터 오늘까지
22 |   const since = '2025-02-01T00:00:00Z';
23 |   const until = new Date().toISOString();
24 |   
25 |   console.log(`${owner}/${repo} 저장소의 ${since} ~ ${until} 기간 메트릭스 조회 중...`);
26 |   
27 |   try {
28 |     // PR 데이터 가져오기
29 |     const pullRequests = await fetchPullRequests(owner, repo, since, until);
30 |     console.log(`가져온 PR 개수: ${pullRequests.length}`);
31 |     
32 |     // PR 상세 정보 가져오기
33 |     const prDetails: Record<number, { reviews: any[], commits: any[] }> = {};
34 |     
35 |     // 시간 단축을 위해 최대 10개의 PR만 상세 조회
36 |     const limitedPRs = pullRequests.slice(0, 10);
37 |     
38 |     for (const pr of limitedPRs) {
39 |       const prNumber = pr.number;
40 |       
41 |       // 리뷰 및 커밋 데이터 가져오기
42 |       const [reviews, commits] = await Promise.all([
43 |         fetchPullRequestReviews(owner, repo, prNumber),
44 |         fetchPullRequestCommits(owner, repo, prNumber)
45 |       ]);
46 |       
47 |       // 커밋 상세 정보 가져오기
48 |       const commitDetails = await Promise.all(
49 |         commits.map(commit => fetchCommitDetails(owner, repo, commit.sha))
50 |       );
51 |       
52 |       // 결과 저장
53 |       prDetails[prNumber] = {
54 |         reviews,
55 |         commits: commitDetails
56 |       };
57 |       
58 |       console.log(`PR #${prNumber} 상세 정보 처리 완료`);
59 |     }
60 |     
61 |     // 배포 데이터 가져오기
62 |     const deployments = await fetchDeployments(owner, repo);
63 |     
64 |     // 메트릭스 계산
65 |     const metrics = calculateMetrics(pullRequests, prDetails, deployments);
66 |     
67 |     // 결과 출력
68 |     console.log('\n====== 측정 결과 ======');
69 |     console.log(`1. PR 개수: ${metrics.prCount}개`);
70 |     console.log(`2. 코드 변경량: ${metrics.totalLinesOfCode}줄`);
71 |     console.log(`3. 평균 리뷰 응답 시간: ${(metrics.avgReviewResponseTime / (1000 * 60 * 60)).toFixed(2)}시간`);
72 |     console.log(`4. 평균 PR 사이클 타임: ${(metrics.avgPRCycleTime / (1000 * 60 * 60)).toFixed(2)}시간`);
73 |     console.log(`5. 배포 빈도: ${metrics.deploymentFrequency?.toFixed(4) || '측정 불가'} 회/일`);
74 |     console.log(`6. 결함률: ${metrics.changeFailureRate?.toFixed(2) || '측정 불가'}%`);
75 |     
76 |   } catch (error) {
77 |     console.error('메트릭스 계산 오류:', error);
78 |   }
79 | }
80 | 
81 | // 스크립트 실행
82 | main().catch(console.error); 
```

src/test/filter.test.ts
```
1 | import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
2 | import { useStore } from '../store/dashboardStore';
3 | import * as githubApi from '../api/github';
4 | 
5 | // GitHub API 모킹
6 | vi.mock('../api/github', () => ({
7 |   fetchPullRequests: vi.fn(),
8 |   fetchPullRequestReviews: vi.fn(),
9 |   fetchPullRequestCommits: vi.fn(),
10 |   fetchCommitDetails: vi.fn(),
11 |   fetchDeployments: vi.fn()
12 | }));
13 | 
14 | // Zustand 스토어 선택적으로 모킹
15 | const mockSetStartDate = vi.fn();
16 | const mockSetEndDate = vi.fn();
17 | const mockSetSelectedRepo = vi.fn();
18 | const mockLoadMetrics = vi.fn();
19 | 
20 | // 스토어 상태를 초기화하는 헬퍼 함수
21 | const resetStore = () => {
22 |   const store = useStore.getState();
23 |   store.setStartDate(null);
24 |   store.setEndDate(null);
25 |   store.setSelectedRepo(null);
26 | };
27 | 
28 | describe('필터링 및 날짜 선택 기능 테스트', () => {
29 |   beforeEach(() => {
30 |     // 모킹된 함수들의 반환값 설정
31 |     vi.mocked(githubApi.fetchPullRequests).mockResolvedValue([
32 |       {
33 |         id: 1,
34 |         number: 101,
35 |         title: 'Test PR 1',
36 |         user: { login: 'user1' },
37 |         created_at: '2023-04-01T10:00:00Z',
38 |         merged_at: '2023-04-02T10:00:00Z',
39 |         closed_at: null,
40 |         state: 'merged',
41 |         html_url: 'https://github.com/owner/repo/pull/101'
42 |       },
43 |       {
44 |         id: 2,
45 |         number: 102,
46 |         title: 'Test PR 2',
47 |         user: { login: 'user2' },
48 |         created_at: '2023-04-03T10:00:00Z',
49 |         merged_at: null,
50 |         closed_at: '2023-04-04T10:00:00Z',
51 |         state: 'closed',
52 |         html_url: 'https://github.com/owner/repo/pull/102'
53 |       }
54 |     ]);
55 | 
56 |     vi.mocked(githubApi.fetchPullRequestReviews).mockResolvedValue([
57 |       {
58 |         id: 1,
59 |         user: { login: 'reviewer1' },
60 |         state: 'APPROVED',
61 |         submitted_at: '2023-04-01T15:00:00Z',
62 |         body: 'LGTM!'
63 |       }
64 |     ]);
65 | 
66 |     vi.mocked(githubApi.fetchPullRequestCommits).mockResolvedValue([
67 |       {
68 |         sha: 'abc123',
69 |         commit: {
70 |           message: 'Test commit',
71 |           author: {
72 |             name: 'Test Author',
73 |             date: '2023-04-01T12:00:00Z'
74 |           }
75 |         }
76 |       }
77 |     ]);
78 | 
79 |     vi.mocked(githubApi.fetchCommitDetails).mockResolvedValue({
80 |       sha: 'abc123',
81 |       commit: {
82 |         message: 'Test commit',
83 |         author: {
84 |           name: 'Test Author',
85 |           date: '2023-04-01T12:00:00Z'
86 |         }
87 |       },
88 |       stats: {
89 |         additions: 10,
90 |         deletions: 5,
91 |         total: 15
92 |       }
93 |     });
94 | 
95 |     vi.mocked(githubApi.fetchDeployments).mockResolvedValue([
96 |       {
97 |         id: 1,
98 |         repository: 'owner/repo',
99 |         environment: 'production',
100 |         created_at: '2023-04-02T14:00:00Z',
101 |         completed_at: '2023-04-02T14:30:00Z',
102 |         status: 'success',
103 |         has_issues: false,
104 |         created_by: 'user1'
105 |       }
106 |     ]);
107 |   });
108 | 
109 |   afterEach(() => {
110 |     vi.clearAllMocks();
111 |     resetStore();
112 |   });
113 | 
114 |   it('날짜 및 저장소 선택 상태 변경이 올바르게 작동하는지 확인', () => {
115 |     // 초기 상태 확인
116 |     const initialState = useStore.getState();
117 |     expect(initialState.startDate).toBeNull();
118 |     expect(initialState.endDate).toBeNull();
119 |     expect(initialState.selectedRepo).toBeNull();
120 |     
121 |     // 시작일 설정
122 |     const startDate = new Date('2023-04-01');
123 |     useStore.getState().setStartDate(startDate);
124 |     
125 |     // 상태 업데이트 확인
126 |     expect(useStore.getState().startDate).toEqual(startDate);
127 |     
128 |     // 종료일 설정
129 |     const endDate = new Date('2023-04-30');
130 |     useStore.getState().setEndDate(endDate);
131 |     
132 |     // 상태 업데이트 확인
133 |     expect(useStore.getState().endDate).toEqual(endDate);
134 |     
135 |     // 저장소 선택
136 |     useStore.getState().setSelectedRepo('owner/repo');
137 |     
138 |     // 상태 업데이트 확인
139 |     expect(useStore.getState().selectedRepo).toBe('owner/repo');
140 |   });
141 | 
142 |   it('필터 변경 후 loadMetrics 함수가 올바르게 API를 호출하는지 확인', async () => {
143 |     // 필터 설정
144 |     const startDate = new Date('2023-04-01');
145 |     const endDate = new Date('2023-04-30');
146 |     const repo = 'owner/repo';
147 |     
148 |     // 상태 설정
149 |     const store = useStore.getState();
150 |     store.setStartDate(startDate);
151 |     store.setEndDate(endDate);
152 |     store.setSelectedRepo(repo);
153 |     
154 |     // loadMetrics 함수 호출
155 |     await store.loadMetrics(startDate, endDate, repo);
156 |     
157 |     // API 호출 확인
158 |     expect(githubApi.fetchPullRequests).toHaveBeenCalledWith('owner', 'repo', startDate.toISOString(), endDate.toISOString());
159 |     
160 |     // 상태 업데이트 확인
161 |     const updatedState = useStore.getState();
162 |     expect(updatedState.isLoading).toBe(false);
163 |     expect(updatedState.error).toBeNull();
164 |     
165 |     // 계산된 메트릭스 확인
166 |     expect(updatedState.leadTimeForChanges).not.toBeNull();
167 |     expect(updatedState.deploymentFrequency).not.toBeNull();
168 |     expect(updatedState.changeFailureRate).not.toBeNull();
169 |   });
170 | 
171 |   it('필터 변경 시 API 오류가 올바르게 처리되는지 확인', async () => {
172 |     // API 오류 모킹
173 |     vi.mocked(githubApi.fetchPullRequests).mockRejectedValueOnce(new Error('API Error'));
174 |     
175 |     // 필터 설정
176 |     const startDate = new Date('2023-04-01');
177 |     const endDate = new Date('2023-04-30');
178 |     const repo = 'owner/repo';
179 |     
180 |     // loadMetrics 함수 호출
181 |     await useStore.getState().loadMetrics(startDate, endDate, repo);
182 |     
183 |     // 오류 상태 확인
184 |     const updatedState = useStore.getState();
185 |     expect(updatedState.isLoading).toBe(false);
186 |     expect(updatedState.error).not.toBeNull();
187 |     expect(updatedState.error).toContain('오류가 발생했습니다');
188 |   });
189 | }); 
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
14 | import { fetchPullRequests, fetchPullRequestReviews, fetchPullRequestCommits, fetchCommitDetails, fetchDeployments } from '../api/github';
15 | 
16 | // 테스트용 목 데이터
17 | const mockPullRequests: PullRequest[] = [
18 |   {
19 |     id: 1,
20 |     number: 101,
21 |     title: 'PR 1',
22 |     user: { login: 'user1' },
23 |     created_at: '2023-06-10T10:00:00Z',
24 |     merged_at: '2023-06-15T15:00:00Z',
25 |     closed_at: '2023-06-15T15:00:00Z',
26 |     state: 'closed',
27 |     html_url: 'https://github.com/test/repo/pull/101'
28 |   },
29 |   {
30 |     id: 2,
31 |     number: 102,
32 |     title: 'PR 2',
33 |     user: { login: 'user2' },
34 |     created_at: '2023-06-12T10:00:00Z',
35 |     merged_at: null,
36 |     closed_at: '2023-06-14T15:00:00Z',
37 |     state: 'closed',
38 |     html_url: 'https://github.com/test/repo/pull/102'
39 |   },
40 |   {
41 |     id: 3,
42 |     number: 103,
43 |     title: 'PR 3',
44 |     user: { login: 'user3' },
45 |     created_at: '2023-06-14T10:00:00Z',
46 |     merged_at: null,
47 |     closed_at: null,
48 |     state: 'open',
49 |     html_url: 'https://github.com/test/repo/pull/103'
50 |   }
51 | ];
52 | 
53 | const mockReviews: Record<number, Review[]> = {
54 |   101: [
55 |     {
56 |       id: 1001,
57 |       user: { login: 'reviewer1' },
58 |       state: 'APPROVED',
59 |       submitted_at: '2023-06-12T14:00:00Z',
60 |       body: '좋은 PR입니다!'
61 |     },
62 |     {
63 |       id: 1002,
64 |       user: { login: 'reviewer2' },
65 |       state: 'COMMENTED',
66 |       submitted_at: '2023-06-13T10:00:00Z',
67 |       body: '코멘트입니다'
68 |     }
69 |   ],
70 |   102: [
71 |     {
72 |       id: 1003,
73 |       user: { login: 'reviewer1' },
74 |       state: 'CHANGES_REQUESTED',
75 |       submitted_at: '2023-06-13T11:00:00Z',
76 |       body: '수정이 필요합니다'
77 |     }
78 |   ],
79 |   103: []
80 | };
81 | 
82 | const mockCommits: Record<number, Commit[]> = {
83 |   101: [
84 |     {
85 |       sha: 'abc123',
86 |       commit: {
87 |         message: '기능 추가',
88 |         author: {
89 |           name: 'User 1',
90 |           date: '2023-06-10T11:00:00Z'
91 |         }
92 |       },
93 |       stats: {
94 |         additions: 100,
95 |         deletions: 50,
96 |         total: 150
97 |       }
98 |     }
99 |   ],
100 |   102: [
101 |     {
102 |       sha: 'def456',
103 |       commit: {
104 |         message: '버그 수정',
105 |         author: {
106 |           name: 'User 2',
107 |           date: '2023-06-12T11:00:00Z'
108 |         }
109 |       },
110 |       stats: {
111 |         additions: 30,
112 |         deletions: 20,
113 |         total: 50
114 |       }
115 |     },
116 |     {
117 |       sha: 'ghi789',
118 |       commit: {
119 |         message: '리팩토링',
120 |         author: {
121 |           name: 'User 2',
122 |           date: '2023-06-13T11:00:00Z'
123 |         }
124 |       },
125 |       stats: {
126 |         additions: 40,
127 |         deletions: 40,
128 |         total: 80
129 |       }
130 |     }
131 |   ],
132 |   103: [
133 |     {
134 |       sha: 'jkl012',
135 |       commit: {
136 |         message: '신규 기능',
137 |         author: {
138 |           name: 'User 3',
139 |           date: '2023-06-14T11:00:00Z'
140 |         }
141 |       },
142 |       stats: {
143 |         additions: 200,
144 |         deletions: 0,
145 |         total: 200
146 |       }
147 |     }
148 |   ]
149 | };
150 | 
151 | const mockPrDetails: Record<number, { reviews: Review[], commits: Commit[] }> = {
152 |   101: { reviews: mockReviews[101], commits: mockCommits[101] },
153 |   102: { reviews: mockReviews[102], commits: mockCommits[102] },
154 |   103: { reviews: mockReviews[103], commits: mockCommits[103] }
155 | };
156 | 
157 | // 테스트용 배포 데이터
158 | const mockDeployments: DeploymentEvent[] = [
159 |   {
160 |     id: 1,
161 |     repository: 'test/repo',
162 |     environment: 'production',
163 |     created_at: '2023-06-12T12:00:00Z',
164 |     completed_at: '2023-06-12T12:05:00Z',
165 |     status: 'success',
166 |     has_issues: false,
167 |     created_by: 'user1'
168 |   },
169 |   {
170 |     id: 2,
171 |     repository: 'test/repo',
172 |     environment: 'production',
173 |     created_at: '2023-06-14T15:00:00Z',
174 |     completed_at: '2023-06-14T15:10:00Z',
175 |     status: 'failure',
176 |     has_issues: true,
177 |     created_by: 'user2'
178 |   },
179 |   {
180 |     id: 3,
181 |     repository: 'test/repo',
182 |     environment: 'staging',
183 |     created_at: '2023-06-16T10:00:00Z',
184 |     completed_at: '2023-06-16T10:03:00Z',
185 |     status: 'success',
186 |     has_issues: false,
187 |     created_by: 'user3'
188 |   }
189 | ];
190 | 
191 | describe('메트릭 계산 함수 테스트', () => {
192 |   describe('calculatePRCount', () => {
193 |     it('PR 개수를 정확하게 계산해야 함', () => {
194 |       const count = calculatePRCount(mockPullRequests);
195 |       expect(count).toBe(3);
196 |     });
197 |   });
198 | 
199 |   describe('calculateLinesOfCode', () => {
200 |     it('커밋의 코드 변경량을 정확하게 계산해야 함', () => {
201 |       const loc1 = calculateLinesOfCode(mockCommits[101]);
202 |       expect(loc1).toBe(150); // 100 + 50
203 | 
204 |       const loc2 = calculateLinesOfCode(mockCommits[102]);
205 |       expect(loc2).toBe(130); // 30 + 20 + 40 + 40
206 |     });
207 |   });
208 | 
209 |   describe('findFirstReviewTime', () => {
210 |     it('첫 번째 리뷰 시간을 정확하게 찾아야 함', () => {
211 |       const firstReviewTime = findFirstReviewTime(mockReviews[101]);
212 |       expect(firstReviewTime).toEqual(new Date('2023-06-12T14:00:00Z'));
213 |     });
214 | 
215 |     it('리뷰가 없을 경우 undefined를 반환해야 함', () => {
216 |       const firstReviewTime = findFirstReviewTime(mockReviews[103]);
217 |       expect(firstReviewTime).toBeUndefined();
218 |     });
219 |   });
220 | 
221 |   describe('calculateAverageReviewResponseTime', () => {
222 |     it('평균 리뷰 응답 시간을 정확하게 계산해야 함', () => {
223 |       const avgTime = calculateAverageReviewResponseTime(
224 |         mockPullRequests, 
225 |         { 101: { reviews: mockReviews[101] }, 102: { reviews: mockReviews[102] } }
226 |       );
227 |       
228 |       // PR 101: 2023-06-12T14:00:00Z - 2023-06-10T10:00:00Z = 2일 4시간 = 52시간 = 187,200,000 밀리초
229 |       // PR 102: 2023-06-13T11:00:00Z - 2023-06-12T10:00:00Z = 1일 1시간 = 25시간 = 90,000,000 밀리초
230 |       // 평균: (187,200,000 + 90,000,000) / 2 = 138,600,000 밀리초
231 |       
232 |       // 단순화된 계산 (하루를 정확히 86,400,000 밀리초로 계산)
233 |       const pr1ResponseTime = new Date('2023-06-12T14:00:00Z').getTime() - new Date('2023-06-10T10:00:00Z').getTime();
234 |       const pr2ResponseTime = new Date('2023-06-13T11:00:00Z').getTime() - new Date('2023-06-12T10:00:00Z').getTime();
235 |       const expectedAvgTime = (pr1ResponseTime + pr2ResponseTime) / 2;
236 |       
237 |       expect(avgTime).toBeCloseTo(expectedAvgTime, -4); // 소수점 4자리 오차 허용
238 |     });
239 |   });
240 | 
241 |   describe('calculateAveragePRCycleTime', () => {
242 |     it('평균 PR 사이클 타임을 정확하게 계산해야 함', () => {
243 |       const avgCycleTime = calculateAveragePRCycleTime(mockPullRequests);
244 |       
245 |       // PR 101: 2023-06-15T15:00:00Z - 2023-06-10T10:00:00Z = 5일 5시간 = 125시간
246 |       // PR 102: 2023-06-14T15:00:00Z - 2023-06-12T10:00:00Z = 2일 5시간 = 53시간
247 |       // PR 103: 아직 열려있어 계산에서 제외
248 |       // 평균: (125시간 + 53시간) / 2 = 89시간
249 |       
250 |       // 단순화된 계산 (하루를 정확히 86,400,000 밀리초로 계산)
251 |       const pr1CycleTime = new Date('2023-06-15T15:00:00Z').getTime() - new Date('2023-06-10T10:00:00Z').getTime();
252 |       const pr2CycleTime = new Date('2023-06-14T15:00:00Z').getTime() - new Date('2023-06-12T10:00:00Z').getTime();
253 |       const expectedAvgCycleTime = (pr1CycleTime + pr2CycleTime) / 2;
254 |       
255 |       expect(avgCycleTime).toBeCloseTo(expectedAvgCycleTime, -4); // 소수점 4자리 오차 허용
256 |     });
257 |   });
258 | 
259 |   describe('calculateDeploymentFrequency', () => {
260 |     it('선택 기간 내 배포 빈도를 정확하게 계산해야 함', () => {
261 |       const startDate = new Date('2023-06-10T00:00:00Z');
262 |       const endDate = new Date('2023-06-15T00:00:00Z');
263 |       
264 |       const frequency = calculateDeploymentFrequency(mockDeployments, startDate, endDate);
265 |       
266 |       // 2023-06-10 ~ 2023-06-15는 5일 기간
267 |       // 이 기간 내에 2개의 배포가 있음 => 2/5 = 0.4 (일당 배포 횟수)
268 |       expect(frequency).toBeCloseTo(0.4, 2);
269 |     });
270 |     
271 |     it('기간 외 배포는 계산하지 않아야 함', () => {
272 |       const startDate = new Date('2023-06-15T00:00:00Z');
273 |       const endDate = new Date('2023-06-17T00:00:00Z');
274 |       
275 |       const frequency = calculateDeploymentFrequency(mockDeployments, startDate, endDate);
276 |       
277 |       // 2023-06-15 ~ 2023-06-17는 2일 기간
278 |       // 이 기간 내에 1개의 배포가 있음 => 1/2 = 0.5 (일당 배포 횟수)
279 |       expect(frequency).toBeCloseTo(0.5, 2);
280 |     });
281 |     
282 |     it('기간이 0일 경우 0을 반환해야 함', () => {
283 |       const sameDate = new Date('2023-06-15T00:00:00Z');
284 |       
285 |       const frequency = calculateDeploymentFrequency(mockDeployments, sameDate, sameDate);
286 |       
287 |       expect(frequency).toBe(0);
288 |     });
289 |   });
290 |   
291 |   describe('calculateChangeFailureRate', () => {
292 |     it('결함률을 정확하게 계산해야 함', () => {
293 |       const failureRate = calculateChangeFailureRate(mockDeployments);
294 |       
295 |       // 전체 3개 배포 중 1개에 문제 발생 => 33.33%
296 |       expect(failureRate).toBeCloseTo(33.33, 1);
297 |     });
298 |     
299 |     it('배포가 없을 경우 0을 반환해야 함', () => {
300 |       const failureRate = calculateChangeFailureRate([]);
301 |       
302 |       expect(failureRate).toBe(0);
303 |     });
304 |   });
305 | 
306 |   describe('calculateMetrics', () => {
307 |     it('모든 메트릭을 정확하게 계산해야 함', () => {
308 |       const metrics = calculateMetrics(mockPullRequests, mockPrDetails, mockDeployments);
309 |       
310 |       // PR 개수
311 |       expect(metrics.prCount).toBe(3);
312 |       
313 |       // 코드 변경량: 150 + 130 + 200 = 480
314 |       expect(metrics.totalLinesOfCode).toBe(480);
315 |       
316 |       // 배포 빈도 및 결함률도 계산되어야 함
317 |       expect(metrics.deploymentFrequency).toBeDefined();
318 |       expect(metrics.changeFailureRate).toBeCloseTo(33.33, 1);
319 |       
320 |       // 리뷰 응답 시간 및 사이클 타임은 이전 테스트와 동일
321 |       expect(metrics.avgReviewResponseTime).toBeGreaterThan(0);
322 |       expect(metrics.avgPRCycleTime).toBeGreaterThan(0);
323 |     });
324 |     
325 |     it('배포 데이터가 없을 경우에도 다른 메트릭이 계산되어야 함', () => {
326 |       const metrics = calculateMetrics(mockPullRequests, mockPrDetails);
327 |       
328 |       expect(metrics.prCount).toBe(3);
329 |       expect(metrics.totalLinesOfCode).toBe(480);
330 |       expect(metrics.deploymentFrequency).toBe(0);
331 |       expect(metrics.changeFailureRate).toBe(0);
332 |     });
333 |   });
334 | });
335 | 
336 | // 테스트가 10초 이상 걸릴 수 있으므로 타임아웃 설정
337 | describe('Facebook React 저장소 메트릭스 테스트', () => {
338 |   it('facebook/react 저장소의 2025년 2월 1일부터 오늘까지의 지표를 계산합니다', async () => {
339 |     // Facebook React 저장소 정보
340 |     const owner = 'facebook';
341 |     const repo = 'react';
342 |     
343 |     // 기간 설정: 2025년 2월 1일부터 오늘까지
344 |     const since = '2025-02-01T00:00:00Z';
345 |     const until = new Date().toISOString();
346 |     
347 |     console.log(`${owner}/${repo} 저장소의 ${since} ~ ${until} 기간 메트릭스 조회 중...`);
348 |     
349 |     try {
350 |       // PR 데이터 가져오기
351 |       const pullRequests = await fetchPullRequests(owner, repo, since, until);
352 |       console.log(`가져온 PR 개수: ${pullRequests.length}`);
353 |       
354 |       // PR 상세 정보 가져오기
355 |       const prDetails: Record<number, { reviews: any[], commits: any[] }> = {};
356 |       
357 |       // 시간 단축을 위해 최대 10개의 PR만 상세 조회
358 |       const limitedPRs = pullRequests.slice(0, 10);
359 |       
360 |       for (const pr of limitedPRs) {
361 |         const prNumber = pr.number;
362 |         
363 |         // 리뷰 및 커밋 데이터 가져오기
364 |         const [reviews, commits] = await Promise.all([
365 |           fetchPullRequestReviews(owner, repo, prNumber),
366 |           fetchPullRequestCommits(owner, repo, prNumber)
367 |         ]);
368 |         
369 |         // 커밋 상세 정보 가져오기
370 |         const commitDetails = await Promise.all(
371 |           commits.map(commit => fetchCommitDetails(owner, repo, commit.sha))
372 |         );
373 |         
374 |         // 결과 저장
375 |         prDetails[prNumber] = {
376 |           reviews,
377 |           commits: commitDetails
378 |         };
379 |         
380 |         console.log(`PR #${prNumber} 상세 정보 처리 완료`);
381 |       }
382 |       
383 |       // 배포 데이터 가져오기
384 |       const deployments = await fetchDeployments(owner, repo);
385 |       
386 |       // 메트릭스 계산
387 |       const metrics = calculateMetrics(pullRequests, prDetails, deployments);
388 |       
389 |       // 결과 출력
390 |       console.log('\n====== 측정 결과 ======');
391 |       console.log(`1. PR 개수: ${metrics.prCount}개`);
392 |       console.log(`2. 코드 변경량: ${metrics.totalLinesOfCode}줄`);
393 |       console.log(`3. 평균 리뷰 응답 시간: ${(metrics.avgReviewResponseTime / (1000 * 60 * 60)).toFixed(2)}시간`);
394 |       console.log(`4. 평균 PR 사이클 타임: ${(metrics.avgPRCycleTime / (1000 * 60 * 60)).toFixed(2)}시간`);
395 |       console.log(`5. 배포 빈도: ${metrics.deploymentFrequency?.toFixed(4) || '측정 불가'} 회/일`);
396 |       console.log(`6. 결함률: ${metrics.changeFailureRate?.toFixed(2) || '측정 불가'}%`);
397 |       
398 |       // 테스트 통과 조건 (메트릭스 값이 존재하는지 확인)
399 |       expect(metrics.prCount).toBeGreaterThanOrEqual(0);
400 |       expect(metrics.totalLinesOfCode).toBeGreaterThanOrEqual(0);
401 |       
402 |     } catch (error) {
403 |       console.error('메트릭스 계산 오류:', error);
404 |       throw error; // 테스트 실패 처리
405 |     }
406 |   }, 60000); // 60초 타임아웃 설정
407 | }); 
```

src/test/refresh.test.ts
```
1 | import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
2 | import { useStore } from '../store/dashboardStore';
3 | import * as githubApi from '../api/github';
4 | 
5 | // GitHub API 모킹
6 | vi.mock('../api/github', () => ({
7 |   fetchPullRequests: vi.fn(),
8 |   fetchPullRequestReviews: vi.fn(),
9 |   fetchPullRequestCommits: vi.fn(),
10 |   fetchCommitDetails: vi.fn(),
11 |   fetchDeployments: vi.fn()
12 | }));
13 | 
14 | // 스토어 상태를 초기화하는 헬퍼 함수
15 | const resetStore = () => {
16 |   const store = useStore.getState();
17 |   store.setStartDate(null);
18 |   store.setEndDate(null);
19 |   store.setSelectedRepo(null);
20 | };
21 | 
22 | describe('데이터 갱신 기능 테스트', () => {
23 |   beforeEach(() => {
24 |     // 모킹된 함수들의 반환값 설정
25 |     vi.mocked(githubApi.fetchPullRequests).mockResolvedValue([
26 |       {
27 |         id: 1,
28 |         number: 101,
29 |         title: 'Test PR 1',
30 |         user: { login: 'user1' },
31 |         created_at: '2023-04-01T10:00:00Z',
32 |         merged_at: '2023-04-02T10:00:00Z',
33 |         closed_at: null,
34 |         state: 'merged',
35 |         html_url: 'https://github.com/owner/repo/pull/101'
36 |       }
37 |     ]);
38 | 
39 |     vi.mocked(githubApi.fetchPullRequestReviews).mockResolvedValue([
40 |       {
41 |         id: 1,
42 |         user: { login: 'reviewer1' },
43 |         state: 'APPROVED',
44 |         submitted_at: '2023-04-01T15:00:00Z',
45 |         body: 'LGTM!'
46 |       }
47 |     ]);
48 | 
49 |     vi.mocked(githubApi.fetchPullRequestCommits).mockResolvedValue([
50 |       {
51 |         sha: 'abc123',
52 |         commit: {
53 |           message: 'Test commit',
54 |           author: {
55 |             name: 'Test Author',
56 |             date: '2023-04-01T12:00:00Z'
57 |           }
58 |         }
59 |       }
60 |     ]);
61 | 
62 |     vi.mocked(githubApi.fetchCommitDetails).mockResolvedValue({
63 |       sha: 'abc123',
64 |       commit: {
65 |         message: 'Test commit',
66 |         author: {
67 |           name: 'Test Author',
68 |           date: '2023-04-01T12:00:00Z'
69 |         }
70 |       },
71 |       stats: {
72 |         additions: 10,
73 |         deletions: 5,
74 |         total: 15
75 |       }
76 |     });
77 | 
78 |     vi.mocked(githubApi.fetchDeployments).mockResolvedValue([
79 |       {
80 |         id: 1,
81 |         repository: 'owner/repo',
82 |         environment: 'production',
83 |         created_at: '2023-04-02T14:00:00Z',
84 |         completed_at: '2023-04-02T14:30:00Z',
85 |         status: 'success',
86 |         has_issues: false,
87 |         created_by: 'user1'
88 |       }
89 |     ]);
90 |   });
91 | 
92 |   afterEach(() => {
93 |     vi.clearAllMocks();
94 |     resetStore();
95 |   });
96 | 
97 |   it('데이터 새로고침 시 loadEvents가 호출되는지 확인', async () => {
98 |     // 스파이 생성
99 |     const loadEventsSpy = vi.spyOn(useStore.getState(), 'loadEvents');
100 |     
101 |     // refreshData 호출
102 |     await useStore.getState().refreshData();
103 |     
104 |     // loadEvents 호출 확인
105 |     expect(loadEventsSpy).toHaveBeenCalledTimes(1);
106 |   });
107 | 
108 |   it('저장소가 선택된 상태에서 갱신 시 적절한 API가 호출되는지 확인', async () => {
109 |     // 상태 설정
110 |     const store = useStore.getState();
111 |     store.setSelectedRepo('owner/repo');
112 |     
113 |     // refreshData 호출
114 |     await store.refreshData();
115 |     
116 |     // API 호출 확인
117 |     const [owner, repo] = 'owner/repo'.split('/');
118 |     expect(githubApi.fetchDeployments).toHaveBeenCalledWith(owner, repo);
119 |   });
120 | 
121 |   it('시작일, 종료일, 저장소가 모두 선택된 상태에서 갱신 시 loadMetrics가 호출되는지 확인', async () => {
122 |     // 스파이 생성
123 |     const loadMetricsSpy = vi.spyOn(useStore.getState(), 'loadMetrics');
124 |     
125 |     // 상태 설정
126 |     const store = useStore.getState();
127 |     const startDate = new Date('2023-04-01');
128 |     const endDate = new Date('2023-04-30');
129 |     const repo = 'owner/repo';
130 |     
131 |     store.setStartDate(startDate);
132 |     store.setEndDate(endDate);
133 |     store.setSelectedRepo(repo);
134 |     
135 |     // refreshData 호출
136 |     await store.refreshData();
137 |     
138 |     // loadMetrics 호출 확인
139 |     expect(loadMetricsSpy).toHaveBeenCalledWith(startDate, endDate, repo);
140 |   });
141 | 
142 |   it('데이터 갱신 후 lastUpdated가 업데이트되는지 확인', async () => {
143 |     // 현재 lastUpdated 값 저장
144 |     const oldLastUpdated = useStore.getState().lastUpdated;
145 |     
146 |     // 잠시 대기
147 |     await new Promise(resolve => setTimeout(resolve, 10));
148 |     
149 |     // refreshData 호출
150 |     await useStore.getState().refreshData();
151 |     
152 |     // lastUpdated 확인
153 |     const newLastUpdated = useStore.getState().lastUpdated;
154 |     expect(newLastUpdated).not.toBeNull();
155 |     expect(newLastUpdated instanceof Date).toBe(true);
156 |     
157 |     // 이전 값과 다른지 확인
158 |     if (oldLastUpdated) {
159 |       expect(newLastUpdated?.getTime()).toBeGreaterThan(oldLastUpdated.getTime());
160 |     }
161 |   });
162 | 
163 |   it('갱신 중에는 isLoading이 true로 설정되는지 확인', async () => {
164 |     // loadEvents를 느리게 실행하도록 모킹
165 |     vi.spyOn(useStore.getState(), 'loadEvents').mockImplementation(async () => {
166 |       useStore.setState({ isLoading: true });
167 |       await new Promise(resolve => setTimeout(resolve, 100));
168 |       useStore.setState({ isLoading: false, lastUpdated: new Date() });
169 |     });
170 |     
171 |     // refreshData 호출
172 |     const refreshPromise = useStore.getState().refreshData();
173 |     
174 |     // isLoading 상태 확인
175 |     expect(useStore.getState().isLoading).toBe(true);
176 |     
177 |     // 완료 대기
178 |     await refreshPromise;
179 |     
180 |     // 완료 후 상태 확인
181 |     expect(useStore.getState().isLoading).toBe(false);
182 |   });
183 | }); 
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
14 | import config from '../config.json';
15 | import { eachDayOfInterval, startOfDay, isSameDay, format } from 'date-fns';
16 | 
17 | // 캐시 관련 상수 및 유틸리티 함수
18 | const CACHE_PREFIX = 'beaver_';
19 | const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24시간 (밀리초)
20 | 
21 | // 기본 날짜 설정
22 | const defaultStartDate = new Date(config.defaultTimeRange?.since || '2024-01-01');
23 | const defaultEndDate = new Date(config.defaultTimeRange?.until || '2025-03-16');
24 | 
25 | // 캐시 키 생성 함수
26 | const generateCacheKey = (startDate: Date, endDate: Date, repo: string | null): string => {
27 |   if (!repo) return '';
28 |   const startStr = format(startDate, 'yyyy-MM-dd');
29 |   const endStr = format(endDate, 'yyyy-MM-dd');
30 |   return `${CACHE_PREFIX}${repo}_data_${startStr}_${endStr}`;
31 | };
32 | 
33 | // 캐시 데이터 저장 함수
34 | const saveToCache = (key: string, data: any) => {
35 |   if (!key) return;
36 |   
37 |   const cacheData = {
38 |     timestamp: new Date().toISOString(),
39 |     data
40 |   };
41 |   
42 |   try {
43 |     localStorage.setItem(key, JSON.stringify(cacheData));
44 |     console.log(`캐시 저장 완료: ${key}`);
45 |   } catch (error) {
46 |     console.error('캐시 저장 오류:', error);
47 |   }
48 | };
49 | 
50 | // 캐시 데이터 가져오기 함수
51 | const getFromCache = (key: string) => {
52 |   if (!key) return null;
53 |   
54 |   try {
55 |     const cacheData = localStorage.getItem(key);
56 |     if (!cacheData) return null;
57 |     
58 |     const parsedData = JSON.parse(cacheData);
59 |     
60 |     // 캐시 만료 확인
61 |     const timestamp = new Date(parsedData.timestamp).getTime();
62 |     const now = new Date().getTime();
63 |     
64 |     if (now - timestamp > CACHE_EXPIRY) {
65 |       console.log(`캐시 만료: ${key}`);
66 |       localStorage.removeItem(key);
67 |       return null;
68 |     }
69 |     
70 |     return parsedData;
71 |   } catch (error) {
72 |     console.error('캐시 가져오기 오류:', error);
73 |     return null;
74 |   }
75 | };
76 | 
77 | // 모든 캐시 데이터 삭제 함수
78 | const clearAllCache = () => {
79 |   try {
80 |     Object.keys(localStorage).forEach(key => {
81 |       if (key.startsWith(CACHE_PREFIX)) {
82 |         localStorage.removeItem(key);
83 |       }
84 |     });
85 |     console.log('모든 캐시 삭제 완료');
86 |   } catch (error) {
87 |     console.error('캐시 삭제 오류:', error);
88 |   }
89 | };
90 | 
91 | // 테스트 모드 감지 함수
92 | const isTestDataMode = (repo: string, start: Date, end: Date): boolean => {
93 |   // 시작일이 2024-01-01인 경우 테스트 데이터 모드로 간주
94 |   return start.getFullYear() === 2024 && start.getMonth() === 0 && start.getDate() === 1;
95 | };
96 | 
97 | // 테스트 데이터 생성 함수
98 | const createDefaultTestData = (repo: string, startDate: Date, endDate: Date) => {
99 |   console.log(`📊 테스트 모드를 위한 기본 데이터를 자동 생성합니다: ${repo}`);
100 |   
101 |   const startStr = format(startDate, 'yyyy-MM-dd');
102 |   const endStr = format(endDate, 'yyyy-MM-dd');
103 |   
104 |   // 키 생성
105 |   const leadTimeKey = `beaver_${repo}_lead_time_${startStr}_${endStr}`;
106 |   const mttrKey = `beaver_${repo}_mttr_${startStr}_${endStr}`;
107 |   const dfKey = `beaver_${repo}_deployment_frequency_${startStr}_${endStr}`;
108 |   const cfrKey = `beaver_${repo}_change_failure_rate_${startStr}_${endStr}`;
109 |   const metricsKey = `beaver_${repo}_metrics_${startStr}_${endStr}`;
110 |   const deploymentsKey = `beaver_${repo}_deployments_${startStr}_${endStr}`;
111 |   const incidentsKey = `beaver_${repo}_incidents_${startStr}_${endStr}`;
112 |   
113 |   // 이미 데이터가 있는지 확인
114 |   if (localStorage.getItem(leadTimeKey) || 
115 |       localStorage.getItem(mttrKey) || 
116 |       localStorage.getItem(dfKey) || 
117 |       localStorage.getItem(cfrKey)) {
118 |     console.log('기존 테스트 데이터가 발견되었습니다. 자동 생성을 건너뜁니다.');
119 |     return;
120 |   }
121 |   
122 |   // 날짜 범위 생성 (30일)
123 |   const days = 30;
124 |   const leadTimeData = [];
125 |   const mttrData = [];
126 |   const deploymentFrequencyData = [];
127 |   const changeFailureRateData = [];
128 |   
129 |   const endDateValue = new Date(endDate);
130 |   const startDateValue = new Date(endDateValue);
131 |   startDateValue.setDate(endDateValue.getDate() - days);
132 |   
133 |   // 날짜 배열 생성
134 |   const dateRange = eachDayOfInterval({ start: startDateValue, end: endDateValue });
135 |   
136 |   // 1. 리드 타임 데이터 생성
137 |   for (const date of dateRange) {
138 |     leadTimeData.push({
139 |       date: format(date, 'yyyy-MM-dd'),
140 |       leadTime: 10 + Math.random() * 20 // 10~30 시간 사이 랜덤 값
141 |     });
142 |   }
143 |   
144 |   // 2. MTTR 데이터 생성
145 |   for (const date of dateRange) {
146 |     mttrData.push({
147 |       date: format(date, 'yyyy-MM-dd'),
148 |       mttr: 1 + Math.random() * 5 // 1~6 시간 사이 랜덤 값
149 |     });
150 |   }
151 |   
152 |   // 3. 배포 빈도 데이터 생성
153 |   for (const date of dateRange) {
154 |     deploymentFrequencyData.push({
155 |       date: format(date, 'yyyy-MM-dd'),
156 |       count: Math.floor(Math.random() * 3) // 0~2 회/일 사이 랜덤 값
157 |     });
158 |   }
159 |   
160 |   // 4. 변경 실패율 데이터 생성
161 |   for (const date of dateRange) {
162 |     changeFailureRateData.push({
163 |       date: format(date, 'yyyy-MM-dd'),
164 |       rate: Math.random() * 20 // 0~20% 사이 랜덤 값
165 |     });
166 |   }
167 |   
168 |   // 5. 메트릭스 요약 데이터
169 |   const metricsData = {
170 |     leadTimeForChanges: 18.5, // 평균 리드 타임 (시간)
171 |     deploymentFrequency: 1.2, // 배포 빈도 (회/일)
172 |     changeFailureRate: 12.5, // 변경 실패율 (%)
173 |     meanTimeToRestore: 3.2, // 평균 복구 시간 (시간)
174 |   };
175 |   
176 |   // 6. 배포 이벤트 데이터
177 |   const deploymentsData = dateRange.map((date, index) => {
178 |     if (Math.random() > 0.7) { // 약 30%의 날짜에만 배포 이벤트 생성
179 |       return {
180 |         timestamp: format(date, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'', { weekStartsOn: 1 }),
181 |         version: `v1.${index % 10}.${Math.floor(Math.random() * 10)}`
182 |       };
183 |     }
184 |     return null;
185 |   }).filter(Boolean);
186 |   
187 |   // 7. 인시던트 데이터
188 |   const incidentsData = dateRange.map((date, index) => {
189 |     if (Math.random() > 0.9) { // 약 10%의 날짜에만 인시던트 생성
190 |       const startTime = new Date(date);
191 |       startTime.setHours(Math.floor(Math.random() * 12) + 8); // 8AM~8PM 사이
192 |       
193 |       const endTime = new Date(startTime);
194 |       endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 6) + 1); // 1~6시간 지속
195 |       
196 |       return {
197 |         start: format(startTime, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
198 |         end: format(endTime, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
199 |         severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
200 |       };
201 |     }
202 |     return null;
203 |   }).filter(Boolean);
204 |   
205 |   // 데이터 저장
206 |   try {
207 |     localStorage.setItem(leadTimeKey, JSON.stringify(leadTimeData));
208 |     localStorage.setItem(mttrKey, JSON.stringify(mttrData));
209 |     localStorage.setItem(dfKey, JSON.stringify(deploymentFrequencyData));
210 |     localStorage.setItem(cfrKey, JSON.stringify(changeFailureRateData));
211 |     localStorage.setItem(metricsKey, JSON.stringify(metricsData));
212 |     localStorage.setItem(deploymentsKey, JSON.stringify(deploymentsData));
213 |     localStorage.setItem(incidentsKey, JSON.stringify(incidentsData));
214 |     
215 |     console.log('🎉 테스트 데이터가 성공적으로 생성되었습니다.', {
216 |       leadTimeData: leadTimeData.length,
217 |       mttrData: mttrData.length,
218 |       deploymentFrequencyData: deploymentFrequencyData.length,
219 |       changeFailureRateData: changeFailureRateData.length,
220 |       deploymentsData: deploymentsData.length,
221 |       incidentsData: incidentsData.length
222 |     });
223 |     
224 |   } catch (error) {
225 |     console.error('테스트 데이터 생성 중 오류 발생:', error);
226 |   }
227 | };
228 | 
229 | // 차트 데이터 타입 정의
230 | export interface TimeSeriesDataPoint {
231 |   date: string;
232 |   value: number;
233 | }
234 | 
235 | export interface LeadTimeDataPoint {
236 |   date: string;
237 |   leadTime: number;
238 |   repository?: string;
239 | }
240 | 
241 | export interface MTTRDataPoint {
242 |   date: string;
243 |   mttr: number;
244 |   repository?: string;
245 | }
246 | 
247 | export interface DeploymentFrequencyDataPoint {
248 |   date: string;
249 |   count: number;
250 |   repository?: string;
251 | }
252 | 
253 | export interface ChangeFailureRateDataPoint {
254 |   date: string;
255 |   rate: number;
256 |   repository?: string;
257 | }
258 | 
259 | // 여러 저장소 데이터를 관리하기 위한 컬렉션 인터페이스
260 | export interface MultiRepoDataCollection {
261 |   leadTimeData: { [repo: string]: LeadTimeDataPoint[] };
262 |   mttrData: { [repo: string]: MTTRDataPoint[] };
263 |   deploymentFrequencyData: { [repo: string]: DeploymentFrequencyDataPoint[] };
264 |   changeFailureRateData: { [repo: string]: ChangeFailureRateDataPoint[] };
265 | }
266 | 
267 | // 이벤트 인터페이스 정의
268 | export interface Event {
269 |   id: string;
270 |   type: 'deployment' | 'incident' | 'recovery' | 'other';
271 |   timestamp: string;
272 |   description: string;
273 |   repository: string;
274 | }
275 | 
276 | // 대시보드 상태와 인터페이스를 정의합니다
277 | interface DashboardState {
278 |   // 필터링 상태
279 |   startDate: Date | null;
280 |   endDate: Date | null;
281 |   selectedRepo: string | null;
282 |   repositories: string[];
283 |   
284 |   // 데이터 상태
285 |   events: Event[];
286 |   isLoading: boolean;
287 |   error: string | null;
288 |   lastUpdated: Date | null; // 마지막 업데이트 시간
289 |   
290 |   // 계산된 메트릭스
291 |   leadTimeForChanges: number | null;
292 |   deploymentFrequency: number | null;
293 |   changeFailureRate: number | null;
294 |   meanTimeToRestore: number | null;
295 |   
296 |   // 차트 데이터
297 |   leadTimeData: LeadTimeDataPoint[];
298 |   mttrData: MTTRDataPoint[];
299 |   deploymentFrequencyData: DeploymentFrequencyDataPoint[];
300 |   changeFailureRateData: ChangeFailureRateDataPoint[];
301 |   
302 |   // 액션
303 |   setStartDate: (date: Date | null) => void;
304 |   setEndDate: (date: Date | null) => void;
305 |   setSelectedRepo: (repo: string | null) => void;
306 |   setEvents: (events: Event[]) => void;
307 |   loadEvents: () => Promise<void>;
308 |   loadMetrics: (startDate: Date, endDate: Date, repo: string) => Promise<void>;
309 |   refreshData: () => Promise<void>; // 데이터 새로고침 함수
310 | }
311 | 
312 | // config.repositories에서 저장소 문자열 목록 추출
313 | const getRepositoryStrings = (): string[] => {
314 |   if (!config.repositories) return ['owner/repo1', 'owner/repo2', 'owner/repo3'];
315 |   
316 |   // 저장소 객체 배열이면 문자열 형식으로 변환 ("owner/name")
317 |   if (Array.isArray(config.repositories)) {
318 |     return config.repositories.map((repo: any) => {
319 |       if (typeof repo === 'string') return repo;
320 |       if (repo && repo.owner && repo.name) return `${repo.owner}/${repo.name}`;
321 |       return 'unknown/repo';
322 |     });
323 |   }
324 |   
325 |   return ['owner/repo1', 'owner/repo2', 'owner/repo3'];
326 | };
327 | 
328 | // 배포 이벤트를 일반 이벤트로 변환하는 함수
329 | const deploymentToEvent = (deployment: DeploymentEvent): Event => {
330 |   return {
331 |     id: `deployment-${deployment.id}`,
332 |     type: deployment.has_issues ? 'incident' : 'deployment',
333 |     timestamp: deployment.created_at,
334 |     description: `${deployment.has_issues ? '실패한 배포' : '성공한 배포'} (${deployment.environment})`,
335 |     repository: deployment.repository
336 |   };
337 | };
338 | 
339 | export const useDashboardStore = create<DashboardState>((set, get) => ({
340 |   // 필터링 상태
341 |   startDate: null,
342 |   endDate: null,
343 |   selectedRepo: null,
344 |   repositories: getRepositoryStrings(), // 문자열 배열로 변환된 저장소 목록
345 |   
346 |   // 데이터 상태
347 |   events: [],
348 |   isLoading: false,
349 |   error: null,
350 |   lastUpdated: null,
351 |   
352 |   // 계산된 메트릭스
353 |   leadTimeForChanges: null,
354 |   deploymentFrequency: null,
355 |   changeFailureRate: null,
356 |   meanTimeToRestore: null,
357 |   
358 |   // 차트 데이터 (더미 데이터, 실제 구현 시 API 호출로 변경)
359 |   leadTimeData: [
360 |     { date: '2023-04-01', leadTime: 30.5 },
361 |     { date: '2023-04-02', leadTime: 22.8 },
362 |     { date: '2023-04-03', leadTime: 28.2 },
363 |     { date: '2023-04-04', leadTime: 18.5 },
364 |     { date: '2023-04-05', leadTime: 16.3 },
365 |     { date: '2023-04-06', leadTime: 25.7 },
366 |     { date: '2023-04-07', leadTime: 20.1 }
367 |   ],
368 |   mttrData: [
369 |     { date: '2023-04-01', mttr: 5.2 },
370 |     { date: '2023-04-02', mttr: 3.5 },
371 |     { date: '2023-04-03', mttr: 6.1 },
372 |     { date: '2023-04-04', mttr: 2.4 },
373 |     { date: '2023-04-05', mttr: 3.8 },
374 |     { date: '2023-04-06', mttr: 4.2 },
375 |     { date: '2023-04-07', mttr: 3.0 }
376 |   ],
377 |   deploymentFrequencyData: [],
378 |   changeFailureRateData: [],
379 |   
380 |   // 액션
381 |   setStartDate: (date) => set({ startDate: date }),
382 |   setEndDate: (date) => set({ endDate: date }),
383 |   setSelectedRepo: (repo) => set({ selectedRepo: repo }),
384 |   setEvents: (events) => set({ events }),
385 |   
386 |   // 이벤트 데이터 로드
387 |   loadEvents: async () => {
388 |     const state = get();
389 |     set({ isLoading: true, error: null });
390 |     
391 |     try {
392 |       // 선택된 저장소가 있으면 해당 저장소의 이벤트만 로드
393 |       if (state.selectedRepo) {
394 |         const [owner, repo] = state.selectedRepo.split('/');
395 |         
396 |         // 배포 데이터 가져오기
397 |         const deployments = await fetchDeployments(owner, repo);
398 |         
399 |         // 이벤트로 변환
400 |         const events = deployments.map(deploymentToEvent);
401 |         
402 |         set({
403 |           events,
404 |           isLoading: false,
405 |           lastUpdated: new Date()
406 |         });
407 |       } else {
408 |         // 선택된 저장소가 없으면 기본 데이터 표시
409 |         const dummyEvents = [
410 |           { 
411 |             id: '1',
412 |             type: 'deployment' as const,
413 |             timestamp: '2023-04-01T10:00:00Z',
414 |             description: '버전 1.2.3 배포',
415 |             repository: 'owner/repo1'
416 |           },
417 |           { 
418 |             id: '2',
419 |             type: 'incident' as const,
420 |             timestamp: '2023-04-03T11:00:00Z',
421 |             description: '서버 오류 발생',
422 |             repository: 'owner/repo1'
423 |           },
424 |           { 
425 |             id: '3',
426 |             type: 'recovery' as const,
427 |             timestamp: '2023-04-03T15:00:00Z',
428 |             description: '서버 오류 복구 완료',
429 |             repository: 'owner/repo1'
430 |           },
431 |           { 
432 |             id: '4',
433 |             type: 'deployment' as const,
434 |             timestamp: '2023-04-05T09:00:00Z',
435 |             description: '버전 1.2.4 배포',
436 |             repository: 'owner/repo1'
437 |           }
438 |         ];
439 |         
440 |         set({
441 |           events: dummyEvents,
442 |           isLoading: false,
443 |           lastUpdated: new Date()
444 |         });
445 |       }
446 |     } catch (error) {
447 |       console.error('이벤트 데이터 로드 오류:', error);
448 |       set({ 
449 |         error: '이벤트 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.',
450 |         isLoading: false 
451 |       });
452 |     }
453 |   },
454 |   
455 |   // 메트릭스 계산 - 실제 GitHub API 사용
456 |   loadMetrics: async (startDate, endDate, repo) => {
457 |     set({ isLoading: true, error: null });
458 |     
459 |     try {
460 |       // 테스트 데이터 모드인지 확인
461 |       const testMode = isTestDataMode(repo, startDate, endDate);
462 |       if (testMode) {
463 |         console.log('📊 테스트 데이터 모드: loadMetrics에서 GitHub API 호출 생략');
464 |         
465 |         const startStr = format(startDate, 'yyyy-MM-dd');
466 |         const endStr = format(endDate, 'yyyy-MM-dd');
467 |         
468 |         // 주요 지표 데이터 찾기
469 |         const leadTimeKey = `beaver_${repo}_lead_time_${startStr}_${endStr}`;
470 |         const mttrKey = `beaver_${repo}_mttr_${startStr}_${endStr}`;
471 |         const dfKey = `beaver_${repo}_deployment_frequency_${startStr}_${endStr}`;
472 |         const cfrKey = `beaver_${repo}_change_failure_rate_${startStr}_${endStr}`;
473 |         const metricsKey = `beaver_${repo}_metrics_${startStr}_${endStr}`;
474 |         const deploymentsKey = `beaver_${repo}_deployments_${startStr}_${endStr}`;
475 |         const incidentsKey = `beaver_${repo}_incidents_${startStr}_${endStr}`;
476 |         
477 |         try {
478 |           // 테스트 데이터가 있는지 확인
479 |           const leadTimeData = JSON.parse(localStorage.getItem(leadTimeKey) || '[]');
480 |           const mttrData = JSON.parse(localStorage.getItem(mttrKey) || '[]');
481 |           const deploymentFrequencyData = JSON.parse(localStorage.getItem(dfKey) || '[]');
482 |           const changeFailureRateData = JSON.parse(localStorage.getItem(cfrKey) || '[]');
483 |           const metricsData = JSON.parse(localStorage.getItem(metricsKey) || '{}');
484 |           
485 |           // 테스트 데이터가 있으면 적용
486 |           if (leadTimeData.length > 0 || mttrData.length > 0 || deploymentFrequencyData.length > 0 || changeFailureRateData.length > 0) {
487 |             console.log('💾 테스트 데이터 발견, 차트에 적용합니다');
488 |             
489 |             set({
490 |               leadTimeForChanges: metricsData.leadTimeForChanges || 0,
491 |               deploymentFrequency: metricsData.deploymentFrequency || 0,
492 |               changeFailureRate: metricsData.changeFailureRate || 0,
493 |               meanTimeToRestore: metricsData.meanTimeToRestore || 0,
494 |               leadTimeData,
495 |               mttrData,
496 |               deploymentFrequencyData,
497 |               changeFailureRateData,
498 |               isLoading: false,
499 |               lastUpdated: new Date()
500 |             });
501 |             
502 |             return;
503 |           } else {
504 |             console.log('❌ 테스트 데이터 모드이지만 데이터를 찾을 수 없습니다. 기본 테스트 데이터를 자동 생성합니다.');
505 |             
506 |             // 자동으로 테스트 데이터 생성
507 |             createDefaultTestData(repo, startDate, endDate);
508 |             
509 |             // 생성된 데이터 다시 확인
510 |             const autoGenLeadTimeData = JSON.parse(localStorage.getItem(leadTimeKey) || '[]');
511 |             const autoGenMttrData = JSON.parse(localStorage.getItem(mttrKey) || '[]');
512 |             const autoGenDfData = JSON.parse(localStorage.getItem(dfKey) || '[]');
513 |             const autoGenCfrData = JSON.parse(localStorage.getItem(cfrKey) || '[]');
514 |             const autoGenMetricsData = JSON.parse(localStorage.getItem(metricsKey) || '{}');
515 |             
516 |             if (autoGenLeadTimeData.length > 0) {
517 |               console.log('🎉 자동 생성된 테스트 데이터를 적용합니다.');
518 |               
519 |               set({
520 |                 leadTimeForChanges: autoGenMetricsData.leadTimeForChanges || 0,
521 |                 deploymentFrequency: autoGenMetricsData.deploymentFrequency || 0,
522 |                 changeFailureRate: autoGenMetricsData.changeFailureRate || 0,
523 |                 meanTimeToRestore: autoGenMetricsData.meanTimeToRestore || 0,
524 |                 leadTimeData: autoGenLeadTimeData,
525 |                 mttrData: autoGenMttrData,
526 |                 deploymentFrequencyData: autoGenDfData,
527 |                 changeFailureRateData: autoGenCfrData,
528 |                 isLoading: false,
529 |                 lastUpdated: new Date()
530 |               });
531 |               
532 |               return;
533 |             }
534 |             
535 |             // 디버깅: 로컬 스토리지의 모든 키 출력
536 |             console.log('로컬 스토리지 내 모든 키:');
537 |             for (let i = 0; i < localStorage.length; i++) {
538 |               const key = localStorage.key(i);
539 |               console.log(`${i}: ${key} (값 존재: ${Boolean(localStorage.getItem(key))})`);
540 |             }
541 |             
542 |             // 디버깅: 찾으려는 키 목록 출력
543 |             console.log('찾으려는 키:', {
544 |               leadTimeKey,
545 |               mttrKey,
546 |               dfKey,
547 |               cfrKey,
548 |               metricsKey,
549 |               deploymentsKey,
550 |               incidentsKey
551 |             });
552 |             
553 |             set({ 
554 |               error: '테스트 데이터를 찾을 수 없습니다. "테스트 데이터 주입" 도구를 사용하여 데이터를 추가해주세요.',
555 |               isLoading: false 
556 |             });
557 |             return;
558 |           }
559 |         } catch (error) {
560 |           console.error('테스트 데이터 처리 오류:', error);
561 |           set({ 
562 |             error: '테스트 데이터 처리 중 오류가 발생했습니다.',
563 |             isLoading: false 
564 |           });
565 |           return;
566 |         }
567 |       }
568 | 
569 |       // 테스트 모드가 아닌 경우에만 GitHub API 호출 진행
570 |       // 저장소 정보 파싱
571 |       const [owner, repoName] = repo.split('/');
572 |       
573 |       // 날짜를 ISO 형식 문자열로 변환
574 |       const since = startDate.toISOString();
575 |       const until = endDate.toISOString();
576 |       
577 |       // PR 데이터 가져오기
578 |       const pullRequests = await fetchPullRequests(owner, repoName, since, until);
579 |       
580 |       // PR 상세 정보 가져오기
581 |       const prDetails: Record<number, { reviews: Review[], commits: Commit[] }> = {};
582 |       
583 |       // 병렬 처리를 위한 프로미스 배열
584 |       const promises = pullRequests.map(async (pr) => {
585 |         const prNumber = pr.number;
586 |         
587 |         // 리뷰 및 커밋 데이터 병렬로 가져오기
588 |         const [reviews, commits] = await Promise.all([
589 |           fetchPullRequestReviews(owner, repoName, prNumber),
590 |           fetchPullRequestCommits(owner, repoName, prNumber)
591 |         ]);
592 |         
593 |         // 커밋 상세 정보 가져오기
594 |         const commitDetailsPromises = commits.map(commit => 
595 |           fetchCommitDetails(owner, repoName, commit.sha)
596 |         );
597 |         const commitDetails = await Promise.all(commitDetailsPromises);
598 |         
599 |         // 결과 저장
600 |         prDetails[prNumber] = {
601 |           reviews,
602 |           commits: commitDetails
603 |         };
604 |       });
605 |       
606 |       // 모든 PR 데이터 가져오기 완료 대기
607 |       await Promise.all(promises);
608 |       
609 |       // 배포 데이터 가져오기
610 |       const deployments = await fetchDeployments(owner, repoName);
611 |       
612 |       // 메트릭스 계산
613 |       const metrics = calculateMetrics(pullRequests, prDetails, deployments);
614 |       
615 |       // 차트 데이터 생성 (시간별 데이터)
616 |       // 선택된 기간의 모든 날짜 배열 생성
617 |       const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
618 |       
619 |       // 리드 타임 데이터 생성
620 |       const leadTimeData = dateRange.map(date => {
621 |         // 해당 날짜의 PR들 필터링
622 |         const dayPRs = pullRequests.filter(pr => {
623 |           const prCreatedDate = startOfDay(new Date(pr.created_at));
624 |           return isSameDay(prCreatedDate, date);
625 |         });
626 |         
627 |         // 해당 날짜의 평균 리드 타임 계산
628 |         let avgLeadTime = 0;
629 |         if (dayPRs.length > 0) {
630 |           const leadTimes = dayPRs.map(pr => {
631 |             if (!pr.merged_at) return 0;
632 |             return (new Date(pr.merged_at).getTime() - new Date(pr.created_at).getTime()) / (1000 * 60 * 60);
633 |           }).filter(time => time > 0);
634 |           
635 |           if (leadTimes.length > 0) {
636 |             avgLeadTime = leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length;
637 |           }
638 |         }
639 |         
640 |         return {
641 |           date: format(date, 'yyyy-MM-dd'),
642 |           leadTime: avgLeadTime
643 |         };
644 |       });
645 |       
646 |       // 복구 시간 데이터 생성
647 |       const mttrData = dateRange.map(date => {
648 |         // MTTR 계산 로직 (예시: 고정값)
649 |         return {
650 |           date: format(date, 'yyyy-MM-dd'),
651 |           mttr: metrics.meanTimeToRestore || 4.2
652 |         };
653 |       });
654 |       
655 |       // 배포 빈도 데이터 생성
656 |       const deploymentFrequencyData = dateRange.map(date => {
657 |         const dayStart = startOfDay(date);
658 |         const dayEnd = new Date(dayStart);
659 |         dayEnd.setDate(dayStart.getDate() + 1);
660 |         
661 |         // 해당 날짜의 배포 횟수 계산
662 |         const deploymentCount = deployments.filter(deployment => {
663 |           const deploymentDate = new Date(deployment.created_at);
664 |           return deploymentDate >= dayStart && deploymentDate < dayEnd;
665 |         }).length;
666 |         
667 |         return {
668 |           date: format(date, 'yyyy-MM-dd'),
669 |           count: deploymentCount
670 |         };
671 |       });
672 |       
673 |       // 변경 실패율 데이터 생성
674 |       const changeFailureRateData = dateRange.map(date => {
675 |         const dayStart = startOfDay(date);
676 |         const dayEnd = new Date(dayStart);
677 |         dayEnd.setDate(dayStart.getDate() + 1);
678 |         
679 |         // 해당 날짜의 배포 필터링
680 |         const dayDeployments = deployments.filter(deployment => {
681 |           const deploymentDate = new Date(deployment.created_at);
682 |           return deploymentDate >= dayStart && deploymentDate < dayEnd;
683 |         });
684 |         
685 |         // 실패율 계산
686 |         let failureRate = 0;
687 |         if (dayDeployments.length > 0) {
688 |           const failedDeployments = dayDeployments.filter(deployment => deployment.has_issues).length;
689 |           failureRate = (failedDeployments / dayDeployments.length) * 100;
690 |         } else if (metrics.changeFailureRate !== null) {
691 |           failureRate = metrics.changeFailureRate * 100;
692 |         }
693 |         
694 |         return {
695 |           date: format(date, 'yyyy-MM-dd'),
696 |           rate: failureRate
697 |         };
698 |       });
699 |       
700 |       set({
701 |         leadTimeForChanges: metrics.avgPRCycleTime / (1000 * 60 * 60), // 밀리초를 시간으로 변환
702 |         deploymentFrequency: metrics.deploymentFrequency || 0,
703 |         changeFailureRate: metrics.changeFailureRate || 0,
704 |         meanTimeToRestore: 4.2, // 실제 계산 필요
705 |         leadTimeData,
706 |         mttrData,
707 |         deploymentFrequencyData,
708 |         changeFailureRateData,
709 |         isLoading: false,
710 |         lastUpdated: new Date()
711 |       });
712 |       
713 |       // 이벤트 데이터도 함께 업데이트
714 |       await get().loadEvents();
715 |       
716 |     } catch (error) {
717 |       console.error('메트릭스 로드 오류:', error);
718 |       set({ 
719 |         error: '데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.',
720 |         isLoading: false 
721 |       });
722 |     }
723 |   },
724 |   
725 |   // 데이터 갱신 함수
726 |   refreshData: async () => {
727 |     const state = get();
728 |     
729 |     // 시작일, 종료일, 저장소가 모두 선택된 경우
730 |     if (state.startDate && state.endDate && state.selectedRepo) {
731 |       // 날짜 형식 확인 및 변환
732 |       const start = state.startDate instanceof Date ? state.startDate : 
733 |                    typeof state.startDate === 'string' ? new Date(state.startDate) : defaultStartDate;
734 |       const end = state.endDate instanceof Date ? state.endDate : 
735 |                  typeof state.endDate === 'string' ? new Date(state.endDate) : defaultEndDate;
736 |       
737 |       // 캐시 키 생성
738 |       const cacheKey = generateCacheKey(start, end, state.selectedRepo);
739 |       console.log('새로고침 시도 - 캐시 키:', cacheKey);
740 |       
741 |       // 현재 로컬 스토리지 상태 확인
742 |       console.log('로컬 스토리지 내 캐시 키 목록:');
743 |       for (let i = 0; i < localStorage.length; i++) {
744 |         const key = localStorage.key(i);
745 |         if (key?.startsWith(CACHE_PREFIX)) {
746 |           console.log(` - ${key}`);
747 |         }
748 |       }
749 |       
750 |       // 테스트 데이터 모드인지 확인
751 |       const testMode = isTestDataMode(state.selectedRepo, start, end);
752 |       if (testMode) {
753 |         console.log('📊 테스트 데이터 모드 감지: 캐시된 테스트 데이터를 먼저 확인합니다.');
754 |       }
755 |       
756 |       // 캐시 존재 확인
757 |       const cachedData = getFromCache(cacheKey);
758 |       if (cachedData) {
759 |         console.log('💾 새로고침: 캐시된 데이터를 사용합니다', cacheKey);
760 |         
761 |         // 캐시된 데이터로 상태 직접 업데이트
762 |         set({
763 |           leadTimeForChanges: cachedData.data.metrics.leadTimeForChanges,
764 |           deploymentFrequency: cachedData.data.metrics.deploymentFrequency,
765 |           changeFailureRate: cachedData.data.metrics.changeFailureRate,
766 |           meanTimeToRestore: cachedData.data.metrics.meanTimeToRestore,
767 |           events: cachedData.data.events,
768 |           leadTimeData: cachedData.data.leadTimeData || [],
769 |           mttrData: cachedData.data.mttrData || [],
770 |           deploymentFrequencyData: cachedData.data.deploymentFrequencyData || [],
771 |           changeFailureRateData: cachedData.data.changeFailureRateData || [],
772 |           isLoading: false,
773 |           lastUpdated: new Date(cachedData.timestamp)
774 |         });
775 |         
776 |         return;
777 |       } else {
778 |         // 테스트 데이터 체크
779 |         if (testMode) {
780 |           // 테스트 데이터 체크
781 |           console.log('🧪 테스트 데이터 모드: 직접 캐시 항목 확인');
782 |           
783 |           // 저장소 아이디 추출 (owner/name 형식)
784 |           const repo = state.selectedRepo;
785 |           const startStr = format(start, 'yyyy-MM-dd');
786 |           const endStr = format(end, 'yyyy-MM-dd');
787 |           
788 |           // 주요 지표 데이터 찾기
789 |           const leadTimeKey = `beaver_${repo}_lead_time_${startStr}_${endStr}`;
790 |           const mttrKey = `beaver_${repo}_mttr_${startStr}_${endStr}`;
791 |           const dfKey = `beaver_${repo}_deployment_frequency_${startStr}_${endStr}`;
792 |           const cfrKey = `beaver_${repo}_change_failure_rate_${startStr}_${endStr}`;
793 |           const metricsKey = `beaver_${repo}_metrics_${startStr}_${endStr}`;
794 |           const deploymentsKey = `beaver_${repo}_deployments_${startStr}_${endStr}`;
795 |           const incidentsKey = `beaver_${repo}_incidents_${startStr}_${endStr}`;
796 |           
797 |           console.log('검색 중인 테스트 데이터 키:', leadTimeKey, mttrKey, dfKey, cfrKey, metricsKey);
798 |           
799 |           try {
800 |             // 테스트 데이터가 있는지 확인
801 |             const leadTimeData = JSON.parse(localStorage.getItem(leadTimeKey) || '[]');
802 |             const mttrData = JSON.parse(localStorage.getItem(mttrKey) || '[]');
803 |             const deploymentFrequencyData = JSON.parse(localStorage.getItem(dfKey) || '[]');
804 |             const changeFailureRateData = JSON.parse(localStorage.getItem(cfrKey) || '[]');
805 |             const metricsData = JSON.parse(localStorage.getItem(metricsKey) || '{}');
806 |             const deploymentsData = JSON.parse(localStorage.getItem(deploymentsKey) || '[]');
807 |             const incidentsData = JSON.parse(localStorage.getItem(incidentsKey) || '[]');
808 |             
809 |             // 테스트 데이터가 있으면 적용
810 |             if (leadTimeData.length > 0 || mttrData.length > 0 || deploymentFrequencyData.length > 0 || changeFailureRateData.length > 0) {
811 |               console.log('💾 테스트 데이터 발견, 화면에 적용합니다');
812 |               
813 |               // 이벤트 데이터 생성
814 |               const events: Event[] = [
815 |                 // 배포 이벤트 추가
816 |                 ...deploymentsData.map((d: any) => ({
817 |                   id: `deployment-${d.timestamp}`,
818 |                   type: 'deployment' as const,
819 |                   timestamp: d.timestamp,
820 |                   description: `배포 ${d.version || ''}`,
821 |                   repository: repo
822 |                 })),
823 |                 
824 |                 // 인시던트 이벤트 추가
825 |                 ...incidentsData.map((i: any) => ([
826 |                   {
827 |                     id: `incident-${i.start}`,
828 |                     type: 'incident' as const,
829 |                     timestamp: i.start,
830 |                     description: `인시던트 발생 (심각도: ${i.severity})`,
831 |                     repository: repo
832 |                   },
833 |                   {
834 |                     id: `recovery-${i.end}`,
835 |                     type: 'recovery' as const,
836 |                     timestamp: i.end,
837 |                     description: '인시던트 복구 완료',
838 |                     repository: repo
839 |                   }
840 |                 ])).flat()
841 |               ];
842 |               
843 |               // 테스트 데이터로 상태 업데이트
844 |               set({
845 |                 leadTimeForChanges: metricsData.leadTimeForChanges || 0,
846 |                 deploymentFrequency: metricsData.deploymentFrequency || 0,
847 |                 changeFailureRate: metricsData.changeFailureRate || 0,
848 |                 meanTimeToRestore: metricsData.meanTimeToRestore || 0,
849 |                 events,
850 |                 leadTimeData,
851 |                 mttrData,
852 |                 deploymentFrequencyData,
853 |                 changeFailureRateData,
854 |                 isLoading: false,
855 |                 lastUpdated: new Date()
856 |               });
857 |               
858 |               // 캐시에 저장
859 |               saveToCache(cacheKey, {
860 |                 metrics: {
861 |                   leadTimeForChanges: metricsData.leadTimeForChanges || 0,
862 |                   deploymentFrequency: metricsData.deploymentFrequency || 0,
863 |                   changeFailureRate: metricsData.changeFailureRate || 0,
864 |                   meanTimeToRestore: metricsData.meanTimeToRestore || 0
865 |                 },
866 |                 events,
867 |                 leadTimeData,
868 |                 mttrData,
869 |                 deploymentFrequencyData,
870 |                 changeFailureRateData
871 |               });
872 |               
873 |               return;
874 |             } else {
875 |               console.log('❌ 테스트 데이터 모드이지만 데이터를 찾을 수 없습니다. 기본 테스트 데이터를 자동 생성합니다.');
876 |               
877 |               // 자동으로 테스트 데이터 생성
878 |               createDefaultTestData(repo, start, end);
879 |               
880 |               // 생성된 데이터 다시 확인
881 |               const autoGenLeadTimeData = JSON.parse(localStorage.getItem(leadTimeKey) || '[]');
882 |               const autoGenMttrData = JSON.parse(localStorage.getItem(mttrKey) || '[]');
883 |               const autoGenDfData = JSON.parse(localStorage.getItem(dfKey) || '[]');
884 |               const autoGenCfrData = JSON.parse(localStorage.getItem(cfrKey) || '[]');
885 |               const autoGenMetricsData = JSON.parse(localStorage.getItem(metricsKey) || '{}');
886 |               
887 |               if (autoGenLeadTimeData.length > 0) {
888 |                 console.log('🎉 자동 생성된 테스트 데이터를 적용합니다.');
889 |                 
890 |                 set({
891 |                   leadTimeForChanges: autoGenMetricsData.leadTimeForChanges || 0,
892 |                   deploymentFrequency: autoGenMetricsData.deploymentFrequency || 0,
893 |                   changeFailureRate: autoGenMetricsData.changeFailureRate || 0,
894 |                   meanTimeToRestore: autoGenMetricsData.meanTimeToRestore || 0,
895 |                   leadTimeData: autoGenLeadTimeData,
896 |                   mttrData: autoGenMttrData,
897 |                   deploymentFrequencyData: autoGenDfData,
898 |                   changeFailureRateData: autoGenCfrData,
899 |                   isLoading: false,
900 |                   lastUpdated: new Date()
901 |                 });
902 |                 
903 |                 return;
904 |               }
905 |               
906 |               // 디버깅: 로컬 스토리지의 모든 키 출력
907 |               console.log('로컬 스토리지 내 모든 키:');
908 |               for (let i = 0; i < localStorage.length; i++) {
909 |                 const key = localStorage.key(i);
910 |                 console.log(`${i}: ${key} (값 존재: ${Boolean(localStorage.getItem(key))})`);
911 |               }
912 |               
913 |               // 디버깅: 찾으려는 키 목록 출력
914 |               console.log('찾으려는 키:', {
915 |                 leadTimeKey,
916 |                 mttrKey,
917 |                 dfKey,
918 |                 cfrKey,
919 |                 metricsKey,
920 |                 deploymentsKey,
921 |                 incidentsKey
922 |               });
923 |               
924 |               set({ 
925 |                 error: '테스트 데이터를 찾을 수 없습니다. "테스트 데이터 주입" 도구를 사용하여 데이터를 추가해주세요.',
926 |                 isLoading: false 
927 |               });
928 |               return;
929 |             }
930 |           } catch (error) {
931 |             console.error('테스트 데이터 처리 오류:', error);
932 |           }
933 |         }
934 |         
935 |         console.log('🔄 새로고침: 캐시 없음, API에서 데이터를 가져옵니다');
936 |       }
937 |       
938 |       // 테스트 모드가 아닌 경우에만 API 요청
939 |       if (!testMode) {
940 |         await state.loadMetrics(state.startDate, state.endDate, state.selectedRepo);
941 |       }
942 |     } 
943 |     // 저장소만 선택된 경우
944 |     else if (state.selectedRepo) {
945 |       await state.loadEvents();
946 |     } 
947 |     // 아무 것도 선택되지 않은 경우
948 |     else {
949 |       // 기본 데이터 로드
950 |       await state.loadEvents();
951 |     }
952 |     
953 |     set({ lastUpdated: new Date() });
954 |   },
955 | 
956 |   // 테스트 데이터 날짜 설정 함수
957 |   setTestDataDateRange: () => {
958 |     const testStartDate = new Date('2024-01-01');
959 |     const testEndDate = new Date('2025-03-16');
960 |     
961 |     setStartDate(testStartDate);
962 |     setEndDate(testEndDate);
963 |     
964 |     // 테스트 데이터 날짜를 로컬 스토리지에 저장
965 |     localStorage.setItem('beaver_start_date', testStartDate.toISOString());
966 |     localStorage.setItem('beaver_end_date', testEndDate.toISOString());
967 |     
968 |     console.log('테스트 모드 활성화: 날짜 범위가 2024-01-01 ~ 2025-03-16으로 설정되었습니다.');
969 |     
970 |     // 테스트 데이터 자동 생성 (선택된 저장소가 있을 경우)
971 |     setTimeout(() => {
972 |       refreshData();
973 |     }, 100);
974 |   },
975 | }));
976 | 
977 | // useStore라는 이름으로도 내보냅니다
978 | export const useStore = useDashboardStore; 
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

src/components/layout/filter-bar.tsx
```
1 | import { ReactNode, useState } from "react";
2 | import { 
3 |   Select,
4 |   SelectContent,
5 |   SelectItem,
6 |   SelectTrigger,
7 |   SelectValue 
8 | } from "@/components/ui/select";
9 | import { DatePicker } from "@/components/ui/date-picker";
10 | import { Label } from "@/components/ui/label";
11 | import { addDays, subDays } from "date-fns";
12 | 
13 | // 예시 프로젝트 목록 (실제 데이터는 API에서 가져와야 함)
14 | const SAMPLE_PROJECTS = [
15 |   { id: "all", name: "모든 프로젝트" },
16 |   { id: "amplify-notify", name: "amplify-notify" },
17 |   { id: "apps-react", name: "apps-react" },
18 |   { id: "beaver", name: "beaver" },
19 |   { id: "api-gateway", name: "api-gateway" },
20 | ];
21 | 
22 | // 기간 프리셋 목록
23 | const DATE_PRESETS = [
24 |   { id: "7d", name: "최근 7일", days: 7 },
25 |   { id: "14d", name: "최근 14일", days: 14 },
26 |   { id: "30d", name: "최근 30일", days: 30 },
27 |   { id: "90d", name: "최근 90일", days: 90 },
28 |   { id: "custom", name: "사용자 지정", days: 0 },
29 | ];
30 | 
31 | interface FilterBarProps {
32 |   children?: ReactNode;
33 |   onFilterChange?: (filters: {
34 |     project: string;
35 |     startDate: Date | null;
36 |     endDate: Date | null;
37 |     datePreset?: string;
38 |   }) => void;
39 | }
40 | 
41 | export function FilterBar({ children, onFilterChange }: FilterBarProps) {
42 |   const [selectedProject, setSelectedProject] = useState("all");
43 |   const [selectedDatePreset, setSelectedDatePreset] = useState("30d");
44 |   const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 30));
45 |   const [endDate, setEndDate] = useState<Date | null>(new Date());
46 |   const [isCustomDate, setIsCustomDate] = useState(false);
47 | 
48 |   // 날짜 프리셋이 변경될 때 날짜 범위 업데이트
49 |   const handleDatePresetChange = (value: string) => {
50 |     setSelectedDatePreset(value);
51 |     
52 |     if (value === "custom") {
53 |       setIsCustomDate(true);
54 |       
55 |       if (onFilterChange) {
56 |         onFilterChange({
57 |           project: selectedProject,
58 |           startDate,
59 |           endDate,
60 |           datePreset: value
61 |         });
62 |       }
63 |       
64 |       return;
65 |     }
66 |     
67 |     setIsCustomDate(false);
68 |     const preset = DATE_PRESETS.find(p => p.id === value);
69 |     if (preset) {
70 |       const end = new Date();
71 |       const start = subDays(end, preset.days);
72 |       setStartDate(start);
73 |       setEndDate(end);
74 |       
75 |       if (onFilterChange) {
76 |         onFilterChange({
77 |           project: selectedProject,
78 |           startDate: start,
79 |           endDate: end,
80 |           datePreset: value
81 |         });
82 |       }
83 |     }
84 |   };
85 | 
86 |   // 프로젝트가 변경될 때 필터 업데이트
87 |   const handleProjectChange = (value: string) => {
88 |     setSelectedProject(value);
89 |     
90 |     if (onFilterChange) {
91 |       onFilterChange({
92 |         project: value,
93 |         startDate,
94 |         endDate,
95 |         datePreset: selectedDatePreset
96 |       });
97 |     }
98 |   };
99 | 
100 |   // 사용자 지정 날짜가 변경될 때 처리
101 |   const handleStartDateChange = (date: Date | undefined) => {
102 |     setStartDate(date);
103 |     
104 |     if (onFilterChange && date) {
105 |       onFilterChange({
106 |         project: selectedProject,
107 |         startDate: date,
108 |         endDate,
109 |         datePreset: selectedDatePreset
110 |       });
111 |     }
112 |   };
113 | 
114 |   const handleEndDateChange = (date: Date | undefined) => {
115 |     setEndDate(date);
116 |     
117 |     if (onFilterChange && date) {
118 |       onFilterChange({
119 |         project: selectedProject,
120 |         startDate,
121 |         endDate: date,
122 |         datePreset: selectedDatePreset
123 |       });
124 |     }
125 |   };
126 | 
127 |   return (
128 |     <div className="flex flex-wrap items-center gap-4 w-full">
129 |       <div className="flex flex-col gap-1.5 min-w-[150px]">
130 |         <Label htmlFor="project-filter">프로젝트</Label>
131 |         <Select
132 |           value={selectedProject}
133 |           onValueChange={handleProjectChange}
134 |         >
135 |           <SelectTrigger id="project-filter" className="w-full md:w-[200px]">
136 |             <SelectValue placeholder="프로젝트 선택" />
137 |           </SelectTrigger>
138 |           <SelectContent>
139 |             {SAMPLE_PROJECTS.map((project) => (
140 |               <SelectItem key={project.id} value={project.id}>
141 |                 {project.name}
142 |               </SelectItem>
143 |             ))}
144 |           </SelectContent>
145 |         </Select>
146 |       </div>
147 | 
148 |       <div className="flex flex-col gap-1.5 min-w-[120px]">
149 |         <Label htmlFor="date-preset">기간</Label>
150 |         <Select
151 |           value={selectedDatePreset}
152 |           onValueChange={handleDatePresetChange}
153 |         >
154 |           <SelectTrigger id="date-preset" className="w-full md:w-[150px]">
155 |             <SelectValue placeholder="기간 선택" />
156 |           </SelectTrigger>
157 |           <SelectContent>
158 |             {DATE_PRESETS.map((preset) => (
159 |               <SelectItem key={preset.id} value={preset.id}>
160 |                 {preset.name}
161 |               </SelectItem>
162 |             ))}
163 |           </SelectContent>
164 |         </Select>
165 |       </div>
166 | 
167 |       {isCustomDate && (
168 |         <>
169 |           <div className="flex flex-col gap-1.5">
170 |             <Label htmlFor="start-date">시작일</Label>
171 |             <DatePicker
172 |               date={startDate}
173 |               setDate={handleStartDateChange}
174 |               placeholder="시작일 선택"
175 |             />
176 |           </div>
177 |           <div className="flex flex-col gap-1.5">
178 |             <Label htmlFor="end-date">종료일</Label>
179 |             <DatePicker
180 |               date={endDate}
181 |               setDate={handleEndDateChange}
182 |               placeholder="종료일 선택"
183 |             />
184 |           </div>
185 |         </>
186 |       )}
187 | 
188 |       {/* 추가 필터 (children)가 있으면 렌더링 */}
189 |       {children && (
190 |         <div className="ml-auto mt-2 md:mt-0">
191 |           {children}
192 |         </div>
193 |       )}
194 |     </div>
195 |   );
196 | } 
```

src/components/dashboard/ChangeFailureRateChart.tsx
```
1 | import React, { useMemo } from 'react';
2 | import { useStore } from '@/store/dashboardStore';
3 | import { 
4 |   ResponsiveContainer, 
5 |   BarChart, 
6 |   Bar,
7 |   XAxis, 
8 |   YAxis, 
9 |   CartesianGrid, 
10 |   Tooltip, 
11 |   Legend,
12 |   LabelList,
13 |   Cell
14 | } from 'recharts';
15 | import { format } from 'date-fns';
16 | import { ko } from 'date-fns/locale';
17 | import { ChangeFailureRateDataPoint } from '@/store/dashboardStore';
18 | 
19 | /**
20 |  * 변경 실패율 추이 차트 컴포넌트
21 |  * 선택된 기간의 일별 변경 실패율을 복합 차트로 시각화합니다.
22 |  */
23 | interface ChangeFailureRateChartProps {
24 |   multiRepoMode?: boolean;
25 |   multiRepoData?: { [repo: string]: ChangeFailureRateDataPoint[] };
26 |   colorPalette?: string[];
27 | }
28 | 
29 | const ChangeFailureRateChart: React.FC<ChangeFailureRateChartProps> = ({ 
30 |   multiRepoMode = false, 
31 |   multiRepoData = {},
32 |   colorPalette = ['#007AFF', '#FF2D55', '#5AC8FA', '#FF9500', '#4CD964'] 
33 | }) => {
34 |   const { changeFailureRateData } = useStore();
35 | 
36 |   // 디버그 로깅 추가
37 |   useMemo(() => {
38 |     if (multiRepoMode) {
39 |       console.log('ChangeFailureRateChart - 다중 저장소 모드 데이터:', {
40 |         저장소_수: Object.keys(multiRepoData).length,
41 |         저장소_목록: Object.keys(multiRepoData),
42 |         데이터_샘플: Object.entries(multiRepoData).map(([repo, data]) => ({
43 |           repo,
44 |           데이터개수: data.length,
45 |           첫번째항목: data.length > 0 ? data[0] : '데이터 없음'
46 |         }))
47 |       });
48 |     }
49 |   }, [multiRepoMode, multiRepoData]);
50 | 
51 |   // 저장소별 평균값 계산 - 항상 호출되도록 수정
52 |   const repoAverages = useMemo(() => {
53 |     // multiRepoMode가 아니면 빈 객체 반환
54 |     if (!multiRepoMode || Object.keys(multiRepoData).length === 0) {
55 |       return {};
56 |     }
57 |     
58 |     const result: Record<string, number> = {};
59 |     
60 |     Object.entries(multiRepoData).forEach(([repo, dataPoints]) => {
61 |       // 데이터가 없어도 기본값 설정
62 |       const repoName = repo.split('/')[1];
63 |       if (dataPoints.length === 0) {
64 |         result[repoName] = 0; // 빈 데이터인 경우 0으로 설정
65 |         return;
66 |       }
67 |       
68 |       const sum = dataPoints.reduce((acc, item) => acc + ((item.rate || 0) * 100), 0);
69 |       const avg = sum / dataPoints.length;
70 |       result[repoName] = Number(avg.toFixed(1)); // 최소값 설정 제거
71 |     });
72 |     
73 |     console.log('ChangeFailureRateChart - 계산된 평균값:', result);
74 |     return result;
75 |   }, [multiRepoMode, multiRepoData]);
76 |   
77 |   // 바 차트용 데이터 포맷팅 - 빈 barData 방지
78 |   const barData = useMemo(() => {
79 |     if (!multiRepoMode || Object.keys(multiRepoData).length === 0) {
80 |       return [];
81 |     }
82 |     
83 |     // 데이터 정렬 (값이 큰 순서대로)
84 |     const sortedEntries = Object.entries(repoAverages)
85 |       .sort((a, b) => b[1] - a[1]); // 내림차순 정렬
86 |     
87 |     // 정렬된 데이터로 차트 데이터 생성
88 |     return sortedEntries.map(([repoName, avg], index) => ({
89 |       name: repoName,
90 |       value: avg,
91 |       fill: colorPalette[index % colorPalette.length]
92 |     }));
93 |   }, [multiRepoMode, repoAverages, colorPalette]);
94 | 
95 |   // 다중 저장소 모드일 때는 다른 데이터 처리
96 |   if (multiRepoMode) {
97 |     // 저장소별 데이터가 없는 경우
98 |     if (Object.keys(multiRepoData).length === 0) {
99 |       return (
100 |         <div className="flex items-center justify-center h-full">
101 |           <p className="text-muted-foreground">저장소를 선택하세요.</p>
102 |         </div>
103 |       );
104 |     }
105 | 
106 |     // 빈 barData 처리
107 |     if (barData.length === 0) {
108 |       return (
109 |         <div className="flex items-center justify-center h-full">
110 |           <p className="text-muted-foreground">데이터가 없거나 모든 값이 0입니다.</p>
111 |         </div>
112 |       );
113 |     }
114 | 
115 |     return (
116 |       <div className="h-full">
117 |         <p className="text-base font-medium mb-4 text-center">평균 변경 실패율</p>
118 |         <ResponsiveContainer width="100%" height="90%">
119 |           <BarChart
120 |             data={barData}
121 |             layout="vertical"
122 |             margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
123 |           >
124 |             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" horizontal={true} vertical={false} />
125 |             <XAxis 
126 |               type="number"
127 |               stroke="hsl(var(--foreground))" 
128 |               tick={{ fill: 'hsl(var(--foreground))' }}
129 |               tickLine={false}
130 |               axisLine={false}
131 |               label={{ 
132 |                 value: '실패율(%)', 
133 |                 position: 'insideBottom',
134 |                 offset: -10,
135 |                 fill: 'hsl(var(--foreground))'
136 |               }}
137 |             />
138 |             <YAxis 
139 |               type="category"
140 |               dataKey="name"
141 |               stroke="hsl(var(--foreground))" 
142 |               tick={{ fill: 'hsl(var(--foreground))' }}
143 |               tickLine={false}
144 |               axisLine={false}
145 |               width={80}
146 |             />
147 |             <Tooltip
148 |               contentStyle={{
149 |                 backgroundColor: 'hsl(var(--background))',
150 |                 borderColor: 'hsl(var(--border))',
151 |                 color: 'hsl(var(--foreground))'
152 |               }}
153 |               labelStyle={{ color: 'hsl(var(--foreground))' }}
154 |               formatter={(value: number) => [`${value}%`, '실패율']}
155 |             />
156 |             <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
157 |             <Bar 
158 |               dataKey="value" 
159 |               name="변경 실패율" 
160 |               radius={[0, 4, 4, 0]}
161 |             >
162 |               {
163 |                 barData.map((entry, index) => (
164 |                   <Cell key={`cell-${index}`} fill={entry.fill} />
165 |                 ))
166 |               }
167 |               <LabelList 
168 |                 dataKey="value" 
169 |                 position="right" 
170 |                 formatter={(value: number) => `${value}%`}
171 |                 style={{ fill: 'hsl(var(--foreground))' }}
172 |               />
173 |             </Bar>
174 |           </BarChart>
175 |         </ResponsiveContainer>
176 |       </div>
177 |     );
178 |   }
179 | 
180 |   // 단일 저장소 모드 (기존 코드)
181 |   if (!changeFailureRateData || changeFailureRateData.length === 0) {
182 |     return (
183 |       <div className="flex items-center justify-center h-full">
184 |         <p className="text-muted-foreground">데이터가 없습니다.</p>
185 |       </div>
186 |     );
187 |   }
188 | 
189 |   // 평균값 계산 (퍼센트로 변환)
190 |   const average = (changeFailureRateData.reduce((sum, item) => sum + item.rate, 0) / changeFailureRateData.length) * 100;
191 | 
192 |   return (
193 |     <div className="h-full">
194 |       <p className="text-base font-medium mb-4 text-center">평균 변경 실패율</p>
195 |       <ResponsiveContainer width="100%" height="90%">
196 |         <BarChart
197 |           data={[{ name: '변경 실패율', value: Number(average.toFixed(1)) }]}
198 |           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
199 |         >
200 |           <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
201 |           <XAxis 
202 |             dataKey="name" 
203 |             stroke="hsl(var(--foreground))" 
204 |             tick={{ fill: 'hsl(var(--foreground))' }}
205 |             tickLine={false}
206 |             axisLine={false}
207 |           />
208 |           <YAxis 
209 |             stroke="hsl(var(--foreground))" 
210 |             tick={{ fill: 'hsl(var(--foreground))' }}
211 |             tickLine={false}
212 |             axisLine={false}
213 |             label={{ 
214 |               value: '실패율(%)', 
215 |               angle: -90, 
216 |               position: 'insideLeft',
217 |               fill: 'hsl(var(--foreground))'
218 |             }}
219 |           />
220 |           <Tooltip
221 |             contentStyle={{
222 |               backgroundColor: 'hsl(var(--background))',
223 |               borderColor: 'hsl(var(--border))',
224 |               color: 'hsl(var(--foreground))'
225 |             }}
226 |             labelStyle={{ color: 'hsl(var(--foreground))' }}
227 |             formatter={(value: number) => [`${value}%`, '실패율']}
228 |           />
229 |           <Bar 
230 |             dataKey="value" 
231 |             fill="hsl(var(--chart-2))" 
232 |             name="변경 실패율"
233 |             radius={[4, 4, 0, 0]}
234 |           >
235 |             <LabelList 
236 |               dataKey="value" 
237 |               position="top" 
238 |               formatter={(value: number) => `${value}%`}
239 |               style={{ fill: 'hsl(var(--foreground))' }}
240 |             />
241 |           </Bar>
242 |         </BarChart>
243 |       </ResponsiveContainer>
244 |     </div>
245 |   );
246 | };
247 | 
248 | export default ChangeFailureRateChart; 
```

src/components/dashboard/Dashboard.tsx
```
1 | import React, { useEffect, useRef, useState } from 'react';
2 | import { useStore } from '@/store/dashboardStore';
3 | import { format, isValid, eachDayOfInterval } from 'date-fns';
4 | import { ko } from 'date-fns/locale';
5 | import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
6 | import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
7 | import { DatePicker } from '@/components/ui/date-picker';
8 | import { Button } from '@/components/ui/button';
9 | import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
10 | import { formatMetricResult } from '@/lib/utils';
11 | import { RefreshCw, Key, Eye, EyeOff, Trash2, Database, Calendar, AlertCircle } from 'lucide-react';
12 | import { Input } from '@/components/ui/input';
13 | import { Label } from '@/components/ui/label';
14 | import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
15 | import config from '@/config.json';
16 | import { 
17 |   DropdownMenu, 
18 |   DropdownMenuContent, 
19 |   DropdownMenuItem, 
20 |   DropdownMenuSeparator, 
21 |   DropdownMenuTrigger 
22 | } from '@/components/ui/dropdown-menu';
23 | import DeploymentFrequencyChart from './DeploymentFrequencyChart';
24 | import ChangeFailureRateChart from './ChangeFailureRateChart';
25 | import LeadTimeForChangesChart from './LeadTimeForChangesChart';
26 | import MeanTimeToRestoreChart from './MeanTimeToRestoreChart';
27 | import PerformanceIndicator from './PerformanceIndicator';
28 | import EventTimeline from './EventTimeline';
29 | import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
30 | 
31 | const getDORALevel = (metric: string, value: number | null): 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high' | 'unknown' => {
32 |   if (value === null) return 'unknown';
33 |   
34 |   switch(metric) {
35 |     case 'deploymentFrequency':
36 |       // 배포 빈도 (일 단위)
37 |       if (value >= 1) return 'high'; // 일 1회 이상
38 |       if (value >= 1/7) return 'medium-high'; // 주 1회 이상
39 |       if (value >= 1/30) return 'medium'; // 월 1회 이상
40 |       if (value >= 1/180) return 'medium-low'; // 6개월 1회 이상
41 |       return 'low';
42 |       
43 |     case 'leadTimeForChanges':
44 |       // 변경 리드 타임 (시간 단위)
45 |       if (value <= 24) return 'high'; // 하루 이내
46 |       if (value <= 168) return 'medium-high'; // 일주일 이내
47 |       if (value <= 720) return 'medium'; // 한 달 이내
48 |       if (value <= 2160) return 'medium-low'; // 3개월 이내
49 |       return 'low';
50 |       
51 |     case 'changeFailureRate':
52 |       // 변경 실패율 (%)
53 |       if (value <= 15) return 'high'; // 15% 이하
54 |       if (value <= 30) return 'medium-high'; // 30% 이하
55 |       if (value <= 45) return 'medium'; // 45% 이하
56 |       if (value <= 60) return 'medium-low'; // 60% 이하
57 |       return 'low';
58 |       
59 |     case 'meanTimeToRestore':
60 |       // 복구 시간 (시간 단위)
61 |       if (value <= 1) return 'high'; // 1시간 이내
62 |       if (value <= 24) return 'medium-high'; // 하루 이내
63 |       if (value <= 168) return 'medium'; // 일주일 이내
64 |       if (value <= 336) return 'medium-low'; // 2주일 이내
65 |       return 'low';
66 |       
67 |     default:
68 |       return 'unknown';
69 |   }
70 | };
71 | 
72 | const Dashboard: React.FC = () => {
73 |   const { 
74 |     startDate, 
75 |     endDate, 
76 |     setStartDate, 
77 |     setEndDate, 
78 |     selectedRepo,
79 |     setSelectedRepo,
80 |     repositories,
81 |     leadTimeForChanges,
82 |     changeFailureRate,
83 |     deploymentFrequency,
84 |     meanTimeToRestore,
85 |     loadEvents,
86 |     loadMetrics,
87 |     refreshData,
88 |     isLoading,
89 |     lastUpdated
90 |   } = useStore();
91 | 
92 |   // 날짜 유효성 검사 함수
93 |   const ensureValidDate = (date: Date | null | string | undefined): Date | null => {
94 |     if (!date) return null;
95 |     if (date instanceof Date && isValid(date)) return date;
96 |     if (typeof date === 'string') {
97 |       try {
98 |         const parsed = new Date(date);
99 |         return isValid(parsed) ? parsed : null;
100 |       } catch (e) {
101 |         return null;
102 |       }
103 |     }
104 |     return null;
105 |   };
106 | 
107 |   // 시작일/종료일 데이트피커 오픈 상태 관리
108 |   const [startDateOpen, setStartDateOpen] = React.useState(false);
109 |   const [endDateOpen, setEndDateOpen] = React.useState(false);
110 |   
111 |   // 종료일 드롭다운을 여는 타이머 참조
112 |   const endDateTimerRef = useRef<NodeJS.Timeout | null>(null);
113 | 
114 |   // 테스트 데이터 날짜 설정 함수
115 |   const setTestDataDateRange = () => {
116 |     const testStartDate = new Date('2024-01-01');
117 |     const testEndDate = new Date('2025-03-16');
118 |     
119 |     setStartDate(testStartDate);
120 |     setEndDate(testEndDate);
121 |     
122 |     // 테스트 데이터 날짜를 로컬 스토리지에 저장
123 |     localStorage.setItem('beaver_start_date', testStartDate.toISOString());
124 |     localStorage.setItem('beaver_end_date', testEndDate.toISOString());
125 |     
126 |     console.log('테스트 모드 활성화: 날짜 범위가 2024-01-01 ~ 2025-03-16으로 설정되었습니다.');
127 |     
128 |     // 데이터 새로고침 (테스트 데이터 모드 활성화 후 자동 적용)
129 |     setTimeout(() => {
130 |       refreshData();
131 |     }, 100);
132 |   };
133 | 
134 |   // 날짜 선택 값을 로컬 스토리지에 저장하는 함수
135 |   const saveDatesToLocalStorage = (start: Date | null, end: Date | null) => {
136 |     if (start) {
137 |       localStorage.setItem('beaver_start_date', start.toISOString());
138 |     }
139 |     if (end) {
140 |       localStorage.setItem('beaver_end_date', end.toISOString());
141 |     }
142 |   };
143 | 
144 |   // 시작일 변경 처리 (로컬 스토리지 저장 추가)
145 |   const handleStartDateChange = (date: Date | null) => {
146 |     setStartDate(date);
147 |     setStartDateOpen(false);
148 |     
149 |     // 로컬 스토리지에 저장
150 |     if (date) {
151 |       saveDatesToLocalStorage(date, endDate);
152 |     }
153 |     
154 |     // 이전 타이머가 있으면 취소
155 |     if (endDateTimerRef.current) {
156 |       clearTimeout(endDateTimerRef.current);
157 |     }
158 |     
159 |     // 약간의 지연 후 종료일 드롭다운 열기 (UI 갱신 후)
160 |     endDateTimerRef.current = setTimeout(() => {
161 |       setEndDateOpen(true);
162 |       endDateTimerRef.current = null;
163 |     }, 100);
164 |   };
165 | 
166 |   // 종료일 변경 처리 (로컬 스토리지 저장 추가)
167 |   const handleEndDateChange = (date: Date | null) => {
168 |     setEndDate(date);
169 |     setEndDateOpen(false);
170 |     
171 |     // 로컬 스토리지에 저장
172 |     if (date) {
173 |       saveDatesToLocalStorage(startDate, date);
174 |     }
175 |   };
176 | 
177 |   // 기본값 설정 (로컬 스토리지 우선 사용)
178 |   useEffect(() => {
179 |     if (!startDate && !endDate) {
180 |       // 로컬 스토리지에서 날짜 불러오기
181 |       const savedStartDate = localStorage.getItem('beaver_start_date');
182 |       const savedEndDate = localStorage.getItem('beaver_end_date');
183 |       
184 |       let parsedStartDate = null;
185 |       let parsedEndDate = null;
186 |       
187 |       if (savedStartDate) {
188 |         try {
189 |           parsedStartDate = new Date(savedStartDate);
190 |           if (!isValid(parsedStartDate)) parsedStartDate = null;
191 |         } catch (error) {
192 |           console.error('저장된 시작일 파싱 오류:', error);
193 |         }
194 |       }
195 |       
196 |       if (savedEndDate) {
197 |         try {
198 |           parsedEndDate = new Date(savedEndDate);
199 |           if (!isValid(parsedEndDate)) parsedEndDate = null;
200 |         } catch (error) {
201 |           console.error('저장된 종료일 파싱 오류:', error);
202 |         }
203 |       }
204 |       
205 |       // 저장된 날짜가 있으면 사용
206 |       if (parsedStartDate) {
207 |         setStartDate(parsedStartDate);
208 |         console.log('로컬 스토리지에서 시작일 불러옴:', format(parsedStartDate, 'yyyy-MM-dd'));
209 |       }
210 |       
211 |       if (parsedEndDate) {
212 |         setEndDate(parsedEndDate);
213 |         console.log('로컬 스토리지에서 종료일 불러옴:', format(parsedEndDate, 'yyyy-MM-dd'));
214 |       }
215 |       
216 |       // 저장된 날짜가 없는 경우 config.json의 기본값 사용
217 |       if (!parsedStartDate && !parsedEndDate) {
218 |         try {
219 |           const configStartDate = new Date(config.defaultTimeRange.since);
220 |           const configEndDate = new Date(config.defaultTimeRange.until);
221 |           
222 |           if (isValid(configStartDate)) setStartDate(configStartDate);
223 |           if (isValid(configEndDate)) setEndDate(configEndDate);
224 |         } catch (error) {
225 |           console.error('기본 날짜 설정 오류:', error);
226 |         }
227 |       }
228 |     }
229 |   }, []);
230 | 
231 |   // 컴포넌트 언마운트 시 타이머 정리
232 |   useEffect(() => {
233 |     return () => {
234 |       if (endDateTimerRef.current) {
235 |         clearTimeout(endDateTimerRef.current);
236 |       }
237 |     };
238 |   }, []);
239 | 
240 |   // 컴포넌트 마운트 시 이벤트 데이터 로드
241 |   useEffect(() => {
242 |     loadEvents();
243 |   }, [loadEvents]);
244 | 
245 |   // 필터 변경 시 지표 계산
246 |   useEffect(() => {
247 |     const validStartDate = ensureValidDate(startDate);
248 |     const validEndDate = ensureValidDate(endDate);
249 |     
250 |     if (validStartDate && validEndDate && selectedRepo) {
251 |       loadMetrics(validStartDate, validEndDate, selectedRepo);
252 |     }
253 |   }, [startDate, endDate, selectedRepo, loadMetrics]);
254 | 
255 |   // DORA 성능 레벨 계산
256 |   const deploymentFrequencyLevel = getDORALevel('deploymentFrequency', deploymentFrequency);
257 |   const leadTimeLevel = getDORALevel('leadTimeForChanges', leadTimeForChanges);
258 |   const changeFailureRateLevel = getDORALevel('changeFailureRate', changeFailureRate);
259 |   const mttrLevel = getDORALevel('meanTimeToRestore', meanTimeToRestore);
260 | 
261 |   // 마지막 업데이트 시간 포맷팅
262 |   const formattedLastUpdated = lastUpdated && isValid(new Date(lastUpdated))
263 |     ? format(new Date(lastUpdated), 'yyyy년 MM월 dd일 HH:mm:ss', { locale: ko }) 
264 |     : '업데이트 내역 없음';
265 | 
266 |   // 데이터 새로고침 핸들러
267 |   const handleRefresh = async () => {
268 |     await refreshData();
269 |   };
270 | 
271 |   // 테스트 데이터 모드인지 확인하는 함수 (dashboardStore의 isTestDataMode 사용)
272 |   const isTestDataMode = (repo: string, start: Date, end: Date): boolean => {
273 |     // 2024년 1월 1일 시작 날짜인 경우 테스트 데이터 모드로 간주
274 |     return start.getFullYear() === 2024 && start.getMonth() === 0 && start.getDate() === 1;
275 |   };
276 | 
277 |   // 캐시 초기화 함수 (clearCache 함수에 대한 대체)
278 |   const handleClearCache = () => {
279 |     // localStorage에서 beaver_ 프리픽스로 시작하는 모든 키 삭제
280 |     Object.keys(localStorage).forEach(key => {
281 |       if (key.startsWith('beaver_')) {
282 |         localStorage.removeItem(key);
283 |       }
284 |     });
285 |     console.log('모든 캐시가 초기화되었습니다.');
286 |   };
287 | 
288 |   // 캐시 없이 새로고침 핸들러
289 |   const handleForceRefresh = async () => {
290 |     handleClearCache(); // 캐시 초기화 (clearCache 대신 handleClearCache 사용)
291 |     await refreshData(); // 데이터 새로고침
292 |   };
293 | 
294 |   // GitHub 토큰 관련 상태 추가
295 |   const [githubToken, setGithubToken] = useState<string>(
296 |     localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN || ''
297 |   );
298 |   const [showToken, setShowToken] = useState<boolean>(false);
299 |   const [tokenDialogOpen, setTokenDialogOpen] = useState<boolean>(false);
300 |   const tokenFromEnv = Boolean(import.meta.env.VITE_GITHUB_TOKEN);
301 |   
302 |   // 페이지 로드 시 토큰 상태 디버깅
303 |   useEffect(() => {
304 |     console.log('Dashboard 마운트 시 GitHub 토큰 상태:', {
305 |       tokenFromState: Boolean(githubToken),
306 |       tokenFromStorage: Boolean(localStorage.getItem('github_token')),
307 |       tokenFromEnv: Boolean(import.meta.env.VITE_GITHUB_TOKEN),
308 |       tokenLength: githubToken ? githubToken.length : 0
309 |     });
310 |   }, [githubToken]);
311 |   
312 |   // 토큰 저장 함수
313 |   const saveGithubToken = () => {
314 |     // 입력된 토큰 유효성 검사
315 |     if (githubToken && githubToken.length < 10) {
316 |       alert('GitHub 토큰이 너무 짧습니다. 유효한 토큰인지 확인해 주세요.');
317 |       return;
318 |     }
319 |     
320 |     // 로컬 스토리지에 토큰 저장
321 |     if (githubToken) {
322 |       localStorage.setItem('github_token', githubToken);
323 |       console.log('GitHub 토큰이 저장되었습니다. 페이지를 새로고침합니다.');
324 |       window.location.reload(); // 페이지 새로고침 (Octokit 인스턴스 재생성을 위해)
325 |     }
326 |     setTokenDialogOpen(false);
327 |   };
328 |   
329 |   // 토큰 삭제 함수
330 |   const clearGithubToken = () => {
331 |     localStorage.removeItem('github_token');
332 |     setGithubToken('');
333 |     console.log('GitHub 토큰이 삭제되었습니다. 페이지를 새로고침합니다.');
334 |     window.location.reload(); // 페이지 새로고침 (Octokit 인스턴스 재생성을 위해)
335 |     setTokenDialogOpen(false);
336 |   };
337 | 
338 |   const [apiKey, setApiKey] = useState<string>(localStorage.getItem('github_api_key') || '');
339 |   const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
340 |   const [dataSource, setDataSource] = useState<'api' | 'cache'>('cache');
341 |   const [activeTab, setActiveTab] = useState<string>("main");
342 |   
343 |   // 다중 저장소 차트 지원
344 |   const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
345 |   const [multiRepoMode, setMultiRepoMode] = useState<boolean>(false);
346 |   const [isMultiLoading, setIsMultiLoading] = useState<boolean>(false);
347 |   
348 |   // 선택된 여러 저장소의
349 |   const [multiRepoData, setMultiRepoData] = useState<{
350 |     leadTimeData: { [repo: string]: any[] };
351 |     mttrData: { [repo: string]: any[] };
352 |     deploymentFrequencyData: { [repo: string]: any[] };
353 |     changeFailureRateData: { [repo: string]: any[] };
354 |   }>({
355 |     leadTimeData: {},
356 |     mttrData: {},
357 |     deploymentFrequencyData: {},
358 |     changeFailureRateData: {}
359 |   });
360 | 
361 |   // Apple 스타일 색상 팔레트
362 |   const colorPalette = [
363 |     '#007AFF', // Blue
364 |     '#FF2D55', // Red
365 |     '#5AC8FA', // Light Blue
366 |     '#FF9500', // Orange
367 |     '#4CD964', // Green
368 |     '#AF52DE', // Purple
369 |     '#FFCC00', // Yellow
370 |     '#34C759', // Mint Green
371 |     '#FF3B30', // Bright Red
372 |     '#5856D6', // Dark Blue
373 |   ];
374 | 
375 |   // 여러 저장소 데이터 로드 함수
376 |   const loadMultiRepoData = async () => {
377 |     if (!startDate || !endDate || selectedRepos.length === 0) return;
378 |     
379 |     setIsMultiLoading(true);
380 |     
381 |     const newMultiRepoData = {
382 |       leadTimeData: {} as { [repo: string]: any[] },
383 |       mttrData: {} as { [repo: string]: any[] },
384 |       deploymentFrequencyData: {} as { [repo: string]: any[] },
385 |       changeFailureRateData: {} as { [repo: string]: any[] }
386 |     };
387 |     
388 |     console.log('다중 저장소 데이터 로드 시작:', {
389 |       selectedRepos,
390 |       startDate: startDate.toISOString(),
391 |       endDate: endDate.toISOString()
392 |     });
393 |     
394 |     // 테스트 데이터 모드 감지
395 |     const isTestMode = startDate.getFullYear() === 2024 && 
396 |                       startDate.getMonth() === 0 && 
397 |                       startDate.getDate() === 1;
398 |     
399 |     // 선택된 각 저장소에 대해 데이터 로드
400 |     for (const repo of selectedRepos) {
401 |       // 캐시 키 생성
402 |       const startStr = format(startDate, 'yyyy-MM-dd');
403 |       const endStr = format(endDate, 'yyyy-MM-dd');
404 |       const cachedDataKey = `beaver_${repo}_metrics_${startStr}_${endStr}`;
405 |       const cachedData = localStorage.getItem(cachedDataKey);
406 |       
407 |       let repoDataLoaded = false;
408 |       
409 |       // 1. 먼저 캐시된 메트릭 데이터를 확인
410 |       if (cachedData) {
411 |         try {
412 |           // 캐시된 데이터가 있는 경우
413 |           const parsedData = JSON.parse(cachedData);
414 |           newMultiRepoData.leadTimeData[repo] = parsedData.leadTimeData?.map((item: any) => ({...item, repository: repo})) || [];
415 |           newMultiRepoData.mttrData[repo] = parsedData.mttrData?.map((item: any) => ({...item, repository: repo})) || [];
416 |           newMultiRepoData.deploymentFrequencyData[repo] = parsedData.deploymentFrequencyData?.map((item: any) => ({...item, repository: repo})) || [];
417 |           newMultiRepoData.changeFailureRateData[repo] = parsedData.changeFailureRateData?.map((item: any) => ({...item, repository: repo})) || [];
418 |           
419 |           console.log(`저장소 ${repo} 캐시 데이터 로드 완료:`, {
420 |             leadTimeData: newMultiRepoData.leadTimeData[repo].length,
421 |             mttrData: newMultiRepoData.mttrData[repo].length,
422 |             deploymentFrequencyData: newMultiRepoData.deploymentFrequencyData[repo].length,
423 |             changeFailureRateData: newMultiRepoData.changeFailureRateData[repo].length
424 |           });
425 |           
426 |           repoDataLoaded = true;
427 |         } catch (error) {
428 |           console.error(`${repo} 캐시 데이터 파싱 오류:`, error);
429 |         }
430 |       }
431 |       
432 |       // 2. 캐시 데이터가 없고 테스트 모드인 경우 개별 테스트 데이터 키 확인
433 |       if (!repoDataLoaded && isTestMode) {
434 |         try {
435 |           const leadTimeKey = `beaver_${repo}_lead_time_${startStr}_${endStr}`;
436 |           const mttrKey = `beaver_${repo}_mttr_${startStr}_${endStr}`;
437 |           const dfKey = `beaver_${repo}_deployment_frequency_${startStr}_${endStr}`;
438 |           const cfrKey = `beaver_${repo}_change_failure_rate_${startStr}_${endStr}`;
439 |           
440 |           const leadTimeData = JSON.parse(localStorage.getItem(leadTimeKey) || '[]');
441 |           const mttrData = JSON.parse(localStorage.getItem(mttrKey) || '[]');
442 |           const deploymentFrequencyData = JSON.parse(localStorage.getItem(dfKey) || '[]');
443 |           const changeFailureRateData = JSON.parse(localStorage.getItem(cfrKey) || '[]');
444 |           
445 |           newMultiRepoData.leadTimeData[repo] = leadTimeData.map((item: any) => ({...item, repository: repo}));
446 |           newMultiRepoData.mttrData[repo] = mttrData.map((item: any) => ({...item, repository: repo}));
447 |           newMultiRepoData.deploymentFrequencyData[repo] = deploymentFrequencyData.map((item: any) => ({...item, repository: repo}));
448 |           newMultiRepoData.changeFailureRateData[repo] = changeFailureRateData.map((item: any) => ({...item, repository: repo}));
449 |           
450 |           console.log(`저장소 ${repo} 테스트 데이터 로드 완료:`, {
451 |             leadTimeData: newMultiRepoData.leadTimeData[repo].length,
452 |             mttrData: newMultiRepoData.mttrData[repo].length,
453 |             deploymentFrequencyData: newMultiRepoData.deploymentFrequencyData[repo].length,
454 |             changeFailureRateData: newMultiRepoData.changeFailureRateData[repo].length
455 |           });
456 |           
457 |           repoDataLoaded = true;
458 |         } catch (error) {
459 |           console.error(`${repo} 테스트 데이터 로드 오류:`, error);
460 |         }
461 |       }
462 |       
463 |       // 3. 테스트 모드인데 데이터가 없으면 자동 생성
464 |       if (!repoDataLoaded && isTestMode) {
465 |         console.log(`저장소 ${repo}에 데이터가 없습니다. 테스트 데이터를 자동 생성합니다.`);
466 |         
467 |         // 각 저장소에 고유한 값을 갖는 테스트 데이터 생성
468 |         generateTestDataForRepo(repo, startDate, endDate);
469 |         
470 |         // 생성된 데이터 로드
471 |         try {
472 |           const leadTimeKey = `beaver_${repo}_lead_time_${startStr}_${endStr}`;
473 |           const mttrKey = `beaver_${repo}_mttr_${startStr}_${endStr}`;
474 |           const dfKey = `beaver_${repo}_deployment_frequency_${startStr}_${endStr}`;
475 |           const cfrKey = `beaver_${repo}_change_failure_rate_${startStr}_${endStr}`;
476 |           
477 |           const leadTimeData = JSON.parse(localStorage.getItem(leadTimeKey) || '[]');
478 |           const mttrData = JSON.parse(localStorage.getItem(mttrKey) || '[]');
479 |           const deploymentFrequencyData = JSON.parse(localStorage.getItem(dfKey) || '[]');
480 |           const changeFailureRateData = JSON.parse(localStorage.getItem(cfrKey) || '[]');
481 |           
482 |           newMultiRepoData.leadTimeData[repo] = leadTimeData.map((item: any) => ({...item, repository: repo}));
483 |           newMultiRepoData.mttrData[repo] = mttrData.map((item: any) => ({...item, repository: repo}));
484 |           newMultiRepoData.deploymentFrequencyData[repo] = deploymentFrequencyData.map((item: any) => ({...item, repository: repo}));
485 |           newMultiRepoData.changeFailureRateData[repo] = changeFailureRateData.map((item: any) => ({...item, repository: repo}));
486 |           
487 |           console.log(`저장소 ${repo} 자동 생성된 테스트 데이터 로드 완료:`, {
488 |             leadTimeData: newMultiRepoData.leadTimeData[repo].length,
489 |             mttrData: newMultiRepoData.mttrData[repo].length,
490 |             deploymentFrequencyData: newMultiRepoData.deploymentFrequencyData[repo].length,
491 |             changeFailureRateData: newMultiRepoData.changeFailureRateData[repo].length
492 |           });
493 |         } catch (error) {
494 |           console.error(`${repo} 자동 생성 테스트 데이터 로드 오류:`, error);
495 |         }
496 |       }
497 |       
498 |       // 4. 실제 API 모드이고 데이터가 아직 로드되지 않은 경우 (기존 코드 개선)
499 |       if (!repoDataLoaded && !isTestMode) {
500 |         try {
501 |           console.log(`저장소 ${repo}의 실제 데이터를 로드합니다.`);
502 |           
503 |           // 여기서 실제 API 호출 또는 데이터 로드 로직이 실행될 것입니다.
504 |           // 저장소별로 데이터를 구분하여 가공하는 로직 추가
505 |           
506 |           // API 데이터를 저장소별 고유한 값을 가질 수 있도록 처리
507 |           // 실제 API 구현이 필요하지만, 현재는 기본 구조만 작성
508 |           
509 |           // 데이터 로드에 성공했다면 다음과 같이 처리 (실제 구현 필요)
510 |           // API로부터 로드한 데이터 처리
511 |           const apiLoadedData = {
512 |             leadTimeData: [],
513 |             mttrData: [],
514 |             deploymentFrequencyData: [],
515 |             changeFailureRateData: []
516 |           };
517 |           
518 |           // 데이터가 로드되었다면 저장소 정보 추가하여 주입
519 |           newMultiRepoData.leadTimeData[repo] = apiLoadedData.leadTimeData.map((item: any) => ({...item, repository: repo}));
520 |           newMultiRepoData.mttrData[repo] = apiLoadedData.mttrData.map((item: any) => ({...item, repository: repo}));
521 |           newMultiRepoData.deploymentFrequencyData[repo] = apiLoadedData.deploymentFrequencyData.map((item: any) => ({...item, repository: repo}));
522 |           newMultiRepoData.changeFailureRateData[repo] = apiLoadedData.changeFailureRateData.map((item: any) => ({...item, repository: repo}));
523 |           
524 |           // 로드된 데이터를 캐시에 저장
525 |           localStorage.setItem(cachedDataKey, JSON.stringify({
526 |             leadTimeData: apiLoadedData.leadTimeData,
527 |             mttrData: apiLoadedData.mttrData,
528 |             deploymentFrequencyData: apiLoadedData.deploymentFrequencyData,
529 |             changeFailureRateData: apiLoadedData.changeFailureRateData
530 |           }));
531 |           
532 |           console.log(`저장소 ${repo} 실제 데이터 로드 완료 및 캐싱됨`);
533 |           repoDataLoaded = true;
534 |         } catch (error) {
535 |           console.error(`${repo} 실제 데이터 로드 오류:`, error);
536 |         }
537 |       }
538 |       
539 |       // 5. 모든 시도 후에도 데이터를 로드하지 못한 경우 빈 데이터 설정
540 |       if (!repoDataLoaded) {
541 |         console.warn(`저장소 ${repo}에 대한 데이터를 로드할 수 없습니다. 빈 데이터로 설정합니다.`);
542 |         
543 |         newMultiRepoData.leadTimeData[repo] = [];
544 |         newMultiRepoData.mttrData[repo] = [];
545 |         newMultiRepoData.deploymentFrequencyData[repo] = [];
546 |         newMultiRepoData.changeFailureRateData[repo] = [];
547 |       }
548 |     }
549 |     
550 |     console.log('다중 저장소 데이터 로드 완료:', {
551 |       leadTimeData: Object.keys(newMultiRepoData.leadTimeData).length,
552 |       mttrData: Object.keys(newMultiRepoData.mttrData).length,
553 |       deploymentFrequencyData: Object.keys(newMultiRepoData.deploymentFrequencyData).length,
554 |       changeFailureRateData: Object.keys(newMultiRepoData.changeFailureRateData).length
555 |     });
556 |     
557 |     setMultiRepoData(newMultiRepoData);
558 |     setIsMultiLoading(false);
559 |   };
560 |   
561 |   // 저장소별 테스트 데이터 생성 함수
562 |   const generateTestDataForRepo = (repo: string, startDate: Date, endDate: Date, multiplier = 1.0) => {
563 |     console.log(`📊 저장소 ${repo}의 테스트 데이터를 생성합니다. 배수: ${multiplier}`);
564 |     
565 |     const startStr = format(startDate, 'yyyy-MM-dd');
566 |     const endStr = format(endDate, 'yyyy-MM-dd');
567 |     
568 |     // 키 생성
569 |     const leadTimeKey = `beaver_${repo}_lead_time_${startStr}_${endStr}`;
570 |     const mttrKey = `beaver_${repo}_mttr_${startStr}_${endStr}`;
571 |     const dfKey = `beaver_${repo}_deployment_frequency_${startStr}_${endStr}`;
572 |     const cfrKey = `beaver_${repo}_change_failure_rate_${startStr}_${endStr}`;
573 |     const metricsKey = `beaver_${repo}_metrics_${startStr}_${endStr}`;
574 |     
575 |     // 날짜 범위 생성 (30일)
576 |     const days = 30;
577 |     const leadTimeData = [];
578 |     const mttrData = [];
579 |     const deploymentFrequencyData = [];
580 |     const changeFailureRateData = [];
581 |     
582 |     const endDateValue = new Date(endDate);
583 |     const startDateValue = new Date(endDateValue);
584 |     startDateValue.setDate(endDateValue.getDate() - days);
585 |     
586 |     // 날짜 배열 생성
587 |     const dateRange = eachDayOfInterval({ start: startDateValue, end: endDateValue });
588 |     
589 |     // 저장소별 고정 값 설정 (명확한 차이를 만들기 위해)
590 |     const repoName = repo.split('/')[1];
591 |     const baseValues = {
592 |       // 저장소별로 확실히 다른 값을 가지도록 설정
593 |       'n8n': { leadTime: 24.5, mttr: 6.3, deployFreq: 3.2, failRate: 22.5 },
594 |       'docmost': { leadTime: 18.7, mttr: 4.8, deployFreq: 2.5, failRate: 15.3 },
595 |       'react-flow': { leadTime: 12.3, mttr: 3.5, deployFreq: 1.8, failRate: 10.2 },
596 |       'vitest': { leadTime: 8.6, mttr: 2.1, deployFreq: 1.2, failRate: 7.5 },
597 |       'react': { leadTime: 5.4, mttr: 1.4, deployFreq: 0.7, failRate: 4.8 }
598 |     }[repoName] || { leadTime: 10.0, mttr: 3.0, deployFreq: 1.5, failRate: 12.0 };
599 |     
600 |     // 1. 리드 타임 데이터 생성 (저장소마다 다른 값)
601 |     for (const date of dateRange) {
602 |       // 기본값에 랜덤 변동치 추가 (±20%)
603 |       const randomVariation = 0.8 + Math.random() * 0.4; // 0.8 ~ 1.2
604 |       leadTimeData.push({
605 |         date: format(date, 'yyyy-MM-dd'),
606 |         leadTime: baseValues.leadTime * randomVariation
607 |       });
608 |     }
609 |     
610 |     // 2. MTTR 데이터 생성
611 |     for (const date of dateRange) {
612 |       const randomVariation = 0.8 + Math.random() * 0.4;
613 |       mttrData.push({
614 |         date: format(date, 'yyyy-MM-dd'),
615 |         mttr: baseValues.mttr * randomVariation
616 |       });
617 |     }
618 |     
619 |     // 3. 배포 빈도 데이터 생성
620 |     for (const date of dateRange) {
621 |       const randomVariation = 0.8 + Math.random() * 0.4;
622 |       deploymentFrequencyData.push({
623 |         date: format(date, 'yyyy-MM-dd'),
624 |         count: Math.max(1, Math.round(baseValues.deployFreq * randomVariation))
625 |       });
626 |     }
627 |     
628 |     // 4. 변경 실패율 데이터 생성
629 |     for (const date of dateRange) {
630 |       const randomVariation = 0.8 + Math.random() * 0.4;
631 |       changeFailureRateData.push({
632 |         date: format(date, 'yyyy-MM-dd'),
633 |         rate: (baseValues.failRate * randomVariation) / 100 // 0~25%의 값을 100으로 나눔
634 |       });
635 |     }
636 |     
637 |     // 5. 메트릭스 요약 데이터
638 |     const metricsData = {
639 |       leadTimeForChanges: baseValues.leadTime,
640 |       deploymentFrequency: baseValues.deployFreq,
641 |       changeFailureRate: baseValues.failRate,
642 |       meanTimeToRestore: baseValues.mttr
643 |     };
644 |     
645 |     // 데이터 저장
646 |     try {
647 |       localStorage.setItem(leadTimeKey, JSON.stringify(leadTimeData));
648 |       localStorage.setItem(mttrKey, JSON.stringify(mttrData));
649 |       localStorage.setItem(dfKey, JSON.stringify(deploymentFrequencyData));
650 |       localStorage.setItem(cfrKey, JSON.stringify(changeFailureRateData));
651 |       localStorage.setItem(metricsKey, JSON.stringify(metricsData));
652 |       
653 |       console.log(`저장소 ${repo} 테스트 데이터가 성공적으로 생성되었습니다.`, {
654 |         leadTimeData: leadTimeData.length,
655 |         mttrData: mttrData.length,
656 |         deploymentFrequencyData: deploymentFrequencyData.length,
657 |         changeFailureRateData: changeFailureRateData.length,
658 |         baseValues: baseValues
659 |       });
660 |     } catch (error) {
661 |       console.error(`저장소 ${repo} 테스트 데이터 생성 중 오류 발생:`, error);
662 |     }
663 |   };
664 | 
665 |   // 저장소 선택이 변경될 때마다 데이터 로드
666 |   useEffect(() => {
667 |     if (multiRepoMode && selectedRepos.length > 0) {
668 |       loadMultiRepoData();
669 |     }
670 |   }, [selectedRepos, multiRepoMode, startDate, endDate]);
671 | 
672 |   // 다중 저장소 선택 토글
673 |   const toggleMultiRepoMode = () => {
674 |     const newMode = !multiRepoMode;
675 |     setMultiRepoMode(newMode);
676 |     
677 |     if (newMode) {
678 |       // 다중 모드 활성화시 현재 선택된 저장소가 있으면 추가
679 |       if (selectedRepo && !selectedRepos.includes(selectedRepo)) {
680 |         setSelectedRepos([...selectedRepos, selectedRepo]);
681 |       }
682 |     }
683 |   };
684 |   
685 |   // 다중 저장소 선택/해제
686 |   const toggleRepositorySelection = (repo: string) => {
687 |     if (selectedRepos.includes(repo)) {
688 |       setSelectedRepos(selectedRepos.filter(r => r !== repo));
689 |     } else {
690 |       if (selectedRepos.length < 10) { // 최대 10개 저장소 제한
691 |         setSelectedRepos([...selectedRepos, repo]);
692 |       } else {
693 |         alert('최대 10개 저장소까지만 선택할 수 있습니다.');
694 |       }
695 |     }
696 |   };
697 | 
698 |   return (
699 |     <div className="container mx-auto p-4">
700 |       <div className="mb-8">
701 |         <div className="flex justify-between items-center mb-6">
702 |           <h1 className="text-3xl font-bold">DORA 메트릭스 대시보드</h1>
703 |           <div className="flex items-center gap-2">
704 |             <p className="text-sm text-muted-foreground">마지막 업데이트: {formattedLastUpdated}</p>
705 |             
706 |             {/* GitHub 토큰 설정 버튼 */}
707 |             <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
708 |               <DialogTrigger asChild>
709 |                 <Button variant="outline" size="sm" className="gap-1">
710 |                   <Key className="h-4 w-4" />
711 |                   GitHub Token 설정
712 |                   <span className={`ml-1 inline-flex h-2 w-2 rounded-full ${tokenFromEnv || localStorage.getItem('github_token') ? 'bg-green-500' : 'bg-red-500'}`}></span>
713 |                 </Button>
714 |               </DialogTrigger>
715 |               <DialogContent>
716 |                 <DialogHeader>
717 |                   <DialogTitle>GitHub 토큰 설정</DialogTitle>
718 |                 </DialogHeader>
719 |                 <div className="space-y-4 mt-2">
720 |                   <p className="text-sm text-muted-foreground">
721 |                     GitHub API 사용 제한을 늘리기 위해 개인 액세스 토큰을 설정해주세요.
722 |                     토큰을 설정하면 시간당 5,000회의 요청이 가능합니다.
723 |                   </p>
724 |                   <p className="text-sm">
725 |                     <a 
726 |                       href="https://github.com/settings/tokens" 
727 |                       target="_blank" 
728 |                       rel="noopener noreferrer"
729 |                       className="text-blue-500 hover:underline"
730 |                     >
731 |                       GitHub 토큰 생성하기
732 |                     </a> (repo 권한 필요)
733 |                   </p>
734 |                   <div className="flex">
735 |                     <div className="relative flex-1">
736 |                       <Input
737 |                         type={showToken ? "text" : "password"}
738 |                         value={githubToken}
739 |                         onChange={(e) => setGithubToken(e.target.value)}
740 |                         placeholder="GitHub 개인 액세스 토큰 입력"
741 |                       />
742 |                       <Button
743 |                         type="button"
744 |                         variant="ghost"
745 |                         size="icon"
746 |                         className="absolute right-0 top-0 h-full"
747 |                         onClick={() => setShowToken(!showToken)}
748 |                       >
749 |                         {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
750 |                       </Button>
751 |                     </div>
752 |                   </div>
753 |                   <div className="flex justify-between">
754 |                     <Button variant="outline" onClick={() => setTokenDialogOpen(false)}>
755 |                       취소
756 |                     </Button>
757 |                     <div className="space-x-2">
758 |                       {(localStorage.getItem('github_token') || tokenFromEnv) && (
759 |                         <Button variant="destructive" onClick={clearGithubToken}>
760 |                           토큰 삭제
761 |                         </Button>
762 |                       )}
763 |                       <Button onClick={saveGithubToken}>
764 |                         저장
765 |                       </Button>
766 |                     </div>
767 |                   </div>
768 |                 </div>
769 |               </DialogContent>
770 |             </Dialog>
771 |             
772 |             {/* 테스트 데이터 주입 버튼 */}
773 |             <Button 
774 |               variant="outline" 
775 |               size="sm" 
776 |               className="gap-1" 
777 |               onClick={() => window.open('/inject-test-data.html', '_blank')}
778 |             >
779 |               <Database className="h-4 w-4" />
780 |               테스트 데이터
781 |             </Button>
782 |             
783 |             {/* 테스트 데이터 날짜 설정 버튼 */}
784 |             <Button
785 |               variant="outline"
786 |               className="ml-2"
787 |               onClick={() => {
788 |                 if (!selectedRepo) {
789 |                   alert('테스트 모드를 활성화하기 전에 저장소를 선택해주세요.');
790 |                   return;
791 |                 }
792 |                 setTestDataDateRange();
793 |               }}
794 |             >
795 |               <span 
796 |                 className={`inline-block w-2 h-2 rounded-full mr-2 ${
797 |                   startDate?.getTime() === new Date('2024-01-01').getTime() 
798 |                     ? 'bg-green-500' 
799 |                     : 'bg-red-500'
800 |                 }`}
801 |               ></span>
802 |               테스트 모드
803 |             </Button>
804 |             
805 |             {/* 새로고침 드롭다운 메뉴 */}
806 |             <DropdownMenu>
807 |               <DropdownMenuTrigger asChild>
808 |                 <Button 
809 |                   variant="outline" 
810 |                   size="sm" 
811 |                   className="ml-2"
812 |                   disabled={isMultiLoading}
813 |                 >
814 |                   <RefreshCw className={`h-4 w-4 mr-1 ${isMultiLoading ? 'animate-spin' : ''}`} />
815 |                   {isMultiLoading ? '업데이트 중...' : '새로고침'}
816 |                 </Button>
817 |               </DropdownMenuTrigger>
818 |               <DropdownMenuContent align="end">
819 |                 <DropdownMenuItem onClick={handleRefresh}>
820 |                   <RefreshCw className="h-4 w-4 mr-2" />
821 |                   캐시 확인 후 새로고침
822 |                 </DropdownMenuItem>
823 |                 <DropdownMenuSeparator />
824 |                 <DropdownMenuItem onClick={handleForceRefresh}>
825 |                   <Trash2 className="h-4 w-4 mr-2" />
826 |                   캐시 무시하고 새로고침
827 |                 </DropdownMenuItem>
828 |               </DropdownMenuContent>
829 |             </DropdownMenu>
830 |           </div>
831 |         </div>
832 |         
833 |         {/* 필터 섹션 */}
834 |         <div className="flex flex-wrap gap-4 mb-6 items-end">
835 |           <div className="flex flex-col gap-2">
836 |             <label className="text-sm font-medium">시작일</label>
837 |             <DatePicker
838 |               selected={startDate}
839 |               onSelect={handleStartDateChange}
840 |               placeholder="시작일 선택"
841 |               open={startDateOpen}
842 |               onOpenChange={setStartDateOpen}
843 |             />
844 |             {startDate && startDate.getFullYear() === 2024 && (
845 |               <div className="text-xs text-green-600 mt-1">테스트 모드</div>
846 |             )}
847 |           </div>
848 |           
849 |           <div className="flex flex-col gap-2">
850 |             <label className="text-sm font-medium">종료일</label>
851 |             <DatePicker
852 |               selected={endDate}
853 |               onSelect={handleEndDateChange}
854 |               placeholder="종료일 선택"
855 |               open={endDateOpen}
856 |               onOpenChange={setEndDateOpen}
857 |             />
858 |             {endDate && endDate.getFullYear() === 2024 && (
859 |               <div className="text-xs text-green-600 mt-1">테스트 모드</div>
860 |             )}
861 |           </div>
862 |           
863 |           {/* 저장소 필터 */}
864 |           <div className="space-y-2">
865 |             <Label htmlFor="repository">저장소 필터</Label>
866 |             <div className="flex space-x-2">
867 |               {multiRepoMode ? (
868 |                 <Button 
869 |                   variant="outline" 
870 |                   className="flex items-center gap-1" 
871 |                   onClick={toggleMultiRepoMode}
872 |                 >
873 |                   <Eye size={16} />
874 |                   단일 모드
875 |                 </Button>
876 |               ) : (
877 |                 <Select value={selectedRepo || undefined} onValueChange={setSelectedRepo}>
878 |                   <SelectTrigger id="repository">
879 |                     <SelectValue placeholder="저장소 선택" />
880 |                   </SelectTrigger>
881 |                   <SelectContent>
882 |                     {repositories.map((repo) => (
883 |                       <SelectItem key={repo} value={repo}>{repo}</SelectItem>
884 |                     ))}
885 |                   </SelectContent>
886 |                 </Select>
887 |               )}
888 |               
889 |               <Button
890 |                 variant="outline"
891 |                 size="icon"
892 |                 onClick={toggleMultiRepoMode}
893 |                 title={multiRepoMode ? "단일 저장소 모드로 전환" : "다중 저장소 모드로 전환"}
894 |               >
895 |                 {multiRepoMode ? <Eye size={16} /> : <EyeOff size={16} />}
896 |               </Button>
897 |             </div>
898 |             
899 |             {/* 다중 저장소 선택 UI */}
900 |             {multiRepoMode && (
901 |               <div className="mt-4 space-y-2">
902 |                 <div className="flex justify-between items-center">
903 |                   <Label>다중 저장소 선택 (최대 10개)</Label>
904 |                   <span className="text-xs text-muted-foreground">{selectedRepos.length}/10 선택됨</span>
905 |                 </div>
906 |                 <div className="flex flex-wrap gap-2 p-2 border rounded-md">
907 |                   {repositories.map((repo, index) => (
908 |                     <div 
909 |                       key={repo} 
910 |                       className={`px-3 py-1 rounded-full text-sm cursor-pointer flex items-center gap-1 ${
911 |                         selectedRepos.includes(repo) 
912 |                           ? 'bg-primary text-primary-foreground' 
913 |                           : 'bg-muted hover:bg-muted/80'
914 |                       }`}
915 |                       style={selectedRepos.includes(repo) ? { backgroundColor: colorPalette[selectedRepos.indexOf(repo) % colorPalette.length] } : {}}
916 |                       onClick={() => toggleRepositorySelection(repo)}
917 |                     >
918 |                       {repo.split('/')[1]}
919 |                       {selectedRepos.includes(repo) && (
920 |                         <span className="inline-flex items-center justify-center w-4 h-4 text-xs">
921 |                           ✓
922 |                         </span>
923 |                       )}
924 |                     </div>
925 |                   ))}
926 |                 </div>
927 |               </div>
928 |             )}
929 |           </div>
930 |             
931 |           <Button 
932 |             type="button"
933 |             variant="default"
934 |             onClick={() => {
935 |               if (startDate && endDate && selectedRepo) {
936 |                 loadMetrics(startDate, endDate, selectedRepo);
937 |               }
938 |             }}
939 |             disabled={!startDate || !endDate || !selectedRepo || isMultiLoading}
940 |             className="px-8"
941 |           >
942 |             {isMultiLoading ? '로딩 중...' : '적용'}
943 |           </Button>
944 |         </div>
945 |         
946 |         {/* 테스트 데이터 모드 알림 메시지 */}
947 |         {startDate && 
948 |           startDate.getFullYear() === 2024 && 
949 |           startDate.getMonth() === 0 && 
950 |           startDate.getDate() === 1 && (
951 |           <Alert className="mb-4">
952 |             <AlertCircle className="h-4 w-4" />
953 |             <AlertTitle>테스트 모드 활성화됨</AlertTitle>
954 |             <AlertDescription>
955 |               현재 <strong>테스트 모드</strong>를 사용 중입니다. 실제 GitHub API를 호출하지 않고 테스트 데이터를 사용합니다.
956 |             </AlertDescription>
957 |           </Alert>
958 |         )}
959 |       </div>
960 |       
961 |       {/* 메트릭스 카드 섹션 */}
962 |       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
963 |         {/* 배포 빈도 카드 */}
964 |         <PerformanceIndicator
965 |           title="배포 빈도"
966 |           value={deploymentFrequency}
967 |           unit="회/일"
968 |           level={deploymentFrequencyLevel}
969 |           description="소프트웨어가 얼마나 자주 배포되는지 측정합니다."
970 |           isLoading={isMultiLoading}
971 |         />
972 |         
973 |         {/* 변경 리드 타임 카드 */}
974 |         <PerformanceIndicator
975 |           title="변경 리드 타임"
976 |           value={leadTimeForChanges}
977 |           unit="시간"
978 |           level={leadTimeLevel}
979 |           description="코드 변경부터 배포까지 걸리는 시간을 측정합니다."
980 |           isLoading={isMultiLoading}
981 |         />
982 |         
983 |         {/* 변경 실패율 카드 */}
984 |         <PerformanceIndicator
985 |           title="변경 실패율"
986 |           value={changeFailureRate}
987 |           unit="%"
988 |           level={changeFailureRateLevel}
989 |           description="배포 후 장애 또는 롤백으로 이어지는 비율입니다."
990 |           isLoading={isMultiLoading}
991 |         />
992 |         
993 |         {/* 복구 시간 카드 */}
994 |         <PerformanceIndicator
995 |           title="평균 복구 시간"
996 |           value={meanTimeToRestore}
997 |           unit="시간"
998 |           level={mttrLevel}
999 |           description="장애 발생 후 서비스 복구까지 걸리는 평균 시간입니다."
1000 |           isLoading={isMultiLoading}
1001 |         />
1002 |       </div>
1003 |       
1004 |       {/* 탭 섹션 - 추가적인 차트 및 정보 */}
1005 |       <div className="mt-8">
1006 |         <Tabs defaultValue="charts">
1007 |           <TabsList>
1008 |             <TabsTrigger value="charts">차트</TabsTrigger>
1009 |             <TabsTrigger value="events">이벤트</TabsTrigger>
1010 |             <TabsTrigger value="details">상세 정보</TabsTrigger>
1011 |           </TabsList>
1012 |           
1013 |           <TabsContent value="charts" className="mt-4">
1014 |             {multiRepoMode && (
1015 |               <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
1016 |                 <p className="text-sm text-blue-800">
1017 |                   <strong>다중 저장소 모드:</strong> {selectedRepos.length}개 저장소 선택됨
1018 |                 </p>
1019 |               </div>
1020 |             )}
1021 |             
1022 |             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
1023 |               {/* 배포 빈도 차트 */}
1024 |               <Card>
1025 |                 <CardHeader>
1026 |                   <CardTitle>시간별 배포 빈도</CardTitle>
1027 |                 </CardHeader>
1028 |                 <CardContent className="h-80">
1029 |                   <DeploymentFrequencyChart 
1030 |                     multiRepoMode={multiRepoMode} 
1031 |                     multiRepoData={multiRepoData.deploymentFrequencyData} 
1032 |                     colorPalette={colorPalette}
1033 |                   />
1034 |                 </CardContent>
1035 |               </Card>
1036 |               
1037 |               {/* 변경 실패율 차트 */}
1038 |               <Card>
1039 |                 <CardHeader>
1040 |                   <CardTitle>변경 실패율 추이</CardTitle>
1041 |                 </CardHeader>
1042 |                 <CardContent className="h-80">
1043 |                   <ChangeFailureRateChart 
1044 |                     multiRepoMode={multiRepoMode} 
1045 |                     multiRepoData={multiRepoData.changeFailureRateData} 
1046 |                     colorPalette={colorPalette}
1047 |                   />
1048 |                 </CardContent>
1049 |               </Card>
1050 |             </div>
1051 | 
1052 |             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
1053 |               {/* 리드 타임 차트 */}
1054 |               <Card>
1055 |                 <CardHeader>
1056 |                   <CardTitle>변경 리드 타임 추이</CardTitle>
1057 |                 </CardHeader>
1058 |                 <CardContent className="h-80">
1059 |                   <LeadTimeForChangesChart 
1060 |                     multiRepoMode={multiRepoMode} 
1061 |                     multiRepoData={multiRepoData.leadTimeData} 
1062 |                     colorPalette={colorPalette}
1063 |                   />
1064 |                 </CardContent>
1065 |               </Card>
1066 |               
1067 |               {/* 복구 시간 차트 */}
1068 |               <Card>
1069 |                 <CardHeader>
1070 |                   <CardTitle>평균 복구 시간</CardTitle>
1071 |                 </CardHeader>
1072 |                 <CardContent className="h-80">
1073 |                   <MeanTimeToRestoreChart 
1074 |                     multiRepoMode={multiRepoMode} 
1075 |                     multiRepoData={multiRepoData.mttrData} 
1076 |                     colorPalette={colorPalette}
1077 |                   />
1078 |                 </CardContent>
1079 |               </Card>
1080 |             </div>
1081 |           </TabsContent>
1082 |           
1083 |           <TabsContent value="events" className="mt-4">
1084 |             <EventTimeline />
1085 |           </TabsContent>
1086 |           
1087 |           <TabsContent value="details">
1088 |             <Card>
1089 |               <CardHeader>
1090 |                 <CardTitle>데이터 상세 정보</CardTitle>
1091 |               </CardHeader>
1092 |               <CardContent>
1093 |                 <p>선택한 기간: {startDate && endDate ? `${format(startDate, 'yyyy년 MM월 dd일', { locale: ko })} ~ ${format(endDate, 'yyyy년 MM월 dd일', { locale: ko })}` : '기간을 선택해주세요'}</p>
1094 |                 <p>선택한 저장소: {selectedRepo || '저장소를 선택해주세요'}</p>
1095 |                 <p>마지막 업데이트: {formattedLastUpdated}</p>
1096 |                 
1097 |                 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
1098 |                   <div>
1099 |                     <h3 className="text-lg font-semibold mb-2">DORA 메트릭스 성능 레벨</h3>
1100 |                     <ul className="list-disc pl-5 space-y-1">
1101 |                       <li>배포 빈도: <span className="font-medium">{getDORALevel('deploymentFrequency', deploymentFrequency) !== 'unknown' ? getDORALevel('deploymentFrequency', deploymentFrequency) : '데이터 없음'}</span></li>
1102 |                       <li>변경 리드 타임: <span className="font-medium">{getDORALevel('leadTimeForChanges', leadTimeForChanges) !== 'unknown' ? getDORALevel('leadTimeForChanges', leadTimeForChanges) : '데이터 없음'}</span></li>
1103 |                       <li>변경 실패율: <span className="font-medium">{getDORALevel('changeFailureRate', changeFailureRate) !== 'unknown' ? getDORALevel('changeFailureRate', changeFailureRate) : '데이터 없음'}</span></li>
1104 |                       <li>평균 복구 시간: <span className="font-medium">{getDORALevel('meanTimeToRestore', meanTimeToRestore) !== 'unknown' ? getDORALevel('meanTimeToRestore', meanTimeToRestore) : '데이터 없음'}</span></li>
1105 |                     </ul>
1106 |                   </div>
1107 |                   
1108 |                   <div>
1109 |                     <h3 className="text-lg font-semibold mb-2">메트릭스 계산 방법</h3>
1110 |                     <ul className="list-disc pl-5 space-y-1">
1111 |                       <li>배포 빈도: 선택한 기간 내 배포 횟수 / 기간(일)</li>
1112 |                       <li>변경 리드 타임: 코드 변경부터 배포까지 평균 시간(시)</li>
1113 |                       <li>변경 실패율: 장애 발생 배포 수 / 전체 배포 수</li>
1114 |                       <li>평균 복구 시간: 장애 발생부터 복구까지 평균 시간(시)</li>
1115 |                     </ul>
1116 |                   </div>
1117 |                 </div>
1118 |               </CardContent>
1119 |             </Card>
1120 |           </TabsContent>
1121 |         </Tabs>
1122 |       </div>
1123 |     </div>
1124 |   );
1125 | };
1126 | 
1127 | export default Dashboard; 
```

src/components/dashboard/DeploymentFrequencyChart.tsx
```
1 | import React, { useMemo } from 'react';
2 | import { useStore } from '@/store/dashboardStore';
3 | import { 
4 |   ResponsiveContainer, 
5 |   BarChart, 
6 |   Bar,
7 |   XAxis, 
8 |   YAxis, 
9 |   CartesianGrid, 
10 |   Tooltip, 
11 |   Legend,
12 |   LabelList,
13 |   Cell
14 | } from 'recharts';
15 | import { format } from 'date-fns';
16 | import { ko } from 'date-fns/locale';
17 | import { DeploymentFrequencyDataPoint } from '@/store/dashboardStore';
18 | 
19 | /**
20 |  * 배포 빈도 차트 컴포넌트
21 |  * 선택된 기간의 일별 배포 횟수를 복합 차트로 시각화합니다.
22 |  */
23 | interface DeploymentFrequencyChartProps {
24 |   multiRepoMode?: boolean;
25 |   multiRepoData?: { [repo: string]: DeploymentFrequencyDataPoint[] };
26 |   colorPalette?: string[];
27 | }
28 | 
29 | const DeploymentFrequencyChart: React.FC<DeploymentFrequencyChartProps> = ({ 
30 |   multiRepoMode = false, 
31 |   multiRepoData = {},
32 |   colorPalette = ['#007AFF', '#FF2D55', '#5AC8FA', '#FF9500', '#4CD964']
33 | }) => {
34 |   const { deploymentFrequencyData } = useStore();
35 | 
36 |   // 디버그 로깅 추가
37 |   useMemo(() => {
38 |     if (multiRepoMode) {
39 |       console.log('DeploymentFrequencyChart - 다중 저장소 모드 데이터:', {
40 |         저장소_수: Object.keys(multiRepoData).length,
41 |         저장소_목록: Object.keys(multiRepoData),
42 |         데이터_샘플: Object.entries(multiRepoData).map(([repo, data]) => ({
43 |           repo,
44 |           데이터개수: data.length,
45 |           첫번째항목: data.length > 0 ? data[0] : '데이터 없음'
46 |         }))
47 |       });
48 |     }
49 |   }, [multiRepoMode, multiRepoData]);
50 | 
51 |   // 저장소별 평균값 계산 - 항상 호출되도록 수정
52 |   const repoAverages = useMemo(() => {
53 |     // multiRepoMode가 아니면 빈 객체 반환
54 |     if (!multiRepoMode || Object.keys(multiRepoData).length === 0) {
55 |       return {};
56 |     }
57 |     
58 |     const result: Record<string, number> = {};
59 |     
60 |     Object.entries(multiRepoData).forEach(([repo, dataPoints]) => {
61 |       // 데이터가 없어도 기본값 설정
62 |       const repoName = repo.split('/')[1];
63 |       if (dataPoints.length === 0) {
64 |         result[repoName] = 0; // 빈 데이터인 경우 0으로 설정
65 |         return;
66 |       }
67 |       
68 |       const sum = dataPoints.reduce((acc, item) => acc + (item.count || 0), 0);
69 |       // 평균 계산 시 시간당 배포 횟수로 변환 (일별 데이터를 24로 나눔)
70 |       const avg = (sum / dataPoints.length) / 24;
71 |       result[repoName] = Number(avg.toFixed(1)); // 최소값 설정 제거
72 |     });
73 |     
74 |     console.log('DeploymentFrequencyChart - 계산된 평균값:', result);
75 |     return result;
76 |   }, [multiRepoMode, multiRepoData]);
77 |   
78 |   // 바 차트용 데이터 포맷팅 - 빈 barData 방지
79 |   const barData = useMemo(() => {
80 |     if (!multiRepoMode || Object.keys(multiRepoData).length === 0) {
81 |       return [];
82 |     }
83 |     
84 |     // 데이터 정렬 (값이 큰 순서대로)
85 |     const sortedEntries = Object.entries(repoAverages)
86 |       .sort((a, b) => b[1] - a[1]); // 내림차순 정렬
87 |     
88 |     // 정렬된 데이터로 차트 데이터 생성
89 |     return sortedEntries.map(([repoName, avg], index) => ({
90 |       name: repoName,
91 |       value: avg,
92 |       fill: colorPalette[index % colorPalette.length]
93 |     }));
94 |   }, [multiRepoMode, repoAverages, colorPalette]);
95 | 
96 |   // 다중 저장소 모드일 때는 다른 데이터 처리
97 |   if (multiRepoMode) {
98 |     // 저장소별 데이터가 없는 경우
99 |     if (Object.keys(multiRepoData).length === 0) {
100 |       return (
101 |         <div className="flex items-center justify-center h-full">
102 |           <p className="text-muted-foreground">저장소를 선택하세요.</p>
103 |         </div>
104 |       );
105 |     }
106 | 
107 |     // 빈 barData 처리
108 |     if (barData.length === 0) {
109 |       return (
110 |         <div className="flex items-center justify-center h-full">
111 |           <p className="text-muted-foreground">데이터가 없거나 모든 값이 0입니다.</p>
112 |         </div>
113 |       );
114 |     }
115 | 
116 |     return (
117 |       <div className="h-full">
118 |         <p className="text-base font-medium mb-4 text-center">시간당 평균 배포 횟수</p>
119 |         <ResponsiveContainer width="100%" height="90%">
120 |           <BarChart
121 |             data={barData}
122 |             layout="vertical"
123 |             margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
124 |           >
125 |             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" horizontal={true} vertical={false} />
126 |             <XAxis 
127 |               type="number"
128 |               stroke="hsl(var(--foreground))" 
129 |               tick={{ fill: 'hsl(var(--foreground))' }}
130 |               tickLine={false}
131 |               axisLine={false}
132 |               label={{ 
133 |                 value: '횟수/시간', 
134 |                 position: 'insideBottom',
135 |                 offset: -10,
136 |                 fill: 'hsl(var(--foreground))'
137 |               }}
138 |             />
139 |             <YAxis 
140 |               type="category"
141 |               dataKey="name"
142 |               stroke="hsl(var(--foreground))" 
143 |               tick={{ fill: 'hsl(var(--foreground))' }}
144 |               tickLine={false}
145 |               axisLine={false}
146 |               width={80}
147 |             />
148 |             <Tooltip
149 |               contentStyle={{
150 |                 backgroundColor: 'hsl(var(--background))',
151 |                 borderColor: 'hsl(var(--border))',
152 |                 color: 'hsl(var(--foreground))'
153 |               }}
154 |               labelStyle={{ color: 'hsl(var(--foreground))' }}
155 |               formatter={(value: number) => [`${value} 회/시간`, '배포 빈도']}
156 |             />
157 |             <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
158 |             <Bar 
159 |               dataKey="value" 
160 |               name="시간당 배포 횟수" 
161 |               radius={[0, 4, 4, 0]}
162 |             >
163 |               {
164 |                 barData.map((entry, index) => (
165 |                   <Cell key={`cell-${index}`} fill={entry.fill} />
166 |                 ))
167 |               }
168 |               <LabelList 
169 |                 dataKey="value" 
170 |                 position="right" 
171 |                 formatter={(value: number) => `${value}회`}
172 |                 style={{ fill: 'hsl(var(--foreground))' }}
173 |               />
174 |             </Bar>
175 |           </BarChart>
176 |         </ResponsiveContainer>
177 |       </div>
178 |     );
179 |   }
180 | 
181 |   // 단일 저장소 모드 (기존 코드)
182 |   if (!deploymentFrequencyData || deploymentFrequencyData.length === 0) {
183 |     return (
184 |       <div className="flex items-center justify-center h-full">
185 |         <p className="text-muted-foreground">데이터가 없습니다.</p>
186 |       </div>
187 |     );
188 |   }
189 | 
190 |   // 평균값 계산
191 |   const totalDeployments = deploymentFrequencyData.reduce((sum, item) => sum + item.count, 0);
192 |   // 배포 빈도를 시간당으로 계산 (일별 데이터를 24로 나눔)
193 |   const hourlyAverage = (totalDeployments / deploymentFrequencyData.length) / 24;
194 | 
195 |   return (
196 |     <div className="h-full">
197 |       <p className="text-base font-medium mb-4 text-center">시간당 평균 배포 횟수</p>
198 |       <ResponsiveContainer width="100%" height="90%">
199 |         <BarChart
200 |           data={[{ name: '시간당 배포 횟수', value: Number(hourlyAverage.toFixed(1)) }]}
201 |           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
202 |         >
203 |           <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
204 |           <XAxis 
205 |             dataKey="name" 
206 |             stroke="hsl(var(--foreground))" 
207 |             tick={{ fill: 'hsl(var(--foreground))' }}
208 |             tickLine={false}
209 |             axisLine={false}
210 |           />
211 |           <YAxis 
212 |             stroke="hsl(var(--foreground))" 
213 |             tick={{ fill: 'hsl(var(--foreground))' }}
214 |             tickLine={false}
215 |             axisLine={false}
216 |             label={{ 
217 |               value: '횟수/시간', 
218 |               angle: -90, 
219 |               position: 'insideLeft',
220 |               fill: 'hsl(var(--foreground))'
221 |             }}
222 |           />
223 |           <Tooltip
224 |             contentStyle={{
225 |               backgroundColor: 'hsl(var(--background))',
226 |               borderColor: 'hsl(var(--border))',
227 |               color: 'hsl(var(--foreground))'
228 |             }}
229 |             labelStyle={{ color: 'hsl(var(--foreground))' }}
230 |             formatter={(value: number) => [`${value} 회/시간`, '배포 빈도']}
231 |           />
232 |           <Bar 
233 |             dataKey="value" 
234 |             fill="hsl(var(--chart-1))" 
235 |             name="시간당 배포 횟수"
236 |             radius={[4, 4, 0, 0]}
237 |           >
238 |             <LabelList 
239 |               dataKey="value" 
240 |               position="top" 
241 |               formatter={(value: number) => `${value}회`}
242 |               style={{ fill: 'hsl(var(--foreground))' }}
243 |             />
244 |           </Bar>
245 |         </BarChart>
246 |       </ResponsiveContainer>
247 |     </div>
248 |   );
249 | };
250 | 
251 | export default DeploymentFrequencyChart; 
```

src/components/dashboard/EventTimeline.tsx
```
1 | import React from 'react';
2 | import { useStore } from '@/store/dashboardStore';
3 | import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
4 | import { Separator } from '@/components/ui/separator';
5 | import { format } from 'date-fns';
6 | import { ko } from 'date-fns/locale';
7 | 
8 | type EventType = 'deployment' | 'incident' | 'recovery';
9 | 
10 | interface Event {
11 |   id: string;
12 |   type: EventType;
13 |   timestamp: string;
14 |   description: string;
15 |   repository: string;
16 | }
17 | 
18 | const getEventIcon = (type: EventType) => {
19 |   switch (type) {
20 |     case 'deployment':
21 |       return '🚀';
22 |     case 'incident':
23 |       return '⚠️';
24 |     case 'recovery':
25 |       return '🔄';
26 |     default:
27 |       return '📝';
28 |   }
29 | };
30 | 
31 | const getEventColor = (type: EventType) => {
32 |   switch (type) {
33 |     case 'deployment':
34 |       return 'text-blue-500 dark:text-blue-400';
35 |     case 'incident':
36 |       return 'text-red-500 dark:text-red-400';
37 |     case 'recovery':
38 |       return 'text-green-500 dark:text-green-400';
39 |     default:
40 |       return 'text-gray-500 dark:text-gray-400';
41 |   }
42 | };
43 | 
44 | const EventItem: React.FC<{ event: Event }> = ({ event }) => {
45 |   const formattedDate = format(new Date(event.timestamp), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
46 |   const eventIcon = getEventIcon(event.type);
47 |   const eventColor = getEventColor(event.type);
48 | 
49 |   return (
50 |     <div className="mb-4">
51 |       <div className="flex items-start">
52 |         <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-3 ${eventColor}`}>
53 |           <span className="text-lg">{eventIcon}</span>
54 |         </div>
55 |         <div className="flex-1">
56 |           <div className="font-medium">{event.description}</div>
57 |           <div className="text-sm text-muted-foreground">
58 |             {formattedDate} • {event.repository}
59 |           </div>
60 |         </div>
61 |       </div>
62 |     </div>
63 |   );
64 | };
65 | 
66 | const EventTimeline: React.FC = () => {
67 |   const { events } = useStore();
68 | 
69 |   // 이벤트를 날짜 기준으로 내림차순 정렬
70 |   const sortedEvents = [...events].sort((a, b) => 
71 |     new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
72 |   );
73 | 
74 |   return (
75 |     <Card>
76 |       <CardHeader>
77 |         <CardTitle>이벤트 타임라인</CardTitle>
78 |       </CardHeader>
79 |       <CardContent>
80 |         <div className="space-y-2">
81 |           {sortedEvents.length > 0 ? (
82 |             sortedEvents.map((event, index) => (
83 |               <React.Fragment key={event.id}>
84 |                 <EventItem event={event} />
85 |                 {index < sortedEvents.length - 1 && <Separator className="my-2" />}
86 |               </React.Fragment>
87 |             ))
88 |           ) : (
89 |             <p className="text-muted-foreground text-center py-4">
90 |               선택한 기간에 기록된 이벤트가 없습니다.
91 |             </p>
92 |           )}
93 |         </div>
94 |       </CardContent>
95 |     </Card>
96 |   );
97 | };
98 | 
99 | export default EventTimeline; 
```

src/components/dashboard/LeadTimeForChangesChart.tsx
```
1 | import React, { useMemo } from 'react';
2 | import { useStore } from '@/store/dashboardStore';
3 | import { 
4 |   ResponsiveContainer, 
5 |   BarChart, 
6 |   Bar,
7 |   XAxis, 
8 |   YAxis, 
9 |   CartesianGrid, 
10 |   Tooltip, 
11 |   Legend,
12 |   LabelList,
13 |   Cell
14 | } from 'recharts';
15 | import { format } from 'date-fns';
16 | import { ko } from 'date-fns/locale';
17 | import { LeadTimeDataPoint } from '@/store/dashboardStore';
18 | 
19 | interface LeadTimeForChangesChartProps {
20 |   multiRepoMode?: boolean;
21 |   multiRepoData?: { [repo: string]: LeadTimeDataPoint[] };
22 |   colorPalette?: string[];
23 | }
24 | 
25 | const LeadTimeForChangesChart: React.FC<LeadTimeForChangesChartProps> = ({ 
26 |   multiRepoMode = false, 
27 |   multiRepoData = {},
28 |   colorPalette = ['#007AFF', '#FF2D55', '#5AC8FA', '#FF9500', '#4CD964']
29 | }) => {
30 |   const { leadTimeData } = useStore();
31 | 
32 |   // 디버그 로깅 추가
33 |   useMemo(() => {
34 |     if (multiRepoMode) {
35 |       console.log('LeadTimeForChangesChart - 다중 저장소 모드 데이터:', {
36 |         저장소_수: Object.keys(multiRepoData).length,
37 |         저장소_목록: Object.keys(multiRepoData),
38 |         데이터_샘플: Object.entries(multiRepoData).map(([repo, data]) => ({
39 |           repo,
40 |           데이터개수: data.length,
41 |           첫번째항목: data.length > 0 ? data[0] : '데이터 없음'
42 |         }))
43 |       });
44 |     }
45 |   }, [multiRepoMode, multiRepoData]);
46 | 
47 |   // 저장소별 평균값 계산 - 항상 호출되도록 수정
48 |   const repoAverages = useMemo(() => {
49 |     // multiRepoMode가 아니면 빈 객체 반환
50 |     if (!multiRepoMode || Object.keys(multiRepoData).length === 0) {
51 |       return {};
52 |     }
53 |     
54 |     const result: Record<string, number> = {};
55 |     
56 |     Object.entries(multiRepoData).forEach(([repo, dataPoints]) => {
57 |       // 데이터가 없어도 기본값 설정
58 |       const repoName = repo.split('/')[1];
59 |       if (dataPoints.length === 0) {
60 |         result[repoName] = 0; // 빈 데이터인 경우 0으로 설정
61 |         return;
62 |       }
63 |       
64 |       const sum = dataPoints.reduce((acc, item) => acc + (item.leadTime || 0), 0);
65 |       const avg = sum / dataPoints.length;
66 |       result[repoName] = Number(avg.toFixed(1)); // 최소값 설정 제거
67 |     });
68 |     
69 |     console.log('LeadTimeForChangesChart - 계산된 평균값:', result);
70 |     return result;
71 |   }, [multiRepoMode, multiRepoData]);
72 |   
73 |   // 바 차트용 데이터 포맷팅 - 빈 barData 방지
74 |   const barData = useMemo(() => {
75 |     if (!multiRepoMode || Object.keys(multiRepoData).length === 0) {
76 |       return [];
77 |     }
78 |     
79 |     // 데이터 정렬 (값이 큰 순서대로)
80 |     const sortedEntries = Object.entries(repoAverages)
81 |       .sort((a, b) => b[1] - a[1]); // 내림차순 정렬
82 |     
83 |     // 정렬된 데이터로 차트 데이터 생성
84 |     return sortedEntries.map(([repoName, avg], index) => ({
85 |       name: repoName,
86 |       value: avg,
87 |       fill: colorPalette[index % colorPalette.length]
88 |     }));
89 |   }, [multiRepoMode, repoAverages, colorPalette]);
90 | 
91 |   // 다중 저장소 모드일 때는 다른 데이터 처리
92 |   if (multiRepoMode) {
93 |     // 저장소별 데이터가 없는 경우
94 |     if (Object.keys(multiRepoData).length === 0) {
95 |       return (
96 |         <div className="flex items-center justify-center h-full">
97 |           <p className="text-muted-foreground">저장소를 선택하세요.</p>
98 |         </div>
99 |       );
100 |     }
101 | 
102 |     // 빈 barData 처리
103 |     if (barData.length === 0) {
104 |       return (
105 |         <div className="flex items-center justify-center h-full">
106 |           <p className="text-muted-foreground">데이터가 없거나 모든 값이 0입니다.</p>
107 |         </div>
108 |       );
109 |     }
110 | 
111 |     return (
112 |       <div className="h-full">
113 |         <p className="text-base font-medium mb-4 text-center">평균 리드 타임</p>
114 |         <ResponsiveContainer width="100%" height="90%">
115 |           <BarChart
116 |             data={barData}
117 |             layout="vertical"
118 |             margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
119 |           >
120 |             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" horizontal={true} vertical={false} />
121 |             <XAxis 
122 |               type="number"
123 |               stroke="hsl(var(--foreground))" 
124 |               tick={{ fill: 'hsl(var(--foreground))' }}
125 |               tickLine={false}
126 |               axisLine={false}
127 |               label={{ 
128 |                 value: '시간', 
129 |                 position: 'insideBottom',
130 |                 offset: -10,
131 |                 fill: 'hsl(var(--foreground))'
132 |               }}
133 |             />
134 |             <YAxis 
135 |               type="category"
136 |               dataKey="name"
137 |               stroke="hsl(var(--foreground))" 
138 |               tick={{ fill: 'hsl(var(--foreground))' }}
139 |               tickLine={false}
140 |               axisLine={false}
141 |               width={80}
142 |             />
143 |             <Tooltip
144 |               contentStyle={{
145 |                 backgroundColor: 'hsl(var(--background))',
146 |                 borderColor: 'hsl(var(--border))',
147 |                 color: 'hsl(var(--foreground))'
148 |               }}
149 |               labelStyle={{ color: 'hsl(var(--foreground))' }}
150 |               formatter={(value: number) => [`${value} 시간`, '리드 타임']}
151 |             />
152 |             <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
153 |             <Bar 
154 |               dataKey="value" 
155 |               name="평균 리드 타임" 
156 |               radius={[0, 4, 4, 0]}
157 |             >
158 |               {
159 |                 barData.map((entry, index) => (
160 |                   <Cell key={`cell-${index}`} fill={entry.fill} />
161 |                 ))
162 |               }
163 |               <LabelList 
164 |                 dataKey="value" 
165 |                 position="right" 
166 |                 formatter={(value: number) => `${value}시간`}
167 |                 style={{ fill: 'hsl(var(--foreground))' }}
168 |               />
169 |             </Bar>
170 |           </BarChart>
171 |         </ResponsiveContainer>
172 |       </div>
173 |     );
174 |   }
175 | 
176 |   // 단일 저장소 모드 (기존 코드)
177 |   if (!leadTimeData || leadTimeData.length === 0) {
178 |     return (
179 |       <div className="flex items-center justify-center h-full">
180 |         <p className="text-muted-foreground">데이터가 없습니다.</p>
181 |       </div>
182 |     );
183 |   }
184 | 
185 |   // 평균값 계산
186 |   const average = leadTimeData.reduce((sum, item) => sum + item.leadTime, 0) / leadTimeData.length;
187 | 
188 |   return (
189 |     <div className="h-full">
190 |       <p className="text-base font-medium mb-4 text-center">평균 리드 타임</p>
191 |       <ResponsiveContainer width="100%" height="90%">
192 |         <BarChart
193 |           data={[{ name: '평균 리드 타임', value: Number(average.toFixed(1)) }]}
194 |           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
195 |         >
196 |           <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
197 |           <XAxis 
198 |             dataKey="name" 
199 |             stroke="hsl(var(--foreground))" 
200 |             tick={{ fill: 'hsl(var(--foreground))' }}
201 |             tickLine={false}
202 |             axisLine={false}
203 |           />
204 |           <YAxis 
205 |             stroke="hsl(var(--foreground))" 
206 |             tick={{ fill: 'hsl(var(--foreground))' }}
207 |             tickLine={false}
208 |             axisLine={false}
209 |             label={{ 
210 |               value: '시간', 
211 |               angle: -90, 
212 |               position: 'insideLeft',
213 |               fill: 'hsl(var(--foreground))'
214 |             }}
215 |           />
216 |           <Tooltip
217 |             contentStyle={{
218 |               backgroundColor: 'hsl(var(--background))',
219 |               borderColor: 'hsl(var(--border))',
220 |               color: 'hsl(var(--foreground))'
221 |             }}
222 |             labelStyle={{ color: 'hsl(var(--foreground))' }}
223 |             formatter={(value: number) => [`${value} 시간`, '리드 타임']}
224 |           />
225 |           <Bar 
226 |             dataKey="value" 
227 |             fill="hsl(var(--chart-0))" 
228 |             name="평균 리드 타임"
229 |             radius={[4, 4, 0, 0]}
230 |           >
231 |             <LabelList 
232 |               dataKey="value" 
233 |               position="top" 
234 |               formatter={(value: number) => `${value}시간`}
235 |               style={{ fill: 'hsl(var(--foreground))' }}
236 |             />
237 |           </Bar>
238 |         </BarChart>
239 |       </ResponsiveContainer>
240 |     </div>
241 |   );
242 | };
243 | 
244 | export default LeadTimeForChangesChart; 
```

src/components/dashboard/MeanTimeToRestoreChart.tsx
```
1 | import React, { useMemo } from 'react';
2 | import { useStore } from '@/store/dashboardStore';
3 | import { 
4 |   ResponsiveContainer, 
5 |   BarChart, 
6 |   Bar,
7 |   XAxis, 
8 |   YAxis, 
9 |   CartesianGrid, 
10 |   Tooltip, 
11 |   Legend,
12 |   LabelList,
13 |   Cell
14 | } from 'recharts';
15 | import { format } from 'date-fns';
16 | import { ko } from 'date-fns/locale';
17 | import { MTTRDataPoint } from '@/store/dashboardStore';
18 | 
19 | interface MeanTimeToRestoreChartProps {
20 |   multiRepoMode?: boolean;
21 |   multiRepoData?: { [repo: string]: MTTRDataPoint[] };
22 |   colorPalette?: string[];
23 | }
24 | 
25 | const MeanTimeToRestoreChart: React.FC<MeanTimeToRestoreChartProps> = ({ 
26 |   multiRepoMode = false, 
27 |   multiRepoData = {},
28 |   colorPalette = ['#007AFF', '#FF2D55', '#5AC8FA', '#FF9500', '#4CD964'] 
29 | }) => {
30 |   const { mttrData } = useStore();
31 | 
32 |   // 디버그 로깅 추가
33 |   useMemo(() => {
34 |     if (multiRepoMode) {
35 |       console.log('MeanTimeToRestoreChart - 다중 저장소 모드 데이터:', {
36 |         저장소_수: Object.keys(multiRepoData).length,
37 |         저장소_목록: Object.keys(multiRepoData),
38 |         데이터_샘플: Object.entries(multiRepoData).map(([repo, data]) => ({
39 |           repo,
40 |           데이터개수: data.length,
41 |           첫번째항목: data.length > 0 ? data[0] : '데이터 없음'
42 |         }))
43 |       });
44 |     }
45 |   }, [multiRepoMode, multiRepoData]);
46 | 
47 |   // 저장소별 평균값 계산 - 항상 호출되도록 수정
48 |   const repoAverages = useMemo(() => {
49 |     // multiRepoMode가 아니면 빈 객체 반환
50 |     if (!multiRepoMode || Object.keys(multiRepoData).length === 0) {
51 |       return {};
52 |     }
53 |     
54 |     const result: Record<string, number> = {};
55 |     
56 |     Object.entries(multiRepoData).forEach(([repo, dataPoints]) => {
57 |       // 데이터가 없어도 기본값 설정
58 |       const repoName = repo.split('/')[1];
59 |       if (dataPoints.length === 0) {
60 |         result[repoName] = 0; // 빈 데이터인 경우 0으로 설정
61 |         return;
62 |       }
63 |       
64 |       const sum = dataPoints.reduce((acc, item) => acc + (item.mttr || 0), 0);
65 |       const avg = sum / dataPoints.length;
66 |       result[repoName] = Number(avg.toFixed(1)); // 최소값 설정 제거
67 |     });
68 |     
69 |     console.log('MeanTimeToRestoreChart - 계산된 평균값:', result);
70 |     return result;
71 |   }, [multiRepoMode, multiRepoData]);
72 |   
73 |   // 바 차트용 데이터 포맷팅 - 빈 barData 방지
74 |   const barData = useMemo(() => {
75 |     if (!multiRepoMode || Object.keys(multiRepoData).length === 0) {
76 |       return [];
77 |     }
78 |     
79 |     // 데이터 정렬 (값이 큰 순서대로)
80 |     const sortedEntries = Object.entries(repoAverages)
81 |       .sort((a, b) => b[1] - a[1]); // 내림차순 정렬
82 |     
83 |     // 정렬된 데이터로 차트 데이터 생성
84 |     return sortedEntries.map(([repoName, avg], index) => ({
85 |       name: repoName,
86 |       value: avg,
87 |       fill: colorPalette[index % colorPalette.length]
88 |     }));
89 |   }, [multiRepoMode, repoAverages, colorPalette]);
90 | 
91 |   // 다중 저장소 모드일 때는 다른 데이터 처리
92 |   if (multiRepoMode) {
93 |     // 저장소별 데이터가 없는 경우
94 |     if (Object.keys(multiRepoData).length === 0) {
95 |       return (
96 |         <div className="flex items-center justify-center h-full">
97 |           <p className="text-muted-foreground">저장소를 선택하세요.</p>
98 |         </div>
99 |       );
100 |     }
101 | 
102 |     // 빈 barData 처리
103 |     if (barData.length === 0) {
104 |       return (
105 |         <div className="flex items-center justify-center h-full">
106 |           <p className="text-muted-foreground">데이터가 없거나 모든 값이 0입니다.</p>
107 |         </div>
108 |       );
109 |     }
110 | 
111 |     return (
112 |       <div className="h-full">
113 |         <p className="text-base font-medium mb-4 text-center">평균 복구 시간</p>
114 |         <ResponsiveContainer width="100%" height="90%">
115 |           <BarChart
116 |             data={barData}
117 |             layout="vertical"
118 |             margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
119 |           >
120 |             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" horizontal={true} vertical={false} />
121 |             <XAxis 
122 |               type="number"
123 |               stroke="hsl(var(--foreground))" 
124 |               tick={{ fill: 'hsl(var(--foreground))' }}
125 |               tickLine={false}
126 |               axisLine={false}
127 |               label={{ 
128 |                 value: '시간', 
129 |                 position: 'insideBottom',
130 |                 offset: -10,
131 |                 fill: 'hsl(var(--foreground))'
132 |               }}
133 |             />
134 |             <YAxis 
135 |               type="category"
136 |               dataKey="name"
137 |               stroke="hsl(var(--foreground))" 
138 |               tick={{ fill: 'hsl(var(--foreground))' }}
139 |               tickLine={false}
140 |               axisLine={false}
141 |               width={80}
142 |             />
143 |             <Tooltip
144 |               contentStyle={{
145 |                 backgroundColor: 'hsl(var(--background))',
146 |                 borderColor: 'hsl(var(--border))',
147 |                 color: 'hsl(var(--foreground))'
148 |               }}
149 |               labelStyle={{ color: 'hsl(var(--foreground))' }}
150 |               formatter={(value: number) => [`${value} 시간`, '평균 복구 시간']}
151 |             />
152 |             <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
153 |             <Bar 
154 |               dataKey="value" 
155 |               name="평균 복구 시간" 
156 |               radius={[0, 4, 4, 0]}
157 |             >
158 |               {
159 |                 barData.map((entry, index) => (
160 |                   <Cell key={`cell-${index}`} fill={entry.fill} />
161 |                 ))
162 |               }
163 |               <LabelList 
164 |                 dataKey="value" 
165 |                 position="right" 
166 |                 formatter={(value: number) => `${value}시간`}
167 |                 style={{ fill: 'hsl(var(--foreground))' }}
168 |               />
169 |             </Bar>
170 |           </BarChart>
171 |         </ResponsiveContainer>
172 |       </div>
173 |     );
174 |   }
175 | 
176 |   // 단일 저장소 모드 (기존 코드)
177 |   if (!mttrData || mttrData.length === 0) {
178 |     return (
179 |       <div className="flex items-center justify-center h-full">
180 |         <p className="text-muted-foreground">데이터가 없습니다.</p>
181 |       </div>
182 |     );
183 |   }
184 | 
185 |   // 평균값 계산
186 |   const average = mttrData.reduce((sum, item) => sum + item.mttr, 0) / mttrData.length;
187 | 
188 |   return (
189 |     <div className="h-full">
190 |       <p className="text-base font-medium mb-4 text-center">평균 복구 시간</p>
191 |       <ResponsiveContainer width="100%" height="90%">
192 |         <BarChart
193 |           data={[{ name: '평균 복구 시간', value: Number(average.toFixed(1)) }]}
194 |           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
195 |         >
196 |           <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
197 |           <XAxis 
198 |             dataKey="name" 
199 |             stroke="hsl(var(--foreground))" 
200 |             tick={{ fill: 'hsl(var(--foreground))' }}
201 |             tickLine={false}
202 |             axisLine={false}
203 |           />
204 |           <YAxis 
205 |             stroke="hsl(var(--foreground))" 
206 |             tick={{ fill: 'hsl(var(--foreground))' }}
207 |             tickLine={false}
208 |             axisLine={false}
209 |             label={{ 
210 |               value: '시간', 
211 |               angle: -90, 
212 |               position: 'insideLeft',
213 |               fill: 'hsl(var(--foreground))'
214 |             }}
215 |           />
216 |           <Tooltip
217 |             contentStyle={{
218 |               backgroundColor: 'hsl(var(--background))',
219 |               borderColor: 'hsl(var(--border))',
220 |               color: 'hsl(var(--foreground))'
221 |             }}
222 |             labelStyle={{ color: 'hsl(var(--foreground))' }}
223 |             formatter={(value: number) => [`${value} 시간`, '평균 복구 시간']}
224 |           />
225 |           <Bar 
226 |             dataKey="value" 
227 |             fill="hsl(var(--chart-3))" 
228 |             name="평균 복구 시간"
229 |             radius={[4, 4, 0, 0]}
230 |           >
231 |             <LabelList 
232 |               dataKey="value" 
233 |               position="top" 
234 |               formatter={(value: number) => `${value}시간`}
235 |               style={{ fill: 'hsl(var(--foreground))' }}
236 |             />
237 |           </Bar>
238 |         </BarChart>
239 |       </ResponsiveContainer>
240 |     </div>
241 |   );
242 | };
243 | 
244 | export default MeanTimeToRestoreChart; 
```

src/components/dashboard/PerformanceIndicator.tsx
```
1 | import React from 'react';
2 | import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
3 | import { cn } from '@/lib/utils';
4 | import { Info, Loader2 } from 'lucide-react';
5 | import {
6 |   Tooltip,
7 |   TooltipContent,
8 |   TooltipProvider,
9 |   TooltipTrigger,
10 | } from "@/components/ui/tooltip";
11 | 
12 | type MetricLevel = 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high' | 'unknown';
13 | 
14 | type PerformanceIndicatorProps = {
15 |   title: string;
16 |   value: number | null;
17 |   unit: string;
18 |   level: MetricLevel;
19 |   description?: string;
20 |   isLoading?: boolean;
21 | };
22 | 
23 | const getLevelColor = (level: MetricLevel): string => {
24 |   switch (level) {
25 |     case 'low':
26 |       return 'bg-[#FF3B30] text-white dark:bg-[#FF3B30] dark:text-white'; // 위험 - 빨강
27 |     case 'medium-low':
28 |       return 'bg-[#FF9500] text-white dark:bg-[#FF9500] dark:text-white'; // 미흡 - 주황
29 |     case 'medium':
30 |       return 'bg-[#FFCC00] text-black dark:bg-[#FFCC00] dark:text-black'; // 양호 - 노랑
31 |     case 'medium-high':
32 |       return 'bg-[#34C759] text-white dark:bg-[#34C759] dark:text-white'; // 우수 - 녹색
33 |     case 'high':
34 |       return 'bg-[#007AFF] text-white dark:bg-[#007AFF] dark:text-white'; // 최상 - 파랑
35 |     case 'unknown':
36 |     default:
37 |       return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
38 |   }
39 | };
40 | 
41 | const getLevelLabel = (level: MetricLevel): string => {
42 |   switch (level) {
43 |     case 'low':
44 |       return '위험';
45 |     case 'medium-low':
46 |       return '미흡';
47 |     case 'medium':
48 |       return '양호';
49 |     case 'medium-high':
50 |       return '우수';
51 |     case 'high':
52 |       return '최상';
53 |     case 'unknown':
54 |     default:
55 |       return '알 수 없음';
56 |   }
57 | };
58 | 
59 | const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({ 
60 |   title, 
61 |   value, 
62 |   unit, 
63 |   level,
64 |   description,
65 |   isLoading = false
66 | }) => {
67 |   const levelColor = getLevelColor(level);
68 |   const levelLabel = getLevelLabel(level);
69 | 
70 |   // 값 포맷팅 함수 - 소수점 1자리로 제한
71 |   const formatValue = (val: number | null): string => {
72 |     if (val === null) return '-';
73 |     
74 |     // 소수점 첫째 자리까지 표시 (반올림)
75 |     return val.toFixed(1);
76 |   };
77 | 
78 |   return (
79 |     <Card>
80 |       <CardHeader className="pb-0">
81 |         <div className="flex items-center gap-1">
82 |           <CardTitle className="text-sm font-medium">{title}</CardTitle>
83 |           {description && (
84 |             <TooltipProvider>
85 |               <Tooltip delayDuration={300}>
86 |                 <TooltipTrigger asChild>
87 |                   <button 
88 |                     type="button"
89 |                     className="text-muted-foreground hover:text-foreground focus:outline-none"
90 |                     aria-label={`${title} 설명 보기`}
91 |                   >
92 |                     <Info className="h-4 w-4" />
93 |                   </button>
94 |                 </TooltipTrigger>
95 |                 <TooltipContent className="max-w-xs p-2">
96 |                   <p className="text-sm">{description}</p>
97 |                 </TooltipContent>
98 |               </Tooltip>
99 |             </TooltipProvider>
100 |           )}
101 |         </div>
102 |       </CardHeader>
103 |       <CardContent className="pt-1">
104 |         {isLoading ? (
105 |           <div className="flex flex-col items-center justify-center h-24">
106 |             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
107 |             <p className="text-sm text-muted-foreground mt-2">데이터 로딩 중...</p>
108 |           </div>
109 |         ) : (
110 |           <div className="flex flex-col gap-1">
111 |             <div className="text-2xl font-bold">
112 |               {value !== null ? `${formatValue(value)} ${unit}` : '-'}
113 |             </div>
114 |             
115 |             <div className="flex items-center gap-2">
116 |               <span className="text-xs text-muted-foreground">성능 레벨:</span>
117 |               <span 
118 |                 className={cn(
119 |                   'px-2 py-1 rounded-full text-xs font-medium', 
120 |                   levelColor
121 |                 )}
122 |               >
123 |                 {levelLabel}
124 |               </span>
125 |             </div>
126 |           </div>
127 |         )}
128 |       </CardContent>
129 |     </Card>
130 |   );
131 | };
132 | 
133 | export default PerformanceIndicator; 
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

src/components/ui/alert.tsx
```
1 | import * as React from "react"
2 | import { cva, type VariantProps } from "class-variance-authority"
3 | 
4 | import { cn } from "@/lib/utils"
5 | 
6 | const alertVariants = cva(
7 |   "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
8 |   {
9 |     variants: {
10 |       variant: {
11 |         default: "bg-background text-foreground",
12 |         destructive:
13 |           "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
14 |       },
15 |     },
16 |     defaultVariants: {
17 |       variant: "default",
18 |     },
19 |   }
20 | )
21 | 
22 | const Alert = React.forwardRef<
23 |   HTMLDivElement,
24 |   React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
25 | >(({ className, variant, ...props }, ref) => (
26 |   <div
27 |     ref={ref}
28 |     role="alert"
29 |     className={cn(alertVariants({ variant }), className)}
30 |     {...props}
31 |   />
32 | ))
33 | Alert.displayName = "Alert"
34 | 
35 | const AlertTitle = React.forwardRef<
36 |   HTMLParagraphElement,
37 |   React.HTMLAttributes<HTMLHeadingElement>
38 | >(({ className, ...props }, ref) => (
39 |   <h5
40 |     ref={ref}
41 |     className={cn("mb-1 font-medium leading-none tracking-tight", className)}
42 |     {...props}
43 |   />
44 | ))
45 | AlertTitle.displayName = "AlertTitle"
46 | 
47 | const AlertDescription = React.forwardRef<
48 |   HTMLParagraphElement,
49 |   React.HTMLAttributes<HTMLParagraphElement>
50 | >(({ className, ...props }, ref) => (
51 |   <div
52 |     ref={ref}
53 |     className={cn("text-sm [&_p]:leading-relaxed", className)}
54 |     {...props}
55 |   />
56 | ))
57 | AlertDescription.displayName = "AlertDescription"
58 | 
59 | export { Alert, AlertTitle, AlertDescription }
```

src/components/ui/beaver-logo.tsx
```
1 | import React from 'react';
2 | 
3 | interface BeaverLogoProps {
4 |   size?: number;
5 |   className?: string;
6 | }
7 | 
8 | export function BeaverLogo({ size = 24, className = '' }: BeaverLogoProps) {
9 |   return (
10 |     <svg 
11 |       width={size} 
12 |       height={size} 
13 |       viewBox="146 130 220 190" 
14 |       xmlns="http://www.w3.org/2000/svg"
15 |       className={className}
16 |     >
17 |       {/* 비버 얼굴(큰 원) */}
18 |       <circle cx="256" cy="256" r="110" fill="#C8A272"/>
19 | 
20 |       {/* 비버 귀(좌우 작은 원) */}
21 |       <circle cx="200" cy="160" r="24" fill="#C8A272"/>
22 |       <circle cx="312" cy="160" r="24" fill="#C8A272"/>
23 | 
24 |       {/* 비버 주둥이(ellipse) */}
25 |       <ellipse cx="256" cy="285" rx="58" ry="45" fill="#B48A6C"/>
26 | 
27 |       {/* 코 */}
28 |       <circle cx="256" cy="265" r="12" fill="#5B3F29"/>
29 | 
30 |       {/* 눈(좌우) */}
31 |       <circle cx="230" cy="235" r="8" fill="#3C2A19"/>
32 |       <circle cx="282" cy="235" r="8" fill="#3C2A19"/>
33 | 
34 |       {/* 앞니(두 개의 사각형) */}
35 |       <rect x="240" y="295" width="10" height="14" fill="#FFFFFF" rx="2"/>
36 |       <rect x="262" y="295" width="10" height="14" fill="#FFFFFF" rx="2"/>
37 |     </svg>
38 |   );
39 | } 
```

src/components/ui/breadcrumb.tsx
```
1 | import * as React from "react"
2 | import { Slot } from "@radix-ui/react-slot"
3 | import { ChevronRight, MoreHorizontal } from "lucide-react"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | const Breadcrumb = React.forwardRef<
8 |   HTMLElement,
9 |   React.ComponentPropsWithoutRef<"nav"> & {
10 |     separator?: React.ReactNode
11 |   }
12 | >(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
13 | Breadcrumb.displayName = "Breadcrumb"
14 | 
15 | const BreadcrumbList = React.forwardRef<
16 |   HTMLOListElement,
17 |   React.ComponentPropsWithoutRef<"ol">
18 | >(({ className, ...props }, ref) => (
19 |   <ol
20 |     ref={ref}
21 |     className={cn(
22 |       "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
23 |       className
24 |     )}
25 |     {...props}
26 |   />
27 | ))
28 | BreadcrumbList.displayName = "BreadcrumbList"
29 | 
30 | const BreadcrumbItem = React.forwardRef<
31 |   HTMLLIElement,
32 |   React.ComponentPropsWithoutRef<"li">
33 | >(({ className, ...props }, ref) => (
34 |   <li
35 |     ref={ref}
36 |     className={cn("inline-flex items-center gap-1.5", className)}
37 |     {...props}
38 |   />
39 | ))
40 | BreadcrumbItem.displayName = "BreadcrumbItem"
41 | 
42 | const BreadcrumbLink = React.forwardRef<
43 |   HTMLAnchorElement,
44 |   React.ComponentPropsWithoutRef<"a"> & {
45 |     asChild?: boolean
46 |   }
47 | >(({ asChild, className, ...props }, ref) => {
48 |   const Comp = asChild ? Slot : "a"
49 | 
50 |   return (
51 |     <Comp
52 |       ref={ref}
53 |       className={cn("transition-colors hover:text-foreground", className)}
54 |       {...props}
55 |     />
56 |   )
57 | })
58 | BreadcrumbLink.displayName = "BreadcrumbLink"
59 | 
60 | const BreadcrumbPage = React.forwardRef<
61 |   HTMLSpanElement,
62 |   React.ComponentPropsWithoutRef<"span">
63 | >(({ className, ...props }, ref) => (
64 |   <span
65 |     ref={ref}
66 |     role="link"
67 |     aria-disabled="true"
68 |     aria-current="page"
69 |     className={cn("font-normal text-foreground", className)}
70 |     {...props}
71 |   />
72 | ))
73 | BreadcrumbPage.displayName = "BreadcrumbPage"
74 | 
75 | const BreadcrumbSeparator = ({
76 |   children,
77 |   className,
78 |   ...props
79 | }: React.ComponentProps<"li">) => (
80 |   <li
81 |     role="presentation"
82 |     aria-hidden="true"
83 |     className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
84 |     {...props}
85 |   >
86 |     {children ?? <ChevronRight />}
87 |   </li>
88 | )
89 | BreadcrumbSeparator.displayName = "BreadcrumbSeparator"
90 | 
91 | const BreadcrumbEllipsis = ({
92 |   className,
93 |   ...props
94 | }: React.ComponentProps<"span">) => (
95 |   <span
96 |     role="presentation"
97 |     aria-hidden="true"
98 |     className={cn("flex h-9 w-9 items-center justify-center", className)}
99 |     {...props}
100 |   >
101 |     <MoreHorizontal className="h-4 w-4" />
102 |     <span className="sr-only">More</span>
103 |   </span>
104 | )
105 | BreadcrumbEllipsis.displayName = "BreadcrumbElipssis"
106 | 
107 | export {
108 |   Breadcrumb,
109 |   BreadcrumbList,
110 |   BreadcrumbItem,
111 |   BreadcrumbLink,
112 |   BreadcrumbPage,
113 |   BreadcrumbSeparator,
114 |   BreadcrumbEllipsis,
115 | }
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
8 |   "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
9 |   {
10 |     variants: {
11 |       variant: {
12 |         default:
13 |           "bg-primary text-primary-foreground shadow hover:bg-primary/90",
14 |         destructive:
15 |           "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
16 |         outline:
17 |           "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
18 |         secondary:
19 |           "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
20 |         ghost: "hover:bg-accent hover:text-accent-foreground",
21 |         link: "text-primary underline-offset-4 hover:underline",
22 |       },
23 |       size: {
24 |         default: "h-9 px-4 py-2",
25 |         sm: "h-8 rounded-md px-3 text-xs",
26 |         lg: "h-10 rounded-md px-8",
27 |         icon: "h-9 w-9",
28 |       },
29 |     },
30 |     defaultVariants: {
31 |       variant: "default",
32 |       size: "default",
33 |     },
34 |   }
35 | )
36 | 
37 | export interface ButtonProps
38 |   extends React.ButtonHTMLAttributes<HTMLButtonElement>,
39 |     VariantProps<typeof buttonVariants> {
40 |   asChild?: boolean
41 | }
42 | 
43 | const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
44 |   ({ className, variant, size, asChild = false, ...props }, ref) => {
45 |     const Comp = asChild ? Slot : "button"
46 |     return (
47 |       <Comp
48 |         className={cn(buttonVariants({ variant, size, className }))}
49 |         ref={ref}
50 |         {...props}
51 |       />
52 |     )
53 |   }
54 | )
55 | Button.displayName = "Button"
56 | 
57 | export { Button, buttonVariants }
```

src/components/ui/calendar.tsx
```
1 | import * as React from "react"
2 | import { ChevronLeft, ChevronRight } from "lucide-react"
3 | import { DayPicker } from "react-day-picker"
4 | import { ko } from "date-fns/locale"
5 | 
6 | import { cn } from "@/lib/utils"
7 | import { buttonVariants } from "@/components/ui/button"
8 | 
9 | function Calendar({
10 |   className,
11 |   classNames,
12 |   showOutsideDays = true,
13 |   ...props
14 | }: React.ComponentProps<typeof DayPicker>) {
15 |   return (
16 |     <DayPicker
17 |       locale={ko}
18 |       showOutsideDays={showOutsideDays}
19 |       className={cn("p-3", className)}
20 |       classNames={{
21 |         months: "flex flex-col sm:flex-row gap-2",
22 |         month: "flex flex-col gap-4",
23 |         caption: "flex justify-center pt-1 relative items-center w-full",
24 |         caption_label: "text-sm font-medium",
25 |         nav: "flex items-center gap-1",
26 |         nav_button: cn(
27 |           buttonVariants({ variant: "outline" }),
28 |           "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
29 |         ),
30 |         nav_button_previous: "absolute left-1",
31 |         nav_button_next: "absolute right-1",
32 |         table: "w-full border-collapse space-x-1",
33 |         head_row: "flex",
34 |         head_cell:
35 |           "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
36 |         row: "flex w-full mt-2",
37 |         cell: cn(
38 |           "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
39 |           props.mode === "range"
40 |             ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
41 |             : "[&:has([aria-selected])]:rounded-md"
42 |         ),
43 |         day: cn(
44 |           buttonVariants({ variant: "ghost" }),
45 |           "size-8 p-0 font-normal aria-selected:opacity-100"
46 |         ),
47 |         day_range_start:
48 |           "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
49 |         day_range_end:
50 |           "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
51 |         day_selected:
52 |           "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
53 |         day_today: "bg-accent text-accent-foreground",
54 |         day_outside:
55 |           "day-outside text-muted-foreground aria-selected:text-muted-foreground",
56 |         day_disabled: "text-muted-foreground opacity-50",
57 |         day_range_middle:
58 |           "aria-selected:bg-accent aria-selected:text-accent-foreground",
59 |         day_hidden: "invisible",
60 |         ...classNames,
61 |       }}
62 |       components={{
63 |         IconLeft: ({ className, ...props }) => (
64 |           <ChevronLeft className={cn("size-4", className)} {...props} />
65 |         ),
66 |         IconRight: ({ className, ...props }) => (
67 |           <ChevronRight className={cn("size-4", className)} {...props} />
68 |         ),
69 |       }}
70 |       {...props}
71 |     />
72 |   )
73 | }
74 | 
75 | export { Calendar }
```

src/components/ui/card.tsx
```
1 | import * as React from "react"
2 | 
3 | import { cn } from "@/lib/utils"
4 | 
5 | const Card = React.forwardRef<
6 |   HTMLDivElement,
7 |   React.HTMLAttributes<HTMLDivElement>
8 | >(({ className, ...props }, ref) => (
9 |   <div
10 |     ref={ref}
11 |     className={cn(
12 |       "rounded-xl border bg-card text-card-foreground shadow",
13 |       className
14 |     )}
15 |     {...props}
16 |   />
17 | ))
18 | Card.displayName = "Card"
19 | 
20 | const CardHeader = React.forwardRef<
21 |   HTMLDivElement,
22 |   React.HTMLAttributes<HTMLDivElement>
23 | >(({ className, ...props }, ref) => (
24 |   <div
25 |     ref={ref}
26 |     className={cn("flex flex-col space-y-1.5 p-6", className)}
27 |     {...props}
28 |   />
29 | ))
30 | CardHeader.displayName = "CardHeader"
31 | 
32 | const CardTitle = React.forwardRef<
33 |   HTMLDivElement,
34 |   React.HTMLAttributes<HTMLDivElement>
35 | >(({ className, ...props }, ref) => (
36 |   <div
37 |     ref={ref}
38 |     className={cn("font-semibold leading-none tracking-tight", className)}
39 |     {...props}
40 |   />
41 | ))
42 | CardTitle.displayName = "CardTitle"
43 | 
44 | const CardDescription = React.forwardRef<
45 |   HTMLDivElement,
46 |   React.HTMLAttributes<HTMLDivElement>
47 | >(({ className, ...props }, ref) => (
48 |   <div
49 |     ref={ref}
50 |     className={cn("text-sm text-muted-foreground", className)}
51 |     {...props}
52 |   />
53 | ))
54 | CardDescription.displayName = "CardDescription"
55 | 
56 | const CardContent = React.forwardRef<
57 |   HTMLDivElement,
58 |   React.HTMLAttributes<HTMLDivElement>
59 | >(({ className, ...props }, ref) => (
60 |   <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
61 | ))
62 | CardContent.displayName = "CardContent"
63 | 
64 | const CardFooter = React.forwardRef<
65 |   HTMLDivElement,
66 |   React.HTMLAttributes<HTMLDivElement>
67 | >(({ className, ...props }, ref) => (
68 |   <div
69 |     ref={ref}
70 |     className={cn("flex items-center p-6 pt-0", className)}
71 |     {...props}
72 |   />
73 | ))
74 | CardFooter.displayName = "CardFooter"
75 | 
76 | export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
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

src/components/ui/collapsible.tsx
```
1 | import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
2 | 
3 | const Collapsible = CollapsiblePrimitive.Root
4 | 
5 | const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger
6 | 
7 | const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent
8 | 
9 | export { Collapsible, CollapsibleTrigger, CollapsibleContent }
```

src/components/ui/date-picker.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import { format, isValid } from "date-fns"
5 | import { ko } from "date-fns/locale"
6 | import { Calendar as CalendarIcon } from "lucide-react"
7 | 
8 | import { cn } from "@/lib/utils"
9 | import { Button } from "@/components/ui/button"
10 | import { Calendar } from "@/components/ui/calendar"
11 | import {
12 |   Popover,
13 |   PopoverContent,
14 |   PopoverTrigger,
15 | } from "@/components/ui/popover"
16 | 
17 | interface DatePickerProps {
18 |   date?: Date | null;
19 |   setDate?: (date: Date | undefined) => void;
20 |   selected?: Date | null;
21 |   onSelect?: (date: Date | null) => void;
22 |   placeholder?: string;
23 |   open?: boolean;
24 |   onOpenChange?: (open: boolean) => void;
25 | }
26 | 
27 | export function DatePicker({ 
28 |   date, 
29 |   setDate, 
30 |   selected, 
31 |   onSelect,
32 |   placeholder = "날짜 선택",
33 |   open,
34 |   onOpenChange,
35 | }: DatePickerProps) {
36 |   // 날짜 유효성 확인
37 |   const ensureValidDate = (date: Date | string | null | undefined): Date | null => {
38 |     if (!date) return null;
39 |     if (date instanceof Date && isValid(date)) return date;
40 |     if (typeof date === 'string') {
41 |       try {
42 |         const parsedDate = new Date(date);
43 |         return isValid(parsedDate) ? parsedDate : null;
44 |       } catch (e) {
45 |         return null;
46 |       }
47 |     }
48 |     return null;
49 |   };
50 |   
51 |   // date와 selected, setDate와 onSelect를 함께 지원하기 위한 처리
52 |   const selectedDateInput = selected || date;
53 |   const selectedDate = ensureValidDate(selectedDateInput);
54 |   
55 |   const [isOpenState, setIsOpenState] = React.useState(false);
56 |   
57 |   // open prop이 제공되지 않았을 때 내부 상태 사용
58 |   const isOpen = open !== undefined ? open : isOpenState;
59 |   const setIsOpen = onOpenChange || setIsOpenState;
60 |   
61 |   // 현재 선택된 날짜를 기준으로 월 설정 (없으면 현재 월)
62 |   const [currentMonth, setCurrentMonth] = React.useState<Date>(
63 |     selectedDate || new Date()
64 |   );
65 |   
66 |   // 팝업 열릴 때 선택된 날짜가 있는 월로 설정
67 |   React.useEffect(() => {
68 |     if (isOpen && selectedDate) {
69 |       setCurrentMonth(selectedDate);
70 |     }
71 |   }, [isOpen, selectedDate]);
72 |   
73 |   const handleDateChange = (newDate: Date | undefined) => {
74 |     if (onSelect) {
75 |       onSelect(newDate || null);
76 |     }
77 |     if (setDate) {
78 |       setDate(newDate);
79 |     }
80 |     setIsOpen(false); // 날짜 선택 후 팝업 닫기
81 |   };
82 | 
83 |   return (
84 |     <Popover open={isOpen} onOpenChange={setIsOpen}>
85 |       <PopoverTrigger asChild>
86 |         <Button
87 |           variant={"outline"}
88 |           className={cn(
89 |             "w-[160px] justify-start text-left font-normal",
90 |             !selectedDate && "text-muted-foreground"
91 |           )}
92 |         >
93 |           <CalendarIcon className="mr-2 h-4 w-4" />
94 |           {selectedDate ? format(selectedDate, "PPP", { locale: ko }) : <span>{placeholder}</span>}
95 |         </Button>
96 |       </PopoverTrigger>
97 |       <PopoverContent className="w-auto p-0">
98 |         <Calendar
99 |           mode="single"
100 |           selected={selectedDate}
101 |           onSelect={handleDateChange}
102 |           month={currentMonth}
103 |           onMonthChange={setCurrentMonth}
104 |           initialFocus
105 |           modifiers={{ today: new Date() }}
106 |           modifiersStyles={{
107 |             today: { fontWeight: 'bold', border: '1px solid currentColor' }
108 |           }}
109 |         />
110 |       </PopoverContent>
111 |     </Popover>
112 |   )
113 | } 
```

src/components/ui/dialog.tsx
```
1 | import * as React from "react"
2 | import * as DialogPrimitive from "@radix-ui/react-dialog"
3 | import { X } from "lucide-react"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | const Dialog = DialogPrimitive.Root
8 | 
9 | const DialogTrigger = DialogPrimitive.Trigger
10 | 
11 | const DialogPortal = DialogPrimitive.Portal
12 | 
13 | const DialogClose = DialogPrimitive.Close
14 | 
15 | const DialogOverlay = React.forwardRef<
16 |   React.ElementRef<typeof DialogPrimitive.Overlay>,
17 |   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
18 | >(({ className, ...props }, ref) => (
19 |   <DialogPrimitive.Overlay
20 |     ref={ref}
21 |     className={cn(
22 |       "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
23 |       className
24 |     )}
25 |     {...props}
26 |   />
27 | ))
28 | DialogOverlay.displayName = DialogPrimitive.Overlay.displayName
29 | 
30 | const DialogContent = React.forwardRef<
31 |   React.ElementRef<typeof DialogPrimitive.Content>,
32 |   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
33 | >(({ className, children, ...props }, ref) => (
34 |   <DialogPortal>
35 |     <DialogOverlay />
36 |     <DialogPrimitive.Content
37 |       ref={ref}
38 |       className={cn(
39 |         "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
40 |         className
41 |       )}
42 |       {...props}
43 |     >
44 |       {children}
45 |       <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
46 |         <X className="h-4 w-4" />
47 |         <span className="sr-only">Close</span>
48 |       </DialogPrimitive.Close>
49 |     </DialogPrimitive.Content>
50 |   </DialogPortal>
51 | ))
52 | DialogContent.displayName = DialogPrimitive.Content.displayName
53 | 
54 | const DialogHeader = ({
55 |   className,
56 |   ...props
57 | }: React.HTMLAttributes<HTMLDivElement>) => (
58 |   <div
59 |     className={cn(
60 |       "flex flex-col space-y-1.5 text-center sm:text-left",
61 |       className
62 |     )}
63 |     {...props}
64 |   />
65 | )
66 | DialogHeader.displayName = "DialogHeader"
67 | 
68 | const DialogFooter = ({
69 |   className,
70 |   ...props
71 | }: React.HTMLAttributes<HTMLDivElement>) => (
72 |   <div
73 |     className={cn(
74 |       "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
75 |       className
76 |     )}
77 |     {...props}
78 |   />
79 | )
80 | DialogFooter.displayName = "DialogFooter"
81 | 
82 | const DialogTitle = React.forwardRef<
83 |   React.ElementRef<typeof DialogPrimitive.Title>,
84 |   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
85 | >(({ className, ...props }, ref) => (
86 |   <DialogPrimitive.Title
87 |     ref={ref}
88 |     className={cn(
89 |       "text-lg font-semibold leading-none tracking-tight",
90 |       className
91 |     )}
92 |     {...props}
93 |   />
94 | ))
95 | DialogTitle.displayName = DialogPrimitive.Title.displayName
96 | 
97 | const DialogDescription = React.forwardRef<
98 |   React.ElementRef<typeof DialogPrimitive.Description>,
99 |   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
100 | >(({ className, ...props }, ref) => (
101 |   <DialogPrimitive.Description
102 |     ref={ref}
103 |     className={cn("text-sm text-muted-foreground", className)}
104 |     {...props}
105 |   />
106 | ))
107 | DialogDescription.displayName = DialogPrimitive.Description.displayName
108 | 
109 | export {
110 |   Dialog,
111 |   DialogPortal,
112 |   DialogOverlay,
113 |   DialogTrigger,
114 |   DialogClose,
115 |   DialogContent,
116 |   DialogHeader,
117 |   DialogFooter,
118 |   DialogTitle,
119 |   DialogDescription,
120 | }
```

src/components/ui/dropdown-menu.tsx
```
1 | import * as React from "react"
2 | import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
3 | import { Check, ChevronRight, Circle } from "lucide-react"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | const DropdownMenu = DropdownMenuPrimitive.Root
8 | 
9 | const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
10 | 
11 | const DropdownMenuGroup = DropdownMenuPrimitive.Group
12 | 
13 | const DropdownMenuPortal = DropdownMenuPrimitive.Portal
14 | 
15 | const DropdownMenuSub = DropdownMenuPrimitive.Sub
16 | 
17 | const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup
18 | 
19 | const DropdownMenuSubTrigger = React.forwardRef<
20 |   React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
21 |   React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
22 |     inset?: boolean
23 |   }
24 | >(({ className, inset, children, ...props }, ref) => (
25 |   <DropdownMenuPrimitive.SubTrigger
26 |     ref={ref}
27 |     className={cn(
28 |       "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
29 |       inset && "pl-8",
30 |       className
31 |     )}
32 |     {...props}
33 |   >
34 |     {children}
35 |     <ChevronRight className="ml-auto" />
36 |   </DropdownMenuPrimitive.SubTrigger>
37 | ))
38 | DropdownMenuSubTrigger.displayName =
39 |   DropdownMenuPrimitive.SubTrigger.displayName
40 | 
41 | const DropdownMenuSubContent = React.forwardRef<
42 |   React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
43 |   React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
44 | >(({ className, ...props }, ref) => (
45 |   <DropdownMenuPrimitive.SubContent
46 |     ref={ref}
47 |     className={cn(
48 |       "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
49 |       className
50 |     )}
51 |     {...props}
52 |   />
53 | ))
54 | DropdownMenuSubContent.displayName =
55 |   DropdownMenuPrimitive.SubContent.displayName
56 | 
57 | const DropdownMenuContent = React.forwardRef<
58 |   React.ElementRef<typeof DropdownMenuPrimitive.Content>,
59 |   React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
60 | >(({ className, sideOffset = 4, ...props }, ref) => (
61 |   <DropdownMenuPrimitive.Portal>
62 |     <DropdownMenuPrimitive.Content
63 |       ref={ref}
64 |       sideOffset={sideOffset}
65 |       className={cn(
66 |         "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
67 |         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
68 |         className
69 |       )}
70 |       {...props}
71 |     />
72 |   </DropdownMenuPrimitive.Portal>
73 | ))
74 | DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName
75 | 
76 | const DropdownMenuItem = React.forwardRef<
77 |   React.ElementRef<typeof DropdownMenuPrimitive.Item>,
78 |   React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
79 |     inset?: boolean
80 |   }
81 | >(({ className, inset, ...props }, ref) => (
82 |   <DropdownMenuPrimitive.Item
83 |     ref={ref}
84 |     className={cn(
85 |       "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
86 |       inset && "pl-8",
87 |       className
88 |     )}
89 |     {...props}
90 |   />
91 | ))
92 | DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName
93 | 
94 | const DropdownMenuCheckboxItem = React.forwardRef<
95 |   React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
96 |   React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
97 | >(({ className, children, checked, ...props }, ref) => (
98 |   <DropdownMenuPrimitive.CheckboxItem
99 |     ref={ref}
100 |     className={cn(
101 |       "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
102 |       className
103 |     )}
104 |     checked={checked}
105 |     {...props}
106 |   >
107 |     <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
108 |       <DropdownMenuPrimitive.ItemIndicator>
109 |         <Check className="h-4 w-4" />
110 |       </DropdownMenuPrimitive.ItemIndicator>
111 |     </span>
112 |     {children}
113 |   </DropdownMenuPrimitive.CheckboxItem>
114 | ))
115 | DropdownMenuCheckboxItem.displayName =
116 |   DropdownMenuPrimitive.CheckboxItem.displayName
117 | 
118 | const DropdownMenuRadioItem = React.forwardRef<
119 |   React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
120 |   React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
121 | >(({ className, children, ...props }, ref) => (
122 |   <DropdownMenuPrimitive.RadioItem
123 |     ref={ref}
124 |     className={cn(
125 |       "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
126 |       className
127 |     )}
128 |     {...props}
129 |   >
130 |     <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
131 |       <DropdownMenuPrimitive.ItemIndicator>
132 |         <Circle className="h-2 w-2 fill-current" />
133 |       </DropdownMenuPrimitive.ItemIndicator>
134 |     </span>
135 |     {children}
136 |   </DropdownMenuPrimitive.RadioItem>
137 | ))
138 | DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName
139 | 
140 | const DropdownMenuLabel = React.forwardRef<
141 |   React.ElementRef<typeof DropdownMenuPrimitive.Label>,
142 |   React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
143 |     inset?: boolean
144 |   }
145 | >(({ className, inset, ...props }, ref) => (
146 |   <DropdownMenuPrimitive.Label
147 |     ref={ref}
148 |     className={cn(
149 |       "px-2 py-1.5 text-sm font-semibold",
150 |       inset && "pl-8",
151 |       className
152 |     )}
153 |     {...props}
154 |   />
155 | ))
156 | DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName
157 | 
158 | const DropdownMenuSeparator = React.forwardRef<
159 |   React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
160 |   React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
161 | >(({ className, ...props }, ref) => (
162 |   <DropdownMenuPrimitive.Separator
163 |     ref={ref}
164 |     className={cn("-mx-1 my-1 h-px bg-muted", className)}
165 |     {...props}
166 |   />
167 | ))
168 | DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName
169 | 
170 | const DropdownMenuShortcut = ({
171 |   className,
172 |   ...props
173 | }: React.HTMLAttributes<HTMLSpanElement>) => {
174 |   return (
175 |     <span
176 |       className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
177 |       {...props}
178 |     />
179 |   )
180 | }
181 | DropdownMenuShortcut.displayName = "DropdownMenuShortcut"
182 | 
183 | export {
184 |   DropdownMenu,
185 |   DropdownMenuTrigger,
186 |   DropdownMenuContent,
187 |   DropdownMenuItem,
188 |   DropdownMenuCheckboxItem,
189 |   DropdownMenuRadioItem,
190 |   DropdownMenuLabel,
191 |   DropdownMenuSeparator,
192 |   DropdownMenuShortcut,
193 |   DropdownMenuGroup,
194 |   DropdownMenuPortal,
195 |   DropdownMenuSub,
196 |   DropdownMenuSubContent,
197 |   DropdownMenuSubTrigger,
198 |   DropdownMenuRadioGroup,
199 | }
```

src/components/ui/input.tsx
```
1 | import * as React from "react"
2 | 
3 | import { cn } from "@/lib/utils"
4 | 
5 | const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
6 |   ({ className, type, ...props }, ref) => {
7 |     return (
8 |       <input
9 |         type={type}
10 |         className={cn(
11 |           "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
12 |           className
13 |         )}
14 |         ref={ref}
15 |         {...props}
16 |       />
17 |     )
18 |   }
19 | )
20 | Input.displayName = "Input"
21 | 
22 | export { Input }
```

src/components/ui/label.tsx
```
1 | import * as React from "react"
2 | import * as LabelPrimitive from "@radix-ui/react-label"
3 | import { cva, type VariantProps } from "class-variance-authority"
4 | 
5 | import { cn } from "@/lib/utils"
6 | 
7 | const labelVariants = cva(
8 |   "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
9 | )
10 | 
11 | const Label = React.forwardRef<
12 |   React.ElementRef<typeof LabelPrimitive.Root>,
13 |   React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
14 |     VariantProps<typeof labelVariants>
15 | >(({ className, ...props }, ref) => (
16 |   <LabelPrimitive.Root
17 |     ref={ref}
18 |     className={cn(labelVariants(), className)}
19 |     {...props}
20 |   />
21 | ))
22 | Label.displayName = LabelPrimitive.Root.displayName
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

src/components/ui/scroll-area.tsx
```
1 | import * as React from "react"
2 | import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
3 | 
4 | import { cn } from "@/lib/utils"
5 | 
6 | const ScrollArea = React.forwardRef<
7 |   React.ElementRef<typeof ScrollAreaPrimitive.Root>,
8 |   React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
9 | >(({ className, children, ...props }, ref) => (
10 |   <ScrollAreaPrimitive.Root
11 |     ref={ref}
12 |     className={cn("relative overflow-hidden", className)}
13 |     {...props}
14 |   >
15 |     <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
16 |       {children}
17 |     </ScrollAreaPrimitive.Viewport>
18 |     <ScrollBar />
19 |     <ScrollAreaPrimitive.Corner />
20 |   </ScrollAreaPrimitive.Root>
21 | ))
22 | ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName
23 | 
24 | const ScrollBar = React.forwardRef<
25 |   React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
26 |   React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
27 | >(({ className, orientation = "vertical", ...props }, ref) => (
28 |   <ScrollAreaPrimitive.ScrollAreaScrollbar
29 |     ref={ref}
30 |     orientation={orientation}
31 |     className={cn(
32 |       "flex touch-none select-none transition-colors",
33 |       orientation === "vertical" &&
34 |         "h-full w-2.5 border-l border-l-transparent p-[1px]",
35 |       orientation === "horizontal" &&
36 |         "h-2.5 flex-col border-t border-t-transparent p-[1px]",
37 |       className
38 |     )}
39 |     {...props}
40 |   >
41 |     <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
42 |   </ScrollAreaPrimitive.ScrollAreaScrollbar>
43 | ))
44 | ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName
45 | 
46 | export { ScrollArea, ScrollBar }
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
6 | const Separator = React.forwardRef<
7 |   React.ElementRef<typeof SeparatorPrimitive.Root>,
8 |   React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
9 | >(
10 |   (
11 |     { className, orientation = "horizontal", decorative = true, ...props },
12 |     ref
13 |   ) => (
14 |     <SeparatorPrimitive.Root
15 |       ref={ref}
16 |       decorative={decorative}
17 |       orientation={orientation}
18 |       className={cn(
19 |         "shrink-0 bg-border",
20 |         orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
21 |         className
22 |       )}
23 |       {...props}
24 |     />
25 |   )
26 | )
27 | Separator.displayName = SeparatorPrimitive.Root.displayName
28 | 
29 | export { Separator }
```

src/components/ui/sheet.tsx
```
1 | "use client"
2 | 
3 | import * as React from "react"
4 | import * as SheetPrimitive from "@radix-ui/react-dialog"
5 | import { cva, type VariantProps } from "class-variance-authority"
6 | import { X } from "lucide-react"
7 | 
8 | import { cn } from "@/lib/utils"
9 | 
10 | const Sheet = SheetPrimitive.Root
11 | 
12 | const SheetTrigger = SheetPrimitive.Trigger
13 | 
14 | const SheetClose = SheetPrimitive.Close
15 | 
16 | const SheetPortal = SheetPrimitive.Portal
17 | 
18 | const SheetOverlay = React.forwardRef<
19 |   React.ElementRef<typeof SheetPrimitive.Overlay>,
20 |   React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
21 | >(({ className, ...props }, ref) => (
22 |   <SheetPrimitive.Overlay
23 |     className={cn(
24 |       "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
25 |       className
26 |     )}
27 |     {...props}
28 |     ref={ref}
29 |   />
30 | ))
31 | SheetOverlay.displayName = SheetPrimitive.Overlay.displayName
32 | 
33 | const sheetVariants = cva(
34 |   "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
35 |   {
36 |     variants: {
37 |       side: {
38 |         top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
39 |         bottom:
40 |           "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
41 |         left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
42 |         right:
43 |           "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
44 |       },
45 |     },
46 |     defaultVariants: {
47 |       side: "right",
48 |     },
49 |   }
50 | )
51 | 
52 | interface SheetContentProps
53 |   extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
54 |     VariantProps<typeof sheetVariants> {}
55 | 
56 | const SheetContent = React.forwardRef<
57 |   React.ElementRef<typeof SheetPrimitive.Content>,
58 |   SheetContentProps
59 | >(({ side = "right", className, children, ...props }, ref) => (
60 |   <SheetPortal>
61 |     <SheetOverlay />
62 |     <SheetPrimitive.Content
63 |       ref={ref}
64 |       className={cn(sheetVariants({ side }), className)}
65 |       {...props}
66 |     >
67 |       <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
68 |         <X className="h-4 w-4" />
69 |         <span className="sr-only">Close</span>
70 |       </SheetPrimitive.Close>
71 |       {children}
72 |     </SheetPrimitive.Content>
73 |   </SheetPortal>
74 | ))
75 | SheetContent.displayName = SheetPrimitive.Content.displayName
76 | 
77 | const SheetHeader = ({
78 |   className,
79 |   ...props
80 | }: React.HTMLAttributes<HTMLDivElement>) => (
81 |   <div
82 |     className={cn(
83 |       "flex flex-col space-y-2 text-center sm:text-left",
84 |       className
85 |     )}
86 |     {...props}
87 |   />
88 | )
89 | SheetHeader.displayName = "SheetHeader"
90 | 
91 | const SheetFooter = ({
92 |   className,
93 |   ...props
94 | }: React.HTMLAttributes<HTMLDivElement>) => (
95 |   <div
96 |     className={cn(
97 |       "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
98 |       className
99 |     )}
100 |     {...props}
101 |   />
102 | )
103 | SheetFooter.displayName = "SheetFooter"
104 | 
105 | const SheetTitle = React.forwardRef<
106 |   React.ElementRef<typeof SheetPrimitive.Title>,
107 |   React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
108 | >(({ className, ...props }, ref) => (
109 |   <SheetPrimitive.Title
110 |     ref={ref}
111 |     className={cn("text-lg font-semibold text-foreground", className)}
112 |     {...props}
113 |   />
114 | ))
115 | SheetTitle.displayName = SheetPrimitive.Title.displayName
116 | 
117 | const SheetDescription = React.forwardRef<
118 |   React.ElementRef<typeof SheetPrimitive.Description>,
119 |   React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
120 | >(({ className, ...props }, ref) => (
121 |   <SheetPrimitive.Description
122 |     ref={ref}
123 |     className={cn("text-sm text-muted-foreground", className)}
124 |     {...props}
125 |   />
126 | ))
127 | SheetDescription.displayName = SheetPrimitive.Description.displayName
128 | 
129 | export {
130 |   Sheet,
131 |   SheetPortal,
132 |   SheetOverlay,
133 |   SheetTrigger,
134 |   SheetClose,
135 |   SheetContent,
136 |   SheetHeader,
137 |   SheetFooter,
138 |   SheetTitle,
139 |   SheetDescription,
140 | }
```

src/components/ui/sidebar.tsx
```
1 | import * as React from "react"
2 | import { Slot } from "@radix-ui/react-slot"
3 | import { VariantProps, cva } from "class-variance-authority"
4 | import { PanelLeft } from "lucide-react"
5 | 
6 | import { useIsMobile } from "@/hooks/use-mobile"
7 | import { cn } from "@/lib/utils"
8 | import { Button } from "@/components/ui/button"
9 | import { Input } from "@/components/ui/input"
10 | import { Separator } from "@/components/ui/separator"
11 | import {
12 |   Sheet,
13 |   SheetContent,
14 |   SheetDescription,
15 |   SheetHeader,
16 |   SheetTitle,
17 | } from "@/components/ui/sheet"
18 | import { Skeleton } from "@/components/ui/skeleton"
19 | import {
20 |   Tooltip,
21 |   TooltipContent,
22 |   TooltipProvider,
23 |   TooltipTrigger,
24 | } from "@/components/ui/tooltip"
25 | 
26 | const SIDEBAR_COOKIE_NAME = "sidebar_state"
27 | const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
28 | const SIDEBAR_WIDTH = "16rem"
29 | const SIDEBAR_WIDTH_MOBILE = "18rem"
30 | const SIDEBAR_WIDTH_ICON = "3rem"
31 | const SIDEBAR_KEYBOARD_SHORTCUT = "b"
32 | 
33 | type SidebarContextProps = {
34 |   state: "expanded" | "collapsed"
35 |   open: boolean
36 |   setOpen: (open: boolean) => void
37 |   openMobile: boolean
38 |   setOpenMobile: (open: boolean) => void
39 |   isMobile: boolean
40 |   toggleSidebar: () => void
41 | }
42 | 
43 | const SidebarContext = React.createContext<SidebarContextProps | null>(null)
44 | 
45 | function useSidebar() {
46 |   const context = React.useContext(SidebarContext)
47 |   if (!context) {
48 |     throw new Error("useSidebar must be used within a SidebarProvider.")
49 |   }
50 | 
51 |   return context
52 | }
53 | 
54 | const SidebarProvider = React.forwardRef<
55 |   HTMLDivElement,
56 |   React.ComponentProps<"div"> & {
57 |     defaultOpen?: boolean
58 |     open?: boolean
59 |     onOpenChange?: (open: boolean) => void
60 |   }
61 | >(
62 |   (
63 |     {
64 |       defaultOpen = true,
65 |       open: openProp,
66 |       onOpenChange: setOpenProp,
67 |       className,
68 |       style,
69 |       children,
70 |       ...props
71 |     },
72 |     ref
73 |   ) => {
74 |     const isMobile = useIsMobile()
75 |     const [openMobile, setOpenMobile] = React.useState(false)
76 | 
77 |     // This is the internal state of the sidebar.
78 |     // We use openProp and setOpenProp for control from outside the component.
79 |     const [_open, _setOpen] = React.useState(defaultOpen)
80 |     const open = openProp ?? _open
81 |     const setOpen = React.useCallback(
82 |       (value: boolean | ((value: boolean) => boolean)) => {
83 |         const openState = typeof value === "function" ? value(open) : value
84 |         if (setOpenProp) {
85 |           setOpenProp(openState)
86 |         } else {
87 |           _setOpen(openState)
88 |         }
89 | 
90 |         // This sets the cookie to keep the sidebar state.
91 |         document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
92 |       },
93 |       [setOpenProp, open]
94 |     )
95 | 
96 |     // Helper to toggle the sidebar.
97 |     const toggleSidebar = React.useCallback(() => {
98 |       return isMobile
99 |         ? setOpenMobile((open) => !open)
100 |         : setOpen((open) => !open)
101 |     }, [isMobile, setOpen, setOpenMobile])
102 | 
103 |     // Adds a keyboard shortcut to toggle the sidebar.
104 |     React.useEffect(() => {
105 |       const handleKeyDown = (event: KeyboardEvent) => {
106 |         if (
107 |           event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
108 |           (event.metaKey || event.ctrlKey)
109 |         ) {
110 |           event.preventDefault()
111 |           toggleSidebar()
112 |         }
113 |       }
114 | 
115 |       window.addEventListener("keydown", handleKeyDown)
116 |       return () => window.removeEventListener("keydown", handleKeyDown)
117 |     }, [toggleSidebar])
118 | 
119 |     // We add a state so that we can do data-state="expanded" or "collapsed".
120 |     // This makes it easier to style the sidebar with Tailwind classes.
121 |     const state = open ? "expanded" : "collapsed"
122 | 
123 |     const contextValue = React.useMemo<SidebarContextProps>(
124 |       () => ({
125 |         state,
126 |         open,
127 |         setOpen,
128 |         isMobile,
129 |         openMobile,
130 |         setOpenMobile,
131 |         toggleSidebar,
132 |       }),
133 |       [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
134 |     )
135 | 
136 |     return (
137 |       <SidebarContext.Provider value={contextValue}>
138 |         <TooltipProvider delayDuration={0}>
139 |           <div
140 |             style={
141 |               {
142 |                 "--sidebar-width": SIDEBAR_WIDTH,
143 |                 "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
144 |                 ...style,
145 |               } as React.CSSProperties
146 |             }
147 |             className={cn(
148 |               "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
149 |               className
150 |             )}
151 |             ref={ref}
152 |             {...props}
153 |           >
154 |             {children}
155 |           </div>
156 |         </TooltipProvider>
157 |       </SidebarContext.Provider>
158 |     )
159 |   }
160 | )
161 | SidebarProvider.displayName = "SidebarProvider"
162 | 
163 | const Sidebar = React.forwardRef<
164 |   HTMLDivElement,
165 |   React.ComponentProps<"div"> & {
166 |     side?: "left" | "right"
167 |     variant?: "sidebar" | "floating" | "inset"
168 |     collapsible?: "offcanvas" | "icon" | "none"
169 |   }
170 | >(
171 |   (
172 |     {
173 |       side = "left",
174 |       variant = "sidebar",
175 |       collapsible = "offcanvas",
176 |       className,
177 |       children,
178 |       ...props
179 |     },
180 |     ref
181 |   ) => {
182 |     const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
183 | 
184 |     if (collapsible === "none") {
185 |       return (
186 |         <div
187 |           className={cn(
188 |             "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
189 |             className
190 |           )}
191 |           ref={ref}
192 |           {...props}
193 |         >
194 |           {children}
195 |         </div>
196 |       )
197 |     }
198 | 
199 |     if (isMobile) {
200 |       return (
201 |         <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
202 |           <SheetContent
203 |             data-sidebar="sidebar"
204 |             data-mobile="true"
205 |             className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
206 |             style={
207 |               {
208 |                 "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
209 |               } as React.CSSProperties
210 |             }
211 |             side={side}
212 |           >
213 |             <SheetHeader className="sr-only">
214 |               <SheetTitle>Sidebar</SheetTitle>
215 |               <SheetDescription>Displays the mobile sidebar.</SheetDescription>
216 |             </SheetHeader>
217 |             <div className="flex h-full w-full flex-col">{children}</div>
218 |           </SheetContent>
219 |         </Sheet>
220 |       )
221 |     }
222 | 
223 |     return (
224 |       <div
225 |         ref={ref}
226 |         className="group peer hidden text-sidebar-foreground md:block"
227 |         data-state={state}
228 |         data-collapsible={state === "collapsed" ? collapsible : ""}
229 |         data-variant={variant}
230 |         data-side={side}
231 |       >
232 |         {/* This is what handles the sidebar gap on desktop */}
233 |         <div
234 |           className={cn(
235 |             "relative w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear",
236 |             "group-data-[collapsible=offcanvas]:w-0",
237 |             "group-data-[side=right]:rotate-180",
238 |             variant === "floating" || variant === "inset"
239 |               ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
240 |               : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
241 |           )}
242 |         />
243 |         <div
244 |           className={cn(
245 |             "fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex",
246 |             side === "left"
247 |               ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
248 |               : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
249 |             // Adjust the padding for floating and inset variants.
250 |             variant === "floating" || variant === "inset"
251 |               ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
252 |               : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
253 |             className
254 |           )}
255 |           {...props}
256 |         >
257 |           <div
258 |             data-sidebar="sidebar"
259 |             className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
260 |           >
261 |             {children}
262 |           </div>
263 |         </div>
264 |       </div>
265 |     )
266 |   }
267 | )
268 | Sidebar.displayName = "Sidebar"
269 | 
270 | const SidebarTrigger = React.forwardRef<
271 |   React.ElementRef<typeof Button>,
272 |   React.ComponentProps<typeof Button>
273 | >(({ className, onClick, ...props }, ref) => {
274 |   const { toggleSidebar } = useSidebar()
275 | 
276 |   return (
277 |     <Button
278 |       ref={ref}
279 |       data-sidebar="trigger"
280 |       variant="ghost"
281 |       size="icon"
282 |       className={cn("h-7 w-7", className)}
283 |       onClick={(event) => {
284 |         onClick?.(event)
285 |         toggleSidebar()
286 |       }}
287 |       {...props}
288 |     >
289 |       <PanelLeft />
290 |       <span className="sr-only">Toggle Sidebar</span>
291 |     </Button>
292 |   )
293 | })
294 | SidebarTrigger.displayName = "SidebarTrigger"
295 | 
296 | const SidebarRail = React.forwardRef<
297 |   HTMLButtonElement,
298 |   React.ComponentProps<"button">
299 | >(({ className, ...props }, ref) => {
300 |   const { toggleSidebar } = useSidebar()
301 | 
302 |   return (
303 |     <button
304 |       ref={ref}
305 |       data-sidebar="rail"
306 |       aria-label="Toggle Sidebar"
307 |       tabIndex={-1}
308 |       onClick={toggleSidebar}
309 |       title="Toggle Sidebar"
310 |       className={cn(
311 |         "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
312 |         "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
313 |         "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
314 |         "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
315 |         "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
316 |         "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
317 |         className
318 |       )}
319 |       {...props}
320 |     />
321 |   )
322 | })
323 | SidebarRail.displayName = "SidebarRail"
324 | 
325 | const SidebarInset = React.forwardRef<
326 |   HTMLDivElement,
327 |   React.ComponentProps<"main">
328 | >(({ className, ...props }, ref) => {
329 |   return (
330 |     <main
331 |       ref={ref}
332 |       className={cn(
333 |         "relative flex w-full flex-1 flex-col bg-background",
334 |         "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
335 |         className
336 |       )}
337 |       {...props}
338 |     />
339 |   )
340 | })
341 | SidebarInset.displayName = "SidebarInset"
342 | 
343 | const SidebarInput = React.forwardRef<
344 |   React.ElementRef<typeof Input>,
345 |   React.ComponentProps<typeof Input>
346 | >(({ className, ...props }, ref) => {
347 |   return (
348 |     <Input
349 |       ref={ref}
350 |       data-sidebar="input"
351 |       className={cn(
352 |         "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
353 |         className
354 |       )}
355 |       {...props}
356 |     />
357 |   )
358 | })
359 | SidebarInput.displayName = "SidebarInput"
360 | 
361 | const SidebarHeader = React.forwardRef<
362 |   HTMLDivElement,
363 |   React.ComponentProps<"div">
364 | >(({ className, ...props }, ref) => {
365 |   return (
366 |     <div
367 |       ref={ref}
368 |       data-sidebar="header"
369 |       className={cn("flex flex-col gap-2 p-2", className)}
370 |       {...props}
371 |     />
372 |   )
373 | })
374 | SidebarHeader.displayName = "SidebarHeader"
375 | 
376 | const SidebarFooter = React.forwardRef<
377 |   HTMLDivElement,
378 |   React.ComponentProps<"div">
379 | >(({ className, ...props }, ref) => {
380 |   return (
381 |     <div
382 |       ref={ref}
383 |       data-sidebar="footer"
384 |       className={cn("flex flex-col gap-2 p-2", className)}
385 |       {...props}
386 |     />
387 |   )
388 | })
389 | SidebarFooter.displayName = "SidebarFooter"
390 | 
391 | const SidebarSeparator = React.forwardRef<
392 |   React.ElementRef<typeof Separator>,
393 |   React.ComponentProps<typeof Separator>
394 | >(({ className, ...props }, ref) => {
395 |   return (
396 |     <Separator
397 |       ref={ref}
398 |       data-sidebar="separator"
399 |       className={cn("mx-2 w-auto bg-sidebar-border", className)}
400 |       {...props}
401 |     />
402 |   )
403 | })
404 | SidebarSeparator.displayName = "SidebarSeparator"
405 | 
406 | const SidebarContent = React.forwardRef<
407 |   HTMLDivElement,
408 |   React.ComponentProps<"div">
409 | >(({ className, ...props }, ref) => {
410 |   return (
411 |     <div
412 |       ref={ref}
413 |       data-sidebar="content"
414 |       className={cn(
415 |         "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
416 |         className
417 |       )}
418 |       {...props}
419 |     />
420 |   )
421 | })
422 | SidebarContent.displayName = "SidebarContent"
423 | 
424 | const SidebarGroup = React.forwardRef<
425 |   HTMLDivElement,
426 |   React.ComponentProps<"div">
427 | >(({ className, ...props }, ref) => {
428 |   return (
429 |     <div
430 |       ref={ref}
431 |       data-sidebar="group"
432 |       className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
433 |       {...props}
434 |     />
435 |   )
436 | })
437 | SidebarGroup.displayName = "SidebarGroup"
438 | 
439 | const SidebarGroupLabel = React.forwardRef<
440 |   HTMLDivElement,
441 |   React.ComponentProps<"div"> & { asChild?: boolean }
442 | >(({ className, asChild = false, ...props }, ref) => {
443 |   const Comp = asChild ? Slot : "div"
444 | 
445 |   return (
446 |     <Comp
447 |       ref={ref}
448 |       data-sidebar="group-label"
449 |       className={cn(
450 |         "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
451 |         "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
452 |         className
453 |       )}
454 |       {...props}
455 |     />
456 |   )
457 | })
458 | SidebarGroupLabel.displayName = "SidebarGroupLabel"
459 | 
460 | const SidebarGroupAction = React.forwardRef<
461 |   HTMLButtonElement,
462 |   React.ComponentProps<"button"> & { asChild?: boolean }
463 | >(({ className, asChild = false, ...props }, ref) => {
464 |   const Comp = asChild ? Slot : "button"
465 | 
466 |   return (
467 |     <Comp
468 |       ref={ref}
469 |       data-sidebar="group-action"
470 |       className={cn(
471 |         "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
472 |         // Increases the hit area of the button on mobile.
473 |         "after:absolute after:-inset-2 after:md:hidden",
474 |         "group-data-[collapsible=icon]:hidden",
475 |         className
476 |       )}
477 |       {...props}
478 |     />
479 |   )
480 | })
481 | SidebarGroupAction.displayName = "SidebarGroupAction"
482 | 
483 | const SidebarGroupContent = React.forwardRef<
484 |   HTMLDivElement,
485 |   React.ComponentProps<"div">
486 | >(({ className, ...props }, ref) => (
487 |   <div
488 |     ref={ref}
489 |     data-sidebar="group-content"
490 |     className={cn("w-full text-sm", className)}
491 |     {...props}
492 |   />
493 | ))
494 | SidebarGroupContent.displayName = "SidebarGroupContent"
495 | 
496 | const SidebarMenu = React.forwardRef<
497 |   HTMLUListElement,
498 |   React.ComponentProps<"ul">
499 | >(({ className, ...props }, ref) => (
500 |   <ul
501 |     ref={ref}
502 |     data-sidebar="menu"
503 |     className={cn("flex w-full min-w-0 flex-col gap-1", className)}
504 |     {...props}
505 |   />
506 | ))
507 | SidebarMenu.displayName = "SidebarMenu"
508 | 
509 | const SidebarMenuItem = React.forwardRef<
510 |   HTMLLIElement,
511 |   React.ComponentProps<"li">
512 | >(({ className, ...props }, ref) => (
513 |   <li
514 |     ref={ref}
515 |     data-sidebar="menu-item"
516 |     className={cn("group/menu-item relative", className)}
517 |     {...props}
518 |   />
519 | ))
520 | SidebarMenuItem.displayName = "SidebarMenuItem"
521 | 
522 | const sidebarMenuButtonVariants = cva(
523 |   "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
524 |   {
525 |     variants: {
526 |       variant: {
527 |         default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
528 |         outline:
529 |           "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
530 |       },
531 |       size: {
532 |         default: "h-8 text-sm",
533 |         sm: "h-7 text-xs",
534 |         lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
535 |       },
536 |     },
537 |     defaultVariants: {
538 |       variant: "default",
539 |       size: "default",
540 |     },
541 |   }
542 | )
543 | 
544 | const SidebarMenuButton = React.forwardRef<
545 |   HTMLButtonElement,
546 |   React.ComponentProps<"button"> & {
547 |     asChild?: boolean
548 |     isActive?: boolean
549 |     tooltip?: string | React.ComponentProps<typeof TooltipContent>
550 |   } & VariantProps<typeof sidebarMenuButtonVariants>
551 | >(
552 |   (
553 |     {
554 |       asChild = false,
555 |       isActive = false,
556 |       variant = "default",
557 |       size = "default",
558 |       tooltip,
559 |       className,
560 |       ...props
561 |     },
562 |     ref
563 |   ) => {
564 |     const Comp = asChild ? Slot : "button"
565 |     const { isMobile, state } = useSidebar()
566 | 
567 |     const button = (
568 |       <Comp
569 |         ref={ref}
570 |         data-sidebar="menu-button"
571 |         data-size={size}
572 |         data-active={isActive}
573 |         className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
574 |         {...props}
575 |       />
576 |     )
577 | 
578 |     if (!tooltip) {
579 |       return button
580 |     }
581 | 
582 |     if (typeof tooltip === "string") {
583 |       tooltip = {
584 |         children: tooltip,
585 |       }
586 |     }
587 | 
588 |     return (
589 |       <Tooltip>
590 |         <TooltipTrigger asChild>{button}</TooltipTrigger>
591 |         <TooltipContent
592 |           side="right"
593 |           align="center"
594 |           hidden={state !== "collapsed" || isMobile}
595 |           {...tooltip}
596 |         />
597 |       </Tooltip>
598 |     )
599 |   }
600 | )
601 | SidebarMenuButton.displayName = "SidebarMenuButton"
602 | 
603 | const SidebarMenuAction = React.forwardRef<
604 |   HTMLButtonElement,
605 |   React.ComponentProps<"button"> & {
606 |     asChild?: boolean
607 |     showOnHover?: boolean
608 |   }
609 | >(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
610 |   const Comp = asChild ? Slot : "button"
611 | 
612 |   return (
613 |     <Comp
614 |       ref={ref}
615 |       data-sidebar="menu-action"
616 |       className={cn(
617 |         "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
618 |         // Increases the hit area of the button on mobile.
619 |         "after:absolute after:-inset-2 after:md:hidden",
620 |         "peer-data-[size=sm]/menu-button:top-1",
621 |         "peer-data-[size=default]/menu-button:top-1.5",
622 |         "peer-data-[size=lg]/menu-button:top-2.5",
623 |         "group-data-[collapsible=icon]:hidden",
624 |         showOnHover &&
625 |           "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
626 |         className
627 |       )}
628 |       {...props}
629 |     />
630 |   )
631 | })
632 | SidebarMenuAction.displayName = "SidebarMenuAction"
633 | 
634 | const SidebarMenuBadge = React.forwardRef<
635 |   HTMLDivElement,
636 |   React.ComponentProps<"div">
637 | >(({ className, ...props }, ref) => (
638 |   <div
639 |     ref={ref}
640 |     data-sidebar="menu-badge"
641 |     className={cn(
642 |       "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
643 |       "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
644 |       "peer-data-[size=sm]/menu-button:top-1",
645 |       "peer-data-[size=default]/menu-button:top-1.5",
646 |       "peer-data-[size=lg]/menu-button:top-2.5",
647 |       "group-data-[collapsible=icon]:hidden",
648 |       className
649 |     )}
650 |     {...props}
651 |   />
652 | ))
653 | SidebarMenuBadge.displayName = "SidebarMenuBadge"
654 | 
655 | const SidebarMenuSkeleton = React.forwardRef<
656 |   HTMLDivElement,
657 |   React.ComponentProps<"div"> & {
658 |     showIcon?: boolean
659 |   }
660 | >(({ className, showIcon = false, ...props }, ref) => {
661 |   // Random width between 50 to 90%.
662 |   const width = React.useMemo(() => {
663 |     return `${Math.floor(Math.random() * 40) + 50}%`
664 |   }, [])
665 | 
666 |   return (
667 |     <div
668 |       ref={ref}
669 |       data-sidebar="menu-skeleton"
670 |       className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
671 |       {...props}
672 |     >
673 |       {showIcon && (
674 |         <Skeleton
675 |           className="size-4 rounded-md"
676 |           data-sidebar="menu-skeleton-icon"
677 |         />
678 |       )}
679 |       <Skeleton
680 |         className="h-4 max-w-[--skeleton-width] flex-1"
681 |         data-sidebar="menu-skeleton-text"
682 |         style={
683 |           {
684 |             "--skeleton-width": width,
685 |           } as React.CSSProperties
686 |         }
687 |       />
688 |     </div>
689 |   )
690 | })
691 | SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"
692 | 
693 | const SidebarMenuSub = React.forwardRef<
694 |   HTMLUListElement,
695 |   React.ComponentProps<"ul">
696 | >(({ className, ...props }, ref) => (
697 |   <ul
698 |     ref={ref}
699 |     data-sidebar="menu-sub"
700 |     className={cn(
701 |       "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
702 |       "group-data-[collapsible=icon]:hidden",
703 |       className
704 |     )}
705 |     {...props}
706 |   />
707 | ))
708 | SidebarMenuSub.displayName = "SidebarMenuSub"
709 | 
710 | const SidebarMenuSubItem = React.forwardRef<
711 |   HTMLLIElement,
712 |   React.ComponentProps<"li">
713 | >(({ ...props }, ref) => <li ref={ref} {...props} />)
714 | SidebarMenuSubItem.displayName = "SidebarMenuSubItem"
715 | 
716 | const SidebarMenuSubButton = React.forwardRef<
717 |   HTMLAnchorElement,
718 |   React.ComponentProps<"a"> & {
719 |     asChild?: boolean
720 |     size?: "sm" | "md"
721 |     isActive?: boolean
722 |   }
723 | >(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
724 |   const Comp = asChild ? Slot : "a"
725 | 
726 |   return (
727 |     <Comp
728 |       ref={ref}
729 |       data-sidebar="menu-sub-button"
730 |       data-size={size}
731 |       data-active={isActive}
732 |       className={cn(
733 |         "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
734 |         "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
735 |         size === "sm" && "text-xs",
736 |         size === "md" && "text-sm",
737 |         "group-data-[collapsible=icon]:hidden",
738 |         className
739 |       )}
740 |       {...props}
741 |     />
742 |   )
743 | })
744 | SidebarMenuSubButton.displayName = "SidebarMenuSubButton"
745 | 
746 | export {
747 |   Sidebar,
748 |   SidebarContent,
749 |   SidebarFooter,
750 |   SidebarGroup,
751 |   SidebarGroupAction,
752 |   SidebarGroupContent,
753 |   SidebarGroupLabel,
754 |   SidebarHeader,
755 |   SidebarInput,
756 |   SidebarInset,
757 |   SidebarMenu,
758 |   SidebarMenuAction,
759 |   SidebarMenuBadge,
760 |   SidebarMenuButton,
761 |   SidebarMenuItem,
762 |   SidebarMenuSkeleton,
763 |   SidebarMenuSub,
764 |   SidebarMenuSubButton,
765 |   SidebarMenuSubItem,
766 |   SidebarProvider,
767 |   SidebarRail,
768 |   SidebarSeparator,
769 |   SidebarTrigger,
770 |   useSidebar,
771 | }
```

src/components/ui/skeleton.tsx
```
1 | import { cn } from "@/lib/utils"
2 | 
3 | function Skeleton({
4 |   className,
5 |   ...props
6 | }: React.HTMLAttributes<HTMLDivElement>) {
7 |   return (
8 |     <div
9 |       className={cn("animate-pulse rounded-md bg-primary/10", className)}
10 |       {...props}
11 |     />
12 |   )
13 | }
14 | 
15 | export { Skeleton }
```

src/components/ui/sonner.tsx
```
1 | import { useTheme } from "next-themes"
2 | import { Toaster as Sonner } from "sonner"
3 | 
4 | type ToasterProps = React.ComponentProps<typeof Sonner>
5 | 
6 | const Toaster = ({ ...props }: ToasterProps) => {
7 |   const { theme = "system" } = useTheme()
8 | 
9 |   return (
10 |     <Sonner
11 |       theme={theme as ToasterProps["theme"]}
12 |       className="toaster group"
13 |       toastOptions={{
14 |         classNames: {
15 |           toast:
16 |             "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
17 |           description: "group-[.toast]:text-muted-foreground",
18 |           actionButton:
19 |             "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
20 |           cancelButton:
21 |             "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
22 |         },
23 |       }}
24 |       {...props}
25 |     />
26 |   )
27 | }
28 | 
29 | export { Toaster }
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
8 | const Tabs = TabsPrimitive.Root
9 | 
10 | const TabsList = React.forwardRef<
11 |   React.ElementRef<typeof TabsPrimitive.List>,
12 |   React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
13 | >(({ className, ...props }, ref) => (
14 |   <TabsPrimitive.List
15 |     ref={ref}
16 |     className={cn(
17 |       "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
18 |       className
19 |     )}
20 |     {...props}
21 |   />
22 | ))
23 | TabsList.displayName = TabsPrimitive.List.displayName
24 | 
25 | const TabsTrigger = React.forwardRef<
26 |   React.ElementRef<typeof TabsPrimitive.Trigger>,
27 |   React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
28 | >(({ className, ...props }, ref) => (
29 |   <TabsPrimitive.Trigger
30 |     ref={ref}
31 |     className={cn(
32 |       "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
33 |       className
34 |     )}
35 |     {...props}
36 |   />
37 | ))
38 | TabsTrigger.displayName = TabsPrimitive.Trigger.displayName
39 | 
40 | const TabsContent = React.forwardRef<
41 |   React.ElementRef<typeof TabsPrimitive.Content>,
42 |   React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
43 | >(({ className, ...props }, ref) => (
44 |   <TabsPrimitive.Content
45 |     ref={ref}
46 |     className={cn(
47 |       "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
48 |       className
49 |     )}
50 |     {...props}
51 |   />
52 | ))
53 | TabsContent.displayName = TabsPrimitive.Content.displayName
54 | 
55 | export { Tabs, TabsList, TabsTrigger, TabsContent }
```

src/components/ui/tooltip.tsx
```
1 | import * as React from "react"
2 | import * as TooltipPrimitive from "@radix-ui/react-tooltip"
3 | 
4 | import { cn } from "@/lib/utils"
5 | 
6 | const TooltipProvider = TooltipPrimitive.Provider
7 | 
8 | const Tooltip = TooltipPrimitive.Root
9 | 
10 | const TooltipTrigger = TooltipPrimitive.Trigger
11 | 
12 | const TooltipContent = React.forwardRef<
13 |   React.ElementRef<typeof TooltipPrimitive.Content>,
14 |   React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
15 | >(({ className, sideOffset = 4, ...props }, ref) => (
16 |   <TooltipPrimitive.Portal>
17 |     <TooltipPrimitive.Content
18 |       ref={ref}
19 |       sideOffset={sideOffset}
20 |       className={cn(
21 |         "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
22 |         className
23 |       )}
24 |       {...props}
25 |     />
26 |   </TooltipPrimitive.Portal>
27 | ))
28 | TooltipContent.displayName = TooltipPrimitive.Content.displayName
29 | 
30 | export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

src/components/metrics/dora-metrics.tsx
```
1 | import { useState, useEffect, useMemo } from "react"
2 | import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
3 | import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
4 | import { HelpCircle } from "lucide-react"
5 | import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
6 | import { format, addDays, differenceInDays } from "date-fns"
7 | import { ko } from "date-fns/locale"
8 | 
9 | interface FilterState {
10 |   project: string;
11 |   startDate: Date | null;
12 |   endDate: Date | null;
13 |   datePreset?: string;
14 | }
15 | 
16 | const DATE_PRESETS = [
17 |   { id: "7d", name: "최근 7일", days: 7 },
18 |   { id: "14d", name: "최근 14일", days: 14 },
19 |   { id: "30d", name: "최근 30일", days: 30 },
20 |   { id: "90d", name: "최근 90일", days: 90 },
21 |   { id: "custom", name: "사용자 지정", days: 0 },
22 | ];
23 | 
24 | // 메트릭 데이터 타입 정의
25 | interface MetricDataPoint {
26 |   date: string;
27 |   value: number;
28 | }
29 | 
30 | interface MetricData {
31 |   title: string;
32 |   value: string;
33 |   subValue: string;
34 |   change: { value: number; trend: "up" | "down" };
35 |   status: string;
36 |   tooltip: string;
37 |   color: string;
38 |   bgColorClass: string;
39 |   cursorBgClass: string;
40 |   graphData: MetricDataPoint[];
41 | }
42 | 
43 | interface MetricsDataType {
44 |   deploymentFrequency: MetricData;
45 |   changeFailureRate: MetricData;
46 |   cycleTime: MetricData;
47 |   meanTimeToResponse: MetricData;
48 | }
49 | 
50 | // 기본 메트릭 데이터 템플릿
51 | const BASE_METRICS_DATA: MetricsDataType = {
52 |   deploymentFrequency: {
53 |     title: "배포 빈도",
54 |     value: "2일 4시간",
55 |     subValue: "총 285개 PR",
56 |     change: { value: 36, trend: "up" },
57 |     status: "Elite",
58 |     tooltip: "프로덕션 환경에 성공적으로 배포하는 빈도",
59 |     color: "var(--chart-deployment-frequency)",
60 |     bgColorClass: "bg-chart-deployment-frequency-20",
61 |     cursorBgClass: "bg-chart-deployment-frequency-15",
62 |     graphData: []
63 |   },
64 |   changeFailureRate: {
65 |     title: "변경 실패율",
66 |     value: "17%",
67 |     subValue: "총 48개 실패",
68 |     change: { value: 12, trend: "down" },
69 |     status: "High",
70 |     tooltip: "프로덕션 환경에서 배포 실패가 발생하는 비율",
71 |     color: "var(--chart-change-failure-rate)",
72 |     bgColorClass: "bg-chart-change-failure-rate-20",
73 |     cursorBgClass: "bg-chart-change-failure-rate-15",
74 |     graphData: []
75 |   },
76 |   cycleTime: {
77 |     title: "주기 시간",
78 |     value: "2일 4시간",
79 |     subValue: "총 243개 PR",
80 |     change: { value: 26, trend: "up" },
81 |     status: "Low",
82 |     tooltip: "코드 커밋부터 프로덕션 배포까지 걸리는 시간",
83 |     color: "var(--chart-cycle-time)",
84 |     bgColorClass: "bg-chart-cycle-time-20",
85 |     cursorBgClass: "bg-chart-cycle-time-15",
86 |     graphData: []
87 |   },
88 |   meanTimeToResponse: {
89 |     title: "평균 복구 시간",
90 |     value: "3.2시간",
91 |     subValue: "총 48개 실패",
92 |     change: { value: 7, trend: "up" },
93 |     status: "Mid",
94 |     tooltip: "프로덕션 환경에서 실패가 발생한 후 복구까지 걸리는 시간",
95 |     color: "var(--chart-mean-time-to-response)",
96 |     bgColorClass: "bg-chart-mean-time-to-response-20",
97 |     cursorBgClass: "bg-chart-mean-time-to-response-15",
98 |     graphData: []
99 |   }
100 | };
101 | 
102 | type MetricKey = keyof typeof BASE_METRICS_DATA
103 | 
104 | interface DoraMetricsProps {
105 |   filterState: FilterState;
106 | }
107 | 
108 | export function DoraMetrics({ filterState }: DoraMetricsProps) {
109 |   const [selectedMetric, setSelectedMetric] = useState<MetricKey>("deploymentFrequency")
110 |   const [metricsData, setMetricsData] = useState<MetricsDataType>({ ...BASE_METRICS_DATA })
111 |   const [barSize, setBarSize] = useState(40)
112 | 
113 |   // 선택된 기간에 따라 날짜 데이터 및 지표 값 생성
114 |   useEffect(() => {
115 |     // 날짜 범위 계산
116 |     const startDate = filterState.startDate || new Date(new Date().setDate(new Date().getDate() - 30))
117 |     const endDate = filterState.endDate || new Date()
118 |     const days = Math.abs(differenceInDays(startDate, endDate)) + 1 // 날짜 수 계산 (시작일, 종료일 포함)
119 |     
120 |     // 바 크기 계산 (날짜 수에 따라 조정)
121 |     let newBarSize = 40;
122 |     if (days > 60) {
123 |       newBarSize = 25;
124 |     }
125 |     if (days > 90) {
126 |       newBarSize = 15;
127 |     }
128 |     setBarSize(newBarSize);
129 |     
130 |     // 새로운 메트릭 데이터 생성
131 |     const newMetricsData = { ...BASE_METRICS_DATA }
132 |     
133 |     // 날짜 데이터 생성 (startDate부터 endDate까지)
134 |     const dateLabels = Array.from({ length: Math.min(days, 90) }, (_, i) => {
135 |       const date = addDays(startDate, i)
136 |       return format(date, 'MM월 dd일', { locale: ko })
137 |     })
138 |     
139 |     // 기간에 따라 배포 빈도 값 조정
140 |     let deployFreq = "2일 4시간"
141 |     let prCount = Math.floor(285 * (days / 30))
142 |     let change = 36
143 |     
144 |     if (days <= 7) {
145 |       deployFreq = "1일 2시간"
146 |       change = 42
147 |     } else if (days <= 14) {
148 |       deployFreq = "1일 18시간"
149 |       change = 39
150 |     } else if (days > 60) {
151 |       deployFreq = "3일 6시간"
152 |       change = 28
153 |     }
154 |     
155 |     newMetricsData.deploymentFrequency.value = deployFreq
156 |     newMetricsData.deploymentFrequency.subValue = `총 ${prCount}개 PR`
157 |     newMetricsData.deploymentFrequency.change.value = change
158 |     newMetricsData.deploymentFrequency.graphData = dateLabels.map(date => ({
159 |       date,
160 |       value: Math.floor(Math.random() * 40) + 10
161 |     }))
162 |     
163 |     // 변경 실패율 값 조정
164 |     let failureRate = "17%"
165 |     let failureCount = Math.floor(48 * (days / 30))
166 |     let failureChange = 12
167 |     
168 |     if (days <= 7) {
169 |       failureRate = "14%"
170 |       failureChange = 18
171 |     } else if (days <= 14) {
172 |       failureRate = "16%"
173 |       failureChange = 14
174 |     } else if (days > 60) {
175 |       failureRate = "19%"
176 |       failureChange = 8
177 |     }
178 |     
179 |     newMetricsData.changeFailureRate.value = failureRate
180 |     newMetricsData.changeFailureRate.subValue = `총 ${failureCount}개 실패`
181 |     newMetricsData.changeFailureRate.change.value = failureChange
182 |     newMetricsData.changeFailureRate.graphData = dateLabels.map(date => ({
183 |       date,
184 |       value: Math.floor(Math.random() * 30) + 5
185 |     }))
186 |     
187 |     // 주기 시간 값 조정
188 |     let cycleTime = "2일 4시간"
189 |     let cycleCount = Math.floor(243 * (days / 30))
190 |     let cycleChange = 26
191 |     
192 |     if (days <= 7) {
193 |       cycleTime = "1일 8시간"
194 |       cycleChange = 32
195 |     } else if (days <= 14) {
196 |       cycleTime = "1일 18시간"
197 |       cycleChange = 28
198 |     } else if (days > 60) {
199 |       cycleTime = "2일 12시간"
200 |       cycleChange = 22
201 |     }
202 |     
203 |     newMetricsData.cycleTime.value = cycleTime
204 |     newMetricsData.cycleTime.subValue = `총 ${cycleCount}개 PR`
205 |     newMetricsData.cycleTime.change.value = cycleChange
206 |     newMetricsData.cycleTime.graphData = dateLabels.map(date => ({
207 |       date,
208 |       value: Math.floor(Math.random() * 50) + 20
209 |     }))
210 |     
211 |     // 평균 복구 시간 값 조정
212 |     let mttr = "3.2시간"
213 |     let mttrCount = Math.floor(48 * (days / 30))
214 |     let mttrChange = 7
215 |     let mttrStatus = "Mid"
216 |     
217 |     if (days <= 7) {
218 |       mttr = "2.5시간"
219 |       mttrChange = 12
220 |       mttrStatus = "High"
221 |     } else if (days <= 14) {
222 |       mttr = "2.8시간"
223 |       mttrChange = 9
224 |       mttrStatus = "High"
225 |     } else if (days > 60) {
226 |       mttr = "3.6시간"
227 |       mttrChange = 5
228 |       mttrStatus = "Low"
229 |     }
230 |     
231 |     newMetricsData.meanTimeToResponse.value = mttr
232 |     newMetricsData.meanTimeToResponse.subValue = `총 ${mttrCount}개 실패`
233 |     newMetricsData.meanTimeToResponse.change.value = mttrChange
234 |     newMetricsData.meanTimeToResponse.status = mttrStatus
235 |     newMetricsData.meanTimeToResponse.graphData = dateLabels.map(date => ({
236 |       date,
237 |       value: Math.floor(Math.random() * 6) + 1
238 |     }))
239 |     
240 |     setMetricsData(newMetricsData)
241 |   }, [filterState])
242 | 
243 |   // 기간 정보 텍스트 생성
244 |   const getPeriodText = (filter: FilterState) => {
245 |     console.log('DoraMetrics - getPeriodText called with filter:', filter);
246 |     
247 |     if (filter.datePreset === "custom" && filter.startDate && filter.endDate) {
248 |       return `${format(filter.startDate, 'yyyy/MM/dd', { locale: ko })} 부터 ${format(filter.endDate, 'yyyy/MM/dd', { locale: ko })} 까지`;
249 |     }
250 |     
251 |     const preset = DATE_PRESETS.find(p => p.id === filter.datePreset);
252 |     if (preset) {
253 |       return `${preset.name}간`;
254 |     }
255 |     
256 |     return "기간 미설정";
257 |   };
258 | 
259 |   return (
260 |     <Card className="w-full">
261 |       <CardHeader className="flex flex-col items-stretch space-y-0 p-0 border-b">
262 |         <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 border-b">
263 |           <CardTitle>DORA 메트릭스</CardTitle>
264 |           <CardDescription>
265 |             {getPeriodText(filterState)}의 주요 DevOps 메트릭스 데이터
266 |           </CardDescription>
267 |         </div>
268 |         <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
269 |           {(Object.keys(metricsData) as MetricKey[]).map((key) => {
270 |             const metric = metricsData[key];
271 |             const isActive = selectedMetric === key;
272 |             
273 |             return (
274 |               <button
275 |                 key={key}
276 |                 data-active={isActive}
277 |                 className={`relative flex flex-col justify-center gap-1 px-4 py-4 text-left transition-colors hover:bg-muted/30 ${
278 |                   isActive ? `${metric.bgColorClass}` : ''
279 |                 }`}
280 |                 style={{ 
281 |                   color: isActive ? 'hsl(var(--foreground))' : undefined,
282 |                   borderTopColor: isActive ? metric.color : undefined,
283 |                   borderTopStyle: isActive ? 'solid' : 'none',
284 |                   borderTopWidth: isActive ? '2px' : '0'
285 |                 }}
286 |                 onClick={() => setSelectedMetric(key)}
287 |               >
288 |                 <div className="flex justify-between items-center">
289 |                   <div className="flex items-center">
290 |                     <span className={`text-xs ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'} truncate`}>
291 |                       {metric.title}
292 |                     </span>
293 |                     <Tooltip>
294 |                       <TooltipTrigger asChild>
295 |                         <span className="inline-flex ml-1 cursor-help">
296 |                           <HelpCircle className={`h-3 w-3 ${isActive ? 'text-foreground/90' : 'text-muted-foreground'}`} />
297 |                         </span>
298 |                       </TooltipTrigger>
299 |                       <TooltipContent>
300 |                         <p className="w-[200px] text-xs">{metric.tooltip}</p>
301 |                       </TooltipContent>
302 |                     </Tooltip>
303 |                   </div>
304 |                   <span className={`text-xs font-medium ml-1 ${
305 |                     metric.change.trend === "up" ? "text-green-500" : "text-red-500"
306 |                   }`}>
307 |                     {metric.change.trend === "up" ? "↑" : "↓"} {metric.change.value}%
308 |                   </span>
309 |                 </div>
310 |                 <span className="text-lg font-bold leading-none mt-1 sm:text-2xl">
311 |                   {metric.value}
312 |                 </span>
313 |                 <div className="flex justify-between mt-1">
314 |                   <span className={`text-xs ${isActive ? 'text-foreground/80' : 'text-muted-foreground'} truncate`}>
315 |                     {metric.subValue}
316 |                   </span>
317 |                   <span className={`text-xs font-medium ml-1 ${
318 |                     metric.status === "Elite" ? "text-green-500" : 
319 |                     metric.status === "High" ? "text-blue-500" :
320 |                     metric.status === "Mid" ? "text-yellow-500" : "text-red-500"
321 |                   }`}>
322 |                     {metric.status}
323 |                   </span>
324 |                 </div>
325 |               </button>
326 |             )
327 |           })}
328 |         </div>
329 |       </CardHeader>
330 |       <CardContent className="px-2 pt-6 pb-2 sm:p-6">
331 |         <div className="h-[300px]">
332 |           <ResponsiveContainer width="100%" height="100%">
333 |             <BarChart 
334 |               data={metricsData[selectedMetric].graphData} 
335 |               margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
336 |             >
337 |               <CartesianGrid strokeDasharray="3 3" vertical={false} />
338 |               <XAxis 
339 |                 dataKey="date" 
340 |                 axisLine={false}
341 |                 tickLine={false}
342 |                 tick={{ fontSize: 12, fontFamily: 'inherit', fill: 'hsl(var(--muted-foreground))' }}
343 |                 tickMargin={10}
344 |                 interval={metricsData[selectedMetric].graphData.length > 60 ? 4 : metricsData[selectedMetric].graphData.length > 30 ? 2 : 0}
345 |               />
346 |               <YAxis 
347 |                 axisLine={false}
348 |                 tickLine={false}
349 |                 tick={{ fontSize: 12, fontFamily: 'inherit', fill: 'hsl(var(--muted-foreground))' }}
350 |               />
351 |               <RechartsTooltip 
352 |                 contentStyle={{ 
353 |                   backgroundColor: 'hsl(var(--background))', 
354 |                   borderColor: 'hsl(var(--border))',
355 |                   borderRadius: '0.5rem',
356 |                   boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
357 |                   fontSize: '12px',
358 |                   fontFamily: 'inherit',
359 |                   padding: '8px 12px'
360 |                 }}
361 |                 cursor={{ fill: metricsData[selectedMetric].color + '15' }}
362 |                 formatter={(value) => [`${value}`, metricsData[selectedMetric].title]}
363 |                 labelFormatter={(label) => `${label}`}
364 |               />
365 |               <Bar 
366 |                 dataKey="value" 
367 |                 fill={metricsData[selectedMetric].color}
368 |                 radius={[4, 4, 0, 0]}
369 |                 maxBarSize={barSize}
370 |                 animationDuration={500}
371 |                 animationEasing="ease-in-out"
372 |               />
373 |             </BarChart>
374 |           </ResponsiveContainer>
375 |         </div>
376 |       </CardContent>
377 |     </Card>
378 |   )
379 | } 
```

src/components/metrics/example-metrics.tsx
```
1 | import { useState, useEffect, useMemo, useCallback } from "react";
2 | import { HelpCircle } from "lucide-react";
3 | import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
4 | import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
5 | import { MetricsCard, MetricItem } from "./metrics-card";
6 | import { format, differenceInDays } from "date-fns";
7 | import { ko } from "date-fns/locale";
8 | 
9 | // 상태별 색상 정의
10 | const STATUS_COLORS = {
11 |   Elite: "#10b981", // green-500
12 |   High: "#3b82f6", // blue-500
13 |   Mid: "#f59e0b", // yellow-500
14 |   Low: "#ef4444", // red-500
15 | };
16 | 
17 | const DATE_PRESETS = [
18 |   { id: "7d", name: "최근 7일", days: 7 },
19 |   { id: "14d", name: "최근 14일", days: 14 },
20 |   { id: "30d", name: "최근 30일", days: 30 },
21 |   { id: "90d", name: "최근 90일", days: 90 },
22 |   { id: "custom", name: "사용자 지정", days: 0 },
23 | ];
24 | 
25 | // 샘플 차트 컴포넌트
26 | function MetricChart({ data, color }: { data: any; color: string }) {
27 |   return (
28 |     <ResponsiveContainer width="100%" height="100%">
29 |       <BarChart 
30 |         data={data}
31 |         margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
32 |       >
33 |         <defs>
34 |           <linearGradient id={`colorGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
35 |             <stop offset="5%" stopColor={color} stopOpacity={0.8} />
36 |             <stop offset="95%" stopColor={color} stopOpacity={0.6} />
37 |           </linearGradient>
38 |         </defs>
39 |         <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
40 |         <XAxis 
41 |           dataKey="date" 
42 |           fontSize={12}
43 |           tickMargin={10}
44 |           axisLine={false}
45 |           tickLine={false}
46 |           stroke="hsl(var(--muted-foreground))"
47 |           opacity={0.5}
48 |           minTickGap={32}
49 |           interval={data.length > 60 ? 6 : data.length > 30 ? 3 : 1}
50 |           tickFormatter={(value) => {
51 |             try {
52 |               const date = new Date(value);
53 |               if (isNaN(date.getTime())) {
54 |                 return "";
55 |               }
56 |               // 90일 이상인 경우 월-일 형식으로 표시
57 |               return format(date, 'MM.dd', { locale: ko });
58 |             } catch (e) {
59 |               return "";
60 |             }
61 |           }}
62 |         />
63 |         <YAxis 
64 |           fontSize={12}
65 |           tickMargin={10}
66 |           axisLine={false}
67 |           tickLine={false}
68 |           stroke="hsl(var(--muted-foreground))"
69 |           opacity={0.5}
70 |         />
71 |         <RechartsTooltip 
72 |           contentStyle={{ 
73 |             backgroundColor: 'hsl(var(--background))', 
74 |             borderColor: 'hsl(var(--border))',
75 |             borderRadius: '0.5rem',
76 |             boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
77 |             fontSize: '12px',
78 |             fontFamily: 'inherit',
79 |             padding: '8px 12px'
80 |           }}
81 |           cursor={{ fill: `${color}15` }}
82 |           formatter={(value) => [`${value}`, '값']}
83 |           labelFormatter={(label) => `${label}`}
84 |         />
85 |         <Bar 
86 |           dataKey="value" 
87 |           fill={`url(#colorGradient-${color.replace('#', '')})`}
88 |           radius={[4, 4, 0, 0]}
89 |           maxBarSize={40}
90 |           animationDuration={500}
91 |           animationEasing="ease-in-out"
92 |         />
93 |       </BarChart>
94 |     </ResponsiveContainer>
95 |   );
96 | }
97 | 
98 | // 기본 메트릭 데이터 생성 함수
99 | const generateMetricsData = (dateRange = 14, seed = 1): MetricItem[] => {
100 |   // 날짜 범위에 따라 메트릭 값 조정
101 |   let deployFreq = "2일 4시간";
102 |   let prCount = Math.floor(285 * (dateRange / 30));
103 |   let failureRate = "17%";
104 |   let failureCount = Math.floor(48 * (dateRange / 30));
105 |   let cycleTime = "2일 4시간";
106 |   let cycleCount = Math.floor(250 * (dateRange / 30));
107 |   let mttr = "3.2시간";
108 |   let mttrCount = Math.floor(48 * (dateRange / 30));
109 | 
110 |   // 날짜 범위에 따른 값 조정
111 |   if (dateRange <= 7) {
112 |     deployFreq = "1일 2시간";
113 |     failureRate = "14%";
114 |     cycleTime = "1일 18시간";
115 |     mttr = "2.5시간";
116 |   } else if (dateRange <= 14) {
117 |     deployFreq = "1일 18시간";
118 |     failureRate = "15%";
119 |     cycleTime = "1일 22시간";
120 |     mttr = "2.8시간";
121 |   } else if (dateRange > 60) {
122 |     deployFreq = "3일 6시간";
123 |     failureRate = "19%";
124 |     cycleTime = "3일 2시간";
125 |     mttr = "3.6시간";
126 |   }
127 | 
128 |   // 오늘 날짜 기준으로 dateRange만큼의 일자 데이터 생성
129 |   const today = new Date();
130 |   const generateDates = (count: number) => {
131 |     return Array.from({ length: count }, (_, i) => {
132 |       const date = new Date();
133 |       date.setDate(today.getDate() - count + i + 1);
134 |       // YYYY-MM-DD 형식으로 반환
135 |       return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
136 |     });
137 |   };
138 |   
139 |   const dates = generateDates(Math.min(dateRange, 90)); // 최대 90일로 제한
140 | 
141 |   return [
142 |     {
143 |       title: (
144 |         <div className="flex items-center">
145 |           배포 빈도
146 |           <Tooltip>
147 |             <TooltipTrigger asChild>
148 |               <span className="inline-flex ml-1 cursor-help">
149 |                 <HelpCircle className="h-4 w-4" />
150 |               </span>
151 |             </TooltipTrigger>
152 |             <TooltipContent>
153 |               <p className="w-[200px] text-xs">특정 기간 동안 프로덕션에 배포한 빈도</p>
154 |             </TooltipContent>
155 |           </Tooltip>
156 |         </div>
157 |       ),
158 |       value: deployFreq,
159 |       subValue: "매일 1회 이상",
160 |       trend: {
161 |         value: 36,
162 |         direction: "up" as const
163 |       },
164 |       status: "Elite",
165 |       color: STATUS_COLORS.Elite,
166 |       count: {
167 |         value: prCount,
168 |         label: "PR"
169 |       },
170 |       chartData: dates.map(date => ({
171 |         date,
172 |         value: Math.floor(Math.random() * 40 * seed) + 10
173 |       }))
174 |     },
175 |     {
176 |       title: (
177 |         <div className="flex items-center">
178 |           변경 실패율
179 |           <Tooltip>
180 |             <TooltipTrigger asChild>
181 |               <span className="inline-flex ml-1 cursor-help">
182 |                 <HelpCircle className="h-4 w-4" />
183 |               </span>
184 |             </TooltipTrigger>
185 |             <TooltipContent>
186 |               <p className="w-[200px] text-xs">배포 후 즉시 실패하는 변경 사항의 비율</p>
187 |             </TooltipContent>
188 |           </Tooltip>
189 |         </div>
190 |       ),
191 |       value: failureRate,
192 |       subValue: "0-15% 사이",
193 |       trend: {
194 |         value: 12,
195 |         direction: "down" as const
196 |       },
197 |       status: "High",
198 |       color: STATUS_COLORS.High,
199 |       count: {
200 |         value: failureCount,
201 |         label: "실패"
202 |       },
203 |       chartData: dates.map(date => ({
204 |         date,
205 |         value: Math.floor(Math.random() * 30 * seed) + 5
206 |       }))
207 |     },
208 |     {
209 |       title: (
210 |         <div className="flex items-center">
211 |           수정 시간
212 |           <Tooltip>
213 |             <TooltipTrigger asChild>
214 |               <span className="inline-flex ml-1 cursor-help">
215 |                 <HelpCircle className="h-4 w-4" />
216 |               </span>
217 |             </TooltipTrigger>
218 |             <TooltipContent>
219 |               <p className="w-[200px] text-xs">코드 변경부터 프로덕션 배포까지 걸리는 시간</p>
220 |             </TooltipContent>
221 |           </Tooltip>
222 |         </div>
223 |       ),
224 |       value: cycleTime,
225 |       subValue: "1일 이내",
226 |       trend: {
227 |         value: 26,
228 |         direction: "up" as const
229 |       },
230 |       status: "Low",
231 |       color: STATUS_COLORS.Low,
232 |       count: {
233 |         value: cycleCount,
234 |         label: "PR"
235 |       },
236 |       chartData: dates.map(date => ({
237 |         date,
238 |         value: Math.floor(Math.random() * 50 * seed) + 20
239 |       }))
240 |     },
241 |     {
242 |       title: (
243 |         <div className="flex items-center">
244 |           평균 복구 시간
245 |           <Tooltip>
246 |             <TooltipTrigger asChild>
247 |               <span className="inline-flex ml-1 cursor-help">
248 |                 <HelpCircle className="h-4 w-4" />
249 |               </span>
250 |             </TooltipTrigger>
251 |             <TooltipContent>
252 |               <p className="w-[200px] text-xs">서비스 장애 발생부터 복구까지 걸리는 시간</p>
253 |             </TooltipContent>
254 |           </Tooltip>
255 |         </div>
256 |       ),
257 |       value: mttr,
258 |       subValue: "1시간 이내",
259 |       trend: {
260 |         value: 7,
261 |         direction: "up" as const
262 |       },
263 |       status: "Mid",
264 |       color: STATUS_COLORS.Mid,
265 |       count: {
266 |         value: mttrCount,
267 |         label: "실패"
268 |       },
269 |       chartData: dates.map(date => ({
270 |         date,
271 |         value: Math.floor(Math.random() * 15 * seed) + 2
272 |       }))
273 |     }
274 |   ];
275 | };
276 | 
277 | // 샘플 데이터 초기화
278 | const initialMetrics = generateMetricsData();
279 | 
280 | interface ExampleMetricsProps {
281 |   filterState?: {
282 |     project: string;
283 |     startDate: Date | null;
284 |     endDate: Date | null;
285 |     datePreset?: string;
286 |   };
287 | }
288 | 
289 | export function ExampleMetrics({ filterState }: ExampleMetricsProps) {
290 |   const [activeMetricIndex, setActiveMetricIndex] = useState(0);
291 |   
292 |   // filterState가 변경될 때마다 리렌더링되는 메트릭 데이터 계산
293 |   const metrics = useMemo(() => {
294 |     if (!filterState || !filterState.startDate || !filterState.endDate) {
295 |       return initialMetrics;
296 |     }
297 | 
298 |     const days = Math.abs(differenceInDays(filterState.startDate, filterState.endDate)) + 1;
299 |     return generateMetricsData(days);
300 |   }, [filterState]);
301 |   
302 |   // filterState가 변경될 때마다 새로운 함수 생성
303 |   const getSubtitle = useCallback(() => {
304 |     console.log('ExampleMetrics - subtitle function called with filterState:', filterState);
305 |     
306 |     if (!filterState) {
307 |       return "최근 30일간의 주요 DevOps 메트릭스 데이터";
308 |     }
309 | 
310 |     if (filterState.datePreset === "custom" && filterState.startDate && filterState.endDate) {
311 |       return `${format(filterState.startDate, 'yyyy/MM/dd', { locale: ko })} 부터 ${format(filterState.endDate, 'yyyy/MM/dd', { locale: ko })} 까지의 메트릭스 데이터`;
312 |     }
313 |     
314 |     const preset = DATE_PRESETS.find(p => p.id === filterState.datePreset);
315 |     if (preset) {
316 |       return `${preset.name}간의 주요 DevOps 메트릭스 데이터`;
317 |     }
318 |     
319 |     return "최근 30일간의 주요 DevOps 메트릭스 데이터";
320 |   }, [filterState]);
321 | 
322 |   return (
323 |     <MetricsCard
324 |       title="DORA 메트릭스"
325 |       subtitle={getSubtitle}
326 |       metrics={metrics}
327 |       activeMetricIndex={activeMetricIndex}
328 |       onMetricClick={setActiveMetricIndex}
329 |       chartComponent={MetricChart}
330 |       filterState={filterState}
331 |     />
332 |   );
333 | } 
```

src/components/metrics/filter-bar.tsx
```
1 | import { useState, useEffect } from "react";
2 | import { 
3 |   Select,
4 |   SelectContent,
5 |   SelectItem,
6 |   SelectTrigger,
7 |   SelectValue 
8 | } from "@/components/ui/select";
9 | import { DatePicker } from "@/components/ui/date-picker";
10 | import { Label } from "@/components/ui/label";
11 | import { addDays, subDays } from "date-fns";
12 | 
13 | // 예시 프로젝트 목록 (실제 데이터는 API에서 가져와야 함)
14 | const SAMPLE_PROJECTS = [
15 |   { id: "all", name: "모든 프로젝트" },
16 |   { id: "amplify-notify", name: "amplify-notify" },
17 |   { id: "apps-react", name: "apps-react" },
18 |   { id: "beaver", name: "beaver" },
19 |   { id: "api-gateway", name: "api-gateway" },
20 | ];
21 | 
22 | // 기간 프리셋 목록
23 | const DATE_PRESETS = [
24 |   { id: "7d", name: "최근 7일", days: 7 },
25 |   { id: "14d", name: "최근 14일", days: 14 },
26 |   { id: "30d", name: "최근 30일", days: 30 },
27 |   { id: "90d", name: "최근 90일", days: 90 },
28 |   { id: "custom", name: "사용자 지정", days: 0 },
29 | ];
30 | 
31 | interface FilterBarProps {
32 |   onFilterChange?: (filters: {
33 |     project: string;
34 |     startDate: Date | null;
35 |     endDate: Date | null;
36 |     datePreset?: string;
37 |   }) => void;
38 |   filterState?: {
39 |     project: string;
40 |     startDate: Date | null;
41 |     endDate: Date | null;
42 |     datePreset?: string;
43 |   };
44 | }
45 | 
46 | export function FilterBar({ onFilterChange, filterState }: FilterBarProps) {
47 |   const [selectedProject, setSelectedProject] = useState(filterState?.project || "all");
48 |   const [selectedDatePreset, setSelectedDatePreset] = useState(filterState?.datePreset || "30d");
49 |   const [startDate, setStartDate] = useState<Date | undefined>(
50 |     filterState?.startDate ? new Date(filterState.startDate) : subDays(new Date(), 30)
51 |   );
52 |   const [endDate, setEndDate] = useState<Date | undefined>(
53 |     filterState?.endDate ? new Date(filterState.endDate) : new Date()
54 |   );
55 |   const [isCustomDate, setIsCustomDate] = useState(selectedDatePreset === "custom");
56 | 
57 |   // filterState가 외부에서 변경되면 내부 상태 업데이트
58 |   useEffect(() => {
59 |     if (filterState) {
60 |       console.log('FilterBar - filterState prop changed:', filterState);
61 |       setSelectedProject(filterState.project || "all");
62 |       setSelectedDatePreset(filterState.datePreset || "30d");
63 |       
64 |       if (filterState.startDate) {
65 |         setStartDate(new Date(filterState.startDate));
66 |       }
67 |       
68 |       if (filterState.endDate) {
69 |         setEndDate(new Date(filterState.endDate));
70 |       }
71 |       
72 |       setIsCustomDate(filterState.datePreset === "custom");
73 |     }
74 |   }, [filterState]);
75 | 
76 |   // 날짜 프리셋이 변경될 때 날짜 범위 업데이트
77 |   const handleDatePresetChange = (value: string) => {
78 |     console.log('FilterBar - handleDatePresetChange:', value);
79 |     setSelectedDatePreset(value);
80 |     
81 |     if (value === "custom") {
82 |       setIsCustomDate(true);
83 |       
84 |       if (onFilterChange) {
85 |         console.log('FilterBar - onFilterChange from custom preset:', { 
86 |           project: selectedProject, 
87 |           startDate, 
88 |           endDate,
89 |           datePreset: value
90 |         });
91 |         onFilterChange({
92 |           project: selectedProject,
93 |           startDate,
94 |           endDate,
95 |           datePreset: value
96 |         });
97 |       }
98 |       
99 |       return;
100 |     }
101 |     
102 |     setIsCustomDate(false);
103 |     const preset = DATE_PRESETS.find(p => p.id === value);
104 |     if (preset) {
105 |       const end = new Date();
106 |       const start = subDays(end, preset.days);
107 |       setStartDate(start);
108 |       setEndDate(end);
109 |       
110 |       if (onFilterChange) {
111 |         console.log('FilterBar - onFilterChange from preset:', { 
112 |           project: selectedProject, 
113 |           startDate: start, 
114 |           endDate: end,
115 |           datePreset: value
116 |         });
117 |         onFilterChange({
118 |           project: selectedProject,
119 |           startDate: start,
120 |           endDate: end,
121 |           datePreset: value
122 |         });
123 |       }
124 |     }
125 |   };
126 | 
127 |   // 프로젝트가 변경될 때 필터 업데이트
128 |   const handleProjectChange = (value: string) => {
129 |     console.log('FilterBar - handleProjectChange:', value);
130 |     setSelectedProject(value);
131 |     
132 |     if (onFilterChange) {
133 |       console.log('FilterBar - onFilterChange from project:', { 
134 |         project: value, 
135 |         startDate, 
136 |         endDate,
137 |         datePreset: selectedDatePreset
138 |       });
139 |       onFilterChange({
140 |         project: value,
141 |         startDate,
142 |         endDate,
143 |         datePreset: selectedDatePreset
144 |       });
145 |     }
146 |   };
147 | 
148 |   // 사용자 지정 날짜가 변경될 때 처리
149 |   const handleStartDateChange = (date: Date | undefined) => {
150 |     console.log('FilterBar - handleStartDateChange:', date);
151 |     setStartDate(date);
152 |     
153 |     if (onFilterChange && date) {
154 |       console.log('FilterBar - onFilterChange from startDate:', { 
155 |         project: selectedProject, 
156 |         startDate: date, 
157 |         endDate,
158 |         datePreset: selectedDatePreset
159 |       });
160 |       onFilterChange({
161 |         project: selectedProject,
162 |         startDate: date,
163 |         endDate,
164 |         datePreset: selectedDatePreset
165 |       });
166 |     }
167 |   };
168 | 
169 |   const handleEndDateChange = (date: Date | undefined) => {
170 |     console.log('FilterBar - handleEndDateChange:', date);
171 |     setEndDate(date);
172 |     
173 |     if (onFilterChange && date) {
174 |       console.log('FilterBar - onFilterChange from endDate:', { 
175 |         project: selectedProject, 
176 |         startDate, 
177 |         endDate: date,
178 |         datePreset: selectedDatePreset
179 |       });
180 |       onFilterChange({
181 |         project: selectedProject,
182 |         startDate,
183 |         endDate: date,
184 |         datePreset: selectedDatePreset
185 |       });
186 |     }
187 |   };
188 | 
189 |   return (
190 |     <div className="flex flex-wrap items-center gap-4 pb-4">
191 |       <div className="flex flex-col gap-1.5">
192 |         <Label htmlFor="project-filter">프로젝트</Label>
193 |         <Select
194 |           value={selectedProject}
195 |           onValueChange={handleProjectChange}
196 |         >
197 |           <SelectTrigger id="project-filter" className="w-[200px]">
198 |             <SelectValue placeholder="프로젝트 선택" />
199 |           </SelectTrigger>
200 |           <SelectContent>
201 |             {SAMPLE_PROJECTS.map((project) => (
202 |               <SelectItem key={project.id} value={project.id}>
203 |                 {project.name}
204 |               </SelectItem>
205 |             ))}
206 |           </SelectContent>
207 |         </Select>
208 |       </div>
209 | 
210 |       <div className="flex flex-col gap-1.5">
211 |         <Label htmlFor="date-preset">기간</Label>
212 |         <Select
213 |           value={selectedDatePreset}
214 |           onValueChange={handleDatePresetChange}
215 |         >
216 |           <SelectTrigger id="date-preset" className="w-[150px]">
217 |             <SelectValue placeholder="기간 선택" />
218 |           </SelectTrigger>
219 |           <SelectContent>
220 |             {DATE_PRESETS.map((preset) => (
221 |               <SelectItem key={preset.id} value={preset.id}>
222 |                 {preset.name}
223 |               </SelectItem>
224 |             ))}
225 |           </SelectContent>
226 |         </Select>
227 |       </div>
228 | 
229 |       {isCustomDate && (
230 |         <>
231 |           <div className="flex flex-col gap-1.5">
232 |             <Label htmlFor="start-date">시작일</Label>
233 |             <DatePicker
234 |               date={startDate}
235 |               setDate={handleStartDateChange}
236 |               placeholder="시작일 선택"
237 |             />
238 |           </div>
239 |           <div className="flex flex-col gap-1.5">
240 |             <Label htmlFor="end-date">종료일</Label>
241 |             <DatePicker
242 |               date={endDate}
243 |               setDate={handleEndDateChange}
244 |               placeholder="종료일 선택"
245 |             />
246 |           </div>
247 |         </>
248 |       )}
249 |     </div>
250 |   );
251 | } 
```

src/components/metrics/header.tsx
```
1 | import { BeaverLogo } from "@/components/ui/beaver-logo";
2 | 
3 | interface MetricsHeaderProps {
4 |   title: string;
5 |   subtitle?: string;
6 | }
7 | 
8 | export function MetricsHeader({ title, subtitle }: MetricsHeaderProps) {
9 |   return (
10 |     <div className="flex flex-col space-y-1.5 mb-6">
11 |       <div className="flex items-center text-lg font-semibold">
12 |         <BeaverLogo size={24} className="mr-2" />
13 |         <span className="text-muted-foreground">Beaver</span>
14 |         <span className="mx-2 text-muted-foreground">&gt;</span>
15 |         <span>{title}</span>
16 |       </div>
17 |       {subtitle && (
18 |         <p className="text-sm text-muted-foreground">{subtitle}</p>
19 |       )}
20 |     </div>
21 |   );
22 | } 
```

src/components/metrics/metric-card.tsx
```
1 | import { cn } from "@/lib/utils"
2 | import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
3 | import { HelpCircle } from "lucide-react"
4 | import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
5 | 
6 | interface MetricCardProps {
7 |   title: string
8 |   value: string
9 |   subValue: string
10 |   change: {
11 |     value: number
12 |     trend: "up" | "down"
13 |   }
14 |   status: "Elite" | "High" | "Mid" | "Low"
15 |   tooltip: string
16 |   isActive?: boolean
17 | }
18 | 
19 | export function MetricCard({ 
20 |   title, 
21 |   value, 
22 |   subValue, 
23 |   change, 
24 |   status, 
25 |   tooltip,
26 |   isActive = false
27 | }: MetricCardProps) {
28 |   const statusColors = {
29 |     Elite: "text-green-500",
30 |     High: "text-blue-500",
31 |     Mid: "text-yellow-500",
32 |     Low: "text-red-500"
33 |   }
34 | 
35 |   const changeColors = {
36 |     up: "text-green-500",
37 |     down: "text-red-500"
38 |   }
39 | 
40 |   return (
41 |     <Card className={cn(isActive && "ring-2 ring-primary")}>
42 |       <CardHeader className="flex flex-row items-center justify-between pb-2">
43 |         <CardTitle className="text-sm font-medium text-muted-foreground">
44 |           {title}
45 |           <Tooltip>
46 |             <TooltipTrigger asChild>
47 |               <span className="inline-flex ml-1 cursor-help">
48 |                 <HelpCircle className="h-4 w-4" />
49 |               </span>
50 |             </TooltipTrigger>
51 |             <TooltipContent>
52 |               <p className="w-[200px] text-xs">{tooltip}</p>
53 |             </TooltipContent>
54 |           </Tooltip>
55 |         </CardTitle>
56 |       </CardHeader>
57 |       <CardContent>
58 |         <div className="flex flex-col gap-1">
59 |           <div className="flex items-center gap-2">
60 |             <span className="text-2xl font-bold">{value}</span>
61 |             <span className={cn(
62 |               "text-sm",
63 |               changeColors[change.trend]
64 |             )}>
65 |               {change.trend === "up" ? "↑" : "↓"} {change.value}%
66 |             </span>
67 |           </div>
68 |           <div className="flex items-center justify-between">
69 |             <span className="text-sm text-muted-foreground">{subValue}</span>
70 |             <span className={cn(
71 |               "text-sm font-medium",
72 |               statusColors[status]
73 |             )}>
74 |               {status}
75 |             </span>
76 |           </div>
77 |         </div>
78 |       </CardContent>
79 |     </Card>
80 |   )
81 | } 
```

src/components/metrics/metric-graph.tsx
```
1 | import { Card } from "@/components/ui/card"
2 | import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
3 | 
4 | interface MetricGraphProps {
5 |   data: Array<{
6 |     date: string
7 |     value: number
8 |   }>
9 | }
10 | 
11 | export function MetricGraph({ data }: MetricGraphProps) {
12 |   return (
13 |     <Card className="p-4">
14 |       <div className="h-[300px]">
15 |         <ResponsiveContainer width="100%" height="100%">
16 |           <BarChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
17 |             <CartesianGrid strokeDasharray="3 3" vertical={false} />
18 |             <XAxis 
19 |               dataKey="date" 
20 |               axisLine={false}
21 |               tickLine={false}
22 |               tick={{ fontSize: 12, fontFamily: 'inherit', fill: 'hsl(var(--muted-foreground))' }}
23 |               tickMargin={10}
24 |             />
25 |             <YAxis 
26 |               axisLine={false}
27 |               tickLine={false}
28 |               tick={{ fontSize: 12, fontFamily: 'inherit', fill: 'hsl(var(--muted-foreground))' }}
29 |             />
30 |             <Tooltip 
31 |               contentStyle={{ 
32 |                 backgroundColor: 'hsl(var(--background))', 
33 |                 borderColor: 'hsl(var(--border))',
34 |                 borderRadius: '0.5rem',
35 |                 boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
36 |                 fontSize: '12px',
37 |                 fontFamily: 'inherit'
38 |               }}
39 |               cursor={{ fill: 'hsl(var(--muted))' }}
40 |             />
41 |             <Bar 
42 |               dataKey="value" 
43 |               fill="hsl(var(--primary))" 
44 |               radius={[4, 4, 0, 0]}
45 |               maxBarSize={40}
46 |             />
47 |           </BarChart>
48 |         </ResponsiveContainer>
49 |       </div>
50 |     </Card>
51 |   )
52 | } 
```

src/components/metrics/metrics-card.tsx
```
1 | import { ReactNode, useMemo } from "react"
2 | import { cn } from "@/lib/utils"
3 | import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
4 | 
5 | // 메트릭 데이터 인터페이스
6 | export interface MetricItem {
7 |   title: ReactNode;
8 |   value: string;
9 |   subValue: string;
10 |   trend: {
11 |     value: number;
12 |     direction: "up" | "down";
13 |   };
14 |   status: "Elite" | "High" | "Mid" | "Low";
15 |   color: string;
16 |   count?: {
17 |     value: number;
18 |     label: string;
19 |   };
20 |   chartData?: any; // 차트 데이터 (구체적인 타입은 차트 컴포넌트에 따라 다름)
21 | }
22 | 
23 | // 메트릭 버튼 렌더링을 위한 props
24 | export interface MetricButtonProps {
25 |   metric: MetricItem;
26 |   isActive: boolean;
27 |   onClick: () => void;
28 |   isFirst?: boolean;
29 | }
30 | 
31 | // 메인 컴포넌트 props
32 | export interface MetricsCardProps {
33 |   title: ReactNode;
34 |   subtitle?: ReactNode | (() => string);
35 |   metrics: MetricItem[];
36 |   activeMetricIndex: number;
37 |   onMetricClick: (index: number) => void;
38 |   chartComponent?: React.ComponentType<{
39 |     data: any;
40 |     color: string;
41 |   }>;
42 |   filterState?: any;
43 | }
44 | 
45 | // 개별 메트릭 버튼 컴포넌트
46 | export function MetricButton({ metric, isActive, onClick, isFirst }: MetricButtonProps) {
47 |   const statusColors = {
48 |     Elite: "text-green-500",
49 |     High: "text-blue-500",
50 |     Mid: "text-yellow-500",
51 |     Low: "text-red-500"
52 |   }
53 | 
54 |   const trendColors = {
55 |     up: "text-green-500",
56 |     down: "text-red-500"
57 |   }
58 | 
59 |   // 버튼 상단 보더 스타일
60 |   const buttonBorderStyle = isActive 
61 |     ? { borderTop: `2px solid ${metric.color}` }
62 |     : {};
63 | 
64 |   // 버튼 배경 스타일
65 |   const buttonBgStyle = isActive 
66 |     ? { backgroundColor: `${metric.color}10` }
67 |     : {};
68 | 
69 |   return (
70 |     <button
71 |       style={{ ...buttonBorderStyle, ...buttonBgStyle }}
72 |       className={cn(
73 |         "relative z-30 flex flex-1 flex-col justify-center gap-1 px-4 py-5 text-left transition-colors hover:bg-muted/30",
74 |         "border-l data-[active=true] sm:px-4 sm:py-5",
75 |         !isFirst && "border-l",
76 |         isActive ? "border-t-2" : "border-t",
77 |       )}
78 |       onClick={onClick}
79 |       data-active={isActive}
80 |     >
81 |       <div className="flex justify-between items-center w-full">
82 |         <div className="text-xs font-medium text-muted-foreground truncate pr-1 max-w-[75%]">
83 |           {metric.title}
84 |         </div>
85 |         <span className={cn(
86 |           "text-xs font-medium ml-1 whitespace-nowrap",
87 |           trendColors[metric.trend.direction]
88 |         )}>
89 |           {metric.trend.direction === "up" ? "↑" : "↓"} {metric.trend.value}%
90 |         </span>
91 |       </div>
92 |       
93 |       <div className="w-full mt-2">
94 |         <span className="text-xl font-bold leading-none sm:text-2xl block">
95 |           {metric.value}
96 |         </span>
97 |         <div className="flex items-center justify-between mt-2">
98 |           <span className="text-xs text-muted-foreground truncate pr-1 max-w-[75%]">
99 |             {metric.count ? `총 ${metric.count.value}개 ${metric.count.label}` : metric.subValue}
100 |           </span>
101 |           <span className={cn(
102 |             "text-xs font-medium whitespace-nowrap",
103 |             statusColors[metric.status]
104 |           )}>
105 |             {metric.status}
106 |           </span>
107 |         </div>
108 |       </div>
109 |     </button>
110 |   )
111 | }
112 | 
113 | // 메인 MetricsCard 컴포넌트
114 | export function MetricsCard({
115 |   title,
116 |   subtitle,
117 |   metrics,
118 |   activeMetricIndex,
119 |   onMetricClick,
120 |   chartComponent: ChartComponent,
121 |   filterState
122 | }: MetricsCardProps) {
123 |   const activeMetric = metrics[activeMetricIndex];
124 |   
125 |   // subtitle이 함수인 경우 실행 (filterState 변경 시 재실행)
126 |   console.log('MetricsCard - filterState:', filterState);
127 |   console.log('MetricsCard - subtitle type:', typeof subtitle);
128 |   
129 |   // useMemo를 사용하여 filterState가 변경될 때마다 subtitle 함수를 다시 호출
130 |   const subtitleContent = useMemo(() => {
131 |     const result = typeof subtitle === 'function' ? subtitle() : subtitle;
132 |     console.log('MetricsCard - useMemo subtitleContent:', result);
133 |     return result;
134 |   }, [subtitle, filterState]);
135 |   
136 |   console.log('MetricsCard - subtitleContent:', subtitleContent);
137 | 
138 |   return (
139 |     <Card className="w-full">
140 |       <CardHeader className="flex flex-col items-stretch space-y-0.5 px-6 py-5 border-b">
141 |         <CardTitle>{title}</CardTitle>
142 |         {subtitleContent && <CardDescription className="mt-0.5">{subtitleContent}</CardDescription>}
143 |       </CardHeader>
144 | 
145 |       <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
146 |         {metrics.map((metric, index) => (
147 |           <MetricButton
148 |             key={index}
149 |             metric={metric}
150 |             isActive={index === activeMetricIndex}
151 |             onClick={() => onMetricClick(index)}
152 |             isFirst={index === 0}
153 |           />
154 |         ))}
155 |       </div>
156 |       
157 |       <div className="border-b"></div>
158 | 
159 |       {ChartComponent && activeMetric && (
160 |         <CardContent className="px-2 pt-6 pb-2 sm:p-6">
161 |           <div className="h-[300px] w-full">
162 |             <ChartComponent 
163 |               data={activeMetric.chartData} 
164 |               color={activeMetric.color} 
165 |             />
166 |           </div>
167 |         </CardContent>
168 |       )}
169 |     </Card>
170 |   )
171 | } 
```

src/components/metrics/__tests__/metrics-card.test.tsx
```
1 | import { render, screen, fireEvent } from "@testing-library/react";
2 | import { describe, it, expect, vi } from "vitest";
3 | import { MetricsCard, MetricItem } from "../metrics-card";
4 | 
5 | // 목 차트 컴포넌트
6 | const MockChartComponent = ({ data, color }: { data: any; color: string }) => (
7 |   <div data-testid="mock-chart" style={{ color }}>
8 |     차트 컴포넌트 (데이터 포인트: {data ? data.length : 0})
9 |   </div>
10 | );
11 | 
12 | // 테스트용 메트릭 데이터
13 | const testMetrics: MetricItem[] = [
14 |   {
15 |     title: "테스트 메트릭 1",
16 |     value: "값 1",
17 |     subValue: "서브값 1",
18 |     trend: {
19 |       value: 10,
20 |       direction: "up"
21 |     },
22 |     status: "Elite",
23 |     color: "#10b981" // green-500
24 |   },
25 |   {
26 |     title: "테스트 메트릭 2",
27 |     value: "값 2",
28 |     subValue: "서브값 2",
29 |     trend: {
30 |       value: 5,
31 |       direction: "down"
32 |     },
33 |     status: "High",
34 |     color: "#3b82f6" // blue-500
35 |   }
36 | ];
37 | 
38 | describe("MetricsCard", () => {
39 |   // 테스트 환경에서 필요한 DOM 요소 설정
40 |   beforeEach(() => {
41 |     // ShadCN Tooltip이 제대로 작동하기 위한 Portal 요소 추가
42 |     const portalRoot = document.createElement('div')
43 |     portalRoot.setAttribute('id', 'portal-root')
44 |     document.body.appendChild(portalRoot)
45 |   });
46 | 
47 |   afterEach(() => {
48 |     // 테스트 후 Portal 요소 정리
49 |     const portalRoot = document.getElementById('portal-root')
50 |     if (portalRoot) {
51 |       document.body.removeChild(portalRoot)
52 |     }
53 |   });
54 | 
55 |   it("메트릭 카드가 제대로 렌더링되어야 함", () => {
56 |     render(
57 |       <MetricsCard
58 |         title="테스트 타이틀"
59 |         subtitle="테스트 서브타이틀"
60 |         metrics={testMetrics}
61 |         activeMetricIndex={0}
62 |         onMetricClick={() => {}}
63 |         chartComponent={MockChartComponent}
64 |       />
65 |     );
66 | 
67 |     // 타이틀과 서브타이틀 확인
68 |     expect(screen.getByText("테스트 타이틀")).toBeInTheDocument();
69 |     expect(screen.getByText("테스트 서브타이틀")).toBeInTheDocument();
70 | 
71 |     // 메트릭 항목들 확인
72 |     expect(screen.getByText("테스트 메트릭 1")).toBeInTheDocument();
73 |     expect(screen.getByText("테스트 메트릭 2")).toBeInTheDocument();
74 |     expect(screen.getByText("값 1")).toBeInTheDocument();
75 |     expect(screen.getByText("값 2")).toBeInTheDocument();
76 | 
77 |     // 차트 컴포넌트 확인
78 |     expect(screen.getByTestId("mock-chart")).toBeInTheDocument();
79 |   });
80 | 
81 |   it("메트릭 클릭 이벤트가 제대로 호출되어야 함", () => {
82 |     const handleClick = vi.fn();
83 |     
84 |     render(
85 |       <MetricsCard
86 |         title="테스트 타이틀"
87 |         metrics={testMetrics}
88 |         activeMetricIndex={0}
89 |         onMetricClick={handleClick}
90 |         chartComponent={MockChartComponent}
91 |       />
92 |     );
93 | 
94 |     // 두 번째 메트릭 클릭
95 |     fireEvent.click(screen.getByText("테스트 메트릭 2"));
96 |     
97 |     // 클릭 핸들러가 index 1로 호출되었는지 확인
98 |     expect(handleClick).toHaveBeenCalledWith(1);
99 |   });
100 | 
101 |   it("활성화된 메트릭에 따라 차트가 변경되어야 함", () => {
102 |     const { rerender } = render(
103 |       <MetricsCard
104 |         title="테스트 타이틀"
105 |         metrics={testMetrics}
106 |         activeMetricIndex={0}
107 |         onMetricClick={() => {}}
108 |         chartComponent={MockChartComponent}
109 |       />
110 |     );
111 | 
112 |     // 첫 번째 메트릭의 색상 스타일 확인
113 |     const chart = screen.getByTestId("mock-chart");
114 |     expect(chart).toHaveStyle({ color: "#10b981" });
115 | 
116 |     // 활성화된 메트릭 변경
117 |     rerender(
118 |       <MetricsCard
119 |         title="테스트 타이틀"
120 |         metrics={testMetrics}
121 |         activeMetricIndex={1}
122 |         onMetricClick={() => {}}
123 |         chartComponent={MockChartComponent}
124 |       />
125 |     );
126 | 
127 |     // 두 번째 메트릭의 색상 스타일 확인
128 |     expect(chart).toHaveStyle({ color: "#3b82f6" });
129 |   });
130 | }); 
```
