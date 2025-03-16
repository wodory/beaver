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
  isCollapsed: boolean
}

export function AppSidebar({ className, isCollapsed }: SidebarProps) {
  const [isProjectOpen, setIsProjectOpen] = useState(true)

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
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="검색..."
            className={cn(
              "pl-8 bg-sidebar-accent text-sidebar-accent-foreground placeholder:text-muted-foreground transition-all duration-300 ease-in-out",
              isCollapsed && "w-8 px-0 pl-8 text-transparent"
            )}
          />
        </div>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 pt-4">
          {/* Project Menu */}
          <div className="flex flex-col gap-1 px-4">
            {!isCollapsed ? (
              <Collapsible open={isProjectOpen} onOpenChange={setIsProjectOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="font-medium">Project</span>
                    <ChevronDown className={cn(
                      "ml-auto h-4 w-4 transition-transform duration-200",
                      isProjectOpen && "rotate-180"
                    )} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-6 flex flex-col gap-1">
                  <Button variant="ghost" className="justify-start pl-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">Project Overview</Button>
                  <Button variant="ghost" className="justify-start pl-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">DORA Metrics</Button>
                  <Button variant="ghost" className="justify-start pl-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">Dev Metrics</Button>
                  <Button variant="ghost" className="justify-start pl-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">Review Collaboration</Button>
                  <Button variant="ghost" className="justify-start pl-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">Team Wellbeing</Button>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Button variant="ghost" className="w-full justify-center p-0">
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Team */}
          <div className="px-4">
            <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <Users className="h-4 w-4" />
              <span className={cn(
                "transition-all duration-300 ease-in-out",
                isCollapsed ? "opacity-0 w-0" : "opacity-100"
              )}>Team</span>
            </Button>
          </div>

          {/* People */}
          <div className="px-4">
            <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <User className="h-4 w-4" />
              <span className={cn(
                "transition-all duration-300 ease-in-out",
                isCollapsed ? "opacity-0 w-0" : "opacity-100"
              )}>People</span>
            </Button>
          </div>

          {/* Reports */}
          <div className="px-4">
            <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <FileText className="h-4 w-4" />
              <span className={cn(
                "transition-all duration-300 ease-in-out",
                isCollapsed ? "opacity-0 w-0" : "opacity-100"
              )}>Reports</span>
            </Button>
          </div>

          {/* Settings */}
          <div className="px-4">
            <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <Settings className="h-4 w-4" />
              <span className={cn(
                "transition-all duration-300 ease-in-out",
                isCollapsed ? "opacity-0 w-0" : "opacity-100"
              )}>Settings</span>
            </Button>
          </div>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <div className="h-6 w-6 rounded-full bg-sidebar-accent" />
          <div className={cn(
            "flex flex-col items-start transition-all duration-300 ease-in-out",
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            <span className="text-sm">Your Photo</span>
            <span className="text-xs text-muted-foreground">Log in/out</span>
          </div>
        </Button>
      </div>
    </Sidebar>
  )
} 