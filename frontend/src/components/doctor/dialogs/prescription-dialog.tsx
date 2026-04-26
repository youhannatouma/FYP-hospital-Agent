"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getServiceContainer } from "@/lib/services/service-container"
import { Pill, AlertTriangle, Info } from "lucide-react"

interface PrescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: {
    name: string
    id: string
  }
}

export function PrescriptionDialog({ open, onOpenChange, patient }: PrescriptionDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)

  const [medication, setMedication] = React.useState("")
  const [dosage, setDosage] = React.useState("")
  const [frequency, setFrequency] = React.useState("")
  const [duration, setDuration] = React.useState("")
  const [instructions, setInstructions] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const fullMedication = `${medication} ${dosage} - ${frequency} for ${duration}`.trim()
      
      const container = getServiceContainer()
      await container.prescription.createPrescription({
        patient_id: patient?.id || "",
        medications: [fullMedication],
        instructions: instructions || "Take as directed",
        days_valid: 30
      })

      toast({
        title: "Prescription Created",
        description: `New prescription for ${patient?.name || "the patient"} has been issued.`,
      })
      
      // Reset
      setMedication("")
      setDosage("")
      setFrequency("")
      setDuration("")
      setInstructions("")
      onOpenChange(false)
    } catch (error) {
      console.error("Prescription creation failed:", error)
      toast({
        title: "Error",
        description: "Failed to create prescription. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            New Prescription
          </DialogTitle>
          <DialogDescription>
            Prescribe medication for {patient?.name || "Search Patient"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="medication">Medication Name</Label>
              <Input 
                id="medication" 
                placeholder="e.g. Amoxicillin" 
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input 
                  id="dosage" 
                  placeholder="e.g. 500mg" 
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input 
                  id="frequency" 
                  placeholder="e.g. Twice daily" 
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Input 
                id="duration" 
                placeholder="e.g. 7 days" 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea 
                id="instructions" 
                placeholder="e.g. Take with food, maintain hydration..." 
                className="min-h-[80px]"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </div>

          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-bold">Drug Interaction Warning</p>
              <p>This patient is currently taking Lisinopril. No severe interactions known for common antibiotics, but monitor BP regularly.</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "E-Sign & Send..." : "Create Prescription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
