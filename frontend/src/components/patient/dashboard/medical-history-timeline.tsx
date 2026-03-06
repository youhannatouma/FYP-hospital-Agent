"use client"

import { useToast } from "@/components/ui/use-toast"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Stethoscope, FileText, Pill, ClipboardCheck, AlertTriangle, ChevronRight } from "lucide-react"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const filterTabs = ["All", "Visits", "Labs", "Medications"]

const timelineItems = [
  {
    id: 1,
    type: "visit",
    title: "Follow-up Cardiology Visit",
    date: "Jan 10, 2024",
    description: "Dr. Michael Chen - Routine checkup and medication review",
    status: "Completed",
    statusColor: "bg-emerald-500/10 text-emerald-500",
    dotColor: "bg-primary",
    icon: Stethoscope,
    extra: [
      { label: "Notes Available", type: "info" },
      { label: "View Details", type: "link" },
    ],
  },
  {
    id: 2,
    type: "lab",
    title: "Lab Results - Lipid Panel",
    date: "Jan 8, 2024",
    description: null,
    status: "Needs Review",
    statusColor: "bg-amber-500/10 text-amber-500",
    dotColor: "bg-amber-500",
    icon: FileText,
    labValues: [
      { label: "Total Cholesterol", value: "245 mg/dL" },
      { label: "LDL", value: "165 mg/dL" },
      { label: "HDL", value: "48 mg/dL" },
    ],
    extra: [
      { label: "Needs Review", type: "warning" },
      { label: "Download Report", type: "link" },
    ],
  },
  {
    id: 3,
    type: "medication",
    title: "Medication Adjustment",
    date: "Dec 20, 2023",
    description: "Lisinopril dosage increased to 10mg daily",
    status: "Active",
    statusColor: "bg-blue-500/10 text-blue-500",
    dotColor: "bg-blue-500",
    icon: Pill,
    extra: [
      { label: "Active", type: "info" },
      { label: "Current Medication", type: "tag" },
    ],
  },
  {
    id: 4,
    type: "visit",
    title: "Annual Physical Exam",
    date: "Nov 15, 2023",
    description: "Comprehensive health assessment - All vitals within normal range.",
    status: "Completed",
    statusColor: "bg-emerald-500/10 text-emerald-500",
    dotColor: "bg-emerald-500",
    icon: ClipboardCheck,
    extra: [
      { label: "Completed", type: "success" },
    ],
  },
]

export function MedicalHistoryTimeline() {
  const [activeFilter, setActiveFilter] = useState("All")
  const { toast } = useToast()

  const handleViewDetails = (title: string) => {
    toast({
      title: "Loading Record",
      description: `Fetching detailed information for: ${title}`,
    })
  }

  const handleExtensiveHistory = () => {
    toast({
      title: "Loading Archive",
      description: "Preparing extensive medical history interface...",
    })
  }

  const filtered = timelineItems.filter((item) => {
    if (activeFilter === "All") return true
    if (activeFilter === "Visits") return item.type === "visit"
    if (activeFilter === "Labs") return item.type === "lab"
    if (activeFilter === "Medications") return item.type === "medication"
    return true
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
          <p className="text-sm text-muted-foreground font-medium mt-1">Refining history from the last 12 months</p>
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
        <div className="relative ml-4">
          {/* Vertical Line */}
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
                  {/* Timeline Dot */}
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
                          
                          {item.labValues && (
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-xl bg-orange-500/5 p-4 border border-orange-500/10">
                              {item.labValues.map((lv) => (
                                <div key={lv.label} className="space-y-1">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                    {lv.label}
                                  </span>
                                  <p className="text-sm font-black text-foreground">
                                    {lv.value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/30">
                             <div className="flex gap-2">
                               {item.extra.filter(e => e.type !== 'link').map((e, i) => (
                                  <span key={i} className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                    # {e.label}
                                  </span>
                               ))}
                             </div>
                             <Button variant="ghost" size="sm" onClick={() => handleViewDetails(item.title)} className="h-8 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 rounded-lg group/btn">
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
        <div className="mt-10 text-center">
          <Button variant="outline" onClick={handleExtensiveHistory} className="h-11 px-10 rounded-xl border-border/50 font-black text-xs uppercase tracking-[0.2em] hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground">
            View Extensive History
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
