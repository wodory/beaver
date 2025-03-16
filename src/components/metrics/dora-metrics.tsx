import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricCard } from "./metric-card"
import { MetricGraph } from "./metric-graph"

const METRICS_DATA = {
  deploymentFrequency: {
    title: "Deployment Frequency",
    value: "2d 4hrs",
    subValue: "285 Total PRs",
    change: { value: 36, trend: "up" },
    status: "Elite",
    tooltip: "How often an organization successfully releases to production",
    graphData: Array.from({ length: 30 }, (_, i) => ({
      date: `Jan ${i + 1}`,
      value: Math.floor(Math.random() * 40) + 10
    }))
  },
  changeFailureRate: {
    title: "Change Failure Rate",
    value: "17%",
    subValue: "48 Total Failures",
    change: { value: 12, trend: "down" },
    status: "High",
    tooltip: "Percentage of deployments causing a failure in production",
    graphData: Array.from({ length: 30 }, (_, i) => ({
      date: `Jan ${i + 1}`,
      value: Math.floor(Math.random() * 30) + 5
    }))
  },
  cycleTime: {
    title: "Cycle Time",
    value: "2d 4hrs",
    subValue: "243 Total PRs",
    change: { value: 26, trend: "up" },
    status: "Low",
    tooltip: "Time it takes to deliver changes from code commit to production",
    graphData: Array.from({ length: 30 }, (_, i) => ({
      date: `Jan ${i + 1}`,
      value: Math.floor(Math.random() * 50) + 20
    }))
  },
  meanTimeToResponse: {
    title: "Mean Time to Response",
    value: "3.2hrs",
    subValue: "48 Total Failures",
    change: { value: 7, trend: "up" },
    status: "Mid",
    tooltip: "How long it takes to recover from a failure in production",
    graphData: Array.from({ length: 30 }, (_, i) => ({
      date: `Jan ${i + 1}`,
      value: Math.floor(Math.random() * 6) + 1
    }))
  }
} as const

type MetricKey = keyof typeof METRICS_DATA

export function DoraMetrics() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("deploymentFrequency")

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(METRICS_DATA) as MetricKey[]).map((key) => (
          <div key={key} className="cursor-pointer" onClick={() => setSelectedMetric(key)}>
            <MetricCard 
              {...METRICS_DATA[key]} 
              isActive={selectedMetric === key}
            />
          </div>
        ))}
      </div>
      <MetricGraph data={METRICS_DATA[selectedMetric].graphData} />
    </div>
  )
} 