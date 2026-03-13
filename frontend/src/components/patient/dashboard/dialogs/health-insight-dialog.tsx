"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"

interface HealthInsightDialogProps {
  title: string
  description: string
  icon: LucideIcon
  iconBg: string
  tags: { label: string; color: string }[]
}

export function HealthInsightDialog({
  title,
  description,
  icon: Icon,
  iconBg,
  tags,
}: HealthInsightDialogProps) {
  const [open, setOpen] = useState(false)

  const tips: Record<string, string[]> = {
    "Cardiovascular Health": [
      "Walk at least 30 minutes, 5 days a week at moderate intensity.",
      "Include omega-3 rich foods like salmon, walnuts, and flaxseeds.",
      "Monitor your blood pressure daily and keep a log.",
      "Practice stress-reducing activities like deep breathing or meditation.",
    ],
    "Cholesterol Management": [
      "Limit saturated fats to less than 7% of daily calories.",
      "Increase soluble fiber intake (oats, beans, lentils).",
      "Consider plant sterols and stanols to lower LDL.",
      "Discuss statin therapy adjustments with your doctor.",
    ],
    "Nutrition Guidance": [
      "Follow the Mediterranean diet: olive oil, vegetables, whole grains.",
      "Keep sodium below 2000mg per day.",
      "Eat at least 5 servings of fruits and vegetables daily.",
      "Stay hydrated — aim for 8 glasses of water per day.",
    ],
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="ml-auto p-0 text-xs text-primary">
          Learn More
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

          <div className="flex gap-2">
            {tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className={`text-xs ${tag.color} border-0`}>
                {tag.label}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Recommended Actions</h4>
            <ul className="space-y-2">
              {(tips[title] || tips["Cardiovascular Health"]).map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
