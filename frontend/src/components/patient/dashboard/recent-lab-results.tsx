"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import { FlaskConical, Download, CheckCircle2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

import { useMedicalRecords } from "@/hooks/use-medical-records"
import { useEffect, useState } from "react"
import type { MedicalRecord } from "@/lib/services/repositories/medical-record-repository"
import { LabAnalysisDialog } from "./dialogs/lab-analysis-dialog"
import { toast } from "sonner"

type LabValue = {
  label: string
  value: string
  flag: boolean
}

type LabResultCard = {
  id: string
  title: string
  collected: string
  status: string
  statusColor: string
  icon: typeof CheckCircle2
  values: LabValue[]
  premium: boolean
  originalRecord: MedicalRecord
}

export function RecentLabResults() {
  const { records, loading: isLoading } = useMedicalRecords()
  const [labResults, setLabResults] = useState<LabResultCard[]>([])
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (records) {
      const filtered = records
        .filter((r) => r.record_type === "Lab Result")
        .slice(0, 2)
        .map((r): LabResultCard => {
          const metadata = (r.vitals || r.metadata?.vitals || {}) as Record<string, unknown>
          
          return {
            id: r.id,
            title: r.title || r.record_type,
            collected: `Collected: ${r.date ? new Date(r.date).toLocaleDateString() : (r.created_at ? new Date(r.created_at).toLocaleDateString() : "TBD")}`,
            status: "Verified",
            statusColor: "bg-emerald-500/10 text-emerald-500",
            icon: CheckCircle2,
            values: Object.entries(metadata).map(([label, value]) => ({
              label,
              value: String(value),
              flag: false
            })).slice(0, 4),
            premium: true,
            originalRecord: r,
          }
        })
      setLabResults(filtered)
    }
  }, [records])

  const handleDownloadReport = () => {
    toast.success("Generating Diagnostic Report...", {
      description: "Aggregating latest laboratory telemetry.",
      icon: <Download className="h-4 w-4 text-orange-500" />,
    })
    
    if (labResults.length === 0) {
      toast.error("No Data", { description: "No lab results available to download." })
      return
    }

    let reportText = "PATient DIAGNOSTIC REPORT\n";
    reportText += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    labResults.forEach(r => {
      reportText += `--- ${r.title.toUpperCase()} ---\n`;
      reportText += `${r.collected}\n`;
      reportText += `Status: ${r.status}\n\n`;
      
      r.values.forEach(v => {
        reportText += `${v.label}: ${v.value}\n`;
      });
      reportText += "\n";
    });

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Diagnostic_Report_${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      toast.success("Report Exported", {
        description: "Full diagnostic record is now available in your downloads.",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      })
    }, 1000)
  }

  const handleRetrieveAnalysis = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setIsDialogOpen(true)
  }

  return (
    <div className="premium-card rounded-[2.5rem] border-none shadow-premium bg-card overflow-hidden h-full flex flex-col">
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 shadow-inner-glow">
                 <FlaskConical className="h-5 w-5" />
               </div>
               Diagnostics
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReport}
              className="h-10 px-4 rounded-xl border-border/50 font-black text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all gap-2"
            >
              <Download className="h-3 w-3" />
              Download Report
            </Button>
            <Link href="/patient/lab-results" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4">
              Full Archive
            </Link>
          </div>
        </div>
      </div>
      
      <div className="p-8 pt-4 flex flex-col gap-6 flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
             <Loader2 className="h-6 w-6 text-primary animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Analyzing vitals...</p>
          </div>
        ) : labResults.length === 0 ? (
          <div className="py-10 text-center italic text-sm text-muted-foreground">
             No recent diagnostic findings identified.
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {labResults.map((result, idx) => (
              <m.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "premium-card p-6 rounded-3xl border border-border/30 group transition-all duration-500 relative overflow-hidden",
                  result.premium ? "bg-muted/30" : "bg-transparent"
                )}
              >
                <div className="relative z-10 mb-4 flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold leading-tight tracking-tight text-foreground">
                      {result.title}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {result.collected}
                    </p>
                  </div>
                  <Badge className={cn("rounded-lg border-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest", result.statusColor)}>
                    <result.icon className="mr-1 h-3 w-3" />
                    {result.status}
                  </Badge>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-x-6 gap-y-4">
                  {result.values.map((val) => (
                    <div key={val.label} className="space-y-1">
                      <span className="text-[10px] font-black uppercase leading-none tracking-widest text-muted-foreground">
                        {val.label}
                      </span>
                      <p
                        className={cn(
                          "flex items-center gap-1 text-sm font-black text-foreground"
                        )}
                      >
                        {val.value}
                      </p>
                    </div>
                  ))}
                </div>

                <Button
                  size="sm"
                  onClick={() => handleRetrieveAnalysis(result.originalRecord)}
                  className="mt-6 h-10 w-full gap-2 rounded-xl border border-border/50 bg-background text-[10px] font-black uppercase tracking-widest text-foreground shadow-subtle transition-all hover:border-primary hover:bg-primary hover:text-white group-hover:scale-[1.02]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Retrieve Full Analysis
                </Button>
              </m.div>
            ))}
          </AnimatePresence>
        )}

        <div className="mt-auto pt-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            End of recent findings
          </p>
        </div>
      </div>

      <LabAnalysisDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        record={selectedRecord} 
      />
    </div>
  )
}
