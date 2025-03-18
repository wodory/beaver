import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sidebar } from "@/components/ui/sidebar"
import { BeaverLogo } from "@/components/ui/beaver-logo"
import {
  ChevronDown,
  Search,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  User,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export function AppSidebar({ className, isCollapsed, activeView = 'dashboard', onViewChange }: SidebarProps) {
  const [isProjectOpen, setIsProjectOpen] = useState(true)

  const handleViewChange = (view: string) => {
    if (onViewChange) {
      onViewChange(view);
    }
  }

  return (
    <Sidebar
      className={cn(
        "flex flex-col h-full border-r border-sidebar-border bg-[hsl(var(--sidebar-background))] text-sidebar-foreground transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[80px]" : "w-[250px]",
        className
      )}
      style={{ "--sidebar-width": isCollapsed ? "80px" : "250px" } as React.CSSProperties}
      variant="sidebar"
      collapsible={isCollapsed ? "icon" : "none"}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start px-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground overflow-hidden"
        >
          <BeaverLogo size={isCollapsed ? 24 : 28} className="mr-2 transition-all duration-300 ease-in-out" />
          <span className={cn(
            "transition-all duration-300 ease-in-out",
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}>Beaver v0.1</span>
        </Button>
      </div>

      {/* Search */}
      <div className={cn(
        "px-4 py-2",
        isCollapsed ? "hidden" : ""
      )}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8 bg-sidebar-input" />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <Button 
            variant={activeView === 'dashboard' ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => handleViewChange('dashboard')}
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            <span className={cn(
              "transition-all duration-300 ease-in-out",
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}>대시보드</span>
          </Button>

          <Button 
            variant={activeView === 'dora' ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => handleViewChange('dora')}
          >
            <Users className="mr-2 h-5 w-5" />
            <span className={cn(
              "transition-all duration-300 ease-in-out",
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}>DORA 메트릭스</span>
          </Button>

          <Collapsible
            open={isProjectOpen}
            onOpenChange={setIsProjectOpen}
            className={cn(
              isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
            )}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="mr-2 h-5 w-5" />
                <span className={cn(
                  "transition-all duration-300 ease-in-out",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100"
                )}>프로젝트</span>
                <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 py-2 space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <span>저장소 보기</span>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <span>새 저장소 추가</span>
              </Button>
            </CollapsibleContent>
          </Collapsible>

          <Button variant="ghost" className="w-full justify-start">
            <User className="mr-2 h-5 w-5" />
            <span className={cn(
              "transition-all duration-300 ease-in-out",
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}>내 프로필</span>
          </Button>

          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-5 w-5" />
            <span className={cn(
              "transition-all duration-300 ease-in-out",
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}>설정</span>
          </Button>
        </div>
      </ScrollArea>
    </Sidebar>
  )
} 