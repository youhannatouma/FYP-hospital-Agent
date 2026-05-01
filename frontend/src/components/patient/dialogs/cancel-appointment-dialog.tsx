// @ts-nocheck
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle } from "lucide-react"
import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"

interface CancelAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string | number | null
  currentDoctor: string
  onSuccess?: () => void
}

export function CancelAppointmentDialog({ 
  open, 
  onOpenChange, 
  appointmentId,
  currentDoctor,
  onSuccess,
}: CancelAppointmentDialogProps) {
  const { toast } = useToast()
  const { booking } = useHospital()
  const { getToken } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCancel = async () => {
    if (!appointmentId) return

    setIsSubmitting(true)
    try {
      const token = await getToken()
      await booking.cancelAppointment(String(appointmentId), token || undefined)
      
      onOpenChange(false)
      toast({
        title: "Appointment Cancelled",
        description: `Your appointment with ${currentDoctor} has been cancelled successfully.`,
      })
      onSuccess?.()
    } catch (error: unknown) {
      console.error("Failed to cancel appointment:", error)
      toast({
        title: "Cancellation Failed",
        description: error?.response?.data?.detail || "Could not cancel the appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Cancel Appointment
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your appointment with {currentDoctor}? 
            This action cannot be undone. If you need to see the doctor at a different time, 
            consider rescheduling instead.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border">
            Keep Appointment
          </Button>
          <Button onClick={handleCancel} disabled={isSubmitting} variant="destructive">
            {isSubmitting ? "Cancelling..." : "Yes, Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
