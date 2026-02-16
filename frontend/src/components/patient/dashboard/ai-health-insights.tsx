"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, Heart, AlertTriangle, Apple, Bot } from "lucide-react"
import Link from "next/link"
import { HealthInsightDialog } from "@/components/patient/dashboard/dialogs/health-insight-dialog"

export function AIHealthInsights() {
  const [insights, setInsights] = React.useState([
    {
      id: 1,
      title: "Cardiovascular Health",
      icon: Heart,
      iconBg: "bg-blue-600",
      description:
        "Your blood pressure is well-controlled. Continue current medication regimen. Consider adding 30 minutes of cardio exercise 3x per week.",
      tags: [
        { label: "Good", color: "bg-emerald-500/10 text-emerald-600" },
      ],
      action: "Learn More",
    },
    {
      id: 2,
      title: "Cholesterol Management",
      icon: AlertTriangle,
      iconBg: "bg-amber-500",
      description:
        "LDL cholesterol is elevated. Discuss medication adjustment with your doctor. Focus on reducing saturated fats and increasing fiber intake.",
      tags: [
        { label: "Needs Attention", color: "bg-amber-500/10 text-amber-600" },
      ],
      action: "Learn More",
    },
    {
      id: 3,
      title: "Nutrition Guidance",
      icon: Apple,
      iconBg: "bg-violet-600",
      description:
        "Consider Mediterranean diet principles. Increase omega-3 fatty acids, reduce sodium intake to below 2000mg daily for optimal heart health.",
      tags: [
        { label: "Recommended", color: "bg-blue-500/10 text-blue-600" },
      ],
      action: "Learn More",
    },
  ])

  // API Endpoints Suggestion:
  // GET: /patient/health-insights -> Fetch AI-generated health insights for the patient
  /*
    React.useEffect(() => {
      const fetchInsights = async () => {
        try {
          // const response = await apiClient.get('/patient/health-insights');
          // setInsights(response.data);
        } catch (error) {
          console.error('Failed to fetch health insights', error);
        }
      };
      fetchInsights();
    }, []);
  */
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          AI Health Insights & Recommendations
        </h2>
        <Link href="/patient/ai-assistant">
          <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs">
            <Bot className="h-3 w-3" />
            Ask AI
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {insights.map((insight) => (
          <Card key={insight.id} className="border border-border bg-card shadow-sm">
            <CardContent className="p-4">
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${insight.iconBg}`}
              >
                <insight.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-card-foreground">
                {insight.title}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground leading-relaxed">
                {insight.description}
              </p>
              <div className="flex items-center gap-2">
                {insight.tags.map((tag, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className={`text-xs ${tag.color} border-0`}
                  >
                    {tag.label}
                  </Badge>
                ))}
                <HealthInsightDialog
                  title={insight.title}
                  description={insight.description}
                  icon={insight.icon}
                  iconBg={insight.iconBg}
                  tags={insight.tags}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
