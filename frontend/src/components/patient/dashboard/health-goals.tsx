"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Target, Plus, ChevronRight, Calculator } from "lucide-react"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function HealthGoals() {
  const goals = [
    {
      id: 1,
      title: "Lower Cholesterol",
      target: "LDL < 130 mg/dL",
      current: "165 mg/dL",
      progress: 73,
      status: "In Progress",
      statusColor: "bg-amber-500/10 text-amber-500",
      description: "Based on your last lipid panel, you're 73% towards your Q1 target.",
      accent: "amber",
    },
    {
      id: 2,
      title: "Weight Optimization",
      target: "155 lbs",
      current: "158 lbs",
      progress: 85,
      status: "On Track",
      statusColor: "bg-emerald-500/10 text-emerald-500",
      description: "Consistent progress. Reaching target weight will reduce cardiovascular strain.",
      accent: "emerald",
    },
    {
      id: 3,
      title: "Weekly Cardio",
      target: "150 min",
      current: "120 min",
      progress: 80,
      status: "Active",
      statusColor: "bg-primary/10 text-primary",
      description: "Only 30 minutes remaining to hit your weekly activity goal.",
      accent: "primary",
    },
  ]

  return (
    <Card className="premium-card rounded-[2.5rem] border-none shadow-premium bg-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
        <div>
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-foreground tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-inner-glow">
              <Target className="h-5 w-5" />
            </div>
            Health Milestones
          </CardTitle>
          <p className="text-sm text-muted-foreground font-medium mt-1">Strategic objectives for your wellbeing</p>
        </div>
        <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-border/50 font-black text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all gap-2">
          <Plus className="h-3 w-3" />
          New Goal
        </Button>
      </CardHeader>
      <CardContent className="p-8 pt-4 flex flex-col gap-6">
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {goals.map((goal, idx) => (
              <m.div
                key={goal.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                      {goal.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-medium max-w-[250px] leading-relaxed">
                      {goal.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-none", goal.statusColor)}>
                    {goal.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <div className="flex items-center gap-4">
                         <div className="flex flex-col">
                            <span className="opacity-50">Current</span>
                            <span className="text-foreground text-xs mt-0.5">{goal.current}</span>
                         </div>
                         <div className="w-px h-6 bg-border/50 mx-1" />
                         <div className="flex flex-col">
                            <span className="opacity-50">Target</span>
                            <span className="text-foreground text-xs mt-0.5">{goal.target}</span>
                         </div>
                      </div>
                      <span className="text-foreground text-xs">{goal.progress}%</span>
                   </div>
                   
                   <div className="relative h-3 w-full bg-muted/30 rounded-full overflow-hidden border border-border/30">
                      <m.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 1.5, delay: 0.5 + idx * 0.1, ease: "circOut" }}
                        className={cn(
                          "h-full rounded-full shadow-glow",
                          goal.accent === 'amber' ? "bg-amber-500 shadow-amber-500/20" : 
                          goal.accent === 'emerald' ? "bg-emerald-500 shadow-emerald-500/20" : 
                          "bg-primary shadow-primary/20"
                        )}
                      />
                   </div>
                </div>
                
                {idx !== goals.length - 1 && (
                  <div className="absolute -bottom-3 left-8 right-8 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
                )}
              </m.div>
            ))}
          </AnimatePresence>
        </div>

        <Button variant="ghost" className="w-full h-12 rounded-xl border border-dashed border-border/50 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all flex items-center justify-center gap-2 mt-2">
          <Calculator className="h-3 w-3" />
          Health Projections
          <ChevronRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
