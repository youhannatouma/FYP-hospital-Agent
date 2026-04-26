"use client"

import { columns, Patient } from "@/components/doctor/dashboard/patient/columns"
import { DataTable } from "@/components/doctor/dashboard/patient/table-patient"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { getServiceContainer } from "@/lib/services/service-container"
import { Loader2 } from "lucide-react"

export default function DoctorPatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [patients, setPatients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const container = getServiceContainer()
        const users = await container.user.getAllUsers()
        
        const patientData = users
          .filter((u: any) => u.role === 'patient')
          .map((p: any) => ({
            id: p.user_id,
            name: `${p.first_name} ${p.last_name}`,
            status: p.status || 'active',
            email: p.email,
            lastVisit: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Unknown',
          }))
        setPatients(patientData)
      } catch (error) {
        console.error("Failed to fetch patients:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPatients()
  }, [])

  const stats = [
    {
      label: "Total Patient Census",
      value: patients.length.toString(),
      trend: "Active",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Newly Registered",
      value: patients.filter(p => p.lastVisit === new Date().toLocaleDateString()).length.toString(),
      trend: "Today",
      icon: UserPlus,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "High Priority",
      value: "0",
      trend: "Critical",
      icon: Sparkles,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    }
  ]

  return (
    <m.div 
      className="flex flex-col gap-10 max-w-[1400px] mx-auto pb-24 px-2"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between pt-4">
        <div className="space-y-4">
          <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
            Population Management
          </Badge>
          <h1 className="text-4xl font-black text-foreground tracking-tight leading-none lg:text-5xl">
            Patient Registry
          </h1>
          <p className="text-muted-foreground mt-4 font-medium text-lg max-w-lg leading-relaxed">
            Centralized subject directory. Monitor health status and longitudinal engagement across your entire patient census.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
           <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center border border-border/50 text-emerald-500 shadow-sm">
             <ShieldCheck className="h-5 w-5" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Privacy Sync</p>
              <p className="text-xs font-bold text-foreground">HIPAA Compliant Data</p>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
         {stats.map((stat, i) => (
           <Card key={i} className="premium-card rounded-3xl border-none bg-card/30 shadow-premium p-6 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                 <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner-glow", stat.bg, stat.color)}>
                    <stat.icon className="h-6 w-6" />
                 </div>
                 <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <TrendingUp className="h-2 w-2" />
                    {stat.trend}
                 </Badge>
              </div>
              <div className="relative z-10">
                 <p className="text-3xl font-black text-foreground leading-none">{stat.value}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1.5 opacity-50 leading-none">{stat.label}</p>
              </div>
           </Card>
         ))}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="relative flex-1 max-w-xl">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input 
               placeholder="Search by subject name, identifier, or email address..." 
               className="h-14 pl-12 rounded-2xl bg-card border-border/50 font-medium shadow-subtle focus:ring-primary/20"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="outline" className="h-14 px-6 rounded-2xl border-border/50 bg-card font-black text-[10px] uppercase tracking-widest shadow-subtle flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Registry
             </Button>
             <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white hover:bg-primary font-black text-[10px] uppercase tracking-widest shadow-glow active:scale-95 transition-all">
                Onboard Subject
             </Button>
          </div>
        </div>

        <Card className="premium-card rounded-[2.5rem] border-none shadow-premium bg-card overflow-hidden">
          <CardContent className="p-0 min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                 <Loader2 className="h-8 w-8 text-primary animate-spin" />
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Loading Patients...</p>
              </div>
            ) : (
              <DataTable 
                columns={columns} 
                data={patients.filter(p => 
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  p.email.toLowerCase().includes(searchQuery.toLowerCase())
                )} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </m.div>
  )
}
