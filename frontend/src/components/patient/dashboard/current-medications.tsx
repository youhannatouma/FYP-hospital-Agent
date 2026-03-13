"use client"

import { Pill, RefreshCw, ChevronRight, AlertCircle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function CurrentMedications() {
  const medications = [
    {
      id: 1,
      name: "Lisinopril",
      purpose: "Hypertension Control",
      dosage: "10mg",
      frequency: "1x Daily",
      refillsLeft: 2,
      status: "Active",
      statusColor: "bg-emerald-500/10 text-emerald-500",
      highlight: true,
      icon: Pill,
    },
    {
      id: 2,
      name: "Atorvastatin",
      purpose: "Lipid Management",
      dosage: "20mg",
      frequency: "1x Daily",
      refillsLeft: 5,
      status: "Active",
      statusColor: "bg-emerald-500/10 text-emerald-500",
      highlight: false,
      icon: Pill,
    },
    {
      id: 3,
      name: "Aspirin",
      purpose: "Cardiac Protection",
      dosage: "81mg",
      frequency: "1x Daily",
      refillsLeft: null,
      status: "Active",
      statusColor: "bg-blue-500/10 text-blue-500",
      highlight: false,
      type: "OTC",
      icon: Pill,
    },
  ]

  return (
    <div className="premium-card rounded-[2.5rem] border-none shadow-premium bg-card overflow-hidden h-full flex flex-col">
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
             <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shadow-inner-glow">
                 <Pill className="h-5 w-5" />
               </div>
               Pharmacy
            </h2>
          </div>
          <Link href="/patient/medicines" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4">
            Manage All
          </Link>
        </div>
      </div>
      
      <div className="p-8 pt-4 flex flex-col gap-5 flex-1">
        <AnimatePresence mode="popLayout">
          {medications.map((med, idx) => (
            <m.div
              key={med.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "premium-card p-5 rounded-3xl border border-border/30 group transition-all duration-500 relative overflow-hidden",
                med.highlight ? "bg-amber-500/5 border-amber-500/10 shadow-sm" : "bg-transparent shadow-none"
              )}
            >
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">
                    {med.name}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {med.purpose}
                  </p>
                </div>
                <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg", med.statusColor)}>
                   {med.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 relative z-10">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-wider">Dosage</span>
                  <p className="text-xs font-black text-foreground">{med.dosage}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-wider">Cycle</span>
                  <p className="text-xs font-black text-foreground">{med.frequency}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-wider">{med.type ? "Type" : "Refills"}</span>
                  <p className="text-xs font-black text-foreground">{med.type || med.refillsLeft || "None"}</p>
                </div>
              </div>

              {med.refillsLeft !== null && !med.type && (
                <Button
                  size="sm"
                  className="mt-5 w-full gap-2 rounded-xl h-9 bg-white dark:bg-slate-900 border border-border/50 text-foreground hover:bg-amber-500 hover:text-white hover:border-amber-500 font-black text-[9px] uppercase tracking-widest transition-all shadow-subtle"
                >
                  <RefreshCw className="h-3 w-3" />
                  Order Refill
                </Button>
              )}
              
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-5 transition-opacity">
                 <Pill className="w-12 h-12 rotate-45" />
              </div>
            </m.div>
          ))}
        </AnimatePresence>
        
        <div className="mt-auto flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-dashed border-border/50">
           <Info className="h-4 w-4 text-primary shrink-0" />
           <p className="text-[10px] font-medium text-muted-foreground leading-snug">
              Refill requests typically take 24-48 hours to be approved by clinical staff.
           </p>
        </div>
      </div>
    </div>
  )
}
