"use client"

import { useState } from "react"
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

interface ComposeMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultRecipient?: string
}

export function ComposeMessageDialog({ 
  open, 
  onOpenChange, 
  defaultRecipient = "" 
}: ComposeMessageDialogProps) {
  const { toast } = useToast()
  const [recipient, setRecipient] = useState(defaultRecipient)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSend = () => {
    if (!recipient || !subject.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before sending.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    // Mock API
    setTimeout(() => {
      setIsSending(false)
      onOpenChange(false)
      toast({
        title: "Message Sent",
        description: `Your message to ${recipient} has been sent successfully.`,
      })
      setRecipient("")
      setSubject("")
      setMessage("")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Send a secure message to your care team or the billing department.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">To</label>
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Select a recipient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dr. Michael Chen">Dr. Michael Chen (Cardiology)</SelectItem>
                <SelectItem value="Dr. Emily Watson">Dr. Emily Watson (Primary Care)</SelectItem>
                <SelectItem value="Billing Department">Billing Department</SelectItem>
                <SelectItem value="Pharmacy Support">Pharmacy Support</SelectItem>
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
