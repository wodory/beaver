import { Button } from "@/components/ui/button"
import { Menu, Bell, Search } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Input } from "@/components/ui/input"
import { BeaverLogo } from "@/components/ui/beaver-logo"

interface SiteHeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export function SiteHeader({ onToggleSidebar, title = "DORA Metrics" }: SiteHeaderProps) {
  return (
    <header 
      className="flex h-14 items-center gap-4 border-b px-4 lg:px-6 w-full"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="mr-2 flex-none"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">사이드바 토글</span>
      </Button>
      
      <div className="flex-1 flex items-center justify-between min-w-0">
        {/* 왼쪽 영역 */}
        <div className="flex items-center gap-2 min-w-0">
          {/* 검색 부분 주석 처리
          <div className="relative w-60 mr-4 hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="검색..."
              className="w-full rounded-md pl-8"
            />
          </div>
          */}
          <div className="flex items-center overflow-hidden">
            <BeaverLogo size={24} className="mr-2 flex-none" />
            <div className="flex items-center overflow-hidden">
              <span className="text-muted-foreground truncate">Beaver</span>
              <span className="mx-2 text-muted-foreground flex-none">&gt;</span>
              <span className="font-medium truncate">{title}</span>
            </div>
          </div>
        </div>
        
        {/* 오른쪽 영역 */}
        <div className="flex items-center gap-4 ml-4 flex-none">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="sr-only">알림</span>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
} 