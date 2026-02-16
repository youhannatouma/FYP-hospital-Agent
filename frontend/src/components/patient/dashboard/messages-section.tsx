"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Plus, Bot, Bell, CreditCard, CalendarDays } from "lucide-react"
import Link from "next/link"
import { NewMessageDialog } from "@/components/patient/dashboard/dialogs/new-message-dialog"
import { PayInvoiceDialog } from "@/components/patient/dashboard/dialogs/pay-invoice-dialog"
import { useToast } from "@/hooks/use-toast"

export function MessagesSection() {
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

  // API Endpoints Suggestion:
  // GET: /patient/messages -> Fetch messages for the logged-in patient
  /*
    useEffect(() => {
      const fetchMessages = async () => {
        try {
          // const response = await apiClient.get('/patient/messages');
          // setMessages(response.data);
        } catch (error) {
          console.error('Failed to fetch messages', error);
        }
      };
      fetchMessages();
    }, []);
  */

  const filtered = filter === "unread" ? messages.filter((m) => m.unread) : messages

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <Mail className="h-5 w-5 text-blue-500" />
          Messages & Communication
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant={filter === "unread" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("unread")}
              className={
                filter === "unread"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }
            >
              Unread (5)
            </Button>
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className={
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }
            >
              All
            </Button>
          </div>
          <NewMessageDialog />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg border p-4 transition-colors ${
                msg.unread ? "border-primary/30 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                {msg.avatar ? (
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className={msg.avatarBg}>
                      {msg.avatar}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${msg.iconBg}`}>
                    {msg.icon && <msg.icon className={`h-4 w-4 ${msg.iconColor}`} />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-card-foreground truncate">
                      {msg.sender}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {msg.time}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                  {msg.action.label === "Pay Now" ? (
                    <PayInvoiceDialog amount="$45.00">
                      <Button
                        size="sm"
                        variant={msg.action.variant}
                        className={`mt-2 h-7 text-xs ${
                          msg.action.variant === "default"
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "text-muted-foreground"
                        }`}
                      >
                        {msg.action.label}
                      </Button>
                    </PayInvoiceDialog>
                  ) : (
                    <Button
                      size="sm"
                      variant={msg.action.variant}
                      className={`mt-2 h-7 text-xs ${
                        msg.action.variant === "default"
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => {
                        toast({
                          title: msg.action.label === "Reply" ? "Reply Sent" :
                                 msg.action.label === "Mark as Read" ? "Marked as Read" :
                                 msg.action.label === "Confirm" ? "Appointment Confirmed" :
                                 "Details",
                          description: msg.action.label === "Reply" ? "Your reply has been sent to " + msg.sender + "." :
                                       msg.action.label === "Mark as Read" ? "Message from " + msg.sender + " marked as read." :
                                       msg.action.label === "Confirm" ? "Your appointment has been confirmed." :
                                       "Viewing details for this notification.",
                        })
                      }}
                    >
                      {msg.action.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* AI Assistant Card */}
          <div className="rounded-lg border border-amber-300/50 bg-amber-50 dark:bg-amber-500/5 dark:border-amber-500/20 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-card-foreground">
                  AI Assistant Available
                </h4>
                <p className="text-xs text-muted-foreground">
                  Get instant answers 24/7
                </p>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Have questions about your medications, symptoms, or health goals? Our AI assistant is here to help!
                </p>
                <Link href="/patient/ai-assistant">
                  <Button
                    size="sm"
                    className="mt-3 w-full bg-amber-500 text-white hover:bg-amber-600"
                  >
                    <Bot className="mr-1 h-3 w-3" />
                    Start AI Chat
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
