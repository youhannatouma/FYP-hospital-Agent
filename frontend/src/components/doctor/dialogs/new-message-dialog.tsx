"use client"

/**
 * DoctorNewMessageDialog
 * Follows: Single Responsibility Principle (SRP) — UI only, delegates API to repositories
 * Follows: Dependency Inversion Principle (DIP) — uses IMessageRepository, IUserRepository via container
 */

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
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
import { Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getServiceContainer } from "@/lib/services/service-container"
import { UserProfile } from "@/lib/services/repositories/user-repository"

export interface DoctorNewMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DoctorNewMessageDialog({ open, onOpenChange }: DoctorNewMessageDialogProps) {
  const { toast } = useToast()
  const [sending, setSending] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [patients, setPatients] = useState<UserProfile[]>([])

  // Load patients once when dialog opens — via UserRepository (DIP)
  const loadPatients = useCallback(async () => {
    try {
      const container = getServiceContainer()
      const allUsers = await container.user.getAllUsers()
      setPatients(allUsers.filter((u) => u.role === "patient"))
    } catch (err) {
      console.error("[DoctorNewMessageDialog] Failed to fetch patients:", err)
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadPatients()
    }
  }, [open, loadPatients])

  const resetForm = () => {
    setSubject("")
    setContent("")
    setSelectedPatientId("")
  }

  const handleSend = async () => {
    if (!selectedPatientId || !subject.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before sending.",
        variant: "destructive",
      })
      return
    }

    setSending(true)
    const patient = patients.find((p) => p.user_id === selectedPatientId)

    try {
      const container = getServiceContainer()
      await container.message.sendMessage({
        receiver_id: selectedPatientId,
        subject,
        body: content,
      })

      onOpenChange(false)
      resetForm()

      toast({
        title: "Message Sent",
        description: `Your clinical note has been delivered to ${patient?.first_name || "the patient"} ${patient?.last_name || ""}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deliver message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
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
                {patients.map((p) => (
                  <SelectItem key={p.user_id} value={p.user_id}>
                    {p.first_name} {p.last_name}
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-sidebar-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending}
            className="gap-2 shadow-lg shadow-primary/20"
          >
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
