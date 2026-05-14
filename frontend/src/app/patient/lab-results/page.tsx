"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FlaskConical,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Search,
} from "lucide-react"

import { useToast } from "@/components/ui/use-toast"
import { LabReportDetailDialog } from "@/components/patient/dialogs/lab-report-detail-dialog"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMedicalRecords } from "@/hooks/use-medical-records"
import { useEffect, useState } from "react"

type LabResultItem = {
  name: string
  value: string
  unit: string
  range: string
  trend: string
  flag: string | null
}

type LabResultCard = {
  id: string
  testName: string
  collectedDate: string
  orderedBy: string
  status: string
  statusColor: string
  icon: typeof CheckCircle2
  results: LabResultItem[]
}

function TrendIndicator({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-primary" />
  return <Minus className="h-3.5 w-3.5 text-muted-foreground opacity-30" />
}

export default function LabResultsPage() {
  const { toast } = useToast()
  const { records, loading: isLoading } = useMedicalRecords()
  
  const [labResults, setLabResults] = useState<LabResultCard[]>([])
  const [selectedReport, setSelectedReport] = useState<LabResultCard | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    if (records) {
      const filtered: LabResultCard[] = records
        .filter((r) => r.record_type === "Lab Result")
        .map((r) => ({
          id: r.id,
          testName: r.title,
          collectedDate: r.date ? new Date(r.date).toLocaleDateString() : "TBD",
          orderedBy: r.doctor_id ? String(r.doctor_id) : "Staff Physician",
          status: "Verified",
          statusColor: "bg-emerald-500/10 text-emerald-500",
          icon: CheckCircle2,
          results: r.vitals ? Object.entries(r.vitals).map(([name, val]) => ({
            name,
            value: String(val),
            unit: "",
            range: "N/A",
            trend: "stable",
            flag: null
          })) : [
            { name: "Result", value: r.diagnosis || "Normal", unit: "", range: "N/A", trend: "stable", flag: null }
          ]
        }))
      setLabResults(filtered)
    }
  }, [records])

  const handleExportAll = () => {
    toast({
      title: "Archive Exported",
      description: "A comprehensive analysis of your laboratory history is ready.",
    })
  }

  const handleDownloadReport = (testName: string) => {
    toast({
      title: "Protocol Initialized",
      description: `Downloading analysis for ${testName}.`,
    })
  }

  const handleViewReport = (report: LabResultCard) => {
    setSelectedReport(report)
    setShowDetail(true)
  }

  return (
    <m.div 
      className="flex flex-col gap-10 max-w-[1200px] mx-auto pb-24"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between px-2 pt-4">
        <div className="space-y-4">
          <Badge variant="outline" className="border-orange-500/20 text-orange-500 bg-orange-500/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
            Diagnostics Ledger
          </Badge>
          <h1 className="text-4xl font-black text-foreground tracking-tight leading-none lg:text-5xl">
            Lab Analysis
          </h1>
          <p className="text-muted-foreground mt-4 font-medium text-lg max-w-lg leading-relaxed">
            Evidence-based physiological monitoring. Track your biomarkers and metabolic trajectory.
          </p>
        </div>
        <Button 
          size="lg"
          variant="outline"
          className="h-14 px-8 rounded-2xl border-border/50 transition-all font-black text-xs uppercase tracking-widest shadow-subtle group"
          onClick={handleExportAll}
        >
          <Download className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
          Export All findings
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 px-2">
         {[
           { label: "Action required", value: "1", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
           { label: "Normal Balance", value: "2", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
           { label: "Data points", value: "32", icon: FlaskConical, color: "text-blue-500", bg: "bg-blue-500/10" }
         ].map((stat, i) => (
           <Card key={i} className="premium-card rounded-3xl border-none bg-card/30 shadow-premium p-6 flex items-center gap-5">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner-glow", stat.bg, stat.color)}>
                 <stat.icon className="h-6 w-6" />
              </div>
              <div>
                 <p className="text-3xl font-black text-foreground leading-none">{stat.value}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-50">{stat.label}</p>
              </div>
           </Card>
         ))}
      </div>

      {/* Lab Results Feed */}
      <div className="flex flex-col gap-8 px-2">
        <AnimatePresence mode="popLayout">
          {labResults.map((lab, idx) => (
            <m.div
              key={lab.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="premium-card rounded-[2.5rem] border-none shadow-premium bg-card overflow-hidden group">
                <div className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner-glow">
                         <FlaskConical className="h-7 w-7" />
                      </div>
                      <div className="space-y-1">
                         <h3 className="text-xl font-black text-foreground tracking-tight underline decoration-primary/20 underline-offset-4 group-hover:text-primary transition-colors">
                           {lab.testName}
                         </h3>
                         <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><CalendarDays className="h-3 w-3" /> {lab.collectedDate}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span>{lab.orderedBy}</span>
                         </div>
                      </div>
                   </div>
                   <Badge className={cn("px-3 py-1 mx-auto md:mx-0 rounded-full border-none text-[10px] font-black uppercase tracking-widest", lab.statusColor)}>
                      <lab.icon className="h-3 w-3 mr-2" />
                      {lab.status}
                   </Badge>
                </div>

                <CardContent className="p-8 pt-6">
                  <div className="rounded-[1.5rem] border border-border/30 overflow-hidden bg-muted/20">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border/30">
                      <span className="md:col-span-1">Biomarker</span>
                      <span>Measurement</span>
                      <span className="hidden md:block">Unit</span>
                      <span className="hidden md:block">Ref. Range</span>
                      <span className="hidden md:block">Trend</span>
                    </div>
                    {lab.results.map((result: LabResultItem, rIdx: number) => (
                      <div
                        key={rIdx}
                        className="grid grid-cols-2 md:grid-cols-5 gap-4 px-6 py-5 text-sm items-center border-t border-border/10 hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-black text-foreground uppercase tracking-tight">
                          {result.name}
                        </span>
                        <div className="flex flex-col md:block">
                           <span className={cn("text-lg font-black", result.flag ? "text-amber-500" : "text-foreground")}>
                            {result.value}
                           </span>
                           <span className="md:hidden text-[10px] font-bold text-muted-foreground uppercase">{result.unit} • {result.range}</span>
                        </div>
                        <span className="hidden md:block text-xs font-bold text-muted-foreground uppercase">{result.unit}</span>
                        <span className="hidden md:block text-xs font-bold text-muted-foreground uppercase opacity-50">{result.range}</span>
                        <div className="hidden md:flex items-center">
                          <TrendIndicator trend={result.trend} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button 
                      className="h-11 px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-black text-[10px] uppercase tracking-widest shadow-glow gap-2 active:scale-95 transition-all"
                      onClick={() => handleDownloadReport(lab.testName)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Protocol PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-11 px-8 rounded-xl border-border/50 font-black text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all gap-2"
                      onClick={() => handleViewReport(lab)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Deep Analysis
                      <ArrowRight className="h-3.5 w-3.5 ml-1 opacity-30" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      <LabReportDetailDialog 
        open={showDetail} 
        onOpenChange={setShowDetail} 
        report={selectedReport} 
      />
    </m.div>
  )
}
