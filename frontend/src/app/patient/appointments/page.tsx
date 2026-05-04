"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type LucideIcon,
  CalendarDays,
  Clock,
  Video,
  MapPin,
  Phone,
  Download,
  X,
  RefreshCw,
  CalendarPlus,
  ArrowRight,
  MoreVertical,
} from "lucide-react"

import { useToast } from "@/components/ui/use-toast"
import { BookAppointmentDialog } from "@/components/patient/dialogs/book-appointment-dialog"
import { RescheduleAppointmentDialog } from "@/components/patient/dialogs/reschedule-appointment-dialog"
import { CancelAppointmentDialog } from "@/components/patient/dialogs/cancel-appointment-dialog"
import { AppointmentDetailsDialog } from "@/components/patient/dialogs/appointment-details-dialog"
import { VideoCallDialog } from "@/components/shared/video-call-dialog"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/nextjs"
import { useHospital } from "@/hooks/use-hospital"

interface Appointment {
  id: string | number
  doctor: string
  specialty: string
  avatar: string
  date: string
  time: string
  type: string
  typeIcon: LucideIcon
  status: string
  statusColor: string
  location: string
  notes?: string
  roomId?: string
}

type ApiAppointment = {
  appointment_id: string | number
  doctor_name?: string
  doctor_specialty?: string
  date?: string
  created_at?: string
  time?: string
  appointment_type?: string
  status?: string
  room_id?: string
}

const upcomingAppointments: Appointment[] = [
  {
    id: 1,
    doctor: "Dr. Michael Chen",
    specialty: "Cardiology",
    avatar: "MC",
    date: "Jan 25, 2024",
    time: "10:00 AM",
    type: "Video",
    typeIcon: Video,
    status: "Confirmed",
    statusColor: "bg-emerald-500/10 text-emerald-500",
    location: "Virtual - Telehealth",
    notes: "Follow-up for cholesterol management",
  },
  {
    id: 2,
    doctor: "Dr. Emily Watson",
    specialty: "General Practice",
    avatar: "EW",
    date: "Feb 15, 2024",
    time: "2:30 PM",
    type: "In-person",
    typeIcon: MapPin,
    status: "Scheduled",
    statusColor: "bg-blue-500/10 text-blue-500",
    location: "Westside Clinic, Suite 204",
    notes: "Annual physical examination",
  },
  {
    id: 3,
    doctor: "Dr. Raj Patel",
    specialty: "Endocrinology",
    avatar: "RP",
    date: "Mar 5, 2024",
    time: "11:00 AM",
    type: "Phone",
    typeIcon: Phone,
    status: "Pending",
    statusColor: "bg-amber-500/10 text-amber-500",
    location: "Phone consultation",
    notes: "Blood sugar monitoring review",
  },
]

const pastAppointments: Appointment[] = [
  {
    id: 4,
    doctor: "Dr. Michael Chen",
    specialty: "Cardiology",
    avatar: "MC",
    date: "Jan 10, 2024",
    time: "10:00 AM",
    type: "In-person",
    typeIcon: MapPin,
    status: "Completed",
    statusColor: "bg-emerald-500/10 text-emerald-500",
    location: "Downtown Medical Center",
  },
]

const cancelledAppointments: Appointment[] = []


