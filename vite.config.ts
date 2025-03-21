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
