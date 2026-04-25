"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bot, ChevronRight, Stethoscope, Sparkles, ShieldAlert, Activity, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { m, AnimatePresence } from "framer-motion"

interface AiSymptomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSymptom?: string
}

export function AiSymptomDialog({ open, onOpenChange, initialSymptom = "" }: AiSymptomDialogProps) {
  const router = useRouter()
  const [analyzing, setAnalyzing] = useState(true)
  const [complete, setComplete] = useState(false)

  // Trigger mock analysis when dialog opens
  useEffect(() => {
    if (open) {
      setAnalyzing(true)
      setComplete(false)
      const timer = setTimeout(() => {
        setAnalyzing(false)
        setComplete(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Reset when closed
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none bg-card/95 backdrop-blur-2xl shadow-2xl rounded-[2.5rem]">
        <div className="relative overflow-hidden">
          {/* Decorative Header Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
          
          <DialogHeader className="relative z-10 p-8 pb-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner-glow">
                <Bot className="h-5 w-5" />
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary">
                Neural Diagnostics
              </div>
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-foreground leading-none">
              Symptom Analysis
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-base mt-2">
              Processing reported symptoms: <span className="text-primary italic font-bold">"{initialSymptom || 'General checkup'}"</span>
            </DialogDescription>
          </DialogHeader>

          {/* Main Content Area */}
          <div className="relative z-10 px-8 py-4 dialog-content-scrollable min-h-[300px]">
            <AnimatePresence mode="wait">
              {analyzing ? (
                <m.div 
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center space-y-6 py-12"
                >
                  <div className="relative">
                    {/* Animated Rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping-slow" />
                    <div className="absolute -inset-4 rounded-full border border-primary/10 animate-pulse" />
                    
                    <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center relative z-10">
                       <Activity className="h-10 w-10 text-primary animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-center">
                    <p className="text-lg font-black tracking-tight text-foreground">
                       Synthesizing Medical Data
                    </p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                       Cross-referencing global guidelines...
                    </p>
                  </div>
                </m.div>
              ) : (
                <m.div 
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 py-2"
                >
                  {/* Primary Recommendation Card */}
                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 shadow-inner-glow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                       <Stethoscope className="h-20 w-20 text-primary" />
                    </div>
                    
                    <h4 className="flex items-center gap-2 text-sm font-black text-primary uppercase tracking-wider mb-4">
                      <Sparkles className="h-4 w-4" /> Recommended Protocol
                    </h4>
                    <p className="text-base leading-relaxed text-foreground font-medium">
                      Based on neural pattern matching, we've identified a clinical correlation requiring <span className="text-primary font-bold underline underline-offset-4">specialized evaluation</span>.
                    </p>
                    
                    <div className="mt-6 flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/20">
                       <span className="text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Referral Target</span>
                       <Badge className="bg-primary text-white font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase">Cardiology Unit</Badge>
                    </div>
                  </div>

                  {/* Supplemental Guidance */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                       Guidance Objectives
                    </h4>
                    <div className="grid gap-3">
                      {[
                        "Immediate physical stabilization & rest",
                        "Continuous symptom monitoring protocol",
                        "Maintain optimal hydration levels"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-background/50 group">
                           <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center text-xs font-black group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                              {i+1}
                           </div>
                           <span className="text-sm font-bold text-foreground/80">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warning/Disclaimer */}
                  <div className="p-5 rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 flex gap-4 items-start">
                    <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed text-destructive/80 font-bold uppercase tracking-wider">
                      Disclaimer: This AI-generated output is for informational coordination only. It does not constitute formal medical diagnosis or definitive clinical instruction.
                    </p>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative z-10 p-8 pt-4 flex flex-col sm:flex-row gap-4 border-t border-border/30 bg-card/50">
            <Button 
              variant="outline" 
              onClick={() => handleOpenChange(false)} 
              className="h-12 flex-1 rounded-2xl border-border/50 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-all"
            >
              Close Results
            </Button>
            {complete && (
              <Button 
                onClick={() => {
                  handleOpenChange(false)
                  router.push('/patient/appointments')
                }} 
                className={cn(
                  "h-12 flex-1 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-primary font-black text-[10px] uppercase tracking-widest shadow-glow transition-all active:scale-95 flex items-center gap-2"
                )}
              >
                Find Specialists <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
