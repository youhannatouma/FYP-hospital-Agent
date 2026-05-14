"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Stethoscope, 
  Activity,
  CheckCircle2,
  Clock,
  Printer
} from "lucide-react"
import type { MedicalRecord } from "@/lib/services/repositories/medical-record-repository"

interface LabAnalysisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: MedicalRecord | null
}

export function LabAnalysisDialog({ open, onOpenChange, record }: Readonly<LabAnalysisDialogProps>) {
  if (!record) return null

  const vitals = record.vitals || (record.metadata?.vitals as Record<string, unknown>) || {}
  const dateStr = new Date(record.date || record.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden border-none rounded-[2rem] shadow-premium bg-card">
        <div className="flex flex-col h-full">
          {/* Premium Header */}
          <div className="p-8 pb-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <FileText className="w-32 h-32 rotate-12" />
             </div>
             
             <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                   <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                      Diagnostic Intelligence
                   </Badge>
                   <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8">
                         <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8">
                         <Download className="h-4 w-4" />
                      </Button>
                   </div>
                </div>
                
                <DialogTitle className="text-3xl font-black tracking-tight leading-tight">
                   {record.title || record.record_type}
                </DialogTitle>
                
                <div className="flex flex-wrap items-center gap-6 mt-2">
                   <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-slate-300">{dateStr}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-slate-300">Ref: {record.doctor_name || "Care Team"}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-400">Verified Result</span>
                   </div>
                </div>
             </div>
          </div>

          <ScrollArea className="flex-1 p-8">
            <div className="space-y-10">
              {/* Vitals / Quantitative Data */}
              <section className="space-y-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Quantitative Analysis
                 </h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {Object.entries(vitals).map(([key, value]) => (
                       <div key={key} className="premium-card p-4 rounded-2xl bg-muted/30 border border-border/50">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
                             {key.replaceAll('_', ' ')}
                          </span>
                          <span className="text-xl font-black text-foreground">
                             {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                          </span>
                       </div>
                    ))}
                 </div>
              </section>

              {/* Diagnosis & Findings */}
              <section className="space-y-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" /> Clinical Findings
                 </h3>
                 <div className="premium-card p-6 rounded-[2rem] bg-card border border-border/50 shadow-subtle space-y-6">
                    <div className="space-y-2">
                       <h4 className="text-xs font-black uppercase tracking-widest text-primary">Diagnosis</h4>
                       <p className="text-base font-bold text-foreground leading-relaxed">
                          {record.diagnosis || "No formal diagnosis recorded."}
                       </p>
                    </div>
                    
                    <div className="h-px bg-border/30" />
                    
                    <div className="space-y-2">
                       <h4 className="text-xs font-black uppercase tracking-widest text-primary">Summary Analysis</h4>
                       <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                          {record.clinical_notes || "Comprehensive diagnostic summary pending further specialist review."}
                       </p>
                    </div>

                    <div className="space-y-2">
                       <h4 className="text-xs font-black uppercase tracking-widest text-primary">Recommended Action</h4>
                       <p className="text-sm text-muted-foreground leading-relaxed font-medium italic bg-muted/20 p-4 rounded-xl border border-dashed border-border/50">
                          {record.treatment || "No immediate action required. Continue monitoring."}
                       </p>
                    </div>
                 </div>
              </section>

              {/* Footer / Disclaimer */}
              <div className="flex items-center gap-3 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                 <Clock className="h-5 w-5 text-primary shrink-0" />
                 <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                    This analysis was generated on <span className="text-foreground font-bold">{dateStr}</span> and has been verified by the attending physician. 
                    Please consult your doctor before making any changes to your health regimen based on this data.
                 </p>
              </div>
            </div>
          </ScrollArea>
          
          <div className="p-6 border-t border-border/30 bg-muted/10 flex justify-end gap-3">
             <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold text-xs uppercase tracking-widest h-11 px-8 transition-all">
                Close Analysis
             </Button>
             <Button className="rounded-xl font-black text-xs uppercase tracking-widest h-11 px-8 shadow-glow bg-primary text-white hover:bg-primary/90 transition-all gap-2">
                <Download className="h-4 w-4" /> Download PDF
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
