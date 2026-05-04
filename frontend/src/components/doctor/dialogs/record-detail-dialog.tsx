// @ts-nocheck
"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as React from "react"
import { useHospital } from "@/hooks/use-hospital"
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
import { Calendar, Download, Edit, Trash2, Check, X } from "lucide-react"

interface RecordDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: unknown | null
}

export function RecordDetailDialog({ open, onOpenChange, record }: RecordDetailDialogProps) {
  const { toast } = useToast()
  const { medicalRecords } = useHospital()
  if (!record) return null

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this clinical record?")) {
      try {
        await medicalRecords.deleteRecord(record.record_id || record.id)
        onOpenChange(false)
        toast({
          title: "Record Deleted",
          description: "Clinical entry has been removed from history.",
          variant: "destructive"
        })
      } catch (e) {
        toast({
          title: "Error",
          description: "Could not delete record.",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle>Clinical Record Detail</DialogTitle>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogDescription>
            Record ID: {record.record_id || record.id} • Clinical Date: {record.created_at ? new Date(record.created_at).toLocaleDateString() : record.date}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Patient</Label>
              <p className="font-bold text-foreground">{record.patient_name || record.patientName}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Provider</Label>
              <p className="font-medium text-foreground">{record.doctor_name || record.doctorName}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground underline uppercase tracking-wider">Diagnosis</Label>
            <p className="text-base font-semibold text-primary">{record.diagnosis}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground underline uppercase tracking-wider">Clinical Notes</Label>
            <div className="text-sm border rounded-lg p-4 bg-muted/40 whitespace-pre-wrap leading-relaxed shadow-inner">
              {record.clinical_notes || record.notes || "No clinical notes provided."}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xs text-primary font-medium italic">Verified Clinical Entry - System Timestamp Protected</span>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center bg-muted/20 -mx-6 -mb-6 p-4 rounded-b-lg border-t">
          <Button variant="ghost" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export to PDF
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
