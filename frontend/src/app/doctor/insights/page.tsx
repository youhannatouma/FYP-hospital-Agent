"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"
import { ReviewInsightDialog } from "@/components/doctor/dialogs/review-insight-dialog"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Users,
  Activity,
  AlertTriangle,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react"
import { m, AnimatePresence } from "framer-motion"

const patientMetrics = [
  { label: "Total Patients", value: "248", trend: "+12", trendUp: true, icon: Users, color: "bg-blue-500/10 text-blue-600", primary: true },
  { label: "High-Risk", value: "18", trend: "+3", trendUp: true, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
  { label: "Recovery", value: "94%", trend: "+2%", trendUp: true, icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-600" },
  { label: "Load", value: "12/day", trend: "-1", trendUp: false, icon: Activity, color: "bg-amber-500/10 text-amber-600" },
]

const aiInsights = [
  {
    id: 1,
    category: "High Risk",
    title: "3 patients show elevated cardiovascular risk indicators",
    description: "Patients John Doe, Emily Davis, and Robert Brown have combined risk scores above threshold. Consider scheduling priority follow-ups.",
    severity: "high",
  },
  {
    id: 2,
    category: "Medication",
    title: "Potential drug interaction flagged for 2 patients",
    description: "Cross-reference of current prescriptions reveals a possible interaction between Lisinopril and NSAID usage in 2 patients.",
    severity: "medium",
  },
  {
    id: 3,
    category: "Preventive",
    title: "12 patients are overdue for annual screenings",
    description: "Based on appointment history, 12 patients have not had their annual physical or relevant screenings in over 12 months.",
    severity: "low",
  },
]

const severityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-amber-500/10 text-amber-600",
  low: "bg-blue-500/10 text-blue-600",
}

const diagnosisTrends = [
  { diagnosis: "Hypertension", count: 48, trend: "up" },
  { diagnosis: "Type 2 Diabetes", count: 32, trend: "stable" },
  { diagnosis: "Hypercholesterolemia", count: 27, trend: "up" },
  { diagnosis: "Asthma", count: 15, trend: "down" },
  { diagnosis: "Anxiety / Depression", count: 22, trend: "up" },
]

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <ArrowUp className="h-3.5 w-3.5 text-destructive" />
  if (trend === "down") return <ArrowDown className="h-3.5 w-3.5 text-emerald-600" />
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

export default function DoctorInsightsPage() {
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<any>(null)

  const handleReview = (insight: any) => {
    setSelectedInsight(insight)
    setIsReviewOpen(true)
  }

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-10 max-w-[1200px] mx-auto pb-20"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between px-2">
        <div>
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
            Population Analytics
          </Badge>
          <h1 className="text-4xl font-black text-foreground tracking-tight leading-none">
            Health Insights
          </h1>
          <p className="text-muted-foreground mt-3 font-medium text-lg max-w-lg">
            AI-powered clinical intelligence identifying risks and opportunities across your patient directory.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-3 border-border/50 text-foreground h-11 px-6 rounded-xl hover:bg-muted/50 transition-all font-bold"
          onClick={() => toast({ title: "Export", description: "Generating insights report..." })}
        >
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Asymmetric Metric Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 px-2">
         {patientMetrics.map((metric, idx) => (
          <m.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className={cn(
               "premium-card p-6 rounded-3xl relative overflow-hidden group min-h-[160px] flex flex-col justify-between",
               metric.primary ? "md:col-span-2 lg:col-span-2 bg-slate-900 text-white border-slate-800 shadow-2xl" : "bg-card shadow-sm"
            )}
          >
            {metric.primary && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-indigo-500/10 opacity-50" />
            )}
            
            <div className="relative z-10 flex justify-between items-start">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                metric.primary ? "bg-white/10" : metric.color
              )}>
                <metric.icon className="h-6 w-6" />
              </div>
              <Badge 
                variant="secondary" 
                className={cn(
                  "border-none text-[10px] font-black px-2 py-0.5 rounded-lg",
                  metric.trendUp ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600",
                  metric.primary && "bg-white/10 text-white"
                )}
              >
                {metric.trend}
              </Badge>
            </div>

            <div className="relative z-10 mt-auto">
              <p className={cn(
                "text-sm font-bold uppercase tracking-widest",
                metric.primary ? "text-slate-400" : "text-muted-foreground"
              )}>
                {metric.label}
              </p>
              <h3 className="text-4xl font-black mt-1 leading-none tracking-tighter">
                {metric.value}
              </h3>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </m.div>
        ))}
      </div>

      <div className="px-2">
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="bg-muted/50 p-1.5 rounded-2xl mb-8 border border-border/50 max-w-fit">
            <TabsTrigger value="insights" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              Clinical Insights
            </TabsTrigger>
            <TabsTrigger value="trends" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              Diagnosis Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="mt-0 outline-none">
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {aiInsights.map((insight, idx) => (
                  <m.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="premium-card rounded-2xl overflow-hidden hover:border-primary/30 group border-none shadow-premium">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row items-stretch">
                          <div className={cn(
                            "w-2 shrink-0 transition-colors duration-500",
                            severityColors[insight.severity].split(" ").pop()
                          )} />
                          <div className="flex-1 p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-8">
                            <div className="flex items-start gap-5">
                              <div className={cn(
                                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110",
                                severityColors[insight.severity]
                              )}>
                                <Brain className="h-7 w-7" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={cn("border-none text-[10px] font-black uppercase tracking-widest", severityColors[insight.severity])}>
                                    {insight.category}
                                  </Badge>
                                </div>
                                <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight">{insight.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground font-medium max-w-2xl">{insight.description}</p>
                              </div>
                            </div>
                            <Button
                              size="lg"
                              variant="outline"
                              className="border-border/50 text-foreground shrink-0 px-8 font-bold rounded-xl bg-muted/30 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                              onClick={() => handleReview(insight)}
                            >
                              Take Action
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-0 outline-none">
            <Card className="premium-card rounded-3xl overflow-hidden min-h-[400px] border-none shadow-premium">
              <CardHeader className="p-8 border-b border-border/50 bg-muted/10">
                <CardTitle className="text-2xl font-black text-foreground tracking-tight">Diagnosis Velocity</CardTitle>
                <p className="text-sm text-muted-foreground font-medium">Top findings across your practice in the last 90 days</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col gap-6">
                  {diagnosisTrends.map((item, idx) => (
                    <m.div 
                      key={item.diagnosis} 
                      className="flex items-center gap-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <span className="w-48 text-sm font-bold text-foreground shrink-0 uppercase tracking-tight">{item.diagnosis}</span>
                      <div className="flex-1 h-3 rounded-full bg-muted/50 overflow-hidden relative inner-glow">
                        <m.div
                          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / 50) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 + idx * 0.1, ease: "circOut" }}
                        />
                      </div>
                      <div className="w-16 flex items-center justify-end gap-2">
                         <span className="text-lg font-black text-foreground">{item.count}</span>
                         <TrendIcon trend={item.trend} />
                      </div>
                    </m.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ReviewInsightDialog 
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        insight={selectedInsight}
      />
    </m.div>
  )
}
