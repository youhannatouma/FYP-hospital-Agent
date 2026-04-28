"use client"

import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

import { Heart, AlertTriangle, Apple, Bot, ChevronRight, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function AIHealthInsights() {
  const { toast } = useToast()
  const router = useRouter()

  const handleAnalystClick = () => {
    router.push("/patient/ai-assistant")
  }

  const handleInsightAction = (action: string) => {
    toast({
      title: "Action Initiated",
      description: `Preparing interface for: ${action}`,
    })
    router.push(`/patient/ai-assistant?prompt=${encodeURIComponent(`Help me with this health insight action: ${action}`)}`)
  }

  const insights = [
    {
      id: 1,
      title: "Cardiac Resonance",
      icon: Heart,
      iconBg: "bg-blue-500/10 text-blue-500",
      description: "Heart rate variability (HRV) is trending upward. This suggests improved aerobic fitness. Maintain current protocol.",
      tags: [{ label: "Optimal", color: "bg-emerald-500/10 text-emerald-500" }],
      action: "Review Sync",
    },
    {
      id: 2,
      title: "Lipid Trajectory",
      icon: AlertTriangle,
      iconBg: "bg-amber-500/10 text-amber-500",
      description: "Recent panel shows LDL at 165mg/dL. We suggest a dietary adjustment focusing on polyunsaturated fats.",
      tags: [{ label: "Action required", color: "bg-amber-500/10 text-amber-500" }],
      action: "View Strategy",
    },
    {
      id: 3,
      title: "Metabolic Focus",
      icon: Apple,
      iconBg: "bg-violet-500/10 text-violet-500",
      description: "Consider Mediterranean-style intermittent fasting to optimize glucose response patterns.",
      tags: [{ label: "Strategic", color: "bg-primary/10 text-primary" }],
      action: "Expand",
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <Badge variant="outline" className="border-amber-500/20 text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
            Generative Intelligence
          </Badge>
          <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
             <Sparkles className="h-6 w-6 text-amber-500" />
             Personalized Insights
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={handleAnalystClick} className="h-10 px-6 rounded-xl border border-dashed border-border/50 text-[10px] font-black uppercase tracking-widest hover:bg-muted/50 gap-2">
          <Bot className="h-4 w-4" />
          Interactive Analyst
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {insights.map((insight, idx) => (
            <m.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="premium-card p-6 rounded-[2rem] bg-card/30 border border-border/50 flex flex-col group hover:border-primary/20 transition-all duration-500 overflow-hidden relative"
            >
               <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className={cn("mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner-glow transition-transform duration-500 group-hover:scale-110", insight.iconBg)}>
                 <insight.icon className="h-7 w-7" />
               </div>

               <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground tracking-tight leading-tight uppercase underline decoration-primary/20 underline-offset-4">
                      {insight.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {insight.description}
                  </p>
               </div>

               <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/30">
                  <div className="flex gap-2">
                    {insight.tags.map((tag, i) => (
                      <Badge key={i} className={cn("border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg", tag.color)}>
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="link" size="sm" onClick={() => handleInsightAction(insight.action)} className="h-8 p-0 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 group-hover:underline-offset-4 gap-1">
                    {insight.action} <ChevronRight className="h-3 w-3" />
                  </Button>
               </div>
               
               <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
