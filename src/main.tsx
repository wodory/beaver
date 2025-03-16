import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Tailwind CSS 임포트
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
