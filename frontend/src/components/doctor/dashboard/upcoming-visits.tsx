"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Video } from "lucide-react"
import Link from "next/link"
import React from "react"
import { VideoCallDialog } from "@/components/shared/video-call-dialog"

const visits = [
  {
    id: 1,
    title: "Cardiology Follow-up",
    doctor: "Dr. Michael Chen",
    date: "Jan 25, 2024",
    time: "10:00 AM",
    type: "Next",
    typeColor: "bg-primary text-primary-foreground",
    isVirtual: true,
  },
  {
    id: 2,
    title: "Annual Physical",
    doctor: "Dr. Emily Watson",
    date: "Feb 15, 2024",
    time: "2:30 PM",
    type: "Scheduled",
    typeColor: "bg-muted text-muted-foreground",
    isVirtual: false,
  },
]

export interface UpcomingVisitsProps {
  onViewAppointment?: (visit: any) => void
}

export function UpcomingVisits({ onViewAppointment }: UpcomingVisitsProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [activePatient, setActivePatient] = React.useState("")

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
          Upcoming patient
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="rounded-2xl border border-border/50 p-4 transition-all hover:bg-primary/5 cursor-pointer group/visit active:scale-98"
            onClick={() => onViewAppointment?.(visit)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold text-card-foreground">
                {visit.title}
              </h4>
              <Badge className={`text-xs ${visit.typeColor} border-0`}>
                {visit.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {visit.doctor}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3 text-destructive" />
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
                className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={(e) => handleJoin(e, visit.doctor)} // Note: doctor field in mock data seems to be used as patient name here
              >
                <Video className="mr-2 h-3 w-3" />
                Join Virtual Visit
              </Button>
            )}
          </div>
        ))}
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
      />
    </Card>
  )
}
