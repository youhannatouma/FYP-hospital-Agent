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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@clerk/nextjs"
import apiClient from "@/lib/api-client"

interface RescheduleDialogProps {
  appointmentId: string
  doctorName: string
  onRescheduled?: () => void
}

export function RescheduleDialog({ appointmentId, doctorName, onRescheduled }: RescheduleDialogProps) {
  const { toast } = useToast()
  const { getToken } = useAuth()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"
  ]

  const handleReschedule = async () => {
    if (!date || !selectedTime) return

    try {
      const token = await getToken()
      await apiClient.patch(
        `/appointments/${appointmentId}/reschedule`,
        {
          // In a future iteration we can send these and have the backend update slot/date/time.
          date: date.toISOString().split("T")[0],
          time: selectedTime,
        },
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined
      )

      toast({
        title: "Appointment Rescheduled",
        description: `Your appointment with ${doctorName} has been moved to ${date.toDateString()} at ${selectedTime}.`,
      })
      setOpen(false)
      onRescheduled?.()
    } catch (error) {
      toast({
        title: "Unable to reschedule appointment",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1 border-border text-foreground"
        >
          <RefreshCw className="h-3 w-3" />
          Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Choose a new date and time for your appointment with {doctorName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border shadow-sm mx-auto"
            disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
          />
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleReschedule} disabled={!date || !selectedTime}>
            Confirm New Date
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
