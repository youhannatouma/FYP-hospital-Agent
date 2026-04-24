"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import apiClient from "@/lib/api-client"
import { CalendarIcon, Clock, Sparkles, ChevronRight, User, Stethoscope, Loader2 } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"


interface Doctor {
  id: string
  first_name: string | null
  last_name: string | null
  specialty: string | null
  email: string
}

interface TimeSlot {
  slot_id: string
  start_time: string
  end_time: string
  time: string
}

interface BookAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDoctor?: string
}

export function BookAppointmentDialog({ open, onOpenChange, defaultDoctor }: BookAppointmentDialogProps) {
  const { toast } = useToast()
  const { getToken } = useAuth()
  const [date, setDate] = useState<Date>()
  const [selectedSlotId, setSelectedSlotId] = useState<string>()
  const [doctor, setDoctor] = useState(defaultDoctor || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)

  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!open) return
      setIsLoadingDoctors(true)
      try {
        const token = await getToken()
        const response = await apiClient.get("/doctors", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setDoctors(response.data)
      } catch (error) {
        console.error("Failed to fetch doctors:", error)
        toast({
          title: "Network Error",
          description: "Could not retrieve clinician registry. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingDoctors(false)
      }
    }
    fetchDoctors()
  }, [open, getToken, toast])

  // Fetch slots when doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor || !date) {
        setSlots([])
        return
      }
      setIsLoadingSlots(true)
      try {
        const token = await getToken()
        const dateStr = format(date, "yyyy-MM-dd")
        const response = await apiClient.get(`/doctors/${doctor}/slots`, {
          params: { date: dateStr },
          headers: { Authorization: `Bearer ${token}` }
        })
        setSlots(response.data)
      } catch (error) {
        console.error("Failed to fetch slots:", error)
      } finally {
        setIsLoadingSlots(false)
      }
    }
    fetchSlots()
  }, [doctor, date, getToken])

  const handleBook = async () => {
    if (!date || !selectedSlotId || !doctor) {
      toast({
        title: "Missing Information",
        description: "Please select a doctor, date, and time slot.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const token = await getToken()
      const response = await apiClient.post(
        "/appointments/bookings",
        {
          doctor_id: doctor,
          slot_id: selectedSlotId,
          day: format(date, "yyyy-MM-dd"),
          time: slots.find(s => s.slot_id === selectedSlotId)?.time || "",
          appointment_type: "Video Consultation",
          fee: 150.0,
          is_virtual: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      onOpenChange(false)

      const selectedDoc = doctors.find((d) => d.id === doctor)
      const selectedSlot = slots.find(s => s.slot_id === selectedSlotId)
      const doctorLabel = selectedDoc
        ? `Dr. ${selectedDoc.first_name} ${selectedDoc.last_name}`
        : "your specialist"

      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${doctorLabel} is confirmed for ${format(date, "MMM d, yyyy")} at ${selectedSlot?.time}.`,
      })

      // Reset form
      setDate(undefined)
      setSelectedSlotId(undefined)
      if (!defaultDoctor) setDoctor("")
    } catch (error: any) {
      console.error("Booking failed:", error)
      toast({
        title: "Booking Failed",
        description:
          error.response?.data?.detail || "Could not complete the booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-card/95 backdrop-blur-2xl shadow-2xl rounded-[2.5rem]">
        <div className="relative overflow-hidden">
          {/* Decorative Header Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
          
          <DialogHeader className="relative z-10 p-8 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner-glow">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary">
                Protocol: Scheduling
              </div>
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-foreground leading-none">
              Book Appointment
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-base mt-2">
              Synchronize with our medical experts for personalized clinical guidance.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content Region */}
          <div className="relative z-10 px-8 py-4 dialog-content-scrollable">
            <div className="grid gap-8 py-2">
              {/* Doctor Selection */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <User className="h-3 w-3" /> Select Provider
                </label>
                <Select value={doctor} onValueChange={setDoctor}>
                  <SelectTrigger className="h-14 rounded-2xl border-border/50 bg-background/50 font-bold text-sm shadow-subtle focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Identify specialist" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                    {isLoadingDoctors ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Synchronizing registry...</span>
                      </div>
                    ) : doctors.length === 0 ? (
                      <div className="py-8 text-center">
                        <span className="text-xs font-bold text-muted-foreground italic">No available specialists identified.</span>
                      </div>
                    ) : (
                      doctors.map((doc) => (
                        <SelectItem 
                          key={doc.id} 
                          value={doc.id} 
                          className="rounded-xl font-bold py-3"
                        >
                          <div className="flex flex-col text-left">
                            <span className="leading-tight">
                              Dr. {doc.first_name} {doc.last_name}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                              {doc.specialty || "Medical Specialist"}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <CalendarIcon className="h-3 w-3" /> Preferred Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-14 rounded-2xl border-border/50 bg-background/50 font-bold text-sm shadow-subtle flex items-center justify-between px-4 group hover:bg-muted/50 transition-all",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          {date ? format(date, "PPP") : "Select date"}
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-30 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-3xl border-border/50 shadow-2xl overflow-hidden" align="start">
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

                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" /> Availability
                  </label>
                  <Select value={selectedSlotId} onValueChange={setSelectedSlotId}>
                    <SelectTrigger className="h-14 rounded-2xl border-border/50 bg-background/50 font-bold text-sm shadow-subtle focus:ring-primary/20 transition-all">
                      <SelectValue placeholder={!doctor || !date ? "Select doctor & date first" : "Identify slot"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                      {isLoadingSlots ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-2">
                          <Loader2 className="h-4 w-4 text-primary animate-spin" />
                          <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Checking slots...</span>
                        </div>
                      ) : slots.length === 0 ? (
                        <div className="py-6 text-center">
                          <span className="text-xs font-bold text-muted-foreground italic">
                            {!doctor || !date ? "Pending selection" : "No slots available"}
                          </span>
                        </div>
                      ) : (
                        slots.map((s) => (
                          <SelectItem key={s.slot_id} value={s.slot_id} className="rounded-xl font-bold py-3">
                            {s.time}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Context (Optional Placeholder) */}
              <div className="space-y-3 mt-2">
                 <div className="p-4 rounded-2xl bg-primary/5 border border-dashed border-primary/20 flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                       <Stethoscope className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                       Upon confirmation, a secure link and clinical preparation instructions will be dispatched to your registered communique.
                    </p>
                 </div>
              </div>
            </div>
          </div>

          <DialogFooter className="relative z-10 p-8 pt-4 flex flex-col sm:flex-row gap-4 border-t border-border/30 bg-card/50">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="h-12 flex-1 rounded-2xl border-border/50 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-all"
            >
              Cancel Session
            </Button>
            <Button 
              onClick={handleBook} 
              disabled={isSubmitting} 
              className={cn(
                "h-12 flex-1 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-primary font-black text-[10px] uppercase tracking-widest shadow-glow transition-all active:scale-95",
                isSubmitting && "opacity-50"
              )}
            >
              {isSubmitting ? "Orchestrating..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
