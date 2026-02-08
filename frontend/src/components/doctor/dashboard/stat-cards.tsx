"use client"

import { User, MessageSquare, UserPlus, AlarmCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stats = [
  {
    icon: User,
    value: "1,284 Patient",
    label: "Total Patients",
    status: "+12.5%\nvs last month",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    iconBg: "bg-rose-50 dark:bg-rose-500/10",
    iconColor: "text-rose-500",
    updated: "Last updated: 2 hours ago",
  },
  {
    icon: UserPlus,
    value: "137/85",
    label: "Today's Appointments",
    status: "Good",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-500",
    updated: "Last updated: 3 hours ago",
  },
  {
    icon: AlarmCheck,
    value: "14 min",
    label: "Avg. Wait Time",
    status: "-8.2%\nvs last month",
    statusColor: "bg-blue-500/10 text-blue-600",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-500",
    updated: "Last updated: Today",
  },
  {
    icon: MessageSquare,
    value: "12",
    label: "Messages",
    status: "Good",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
    iconColor: "text-indigo-500",
    updated: "Quality: 85%",
  },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border border-border bg-card shadow-sm"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <Badge
                variant="secondary"
                className={`text-xs font-medium ${stat.statusColor} border-0`}
              >
                {stat.status}
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-card-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{stat.updated}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
