"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bot, Mail, Plus, Sparkles } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getServiceContainer } from "@/lib/services/service-container"
import type { Message } from "@/lib/services/repositories/message-repository"
import { ComposeMessageDialog } from "@/components/patient/dialogs/compose-message-dialog"

export interface MessagesSectionProps {
  onNewMessage?: () => void
  aiAssistantPath?: string
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

export function MessagesSection({
  onNewMessage,
  aiAssistantPath = "/patient/ai-assistant",
}: MessagesSectionProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<"unread" | "all">("unread")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const container = getServiceContainer()
        const data = await container.message.getMessages()
        setMessages(data)
      } catch (error) {
        console.error("[PatientDashboardMessages] Failed to load messages:", error)
        setMessages([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [])

  const filtered = filter === "unread" ? messages.filter((message) => !message.is_read) : messages
  const previewMessages = filtered.slice(0, 5)
  const unreadCount = messages.filter((message) => !message.is_read).length

  return (
    <>
      <Card className="premium-card rounded-[2.5rem] border-none shadow-premium overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
          <CardTitle className="flex items-center gap-2 text-xl font-black text-card-foreground">
            <Mail className="h-6 w-6 text-blue-500" />
            Messages & Communication
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/50">
              <Button
                variant={filter === "unread" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("unread")}
                className={cn(
                  "rounded-lg px-4 font-bold text-[10px] uppercase tracking-widest",
                  filter === "unread"
                    ? "bg-primary text-white shadow-lg"
                    : "text-muted-foreground hover:bg-transparent"
                )}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
                className={cn(
                  "rounded-lg px-4 font-bold text-[10px] uppercase tracking-widest",
                  filter === "all"
                    ? "bg-primary text-white shadow-lg"
                    : "text-muted-foreground hover:bg-transparent"
                )}
              >
                All
              </Button>
            </div>
            <Button
              size="sm"
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-4 font-black text-[10px] uppercase tracking-widest shadow-glow gap-2 h-9"
              onClick={() => {
                if (onNewMessage) onNewMessage()
                else setShowCompose(true)
              }}
            >
              <Plus className="h-4 w-4" />
              New Message
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              [1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="rounded-2xl border border-border/50 p-5 animate-pulse bg-card/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-28 rounded bg-muted" />
                      <div className="h-2 w-full rounded bg-muted" />
                      <div className="h-2 w-3/4 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))
            ) : previewMessages.length === 0 ? (
              <div className="rounded-2xl border border-border/50 bg-card/30 p-6 text-sm text-muted-foreground">
                Your inbox is clear right now.
              </div>
            ) : (
              previewMessages.map((message) => {
                const senderName = message.sender_name || "Care team"
                return (
                  <button
                    key={message.message_id}
                    type="button"
                    className={cn(
                      "rounded-2xl border p-5 text-left transition-all hover:shadow-lg active:scale-98",
                      !message.is_read
                        ? "border-primary/20 bg-primary/[0.02]"
                        : "border-border/50 bg-card/30"
                    )}
                    onClick={() => router.push("/patient/messages")}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-11 w-11 shadow-sm border border-border/50">
                        <AvatarFallback className="bg-muted font-bold text-sm">
                          {getInitials(senderName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-black text-card-foreground truncate leading-tight">
                            {senderName}
                          </h4>
                          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap opacity-60">
                            {formatMessageTime(message.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-card-foreground line-clamp-1">
                          {message.subject || "Secure message"}
                        </p>
                        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                          {message.body}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })
            )}

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-5 relative overflow-hidden group/ai active:scale-98 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-500">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/20 shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-card-foreground leading-tight group-hover/ai:text-amber-500 transition-colors">
                    AI Assistant Available
                  </h4>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest opacity-70">
                    On-demand support
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-medium">
                    Ask questions about care guidance, appointment prep, or what to discuss with your doctor.
                  </p>
                  <Button
                    size="sm"
                    className="mt-4 w-full bg-amber-500 text-white hover:bg-amber-600 font-black text-[9px] uppercase tracking-widest rounded-lg shadow-lg shadow-amber-500/10 active:scale-95 transition-all"
                    onClick={(event) => {
                      event.stopPropagation()
                      router.push(aiAssistantPath)
                    }}
                  >
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    Open Assistant
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ComposeMessageDialog open={showCompose} onOpenChange={setShowCompose} />
    </>
  )
}
