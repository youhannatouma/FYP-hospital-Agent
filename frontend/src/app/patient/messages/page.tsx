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
import { useToast } from "@/hooks/use-toast"
import { NewMessageDialog } from "@/components/patient/dashboard/dialogs/new-message-dialog"

import { useDataStore, Message } from "@/hooks/use-data-store"
import { formatDistanceToNow } from "date-fns"

function MessageDetail({ message }: { message: Message }) {
  const { toast } = useToast()
  const { toggleMessageStar } = useDataStore()

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-foreground">{message.subject}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {message.senderName.split(' ').map(n=>n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{message.senderName}</p>
            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</p>
          </div>
        </div>

        <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed rounded-lg bg-muted/50 p-4">
          {message.content}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            onClick={() => {
              toast({
                title: "Reply Sent",
                description: `Your reply to ${message.senderName} has been sent.`,
              })
            }}
          >
            <Reply className="h-4 w-4" />
            Reply
          </Button>
          <Button
            variant="outline"
            className="border-border text-foreground gap-1.5"
            onClick={() => {
              toggleMessageStar(message.id)
            }}
          >
            <Star className={`h-4 w-4 ${message.starred ? "fill-amber-500 text-amber-500" : ""}`} />
            {message.starred ? "Starred" : "Star"}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function MessagesPage() {
  const { getInboxMessages, getUnreadCount, markMessageRead } = useDataStore()
  const [searchQuery, setSearchQuery] = useState("")

  const patientId = "pat-1"
  const inbox = getInboxMessages(patientId)
  const unreadCount = getUnreadCount(patientId)

  const filteredMessages = inbox.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <NewMessageDialog />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          className="pl-10 h-11 bg-muted/30 border-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
          <TabsTrigger value="unread" className="rounded-lg">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="starred" className="rounded-lg">Starred</TabsTrigger>
        </TabsList>

        {["all", "unread", "starred"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4 flex flex-col gap-3">
            {filteredMessages
              .filter((m) => {
                if (tab === "unread") return !m.read
                if (tab === "starred") return m.starred
                return true
              })
              .map((message) => (
                <Dialog key={message.id}>
                  <DialogTrigger asChild>
                    <Card
                      onClick={() => markMessageRead(message.id)}
                      className={`cursor-pointer border-none bg-card shadow-sm hover:shadow-md transition-all ${
                        !message.read ? "ring-1 ring-primary/20" : ""
                      }`}
                    >
                      <CardContent className="flex items-start gap-4 p-4 relative">
                        {!message.read && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />
                        )}
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback
                            className="bg-primary/5 text-primary text-xs font-semibold"
                          >
                            {message.senderName.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`text-sm ${
                                  !message.read
                                    ? "font-bold text-foreground"
                                    : "font-medium text-foreground"
                                }`}
                              >
                                {message.senderName}
                              </h3>
                              <Badge variant="outline" className="text-[10px] h-4 py-0 px-1 bg-muted/50 border-none text-muted-foreground">
                                {message.senderRole.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {message.starred && (
                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                              )}
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap uppercase font-bold">
                                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <p
                            className={`text-sm mt-0.5 ${
                              !message.read
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {message.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                            {message.content}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <MessageDetail message={message} />
                </Dialog>
              ))}
              {filteredMessages.length === 0 && (
                 <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 bg-muted/10 rounded-2xl border border-dashed border-sidebar-border">
                    <Mail className="h-10 w-10 text-muted-foreground/30" />
                    <div className="space-y-1">
                      <p className="font-bold text-foreground">No messages found</p>
                      <p className="text-xs text-muted-foreground">When you contact a provider, your secure conversations will appear here.</p>
                    </div>
                 </div>
              )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
