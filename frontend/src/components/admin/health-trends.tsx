"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  Thermometer,
  MapPin,
  TrendingUp,
  Search,
  Stethoscope,
} from "lucide-react";
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
  count: {
    label: "Search Volume",
    color: "hsl(var(--primary))",
  },
  cases: {
    label: "Potential Cases",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

export function HealthTrends() {
  const [stats, setStats] = useState<any[]>([]);
  const [symptomSearches, setSymptomSearches] = useState<any[]>([]);
  const [outbreakIndicators, setOutbreakIndicators] = useState<any[]>([]);
  const [regionalPatterns, setRegionalPatterns] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchHealthTrends = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/health/trends`,
        );
        if (!isMounted) return;
        setStats(response.data.stats || []);
        setSymptomSearches(response.data.symptomSearches || []);
        setOutbreakIndicators(response.data.outbreakIndicators || []);
        setRegionalPatterns(response.data.regionalPatterns || []);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch health trends", error);
      }
    };
    fetchHealthTrends();
    return () => {
      isMounted = false;
    };
  }, []);

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
                {stat.change !== "N/A" && (
                  <div className="text-emerald-500 text-xs font-bold">
                    {stat.change}
                  </div>
                )}
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
            <CardDescription>
              Most frequent symptom inquiries in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={symptomSearches}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="symptom"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Disease Outbreak Indicators</CardTitle>
            <CardDescription>
              Weekly tracking of flu-like symptom clusters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={outbreakIndicators}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
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
          <CardDescription>
            Health density and engagement by geographic region
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regionalPatterns.map((region, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{region.region}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p
                      className={`text-xs font-bold ${region.warning ? "text-destructive" : "text-emerald-500"}`}
                    >
                      {region.status}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Engagement Index: {region.engagement}
                    </p>
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
  );
}
