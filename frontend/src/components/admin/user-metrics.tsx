"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";

import { Users, UserPlus, UserCheck, UserMinus, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell
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
  patients: {
    label: "Patients",
    color: "hsl(var(--primary))",
  },
  doctors: {
    label: "Doctors",
    color: "hsl(var(--blue-500))",
  },
  pharmacies: {
    label: "Pharmacies",
    color: "hsl(var(--orange-500))",
  },
  users: {
    label: "Total Users",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function UserMetrics() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [demographics, setDemographics] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchUserMetrics = async () => {
      try {
        const metricsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/metrics`);
        if (!isMounted) return;
        setRegistrations(metricsResponse.data.registrations);
        setGrowth(metricsResponse.data.growth);
        setActivity(metricsResponse.data.activity);
        setDemographics(metricsResponse.data.demographics);

        const statsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/stats`);
        if (!isMounted) return;
        setStats([
          { title: "Total Users", value: statsResponse.data.total_users, change: statsResponse.data.total_users_change, icon: Users, color: "text-blue-600", bg: "bg-blue-500/10" },
          { title: "New Patients", value: statsResponse.data.new_patients, change: statsResponse.data.new_patients_change, icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { title: "Active Now", value: statsResponse.data.active_now, change: statsResponse.data.active_now_change, icon: UserCheck, color: "text-amber-600", bg: "bg-amber-500/10" },
          { title: "Churn Rate", value: statsResponse.data.churn_rate, change: statsResponse.data.churn_rate_change, icon: UserMinus, color: "text-destructive", bg: "bg-destructive/10" },
        ]);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch user metrics", error);
      }
    };
    fetchUserMetrics();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm">
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
            <CardTitle>Registration Trends</CardTitle>
            <CardDescription>Daily new registrations by user type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={registrations}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="patients" fill="var(--color-patients)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="doctors" fill="var(--color-doctors)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pharmacies" fill="var(--color-pharmacies)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total cumulative users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={growth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="users" stroke="var(--color-users)" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 col-span-1">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Active vs. dormant accounts</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={{}} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={activity}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {activity.map((entry, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 col-span-2">
          <CardHeader>
            <CardTitle>Demographic Breakdown</CardTitle>
            <CardDescription>User distribution by age group</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <BarChart data={demographics} layout="vertical">
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis dataKey="age" type="category" tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
