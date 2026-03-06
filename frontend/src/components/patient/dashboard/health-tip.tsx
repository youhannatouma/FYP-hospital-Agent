"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function HealthTip() {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/10">
          <Sparkles className="h-6 w-6 text-violet-600" />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 font-semibold text-card-foreground">
            Personalized Health Tip of the Day
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Based on your health profile, try taking a 10-minute walk after meals. This can help improve blood sugar control and support your cardiovascular health goals. Studies show post-meal walking can reduce blood sugar spikes by up to 15%.
          </p>
          <Button
            size="sm"
            className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Get More Personalized Tips
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
