"use client"

import { User, MessageSquare, UserPlus, AlarmCheck, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useDataStore } from "@/hooks/use-data-store"
import { useUser } from "@clerk/nextjs"
import { isToday, parseISO } from "date-fns"

export function StatCards() {
  const router = useRouter()
  const { toast } = useToast()
  const { appointments, users } = useDataStore()
  const { user: clerkUser } = useUser()

  // In a real app, we'd filter by doctorId. 
  // For the mock, we assume the current logged-in doctor is the one we care about.
  const allAppointments = appointments
  const todayAppointments = allAppointments.filter(app => isToday(new Date(app.date)))
  
  // Unique patients seen by this doctor based on appointments
  const uniquePatientIds = new Set(allAppointments.map(app => app.patientId))
  const patientCount = uniquePatientIds.size || users.filter(u => u.role === 'Patient').length

  const unreadMessagesCount = 12 // Simplified for now, could be getMessages().filter(m => !m.read).length

  const stats = [
    {
      icon: User,
      value: `${patientCount}`,
      label: "Total Patients",
      status: "+4.2%",
      trend: "up",
      statusColor: "bg-emerald-500/10 text-emerald-600",
      iconBg: "bg-rose-500/5",
      iconColor: "text-rose-500",
      updated: "Patient registry",
    },
    {
      icon: UserPlus,
      value: `${todayAppointments.length}`,
      label: "Today's Agenda",
      status: "Verified",
      trend: "stable",
      statusColor: "bg-primary/5 text-primary",
      iconBg: "bg-amber-500/5",
      iconColor: "text-amber-500",
      updated: "Appointments today",
    },
    {
      icon: AlarmCheck,
      value: "14 min",
      label: "Avg. Wait Time",
      status: "-2.1%",
      trend: "down",
      statusColor: "bg-blue-500/10 text-blue-600",
      iconBg: "bg-emerald-500/5",
      iconColor: "text-emerald-500",
      updated: "Based on check-ins",
    },
    {
      icon: MessageSquare,
      value: `${unreadMessagesCount}`,
      label: "Unread Messages",
      status: "Action",
      trend: "stable",
      statusColor: "bg-amber-500/10 text-amber-600",
      iconBg: "bg-indigo-500/5",
      iconColor: "text-indigo-500",
      updated: "Inbox summary",
    },
  ];

  const handleCardClick = (label: string) => {
    switch (label) {
      case "Total Patients":
        router.push("/doctor/patients")
        break
      case "Today's Agenda":
        router.push("/doctor/appointments")
        break
      case "Unread Messages":
        router.push("/doctor/messages")
        break
      default:
        toast({
          title: "Stat Detail",
          description: `Opening detailed analytics for ${label}...`,
        })
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-sidebar-border bg-card shadow-sm hover:border-primary/50 transition-all cursor-pointer group active:scale-[0.98]"
          onClick={() => handleCardClick(stat.label)}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${stat.iconBg}`}
              >
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] h-6 font-bold uppercase tracking-wider ${stat.statusColor} border-none`}
              >
                {stat.status}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight text-foreground transition-colors">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
            <p className="mt-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{stat.updated}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
