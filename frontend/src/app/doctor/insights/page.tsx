"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Users, Activity, Brain, PieChart as PieChartIcon, BarChart3, Target, Calendar, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts"

const diagnosisData = [
  { name: 'Hypertension', value: 35 },
  { name: 'Diabetes', value: 25 },
  { name: 'Heart Disease', value: 20 },
  { name: 'Asthma', value: 15 },
  { name: 'Other', value: 5 },
]

const activityData = [
  { name: 'Mon', visits: 12, ai_assists: 8 },
  { name: 'Tue', visits: 15, ai_assists: 12 },
  { name: 'Wed', visits: 10, ai_assists: 7 },
  { name: 'Thu', visits: 18, ai_assists: 15 },
  { name: 'Fri', visits: 22, ai_assists: 19 },
  { name: 'Sat', visits: 8, ai_assists: 5 },
  { name: 'Sun', visits: 5, ai_assists: 2 },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function HealthInsightsPage() {
  const { toast } = useToast()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Insights</h1>
          <p className="text-muted-foreground text-sm">Advanced clinical analytics and patient population trends.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => toast({ title: "Custom Range", description: "Opening calendar for custom date range selection..." })}
          >
            <Calendar className="h-4 w-4" /> Last 30 Days
          </Button>
          <Button 
            className="gap-2"
            onClick={() => toast({ title: "Report Generation", description: "Aggregating clinical data for your monthly report..." })}
          >
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Patients", value: "1,284", trend: "+12.5%", positive: true, icon: Users },
          { label: "Avg. Daily Visits", value: "18.2", trend: "+5.2%", positive: true, icon: Activity },
          { label: "Success Rate", value: "94.2%", trend: "-0.5%", positive: false, icon: Target },
          { label: "AI Insights", value: "48", trend: "+24.3%", positive: true, icon: Brain },
        ].map((stat, i) => (
          <Card 
            key={i} 
            className="border-none shadow-sm hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer"
            onClick={() => toast({ title: stat.label, description: `Filtering trends and historical data for ${stat.label.toLowerCase()}...` })}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-baseline gap-3">
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {stat.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                   {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Clinical Activity</CardTitle>
            <CardDescription>Visits vs AI-assisted diagnoses over the last week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ai_assists" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Diagnosis Distribution</CardTitle>
            <CardDescription>Population health breakdown by condition.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diagnosisData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {diagnosisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {diagnosisData.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">High-Risk Patients</CardTitle>
              <CardDescription>AI-flagged patients requiring immediate follow-up.</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-primary"
              onClick={() => toast({ title: "Risk Stratification", description: "Loading full high-risk patient dashboard..." })}
            >
              View All <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Michael Johnson", risk: "Critical", reason: "Sustained high BP spikes", time: "2h ago" },
                { name: "Sarah Thompson", risk: "High", reason: "Abnormal ECG patterns", time: "4h ago" },
                { name: "Robert Brown", risk: "Elevated", reason: "Medication non-adherence", time: "6h ago" },
              ].map((patient, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/5">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold">{patient.name}</p>
                    <p className="text-[10px] text-muted-foreground">{patient.reason}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={
                      patient.risk === "Critical" ? "bg-rose-500/10 text-rose-600 border-rose-200" :
                      patient.risk === "High" ? "bg-amber-500/10 text-amber-600 border-amber-200" :
                      "bg-blue-500/10 text-blue-600 border-blue-200"
                    }>
                      {patient.risk}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground">{patient.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Operational Insights</CardTitle>
            <CardDescription>Efficiency metrics and bottleneck identification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
               <div className="flex justify-between text-xs font-medium">
                  <span>Avg. Consultation Time</span>
                  <span className="text-primary">14.2 min</span>
               </div>
               <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                 <div className="h-full bg-primary w-[70%]" />
               </div>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between text-xs font-medium">
                  <span>Wait Time Efficiency</span>
                  <span className="text-emerald-500">+15% vs Avg</span>
               </div>
               <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-[85%]" />
               </div>
             </div>
             <div className="p-4 bg-muted/30 rounded-xl space-y-2">
               <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                 <Brain className="h-3 w-3" /> AI Recommendation
               </div>
               <p className="text-xs italic leading-relaxed">
                 "Consider shifting 10% of follow-up visits to tele-health on Fridays to reduce peak corridor congestion and increase throughput by 4%."
               </p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
