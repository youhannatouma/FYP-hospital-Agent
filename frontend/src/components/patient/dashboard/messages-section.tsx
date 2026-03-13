"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Plus, Bot, Bell, CreditCard, CalendarDays, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export interface MessagesSectionProps {
  onNewMessage?: () => void
  onAction?: (action: string, message: any) => void
}

export function MessagesSection({ onNewMessage, onAction }: MessagesSectionProps) {
  const { toast } = useToast()
  const [filter, setFilter] = useState<"unread" | "all">("unread")
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Dr. Michael Chen",
      avatar: "MC",
      avatarBg: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
      time: "2 hours ago",
      message: "Your recent lab results show elevated cholesterol. Let's discuss treatment options at your next appointment.",
      action: { label: "Reply", variant: "default" as const },
      unread: true,
    },
    {
      id: 2,
      sender: "Pharmacy - CVS",
      avatar: null,
      icon: CreditCard,
      iconBg: "bg-emerald-100 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600",
      time: "Yesterday",
      message: "Your prescription for Lisinopril is ready for pickup. Available until 9 PM today.",
      action: { label: "Mark as Read", variant: "ghost" as const },
      unread: false,
    },
    {
      id: 3,
      sender: "Appointment Reminder",
      avatar: null,
      icon: CalendarDays,
      iconBg: "bg-blue-100 dark:bg-blue-500/10",
      iconColor: "text-blue-600",
      time: "2 days ago",
      message: "Your follow-up appointment with Dr. Chen is scheduled for Jan 25 at 10:00 AM.",
      action: { label: "Confirm", variant: "default" as const },
      unread: false,
    },
    {
      id: 4,
      sender: "System Notification",
      avatar: null,
      icon: Bell,
      iconBg: "bg-violet-100 dark:bg-violet-500/10",
      iconColor: "text-violet-600",
      time: "3 days ago",
      message: "Your health insurance information has been updated successfully.",
      action: { label: "View Details", variant: "ghost" as const },
      unread: false,
    },
    {
      id: 5,
      sender: "Billing Department",
      avatar: null,
      icon: CreditCard,
      iconBg: "bg-amber-100 dark:bg-amber-500/10",
      iconColor: "text-amber-600",
      time: "1 week ago",
      message: "Your recent visit invoice is now available. Amount due: $45.00",
      action: { label: "Pay Now", variant: "default" as const },
      unread: false,
    },
  ])

  const filtered = filter === "unread" ? messages.filter((m) => m.unread) : messages
  const unreadCount = messages.filter((m) => m.unread).length

  return (
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
              else toast({ title: "New Session", description: "Opening message composition..." })
            }}
          >
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "rounded-2xl border p-5 transition-all hover:shadow-lg group/msg active:scale-98 cursor-pointer",
                msg.unread 
                  ? "border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.01]" 
                  : "border-border/50 bg-card/30"
              )}
              onClick={() => {
                if (onAction) onAction(msg.action.label, msg)
                else toast({ title: "Action Initiated", description: `${msg.action.label} for ${msg.sender}` })
              }}
            >
              <div className="flex items-start gap-4">
                {msg.avatar ? (
                  <Avatar className="h-11 w-11 shadow-sm border border-border/50">
                    <AvatarFallback className={cn("font-bold text-sm", msg.avatarBg)}>
                      {msg.avatar}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl shadow-sm border border-border/50", msg.iconBg)}>
                    {msg.icon && <msg.icon className={cn("h-5 w-5", msg.iconColor)} />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-black text-card-foreground truncate leading-tight group-hover/msg:text-primary transition-colors">
                      {msg.sender}
                    </h4>
                    <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap opacity-60">
                      {msg.time}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                    {msg.message}
                  </p>
                  <Button
                    size="sm"
                    variant={msg.action.variant}
                    className={cn(
                      "mt-4 h-8 px-4 font-black text-[9px] uppercase tracking-widest rounded-lg transition-all",
                      msg.action.variant === "default"
                        ? "bg-primary text-white hover:bg-primary/90 shadow-glow"
                        : "text-muted-foreground border-border/50 hover:bg-muted/50"
                    )}
                  >
                    {msg.action.label}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* AI Assistant Card */}
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
                  Instant Pulse 24/7
                </p>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-medium italic">
                  Have questions about diagnostic protocols, medication interactions, or triage guidelines?
                </p>
                <Button
                  size="sm"
                  className="mt-4 w-full bg-amber-500 text-white hover:bg-amber-600 font-black text-[9px] uppercase tracking-widest rounded-lg shadow-lg shadow-amber-500/10 active:scale-95 transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    toast({ title: "AI Sync", description: "Initializing AI Assistant..." })
                  }}
                >
                  <Bot className="mr-2 h-3.5 w-3.5" />
                  Initialize AI Sync
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:ai:opacity-5 transition-opacity">
              <Sparkles className="h-12 w-12 text-amber-500 rotate-12" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
