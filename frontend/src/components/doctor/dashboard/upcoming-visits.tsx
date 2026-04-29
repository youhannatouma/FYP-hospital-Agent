"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Video } from "lucide-react"
import Link from "next/link"
import React from "react"
import { VideoCallDialog } from "@/components/shared/video-call-dialog"

import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"

export interface UpcomingVisitsProps {
  onViewAppointment?: (visit: any) => void
}

export function UpcomingVisits({ onViewAppointment }: Readonly<UpcomingVisitsProps>) {
  const { booking } = useHospital()
  const { getToken } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)
  const [activePatient, setActivePatient] = React.useState("")
  const [visits, setVisits] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchVisits = async () => {
      try {
        setIsLoading(true)
        const token = await getToken()
        const data = await booking.getDoctorAppointments(token || undefined)
        // Only show upcoming confirmed/verified appointments
        const upcoming = data
          .filter((apt: any) => {
            const status = String(apt.status || "").toLowerCase();
            return status === 'scheduled' || status === 'verified';
          })
          .slice(0, 3)
          .map((apt: any) => ({
            id: apt.appointment_id,
            title: apt.appointment_type || "Consultation",
            patientName: apt.patient_name,
            date: apt.date ? new Date(apt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
            time: apt.time,
            type: "Scheduled",
            typeColor: "bg-emerald-500/10 text-emerald-600",
            isVirtual: Boolean(apt.is_virtual),
            raw: apt
          }))
        setVisits(upcoming)
      } catch (err) {
        console.error("Failed to fetch upcoming visits:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVisits()
  }, [booking, getToken])

  const handleJoin = (e: React.MouseEvent, name: string) => {
    e.stopPropagation()
    setActivePatient(name)
    setIsOpen(true)
  }

  return (
    <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
          <CalendarDays className="h-4 w-4 text-accent" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest">Syncing Timeline...</p>
          </div>
        ) : visits.length === 0 ? (
          <div className="py-10 text-center text-xs font-bold text-muted-foreground italic">
            No confirmed visits scheduled.
          </div>
        ) : (
          visits.map((visit) => (
            <div
              key={visit.id}
              role="button"
              tabIndex={0}
              className="rounded-2xl border border-border/50 p-4 transition-all hover:bg-primary/5 cursor-pointer group/visit active:scale-98"
              onClick={() => onViewAppointment?.(visit.raw)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-card-foreground tracking-tight">
                  {visit.title}
                </h4>
                <Badge variant="secondary" className={`text-[10px] font-black uppercase tracking-widest ${visit.typeColor} border-0`}>
                  {visit.type}
                </Badge>
              </div>
              <p className="text-xs font-bold text-muted-foreground mb-2">
                {visit.patientName}
              </p>
              <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3 text-primary" />
                  {visit.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {visit.time}
                </span>
              </div>
              {visit.isVirtual && (
                <Button
                  size="sm"
                  className="mt-4 w-full h-10 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-glow"
                  onClick={(e) => handleJoin(e, visit.patientName)}
                >
                  <Video className="mr-2 h-3.5 w-3.5" />
                  Enter Video Room
                </Button>
              )}
            </div>
          ))
        )}
        <Link
          href="/doctor/appointments"
          className="text-center text-sm text-primary hover:underline"
        >
          View All Appointments
        </Link>
      </CardContent>

      <VideoCallDialog 
        open={isOpen}
        onOpenChange={setIsOpen}
        remoteName={activePatient}
        role="doctor"
        roomId={`visit_${activePatient.replaceAll(" ", "_")}`}
      />
    </Card>
  )
}
