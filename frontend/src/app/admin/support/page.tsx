"use client"

import * as React from "react"
import { 
  Send, 
  Clock, 
  Filter,
  Ticket,
  ChevronRight
} from "lucide-react"
import { m } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const MOCK_TICKETS = [
  { id: "TIC-402", subject: "Cannot upload prescription", user: "Michael Chen", priority: "High", status: "Open", assignedTo: "Admin Sarah", created: "2 hours ago" },
  { id: "TIC-405", subject: "Refund request for cancelled appointment", user: "Elena Gilbert", priority: "Medium", status: "In Progress", assignedTo: "Admin Dave", created: "5 hours ago" },
  { id: "TIC-398", subject: "Login issue on mobile", user: "John Doe", priority: "Low", status: "Resolved", assignedTo: "Support Team", created: "1 day ago" },
]

export default function CommunicationSupportPage() {
  const { toast } = useToast()
  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto min-h-screen bg-background text-foreground"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Comms & Support</h1>
          <p className="text-muted-foreground mt-1">
            Broadcast announcements and resolve user inquiries.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground" onClick={() => toast({ title: "New Ticket", description: "Opening ticket creation form..." })}>
          <Ticket className="mr-2 h-4 w-4" />
          New Internal Ticket
        </Button>
      </div>

      <Tabs defaultValue="messaging" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border/50">
          <TabsTrigger value="messaging" className="gap-2"><Send className="h-4 w-4" />Messaging</TabsTrigger>
          <TabsTrigger value="tickets" className="gap-2"><Ticket className="h-4 w-4" />Tickets</TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2"><Tag className="h-4 w-4" />Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="messaging" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2 border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Send Broadcast</CardTitle>
                <CardDescription>Send instant notifications to a specific group of users.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="bg-muted/30"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="patients">Patients Only</SelectItem>
                        <SelectItem value="doctors">Doctors Only</SelectItem>
                        <SelectItem value="pharmacies">Pharmacies Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Channel</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-primary/10 border-primary text-primary">In-App</Button>
                      <Button variant="outline" size="sm" className="flex-1">Email</Button>
                      <Button variant="outline" size="sm" className="flex-1">SMS</Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Message Title</Label>
                  <Input placeholder="E.g. System Maintenance Update" className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea placeholder="Type your broadcast message here..." className="min-h-[120px] bg-muted/30" />
                </div>
                <Button className="w-full" onClick={() => toast({ title: "Broadcast Sent", description: "Your message is being delivered to the target audience." })}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Broadcast Now
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">App Reach Today</p>
                  <p className="text-2xl font-bold">4,520 Users</p>
                  <div className="h-1 w-full bg-muted rounded-full">
                    <div className="h-full w-[85%] bg-primary rounded-full" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Email Open Rate</p>
                  <p className="text-2xl font-bold">32.4%</p>
                  <div className="h-1 w-full bg-muted rounded-full">
                    <div className="h-full w-[32%] bg-emerald-500 rounded-full" />
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-bold uppercase mb-3">Planned Alerts</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-xs">
                      <Clock className="h-3 w-3 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-bold">Beta Feature Launch</p>
                        <p className="text-muted-foreground">Scheduled for 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Support Queue
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Input placeholder="Search tickets..." className="h-9 w-64 bg-muted/30" />
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    Priority
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {MOCK_TICKETS.map((ticket) => (
                  <div key={ticket.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${
                        ticket.priority === "High" ? "bg-rose-500/10 text-rose-500" : 
                        ticket.priority === "Medium" ? "bg-amber-500/10 text-amber-500" : 
                        "bg-blue-500/10 text-blue-500"
                      }`}>
                        {ticket.priority[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm tracking-tight">{ticket.subject}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                          By {ticket.user} • {ticket.id} • {ticket.created}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Assigned To</p>
                        <p className="text-xs font-bold">{ticket.assignedTo}</p>
                      </div>
                      <Badge className={
                        ticket.status === "Open" ? "bg-rose-500/10 text-rose-500" : 
                        ticket.status === "In Progress" ? "bg-amber-500/10 text-amber-500" : 
                        "bg-emerald-500/10 text-emerald-500"
                      }>
                        {ticket.status}
                      </Badge>
                      <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => toast({ title: "View Ticket", description: `Opening details for ${ticket.id}...` })}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </m.div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{children}</label>
}
