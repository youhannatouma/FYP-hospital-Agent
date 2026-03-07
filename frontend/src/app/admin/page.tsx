"use client"

import * as React from "react"
import { useHospital } from "@/hooks/use-hospital"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  Activity,
  DollarSign,
  UserCheck,
  MoreVertical,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Brain,
  BarChart3
} from "lucide-react"
import { m } from "framer-motion"

import { useToast } from "@/hooks/use-toast"

import { UserMetrics } from "@/components/admin/user-metrics"
import { AppointmentAnalytics } from "@/components/admin/appointment-analytics"
import { AIPerformance } from "@/components/admin/ai-performance"
import { FinancialOverview } from "@/components/admin/financial-overview"
import { HealthTrends } from "@/components/admin/health-trends"

export default function AdminDashboard() {
  const { admin } = useHospital()
  const { toast } = useToast()
  const [dynamicStats, setDynamicStats] = React.useState<any>(null)
  const [pendingApprovals, setPendingApprovals] = React.useState([
    {
      id: 1,
      name: "Dr. Sarah Miller",
      specialty: "Neurology",
      experience: "8 Years",
      appliedDate: "Feb 08, 2024",
      status: "Pending"
    },
    {
      id: 2,
      name: "Dr. James Wilson",
      specialty: "Pediatrics",
      experience: "12 Years",
      appliedDate: "Feb 07, 2024",
      status: "Pending"
    },
    {
      id: 3,
      name: "Dr. Elena Popova",
      specialty: "Radiology",
      experience: "5 Years",
      appliedDate: "Feb 06, 2024",
      status: "Review"
    }
  ])

  const [topStats, setTopStats] = React.useState([
    {
      title: "Total Patients",
      value: "2,845",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-500/10"
    },
    {
      title: "Active Doctors",
      value: "156",
      change: "+4.2%",
      trend: "up",
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Monthly Revenue",
      value: "$45,280",
      change: "+18.2%",
      trend: "up",
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-500/10"
    },
    {
      title: "System Uptime",
      value: "99.9%",
      change: "+0.01%",
      trend: "up",
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-500/10"
    },
  ])

  React.useEffect(() => {
    const fetchStats = async () => {
      const data = await admin.getStats()
      setDynamicStats(data)
      // If we had a real API for pending approvals:
      // const approvals = await admin.getPendingApprovals()
      // setPendingApprovals(approvals)
    }
    fetchStats()
  }, [admin])

  const displayStats = [
    {
      title: "Total Users",
      value: dynamicStats?.totalUsers?.toLocaleString() || topStats[0].value,
      change: topStats[0].change,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-500/10"
    },
    {
      title: "Active Now",
      value: dynamicStats?.activeUsers?.toLocaleString() || topStats[1].value,
      change: topStats[1].change,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Revenue",
      value: dynamicStats?.revenue ? `$${dynamicStats.revenue.toLocaleString()}` : topStats[2].value,
      change: topStats[2].change,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-500/10"
    },
    {
      title: "Appts Today",
      value: dynamicStats?.appointmentsToday?.toString() || "24",
      change: topStats[3].change,
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-500/10"
    },
  ]

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto min-h-screen bg-background"
    >
      {/* ... (header same) ... */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Admin Control Center</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive system analytics and management suite.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-border" onClick={() => toast({ title: "Export Data", description: "Generating CSV export of all system analytics..." })}>Export Data</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={() => toast({ title: "Add User", description: "Opening new user provision form..." })}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-muted/50 p-1 border border-border/50">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            User Metrics
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Performance
          </TabsTrigger>
          <TabsTrigger value="finance" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Financials
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-2">
            <Stethoscope className="h-4 w-4" />
            Health Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {displayStats.map((stat, i) => (
              <Card key={i} className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-xs font-bold">
                      {stat.change}
                      <TrendingUp className="h-3 w-3" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-card-foreground">{stat.value}</p>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Management Area */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Doctor Verification Queue
                  </CardTitle>
                  <Badge variant="outline" className="border-primary/20 text-primary">
                    {pendingApprovals.length} Actions Required
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingApprovals.map((doctor) => (
                      <div key={doctor.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {doctor.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">{doctor.name}</h4>
                            <p className="text-xs text-muted-foreground">{doctor.specialty} • {doctor.experience}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right mr-4 hidden sm:block">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Applied</p>
                            <p className="text-xs font-medium text-foreground">{doctor.appliedDate}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-emerald-600 hover:bg-emerald-500/10"
                              onClick={() => {
                                admin.handleAction('approve_doctor', { id: doctor.id })
                                toast({ title: "Application Approved", description: `${doctor.name}'s account has been fully verified and activated.`, variant: "default" })
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                admin.handleAction('reject_doctor', { id: doctor.id })
                                toast({ title: "Application Rejected", description: `${doctor.name}'s application has been denied.`, variant: "destructive" })
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => toast({ title: "More Options", description: `Viewing detailed profile for ${doctor.name}...` })}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Actions/Stats */}
            <div className="space-y-6">
              <Card className="border border-border bg-card shadow-sm overflow-hidden">
                <div className="bg-primary p-6 text-primary-foreground">
                  <h3 className="font-bold text-lg mb-1">Administrative Center</h3>
                  <p className="text-xs opacity-80">Quick actions and system status</p>
                </div>
                <CardContent className="p-4 space-y-4">
                  <Button className="w-full justify-between border-border" variant="outline" onClick={() => toast({ title: "Access Control", description: "Opening user roles and permissions manager..." })}>
                    Manage User Access
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                  <Button className="w-full justify-between border-border" variant="outline" onClick={() => toast({ title: "Reports", description: "Generating quarterly revenue reports..." })}>
                    Revenue Reports
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                  <Button className="w-full justify-between border-border" variant="outline" onClick={() => toast({ title: "Maintenance", description: "Scheduling automated server diagnostic..." })}>
                    Server Maintenance
                    <Clock className="h-4 w-4" />
                  </Button>
                  
                  <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="text-sm font-bold text-foreground mb-4">Storage Usage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-muted-foreground">Database Size</span>
                        <span className="text-foreground">42.8 GB / 100 GB</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-[42%] bg-primary rounded-full transition-all" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserMetrics />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentAnalytics />
        </TabsContent>

        <TabsContent value="ai">
          <AIPerformance />
        </TabsContent>

        <TabsContent value="finance">
          <FinancialOverview />
        </TabsContent>

        <TabsContent value="health">
          <HealthTrends />
        </TabsContent>
      </Tabs>
    </m.div>
  )
}
