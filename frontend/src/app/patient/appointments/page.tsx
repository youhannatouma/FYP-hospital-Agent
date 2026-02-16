"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CalendarDays,
  Clock,
  Video,
  MapPin,
  Phone,
  Download,
  CalendarPlus,
  Eye,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDataStore, type Appointment } from "@/hooks/use-data-store"
import { BookAppointmentDialog } from "@/components/patient/appointments/book-appointment-dialog"
import { RescheduleDialog } from "@/components/patient/appointments/reschedule-dialog"
import { CancelAppointmentAlert } from "@/components/patient/appointments/cancel-alert"
import { DoctorDetailDialog } from "@/components/shared/dialogs/doctor-detail-dialog"
import { useState } from "react"

// Using pat-1 as the current patient (would come from Clerk in production)
const CURRENT_PATIENT_ID = "pat-1"
const CURRENT_PATIENT_NAME = "Sarah Johnson"

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

function getStatusColor(status: string) {
  switch (status) {
    case "Scheduled": return "bg-blue-500/10 text-blue-600"
    case "Completed": return "bg-emerald-500/10 text-emerald-600"
    case "Cancelled": return "bg-destructive/10 text-destructive"
    case "Pending": return "bg-amber-500/10 text-amber-600"
    default: return "bg-muted text-muted-foreground"
  }
}

function getTypeIcon(apt: Appointment) {
  if (apt.isVirtual) return Video
  return MapPin
}

function AppointmentCard({
  appointment,
  tab,
  onDoctorClick,
}: {
  appointment: Appointment
  tab: string
  onDoctorClick: (doctor: any) => void
}) {
  const { toast } = useToast()
  const TypeIcon = getTypeIcon(appointment)

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar 
            className="h-12 w-12 ring-2 ring-primary/10 cursor-pointer hover:ring-primary transition-all"
            onClick={() => onDoctorClick({ name: appointment.doctorName, specialty: appointment.specialty })}
          >
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(appointment.doctorName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div 
                className="cursor-pointer group"
                onClick={() => onDoctorClick({ name: appointment.doctorName, specialty: appointment.specialty })}
              >
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {appointment.doctorName}
                </h3>
                <p className="text-sm text-primary">{appointment.specialty}</p>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs ${getStatusColor(appointment.status)} border-0`}
              >
                {appointment.status}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{appointment.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TypeIcon className="h-3.5 w-3.5" />
                <span>{appointment.isVirtual ? "Video" : "In-person"}</span>
              </div>
            </div>

            {appointment.type && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{appointment.type}</span>
              </div>
            )}

            {appointment.notes && (
              <p className="mt-2 text-xs text-muted-foreground italic">
                {appointment.notes}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {tab === "upcoming" && (
                <>
                  {appointment.isVirtual && (
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                      onClick={() => {
                        toast({
                          title: "Connecting...",
                          description: "Joining secure video room with " + appointment.doctorName,
                        })
                      }}
                    >
                      <Video className="h-3 w-3" />
                      Join Call
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <RescheduleDialog 
                      appointmentId={appointment.id} 
                      doctorName={appointment.doctorName} 
                    />
                    <CancelAppointmentAlert 
                      appointmentId={appointment.id}
                      doctorName={appointment.doctorName}
                    />
                  </div>
                </>
              )}
              {tab === "past" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 border-border text-foreground hover:bg-muted"
                    onClick={() => onDoctorClick({ name: appointment.doctorName, specialty: appointment.specialty })}
                  >
                    <Eye className="h-3 w-3" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 border-border text-foreground"
                    onClick={() => {
                      toast({
                        title: "Downloading...",
                        description: "Prescription download started.",
                      })
                    }}
                  >
                    <Download className="h-3 w-3" />
                    Download Prescription
                  </Button>
                </>
              )}
              {tab === "cancelled" && (
                <BookAppointmentDialog 
                  patientId={CURRENT_PATIENT_ID}
                  patientName={CURRENT_PATIENT_NAME}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AppointmentsPage() {
  const { getAppointmentsByPatient } = useDataStore()
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const allAppointments = getAppointmentsByPatient(CURRENT_PATIENT_ID)
  const today = new Date().toISOString().split('T')[0]

  const upcoming = allAppointments.filter(a => a.status === 'Scheduled' && a.date >= today)
  const past = allAppointments.filter(a => a.status === 'Completed')
  const cancelled = allAppointments.filter(a => a.status === 'Cancelled')

  const handleDoctorClick = (doctor: any) => {
    setSelectedDoctor(doctor)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            My Appointments
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and view your scheduled appointments
          </p>
        </div>
        <BookAppointmentDialog 
          patientId={CURRENT_PATIENT_ID}
          patientName={CURRENT_PATIENT_NAME}
        />
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="upcoming">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="flex flex-col gap-4">
          {upcoming.length > 0 ? (
            upcoming.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} tab="upcoming" onDoctorClick={handleDoctorClick} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No upcoming appointments</h3>
              <p className="text-sm text-muted-foreground mt-1">Book a new appointment to get started</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="flex flex-col gap-4">
          {past.length > 0 ? (
            past.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} tab="past" onDoctorClick={handleDoctorClick} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No past appointments</h3>
              <p className="text-sm text-muted-foreground mt-1">Your completed appointments will appear here</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="flex flex-col gap-4">
          {cancelled.length > 0 ? (
            cancelled.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} tab="cancelled" onDoctorClick={handleDoctorClick} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No cancelled appointments</h3>
              <p className="text-sm text-muted-foreground mt-1">All your appointments are on track</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      <DoctorDetailDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        doctor={selectedDoctor} 
      />
    </div>
  )
}
