"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDataStore } from "@/hooks/use-data-store"

interface CancelAppointmentAlertProps {
  appointmentId: string
  doctorName?: string
  onCancelled?: () => void
}

export function CancelAppointmentAlert({ appointmentId, doctorName, onCancelled }: CancelAppointmentAlertProps) {
  const { toast } = useToast()
  const { updateAppointmentStatus } = useDataStore()

  const handleCancel = () => {
    updateAppointmentStatus(appointmentId, 'Cancelled')
    toast({
      title: "Appointment Cancelled",
      description: doctorName
        ? `Your appointment with ${doctorName} has been cancelled.`
        : "Your appointment has been cancelled successfully.",
      variant: "destructive",
    })
    onCancelled?.()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <X className="h-3 w-3" />
          Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently cancel your appointment
            {doctorName ? ` with ${doctorName}` : ""} and remove it from the schedule.
            You will need to book a new appointment if you change your mind.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCancel}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Yes, Cancel It
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
