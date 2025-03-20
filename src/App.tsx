import { useState, useEffect } from 'react'
// App.css는 index.css로 통합되었으므로 import 구문 제거
import { AppSidebar } from './components/app-sidebar'
import { SiteHeader } from './components/site-header'
import { FilterBar, FilterState } from './components/ui/FilterBar'
import { MetricsDashboard } from './components/metrics/MetricsDashboard'
// import { DoraMetrics } from './components/metrics/dora-metrics'
import { MetricsPanelCard } from './components/metrics/MetricsPanelCard'
import { TeamMetricsView } from './components/metrics/TeamMetricsView'
import { TrendAnalysisView } from './components/metrics/TrendAnalysisView'
import { SettingsPage } from './components/settings/SettingsPage'
import { SidebarProvider } from '@/components/ui/sidebar'
//import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [filterState, setFilterState] = useState<FilterState>({
    project: 'all',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
    datePreset: '30d'
  })
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [activeView, setActiveView] = useState('dashboard') // 'dashboard', 'dora', 'teams', 'metrics', 'settings'

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

  // 활성 뷰에 따른 타이틀 설정
  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return "GitHub 메트릭스 대시보드";
      case 'dora':
        return "DORA 메트릭스";
      case 'teams':
        return "팀 메트릭스";
      case 'metrics':
        return "메트릭스 분석";
      case 'settings':
        return "설정 및 관리";
      default:
        return "GitHub 메트릭스 대시보드";
    }
  };

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
            title={getViewTitle()} 
          />
          <main className="p-4 pt-2">
            <div className="mb-6">
              <FilterBar
                onFilterChange={handleFilterChange}
                filterState={filterState}
              />
            </div>
            
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                {/* 메트릭스 대시보드 */}
                <MetricsDashboard filterState={filterState} />
              </div>
            )}
            
            {activeView === 'dora' && (
              <div className="space-y-12">
                <MetricsPanelCard filterState={filterState} />
              </div>
            )}
            
            {activeView === 'teams' && (
              <div className="space-y-6">
                {/* 팀 메트릭스 뷰 */}
                <TeamMetricsView />
              </div>
            )}
            
            {activeView === 'metrics' && (
              <div className="space-y-6">
                {/* 메트릭스 분석 뷰 */}
                <TrendAnalysisView />
              </div>
            )}
            
            {activeView === 'settings' && (
              <div className="space-y-6">
                {/* 설정 및 관리 페이지 */}
                <SettingsPage />
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default App
