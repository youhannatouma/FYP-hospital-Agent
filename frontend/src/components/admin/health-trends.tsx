"use client"

import * as React from "react"
import { Activity, Thermometer, MapPin, TrendingUp, Search, Stethoscope } from "lucide-react"
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
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

const symptomSearchData = [
  { symptom: "Chest Pain", count: 450 },
  { symptom: "Fever", count: 850 },
  { symptom: "Headache", count: 650 },
  { symptom: "Sore Throat", count: 400 },
  { symptom: "Skin Rash", count: 300 },
]

const specializationData = [
  { spec: "Cardiology", score: 85 },
  { spec: "Dermatology", score: 72 },
  { spec: "Pediatrics", score: 90 },
  { spec: "Neurology", score: 65 },
  { spec: "Psychiatry", score: 80 },
]

const outbreakIndicatorData = [
  { week: "W1", cases: 120 },
  { week: "W2", cases: 150 },
  { week: "W3", cases: 280 }, // Spike
  { week: "W4", cases: 210 },
  { week: "W5", cases: 180 },
]

const chartConfig = {
  count: {
    label: "Search Volume",
    color: "hsl(var(--primary))",
  },
  cases: {
    label: "Potential Cases",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

export function HealthTrends() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Symptom Spikes", value: "2 Detected", change: "+1", icon: Thermometer, color: "text-destructive", bg: "bg-destructive/10" },
          { title: "Health Index", value: "82/100", change: "+2", icon: Activity, color: "text-primary", bg: "bg-primary/10" },
          { title: "Top Region", value: "Dubai South", change: "N/A", icon: MapPin, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Consultations", value: "2,450", change: "+15%", icon: Stethoscope, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                {stat.change !== "N/A" && <div className="text-emerald-500 text-xs font-bold">{stat.change}</div>}
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
            <CardTitle>Top Searched Symptoms</CardTitle>
            <CardDescription>Most frequent symptom inquiries in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={symptomSearchData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="symptom" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Disease Outbreak Indicators</CardTitle>
            <CardDescription>Weekly tracking of flu-like symptom clusters</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={outbreakIndicatorData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="cases"
                  stroke="var(--color-cases)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-cases)" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Regional Health Patterns</CardTitle>
          <CardDescription>Health density and engagement by geographic region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { region: "Dubai Marina", engagement: 88, status: "Healthy" },
              { region: "Deira", engagement: 65, status: "Spike Detected", warning: true },
              { region: "Downtown Dubai", engagement: 92, status: "Healthy" },
              { region: "Business Bay", engagement: 74, status: "Healthy" },
            ].map((region, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{region.region}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-xs font-bold ${region.warning ? "text-destructive" : "text-emerald-500"}`}>
                      {region.status}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Engagement Index: {region.engagement}</p>
                  </div>
                  <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${region.warning ? "bg-destructive" : "bg-primary"}`}
                      style={{ width: `${region.engagement}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
