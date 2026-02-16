"use client"

import * as React from "react"
import { Heart, Droplets, Weight, Moon, Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogVitalsDialog } from "./dialogs/log-vitals-dialog"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useDataStore } from "@/hooks/use-data-store"
import { formatDistanceToNow } from "date-fns"

export function StatCards() {
  const { records } = useDataStore()
  
  // Find latest record with vitals
  const latestRecord = records[0] 
  
  const stats = [
    {
      icon: Heart,
      value: "72 bpm", // In a real app, parse this from records
      label: "Resting Heart Rate",
      status: "Optimal",
      statusColor: "bg-emerald-500/10 text-emerald-600",
      iconBg: "bg-rose-500/5",
      iconColor: "text-rose-500",
      updated: latestRecord ? `Last recorded ${latestRecord.date}` : "No records yet",
    },
    {
      icon: Droplets,
      value: "120/80",
      label: "Blood Pressure",
      status: "Stable",
      statusColor: "bg-emerald-500/10 text-emerald-600",
      iconBg: "bg-amber-500/5",
      iconColor: "text-amber-500",
      updated: "Verified today",
    },
    {
      icon: Activity,
      value: "98.6 \u00B0F",
      label: "Body Temp",
      status: "Normal",
      statusColor: "bg-blue-500/10 text-blue-500",
      iconBg: "bg-emerald-500/5",
      iconColor: "text-emerald-500",
      updated: "Live sensor link",
    },
    {
      icon: Moon,
      value: "7.5 hrs",
      label: "Sleep Cycle",
      status: "85%",
      statusColor: "bg-indigo-500/10 text-indigo-600",
      iconBg: "bg-indigo-500/5",
      iconColor: "text-indigo-500",
      updated: "Quality index",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Dialog key={stat.label}>
          <DialogTrigger asChild>
            <Card
              className="border-sidebar-border bg-card/50 shadow-sm hover:border-primary/30 transition-all cursor-pointer group"
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
                    className={`text-[10px] font-bold uppercase tracking-wider ${stat.statusColor} border-none`}
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
          </DialogTrigger>
          <LogVitalsDialog />
        </Dialog>
      ))}
    </div>
  )
}
