"use client"

import * as React from "react"
import { 
  ShieldAlert, 
  Lock, 
  Eye, 
  History, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  AlertTriangle,
  FileShield,
  UserCheck,
  UserX,
  Database,
  Terminal,
  Server
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

const MOCK_AUDIT_LOGS = [
  { id: "L-902", action: "Password Reset", actor: "Admin Sarah", entity: "Patient (Sarah J.)", timestamp: "5 mins ago", ip: "192.168.1.45" },
  { id: "L-901", action: "Prescription Access", actor: "Dr. Michael Smith", entity: "Record (Patient-104)", timestamp: "12 mins ago", ip: "192.168.1.12" },
  { id: "L-900", action: "Data Export", actor: "Admin Dave", entity: "Financial Logs (Jan 24)", timestamp: "1 hour ago", ip: "10.0.0.5" },
  { id: "L-899", action: "Suspension", actor: "System (Auto)", entity: "User (Robert W.)", timestamp: "3 hours ago", ip: "System" },
]

const MOCK_SECURITY_EVENTS = [
  { id: "EV-102", type: "Brute Force Attempt", severity: "High", status: "Blocked", detail: "15 failed logins for admin_sarah in 1 minute.", timestamp: "20 mins ago" },
  { id: "EV-101", type: "Unusual Data Access", severity: "Medium", status: "Under Review", detail: "Dr. Elena accessed 50 records in 5 minutes.", timestamp: "2 hours ago" },
]

export default function ComplianceSecurityPage() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto min-h-screen bg-background text-foreground">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Trust & Security</h1>
          <p className="text-muted-foreground mt-1">
            Monitor data privacy, audit all system actions, and detect security threats.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Audit Logs
          </Button>
          <Button className="bg-primary text-primary-foreground">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Compliance Check
          </Button>
        </div>
      </div>

      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border/50">
          <TabsTrigger value="audit" className="gap-2"><History className="h-4 w-4" />Audit Logs</TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2"><FileShield className="h-4 w-4" />Data Privacy</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><ShieldAlert className="h-4 w-4" />Security Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  System Audit Trail
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Input placeholder="Search logs..." className="h-9 w-64 bg-muted/30" />
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    Action Type
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y divide-border/50">
                  {MOCK_AUDIT_LOGS.map((log) => (
                    <div key={log.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded bg-muted/50 flex items-center justify-center">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm">{log.action}</h4>
                            <p className="text-[10px] text-muted-foreground">#{log.id}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-bold text-foreground">{log.actor}</span> acted on {log.entity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold">{log.timestamp}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{log.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Real-time tracking of regulatory requirements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "GDPR Compliance", status: "Compliant", score: "100%" },
                  { name: "HIPAA (Medical Data)", status: "Compliant", score: "100%" },
                  { name: "Data Retention Policy", status: "Review Required", score: "85%", warning: true },
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{stat.name}</span>
                      <Badge className={stat.warning ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}>
                        {stat.status}
                      </Badge>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div className={`h-full rounded-full ${stat.warning ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: stat.score }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 overflow-hidden">
              <div className="bg-primary/10 p-6 flex items-start gap-4">
                <Lock className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Data Access Control</h3>
                  <p className="text-xs text-muted-foreground">Manage who can view sensitive patient identifiers.</p>
                  <Button size="sm" className="mt-4">Update Access Logs</Button>
                </div>
              </div>
            </CardContent>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {MOCK_SECURITY_EVENTS.map((event) => (
            <Card key={event.id} className="border-border/50 bg-card/50 overflow-hidden">
              <div className={`h-1 w-full ${event.severity === "High" ? "bg-rose-500" : "bg-amber-500"}`} />
              <CardContent className="p-4 flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={`p-2 rounded-lg ${event.severity === "High" ? "bg-rose-500/10" : "bg-amber-500/10"}`}>
                    <AlertTriangle className={`h-5 w-5 ${event.severity === "High" ? "text-rose-500" : "text-amber-500"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{event.type}</h4>
                      <Badge variant="outline" className="text-[10px] uppercase">{event.severity} Severity</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{event.detail}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold">{event.timestamp} • Status: {event.status}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Investigate</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
