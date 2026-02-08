"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Target, Plus } from "lucide-react"

const goals = [
  {
    id: 1,
    title: "Lower Cholesterol",
    target: "LDL below 130 mg/dL",
    current: "Current: 165 mg/dL",
    progress: 73,
    status: "In Progress",
    statusColor: "bg-amber-500/10 text-amber-600",
    targetDate: "Target Date: Mar 15, 2025",
    barColor: "[&>div]:bg-amber-500",
  },
  {
    id: 2,
    title: "Maintain Healthy Weight",
    target: "Target: 155 lbs",
    current: "Current: 158 lbs",
    progress: 85,
    status: "On Track",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    targetDate: "Target Date: Feb 28, 2025",
    barColor: "[&>div]:bg-emerald-500",
  },
  {
    id: 3,
    title: "Exercise 150 min/week",
    target: "This Week: 120 minutes",
    current: null,
    progress: 80,
    status: "Active",
    statusColor: "bg-primary/10 text-primary",
    targetDate: "80 minutes remaining this week",
    barColor: "[&>div]:bg-primary",
  },
]

export function HealthGoals() {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <Target className="h-5 w-5 text-emerald-500" />
          Health Goals
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs">
          <Plus className="h-3 w-3" />
          Add Goal
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="rounded-lg border border-border p-3"
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-sm font-semibold text-card-foreground">
                {goal.title}
              </h4>
              <Badge
                variant="secondary"
                className={`text-xs ${goal.statusColor} border-0`}
              >
                {goal.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{goal.target}</p>
            {goal.current && (
              <p className="text-xs text-muted-foreground">{goal.current}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Progress</span>
              <Progress
                value={goal.progress}
                className={`h-2 flex-1 bg-muted ${goal.barColor}`}
              />
              <span className="text-xs font-medium text-card-foreground">
                {goal.progress}%
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {goal.targetDate}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
