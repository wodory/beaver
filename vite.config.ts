import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  css: {
    transformer: 'postcss',
    devSourcemap: true, // CSS 소스맵 활성화
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      overlay: false // HMR 오버레이 비활성화
    },
    headers: {
      'Cache-Control': 'no-store' // 브라우저 캐시 비활성화
    },
    proxy: {
      // API 서버로 프록시 설정 추가
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path,
        // 요청 헤더 케이스 보존 설정
        preserveHeaderKeyCase: true,
        // 3001 포트로 리다이렉트할 때 응답 헤더 로깅 (디버깅용)
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
          });
          
          // 요청 로깅
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`[Proxy] 요청 헤더: ${req.headers['content-type'] || '없음'}`);
          });
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  build: {
    target: 'esnext',
    minify: false, // 개발 환경에서는 minify 비활성화
    cssMinify: false
  }
})