function AppointmentCard({
  appointment,
  tab,
  onAction,
}: Readonly<{
  appointment: Appointment
  tab: string
  onAction: (action: string, appointment: Appointment) => void
}>) {
  return (
    <m.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group relative"
    >
      <Card className="premium-card rounded-[2rem] border-none shadow-premium bg-card/50 overflow-hidden group-hover:bg-card transition-all duration-500">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Left: Doctor Info */}
            <div className="flex items-center gap-6 lg:w-1/3">
              <div className="relative">
                 <Avatar className="h-20 w-20 ring-4 ring-background shadow-2xl">
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-black text-xl">
                    {appointment.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-background shadow-glow" />
              </div>
              <div className="min-w-0">
                <Badge className={cn("mb-2 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg", appointment.statusColor)}>
                  {appointment.status}
                </Badge>
                <h3 className="text-xl font-black text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">
                  {appointment.doctor}
                </h3>
                <p className="text-sm font-bold text-muted-foreground mt-1.5">{appointment.specialty}</p>
              </div>
            </div>

            {/* Middle: Specs */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 py-6 lg:py-0 border-y lg:border-y-0 lg:border-x border-border/30 lg:px-8">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none flex items-center gap-2">
                   <CalendarDays className="h-3 w-3" /> Date
                </span>
                <p className="text-sm font-black text-foreground">{appointment.date}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none flex items-center gap-2">
                   <Clock className="h-3 w-3" /> Time
                </span>
                <p className="text-sm font-black text-foreground">{appointment.time}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none flex items-center gap-2">
                   <appointment.typeIcon className="h-3 w-3" /> Type
                </span>
                <p className="text-sm font-black text-foreground">{appointment.type}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none flex items-center gap-2">
                   <MapPin className="h-3 w-3" /> Location
                </span>
                <p className="text-sm font-black text-foreground truncate">{appointment.location}</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-3 lg:w-1/4 lg:justify-end">
              {tab === "upcoming" && (
                <>
                  {appointment.type === "Video" && (
                    <Button
                      size="lg"
                      className="bg-primary text-white hover:bg-primary/90 h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-glow active:scale-95 transition-all group/btn"
                      onClick={() => onAction("join", appointment)}
                    >
                      <Video className="h-4 w-4 mr-2 transition-transform group-hover/btn:rotate-12" />
                      Join Call
                    </Button>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-11 w-11 rounded-xl border-border/50 text-foreground hover:bg-muted/50 transition-all font-bold"
                      onClick={() => onAction("reschedule", appointment)}
                      title="Reschedule"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-11 w-11 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 transition-all font-bold"
                      onClick={() => onAction("cancel", appointment)}
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
              {tab === "past" && (
                <div className="flex items-center gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 rounded-xl border-border/50 text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all"
                    onClick={() => onAction("details", appointment)}
                  >
                    View Record
                  </Button>
                   <Button
                    size="icon"
                    variant="outline"
                    className="h-11 w-11 rounded-xl border-border/50 text-foreground hover:bg-muted/50 transition-all"
                    onClick={() => onAction("download", appointment)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {appointment.notes && (
            <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-dashed border-border/50">
               <span className="text-[10px] font-black uppercase tracking-widest text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded-md">Note</span>
               <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                 "{appointment.notes}"
               </p>
            </div>
          )}
        </CardContent>
        
        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
           <CalendarDays className="w-24 h-24 rotate-[-15deg]" />
        </div>
      </Card>
    </m.div>
  )
}

export default function AppointmentsPage() {
  const { toast } = useToast()
  
  const [showBook, setShowBook] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [activeDoctorName, setActiveDoctorName] = useState("")
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([])
  const [cancelledAppointments, setCancelledAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { getToken } = useAuth()
  const { booking } = useHospital()

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = await getToken()
        const data = await booking.getMyAppointments(token || undefined)
        if (Array.isArray(data)) {
          const mapped: Appointment[] = (data as ApiAppointment[]).map((a) => {
            // Normalize status for UI display
            const rawStatus = (a.status || "").toLowerCase()
            let displayStatus = "Scheduled"
            let statusColor = "bg-blue-500/10 text-blue-500"
            if (rawStatus === "scheduled") {
              displayStatus = "Scheduled"
              statusColor = "bg-emerald-500/10 text-emerald-500"
            } else if (rawStatus === "completed") {
              displayStatus = "Completed"
              statusColor = "bg-emerald-500/10 text-emerald-500"
            } else if (rawStatus === "cancelled") {
              displayStatus = "Cancelled"
              statusColor = "bg-red-500/10 text-red-500"
            }

            return {
              id: a.appointment_id,
              doctor: a.doctor_name ? `Dr. ${a.doctor_name}` : "Doctor",
              specialty: a.doctor_specialty || "Clinical Specialist",
              avatar: a.doctor_name ? a.doctor_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "DR",
              date: a.date || (a.created_at ? new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD"),
              time: a.time || "Scheduled",
              type: a.appointment_type?.toLowerCase().includes("video") ? "Video" : "In-person",
              typeIcon: a.appointment_type?.toLowerCase().includes("video") ? Video : MapPin,
              status: displayStatus,
              statusColor: statusColor,
              location: a.appointment_type?.toLowerCase().includes("video") ? "Virtual - Telehealth" : "Westside Clinic",
              notes: "",
              roomId: a.room_id,
            }
          })

          setUpcomingAppointments(mapped.filter((a) => a.status === "Scheduled"))
          setPastAppointments(mapped.filter((a) => a.status === "Completed"))
          setCancelledAppointments(mapped.filter((a) => a.status === "Cancelled"))
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAppointments()
  }, [getToken, booking])

  const handleAction = (action: string, appointment: Appointment) => {
    setSelectedAppointment(appointment)
    
    switch (action) {
      case "join":
        setActiveDoctorName(appointment.doctor)
        setIsVideoCallOpen(true)
        break
      case "reschedule":
        setShowReschedule(true)
        break
      case "cancel":
        setShowCancel(true)
        break
      case "details":
        setShowDetails(true)
        break
      case "download":
        toast({
          title: "Protocol Initialized",
          description: "Your prescription dossier is being prepared for export.",
        })
        break
      case "rebook":
        setShowBook(true)
        break
    }
  }

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-10 max-w-[1200px] mx-auto pb-24"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between px-2 pt-4">
        <div className="space-y-4">
          <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
            Schedule Infrastructure
          </Badge>
          <h1 className="text-4xl font-black text-foreground tracking-tight leading-none lg:text-5xl">
            Appointments
          </h1>
          <p className="text-muted-foreground mt-4 font-medium text-lg max-w-lg leading-relaxed">
            Orchestrate your clinical calendar. Seamlessly bridge the gap between patient and provider.
          </p>
        </div>
        <Button 
          size="lg"
          className="bg-slate-900 text-white hover:bg-slate-800 h-14 px-8 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-glow group"
          onClick={() => {
            setSelectedAppointment(null)
            setShowBook(true)
          }}
        >
          <CalendarPlus className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
          Synchronize New Session
          <ArrowRight className="h-4 w-4 ml-3 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-2">
          <TabsList className="bg-muted/50 p-1.5 rounded-2xl border border-border/50 max-w-fit h-auto">
            <TabsTrigger value="upcoming" className="rounded-xl px-8 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              Planned ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl px-8 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              Historical
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="rounded-xl px-8 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              Archived
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-40 h-11 rounded-xl bg-card border-border/50 font-bold text-xs">
                <SelectValue placeholder="Protocol" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50">
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="video">Digital Console</SelectItem>
                <SelectItem value="in-person">Clinical Presence</SelectItem>
                <SelectItem value="phone">Vocal Sync</SelectItem>
              </SelectContent>
            </Select>
             <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-border/50">
                <MoreVertical className="h-4 w-4" />
             </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent key="upcoming" value="upcoming" className="flex flex-col gap-6 outline-none">
            {upcomingAppointments.map((apt) => (
              <AppointmentCard key={apt.id || `apt-${Math.random()}`} appointment={apt} tab="upcoming" onAction={handleAction} />
            ))}
          </TabsContent>

          <TabsContent key="past" value="past" className="flex flex-col gap-6 outline-none">
            {pastAppointments.map((apt) => (
              <AppointmentCard key={apt.id || `apt-past-${Math.random()}`} appointment={apt} tab="past" onAction={handleAction} />
            ))}
          </TabsContent>

          <TabsContent key="cancelled" value="cancelled" className="flex flex-col gap-6 outline-none">
            {cancelledAppointments.map((apt) => (
              <AppointmentCard key={apt.id || `apt-can-${Math.random()}`} appointment={apt} tab="cancelled" onAction={handleAction} />
            ))}
            {cancelledAppointments.length === 0 && (
              <m.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center glass rounded-[3rem] border-border/30"
              >
                <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                  <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-2xl font-black text-foreground tracking-tight">
                  Archive Vacuum
                </h3>
                <p className="text-muted-foreground mt-2 font-medium">
                  No previous sessions have been decommissioned or archived.
                </p>
              </m.div>
            )}
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      <BookAppointmentDialog 
        open={showBook} 
        onOpenChange={setShowBook} 
        defaultDoctor={selectedAppointment?.doctor}
      />
      <RescheduleAppointmentDialog 
        open={showReschedule} 
        onOpenChange={setShowReschedule}
        appointmentId={selectedAppointment?.id || null}
        currentDoctor={selectedAppointment?.doctor || ""}
      />
      <CancelAppointmentDialog 
        open={showCancel} 
        onOpenChange={setShowCancel}
        appointmentId={selectedAppointment?.id || null}
        currentDoctor={selectedAppointment?.doctor || ""}
      />
      <AppointmentDetailsDialog 
        open={showDetails} 
        onOpenChange={setShowDetails}
        appointment={selectedAppointment}
      />

      <VideoCallDialog 
        open={isVideoCallOpen}
        onOpenChange={setIsVideoCallOpen}
        remoteName={activeDoctorName}
        role="patient"
        roomId={selectedAppointment?.roomId || "unknown"}
      />
    </m.div>
  )
};
