"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Send,
  Plus,
  Reply,
  Star,
  Paperclip,
  Mail,
  MailOpen,
  Clock,
} from "lucide-react"

import { useToast } from "@/components/ui/use-toast"
import { ComposeMessageDialog } from "@/components/patient/dialogs/compose-message-dialog"

interface Message {
  id: number
  sender: string
  senderAvatar: string
  senderColor: string
  subject: string
  preview: string
  fullMessage: string
  timestamp: string
  isRead: boolean
  isStarred: boolean
  category: "doctor" | "pharmacy" | "system" | "billing"
}

const messages: Message[] = [
  {
    id: 1,
    sender: "Dr. Michael Chen",
    senderAvatar: "MC",
    senderColor: "bg-blue-500/10 text-blue-600",
    subject: "Lab Results Discussion",
    preview: "Your recent lab results show elevated cholesterol. Let's discuss treatment options at your next appointment.",
    fullMessage: "Dear Sarah,\n\nI've reviewed your recent lipid panel results from January 8th. Your total cholesterol is at 245 mg/dL and LDL at 165 mg/dL, both of which are above the recommended levels.\n\nI'd like to discuss adjusting your medication and reviewing dietary changes at your upcoming appointment on January 25th.\n\nIn the meantime, please continue taking your Atorvastatin as prescribed and try to reduce saturated fat intake.\n\nBest regards,\nDr. Michael Chen",
    timestamp: "2 hours ago",
    isRead: false,
    isStarred: false,
    category: "doctor",
  },
  {
    id: 2,
    sender: "Pharmacy - CVS",
    senderAvatar: "RX",
    senderColor: "bg-emerald-500/10 text-emerald-600",
    subject: "Prescription Ready",
    preview: "Your prescription for Lisinopril is ready for pickup. Available until 9 PM today.",
    fullMessage: "Hello Sarah,\n\nYour prescription for Lisinopril 10mg is ready for pickup at CVS Pharmacy, 123 Main St.\n\nPickup hours: 8 AM - 9 PM\nPrescription #: RX-4521887\nCopay: $12.99\n\nPlease bring a valid photo ID for pickup.\n\nThank you,\nCVS Pharmacy",
    timestamp: "Yesterday",
    isRead: false,
    isStarred: false,
    category: "pharmacy",
  },
  {
    id: 3,
    sender: "System Notification",
    senderAvatar: "SN",
    senderColor: "bg-purple-500/10 text-purple-600",
    subject: "Insurance Updated",
    preview: "Your health insurance information has been updated successfully.",
    fullMessage: "Your health insurance information has been updated successfully in our system.\n\nNew Details:\nProvider: BlueCross BlueShield\nPlan: Premium Health Plus\nEffective: January 1, 2024\n\nIf you did not make this change, please contact our support team immediately.",
    timestamp: "3 days ago",
    isRead: true,
    isStarred: false,
    category: "system",
  },
  {
    id: 4,
    sender: "Billing Department",
    senderAvatar: "BD",
    senderColor: "bg-orange-500/10 text-orange-600",
    subject: "Invoice Available",
    preview: "Your recent visit invoice is now available. Amount due: $45.00",
    fullMessage: "Dear Sarah,\n\nYour invoice for the visit on January 10, 2024 is now available.\n\nVisit Type: Follow-up Cardiology\nProvider: Dr. Michael Chen\nAmount Billed: $250.00\nInsurance Covered: $205.00\nAmount Due: $45.00\nDue Date: February 10, 2024\n\nYou can pay online through your patient portal or by calling our billing department.\n\nThank you,\nBilling Department",
    timestamp: "1 week ago",
    isRead: true,
    isStarred: true,
    category: "billing",
  },
  {
    id: 5,
    sender: "Appointment Reminder",
    senderAvatar: "AR",
    senderColor: "bg-amber-500/10 text-amber-600",
    subject: "Upcoming Appointment",
    preview: "Your follow-up appointment with Dr. Chen is scheduled for Jan 25 at 10:00 AM.",
    fullMessage: "Hello Sarah,\n\nThis is a reminder that you have an upcoming appointment:\n\nDoctor: Dr. Michael Chen\nSpecialty: Cardiology\nDate: January 25, 2024\nTime: 10:00 AM\nType: Video Consultation\n\nPlease ensure you have a stable internet connection for the video call. A link will be sent 15 minutes before the appointment.\n\nTo reschedule or cancel, please do so at least 24 hours in advance.",
    timestamp: "2 days ago",
    isRead: true,
    isStarred: false,
    category: "system",
  },
]

function MessageDetail({ 
  message,
  onReply,
  onAttach
}: { 
  message: Message,
  onReply: (sender: string) => void,
  onAttach: () => void
}) {
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-foreground">{message.subject}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={`${message.senderColor} text-xs font-semibold`}>
              {message.senderAvatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{message.sender}</p>
            <p className="text-xs text-muted-foreground">{message.timestamp}</p>
          </div>
        </div>

        <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed rounded-lg bg-muted/50 p-4">
          {message.fullMessage}
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            onClick={() => onReply(message.sender)}
          >
            <Reply className="h-4 w-4" />
            Reply
          </Button>
          <Button 
            variant="outline" 
            className="border-border text-foreground gap-1.5"
            onClick={onAttach}
          >
            <Paperclip className="h-4 w-4" />
            Attach
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function MessagesPage() {
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [showCompose, setShowCompose] = useState(false)
  const [replyTo, setReplyTo] = useState("")
  
  const unreadCount = messages.filter((m) => !m.isRead).length

  const filteredMessages = messages.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleReply = (sender: string) => {
    setReplyTo(sender)
    setShowCompose(true)
  }

  const handleAttach = () => {
    toast({
      title: "File Explorer Opened",
      description: "Select a file to attach to this conversation."
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button 
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          onClick={() => {
            setReplyTo("")
            setShowCompose(true)
          }}
        >
          <Plus className="h-4 w-4" />
          New Message
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
        </TabsList>

        {["all", "unread", "starred"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4 flex flex-col gap-2">
            {filteredMessages
              .filter((m) => {
                if (tab === "unread") return !m.isRead
                if (tab === "starred") return m.isStarred
                return true
              })
              .map((message) => (
                <Dialog key={message.id}>
                  <DialogTrigger asChild>
                    <Card
                      className={`cursor-pointer border border-border bg-card shadow-sm hover:shadow-md transition-shadow ${
                        !message.isRead ? "border-l-4 border-l-primary" : ""
                      }`}
                    >
                      <CardContent className="flex items-start gap-4 p-4">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback
                            className={`${message.senderColor} text-xs font-semibold`}
                          >
                            {message.senderAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`text-sm ${
                                  !message.isRead
                                    ? "font-bold text-card-foreground"
                                    : "font-medium text-card-foreground"
                                }`}
                              >
                                {message.sender}
                              </h3>
                              {!message.isRead && (
                                <span className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {message.isStarred && (
                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                              )}
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {message.timestamp}
                              </span>
                            </div>
                          </div>
                          <p
                            className={`text-sm mt-0.5 ${
                              !message.isRead
                                ? "font-semibold text-card-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {message.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {message.preview}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <MessageDetail 
                    message={message} 
                    onReply={handleReply}
                    onAttach={handleAttach}
                  />
                </Dialog>
              ))}
          </TabsContent>
        ))}
      </Tabs>
      
      <ComposeMessageDialog 
        open={showCompose}
        onOpenChange={setShowCompose}
        defaultRecipient={replyTo}
      />
    </div>
  )
}
