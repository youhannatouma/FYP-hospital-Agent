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
    <Card className="premium-card rounded-[2.5rem] border-none shadow-premium overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <CardTitle className="flex items-center gap-2 text-xl font-black text-card-foreground">
          <Activity className="h-6 w-6 text-primary" />
          Vitals Tracking
        </CardTitle>
        <Select defaultValue={period}>
          <SelectTrigger className="w-36 h-10 rounded-xl bg-muted/50 border-border/50 font-bold text-xs uppercase tracking-widest">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/50">
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vitalsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/30" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "16px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "10px", fontWeight: "black", textTransform: "uppercase", letterSpacing: "0.05em" }} 
              />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="hsl(var(--primary))"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Systolic"
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="hsl(var(--accent))"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Diastolic"
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="hsl(var(--destructive))"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Heart Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
