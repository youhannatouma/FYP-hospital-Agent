// @ts-nocheck
"use client"

/**
 * AppointmentDetailDialog (Doctor View)
 * Follows: Single Responsibility Principle (SRP) — presentation only, API via repository
 * Follows: Dependency Inversion Principle (DIP) — uses IAppointmentRepository via container
 */

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, Video, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getServiceContainer } from "@/lib/services/service-container"

// ─── Status Utilities (SRP: pure functions, no side effects) ─────────────────

function getStatusColor(status: string): string {
  switch (status) {
    case "Scheduled":    return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    case "In Progress":  return "bg-primary/10 text-primary border-primary/20"
    case "Completed":    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    case "Cancelled":    return "bg-destructive/10 text-destructive border-destructive/20"
    case "Pending":      return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    default:             return "bg-muted text-muted-foreground"
  }
}

function getInitials(name: string): string {
  if (!name) return "PT"
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

function formatAppointmentDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateString
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppointmentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: {
    appointment_id?: string
    id?: string
    patient_name?: string
    patientName?: string
    status?: string
    type?: string
    appointment_type?: string
    date?: string
    appointment_date?: string
    time?: string
    start_time?: string
    location?: string
    room_id?: string
    isVirtual?: boolean
    is_virtual?: boolean
    notes?: string
    reason?: string
  } | null
  /** Optional callback to refresh parent list instead of page reload */
  onStatusChanged?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppointmentDetailDialog({
  open,
  onOpenChange,
  appointment,
  onStatusChanged,
}: AppointmentDetailDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)

  if (!appointment) return null

  const handleStatusChange = async (newStatus: "completed" | "cancelled") => {
    setLoading(true)
    try {
      const container = getServiceContainer()

      if (newStatus === "completed") {
        await container.appointment.completeAppointment(appointment.appointment_id || appointment.id || "")
      } else {
        await container.appointment.cancelAppointment(appointment.appointment_id || appointment.id || "")
      }

      toast({
        title: "Status Updated",
        description: `Appointment with ${appointment.patient_name || "the patient"} is now ${newStatus}.`,
      })

      onOpenChange(false)
      // Prefer callback-based refresh over full page reload
      if (onStatusChanged) {
        onStatusChanged()
      } else {
        // Fallback: reload only if no refresh callback is provided
        window.location.reload()
      }
    } catch (error) {
      console.error("[AppointmentDetailDialog] Failed to update status:", error)
      toast({
        title: "Update Failed",
        description: "Could not synchronize the status change with the clinical server.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const patientName = appointment.patient_name || appointment.patientName || "Unknown Patient"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogTitle className="sr-only">Appointment Details</DialogTitle>
        <DialogDescription className="sr-only">
          Reference #{String(appointment.appointment_id || appointment.id).split("-").pop()?.toUpperCase()}
        </DialogDescription>

        {/* Header row */}
        <div className="flex items-center justify-between pr-6 mb-2">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Appointment Details</h2>
          <Badge className={getStatusColor(appointment.status || "")} variant="outline">
            {appointment.status}
          </Badge>
        </div>

        <div className="space-y-6 py-6 border-y my-4">
          {/* Patient identity */}
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patientName}`} />
              <AvatarFallback>{getInitials(patientName)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-bold text-lg">{patientName}</h4>
              <p className="text-sm text-muted-foreground">{appointment.type || appointment.appointment_type || "Consultation"}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Date</p>
                <p className="text-sm font-medium">
                  {formatAppointmentDate(appointment.date || appointment.appointment_date || "")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Time</p>
                <p className="text-sm font-medium">{appointment.time || appointment.start_time || "—"}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Location</p>
              <p className="text-sm font-medium">
                {appointment.isVirtual || appointment.is_virtual
                  ? "Virtual — Secure Video Room"
                  : "Main Hospital • Block C, Room 402"}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Reason for Visit</p>
            <p className="text-sm bg-muted p-3 rounded-lg border-l-4 border-primary italic">
              {appointment.notes || appointment.reason || "General consultation and health review."}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {appointment.status === "Scheduled" && (
            <Button
              className="w-full gap-2"
              onClick={() =>
                toast({ title: "Connecting...", description: "Initializing secure clinical video session..." })
              }
              disabled={loading}
            >
              <Video className="h-4 w-4" /> Start Consultation
            </Button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
              onClick={() => handleStatusChange("completed")}
              disabled={loading || appointment.status === "Completed" || appointment.status === "completed"}
            >
              <CheckCircle2 className="h-4 w-4" /> Complete
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-destructive hover:bg-destructive/5 border-destructive/20"
              onClick={() => handleStatusChange("cancelled")}
              disabled={loading || appointment.status === "Cancelled" || appointment.status === "cancelled"}
            >
              <XCircle className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
