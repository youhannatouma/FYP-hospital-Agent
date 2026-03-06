"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, TrendingUp, TrendingDown } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
// motion import removed as unused
import { cn } from "@/lib/utils"
import { LogVitalsDialog } from "./dialogs/log-vitals-dialog"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass shadow-premium p-4 border border-border/50 rounded-2xl animate-scale-in">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs font-bold text-foreground">{entry.name}:</span>
              <span className="text-xs font-black text-foreground ml-auto">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function VitalsTracking() {
  const [period, setPeriod] = useState("7d")
  const [vitalsData] = useState([
    { date: "Jan 8", systolic: 135, diastolic: 82, heartRate: 72 },
    { date: "Jan 9", systolic: 138, diastolic: 85, heartRate: 75 },
    { date: "Jan 10", systolic: 132, diastolic: 80, heartRate: 70 },
    { date: "Jan 11", systolic: 140, diastolic: 88, heartRate: 78 },
    { date: "Jan 12", systolic: 136, diastolic: 84, heartRate: 73 },
    { date: "Jan 13", systolic: 137, diastolic: 85, heartRate: 72 },
    { date: "Jan 14", systolic: 134, diastolic: 82, heartRate: 71 },
    { date: "Jan 15", systolic: 137, diastolic: 85, heartRate: 72 },
  ])

  return (
    <Card className="premium-card rounded-[2.5rem] border-none shadow-premium bg-card overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between p-8 pb-4 gap-4">
        <div>
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-foreground tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner-glow">
              <Activity className="h-5 w-5" />
            </div>
            Vitals Analytics
          </CardTitle>
          <p className="text-sm text-muted-foreground font-medium mt-1">Real-time physiological data synthesis</p>
        </div>
        <div className="flex items-center gap-3">
          <LogVitalsDialog />
          <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border/50">
          {["7d", "30d", "90d"].map((p) => (
            <Button
              key={p}
              variant="ghost"
              size="sm"
              onClick={() => setPeriod(p)}
              className={cn(
                "h-8 px-4 rounded-lg text-xs font-black transition-all",
                period === p
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:bg-muted/80"
              )}
            >
              {p.toUpperCase()}
            </Button>
          ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="premium-card p-4 rounded-2xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Blood Pressure</span>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-black text-foreground">137/85</span>
                <span className="text-[10px] font-bold text-amber-500 mb-1 flex items-center gap-0.5">
                   <TrendingUp className="h-3 w-3" /> +2%
                </span>
              </div>
           </div>
           <div className="premium-card p-4 rounded-2xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Heart Rate</span>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-black text-foreground">72<span className="text-sm font-medium ml-1">bpm</span></span>
                <span className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center gap-0.5">
                   <TrendingDown className="h-3 w-3" /> -3%
                </span>
              </div>
           </div>
           <div className="premium-card p-4 rounded-2xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Oxygen Level</span>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-black text-foreground">98%</span>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black mb-1">OPTIMAL</Badge>
              </div>
           </div>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={vitalsData}>
              <defs>
                <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/30" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
              />
              <YAxis
                hide
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="systolic"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSys)"
                name="Systolic"
              />
              <Area
                type="monotone"
                dataKey="heartRate"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                fillOpacity={0}
                strokeDasharray="5 5"
                name="Heart Rate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
