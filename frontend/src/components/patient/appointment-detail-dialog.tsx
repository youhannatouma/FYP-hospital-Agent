// @ts-nocheck
"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Video, 
  FileText, 
  AlertCircle,
  X,
  RefreshCw,
  MessageSquare
} from "lucide-react"

interface AppointmentDetailDialogProps {
  appointment: unknown
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailDialogProps) {
  if (!appointment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground">
              Appointment Details
            </DialogTitle>
            <Badge className={`${appointment.statusColor} border-0`}>
              {appointment.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Doctor Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/20 text-primary font-bold">
                {appointment.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-bold text-foreground">{appointment.doctor}</h4>
              <p className="text-sm text-primary font-medium">{appointment.specialty}</p>
            </div>
          </div>

          {/* Time & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Date</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{appointment.date}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Time</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{appointment.time}</p>
            </div>
            <div className="col-span-2 p-3 rounded-lg bg-muted/30 border border-border space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Location</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{appointment.location}</p>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <h4 className="text-sm font-semibold">Notes from Doctor</h4>
              </div>
              <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50 border border-dashed border-border">
                {appointment.notes}
              </p>
            </div>
          )}

          {/* Important Info */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Please arrive 15 minutes before your scheduled time. 
              Bring your insurance card and any current medications for review.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between mt-4">
          <div className="flex gap-2 w-full">
            {appointment.status !== "Cancelled" && (
              <>
                <Button variant="outline" className="flex-1 border-border text-foreground gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reschedule
                </Button>
                <Button variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            {appointment.status === "Cancelled" && (
              <Button className="w-full bg-primary text-primary-foreground">
                Rebook Appointment
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
