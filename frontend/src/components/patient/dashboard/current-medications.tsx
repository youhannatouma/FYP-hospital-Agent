"use client"

import { Pill, AlertCircle} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

import { Loader2 } from "lucide-react"
import { usePrescriptions } from "@/hooks/use-prescriptions"

export function CurrentMedications() {
  const { prescriptions: medications, loading: isLoading } = usePrescriptions()

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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
             <Loader2 className="h-6 w-6 text-primary animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Updating records...</p>
          </div>
        ) : medications.length === 0 ? (
          <div className="py-10 text-center italic text-sm text-muted-foreground">
             No active prescriptions found.
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {medications.map((presc, idx) => {
              // Map medications array to string for display
              const medName = presc.medications[0] || "Medication"
              const subText = presc.medications.length > 1 ? `+ ${presc.medications.length - 1} more` : ""
              
              return (
                <m.div
                  key={presc.prescription_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "premium-card p-5 rounded-3xl border border-border/30 group transition-all duration-500 relative overflow-hidden",
                    idx === 0 ? "bg-amber-500/5 border-amber-500/10 shadow-sm" : "bg-transparent shadow-none"
                  )}
                >
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-black text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {medName} {subText}
                      </h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Ref: {presc.doctor_name}
                      </p>
                    </div>
                    <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg", 
                      presc.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted/30 text-muted-foreground"
                    )}>
                       {presc.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 relative z-10">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-wider">Instructions</span>
                      <p className="text-xs font-black text-foreground line-clamp-1">{presc.instructions || "As directed"}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-wider">Expiry</span>
                      <p className="text-xs font-black text-foreground">{presc.expiry_date || "N/A"}</p>
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-5 transition-opacity">
                     <Pill className="w-12 h-12 rotate-45" />
                  </div>
                </m.div>
              )
            })}
          </AnimatePresence>
        )}
        
        <div className="mt-auto flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-dashed border-border/50">
           <AlertCircle className="h-4 w-4 text-primary shrink-0" />
           <p className="text-[10px] font-medium text-muted-foreground leading-snug">
              Always consult with your physician before changing medication dosages.
           </p>
        </div>
      </div>
    </div>
  )
}
