"use client"

import * as React from "react"
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
  Search,
  Loader2,
} from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { LabReportDetailDialog } from "@/components/patient/dialogs/lab-report-detail-dialog"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"

function TrendIndicator({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-primary" />
  return <Minus className="h-3.5 w-3.5 text-muted-foreground opacity-30" />
}

export default function LabResultsPage() {
  const { toast } = useToast()
  const { medicalRecords } = useHospital()
  const { getToken } = useAuth()
  
  const [reports, setReports] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedReport, setSelectedReport] = React.useState<any | null>(null)
  const [showDetail, setShowDetail] = React.useState(false)

  React.useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)
        const token = await getToken()
        const data = await medicalRecords.getMyRecords(token || undefined)
        
        // Filter for Lab Results that are completed
        const labData = data
          .filter((r: any) => r.record_type === "Lab Result" && r.results)
          .map((r: any) => {
            const resData = typeof r.results === 'string' ? JSON.parse(r.results) : r.results
            return {
              id: r.record_id,
              testName: resData.testName || r.diagnosis,
              collectedDate: resData.collectedDate || new Date(r.created_at).toDateString(),
              orderedBy: `Dr. ${r.doctor_name || "Staff"}`,
              status: "Completed",
              statusColor: "bg-emerald-500/10 text-emerald-500",
              icon: CheckCircle2,
              results: resData.biomarkers || []
            }
          })
        
        setReports(labData)
      } catch (err) {
        console.error("Failed to fetch lab results:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchResults()
  }, [medicalRecords, getToken])

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

  const handleViewReport = (report: any) => {
    setSelectedReport(report)
    setShowDetail(true)
  }

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-10 max-w-[1200px] mx-auto pb-24 px-4 sm:px-6"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between pt-8">
        <div className="space-y-4">
          <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
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
          Export All Findings
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Analyzing Bio-data...</p>
        </div>
      ) : reports.length === 0 ? (
        <Card className="premium-card rounded-[2.5rem] border-none shadow-premium bg-card p-20 text-center">
           <FlaskConical className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
           <h3 className="text-2xl font-black text-foreground mb-2">No Lab Results Yet</h3>
           <p className="text-muted-foreground font-medium">Your diagnostic history will appear here once labs are processed.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          <AnimatePresence mode="popLayout">
            {reports.map((lab, idx) => (
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
                           <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
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
                      {lab.results.map((result: any, rIdx: number) => (
                        <div
                          key={rIdx}
                          className="grid grid-cols-2 md:grid-cols-5 gap-4 px-6 py-5 text-sm items-center border-t border-border/10 hover:bg-muted/30 transition-colors"
                        >
                          <span className="font-black text-foreground uppercase tracking-tight">
                            {result.name}
                          </span>
                          <div className="flex flex-col md:block">
                             <span className="text-lg font-black text-foreground">
                              {result.value}
                             </span>
                             <span className="md:hidden text-[10px] font-bold text-muted-foreground uppercase">{result.unit} • {result.range}</span>
                          </div>
                          <span className="hidden md:block text-xs font-bold text-muted-foreground uppercase">{result.unit}</span>
                          <span className="hidden md:block text-xs font-bold text-muted-foreground uppercase opacity-50">{result.range}</span>
                          <div className="hidden md:flex items-center">
                            <TrendIndicator trend={result.trend || "stable"} />
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
      )}

      <LabReportDetailDialog 
        open={showDetail} 
        onOpenChange={setShowDetail} 
        report={selectedReport} 
      />
    </m.div>
  )
}
