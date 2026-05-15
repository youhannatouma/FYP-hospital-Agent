"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Brain,
  Search,
  MessageSquare,
  ClipboardCheck,
  Zap,
  Star,
} from "lucide-react";
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
  chat: {
    label: "AI Chat",
    color: "hsl(var(--primary))",
  },
  checker: {
    label: "Symptom Checker",
    color: "hsl(var(--blue-500))",
  },
} satisfies ChartConfig;

export function AIPerformance() {
  const [engagement, setEngagement] = useState<any[]>([]);
  const [accuracy, setAccuracy] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [commonQueries, setCommonQueries] = useState<any[]>([]);

  useEffect(() => {
    const fetchAIPerformance = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/ai/metrics`,
        );
        setEngagement(response.data.engagement || []);
        setAccuracy(response.data.accuracy || []);
        setStats(response.data.stats || []);
        setCommonQueries(response.data.commonQueries || []);
      } catch (error) {
        console.error("Failed to fetch AI performance", error);
      }
    };
    fetchAIPerformance();
  }, []);

  // API Endpoints Suggestion:
  // GET: /admin/ai/metrics -> Fetch engagement, accuracy, and stats
  // GET: /admin/ai/queries -> Fetch common AI queries
  /*
    useEffect(() => {
      const fetchAIPerformance = async () => {
        try {
          const response = await apiClient.get('/admin/ai/metrics');
          // setEngagement(response.data.engagement);
          // setAccuracy(response.data.accuracy);
          // setStats(response.data.stats);
        } catch (error) {
          console.error('Failed to fetch AI performance', error);
        }
      };
      
      const fetchQueries = async () => {
        try {
          const response = await apiClient.get('/admin/ai/queries');
          // setCommonQueries(response.data);
        } catch (error) {
          console.error('Failed to fetch queries', error);
        }
      }

      fetchAIPerformance();
      fetchQueries();
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
                <div className="text-emerald-500 text-xs font-bold">
                  {stat.change}
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
            <CardTitle>AI Engagement Trends</CardTitle>
            <CardDescription>
              Daily usage of AI Chat vs. Symptom Checker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={engagement}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="chat"
                  fill="var(--color-chat)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="checker"
                  fill="var(--color-checker)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Performance Radar</CardTitle>
            <CardDescription>
              AI accuracy across different domains
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={{}} className="h-[300px] w-full">
              <RadarChart data={accuracy} cx="50%" cy="50%" outerRadius="80%">
                <PolarGrid
                  stroke="hsl(var(--muted-foreground))"
                  opacity={0.2}
                />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 150]}
                  tick={false}
                  axisLine={false}
                />
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
          <CardDescription>
            Most frequent topics patients ask the AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {commonQueries.map((query, i) => (
              <span
                key={i}
                className={`${query.size} ${query.weight} ${query.color} bg-muted/50 px-3 py-1 rounded-full cursor-default hover:bg-muted transition-colors`}
              >
                {query.text}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
