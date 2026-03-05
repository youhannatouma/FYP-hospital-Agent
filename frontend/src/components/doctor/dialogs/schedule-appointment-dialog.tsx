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
import { useDataStore } from "@/hooks/use-data-store"
import { CalendarDays, Video, MapPin, Plus } from "lucide-react"

const CURRENT_DOCTOR_ID = "doc-1"
const CURRENT_DOCTOR_NAME = "Dr. Michael Chen"

interface Props {
  trigger?: React.ReactNode
}

export function ScheduleAppointmentDialog({ trigger }: Props) {
  const { toast } = useToast()
  const { patients, addAppointment } = useDataStore()
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [form, setForm] = React.useState({
    patientId: "",
    date: "",
    time: "",
    type: "Follow-up",
    isVirtual: false,
    notes: "",
    price: "150",
  })

  const patientList = patients.filter(u => u.role === "Patient" && u.status === "Active")

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
      const patient = patientList.find(p => p.id === form.patientId)
      if (!patient) return

      addAppointment({
        id: `APT-${Date.now()}`,
        patientId: form.patientId,
        patientName: patient.name,
        doctorId: CURRENT_DOCTOR_ID,
        doctorName: CURRENT_DOCTOR_NAME,
        specialty: "Cardiology",
        date: form.date,
        time: form.time,
        status: "Scheduled",
        type: form.type,
        price: parseInt(form.price) || 150,
        isVirtual: form.isVirtual,
        notes: form.notes || undefined,
        createdAt: new Date().toISOString().split("T")[0],
      })

      toast({
        title: "Appointment Scheduled",
        description: `${form.type} with ${patient.name} on ${form.date} at ${form.time} has been booked.`,
      })
      setOpen(false)
      setForm({ patientId: "", date: "", time: "", type: "Follow-up", isVirtual: false, notes: "", price: "150" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Schedule New
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
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
            <Select value={form.patientId} onValueChange={(v) => setForm(f => ({ ...f, patientId: v }))}>
              <SelectTrigger id="patient">
                <SelectValue placeholder="Select a patient…" />
              </SelectTrigger>
              <SelectContent>
                {patientList.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
