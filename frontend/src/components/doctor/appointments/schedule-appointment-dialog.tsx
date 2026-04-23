"use client"

import { useState } from "react"
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

  const handleSchedule = () => {
    if (!date || !time || !patient) {
      toast({
        title: "Missing Information",
        description: "Please select a patient, date, and time.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false)
      const newAppt = {
        id: Math.random(),
        patientName: patient,
        avatar: patient.split(" ").map(n => n[0]).join(""),
        type: type,
        specialty: "Cardiology", // Default for this doctor
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
        description: `Appointment with ${patient} is scheduled for ${format(date, "MMM d, yyyy")} at ${time}.`,
      })
      // Reset form
      setDate(undefined)
      setTime(undefined)
      setPatient("")
    }, 1000)
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
                <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                <SelectItem value="John Doe">John Doe</SelectItem>
                <SelectItem value="Jane Smith">Jane Smith</SelectItem>
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
