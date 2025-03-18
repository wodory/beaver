import { useState, useEffect } from 'react'
// App.css는 index.css로 통합되었으므로 import 구문 제거
import { AppSidebar } from './components/app-sidebar'
import { SiteHeader } from './components/site-header'
import { FilterBar } from './components/metrics/filter-bar'
import { MetricsDashboard } from './components/metrics/MetricsDashboard'
import { DoraMetrics } from './components/metrics/dora-metrics'
import { ExampleMetrics } from './components/metrics/example-metrics'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [activeView, setActiveView] = useState('dashboard') // 'dashboard' 또는 'dora'

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // 사이드바 너비 계산 (접혔을 때와 펼쳤을 때)
  const sidebarWidth = isSidebarCollapsed ? 80 : 250 // 사이드바 컴포넌트의 너비와 일치시켜야 함

  // 브라우저 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 메인 컨텐츠 영역의 너비 계산
  const mainContentWidth = windowWidth - sidebarWidth

  const handleFilterChange = (filters: FilterState) => {
    console.log('App - handleFilterChange called with:', filters);
    setFilterState(filters);
    console.log('App - filterState updated:', filters);
  }

  // 뷰 전환 핸들러
  const handleViewChange = (view: string) => {
    setActiveView(view);
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar 
          isCollapsed={isSidebarCollapsed} 
          onViewChange={handleViewChange}
          activeView={activeView}
        />
        <div 
          className="flex-1 overflow-auto"
          style={{ width: `${mainContentWidth}px`, maxWidth: '100%' }}
        >
          <SiteHeader 
            onToggleSidebar={toggleSidebar} 
            title={activeView === 'dashboard' ? "GitHub 메트릭스 대시보드" : "DORA 메트릭스"} 
          />
          <main className="p-4 pt-2">
            <div className="mb-6">
              <FilterBar
                onFilterChange={handleFilterChange}
                filterState={filterState}
              />
            </div>
            
            {activeView === 'dashboard' ? (
              <div className="space-y-6">
                {/* 메트릭스 대시보드 */}
                <MetricsDashboard filterState={filterState} />
              </div>
            ) : (
              <div className="space-y-12">
                {/* 기존 DORA 메트릭스 */}
                <DoraMetrics filterState={filterState} />

                {/* 새로운 메트릭스 카드 */}
                <div className="border-t pt-8">
                  <h2 className="text-lg font-semibold mb-4">새로운 메트릭스 카드</h2>
                  <ExampleMetrics filterState={filterState} />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default App
