"use client"

import * as React from "react"
import { Users, UserPlus, UserCheck, UserMinus, TrendingUp } from "lucide-react"
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
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

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
} satisfies ChartConfig

export function UserMetrics() {
  const [registrations, setRegistrations] = React.useState([
    { day: "Mon", patients: 120, doctors: 10, pharmacies: 5 },
    { day: "Tue", patients: 150, doctors: 12, pharmacies: 3 },
    { day: "Wed", patients: 180, doctors: 15, pharmacies: 8 },
    { day: "Thu", patients: 140, doctors: 8, pharmacies: 4 },
    { day: "Fri", patients: 210, doctors: 20, pharmacies: 10 },
    { day: "Sat", patients: 90, doctors: 5, pharmacies: 2 },
    { day: "Sun", patients: 70, doctors: 3, pharmacies: 1 },
  ])

  const [growth, setGrowth] = React.useState([
    { month: "Jan", users: 1200 },
    { month: "Feb", users: 1500 },
    { month: "Mar", users: 1800 },
    { month: "Apr", users: 2400 },
    { month: "May", users: 2800 },
    { month: "Jun", users: 3200 },
  ])

  const [activity, setActivity] = React.useState([
    { name: "Active", value: 2400, color: "hsl(var(--primary))" },
    { name: "Dormant", value: 800, color: "hsl(var(--muted))" },
  ])

  const [demographics, setDemographics] = React.useState([
    { age: "18-24", count: 450 },
    { age: "25-34", count: 850 },
    { age: "35-44", count: 650 },
    { age: "45-54", count: 400 },
    { age: "55+", count: 300 },
  ])

  const [stats, setStats] = React.useState([
    { title: "Total Users", value: "3,200", change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-500/10" },
    { title: "New Patients", value: "845", change: "+18%", icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { title: "Active Now", value: "1,156", change: "+5%", icon: UserCheck, color: "text-amber-600", bg: "bg-amber-500/10" },
    { title: "Churn Rate", value: "2.4%", change: "-0.5%", icon: UserMinus, color: "text-destructive", bg: "bg-destructive/10" },
  ])

  // API Endpoints Suggestion:
  // GET: /admin/users/metrics -> Fetch registrations, growth, activity, demographics
  // GET: /admin/users/stats -> Fetch summary stats (Total Users, New Patients, etc.)
  /*
    useEffect(() => {
      const fetchUserMetrics = async () => {
        try {
          const response = await apiClient.get('/admin/users/metrics');
          // setRegistrations(response.data.registrations);
          // setGrowth(response.data.growth);
          // setActivity(response.data.activity);
          // setDemographics(response.data.demographics);
          // setStats(response.data.stats);
        } catch (error) {
          console.error('Failed to fetch user metrics', error);
        }
      };
      fetchUserMetrics();
    }, []);
  */

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
                  {activity.map((entry: any, index: number) => (
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
