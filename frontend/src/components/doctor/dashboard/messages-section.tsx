"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Mail, MessageSquare } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getServiceContainer } from "@/lib/services/service-container"
import type { Message } from "@/lib/services/repositories/message-repository"

type DoctorMessagesSectionProps = {
  onNewMessage?: () => void
}

function getMessagePreview(message: Message): string {
  const body = (message.body || "").trim()
  return body.length > 120 ? `${body.slice(0, 117)}...` : body
}

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

function formatMessageTime(value: string): string {
  const timestamp = new Date(value)
  if (Number.isNaN(timestamp.getTime())) return "Recently"

  const diffMs = Date.now() - timestamp.getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return timestamp.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function DoctorMessagesSection({ onNewMessage }: DoctorMessagesSectionProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const container = getServiceContainer()
        const data = await container.message.getMessages()
        setMessages(data)
      } catch (error) {
        console.error("[DoctorMessagesSection] Failed to load messages:", error)
        setMessages([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [])

  const unreadCount = messages.filter((message) => !message.is_read).length
  const recentMessages = messages.slice(0, 3)

  return (
    <Card className="border border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-card-foreground">
          <Mail className="h-4 w-4 text-primary" />
          Clinical Communication
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="h-5 rounded-full px-2 text-[10px] bg-primary/10 text-primary border-0"
          >
            {unreadCount} unread
          </Badge>
          <Link href="/doctor/messages">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs font-bold text-primary hover:text-primary hover:bg-primary/5"
            >
              Full Inbox <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[1, 2, 3].map((row) => (
              <div key={row} className="p-4 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 rounded bg-muted" />
                    <div className="h-2 w-full rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recentMessages.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No patient messages yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentMessages.map((message) => {
              const senderName = message.sender_name || "Patient"
              return (
                <Link
                  key={message.message_id}
                  href="/doctor/messages"
                  className={`block p-4 transition-all hover:bg-muted/30 ${
                    !message.is_read ? "bg-primary/[0.02]" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border shadow-sm">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                        {getInitials(senderName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-bold truncate ${
                              !message.is_read ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {senderName}
                          </h4>
                          {!message.is_read ? (
                            <Badge
                              variant="outline"
                              className="h-4 rounded-full px-1.5 text-[8px] font-bold uppercase tracking-wider"
                            >
                              New
                            </Badge>
                          ) : null}
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-foreground/85 line-clamp-1">
                        {message.subject || "Secure message"}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed line-clamp-2 text-muted-foreground">
                        {getMessagePreview(message)}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
        <div className="p-4 bg-muted/10 border-t">
          <Button className="w-full gap-2 h-9 text-xs font-bold shadow-sm" onClick={onNewMessage}>
            <MessageSquare className="h-3.5 w-3.5" />
            Compose Patient Message
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
