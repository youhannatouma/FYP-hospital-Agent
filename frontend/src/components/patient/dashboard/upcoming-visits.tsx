"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Video, ArrowRight } from "lucide-react"
import Link from "next/link"
import { JoinMeetingDialog } from "@/components/patient/dashboard/dialogs/join-meeting-dialog"
import { AppointmentDetailsDialog } from "@/components/patient/dashboard/dialogs/appointment-details-dialog"
import { useDataStore } from "@/hooks/use-data-store"

export function UpcomingVisits() {
  const { appointments } = useDataStore()

  const upcomingVisits = appointments
    .filter(app => app.status === 'Scheduled' || app.status === 'Pending')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  return (
    <Card className="border-sidebar-border bg-card/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <CalendarDays className="h-5 w-5 text-primary" />
          Upcoming Visits
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {upcomingVisits.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm border-2 border-dashed border-muted rounded-xl">
             No upcoming clinical appointments.
          </div>
        ) : (
          upcomingVisits.map((visit) => (
            <div
              key={visit.id}
              className="rounded-xl border border-sidebar-border bg-background p-4 hover:border-primary/30 transition-all group"
            >
              <AppointmentDetailsDialog appointment={visit}>
                <div className="flex items-start justify-between mb-2 cursor-pointer group-hover:text-primary transition-colors">
                  <h4 className="font-bold truncate max-w-[150px]">
                    {visit.doctorName}
                  </h4>
                  <Badge className={
                    visit.status === 'Scheduled' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  } variant="outline">
                    {visit.status === 'Scheduled' ? 'Confirmed' : visit.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-medium mb-3 italic">
                  {visit.type}
                </p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3 text-rose-500" />
                    {visit.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {visit.time}
                  </span>
                </div>
              </AppointmentDetailsDialog>
              
              {visit.type?.toLowerCase().includes('virtual') && (
                <div className="mt-4 pt-4 border-t border-sidebar-border">
                   <JoinMeetingDialog />
                </div>
              )}
            </div>
          ))
        )}
        <Button variant="ghost" className="w-full text-xs font-bold text-primary gap-2 mt-2" asChild>
          <Link href="/patient/appointments">
            Manage Appointments <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
