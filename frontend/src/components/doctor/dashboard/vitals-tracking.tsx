"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const vitalsData = [
  { date: "Jan 8", systolic: 135, diastolic: 82, heartRate: 72 },
  { date: "Jan 9", systolic: 138, diastolic: 85, heartRate: 75 },
  { date: "Jan 10", systolic: 132, diastolic: 80, heartRate: 70 },
  { date: "Jan 11", systolic: 140, diastolic: 88, heartRate: 78 },
  { date: "Jan 12", systolic: 136, diastolic: 84, heartRate: 73 },
  { date: "Jan 13", systolic: 137, diastolic: 85, heartRate: 72 },
  { date: "Jan 14", systolic: 134, diastolic: 82, heartRate: 71 },
  { date: "Jan 15", systolic: 137, diastolic: 85, heartRate: 72 },
]

export function VitalsTracking() {
  const [period] = useState("7d")

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <Activity className="h-5 w-5 text-primary" />
          Vitals Tracking
        </CardTitle>
        <Select defaultValue={period}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vitalsData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                name="Systolic"
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--chart-3))" }}
                name="Diastolic"
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--destructive))" }}
                name="Heart Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
