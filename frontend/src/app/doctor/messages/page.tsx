"use client"

import * as React from "react"
import { Search, Plus, Reply } from "lucide-react"
import { m } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getServiceContainer } from "@/lib/services/service-container"
import type { Message } from "@/lib/services/repositories/message-repository"
import { DoctorNewMessageDialog } from "@/components/doctor/dialogs/new-message-dialog"
import { useUserProfile } from "@/hooks/use-user-profile"

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "?"
  )
}

function formatMessageTimestamp(value: string): string {
  const timestamp = new Date(value)
  if (Number.isNaN(timestamp.getTime())) return "Recently"

  return timestamp.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getCounterpartyId(message: Message, currentUserId: string | undefined): string {
  return message.sender_id === currentUserId ? message.receiver_id : message.sender_id
}

function getCounterpartyName(message: Message, currentUserId: string | undefined): string {
  return message.sender_id === currentUserId
    ? message.receiver_name || "Patient"
    : message.sender_name || "Patient"
}

type MessageDetailProps = {
  message: Message
  currentUserId?: string
  onReply: (message: Message) => void
}

function MessageDetail({ message, currentUserId, onReply }: MessageDetailProps) {
  const counterpart = getCounterpartyName(message, currentUserId)

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-foreground">{message.subject || "Secure message"}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-xs font-semibold">
              {getInitials(counterpart)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{counterpart}</p>
            <p className="text-xs text-muted-foreground">
              {formatMessageTimestamp(message.created_at)}
            </p>
          </div>
        </div>
        <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed rounded-lg bg-muted/50 p-4">
          {message.body}
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            onClick={() => onReply(message)}
          >
            <Reply className="h-4 w-4" />
            Reply
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function DoctorMessagesPage() {
  const { profile } = useUserProfile()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [composeOpen, setComposeOpen] = React.useState(false)
  const [replyRecipientId, setReplyRecipientId] = React.useState("")

  const loadMessages = React.useCallback(async (isMounted = { current: true }) => {
    try {
      setIsLoading(true)
      const container = getServiceContainer()
      const data = await container.message.getMessages()
      if (isMounted.current) setMessages(data)
    } catch (error) {
      console.error("[DoctorMessagesPage] Failed to load messages:", error)
      if (isMounted.current) setMessages([])
    } finally {
      if (isMounted.current) setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const isMounted = { current: true }
    loadMessages(isMounted)
    return () => {
      isMounted.current = false
    }
  }, [loadMessages])

  const handleOpenMessage = React.useCallback(
    async (message: Message) => {
      if (message.is_read || message.receiver_id !== profile?.user_id) return

      try {
        const container = getServiceContainer()
        await container.message.markAsRead(message.message_id)
        setMessages((current) =>
          current.map((item) =>
            item.message_id === message.message_id ? { ...item, is_read: true } : item
          )
        )
      } catch (error) {
        console.error("[DoctorMessagesPage] Failed to mark message as read:", error)
      }
    },
    [profile?.user_id]
  )

  const handleReply = React.useCallback(
    (message: Message) => {
      setReplyRecipientId(getCounterpartyId(message, profile?.user_id))
      setComposeOpen(true)
    },
    [profile?.user_id]
  )

  const unreadCount = messages.filter((message) => !message.is_read).length
  const filteredMessages = messages.filter((message) => {
    const counterpart = getCounterpartyName(message, profile?.user_id)
    const haystack = `${counterpart} ${message.subject || ""} ${message.body}`.toLowerCase()
    return haystack.includes(searchQuery.toLowerCase())
  })

  return (
    <>
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
            onClick={() => {
              setReplyRecipientId("")
              setComposeOpen(true)
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
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          </TabsList>

          {(["all", "unread"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4 flex flex-col gap-2">
              {isLoading ? (
                [1, 2, 3].map((row) => (
                  <Card key={row} className="border border-border bg-card shadow-sm animate-pulse">
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="h-10 w-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-28 rounded bg-muted" />
                        <div className="h-2 w-full rounded bg-muted" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredMessages.filter((message) => (tab === "unread" ? !message.is_read : true))
                  .length === 0 ? (
                <Card className="border border-border bg-card shadow-sm">
                  <CardContent className="p-6 text-sm text-muted-foreground text-center">
                    {tab === "unread" ? "No unread messages." : "No messages found."}
                  </CardContent>
                </Card>
              ) : (
                filteredMessages
                  .filter((message) => (tab === "unread" ? !message.is_read : true))
                  .map((message) => {
                    const counterpart = getCounterpartyName(message, profile?.user_id)
                    return (
                      <Dialog key={message.message_id}>
                        <DialogTrigger asChild>
                          <Card
                            className={`cursor-pointer border border-border bg-card shadow-sm hover:shadow-md transition-shadow ${
                              !message.is_read ? "border-l-4 border-l-primary" : ""
                            }`}
                            onClick={() => handleOpenMessage(message)}
                          >
                            <CardContent className="flex items-start gap-4 p-4">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarFallback className="text-xs font-semibold">
                                  {getInitials(counterpart)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <h3
                                      className={`text-sm ${
                                        !message.is_read
                                          ? "font-bold text-card-foreground"
                                          : "font-medium text-card-foreground"
                                      }`}
                                    >
                                      {counterpart}
                                    </h3>
                                    {!message.is_read ? (
                                      <span className="h-2 w-2 rounded-full bg-primary" />
                                    ) : null}
                                  </div>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatMessageTimestamp(message.created_at)}
                                  </span>
                                </div>
                                <p
                                  className={`text-sm mt-0.5 ${
                                    !message.is_read
                                      ? "font-semibold text-card-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {message.subject || "Secure message"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {message.body}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </DialogTrigger>
                        <MessageDetail
                          message={message}
                          currentUserId={profile?.user_id}
                          onReply={handleReply}
                        />
                      </Dialog>
                    )
                  })
              )}
            </TabsContent>
          ))}
        </Tabs>
      </m.div>

      <DoctorNewMessageDialog
        open={composeOpen}
        onOpenChange={(open) => {
          setComposeOpen(open)
          if (!open) {
            setReplyRecipientId("")
            loadMessages()
          }
        }}
        defaultRecipientId={replyRecipientId}
      />
    </>
  )
}
