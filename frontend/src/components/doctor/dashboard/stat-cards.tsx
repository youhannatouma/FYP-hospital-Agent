import Link from "next/link";
import { User, UserPlus, Clock, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    href: "/doctor/patients",
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
    href: "/doctor/appointments",
  },
  {
    icon: Clock,
    value: "14 min",
    label: "Avg. Wait Time",
    status: "-8.2%\nvs last month",
    statusColor: "bg-blue-500/10 text-blue-600",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-500",
    updated: "Last updated: Today",
    href: "/doctor/insights",
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
    href: "/doctor/messages",
  },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Link key={stat.label} href={stat.href}>
          <Card
            className="premium-card rounded-2xl border-none shadow-premium hover:-translate-y-1 transition-all duration-300"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconBg} shadow-inner-glow`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <Badge
                  variant="secondary"
                  className={`text-[10px] font-black uppercase tracking-widest ${stat.statusColor} border-0`}
                >
                  {stat.status}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-card-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
              <p className="mt-3 text-[10px] font-medium text-muted-foreground opacity-60 italic">{stat.updated}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
