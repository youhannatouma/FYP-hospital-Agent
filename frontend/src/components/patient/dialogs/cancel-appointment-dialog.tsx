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
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle } from "lucide-react"

interface CancelAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: number | null
  currentDoctor: string
}

export function CancelAppointmentDialog({ 
  open, 
  onOpenChange, 
  appointmentId,
  currentDoctor 
}: CancelAppointmentDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCancel = () => {
    setIsSubmitting(true)

    // Mock API
    setTimeout(() => {
      setIsSubmitting(false)
      onOpenChange(false)
      toast({
        title: "Appointment Cancelled",
        description: `Your appointment with ${currentDoctor} has been cancelled successfully.`,
      })
    }, 1000)
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
