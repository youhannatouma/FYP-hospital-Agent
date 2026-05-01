"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Bookmark, Share2, ExternalLink, LucideIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ArticleViewerDialogProps {
  title: string
  description: string
  icon: LucideIcon
  iconBg: string
}

const articleContent: Record<string, string> = {
  "Managing Hypertension":
    "Hypertension (high blood pressure) affects nearly half of all adults. Lifestyle modifications include reducing sodium intake to less than 2,300mg/day, maintaining a healthy weight, engaging in regular physical activity (at least 150 minutes/week), limiting alcohol, and managing stress. Medication adherence is crucial — never stop taking prescribed BP medications without consulting your doctor.",
  "Heart-Healthy Diet":
    "The Mediterranean and DASH diets are scientifically proven to improve cardiovascular health. Focus on whole grains, lean proteins (fish, poultry), plenty of fruits and vegetables, healthy fats (olive oil, avocados, nuts), and limiting processed foods, red meat, and added sugars. Aim for at least 25-30g of fiber daily.",
  "Exercise Guidelines":
    "For your heart health, aim for at least 150 minutes of moderate-intensity aerobic exercise per week, such as brisk walking, cycling, or swimming. Include 2 days of muscle-strengthening activities. Start slow if you haven't been active, and always warm up for 5 minutes before exercising. Monitor your heart rate and stop if you feel dizzy or chest pain.",
  "Medication Guide":
    "Lisinopril (ACE inhibitor): Take once daily, ideally at the same time. May cause dry cough. Atorvastatin (statin): Take in the evening for best cholesterol-lowering effect. Report muscle pain. Aspirin (81mg): Take with food to reduce stomach irritation. Never take with other blood thinners without consulting your doctor.",
}

export function ArticleViewerDialog({ title, description, icon: Icon, iconBg }: ArticleViewerDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="p-0 text-xs text-primary">
          Read Article
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {articleContent[title] || "Detailed health education content for this topic is being prepared by our medical team."}
          </p>

          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
            <p className="text-xs font-medium text-primary mb-1">💡 Key Takeaway</p>
            <p className="text-sm text-muted-foreground">
              Small, consistent changes to your daily habits can significantly improve your long-term health outcomes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => toast({ title: "Saved", description: "Article bookmarked for later." })}
          >
            <Bookmark className="h-3 w-3" /> Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => toast({ title: "Shared", description: "Article link copied to clipboard." })}
          >
            <Share2 className="h-3 w-3" /> Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
