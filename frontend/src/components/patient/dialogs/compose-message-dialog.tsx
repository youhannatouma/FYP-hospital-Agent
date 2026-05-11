// @ts-nocheck
"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from "react"
import { Send, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getServiceContainer } from "@/lib/services/service-container"

interface ComposeMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultRecipientId?: string
}

export function ComposeMessageDialog({ 
  open, 
  onOpenChange, 
  defaultRecipientId = "" 
}: ComposeMessageDialogProps) {
  const { toast } = useToast()
  const [recipient, setRecipient] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [doctorsList, setDoctorsList] = useState<unknown[]>([])

  useEffect(() => {
    if (open) {
      const fetchDoctors = async () => {
        try {
          const container = getServiceContainer()
          const data = await container.doctor.getAvailableDoctors()
          setDoctorsList(data)
        } catch (err) {
          console.error("[ComposeMessageDialog] Failed to fetch doctors:", err)
        }
      }
      fetchDoctors()
    }
  }, [open])

  const selectedRecipient = recipient || defaultRecipientId

  const handleSend = async () => {
    if (!selectedRecipient || !subject.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before sending.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const container = getServiceContainer()
      await container.message.sendMessage({
        receiver_id: selectedRecipient,
        subject: subject,
        body: message
      })
      
      setIsSending(false)
      onOpenChange(false)
      const selectedDoc = doctorsList.find(d => d.id === selectedRecipient || d.user_id === selectedRecipient)
      const docName = selectedDoc ? `Dr. ${(selectedDoc as unknown).last_name || (selectedDoc as unknown).first_name || 'Provider'}` : 'the provider'
      toast({
        title: "Message Sent",
        description: `Your message to ${docName} has been sent successfully.`,
      })
      setRecipient("")
      setSubject("")
      setMessage("")
    } catch (error) {
      setIsSending(false)
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Send a secure message to your doctor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">To</label>
            <Select value={selectedRecipient} onValueChange={setRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Select a recipient" />
              </SelectTrigger>
              <SelectContent>
                {doctorsList.map(doc => (
                  <SelectItem key={doc.id || doc.user_id} value={doc.id || doc.user_id}>
                    Dr. {(doc as unknown).first_name} {(doc as unknown).last_name} ({doc.specialty || "Specialist"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Subject</label>
            <Input 
              placeholder="Message subject" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea 
              className="min-h-[150px] resize-none" 
              placeholder="Type your secure message here..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 border-t pt-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Paperclip className="h-4 w-4 mr-2" />
            Attach File
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending} className="bg-primary text-primary-foreground gap-2">
              <Send className="h-4 w-4" />
              {isSending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
