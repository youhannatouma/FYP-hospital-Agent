"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, MessageSquare, Bell, ClipboardCheck, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export function DoctorMessagesSection() {
  const { toast } = useToast()
  const [messages] = useState([
    {
      id: 1,
      sender: "Michael Johnson",
      avatar: "https://i.pravatar.cc/150?u=1",
      initials: "MJ",
      time: "10m ago",
      message: "Dr. Smith, regarding my prescription adjustment, I'm feeling much better today.",
      type: "Patient",
      unread: true,
    },
    {
      id: 2,
      sender: "Lab Admin",
      avatar: null,
      icon: ClipboardCheck,
      iconBg: "bg-primary/10 text-primary",
      time: "1h ago",
      message: "The results for Emily Davis (P-1003) have been uploaded to the portal.",
      type: "Internal",
      unread: true,
    },
    {
      id: 3,
      sender: "Sarah Miller (Admin)",
      avatar: "https://i.pravatar.cc/150?u=3",
      initials: "SM",
      time: "3h ago",
      message: "Your schedule for the upcoming clinical conference has been finalized.",
      type: "Staff",
      unread: false,
    },
  ])

  return (
    <Card className="border border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-card-foreground lowercase">
          <Mail className="h-4 w-4 text-primary" />
          Clinical Communication
        </CardTitle>
        <div className="flex items-center gap-2">
           <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px] bg-primary/10 text-primary border-0">
             2 New
           </Badge>
           <Link href="/doctor/messages">
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs font-bold text-primary hover:text-primary hover:bg-primary/5">
              Full Inbox <ArrowUpRight className="h-3 w-3" />
            </Button>
           </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 transition-all hover:bg-muted/30 cursor-pointer ${
                msg.unread ? "bg-primary/[0.02]" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {msg.avatar ? (
                  <Avatar className="h-10 w-10 border shadow-sm">
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                      {msg.initials}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-sm ${msg.iconBg}`}>
                    {msg.icon && <msg.icon className={`h-5 w-5`} />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold truncate ${msg.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {msg.sender}
                      </h4>
                      <Badge variant="outline" className="h-4 rounded-full px-1.5 text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60 border-muted">
                        {msg.type}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {msg.time}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed line-clamp-2 ${msg.unread ? 'font-medium text-foreground/80' : 'text-muted-foreground'}`}>
                    {msg.message}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 px-3 text-[10px] font-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast({ title: "Quick Reply", description: `Opening reply box for ${msg.sender}...` });
                      }}
                    >
                      Quick Reply
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 px-3 text-[10px] font-bold text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast({ title: "Marked as Read", description: "The message has been acknowledged." });
                      }}
                    >
                      Acknowledge
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-muted/10 border-t">
          <Link href="/doctor/messages">
            <Button className="w-full gap-2 h-9 text-xs font-bold shadow-sm">
              <MessageSquare className="h-3.5 w-3.5" />
              Compose Internal Message
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
