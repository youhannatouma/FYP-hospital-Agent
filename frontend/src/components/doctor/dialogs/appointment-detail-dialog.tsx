"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, Video, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

interface AppointmentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: any | null
}

export function AppointmentDetailDialog({ open, onOpenChange, appointment }: AppointmentDetailDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)

  if (!appointment) return null

  const handleStatusChange = async (newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    setLoading(true)
    try {
      let endpoint = `/appointments/${appointment.appointment_id}`;
      if (newStatus === 'completed') endpoint += '/complete';
      else if (newStatus === 'cancelled') endpoint += '/cancel';
      
      await apiClient.patch(endpoint)
      
      toast({
        title: "Status Synchronized",
        description: `Appointment with ${appointment.patient_name} is now ${newStatus}.`,
      })
      onOpenChange(false)
      // Refresh page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Failed to update appointment status', error);
      toast({
        title: "Update Failed",
        description: "Could not synchronize the status change with the clinical server.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "In Progress": return "bg-primary/10 text-primary border-primary/20"
      case "Completed": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "Cancelled": return "bg-destructive/10 text-destructive border-destructive/20"
      case "Pending": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "PT"
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogTitle className="sr-only">Appointment Details</DialogTitle>
        <DialogDescription className="sr-only">
          Reference #{String(appointment.id).split('-').pop()?.toUpperCase() || appointment.id}
        </DialogDescription>
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <h2 className="text-lg font-semibold leading-none tracking-tight">Appointment Details</h2>
            <Badge className={getStatusColor(appointment.status)} variant="outline">
              {appointment.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6 border-y my-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.patientName}`} />
              <AvatarFallback>{getInitials(appointment.patientName)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-bold text-lg">{appointment.patientName}</h4>
              <p className="text-sm text-muted-foreground">{appointment.type}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Time</p>
                <p className="text-sm font-medium">{appointment.time}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Location</p>
              <p className="text-sm font-medium">{appointment.isVirtual ? "Virtual - Secure Video Room" : "Main Hospital • Block C, Room 402"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Reason for Visit</p>
            <p className="text-sm bg-muted p-3 rounded-lg border-l-4 border-primary italic">
              {appointment.notes || "General consultation and health review."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {appointment.status === "Scheduled" && (
            <Button 
              className="w-full gap-2" 
              onClick={() => toast({ title: "Connecting...", description: "Initializing secure clinical video session..." })} 
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
              disabled={loading || appointment.status === 'Completed'}
            >
              <CheckCircle2 className="h-4 w-4" /> Complete
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 text-destructive hover:bg-destructive/5 border-destructive/20" 
              onClick={() => handleStatusChange("cancelled")}
              disabled={loading || appointment.status === 'Cancelled'}
            >
              <XCircle className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
