"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Stethoscope, FileText, Pill, ClipboardCheck, AlertTriangle, ChevronDown, ChevronUp, Clock, CalendarDays, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDataStore, type Appointment } from "@/hooks/use-data-store"
import { AppointmentDetailsDialog } from "./dialogs/appointment-details-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const filterTabs = ["All", "Visits", "Records", "Prescriptions"]

export function MedicalHistoryTimeline() {
  const { toast } = useToast()
  const { appointments, records, prescriptions } = useDataStore()
  const [activeFilter, setActiveFilter] = useState("All")
  const [showAll, setShowAll] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Merge events into a single timeline
  const timelineItems = [
    ...appointments
      .filter(a => a.status === 'Completed')
      .map(a => ({
        id: `app-${a.id}`,
        type: "visit",
        title: `${a.type} with ${a.doctorName}`,
        date: a.date,
        description: `Consultation at hospital branch. Status: ${a.status}`,
        status: "Completed",
        statusColor: "bg-emerald-500/10 text-emerald-600",
        dotColor: "bg-primary",
        icon: Stethoscope,
        original: a
      })),
    ...records.map(r => ({
      id: `rec-${r.id}`,
      type: "Records",
      title: r.diagnosis,
      date: r.date,
      description: r.notes,
      status: "Verified",
      statusColor: "bg-blue-500/10 text-blue-600",
      dotColor: "bg-blue-500",
      icon: FileText,
      original: r
    })),
    ...prescriptions.map(p => {
      const pm = p.medicines[0] || { name: "Medicine", dosage: "-", frequency: "-" }
      return {
        id: `pre-${p.id}`,
        type: "Prescription",
        title: `Medication: ${pm.name}`,
        date: p.date,
        description: `${pm.dosage} - ${pm.frequency}`,
        status: p.status,
        statusColor: p.status === 'Active' ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground",
        dotColor: "bg-amber-500",
        icon: Pill,
        original: p
      }
    })
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filtered = timelineItems.filter((item) => {
    if (activeFilter === "All") return true
    return item.type.toLowerCase().includes(activeFilter.toLowerCase().slice(0, -1))
  })

  const visible = showAll ? filtered : filtered.slice(0, 4)

  return (
    <Card className="border-sidebar-border bg-card/50 shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Stethoscope className="h-5 w-5 text-primary" />
          Clinical Timeline
        </CardTitle>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
          {filterTabs.map((tab) => (
            <Button
              key={tab}
              variant={activeFilter === tab ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(tab)}
              className={`text-[10px] font-bold uppercase tracking-wider h-8 rounded-lg ${
                activeFilter === tab ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              {tab}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative ml-4 border-l border-sidebar-border">
          {visible.length === 0 ? (
            <div className="py-12 pl-8 text-muted-foreground text-sm italic">
               No medical events recorded in your timeline.
            </div>
          ) : (
            visible.map((item) => (
              <div 
                key={item.id} 
                className="relative mb-10 pl-8 last:mb-0 cursor-pointer group"
                onClick={() => {
                  setSelectedItem(item)
                  setDialogOpen(true)
                }}
              >
                <div
                  className={`absolute -left-[5.5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background ${item.dotColor} ring-4 ring-card transition-transform group-hover:scale-125`}
                />
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                        <h4 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                        </h4>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 block">
                        {item.date}
                        </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-6 font-bold border-none rounded-lg ${item.statusColor}`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Detail Dialogs */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          {selectedItem?.type === 'visit' ? (
            <AppointmentDetailsDialog appointment={selectedItem.original}>
              <div className="hidden" /> 
            </AppointmentDetailsDialog>
          ) : selectedItem ? (
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <selectedItem.icon className="h-5 w-5 text-primary" />
                  {selectedItem.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <CalendarDays className="h-3 w-3" /> {selectedItem.date}
                  <span className="opacity-20 mx-2">|</span>
                  <Badge variant="outline" className={`${selectedItem.statusColor} border-none`}>
                    {selectedItem.status}
                  </Badge>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 border border-sidebar-border">
                  <h4 className="text-sm font-bold mb-2">Details</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedItem.description || "No additional details available for this record."}
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm">Download PDF</Button>
                  <Button size="sm">Share with Doctor</Button>
                </div>
              </div>
            </DialogContent>
          ) : null}
        </Dialog>
        
        {filtered.length > 4 && (
            <div className="mt-8 pt-4 border-t border-sidebar-border text-center">
                <Button 
                variant="ghost" 
                className="text-primary font-bold text-xs gap-2"
                onClick={() => setShowAll(!showAll)}
                >
                {showAll ? (
                    <>Show Less <ChevronUp className="h-4 w-4" /></>
                ) : (
                    <>Load More Timeline ({filtered.length - 4}) <ChevronDown className="h-4 w-4" /></>
                )}
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
