import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface MetricCardProps {
  title: string
  value: string
  subValue: string
  change: {
    value: number
    trend: "up" | "down"
  }
  status: "Elite" | "High" | "Mid" | "Low"
  tooltip: string
  isActive?: boolean
}

export function MetricCard({ 
  title, 
  value, 
  subValue, 
  change, 
  status, 
  tooltip,
  isActive = false
}: MetricCardProps) {
  const statusColors = {
    Elite: "text-green-500",
    High: "text-blue-500",
    Mid: "text-yellow-500",
    Low: "text-red-500"
  }

  const changeColors = {
    up: "text-green-500",
    down: "text-red-500"
  }

  return (
    <Card className={cn(isActive && "ring-2 ring-primary")}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex ml-1 cursor-help">
                <HelpCircle className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[200px] text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{value}</span>
            <span className={cn(
              "text-sm",
              changeColors[change.trend]
            )}>
              {change.trend === "up" ? "↑" : "↓"} {change.value}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{subValue}</span>
            <span className={cn(
              "text-sm font-medium",
              statusColors[status]
            )}>
              {status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 