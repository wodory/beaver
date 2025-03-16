import { useState } from 'react'
// App.css는 index.css로 통합되었으므로 import 구문 제거
import { AppSidebar } from './components/app-sidebar'
import { SiteHeader } from './components/site-header'
import { FilterBar } from './components/layout/filter-bar'
import { DoraMetrics } from './components/metrics/dora-metrics'
import { SidebarProvider } from '@/components/ui/sidebar'

interface FilterState {
  project: string;
  startDate: Date | null;
  endDate: Date | null;
  datePreset?: string;
}

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [filterState, setFilterState] = useState<FilterState>({
    project: 'all',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
    datePreset: '30d'
  })

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // 사이드바 너비 계산 (접혔을 때와 펼쳤을 때)
  const sidebarWidth = isSidebarCollapsed ? 80 : 250 // 사이드바 컴포넌트의 너비와 일치시켜야 함

  const handleFilterChange = (filters: FilterState) => {
    setFilterState(filters)
  }

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen overflow-hidden" style={{ backgroundColor: 'hsl(var(--background))' }}>
        {/* Sidebar */}
        <div className="flex-none transition-all duration-300 ease-in-out" style={{ width: `${sidebarWidth}px` }}>
          <AppSidebar isCollapsed={isSidebarCollapsed} />
        </div>
        
        {/* Screen - flexbox로 남은 공간을 자동으로 채움 */}
        <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <SiteHeader onToggleSidebar={toggleSidebar} title="DORA 메트릭스" />
          
          {/* Filter */}
          <div className="px-4 sm:px-6 pt-4 pb-3 border-b overflow-x-auto">
            <FilterBar onFilterChange={handleFilterChange} />
          </div>
          
          {/* Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            <DoraMetrics filterState={filterState} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default App
