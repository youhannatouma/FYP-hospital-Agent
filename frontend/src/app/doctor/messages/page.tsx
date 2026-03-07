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
import { Search, Send, Plus, Reply, Paperclip, Star } from "lucide-react"
import { m } from "framer-motion"
import { toast } from "@/hooks/use-toast"

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
  category: "patient" | "admin" | "system"
}

const messages: Message[] = [
  {
    id: 1,
    sender: "Sarah Johnson (Patient)",
    senderAvatar: "SJ",
    senderColor: "bg-blue-500/10 text-blue-600",
    subject: "Question about my lab results",
    preview: "Dr. Smith, I received my lab results and I'm concerned about my cholesterol levels...",
    fullMessage: "Dr. Smith,\n\nI received my lab results from last week and noticed my cholesterol is elevated at 245 mg/dL. I'm a bit concerned — should I adjust my diet immediately or wait until our next appointment on January 25th?\n\nThank you,\nSarah Johnson",
    timestamp: "1 hour ago",
    isRead: false,
    isStarred: false,
    category: "patient",
  },
  {
    id: 2,
    sender: "Admin — Hospital",
    senderAvatar: "AD",
    senderColor: "bg-purple-500/10 text-purple-600",
    subject: "Schedule Update — Holiday Hours",
    preview: "Please note that clinic hours will be adjusted during the upcoming holiday period...",
    fullMessage: "Dear Dr. Smith,\n\nThis is a reminder that clinic hours will be adjusted during the upcoming holiday period (Feb 17–21). Please update your availability accordingly in the scheduling system.\n\nBest regards,\nHospital Administration",
    timestamp: "Yesterday",
    isRead: true,
    isStarred: false,
    category: "admin",
  },
  {
    id: 3,
    sender: "Michael Chen (Patient)",
    senderAvatar: "MC",
    senderColor: "bg-emerald-500/10 text-emerald-600",
    subject: "Appointment reschedule request",
    preview: "I need to reschedule my appointment scheduled for Feb 15th...",
    fullMessage: "Hello Dr. Smith,\n\nI need to reschedule my appointment from February 15th at 2:00 PM due to a work conflict. Would it be possible to move it to February 17th or 18th?\n\nThank you,\nMichael Chen",
    timestamp: "2 days ago",
    isRead: false,
    isStarred: true,
    category: "patient",
  },
]

function MessageDetail({ message }: { message: Message }) {
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
            onClick={() => toast({ title: "Reply sent", description: "Your reply has been sent." })}
          >
            <Reply className="h-4 w-4" />
            Reply
          </Button>
          <Button
            variant="outline"
            className="border-border text-foreground gap-1.5"
            onClick={() => toast({ title: "Attach file", description: "File attachment coming soon." })}
          >
            <Paperclip className="h-4 w-4" />
            Attach
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function DoctorMessagesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const unreadCount = messages.filter((m) => !m.isRead).length

  const filteredMessages = messages.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <m.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          onClick={() => toast({ title: "New Message", description: "Compose feature coming soon." })}
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

        {(["all", "unread", "starred"] as const).map((tab) => (
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
                          <AvatarFallback className={`${message.senderColor} text-xs font-semibold`}>
                            {message.senderAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className={`text-sm ${!message.isRead ? "font-bold text-card-foreground" : "font-medium text-card-foreground"}`}>
                                {message.sender}
                              </h3>
                              {!message.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                            </div>
                            <div className="flex items-center gap-2">
                              {message.isStarred && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{message.timestamp}</span>
                            </div>
                          </div>
                          <p className={`text-sm mt-0.5 ${!message.isRead ? "font-semibold text-card-foreground" : "text-muted-foreground"}`}>
                            {message.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{message.preview}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <MessageDetail message={message} />
                </Dialog>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </m.div>
  )
}