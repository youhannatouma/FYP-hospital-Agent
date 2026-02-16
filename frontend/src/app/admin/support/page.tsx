"use client"

import * as React from "react"
import { 
  MessageSquare, 
  Send, 
  Users, 
  Mail, 
  Ticket, 
  Search, 
  Filter,
  MoreVertical,
  Clock,
  ArrowUpRight,
  BellRing,
  Tag
} from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"

const MOCK_TICKETS = [
  { id: "TIC-402", subject: "Prescription Upload Error", user: "Michael Chen", priority: "High", status: "Open", assignedTo: "Admin Sarah", created: "2h ago" },
  { id: "TIC-405", subject: "Refund Request #8821", user: "Elena Gilbert", priority: "Medium", status: "In Progress", assignedTo: "Admin Dave", created: "5h ago" },
  { id: "TIC-410", subject: "Provider License Error", user: "Dr. Ben Alaba", priority: "Critical", status: "Open", assignedTo: "Unassigned", created: "12m ago" },
]

export default function CommunicationSupportPage() {
  const { toast } = useToast()

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
             Operations & Support
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
             Manage global broadcasts, resolve technical inquiries, and monitor engagement.
          </p>
        </div>
        <Button className="gap-2" onClick={() => {
          toast({ title: "Portal Alert", description: "Opening incident reporting interface..." })
        }}>
          <Ticket className="h-4 w-4" /> Raise Incident
        </Button>
      </div>

      <Tabs defaultValue="messaging" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full max-w-md justify-start gap-1">
          <TabsTrigger value="messaging" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Broadcast</TabsTrigger>
          <TabsTrigger value="tickets" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Service Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="messaging" className="space-y-6 animate-in slide-in-from-left-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-sidebar-border bg-card/50">
              <CardHeader>
                <CardTitle>Global Broadcast</CardTitle>
                <CardDescription>Deliver announcements to role-specific system clusters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="h-10 px-4"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Verified Userbase (All)</SelectItem>
                        <SelectItem value="patients">Patients Only</SelectItem>
                        <SelectItem value="doctors">Clinical Staff Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Channel</Label>
                    <div className="flex gap-2">
                      <Button variant="secondary" className="flex-1 text-xs">In-App</Button>
                      <Button variant="outline" className="flex-1 text-xs">Email</Button>
                      <Button variant="outline" className="flex-1 text-xs">SMS</Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Message Title</Label>
                  <Input placeholder="E.g. Scheduled Infrastructure Maintenance" className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label>Core Content</Label>
                  <Textarea placeholder="Type your broadcast message here..." className="min-h-[120px] bg-muted/20" />
                </div>
                <Button className="w-full h-11 gap-2" onClick={() => {
                  toast({ title: "Broadcast Sent", description: "Message propagated to the selected audience." })
                }}>
                  <Send className="h-4 w-4" /> Dispatch Broadcast
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="border-none bg-gradient-to-br from-primary to-indigo-600 text-white p-6 shadow-xl relative overflow-hidden group">
                   <BellRing className="absolute bottom-0 right-0 h-24 w-24 opacity-10 -mr-4 -mb-4 transition-transform group-hover:scale-110" />
                   <div className="relative z-10 space-y-4">
                      <Badge className="bg-white/20 text-white border-none font-bold">ENGAGEMENT</Badge>
                      <h3 className="text-2xl font-bold leading-tight">System Pulse</h3>
                      <div className="space-y-2 pt-2">
                           <div className="flex justify-between text-[10px] font-bold uppercase opacity-60">Interaction Density</div>
                           <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white rounded-full w-[85%]" />
                           </div>
                           <p className="text-[10px] text-white/60">Engagement is up 14% this month.</p>
                      </div>
                   </div>
                </Card>

                <Card className="border-sidebar-border bg-card/50 p-6 space-y-4">
                     <h4 className="text-xs font-bold uppercase text-muted-foreground">Scheduled Alerts</h4>
                     <div className="space-y-3">
                       {[
                         { title: "Node Optimization", time: "Tonight 02:00" },
                         { title: "V5.0 Rollout", time: "Friday 21:00" },
                       ].map((alert, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-sidebar-border group hover:bg-primary/5 cursor-pointer">
                              <div>
                                  <p className="text-sm font-semibold">{alert.title}</p>
                                  <p className="text-[10px] text-muted-foreground">{alert.time}</p>
                              </div>
                              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                          </div>
                       ))}
                     </div>
                </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <Card className="border-sidebar-border bg-card/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Service Queue</CardTitle>
                    <CardDescription>Manage active technical and provider support incidents.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Filter tickets..." className="pl-9 h-9" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-sidebar-border">
                  {MOCK_TICKETS.map((ticket) => (
                    <div key={ticket.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-all group cursor-pointer" onClick={() => toast({ title: "Incident Loaded", description: `Opening case ${ticket.id} for resolution.` })}>
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold ${
                          ticket.priority === "Critical" ? "bg-rose-500 text-white" :
                          ticket.priority === "High" ? "bg-rose-500/10 text-rose-600" : 
                          "bg-blue-500/10 text-blue-600"
                        }`}>
                          {ticket.priority[0]}
                        </div>
                        <div>
                          <h4 className="font-semibold text-base group-hover:text-primary transition-colors">{ticket.subject}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                               <Badge variant="outline" className="text-[10px] h-4 py-0 font-mono">{ticket.id}</Badge>
                               <span className="text-[10px] text-muted-foreground font-medium">
                                 {ticket.user} • {ticket.created}
                               </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-40">Assignee</p>
                          <p className="text-xs font-medium">{ticket.assignedTo}</p>
                        </div>
                        <Badge variant="outline" className={
                          ticket.status === "Open" ? "border-rose-200 text-rose-600 bg-rose-50/50" : 
                          ticket.status === "In Progress" ? "border-amber-200 text-amber-600 bg-amber-50/50" : 
                          "border-emerald-200 text-emerald-600 bg-emerald-50/50"
                        }>
                          {ticket.status}
                        </Badge>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={`text-xs font-bold uppercase tracking-wider text-muted-foreground ${className}`}>{children}</label>
}
