"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Heart, Apple, Dumbbell, Pill } from "lucide-react"
import Link from "next/link"
import { ArticleViewerDialog } from "./dialogs/article-viewer-dialog"
import { useHealthGoals } from "@/hooks/use-health-goals"

export function HealthEducation() {
  const { goals } = useHealthGoals()
  const [resources, setResources] = React.useState([
    {
      id: 1,
      title: "Managing Hypertension",
      description: "Learn about blood pressure control and lifestyle modifications.",
      icon: Heart,
      iconBg: "bg-primary",
      action: "Read Article",
    },
    {
      id: 2,
      title: "Heart-Healthy Diet",
      description: "Nutrition tips for cardiovascular wellness.",
      icon: Apple,
      iconBg: "bg-emerald-500",
      action: "Read Article",
    },
    {
      id: 3,
      title: "Exercise Guidelines",
      description: "Safe and effective workout routines for heart health.",
      icon: Dumbbell,
      iconBg: "bg-blue-500",
      action: "Read Article",
    },
    {
      id: 4,
      title: "Medication Guide",
      description: "Understanding your prescriptions and their effects.",
      icon: Pill,
      iconBg: "bg-amber-500",
      action: "Read Article",
    },
  ])


  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <BookOpen className="h-5 w-5 text-primary" />
          Health Education & Resources
        </h2>
        <Link
          href="#"
          className="text-sm text-primary hover:underline"
        >
          View All Resources
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${resource.iconBg}`}
              >
                <resource.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-card-foreground">
                {resource.title}
              </h3>
              <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                {resource.description}
              </p>
              <ArticleViewerDialog 
                article={{
                  title: resource.title,
                  category: "Health Education",
                  readTime: "5 min read",
                  content: `This is a comprehensive guide on ${resource.title}. \n\n${resource.description}\n\nTo manage this effectively, consider adopting a routine that aligns with your daily health goals. Consult your physician before making any major lifestyle changes.`
                }}
              >
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-xs text-primary"
                >
                  {resource.action}
                </Button>
              </ArticleViewerDialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
