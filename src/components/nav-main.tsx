import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  FolderKanban,
  FileText,
  Settings,
  LineChart,
} from "lucide-react"

interface NavMainProps {
  isCollapsed: boolean
}

export function NavMain({ isCollapsed }: NavMainProps) {
  const mainNavItems = [
    {
      title: "Project",
      icon: FolderKanban,
      items: [
        { title: "Project Overview", href: "/project/overview" },
        { title: "DORA Metrics", href: "/project/dora" },
        { title: "Dev Metrics", href: "/project/dev-metrics" },
        { title: "Review Collaboration", href: "/project/review" },
        { title: "Team Wellbeing", href: "/project/wellbeing" },
      ],
    },
    {
      title: "Team",
      icon: Users,
      href: "/team",
    },
    {
      title: "Metrics",
      icon: LineChart,
      href: "/metrics",
    },
    {
      title: "People",
      icon: Users,
      href: "/people",
    },
    {
      title: "Reports",
      icon: FileText,
      href: "/reports",
    },
  ]

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2">
        {mainNavItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "h-12 w-12 p-0"
            )}
            asChild={!!item.href}
          >
            {item.href ? (
              <a href={item.href}>
                <item.icon className={cn("h-4 w-4", isCollapsed ? "mx-auto" : "mr-2")} />
                {!isCollapsed && <span>{item.title}</span>}
              </a>
            ) : (
              <>
                <item.icon className={cn("h-4 w-4", isCollapsed ? "mx-auto" : "mr-2")} />
                {!isCollapsed && <span>{item.title}</span>}
              </>
            )}
          </Button>
        ))}
      </nav>
    </div>
  )
} 