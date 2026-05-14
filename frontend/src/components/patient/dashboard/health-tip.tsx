"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { useHealthGoals } from "@/hooks/use-health-goals"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

export function HealthTip() {
  const { goals, loading } = useHealthGoals()
  const router = useRouter()

  const tip = useMemo(() => {
    if (loading) return null;
    
    // Default tip
    let title = "Daily Health Maintenance"
    let description = "Based on your health profile, try taking a 10-minute walk after meals. This can help improve blood sugar control and support your cardiovascular health goals. Studies show post-meal walking can reduce blood sugar spikes by up to 15%."

    if (goals.length > 0) {
      const mainGoal = goals[0];
      const keyword = mainGoal.title.toLowerCase();
      
      if (keyword.includes('weight')) {
        title = "Weight Management Focus"
        description = `To help with "${mainGoal.title}", remember that hydration plays a key role in metabolism. Try drinking a glass of water before each meal to naturally manage portion sizes.`
      } else if (keyword.includes('heart') || keyword.includes('blood pressure')) {
        title = "Cardiovascular Health"
        description = `Supporting "${mainGoal.title}" starts with stress reduction. Try a 5-minute deep breathing exercise today to lower cortisol levels and positively impact blood pressure.`
      } else if (keyword.includes('sleep')) {
        title = "Sleep Optimization"
        description = `Working on "${mainGoal.title}"? Avoid screens for 30 minutes before bed. Blue light suppresses melatonin, which is essential for a restorative sleep cycle.`
      } else {
        title = `Focus: ${mainGoal.title}`
        description = `Consistency is key for your active goal. Break down your target into small, daily habits. Every minor choice compounds into significant health improvements over time.`
      }
    }

    return { title, description }
  }, [goals, loading])

  const handleGetMoreTips = () => {
    router.push(`/patient/ai-assistant?prompt=${encodeURIComponent("Give me 3 personalized health tips based on my current health profile and goals.")}`)
  }

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/10">
          <Sparkles className="h-6 w-6 text-violet-600" />
        </div>
        <div className="flex-1">
          {loading || !tip ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing health profile...
            </div>
          ) : (
            <>
              <h3 className="mb-1 font-semibold text-card-foreground">
                {tip.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tip.description}
              </p>
              <Button
                size="sm"
                onClick={handleGetMoreTips}
                className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Ask AI Analyst for More Tips
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
