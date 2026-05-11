"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import React from "react"
import { getServiceContainer } from "@/lib/services/service-container"
import type { Appointment } from "@/lib/services/repositories/appointment-repository"

type DoctorVisit = Appointment & {
  title: string
  badgeLabel: string
  badgeClassName: string
}

export interface UpcomingVisitsProps {
  onViewAppointment?: (visit: unknown) => void
}

export function UpcomingVisits({ onViewAppointment }: Readonly<UpcomingVisitsProps>) {
  const [visits, setVisits] = React.useState<DoctorVisit[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isActive = true

    const fetchAppointments = async () => {
      try {
        setIsLoading(true)
        const container = getServiceContainer()
        const appointments = await container.appointment.getDoctorAppointments()
        if (!isActive) return

        const normalized = (Array.isArray(appointments) ? appointments : [])
          .slice(0, 3)
          .map((appointment, index) => ({
            ...appointment,
            title: appointment.appointment_type || "Consultation",
            badgeLabel: index === 0 ? "Next" : "Scheduled",
            badgeClassName:
              index === 0
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
          }))

        setVisits(normalized)
      } catch (error) {
        console.error("[DoctorUpcomingVisits] Failed to load appointments:", error)
        if (!isActive) return
        setVisits([])
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    fetchAppointments()

    return () => {
      isActive = false
    }
  }, [])

  return (
    <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
          <CalendarDays className="h-4 w-4 text-accent" />
          Upcoming appointments
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading upcoming appointments...</p>
          </div>
        ) : visits.length > 0 ? (
          visits.map((visit) => (
            <div
              key={visit.appointment_id}
              role="button"
              tabIndex={0}
              className="cursor-pointer rounded-2xl border border-border/50 p-4 transition-all hover:bg-primary/5 group/visit active:scale-98"
              onClick={() => onViewAppointment?.(visit)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onViewAppointment?.(visit)
                }
              }}
            >
              <div className="mb-2 flex items-start justify-between">
                <h4 className="text-sm font-semibold text-card-foreground">
                  {visit.title}
                </h4>
                <Badge className={`border-0 text-xs ${visit.badgeClassName}`}>
                  {visit.badgeLabel}
                </Badge>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">
                {visit.patient_name || "Patient"}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3 text-destructive" />
                  {visit.date || "Date pending"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {visit.time || "Time pending"}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full"
                onClick={(event) => {
                  event.stopPropagation()
                  onViewAppointment?.(visit)
                }}
              >
                Review appointment
              </Button>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
            No scheduled appointments yet.
          </div>
        )}
        <Link
          href="/doctor/appointments"
          className="text-center text-sm text-primary hover:underline"
        >
          View All Appointments
        </Link>
      </CardContent>
    </Card>
  )
}
