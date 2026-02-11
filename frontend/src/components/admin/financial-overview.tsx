"use client"

import * as React from "react"
import { DollarSign, TrendingUp, CreditCard, Banknote, ShoppingCart, AlertCircle } from "lucide-react"
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  Pie, 
  PieChart 
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

const revenueBySource = [
  { name: "Appointments", value: 35000, color: "hsl(var(--primary))" },
  { name: "Subscriptions", value: 12000, color: "hsl(var(--blue-500))" },
  { name: "Pharmacy Sale", value: 8000, color: "hsl(var(--orange-500))" },
  { name: "Consultations", value: 5000, color: "hsl(var(--purple-500))" },
]

const paymentStatusData = [
  { name: "Successful", count: 1240, color: "hsl(var(--emerald-500))" },
  { name: "Failed", count: 45, color: "hsl(var(--destructive))" },
  { name: "Pending", count: 120, color: "hsl(var(--amber-500))" },
]

const doctorEarningsData = [
  { name: "Mon", revenue: 4500, expenses: 3200 },
  { name: "Tue", revenue: 5200, expenses: 3500 },
  { name: "Wed", revenue: 4800, expenses: 3100 },
  { name: "Thu", revenue: 6100, expenses: 4000 },
  { name: "Fri", revenue: 5500, expenses: 3800 },
  { name: "Sat", revenue: 3200, expenses: 2200 },
  { name: "Sun", revenue: 2500, expenses: 1800 },
]

const chartConfig = {
  revenue: {
    label: "Total Revenue",
    color: "hsl(var(--primary))",
  },
  expenses: {
    label: "Doctor Earnings",
    color: "hsl(var(--blue-500))",
  },
} satisfies ChartConfig

export function FinancialOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Revenue", value: "$60,000", change: "+12.5%", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
          { title: "Avg. Transaction", value: "$48.50", change: "+5%", icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Company Comm.", value: "$12,450", change: "+18%", icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Pharmacy Sales", value: "$8,240", change: "+4.2%", icon: ShoppingCart, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((stat, i) => (
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
            <CardTitle>Revenue vs. Earnings</CardTitle>
            <CardDescription>Daily comparison of total revenue and payouts to doctors</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={doctorEarningsData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
              <CardDescription>Revenue breakdown by service category</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ChartContainer config={{}} className="h-[200px] w-full">
                <PieChart>
                  <Pie
                    data={revenueBySource}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Outstanding Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: "TX-1045", amount: "$150", status: "Due in 2 days", entity: "PharmaPlus" },
                  { id: "TX-1048", amount: "$45", status: "Overdue", entity: "HealthCare Lab" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 text-xs">
                    <div>
                      <p className="font-bold">{item.entity}</p>
                      <p className="text-muted-foreground">ID: {item.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.amount}</p>
                      <p className={item.status === "Overdue" ? "text-destructive" : "text-amber-500"}>{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
