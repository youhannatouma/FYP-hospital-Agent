"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Video, ChevronRight, MapPin } from "lucide-react"
import Link from "next/link"
import { VideoCallDialog } from "@/components/shared/video-call-dialog"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"

export function UpcomingVisits() {
  const [visits, setVisits] = React.useState<any[]>([])
  const { booking } = useHospital()
  const { getToken } = useAuth()

  React.useEffect(() => {
    const loadVisits = async () => {
      const token = await getToken()
      const data = await booking.getMyAppointments(token || undefined)
      if (Array.isArray(data)) {
        const ui = data.map((a: any) => ({
          id: a.appointment_id,
          title: a.appointment_type || "Appointment",
          doctor: a.doctor_name || a.doctor_id,
          specialty: a.doctor_specialty || "General Medicine",
          date: a.date || (a.created_at ? new Date(a.created_at).toDateString() : ""),
          time: a.time || "",
          type: a.status || "",
          typeColor: a.status === "scheduled" ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground",
          isVirtual: a.appointment_type?.toLowerCase().includes("virtual"),
        }))
        setVisits(ui)
      } else {
        setVisits([])
      }
    }
    loadVisits()
  }, [booking, getToken])

  const [isOpen, setIsOpen] = React.useState(false)
  const [activeDoctor, setActiveDoctor] = React.useState("")

  const handleJoin = (name: string) => {
    setActiveDoctor(name)
    setIsOpen(true)
  }

  return (
    <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden bg-card">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-black text-foreground tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent shadow-inner-glow">
              <CalendarDays className="h-5 w-5" />
            </div>
            Upcoming Visits
          </CardTitle>
          <Badge variant="outline" className="border-border/50 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
            {visits.length} Events
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-4 flex flex-col gap-6">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {visits.map((visit, idx) => (
              <m.div
                key={visit.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "premium-card p-5 rounded-2xl relative overflow-hidden group border border-border/30 transition-all duration-300",
                  idx === 0 ? "shadow-md bg-muted/20" : "bg-transparent shadow-none"
                )}
              >
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex flex-col">
                    <h4 className="text-base font-black text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">
                      {visit.title}
                    </h4>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      {visit.doctor} • {visit.specialty}
                    </span>
                  </div>
                  <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-none transition-transform group-hover:scale-105", visit.typeColor)}>
                    {visit.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-background flex items-center justify-center border border-border/50 shadow-sm">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-foreground">{visit.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-background flex items-center justify-center border border-border/50 shadow-sm">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-foreground">{visit.time}</span>
                  </div>
                  {!visit.isVirtual && (
                    <div className="flex items-center gap-2 ml-auto">
                       <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Main Clinic</span>
                    </div>
                  )}
                </div>

                {visit.isVirtual && (
                  <Button
                    size="sm"
                    className="mt-5 w-full bg-primary text-white hover:bg-primary/90 rounded-xl h-10 font-bold text-xs uppercase tracking-widest shadow-glow active:scale-[0.98] transition-all"
                    onClick={() => handleJoin(visit.doctor)}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Join Digital Console
                  </Button>
                )}
                
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-5 transition-opacity">
                   <ChevronRight className="w-12 h-12 rotate-[-15deg]" />
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </div>

        <Link
          href="/patient/appointments"
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border/50 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-solid transition-all"
        >
          View Full Directory
          <ChevronRight className="h-3 w-3" />
        </Link>
      </CardContent>

      <VideoCallDialog 
        open={isOpen}
        onOpenChange={setIsOpen}
        remoteName={activeDoctor}
        role="patient"
        roomId="quick_consult"
      />
    </Card>
  )
}
