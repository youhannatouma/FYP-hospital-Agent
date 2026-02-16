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
  FileText,
  UserCheck,
  UserX,
  Database,
  Terminal,
  Server,
  Activity,
  ArrowUpRight,
  ShieldQuestion,
  Info,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

const MOCK_AUDIT_LOGS = [
  { id: "L-902", action: "Password Reset", actor: "Admin Sarah", entity: "Patient (Sarah J.)", timestamp: "5 mins ago", ip: "192.168.1.45", severity: "Low" },
  { id: "L-901", action: "Prescription Access", actor: "Dr. Michael Smith", entity: "Record (Patient-104)", timestamp: "12 mins ago", ip: "192.168.1.12", severity: "Low" },
  { id: "L-900", action: "Data Export", actor: "Admin Dave", entity: "Financial Logs (Jan 24)", timestamp: "1 hour ago", ip: "10.0.0.5", severity: "Medium" },
  { id: "L-899", action: "Suspension", actor: "System (Auto)", entity: "User (Robert W.)", timestamp: "3 hours ago", ip: "System", severity: "Medium" },
  { id: "L-898", action: "API Access Revoked", actor: "Admin Sarah", entity: "App (ThirdPartySync)", timestamp: "5 hours ago", ip: "192.168.1.45", severity: "High" },
]

const MOCK_SECURITY_EVENTS = [
  { id: "EV-102", type: "Brute Force Attempt", severity: "High", status: "Blocked", detail: "15 failed logins for admin_sarah in 1 minute from RU-based IP.", timestamp: "20 mins ago", color: "rose" },
  { id: "EV-101", type: "Unusual Data Access", severity: "Medium", status: "Under Review", detail: "Dr. Elena accessed 50 records in 5 minutes via web interface.", timestamp: "2 hours ago", color: "amber" },
  { id: "EV-100", type: "Multiple Privilege Escalation", severity: "Critical", status: "Isolated", detail: "Internal service account attempted to bypass auth-gate.", timestamp: "1 day ago", color: "rose" },
]

export default function ComplianceSecurityPage() {
  const { toast } = useToast()

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
             Trust & Compliance
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor infrastructure integrity, audit logs, and regulatory compliance status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => {
            toast({ title: "Audit Trail Exported", description: "Signed PDF report generated and sent to logs archive." })
          }}>
            <Download className="h-4 w-4" /> Export Audit
          </Button>
          <Button className="gap-2" onClick={() => {
            toast({ title: "Compliance Scan", description: "Performing verification across all system nodes..." })
          }}>
            <ShieldCheck className="h-4 w-4" /> Run Scan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full max-w-md justify-start gap-1">
          <TabsTrigger value="audit" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Audit Trails</TabsTrigger>
          <TabsTrigger value="privacy" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Privacy</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6 animate-in fade-in duration-500">
          <Card className="border-sidebar-border bg-card/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Global Audit Trail</CardTitle>
                    <CardDescription>Real-time record of all system modifications and data access.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Filter logs..." className="pl-9 h-9" />
                  </div>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" /> Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y divide-sidebar-border">
                  {MOCK_AUDIT_LOGS.map((log) => (
                    <div key={log.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            log.severity === 'High' ? 'bg-rose-500/10 text-rose-500' :
                            log.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-primary/10 text-primary'
                        }`}>
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{log.action}</span>
                            <Badge variant="outline" className="text-[10px] py-0">{log.id}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <span className="font-medium text-foreground">{log.actor}</span> on {log.entity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-50">IP Address</p>
                            <p className="text-xs font-mono">{log.ip}</p>
                        </div>
                        <div className="text-right min-w-[80px]">
                            <p className="text-sm font-medium">{log.timestamp}</p>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase">Verified</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                             <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-sidebar-border bg-card/50">
              <CardHeader>
                <CardTitle>Regulatory Compliance Score</CardTitle>
                <CardDescription>Real-time monitoring of global healthcare data standards.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { name: "GDPR (EU)", status: "Active", score: "100%", color: "bg-emerald-500" },
                  { name: "HIPAA (US)", status: "Active", score: "96%", color: "bg-emerald-500" },
                  { name: "Encryption (AES-256)", status: "Active", score: "100%", color: "bg-primary" },
                  { name: "Data Retention", status: "Caution", score: "78%", color: "bg-amber-500" },
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold">{stat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-xl font-bold">{stat.score}</span>
                         <Badge className={`${stat.status === 'Caution' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"} font-bold text-[10px]`}>
                            {stat.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${stat.color}`} style={{ width: stat.score }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="border-none bg-gradient-to-br from-primary to-indigo-600 text-white p-6 shadow-xl relative overflow-hidden group">
                   <Lock className="absolute bottom-0 right-0 h-24 w-24 opacity-10 -mr-4 -mb-4 rotate-12 transition-transform group-hover:scale-110" />
                   <div className="relative z-10 space-y-4">
                      <Badge className="bg-white/20 text-white border-none font-bold">SEC-GATEWAY</Badge>
                      <h3 className="text-2xl font-bold leading-tight">Zero-Trust Access Gate</h3>
                      <p className="text-white/70 text-sm leading-relaxed">Dynamic identity verification is active for all system terminals.</p>
                      <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold" onClick={() => {
                          toast({ title: "Gate Reset", description: "Re-verifying all active session nodes." })
                      }}>Reset All Nodes</Button>
                   </div>
                </Card>

                <Card className="border-sidebar-border bg-card/50 p-6 flex flex-col gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                        <ShieldQuestion className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h4 className="font-bold">Need Review?</h4>
                    <p className="text-xs text-muted-foreground">Request a clinical data review from the Data Protection Officer.</p>
                    <Button variant="outline" className="w-full text-xs font-semibold" onClick={() => {
                        toast({ title: "Review Requested", description: "The DPO has been notified." })
                    }}>Request DPO Audit</Button>
                </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="p-6 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <ShieldAlert className="h-6 w-6 text-white" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-rose-600">Active Threat Surveillance</h3>
                    <p className="text-sm text-rose-600/70">Real-time anomaly detection is currently monitoring global traffic.</p>
                 </div>
              </div>
              <div className="text-right flex flex-col items-end">
                 <Badge variant="outline" className="border-rose-200 text-rose-600 font-bold px-3">Heightened Alert</Badge>
                 <p className="text-[10px] text-rose-500/50 uppercase mt-1">Status: Operational</p>
              </div>
           </div>

          <div className="grid grid-cols-1 gap-4">
            {MOCK_SECURITY_EVENTS.map((event) => (
                <Card key={event.id} className="border-sidebar-border bg-card/50 overflow-hidden hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${event.severity === "Critical" || event.severity === "High" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"}`}>
                          <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-lg">{event.type}</h4>
                            <Badge className={
                                event.severity === 'Critical' ? 'bg-rose-600 text-white' :
                                event.severity === 'High' ? 'bg-rose-100 text-rose-600' :
                                'bg-amber-100 text-amber-600'
                            }>{event.severity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground max-w-xl">{event.detail}</p>
                          <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-muted-foreground/60 uppercase">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.timestamp}</span>
                              <span className="flex items-center gap-1">Status: {event.status}</span>
                          </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={(e) => {
                            e.stopPropagation()
                            toast({ title: "Dismissed", description: "Event marked as non-critical." })
                        }}>Dismiss</Button>
                        <Button size="sm" className="gap-2" onClick={(e) => {
                            e.stopPropagation()
                            toast({ title: "Investigation Started", description: "Opening security analyst console." })
                        }}>Investigate</Button>
                    </div>
                </CardContent>
                </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
