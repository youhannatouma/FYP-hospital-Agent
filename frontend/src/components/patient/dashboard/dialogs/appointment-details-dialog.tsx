"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, MapPin, User, FileText } from "lucide-react"

import { Appointment } from "@/hooks/use-data-store"

interface AppointmentDetailsDialogProps {
  children: React.ReactNode
  appointment: Appointment
}

export function AppointmentDetailsDialog({ children, appointment }: AppointmentDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer transition-colors hover:bg-muted/50 rounded-lg">
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1">
            <span>{appointment.type || "Medical Appointment"}</span>
            <span className="text-sm font-normal text-muted-foreground">{appointment.isVirtual ? "Virtual Consultation" : "In-Person Visit"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {appointment.doctorName?.split(' ').map(n => n[0]).join('').substring(1, 3) || "MD"}
            </div>
            <div>
              <h4 className="font-semibold">{appointment.doctorName}</h4>
              <p className="text-sm text-muted-foreground">{appointment.specialty || "Specialist"}</p>
            </div>
          </div>

          <div className="space-y-4 rounded-lg bg-muted/50 p-4 text-sm">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.time} (30 min)</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {appointment.isVirtual 
                  ? "Online via Secure Health Video" 
                  : "Main Clinic, Floor 3, Room 304"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Instructions</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
              <li>Please arrive 15 minutes early.</li>
              <li>Bring your recent lab results if available.</li>
              {appointment.type?.includes("Blood") && <li>Do not eat or drink 8 hours prior.</li>}
            </ul>
          </div>
          
           <div className="flex gap-2">
            <Button variant="outline" className="flex-1">Reschedule</Button>
            <Button className="flex-1">Add to Calendar</Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
