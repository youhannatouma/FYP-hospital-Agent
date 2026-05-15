"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  LineChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
  cancelled: {
    label: "Cancelled",
    color: "hsl(var(--destructive))",
  },
  bookings: {
    label: "Bookings",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function AppointmentAnalytics() {
  const [stats, setStats] = useState<any[]>([]);
  const [appointmentStats, setAppointmentStats] = useState<any[]>([]);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [cancellationReasons, setCancellationReasons] = useState<any[]>([]);

  useEffect(() => {
    const fetchAppointmentAnalytics = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/appointments/analytics`,
        );
        setStats(response.data.stats || []);
        setAppointmentStats(response.data.appointmentStats || []);
        setPeakHours(response.data.peakHours || []);
        setCancellationReasons(response.data.cancellationReasons || []);
      } catch (error) {
        console.error("Failed to fetch appointment analytics", error);
      }
    };
    fetchAppointmentAnalytics();
  }, []);

  // API Endpoints Suggestion:
  // GET: /admin/appointments/analytics -> Fetch stats, appointmentStats, peakHours, cancellationReasons
  /*
    useEffect(() => {
      const fetchAppointmentAnalytics = async () => {
        try {
          const response = await apiClient.get('/admin/appointments/analytics');
          // setStats(response.data.stats);
          // setAppointmentStats(response.data.appointmentStats);
          // setPeakHours(response.data.peakHours);
          // setCancellationReasons(response.data.cancellationReasons);
        } catch (error) {
          console.error('Failed to fetch appointment analytics', error);
        }
      };
      fetchAppointmentAnalytics();
    }, []);
  */

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="border-border/50 bg-card/50 backdrop-blur-sm"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                  {stat.change}
                  <TrendingUp className="h-3 w-3" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Appointment Completion</CardTitle>
            <CardDescription>
              Completed vs. cancelled appointments this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={appointmentStats}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="completed"
                  fill="var(--color-completed)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="cancelled"
                  fill="var(--color-cancelled)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Peak Booking Hours</CardTitle>
            <CardDescription>
              Volume of appointments by time of day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={peakHours}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="var(--color-bookings)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-bookings)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Cancellation Reasons</CardTitle>
          <CardDescription>
            Top reasons for appointment cancellations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cancellationReasons.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>{item.reason}</span>
                  <span className="text-muted-foreground">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
