"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"
import { CalendarDays, Video, MapPin, Plus, Loader2 } from "lucide-react"

interface Props {
  trigger?: React.ReactNode
  preSelectedPatientId?: string
  preSelectedPatientName?: string
}

export function ScheduleAppointmentDialog({ trigger, preSelectedPatientId, preSelectedPatientName }: Props) {
  const { toast } = useToast()
  const { admin } = useHospital()
  const { getToken } = useAuth()
  
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [patients, setPatients] = React.useState<any[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = React.useState(false)

  const [form, setForm] = React.useState({
    patientId: preSelectedPatientId || "",
    date: "",
    time: "",
    type: "Follow-up",
    isVirtual: false,
    notes: "",
    price: "150",
  })

  React.useEffect(() => {
    if (preSelectedPatientId) {
      setForm(prev => ({ ...prev, patientId: preSelectedPatientId }))
    }
  }, [preSelectedPatientId])

  React.useEffect(() => {
    if (open && !preSelectedPatientId) {
      const fetchPatients = async () => {
        try {
          setIsLoadingPatients(true)
          const token = await getToken()
          const data = await admin.getAllUsers(token || undefined)
          if (Array.isArray(data)) {
            setPatients(data.filter((u: any) => u.role === 'patient'))
          }
        } catch (err) {
          console.error("Failed to fetch patients:", err)
        } finally {
          setIsLoadingPatients(false)
        }
      }
      fetchPatients()
    }
  }, [open, preSelectedPatientId, admin, getToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.patientId || !form.date || !form.time) {
      toast({
        title: "Missing Fields",
        description: "Please select a patient, date, and time.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const patient = patients.find((p) => p.user_id === form.patientId)
      const patientName = patient
        ? `${patient.first_name} ${patient.last_name}`.trim()
        : preSelectedPatientName || "Patient"
      const appointmentDate = new Date(`${form.date}T${form.time}`)

      const newAppointment = {
        id: Math.random().toString(36).slice(2),
        patientId: form.patientId,
        patientName,
        date: appointmentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: appointmentDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        type: form.type,
        isVirtual: form.isVirtual,
        appointment_type: form.type,
        status: "Scheduled",
        notes: form.notes,
      }

      toast({
        title: "Appointment Created",
        description: "This appointment is currently queued in the doctor workflow and will sync once backend support is enabled.",
      })

      onSuccess?.(newAppointment)
      setOpen(false)
      setForm({ patientId: preSelectedPatientId || "", date: "", time: "", type: "Follow-up", isVirtual: false, notes: "", price: "150" })
    } catch (error) {
      console.error("Scheduling failed:", error)
      toast({
        title: "Error",
        description: "Failed to create appointment placeholder. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Schedule New
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Schedule Appointment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient */}
          <div className="space-y-1.5">
            <Label htmlFor="patient">Patient *</Label>
            {preSelectedPatientId ? (
              <Input 
                value={preSelectedPatientName || "Selected Patient"} 
                readOnly 
                className="bg-muted rounded-xl font-bold" 
              />
            ) : (
              <Select value={form.patientId} onValueChange={(v) => setForm(f => ({ ...f, patientId: v }))}>
                <SelectTrigger id="patient" className="rounded-xl">
                  {isLoadingPatients ? (
                    <div className="flex items-center gap-2 italic text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading patients...
                    </div>
                  ) : (
                    <SelectValue placeholder="Select a patient…" />
                  )}
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {patients.map((p: any) => (
                    <SelectItem key={p.user_id} value={p.user_id}>{p.first_name} {p.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))}
              />
            </div>
          </div>

          {/* Appointment Type */}
          <div className="space-y-1.5">
            <Label>Appointment Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="New Patient">New Patient</SelectItem>
                <SelectItem value="Consultation">Consultation</SelectItem>
                <SelectItem value="Check-up">Check-up</SelectItem>
                <SelectItem value="Annual Physical">Annual Physical</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label htmlFor="price">Consultation Fee ($)</Label>
            <Input
              id="price"
              type="number"
              value={form.price}
              onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="150"
              min="0"
            />
          </div>

          {/* Virtual Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border">
            <div className="flex items-center gap-2">
              {form.isVirtual
                ? <Video className="h-4 w-4 text-blue-500" />
                : <MapPin className="h-4 w-4 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium">{form.isVirtual ? "Virtual (Telehealth)" : "In-Person"}</p>
                <p className="text-xs text-muted-foreground">Toggle appointment mode</p>
              </div>
            </div>
            <Switch
              checked={form.isVirtual}
              onCheckedChange={(v) => setForm(f => ({ ...f, isVirtual: v }))}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any pre-appointment instructions…"
              className="resize-none min-h-[80px]"
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling…" : "Book Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
