"use client"

import { useState } from "react"
import { getServiceContainer } from "@/lib/services/service-container"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ClipboardList, Pill, Save } from "lucide-react"

interface CompleteSessionDialogProps {
  isOpen: boolean
  onClose: () => void
  appointment: {
    appointment_id?: string
    id?: string
    patient_id: string
    patient_name?: string
  }
  onSuccess: () => void
}

export function CompleteSessionDialog({ isOpen, onClose, appointment, onSuccess }: CompleteSessionDialogProps) {
  const { toast } = useToast()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [diagnosis, setDiagnosis] = useState("")
  const [treatment, setTreatment] = useState("")
  const [notes, setNotes] = useState("")
  const [medications, setMedications] = useState("")

  const handleSubmit = async () => {
    if (!diagnosis || !treatment) {
      toast({ title: "Missing Information", description: "Please enter a diagnosis and treatment plan.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const container = getServiceContainer()
      
      // 1. Create Medical Record
      const record = await container.medicalRecord.createRecord({
        patient_id: appointment.patient_id,
        record_type: "Consultation",
        title: diagnosis,
        description: treatment,
        date: new Date().toISOString().split('T')[0]
      })

      // 2. Create Prescription if medications entered
      if (medications.trim() && record) {
        const medsList = medications.split(",").map(m => m.trim())
        await Promise.all(
          medsList.map((medicationName) =>
            container.prescription.createPrescription({
              patient_id: appointment.patient_id,
              medication_name: medicationName,
              dosage: "As directed",
              frequency: "As directed",
              duration: "30 days",
              instructions: "As discussed during the consultation.",
            })
          )
        )
      }

      // 3. Update Appointment Status to Completed
      const appointmentId = appointment.appointment_id || appointment.id
      if (!appointmentId) {
        throw new Error("Missing appointment id")
      }
      await container.appointment.completeAppointment(appointmentId)

      toast({ title: "Session Completed", description: "Medical record has been saved and patient notified." })
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Failed to complete session:", error)
      toast({ title: "Error", description: "Failed to save medical records. Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-background">
        <div className="bg-primary/5 p-8 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black text-foreground">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              Clinical Consultation Note
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground mt-2">
              Patient: <span className="text-foreground font-bold">{appointment?.patient_name}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="diagnosis" className="text-[10px] font-black uppercase tracking-widest ml-1">Primary Diagnosis</Label>
              <Input 
                id="diagnosis" 
                placeholder="e.g. Seasonal Allergic Rhinitis" 
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="rounded-xl border-border/50 h-11 focus:ring-primary/20"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="treatment" className="text-[10px] font-black uppercase tracking-widest ml-1">Treatment Plan</Label>
              <Textarea 
                id="treatment" 
                placeholder="Outline the recommended treatment..." 
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                className="rounded-xl border-border/50 min-h-[80px] focus:ring-primary/20"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="medications" className="text-[10px] font-black uppercase tracking-widest ml-1">Prescriptions (Comma separated)</Label>
              <div className="relative">
                <Input 
                  id="medications" 
                  placeholder="e.g. Amoxicillin 500mg, Paracetamol" 
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  className="rounded-xl border-border/50 h-11 pl-10 focus:ring-primary/20"
                />
                <Pill className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="grid gap-2 pt-2">
              <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest ml-1">Internal Clinical Notes (Private)</Label>
              <Textarea 
                id="notes" 
                placeholder="Additional observations, vitals, or follow-up tasks..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl border-border/50 min-h-[100px] focus:ring-primary/20 bg-muted/20"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 bg-muted/20 border-t border-border/30">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="rounded-xl font-black text-[10px] uppercase tracking-widest">
            Discard
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            className="rounded-xl px-8 h-12 bg-primary text-white hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 gap-2"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Finalize Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
