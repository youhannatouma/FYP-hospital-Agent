"use client"

import * as React from "react"
import { useUser, useAuth } from "@clerk/nextjs"
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
import { useHospital } from "@/hooks/use-hospital"

interface AddRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recordType?: string
  preSelectedPatientId?: string
}

export function AddRecordDialog({ 
  open, 
  onOpenChange, 
  recordType = "General Entry",
  preSelectedPatientId 
}: AddRecordDialogProps) {
  const { toast } = useToast()
  const { getToken } = useAuth()
  const { medicalRecords, admin } = useHospital()
  const [patients, setPatients] = React.useState<any[]>([])
  
  const [loading, setLoading] = React.useState(false)
  const [selectedPatientId, setSelectedPatientId] = React.useState(preSelectedPatientId || "")
  const [diagnosis, setDiagnosis] = React.useState("")
  const [details, setDetails] = React.useState("")
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0])

  React.useEffect(() => {
    if (preSelectedPatientId) {
      setSelectedPatientId(preSelectedPatientId)
    }
  }, [preSelectedPatientId])

  React.useEffect(() => {
    if (open && !preSelectedPatientId) {
      const fetchPatients = async () => {
        try {
          const token = await getToken()
          const data = await admin.getAllUsers(token || undefined)
          if (Array.isArray(data)) {
            setPatients(data.filter((u: any) => u.role === 'patient'))
          }
        } catch (err) {
          console.error("Failed to fetch patients:", err)
        }
      }
      fetchPatients()
    }
  }, [open, preSelectedPatientId, getToken, admin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatientId) {
      toast({ title: "Error", description: "Please select a patient.", variant: "destructive" })
      return
    }

    setLoading(true)
    
    try {
      const token = await getToken()
      await medicalRecords.createRecord({
        patient_id: selectedPatientId,
        record_type: recordType,
        diagnosis,
        treatment: "See clinical notes",
        clinical_notes: details,
      }, token || undefined)

      toast({
        title: recordType === "Lab Result" ? "Lab Ordered" : "Record Added",
        description: `Successfully saved ${recordType.toLowerCase()} entry.`,
      })
      
      // Reset form
      if (!preSelectedPatientId) setSelectedPatientId("")
      setDiagnosis("")
      setDetails("")
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to add record:", err)
      toast({ title: "Error", description: "Failed to save record. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>{recordType === "Lab Result" ? "Order New Lab Test" : "Add Medical Record"}</DialogTitle>
          <DialogDescription>
            {recordType === "Lab Result" 
              ? "Specify the laboratory test and diagnostic intent." 
              : "Create a new clinical entry for the patient's timeline."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {!preSelectedPatientId && (
            <div className="grid gap-2">
              <Label htmlFor="patient">Select Patient</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a patient..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {patients.map((p: any) => (
                    <SelectItem key={p.user_id} value={p.user_id}>
                      {p.first_name} {p.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="diagnosis">{recordType === "Lab Result" ? "Test Name / Indication" : "Primary Diagnosis"}</Label>
            <Input 
              id="diagnosis" 
              placeholder={recordType === "Lab Result" ? "e.g. Complete Blood Count" : "e.g. Hypertension"} 
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="rounded-xl"
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="details">{recordType === "Lab Result" ? "Additional Lab Instructions" : "Clinical Details"}</Label>
            <Textarea 
              id="details" 
              placeholder={recordType === "Lab Result" ? "Specify parameters or fasting requirements..." : "Enter symptoms, observations, and assessment..."} 
              className="min-h-[100px] rounded-xl"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Service Date</Label>
            <Input 
              id="date" 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl bg-primary text-white">
              {loading ? "Processing..." : (recordType === "Lab Result" ? "Initialize Order" : "Commit Record")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
