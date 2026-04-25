"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"
import React from "react"
import { getServiceContainer } from "@/lib/services/service-container"

export function NewMessageDialog() {
  const { toast } = useToast()
  const { getToken } = useAuth()
  const { booking } = useHospital()
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [doctors, setDoctors] = useState<any[]>([])

  React.useEffect(() => {
    if (open) {
      const fetchDoctors = async () => {
        try {
          const token = await getToken()
          const docs = await booking.getAvailableDoctors(undefined, token || undefined)
          setDoctors(docs || [])
        } catch (e) {
          console.error("Failed to fetch doctors", e)
        }
      }
      fetchDoctors()
    }
  }, [open, booking, getToken])

  const handleSend = async () => {
    if (!selectedDoctorId || !subject || !content) {
      toast({
        title: "Incomplete Form",
        description: "Please select a recipient and enter a message.",
        variant: "destructive"
      })
      return
    }

    const doctor = doctors.find((d: any) => (d.id || d.user_id) === selectedDoctorId)
    if (!doctor) return

    setSending(true)

    try {
      const container = getServiceContainer()
      await container.message.sendMessage({
        receiver_id: selectedDoctorId,
        subject,
        body: content
      })

      setSending(false)
      setOpen(false)
      setSubject("")
      setContent("")
      setSelectedDoctorId("")

      toast({
        title: "Message Sent",
        description: `Your secure message has been delivered to ${doctor.name || doctor.first_name}.`,
      })
    } catch (error) {
      setSending(false)
      toast({
        title: "Delivery Failed",
        description: "Could not send message. Please check your connection.",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1 shadow-lg shadow-primary/20">
          <Plus className="h-3 w-3" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Secure Message</DialogTitle>
          <DialogDescription>
            Send an encrypted message to your healthcare provider.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">To</label>
            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
              <SelectTrigger className="bg-muted/50 border-none h-11">
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doc: any) => (
                  <SelectItem key={doc.id || doc.user_id} value={doc.id || doc.user_id}>
                    {doc.name || `${doc.first_name} ${doc.last_name}`} - {doc.specialty || 'General'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Subject</label>
            <Input 
              placeholder="Brief subject line..." 
              className="bg-muted/50 border-none h-11"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Message</label>
            <Textarea
              placeholder="Type your message here..."
              className="min-h-[120px] resize-none bg-muted/50 border-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-sidebar-border">Cancel</Button>
          <Button onClick={handleSend} disabled={sending} className="gap-2 shadow-xl shadow-primary/20">
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
