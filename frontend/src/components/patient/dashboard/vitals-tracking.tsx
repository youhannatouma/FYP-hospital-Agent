// @ts-nocheck
"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useMemo, useState } from "react"
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
import { useUserProfile } from "@/hooks/use-user-profile"
import { useMedicalRecords } from "@/hooks/use-medical-records"
import { calculateAgeFromDob, getHeartRateBaselineByAge, midpoint } from "@/lib/health/heart-rate"
import { toast } from "sonner"
import { Download, CheckCircle2 } from "lucide-react"

const CustomTooltip = ({ active, payload, label }: unknown) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass shadow-premium p-4 border border-border/50 rounded-2xl animate-scale-in">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: unknown, index: number) => (
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
  const { profile } = useUserProfile()
  const { records } = useMedicalRecords()
  
  const age = calculateAgeFromDob(profile?.date_of_birth)
  const hrBaseline = getHeartRateBaselineByAge(age)
  const hrMid = midpoint(hrBaseline.min, hrBaseline.max)

  const vitalsData = useMemo(() => {
    // Filter records that have vitals data
    const sorted = [...records]
      .filter(r => r.vitals && Object.keys(r.vitals).length > 0)
      .sort((a, b) => new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime())
    
    if (sorted.length === 0) {
      // Fallback to a single baseline point if no data yet
      return [
        { date: "N/A", systolic: 120, diastolic: 80, heartRate: hrMid }
      ]
    }

    return sorted.map(r => ({
      date: new Date(r.date || r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      systolic: parseInt(r.vitals.systolic || r.vitals.bp?.split('/')[0] || 120),
      diastolic: parseInt(r.vitals.diastolic || r.vitals.bp?.split('/')[1] || 80),
      heartRate: parseInt(r.vitals.heart_rate || r.vitals.hr || hrMid),
    }))
  }, [records, hrMid])

  const latestVitals = useMemo(() => {
    const sorted = [...records]
      .filter(r => r.vitals && Object.keys(r.vitals).length > 0)
      .sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime())
    
    return sorted[0]?.vitals || { systolic: 120, diastolic: 80, heart_rate: hrMid, oxygen: 98 }
  }, [records, hrMid])

  const handleExport = () => {
    toast.success("Preparing Telemetry Export...", {
      description: "Synthesizing physiological data for clinician review.",
      icon: <Download className="h-4 w-4 text-primary" />,
    })
    
    // Filter records that have vitals
    const vitalsRecords = records.filter(r => r.vitals && Object.keys(r.vitals).length > 0);
    
    if (vitalsRecords.length === 0) {
      toast.error("No Vitals Found", {
        description: "There is no vitals history available to export.",
      })
      return;
    }

    // Generate CSV
    let csvContent = "Date,Type,Systolic,Diastolic,Heart Rate,Oxygen,Weight,Temperature\n";
    vitalsRecords.forEach(r => {
      const date = new Date(r.date || r.created_at).toLocaleDateString();
      const v = r.vitals as Record<string, unknown>;
      
      const sys = v.systolic || v.bp_systolic || '';
      const dia = v.diastolic || v.bp_diastolic || '';
      const hr = v.heart_rate || v.hr || '';
      const o2 = v.oxygen || v.spo2 || '';
      const weight = v.weight || '';
      const temp = v.temperature || v.temp || '';

      csvContent += `${date},${r.record_type},${sys},${dia},${hr},${o2},${weight},${temp}\n`;
    });

    // Create Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Vitals_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      toast.success("Analytics Exported", {
        description: "Your vitals history has been saved securely to your device.",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      })
    }, 500)
  }

  return (
    <Card className="premium-card rounded-[2.5rem] border-none shadow-premium bg-card overflow-hidden h-full">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-10 px-4 rounded-xl border-border/50 font-black text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all gap-2"
          >
            <Download className="h-3 w-3" />
            Export Data
          </Button>
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
                <span className="text-2xl font-black text-foreground">{latestVitals.systolic || 120}/{latestVitals.diastolic || 80}</span>
                <span className="text-[10px] font-bold text-amber-500 mb-1 flex items-center gap-0.5">
                   <TrendingUp className="h-3 w-3" /> +2%
                </span>
              </div>
           </div>
           <div className="premium-card p-4 rounded-2xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Heart Rate</span>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-black text-foreground">{latestVitals.heart_rate || latestVitals.heartRate || hrMid}<span className="text-sm font-medium ml-1">bpm</span></span>
                <span className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center gap-0.5">
                   <TrendingDown className="h-3 w-3" /> {hrBaseline.min}-{hrBaseline.max}
                </span>
              </div>
           </div>
           <div className="premium-card p-4 rounded-2xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Oxygen Level</span>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-black text-foreground">{latestVitals.oxygen || 98}%</span>
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
