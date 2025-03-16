import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MetricGraphProps {
  data: Array<{
    date: string
    value: number
  }>
}

export function MetricGraph({ data }: MetricGraphProps) {
  return (
    <Card className="p-4">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fontFamily: 'inherit', fill: 'hsl(var(--muted-foreground))' }}
              tickMargin={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fontFamily: 'inherit', fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontFamily: 'inherit'
              }}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
} 