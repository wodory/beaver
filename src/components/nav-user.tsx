import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

interface NavUserProps {
  isCollapsed: boolean
}

export function NavUser({ isCollapsed }: NavUserProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className="mt-auto border-t"
    >
      <nav className="grid gap-1 px-2 py-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            isCollapsed && "h-12 w-12 p-0"
          )}
        >
          <Settings className={cn("h-4 w-4", isCollapsed ? "mx-auto" : "mr-2")} />
          {!isCollapsed && <span>Settings</span>}
        </Button>
      </nav>
    </div>
  )
} 