"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getServiceContainer } from "@/lib/services/service-container"

interface ScheduleAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (appointment: any) => void
}

export function ScheduleAppointmentDialog({ open, onOpenChange, onSuccess }: ScheduleAppointmentDialogProps) {
  const { toast } = useToast()
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>()
  const [patient, setPatient] = useState("")
  const [type, setType] = useState("Video Consultation")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patients, setPatients] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      const container = getServiceContainer()
      container.user.getAllUsers().then(users => {
        if (Array.isArray(users)) {
          setPatients(users.filter((u: any) => u.role === 'patient'))
        }
      }).catch(err => console.error("Failed to fetch patients:", err))
    }
  }, [open])

  const handleSchedule = async () => {
    if (!date || !time || !patient) {
      toast({
        title: "Missing Information",
        description: "Please select a patient, date, and time.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const selectedPatient = patients.find(p => p.user_id === patient)
      if (!selectedPatient) throw new Error("Patient not found")

      const container = getServiceContainer()
      await container.appointment.bookAppointment({
        patient_id: patient,
        appointment_type: type,
        date: format(date, 'yyyy-MM-dd'),
        time: time
      })

      const newAppt = {
        id: Math.random().toString(),
        patient_id: patient,
        patientName: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
        avatar: selectedPatient.first_name?.[0] || "P",
        type: type,
        specialty: "General",
        date: format(date, "MMM d, yyyy"),
        time: time,
        duration: "30 min",
        status: "Upcoming",
        notes: "",
        isVideo: type === "Video Consultation",
      }
      onSuccess?.(newAppt)
      onOpenChange(false)
      toast({
        title: "Appointment Scheduled!",
        description: `Appointment with ${selectedPatient.first_name} ${selectedPatient.last_name} is scheduled for ${format(date, "MMM d, yyyy")} at ${time}.`,
      })
      // Reset form
      setDate(undefined)
      setTime(undefined)
      setPatient("")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to schedule appointment.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>
            Schedule a new appointment with a patient.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none">
              Patient
            </label>
            <Select value={patient} onValueChange={setPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(p => (
                  <SelectItem key={p.user_id} value={p.user_id}>
                    {p.first_name} {p.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none">
              Appointment Type
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Video Consultation">Video Consultation</SelectItem>
                <SelectItem value="In-Person Visit">In-Person Visit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none">
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal border-border",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none">
              Time
            </label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time slot">
                  {time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {time}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                <SelectItem value="11:30 AM">11:30 AM</SelectItem>
                <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                <SelectItem value="02:30 PM">02:30 PM</SelectItem>
                <SelectItem value="04:00 PM">04:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border">
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={isSubmitting} className="bg-primary text-primary-foreground">
            {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
