"use client"

import React, { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { CalendarPlus, CheckCircle2, Clock, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDataStore } from "@/hooks/use-data-store"
import { useHospital } from "@/hooks/use-hospital"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/nextjs"


interface BookAppointmentDialogProps {
  patientId?: string
  patientName?: string
  initialDoctorId?: string | null
  onBooked?: () => void
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function BookAppointmentDialog({ 
  patientId = "pat-1", 
  patientName = "Sarah Johnson", 
  initialDoctorId = null, 
  onBooked,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: BookAppointmentDialogProps) {
  const { toast } = useToast()
  const { getToken } = useAuth()
  const { booking } = useHospital()
  const { getDoctors, addAppointment } = useDataStore()  // keep for fallback
  const [step, setStep] = useState(1)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(initialDoctorId)
  const [appointmentType, setAppointmentType] = useState<string>("In-person")
  const [internalOpen, setInternalOpen] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (val: boolean) => {
    setControlledOpen?.(val)
    setInternalOpen(val)
  }

  // Sync selectedDoctorId when dialog opens with a specific doctor
  React.useEffect(() => {
    if (open && initialDoctorId) {
      setSelectedDoctorId(initialDoctorId)
      const doc = getDoctors().find((d: any) => d.id === initialDoctorId)
      if (doc) setSelectedSpecialty(doc.specialty || null)
    }
  }, [open, initialDoctorId, getDoctors])

  const [allDoctors, setAllDoctors] = useState<any[]>([])
  React.useEffect(() => {
    const loadDoctors = async () => {
      const token = await getToken()
      const docs = await booking.getAvailableDoctors(selectedSpecialty || undefined, token || undefined)
      setAllDoctors(docs || [])
    }
    loadDoctors()
  }, [selectedSpecialty, booking, getToken])

  const specialties = [...new Set(allDoctors.map((d: any) => d.specialty).filter(Boolean))] as string[]
  const filteredDoctors = selectedSpecialty
    ? allDoctors.filter((d: any) => d.specialty === selectedSpecialty)
    : allDoctors
  const selectedDoctor = allDoctors.find((d: any) => d.id === selectedDoctorId)

  const [timeSlots, setTimeSlots] = useState<string[]>([])

  React.useEffect(() => {
    const loadSlots = async () => {
      if (selectedDoctor && date) {
        const token = await getToken()
        const slots = await booking.getSlots(selectedDoctor.id, date.toISOString().split('T')[0], token || undefined)
        if (Array.isArray(slots)) {
          setTimeSlots(slots.map((s: any) => s.time))
        }
      }
    }
    loadSlots()
  }, [selectedDoctor, date, booking, getToken])

  const handleBook = async () => {
    if (!selectedDoctor || !date || !selectedTime) return

    const formattedDate = date.toISOString().split('T')[0]
    try {
      const token = await getToken()
      const result = await booking.submitBooking({
        patientId,
        patientName,
        doctor_id: selectedDoctor.id,
        day: formattedDate,
        time: selectedTime,
        appointment_type: appointmentType === "Video" ? "Virtual Consultation" : "Consultation",
        fee: 150,
        is_virtual: appointmentType === "Video",
      }, token || undefined)

      // Also update local mock store so the UI reflects the new appointment immediately
      addAppointment({
        patientId,
        patientName,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: formattedDate,
        time: selectedTime,
        status: 'Scheduled',
        type: appointmentType === "Video" ? "Virtual Consultation" : "Consultation",
        price: 150,
        isVirtual: appointmentType === "Video",
      })

      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${selectedDoctor.name} on ${date.toDateString()} at ${selectedTime} has been confirmed.`,
      })
      setOpen(false)
      onBooked?.()
      setTimeout(() => {
        setStep(1)
        setSelectedTime(null)
        setSelectedDoctorId(null)
        setSelectedSpecialty(null)
      }, 500)
    } catch (error) {
      toast({
        title: "Unable to book appointment",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <CalendarPlus className="h-4 w-4" />
            Book New Appointment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            {step === 1 && "Select a specialist and doctor."}
            {step === 2 && "Choose a preferred date and time."}
            {step === 3 && "Review and confirm details."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialty</label>
                <Select value={selectedSpecialty || ""} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((s: string) => (
                      <SelectItem key={s} value={s!}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Doctor</label>
                <Select value={selectedDoctorId || ""} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} {d.specialty ? `(${d.specialty})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In-person">In-person</SelectItem>
                    <SelectItem value="Video">Video Call</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="rounded-md border p-2">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border shadow-sm mx-auto"
                  disabled={(d: Date) => d < new Date(new Date().setHours(0,0,0,0))}
                />
              </div>
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
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-muted p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">{selectedDoctor?.name}</span>
                  <span className="text-xs text-muted-foreground">({selectedDoctor?.specialty})</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarPlus className="h-4 w-4 text-primary" />
                  <span>{date?.toDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{selectedTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-500/10 p-3 rounded-md">
                <CheckCircle2 className="h-4 w-4" />
                <span>Available for booking</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div /> // Spacer
          )}
          
          {step < 3 ? (
            <Button 
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !selectedDoctorId}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleBook} disabled={!selectedTime || !date}>
              Confirm Booking
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
