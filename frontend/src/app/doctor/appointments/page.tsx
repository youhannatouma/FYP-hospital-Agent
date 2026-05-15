"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { getServiceContainer } from "@/lib/services/service-container"
import {
  CalendarDays,
  Video,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  MoreVertical,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScheduleAppointmentDialog } from "@/components/doctor/appointments/schedule-appointment-dialog"
import { RecordDetailDialog } from "@/components/doctor/MedicalRecord/record-detail-dialog"
import { MedicalRecord } from "@/components/doctor/MedicalRecord/columns"
import { VideoCallDialog } from "@/components/shared/video-call-dialog"
import { CompleteSessionDialog } from "@/components/doctor/dialogs/complete-session-dialog"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type DoctorAppointmentUi = {
  id: string
  patient_id: string
  patientName: string
  avatar: string
  type: string
  specialty: string
  date: string
  time: string
  duration: string
  status: "Upcoming" | "Completed" | "Cancelled"
  notes: string
  isVideo: boolean
  roomId?: string
}

type UserSummary = {
  user_id: string
  email?: string
  phone_number?: string
}

// Helper to get status styles for the badge
const getStatusStyles = (status: string) => {
  switch (status) {
    case "Upcoming":
      return "bg-blue-500/10 text-blue-500"
    case "Completed":
      return "bg-emerald-500/10 text-emerald-500"
    case "Cancelled":
    default:
      return "bg-destructive/10 text-destructive"
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DoctorAppointmentsPage() {
  // ── Dialog open/close state ──────────────────────────────────────────────────
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [isVideoCallOpen, setIsVideoCallOpen] = React.useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = React.useState(false)

  // ── Selected-item state ──────────────────────────────────────────────────────
  const [selectedPatientRecord, setSelectedPatientRecord] = React.useState<MedicalRecord | null>(null)
  const [selectedAppointment, setSelectedAppointment] = React.useState<DoctorAppointmentUi | null>(null)
  const [activePatientName, setActivePatientName] = React.useState("")

  // ── Appointment list ─────────────────────────────────────────────────────────
  const [appointmentList, setAppointmentList] = React.useState<DoctorAppointmentUi[]>([])

  const load = React.useCallback(async () => {
    const container = getServiceContainer()
    const data = await container.appointment.getDoctorAppointments()
    if (Array.isArray(data)) {
      const ui = data.map((a) => {
        const item = a as unknown as Record<string, unknown>
        const appointmentId = (item.appointment_id as string) || (item.id as string) || ""
        const patientId = (item.patient_id as string) || ""
        const patientName = (item.patient_name as string) || patientId
        const appointmentType = (item.appointment_type as string) || ""
        const date = (item.date as string) || ((item.created_at as string) ? new Date(item.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "")
        const time = (item.time as string) || ""
        const status = ((item.status as string) || "").toLowerCase()
        const roomId = item.room_id as string | undefined

        // Normalize status: backend returns 'scheduled'/'completed'/'cancelled'
        // UI expects 'Upcoming'/'Completed'/'Cancelled'
        let uiStatus: DoctorAppointmentUi["status"] = "Upcoming"
        if (status === "completed") uiStatus = "Completed"
        else if (status === "cancelled") uiStatus = "Cancelled"
        else if (status === "scheduled") uiStatus = "Upcoming"

        return {
          id: appointmentId,
          patient_id: patientId,
          patientName,
          avatar: patientName ? patientName.slice(0, 2).toUpperCase() : "",
          type: appointmentType,
          specialty: "",
          date,
          time,
          duration: "30 min",
          status: uiStatus,
          notes: "",
          isVideo: appointmentType.toLowerCase().includes("virtual") || appointmentType.toLowerCase().includes("video"),
          roomId,
        }
      })
      setAppointmentList(ui)
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true
    load().then(() => {
      if (!isMounted) return
    })
    return () => {
      isMounted = false
    }
  }, [load])

  // ── Derived lists ────────────────────────────────────────────────────────────
  const upcoming = appointmentList.filter((a) => a.status === "Upcoming")
  const past = appointmentList.filter(
    (a) => a.status === "Completed" || a.status === "Cancelled"
  )

  // ── Handlers ─────────────────────────────────────────────────────────────────

  // Called by ScheduleAppointmentDialog on success
  const handleScheduleSuccess = (newAppt: unknown) => {
    const item = newAppt as Partial<DoctorAppointmentUi>
    const normalized: DoctorAppointmentUi = {
      id: item.id || `appt-${Date.now()}`,
      patient_id: item.patient_id || "",
      patientName: item.patientName || "Patient",
      avatar: item.avatar || "PA",
      type: item.type || "Consultation",
      specialty: item.specialty || "",
      date: item.date || new Date().toLocaleDateString(),
      time: item.time || "",
      duration: item.duration || "30 min",
      status: item.status || "Upcoming",
      notes: item.notes || "",
      isVideo: Boolean(item.isVideo),
      roomId: item.roomId,
    }
    setAppointmentList((prev) => [normalized, ...prev])
  }

  const handleViewPatient = async (patientId: string, patientName: string) => {
    try {
      const container = getServiceContainer()
      const records = await container.medicalRecord.getRecordsByPatient(patientId)
      
      if (records && records.length > 0) {
        setSelectedPatientRecord(records[0])
        setIsDetailOpen(true)
      } else {
        // If no records, show a message or create a minimal view-only object
        toast({
          title: "No Records Found",
          description: `${patientName} has no registered medical records in the system yet.`,
        })
      }
    } catch (error) {
      console.error("Failed to fetch patient records:", error);
      toast({
        title: "Communication Failure",
        description: "Could not retrieve patient records from the clinical server.",
        variant: "destructive"
      })
    }
  }

  // FIX: accepts the full appointment object so we have the id for the room
  const handleJoinCall = (appt: DoctorAppointmentUi) => {
    setActivePatientName(appt.patientName)
    setSelectedAppointment(appt)   // ← FIX: save the whole appointment
    setIsVideoCallOpen(true)
  }

  const handleCompleteSession = (appt: DoctorAppointmentUi) => {
    setSelectedAppointment(appt)
    setIsCompleteOpen(true)
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-10 max-w-[1200px] mx-auto pb-24"
    >
      {/* ── Header ── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between px-2 pt-4">
        <div className="space-y-4">
          <Badge
            variant="outline"
            className="border-primary/20 text-primary bg-primary/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none"
          >
            Clinical Operations
          </Badge>
          <h1 className="text-4xl font-black text-foreground tracking-tight leading-none lg:text-5xl">
            Appointment Flow
          </h1>
          <p className="text-muted-foreground mt-4 font-medium text-lg max-w-lg leading-relaxed">
            Manage your longitudinal patient interactions. Streamline your
            workflow with real-time session synchronization.
          </p>
        </div>

        <Button
          size="lg"
          className="bg-slate-900 text-white hover:bg-slate-800 h-14 px-8 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-glow group"
          onClick={() => setIsScheduleOpen(true)}
        >
          <Plus className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
          Register Engagement
          <ArrowRight className="h-4 w-4 ml-3 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Button>
      </div>

      {/* ── Analytics summary ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 px-2">
        {[
          {
            label: "Active Sessions",
            value: upcoming.length,
            icon: CalendarDays,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Concluded",
            value: appointmentList.filter((a) => a.status === "Completed").length,
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Decommissioned",
            value: appointmentList.filter((a) => a.status === "Cancelled").length,
            icon: XCircle,
            color: "text-destructive",
            bg: "bg-destructive/10",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="premium-card rounded-3xl border-none bg-card/30 shadow-premium p-6 flex items-center gap-5"
          >
            <div
              className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner-glow",
                stat.bg,
                stat.color
              )}
            >
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground leading-none">
                {stat.value}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-50">
                {stat.label}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-2">
          <TabsList className="bg-muted/50 p-1.5 rounded-2xl border border-border/50 max-w-fit h-auto flex flex-wrap">
            <TabsTrigger
              value="upcoming"
              className="rounded-xl px-8 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              Planned
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="rounded-xl px-8 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              Historical
            </TabsTrigger>
          </TabsList>

          <Button
            variant="outline"
            size="sm"
            className="h-11 rounded-xl border-border/50 px-4 font-black text-[10px] uppercase tracking-widest"
          >
            <FilterIcon className="h-3.5 w-3.5 mr-2" />
            Pipeline Optimization
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {[
            { key: "upcoming", items: upcoming },
            { key: "past", items: past },
          ].map(({ key, items }) => (
            <TabsContent
              key={key}
              value={key}
              className="mt-4 flex flex-col gap-6 px-2 outline-none"
            >
              {items.length === 0 && (
                <div className="py-20 flex flex-col items-center text-center opacity-40">
                  <CalendarDays className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    No appointments
                  </p>
                </div>
              )}

              {items.map((appt, idx) => (
                <m.div
                  key={appt.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Card className="premium-card rounded-[2.5rem] border-none shadow-premium bg-card overflow-hidden group">
                    <CardContent className="p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-8">

                        {/* Left: Patient profile */}
                        <div className="flex items-center gap-6 lg:w-1/3">
                          <div className="relative">
                            <Avatar className="h-20 w-20 ring-4 ring-background shadow-2xl">
                              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-black text-xl">
                                {appt.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-background shadow-glow" />
                          </div>

                          <div className="min-w-0">
                            <Badge
                              className={cn(
                                "mb-2 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg",
                                getStatusStyles(appt.status)
                              )}
                            >
                              {appt.status}
                            </Badge>
                            <h3 className="text-xl font-black text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">
                              {appt.patientName}
                            </h3>
                            <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-wider">
                              {appt.type}
                            </p>
                          </div>
                        </div>

                        {/* Middle: Details */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6 py-6 lg:py-0 border-y lg:border-y-0 lg:border-x border-border/30 lg:px-8">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none flex items-center gap-2">
                              <CalendarDays className="h-3 w-3" /> Date
                            </span>
                            <p className="text-sm font-black text-foreground">
                              {appt.date}
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none flex items-center gap-2">
                              <Clock className="h-3 w-3" /> Time Window
                            </span>
                            <p className="text-sm font-black text-foreground">
                              {appt.time}{" "}
                              <span className="text-[10px] text-muted-foreground ml-1">
                                ({appt.duration})
                              </span>
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none flex items-center gap-2">
                              {appt.isVideo ? (
                                <Video className="h-3 w-3" />
                              ) : (
                                <MapPin className="h-3 w-3" />
                              )}{" "}
                              Protocol
                            </span>
                            <p className="text-sm font-black text-foreground">
                              {appt.isVideo ? "Digital" : "In-Person"}
                            </p>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-wrap items-center gap-3 lg:w-1/4 lg:justify-end">
                          {appt.status === "Upcoming" && (
                            <>
                              <Button
                                size="lg"
                                className="bg-primary text-white hover:bg-primary/90 h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-glow active:scale-95 transition-all group/btn"
                                onClick={() => handleCompleteSession(appt)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                End Session
                              </Button>
                              {appt.isVideo && (
                                <Button
                                  size="lg"
                                  variant="outline"
                                  className="h-12 w-12 rounded-xl flex items-center justify-center border-border/50 text-primary hover:bg-primary/5 shadow-subtle"
                                  onClick={() => handleJoinCall(appt)}
                                >
                                  <Video className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="lg"
                                variant="outline"
                                className="h-12 w-12 rounded-xl flex items-center justify-center border-border/50 text-muted-foreground hover:bg-muted/50"
                                  onClick={() => handleViewPatient(appt.patient_id, appt.patientName)}
                                >
                                  <Users className="h-4 w-4" />
                                </Button>
                              </>
                            )}

                            {appt.status !== "Upcoming" && (
                              <Button
                                variant="ghost"
                                className="h-12 w-12 rounded-xl border border-border/30"
                                onClick={() => handleViewPatient(appt.patient_id, appt.patientName)}
                              >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Clinical notes */}
                      {appt.notes && (
                        <div className="mt-8 flex items-start gap-4 p-5 rounded-[1.5rem] bg-muted/30 border border-dashed border-border/50">
                          <div className="h-7 w-7 rounded-lg bg-background flex items-center justify-center border border-border/50 text-primary shadow-sm shrink-0">
                            <Sparkles className="h-3.5 w-3.5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                              Clinical Agenda
                            </p>
                            <p className="text-sm font-medium text-foreground leading-relaxed">
                              {appt.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </m.div>
              ))}
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>

      {/* ── Dialogs ── */}
      <ScheduleAppointmentDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        onSuccess={handleScheduleSuccess}
      />

      <RecordDetailDialog
        record={selectedPatientRecord}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={(record) => {
          setIsDetailOpen(false)
          toast({
            title: "Modifying Subject",
            description: `Loading clinical editor for ${record.patient_name}.`,
          })
        }}
        onDownload={(record) => {
          toast({
            title: "Dossier Export",
            description: `Securely generating clinical summary for ${record.patient_name}.`,
          })
        }}
      />

      {selectedAppointment && (
        <CompleteSessionDialog
          isOpen={isCompleteOpen}
          onClose={() => setIsCompleteOpen(false)}
          appointment={selectedAppointment}
          onSuccess={load}
        />
      )}

      {/* FIX: selectedAppointment is now properly declared and set */}
      <VideoCallDialog
        open={isVideoCallOpen}
        onOpenChange={setIsVideoCallOpen}
        remoteName={activePatientName}
        role="doctor"
        roomId={selectedAppointment?.roomId || ""}
      />
    </m.div>
  )
}

// ─── Local Filter icon ────────────────────────────────────────────────────────
function FilterIcon(props: Readonly<React.SVGProps<SVGSVGElement>>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}
