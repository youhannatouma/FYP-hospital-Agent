"use client"

import * as React from "react"
import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { useDataStore } from "@/hooks/use-data-store"
import { useUser } from "@clerk/nextjs"

export interface DoctorNewMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DoctorNewMessageDialog({ open, onOpenChange }: DoctorNewMessageDialogProps) {
  const { toast } = useToast()
  const { user } = useUser()
  const { users, addMessage } = useDataStore()
  const [sending, setSending] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")

  const patients = users.filter(u => u.role === 'Patient')

  const handleSend = () => {
    if (!selectedPatientId || !subject || !content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before sending.",
        variant: "destructive"
      })
      return
    }

    const patient = patients.find(p => p.id === selectedPatientId)
    if (!patient) return

    setSending(true)
    
    // In real app, we'd use current doctor's DB ID. For now doc-1.
    const doctorId = "doc-1"
    const doctorName = "Dr. Michael Chen"

    try {
      addMessage({
        senderId: doctorId,
        senderName: doctorName,
        senderRole: 'Doctor',
        receiverId: patient.id,
        receiverName: patient.name,
        subject,
        content,
        category: 'Medical',
      })

      setSending(false)
      onOpenChange(false)
      setSubject("")
      setContent("")
      setSelectedPatientId("")
      
      toast({
        title: "Message Sent",
        description: `Your clinical note has been delivered to ${patient.name}.`,
      })
    } catch (error) {
      setSending(false)
      toast({
        title: "Error",
        description: "Failed to deliver message. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Secure Patient Message</DialogTitle>
          <DialogDescription>
            Send an encrypted message to one of your patients.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">To (Patient)</label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="bg-muted/50 border-none h-11">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.customId ? `(${p.customId})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Subject</label>
            <Input 
              placeholder="e.g. Lab Results Follow-up..." 
              className="bg-muted/50 border-none h-11"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Message</label>
            <Textarea
              placeholder="Type your clinical message here..."
              className="min-h-[120px] resize-none bg-muted/50 border-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-sidebar-border">Cancel</Button>
          <Button onClick={handleSend} disabled={sending} className="gap-2 shadow-lg shadow-primary/20">
            {sending ? (
              <>
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
