"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
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
  const [stats, setStats] = useState<any[]>([]);
  const [doctorEarnings, setDoctorEarnings] = useState<any[]>([]);
  const [revenueBySource, setRevenueBySource] = useState<any[]>([]);
  const [outstandingPayments, setOutstandingPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchFinancialOverview = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/finance/overview`
        );
        setStats(response.data.stats || []);
        setDoctorEarnings(response.data.doctorEarnings || []);
        setRevenueBySource(response.data.revenueBySource || []);
        setOutstandingPayments(response.data.outstandingPayments || []);
      } catch (error) {
        console.error("Failed to fetch financial overview", error);
      }
    };
    fetchFinancialOverview();
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
            <CardTitle>Revenue vs. Earnings</CardTitle>
            <CardDescription>Daily comparison of total revenue and payouts to doctors</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={doctorEarnings}>
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
                {outstandingPayments.map((item, i) => (
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
