import { Button } from "@/components/ui/button"
import { Menu, Bell, Search } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Input } from "@/components/ui/input"

interface SiteHeaderProps {
  onToggleSidebar: () => void
}

export function SiteHeader({ onToggleSidebar }: SiteHeaderProps) {
  return (
    <header 
      className="flex h-14 items-center gap-4 border-b px-4 lg:px-6"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="mr-2"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      
      <div className="w-full flex-1 flex items-center justify-between">
        {/* 왼쪽 영역 */}
        <div className="flex items-center gap-2">
          <div className="relative w-60 mr-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-md pl-8"
            />
          </div>
          <span className="font-medium">DORA Metrics</span>
        </div>
        
        {/* 오른쪽 영역 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
} 