"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useDataStore } from "@/hooks/use-data-store"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  Activity,
  DollarSign,
  UserCheck,
  CheckCircle,
  XCircle,
  Calendar,
  Brain,
  Zap,
  MoreVertical,
  Clock
} from "lucide-react"

import { UserMetrics } from "@/components/admin/user-metrics"
import { AppointmentAnalytics } from "@/components/admin/appointment-analytics"
import { AIPerformance } from "@/components/admin/ai-performance"
import { FinancialOverview } from "@/components/admin/financial-overview"
import { HealthTrends } from "@/components/admin/health-trends"
import { DoctorDetailDialog } from "@/components/shared/dialogs/doctor-detail-dialog"

export default function AdminDashboard() {
  const { stats, users, hasHydrated, isHydrating, updateUserStatus } = useDataStore()
  const { toast } = useToast()
  const router = useRouter()
  const [selectedDoctor, setSelectedDoctor] = React.useState<any>(null)
  const [isDoctorDialogOpen, setIsDoctorDialogOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("overview")

  const allUsers = users
  const pendingDoctors = allUsers.filter(u => u.role === 'Doctor' && u.status === 'Pending')

  if (isHydrating) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const displayStats = [
    {
      title: "Total Patients",
      value: stats.totalPatients.toLocaleString(),
      change: "+12.5%",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      targetTab: "users"
    },
    {
      title: "Active Doctors",
      value: stats.activeDoctors.toLocaleString(),
      change: "+4.2%",
      icon: UserCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      targetTab: "users"
    },
    {
      title: "Daily Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      change: "+18.2%",
      icon: DollarSign,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      targetTab: "finance"
    },
    {
      title: "Today's Appts",
      value: stats.appointmentsToday.toString(),
      change: "+5.1%",
      icon: Calendar,
      color: "text-primary",
      bg: "bg-primary/10",
      targetTab: "appointments"
    },
  ]

  const handleVerification = (id: string, approve: boolean) => {
    updateUserStatus(id, approve ? 'Active' : 'Suspended')
    toast({
      title: approve ? "Doctor Approved" : "Doctor Rejected",
      description: `Provider status has been updated.`,
      variant: approve ? "default" : "destructive"
    })
  }

  const openDoctorDetail = (doctor: any) => {
    setSelectedDoctor(doctor)
    setIsDoctorDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
           Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          System-wide performance, clinical oversight, and financial optics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {displayStats.map((stat, i) => (
          <Card 
            key={i} 
            className="border-sidebar-border bg-card/50 hover:bg-card hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => setActiveTab(stat.targetTab)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {stat.change} <TrendingUp className="h-3 w-3" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-8" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full max-w-4xl justify-start overflow-x-auto gap-1">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Users</TabsTrigger>
          <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Appointments</TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">AI Engine</TabsTrigger>
          <TabsTrigger value="finance" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Financials</TabsTrigger>
          <TabsTrigger value="health" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Clinical Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-sidebar-border bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Credentialing Queue</CardTitle>
                  <CardDescription>Provider identity validation requests.</CardDescription>
                </div>
                <Badge variant="outline" className="text-primary border-primary/20">
                  {pendingDoctors.length} Pending
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {pendingDoctors.length > 0 ? (
                    pendingDoctors.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-all cursor-pointer group/row" onClick={() => openDoctorDetail(doc)}>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border border-border/50 group-hover/row:border-primary/50 transition-colors">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {doc.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-sm group-hover/row:text-primary transition-colors">{doc.name}</h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                              {doc.specialty} • {doc.yearsOfExperience || "5+"} Years
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            onClick={() => handleVerification(doc.id, true)}
                          >
                            <CheckCircle className="mr-2 h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 border-rose-500/20"
                            onClick={() => handleVerification(doc.id, false)}
                          >
                            <XCircle className="mr-2 h-3.5 w-3.5" /> Reject
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-muted-foreground bg-muted/10">
                      <CheckCircle className="h-8 w-8 text-emerald-500/50 mx-auto mb-3" />
                      <p className="text-sm">Verification queue is empty.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-none bg-gradient-to-br from-primary to-indigo-600 text-white p-6 shadow-xl relative overflow-hidden">
                <Activity className="absolute bottom-0 right-0 h-24 w-24 -mb-4 -mr-4 opacity-10 rotate-12" />
                <div className="space-y-4 relative">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Infrastructure</p>
                    <h3 className="text-2xl font-bold tracking-tight">System Core</h3>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-bold">99.98%</p>
                      <p className="text-[10px] uppercase font-medium opacity-60">Avg Uptime</p>
                    </div>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">V4.8 Stable</Badge>
                  </div>
                </div>
              </Card>

              <Card className="border-sidebar-border bg-card/50 p-6 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick Access</h4>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-between h-10 rounded-lg hover:bg-primary/10 hover:text-primary transition-all px-3" onClick={() => setActiveTab("ai")}>
                    <span className="text-sm font-medium">AI Optimization Metrics</span>
                    <Brain className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" className="w-full justify-between h-10 rounded-lg hover:bg-blue-500/10 hover:text-blue-500 transition-all px-3" onClick={() => setActiveTab("health")}>
                    <span className="text-sm font-medium">Clinical Trend Analysis</span>
                    <Activity className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="animate-in slide-in-from-right duration-500 outline-none">
          <UserMetrics />
        </TabsContent>
        <TabsContent value="appointments" className="animate-in slide-in-from-right duration-500 outline-none">
          <AppointmentAnalytics />
        </TabsContent>
        <TabsContent value="ai" className="animate-in slide-in-from-right duration-500 outline-none">
          <AIPerformance />
        </TabsContent>
        <TabsContent value="finance" className="animate-in slide-in-from-right duration-500 outline-none">
          <FinancialOverview />
        </TabsContent>
        <TabsContent value="health" className="animate-in slide-in-from-right duration-500 outline-none">
          <HealthTrends />
        </TabsContent>
      </Tabs>

      <DoctorDetailDialog 
        open={isDoctorDialogOpen}
        onOpenChange={setIsDoctorDialogOpen}
        doctor={selectedDoctor}
        isAdminView={true}
      />
    </div>
  )
}
