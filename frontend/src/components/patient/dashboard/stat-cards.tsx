"use client"

import { Heart, Droplets, Weight, Moon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { m } from "framer-motion"
import { useState, useEffect } from "react"
import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"

export function StatCards() {
  const { stats } = useHospital();
  const { getToken } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getToken();
        const res = await stats.getPatientStats(token || undefined);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [stats, getToken]);

  const statsItems = [
    {
      icon: Heart,
      value: "72 bpm", // Mocked as we don't have vitals series yet
      label: "Heart Rate",
      status: "Optimal",
      statusColor: "text-emerald-500",
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-500",
      updated: "2h ago",
      primary: true,
      description: "Consistent resting rhythm detected over the last 24 hours.",
    },
    {
      icon: Droplets,
      value: `${data?.upcoming_appointments || 0}`,
      label: "Appointments",
      status: "Upcoming",
      statusColor: "text-emerald-500",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      updated: "Real-time",
    },
    {
      icon: Weight,
      value: `${data?.medical_records || 0}`,
      label: "Medical Records",
      status: "Stored",
      statusColor: "text-blue-500",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      updated: "Total",
    },
    {
      icon: Moon,
      value: `${data?.active_prescriptions || 0}`,
      label: "Prescriptions",
      status: "Active",
      statusColor: "text-indigo-500",
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-500",
      updated: "Current",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 px-1">
      {statsItems.map((stat, idx) => (
        <m.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.5 }}
          className={cn(
            "premium-card p-6 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500",
            stat.primary ? "md:col-span-2 lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 text-white min-h-[200px]" : "bg-card hover:translate-y-[-4px] shadow-sm border border-border/50"
          )}
        >
          {stat.primary && (
             <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
          )}
          
          <div className="flex items-start justify-between relative z-10">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110",
                stat.primary ? "bg-white/10" : stat.iconBg
              )}
            >
              <stat.icon className={cn("h-7 w-7", stat.primary ? "text-white" : stat.iconColor)} />
            </div>
            <div className="flex flex-col items-end">
               <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest border-none px-2 py-0.5 rounded-lg",
                  stat.primary ? "bg-white/10 text-white shadow-glow" : "bg-muted/50 text-muted-foreground"
                )}
              >
                {stat.status}
              </Badge>
              <span className={cn("text-[10px] uppercase font-bold mt-2", stat.primary ? "text-slate-400" : "text-muted-foreground")}>
                {stat.updated}
              </span>
            </div>
          </div>
          
          <div className="mt-6 relative z-10">
            <h3 className={cn(
              "text-sm font-bold uppercase tracking-[0.2em]",
              stat.primary ? "text-slate-400" : "text-muted-foreground"
            )}>
              {stat.label}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 mt-1">
               <p className="text-4xl font-black tracking-tighter leading-none">
                {stat.value}
              </p>
              {stat.primary && (
                <p className="text-xs font-medium text-slate-400 max-w-[200px] mb-1">
                  {stat.description}
                </p>
              )}
            </div>
          </div>

          <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
            <stat.icon className="w-24 h-24 rotate-12" />
          </div>
        </m.div>
      ))}
    </div>
  )
}
