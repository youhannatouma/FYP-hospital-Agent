"use client"

import * as React from "react"
import { Calendar, Clock, CheckCircle, XCircle, DollarSign, TrendingUp } from "lucide-react"
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Line, 
  LineChart,
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
} satisfies ChartConfig

export function AppointmentAnalytics() {
  const [stats, setStats] = React.useState([
    { title: "Total Booked", value: "1,248", change: "+15%", icon: Calendar, color: "text-blue-600", bg: "bg-blue-500/10" },
    { title: "Completion Rate", value: "92%", change: "+2%", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { title: "Avg. Wait Time", value: "12 min", change: "-10%", icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10" },
    { title: "Revenue", value: "$12,450", change: "+20%", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
  ])

  const [appointmentStats, setAppointmentStats] = React.useState([
    { name: "Mon", completed: 45, cancelled: 5 },
    { name: "Tue", completed: 52, cancelled: 8 },
    { name: "Wed", completed: 48, cancelled: 4 },
    { name: "Thu", completed: 61, cancelled: 10 },
    { name: "Fri", completed: 55, cancelled: 7 },
    { name: "Sat", completed: 32, cancelled: 3 },
    { name: "Sun", completed: 25, cancelled: 2 },
  ])

  const [peakHours, setPeakHours] = React.useState([
    { hour: "8AM", bookings: 12 },
    { hour: "10AM", bookings: 45 },
    { hour: "12PM", bookings: 30 },
    { hour: "2PM", bookings: 38 },
    { hour: "4PM", bookings: 52 },
    { hour: "6PM", bookings: 25 },
    { hour: "8PM", bookings: 10 },
  ])

  const [cancellationReasons, setCancellationReasons] = React.useState([
    { reason: "Patient No-show", percentage: 45, count: 120 },
    { reason: "Rescheduled", percentage: 30, count: 80 },
    { reason: "Doctor Availability", percentage: 15, count: 40 },
    { reason: "Other", percentage: 10, count: 26 },
  ])

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
            <CardTitle>Appointment Completion</CardTitle>
            <CardDescription>Completed vs. cancelled appointments this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={appointmentStats}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" fill="var(--color-cancelled)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Peak Booking Hours</CardTitle>
            <CardDescription>Volume of appointments by time of day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={peakHours}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
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
          <CardDescription>Top reasons for appointment cancellations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cancellationReasons.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>{item.reason}</span>
                  <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
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
  )
}
