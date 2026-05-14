"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bot, Mail, Plus, Sparkles } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { m, AnimatePresence } from "framer-motion"
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
              New Session
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {isLoading ? (
                [1, 2].map((row) => (
                  <div
                    key={row}
                    className="rounded-2xl border border-border/50 p-5 animate-pulse bg-card/30"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-11 w-11 rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-28 rounded bg-muted" />
                        <div className="h-2 w-full rounded bg-muted" />
                      </div>
                    </div>
                  </div>
                ))
              ) : previewMessages.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-border/50 bg-muted/20 p-12 text-center">
                  <Mail className="h-8 w-8 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-medium">Your inbox is clear right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {previewMessages.map((message) => {
                    const senderName = message.sender_name || "Care team"
                    return (
                      <m.button
                        key={message.message_id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        className={cn(
                          "rounded-2xl border p-5 text-left transition-all hover:shadow-xl group relative overflow-hidden",
                          !message.is_read
                            ? "border-primary/20 bg-primary/[0.02] shadow-sm"
                            : "border-border/30 bg-card hover:bg-muted/5"
                        )}
                        onClick={() => router.push("/patient/messages")}
                      >
                        {!message.is_read && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        )}
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 shadow-inner-glow border border-border/50">
                            <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 font-black text-xs text-slate-600">
                              {getInitials(senderName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-black text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                                {senderName}
                              </h4>
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                {formatMessageTime(message.created_at)}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-foreground mb-1 line-clamp-1">
                              {message.subject || "Secure communication"}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                              {message.body}
                            </p>
                          </div>
                        </div>
                      </m.button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="h-full rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.05] to-transparent p-6 relative overflow-hidden group/ai shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/ai:scale-110 transition-transform duration-700">
                   <Bot className="w-24 h-24 rotate-12 text-amber-500" />
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/20 shadow-lg mb-6">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-base font-black text-foreground leading-tight">
                      Intelligent Care Assistant
                    </h4>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest opacity-80">
                      Synchronized Analysis
                    </p>
                  </div>
                  
                  <p className="mt-4 text-xs text-muted-foreground leading-relaxed font-medium">
                    Ask questions about care guidance, appointment prep, or review your latest health telemetry insights.
                  </p>
                  
                  <div className="mt-auto pt-8">
                    <Button
                      className="w-full bg-slate-900 text-white hover:bg-slate-800 font-black text-[10px] uppercase tracking-[0.15em] rounded-xl h-11 shadow-lg active:scale-95 transition-all gap-2"
                      onClick={() => router.push(aiAssistantPath)}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      Initialize Session
                    </Button>
                  </div>
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
