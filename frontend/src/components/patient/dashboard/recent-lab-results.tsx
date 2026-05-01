"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import { FlaskConical, Download, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function RecentLabResults() {
  const labResults = [
    {
      id: 1,
      title: "Comprehensive Lipid Panel",
      collected: "Collected: Jan 8, 2024",
      status: "Review Required",
      statusColor: "bg-amber-500/10 text-amber-500",
      icon: AlertCircle,
      values: [
        { label: "Total Cholesterol", value: "245 mg/dL", flag: true },
        { label: "LDL (Bad)", value: "165 mg/dL", flag: true },
        { label: "HDL (Good)", value: "48 mg/dL", flag: false },
        { label: "Triglycerides", value: "160 mg/dL", flag: false },
      ],
      premium: true,
    },
    {
      id: 2,
      title: "CBC with Differential",
      collected: "Collected: Dec 15, 2023",
      status: "Normal / Optimal",
      statusColor: "bg-emerald-500/10 text-emerald-500",
      icon: CheckCircle2,
      values: [
        { label: "WBC", value: "7.2 K/uL", flag: false },
        { label: "Hemoglobin", value: "14.2 g/dL", flag: false },
        { label: "Platelets", value: "250 K/uL", flag: false },
        { label: "RBC", value: "4.8 M/uL", flag: false },
      ],
      premium: false,
    },
  ]

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
          <Link href="/patient/lab-results" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4">
            Full Archive
          </Link>
        </div>
      </div>
      
      <div className="p-8 pt-4 flex flex-col gap-6 flex-1">
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
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground tracking-tight leading-tight">
                    {result.title}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {result.collected}
                  </p>
                </div>
                <Badge className={cn("border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg", result.statusColor)}>
                   <result.icon className="h-3 w-3 mr-1" />
                   {result.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 relative z-10">
                {result.values.map((val) => (
                  <div key={val.label} className="space-y-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                      {val.label}
                    </span>
                    <p className={cn(
                      "text-sm font-black flex items-center gap-1",
                      val.flag ? "text-amber-500" : "text-foreground"
                    )}>
                      {val.value}
                      {val.flag && <span className="text-xs animate-bounce">&#x2191;</span>}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                size="sm"
                className="mt-6 w-full gap-2 rounded-xl h-10 bg-background border border-border/50 text-foreground hover:bg-primary hover:text-white hover:border-primary font-black text-[10px] uppercase tracking-widest transition-all shadow-subtle group-hover:scale-[1.02]"
              >
                <Download className="h-3.5 w-3.5" />
                Retrieve Full Analysis
              </Button>
            </m.div>
          ))}
        </AnimatePresence>
        
        <div className="mt-auto pt-4 text-center">
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
             End of recent findings
           </p>
        </div>
      </div>
    </div>
  )
}
