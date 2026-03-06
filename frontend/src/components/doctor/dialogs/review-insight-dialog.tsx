"use client"
import { toast } from "@/hooks/use-toast"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  AlertCircle, 
  Users, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Calendar
} from "lucide-react"

interface InsightDetail {
  id: number
  title: string
  description: string
  category: string
  severity: "high" | "medium" | "low"
  impactedPatients?: string[]
  actionItems?: string[]
}

interface ReviewInsightDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  insight: InsightDetail | null
}

const severityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
}

export function ReviewInsightDialog({ open, onOpenChange, insight }: ReviewInsightDialogProps) {
  if (!insight) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-border bg-card shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Badge className={severityColors[insight.severity]}>
              {insight.category}
            </Badge>
            {insight.severity === "high" && (
              <Badge variant="outline" className="text-destructive border-destructive font-bold animate-pulse">
                PRIORITY ACTION REQUIRED
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl font-bold leading-tight tracking-tight text-foreground">
            {insight.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Summary */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border">
            <p className="text-sm text-foreground leading-relaxed">
              {insight.description}
            </p>
          </div>

          {/* Impacted Patients */}
          {insight.id === 1 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Users className="h-4 w-4 text-primary" />
                Flagged Patients (3)
              </h4>
              <div className="grid gap-2">
                {["John Doe", "Emily Davis", "Robert Brown"].map((name) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-sm font-medium text-foreground">{name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-primary" onClick={() => toast({ title: "Message Patient", description: `Opening secure message thread with ${name}` })}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-primary" onClick={() => toast({ title: "Schedule Consult", description: `Opening calendar for ${name}` })}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-primary" onClick={() => toast({ title: "View Record", description: `Navigating to ${name}'s full medical record` })}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Activity className="h-4 w-4 text-primary" />
              AI-Recommended Actions
            </h4>
            <div className="grid gap-2">
              {[
                "Schedule priority follow-up consultation",
                "Review latest laboratory results for inconsistencies",
                "Evaluate medication dosage adjustments"
              ].map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-emerald-900 font-medium">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Indicator (only for high risk) */}
          {insight.severity === "high" && (
            <div className="flex items-start gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-destructive">Clinical Warning</h5>
                <p className="text-xs text-destructive/80 mt-1 leading-relaxed">
                  These indicators suggest a 78% probability of a cardiovascular event within the next 6 months if left unmanaged.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-foreground">
            Save for Later
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={() => {
            toast({ title: "Actions Executed", description: "All recommended clinical actions have been initiated." });
            onOpenChange(false);
          }}>
            Execute Actions
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
