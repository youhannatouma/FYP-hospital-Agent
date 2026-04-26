"use client"

import * as React from "react"
import { getServiceContainer } from "@/lib/services/service-container"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface AddRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddRecordDialog({ open, onOpenChange }: AddRecordDialogProps) {
  const { toast } = useToast()
  const [patients, setPatients] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selectedPatientId, setSelectedPatientId] = React.useState("")
  const [diagnosis, setDiagnosis] = React.useState("")
  const [details, setDetails] = React.useState("")
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0])

  React.useEffect(() => {
    if (open) {
      const fetchPatients = async () => {
        try {
          const container = getServiceContainer()
          const allUsers = await container.user.getAllUsers()
          setPatients(allUsers.filter((u) => u.role === 'patient'))
        } catch (err) {
          console.error("[AddRecordDialog] Failed to fetch patients:", err)
        }
      }
      fetchPatients()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatientId) {
      toast({ title: "Error", description: "Please select a patient.", variant: "destructive" })
      return
    }

    setLoading(true)
    const patient = patients.find((p: any) => p.user_id === selectedPatientId)
    try {
      const container = getServiceContainer()
      await container.medicalRecord.createRecord({
        patient_id: selectedPatientId,
        record_type: "General Entry",
        title: diagnosis,
        description: details,
        date,
      })

      toast({
        title: "Record Added",
        description: `Medical record for ${patient?.first_name} ${patient?.last_name} has been successfully saved.`,
      })
      setSelectedPatientId("")
      setDiagnosis("")
      setDetails("")
      onOpenChange(false)
    } catch (err) {
      console.error("[AddRecordDialog] Failed to add record:", err)
      toast({ title: "Error", description: "Failed to save record. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Medical Record</DialogTitle>
          <DialogDescription>
            Create a new clinical entry. Select a patient and enter the diagnostic findings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="patient">Select Patient</Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p: any) => (
                  <SelectItem key={p.user_id} value={p.user_id}>
                    {p.first_name} {p.last_name} ({p.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="diagnosis">Primary Diagnosis</Label>
            <Input 
              id="diagnosis" 
              placeholder="e.g. Hypertension" 
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="details">Clinical Details</Label>
            <Textarea 
              id="details" 
              placeholder="Enter symptoms, observations, and assessment..." 
              className="min-h-[100px]"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Visit Date</Label>
            <Input 
              id="date" 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
