import { useState } from 'react'
// App.css는 index.css로 통합되었으므로 import 구문 제거
import { AppSidebar } from './components/app-sidebar'
import { SiteHeader } from './components/site-header'
import { DoraMetrics } from './components/metrics/dora-metrics'
import { SidebarProvider } from '@/components/ui/sidebar'

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <AppSidebar isCollapsed={isSidebarCollapsed} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <SiteHeader onToggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-auto p-6">
            <DoraMetrics />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default App
