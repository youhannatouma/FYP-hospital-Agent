"use client"

import { useState } from "react"
import { CalendarIcon, Clock, Sparkles, ChevronRight, User, Stethoscope } from "lucide-react"
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
import { motion, AnimatePresence } from "framer-motion"

interface BookAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDoctor?: string
}

export function BookAppointmentDialog({ open, onOpenChange, defaultDoctor }: BookAppointmentDialogProps) {
  const { toast } = useToast()
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>()
  const [doctor, setDoctor] = useState(defaultDoctor || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBook = () => {
    if (!date || !time || !doctor) {
      toast({
        title: "Missing Information",
        description: "Please select a doctor, date, and time.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false)
      onOpenChange(false)
      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${doctor} is confirmed for ${format(date, "MMM d, yyyy")} at ${time}.`,
      })
      // Reset form
      setDate(undefined)
      setTime(undefined)
      if (!defaultDoctor) setDoctor("")
    }, 1000)
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
                    <SelectItem value="Dr. Michael Chen" className="rounded-xl font-bold py-3">
                      <div className="flex flex-col">
                        <span>Dr. Michael Chen</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Cardiology</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Dr. Emily Watson" className="rounded-xl font-bold py-3">
                      <div className="flex flex-col">
                        <span>Dr. Emily Watson</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">General Practice</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Dr. Sarah Kim" className="rounded-xl font-bold py-3">
                      <div className="flex flex-col">
                        <span>Dr. Sarah Kim</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Dermatology</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Dr. Raj Patel" className="rounded-xl font-bold py-3">
                      <div className="flex flex-col">
                        <span>Dr. Raj Patel</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Endocrinology</span>
                      </div>
                    </SelectItem>
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
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger className="h-14 rounded-2xl border-border/50 bg-background/50 font-bold text-sm shadow-subtle focus:ring-primary/20 transition-all">
                      <SelectValue placeholder="Identify slot" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                      {["09:00 AM", "10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"].map((t) => (
                        <SelectItem key={t} value={t} className="rounded-xl font-bold py-3">{t}</SelectItem>
                      ))}
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
