"use client";

/**
 * StatCards (Doctor Dashboard)
 * Follows: Single Responsibility Principle (SRP) — display only, stats via repository
 * Follows: Dependency Inversion Principle (DIP) — uses IStatsRepository via service container
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, UserPlus, Clock, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServiceContainer } from "@/lib/services/service-container";
import type { DoctorStatsData } from "@/lib/services/repositories/stats-repository";

// ─── Stat Configuration (SRP: data config separate from rendering) ────────────

function buildStatItems(data: DoctorStatsData | null) {
  return [
    {
      icon: User,
      value: `${data?.total_patients ?? 0} Patients`,
      label: "Total Patients",
      status: "Verified",
      statusColor: "bg-emerald-500/10 text-emerald-600",
      iconBg: "bg-rose-50 dark:bg-rose-500/10",
      iconColor: "text-rose-500",
      updated: data?.last_updated
        ? `Last updated: ${new Date(data.last_updated).toLocaleTimeString()}`
        : "Just now",
      href: "/doctor/patients",
    },
    {
      icon: UserPlus,
      value: `${data?.appointments_today ?? 0}`,
      label: "Today's Appointments",
      status: "Active",
      statusColor: "bg-primary/10 text-primary",
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-500",
      updated: "Real-time sync",
      href: "/doctor/appointments",
    },
    {
      icon: Clock,
      value: `${data?.pending_reviews ?? 0}`,
      label: "Pending Reviews",
      status: (data?.pending_reviews ?? 0) > 0 ? "Attention" : "Clean",
      statusColor:
        (data?.pending_reviews ?? 0) > 0
          ? "bg-rose-500/10 text-rose-600"
          : "bg-emerald-500/10 text-emerald-600",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-500",
      updated: "Medical records",
      href: "/doctor/records",
    },
    {
      icon: MessageSquare,
      value: `${data?.unread_messages ?? 0}`,
      label: "Messages",
      status: (data?.unread_messages ?? 0) > 0 ? "New" : "Clean",
      statusColor:
        (data?.unread_messages ?? 0) > 0
          ? "bg-indigo-500/10 text-indigo-600"
          : "bg-emerald-500/10 text-emerald-600",
      iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
      iconColor: "text-indigo-500",
      updated: "In-app chat",
      href: "/doctor/messages",
    },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StatCards() {
  const [data, setData] = useState<DoctorStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const container = getServiceContainer();
        const result = await container.stats.getDoctorStats();
        setData(result);
      } catch (e) {
        console.error("[StatCards] Failed to load doctor stats:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="premium-card rounded-2xl border-none shadow-premium animate-pulse h-32 bg-muted/20"
          />
        ))}
      </div>
    );
  }

  const statItems = buildStatItems(data);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => (
        <Link key={stat.label} href={stat.href}>
          <Card className="premium-card rounded-2xl border-none shadow-premium hover:-translate-y-1 transition-all duration-300">
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
                <p className="text-2xl font-black text-card-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
              <p className="mt-3 text-[10px] font-medium text-muted-foreground opacity-60 italic">
                {stat.updated}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
