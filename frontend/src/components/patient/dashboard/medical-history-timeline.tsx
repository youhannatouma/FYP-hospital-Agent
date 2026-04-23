"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { m, AnimatePresence } from "framer-motion"
import { ChevronRight, Stethoscope, FileText, AlertTriangle, ChevronDown } from "lucide-react"
import { useHospital } from "@/hooks/use-hospital"
import { cn } from "@/lib/utils"

const filterTabs = ["All", "Consultation", "Lab Result", "Surgery"]

export function MedicalHistoryTimeline() {
  const { toast } = useToast()
  const { getToken } = useAuth()
  const router = useRouter()
  const { medicalRecords } = useHospital()
  const [activeFilter, setActiveFilter] = useState("All")
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = await getToken()
        const data = await medicalRecords.getMyRecords(token || undefined)
        setRecords(data)
      } catch (error) {
        console.error("Failed to fetch records:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecords()
  }, [getToken, medicalRecords])

  const handleViewDetails = (recordId: string, title: string) => {
    toast({
      title: "Loading Record",
      description: `Opening details for: ${title}`,
    })
    router.push("/patient/clinical-history")
  }

  const handleExtensiveHistory = () => {
    router.push("/patient/clinical-history")
  }

  const filtered = records
    .filter((r) => {
      if (activeFilter === "All") return true
      return r.record_type === activeFilter
    })
    .map((r) => {
      const isLab = r.record_type?.toLowerCase().includes("lab")
      const isSurgery = r.record_type?.toLowerCase().includes("surgery")
      
      return {
        id: r.record_id,
        type: r.record_type,
        title: r.diagnosis || "Medical Consultation",
        date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Date TBD",
        description: r.treatment || r.clinical_notes,
        status: "Verified",
        statusColor: "bg-emerald-500/10 text-emerald-500",
        dotColor: isLab ? "bg-amber-500" : isSurgery ? "bg-red-500" : "bg-primary",
        icon: isLab ? FileText : isSurgery ? AlertTriangle : Stethoscope,
        extra: [
          { label: r.record_type, type: "info" },
          { label: "View Details", type: "link" },
        ],
      }
    })

  return (
    <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 pb-4 gap-4">
        <div>
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-foreground tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner-glow">
              <Stethoscope className="h-5 w-5" />
            </div>
            Medical Timeline
          </CardTitle>
          <p className="text-sm text-muted-foreground font-medium mt-1">Refining history from your medical journey</p>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border/50">
          {filterTabs.map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              size="sm"
              onClick={() => setActiveFilter(tab)}
              className={cn(
                "h-8 px-4 rounded-lg text-xs font-black transition-all",
                activeFilter === tab
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Synchronizing records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-medium text-muted-foreground italic">No medical events identified in this category.</p>
          </div>
        ) : (
          <div className="relative ml-4">
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/50 via-border/50 to-transparent" />
            <div className="space-y-10">
              <AnimatePresence mode="popLayout">
                {filtered.map((item, idx) => (
                  <m.div 
                    key={item.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative pl-10 group"
                  >
                    <div
                      className={cn(
                        "absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-4 border-background shadow-glow transition-transform duration-500 group-hover:scale-125 z-10",
                        item.dotColor
                      )}
                    />
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md w-fit">
                          {item.date}
                        </span>
                        <div className="flex items-center gap-2">
                           <Badge className={cn("border-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg shadow-sm", item.statusColor)}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="premium-card p-5 rounded-2xl group-hover:border-primary/20 transition-colors bg-card/30 shadow-subtle border border-border/30">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner-glow transition-transform duration-500 group-hover:rotate-3",
                            item.statusColor
                          )}>
                            <item.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-foreground tracking-tight leading-tight">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-2 font-medium leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/30">
                               <div className="flex gap-2">
                                 {item.extra.filter(e => e.type !== 'link').map((e, i) => (
                                    <span key={i} className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                      # {e.label}
                                    </span>
                                 ))}
                               </div>
                               <Button variant="ghost" size="sm" onClick={() => handleViewDetails(item.id, item.title)} className="h-8 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 rounded-lg group/btn">
                                 Details <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                               </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
        <div className="mt-10 text-center">
          <Button variant="outline" onClick={handleExtensiveHistory} className="h-11 px-10 rounded-xl border-border/50 font-black text-xs uppercase tracking-[0.2em] hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground">
            View Extensive History
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
