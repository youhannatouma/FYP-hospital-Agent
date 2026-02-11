"use client"

import { useState } from "react"
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
  X,
  RefreshCw,
  Eye,
  CalendarPlus,
} from "lucide-react"

interface Appointment {
  id: number
  doctor: string
  specialty: string
  avatar: string
  date: string
  time: string
  type: "Video" | "In-person" | "Phone"
  typeIcon: typeof Video
  status: string
  statusColor: string
  location: string
  notes?: string
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
    statusColor: "bg-emerald-500/10 text-emerald-600",
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
    statusColor: "bg-blue-500/10 text-blue-600",
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
    statusColor: "bg-amber-500/10 text-amber-600",
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
    statusColor: "bg-emerald-500/10 text-emerald-600",
    location: "Downtown Medical Center",
  },
  {
    id: 5,
    doctor: "Dr. Sarah Kim",
    specialty: "Dermatology",
    avatar: "SK",
    date: "Dec 20, 2023",
    time: "3:00 PM",
    type: "Video",
    typeIcon: Video,
    status: "Completed",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    location: "Virtual - Telehealth",
  },
  {
    id: 6,
    doctor: "Dr. Emily Watson",
    specialty: "General Practice",
    avatar: "EW",
    date: "Nov 15, 2023",
    time: "9:00 AM",
    type: "In-person",
    typeIcon: MapPin,
    status: "Completed",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    location: "Westside Clinic, Suite 204",
  },
]

const cancelledAppointments: Appointment[] = [
  {
    id: 7,
    doctor: "Dr. James Rodriguez",
    specialty: "Orthopedics",
    avatar: "JR",
    date: "Jan 5, 2024",
    time: "1:00 PM",
    type: "In-person",
    typeIcon: MapPin,
    status: "Cancelled",
    statusColor: "bg-destructive/10 text-destructive",
    location: "Sports Medicine Center",
    notes: "Cancelled by patient",
  },
]

function AppointmentCard({
  appointment,
  tab,
}: {
  appointment: Appointment
  tab: string
}) {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {appointment.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">
                  {appointment.doctor}
                </h3>
                <p className="text-sm text-primary">{appointment.specialty}</p>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs ${appointment.statusColor} border-0`}
              >
                {appointment.status}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{appointment.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <appointment.typeIcon className="h-3.5 w-3.5" />
                <span>{appointment.type}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{appointment.location}</span>
            </div>

            {appointment.notes && (
              <p className="mt-2 text-xs text-muted-foreground italic">
                {appointment.notes}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {tab === "upcoming" && (
                <>
                  {appointment.type === "Video" && (
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                    >
                      <Video className="h-3 w-3" />
                      Join Call
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 border-border text-foreground"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reschedule
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                </>
              )}
              {tab === "past" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 border-border text-foreground"
                  >
                    <Eye className="h-3 w-3" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 border-border text-foreground"
                  >
                    <Download className="h-3 w-3" />
                    Download Prescription
                  </Button>
                </>
              )}
              {tab === "cancelled" && (
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                >
                  <CalendarPlus className="h-3 w-3" />
                  Rebook
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AppointmentsPage() {
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
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <CalendarPlus className="h-4 w-4" />
          Book New Appointment
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="upcoming">
              Upcoming (3)
            </TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="in-person">In-person</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="date-asc">
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">Date (Earliest)</SelectItem>
                <SelectItem value="date-desc">Date (Latest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="upcoming" className="flex flex-col gap-4">
          {upcomingAppointments.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} tab="upcoming" />
          ))}
        </TabsContent>

        <TabsContent value="past" className="flex flex-col gap-4">
          {pastAppointments.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} tab="past" />
          ))}
        </TabsContent>

        <TabsContent value="cancelled" className="flex flex-col gap-4">
          {cancelledAppointments.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} tab="cancelled" />
          ))}
          {cancelledAppointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                No cancelled appointments
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                All your appointments are on track
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
