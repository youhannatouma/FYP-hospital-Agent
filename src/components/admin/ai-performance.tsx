"use client"

import * as React from "react"
import { Brain, Search, MessageSquare, ClipboardCheck, Zap, Star } from "lucide-react"
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
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

const engagementData = [
  { name: "Mon", chat: 450, checker: 210 },
  { name: "Tue", chat: 520, checker: 180 },
  { name: "Wed", chat: 480, checker: 250 },
  { name: "Thu", chat: 610, checker: 300 },
  { name: "Fri", chat: 550, checker: 280 },
  { name: "Sat", chat: 320, checker: 150 },
  { name: "Sun", chat: 250, checker: 120 },
]

const accuracyData = [
  { subject: "Symptom Analysis", A: 120, fullMark: 150 },
  { subject: "Doctor Matching", A: 98, fullMark: 150 },
  { subject: "Mental Health", A: 86, fullMark: 150 },
  { subject: "Treatment Info", A: 99, fullMark: 150 },
  { subject: "Query Speed", A: 145, fullMark: 150 },
]

const chartConfig = {
  chat: {
    label: "AI Chat",
    color: "hsl(var(--primary))",
  },
  checker: {
    label: "Symptom Checker",
    color: "hsl(var(--blue-500))",
  },
} satisfies ChartConfig

export function AIPerformance() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Matching Accuracy", value: "94.2%", change: "+1.5%", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "Avg. Chat Rating", value: "4.8/5", change: "+0.2", icon: Star, color: "text-primary", bg: "bg-primary/10" },
          { title: "Total AI Queries", value: "45,280", change: "+12%", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Screening Completion", value: "88%", change: "+5%", icon: ClipboardCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="text-emerald-500 text-xs font-bold">{stat.change}</div>
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
            <CardTitle>AI Engagement Trends</CardTitle>
            <CardDescription>Daily usage of AI Chat vs. Symptom Checker</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={engagementData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="chat" fill="var(--color-chat)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="checker" fill="var(--color-checker)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Performance Radar</CardTitle>
            <CardDescription>AI accuracy across different domains</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={{}} className="h-[300px] w-full">
              <RadarChart data={accuracyData} cx="50%" cy="50%" outerRadius="80%">
                <PolarGrid stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name="AI Accuracy"
                  dataKey="A"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Common AI Queries</CardTitle>
          <CardDescription>Most frequent topics patients ask the AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { text: "Flu Symptoms", size: "text-lg", weight: "font-bold", color: "text-primary" },
              { text: "Dermatologist Recommendations", size: "text-md", weight: "font-semibold", color: "text-blue-500" },
              { text: "Medication Side Effects", size: "text-sm", weight: "font-medium", color: "text-orange-500" },
              { text: "Mental Health Support", size: "text-lg", weight: "font-bold", color: "text-emerald-500" },
              { text: "Lab Result Meaning", size: "text-sm", weight: "font-medium", color: "text-muted-foreground" },
              { text: "Fever Treatment", size: "text-md", weight: "font-semibold", color: "text-amber-500" },
              { text: "Nutrition Advice", size: "text-sm", weight: "font-medium", color: "text-purple-500" },
              { text: "Diabetes Management", size: "text-md", weight: "font-semibold", color: "text-red-500" },
              { text: "Sleep Issues", size: "text-sm", weight: "font-medium", color: "text-blue-400" },
            ].map((query, i) => (
              <span key={i} className={`${query.size} ${query.weight} ${query.color} bg-muted/50 px-3 py-1 rounded-full cursor-default hover:bg-muted transition-colors`}>
                {query.text}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
