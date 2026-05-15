"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Target, Loader2 } from "lucide-react"

interface NewGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: any) => Promise<void>
}

export function NewGoalDialog({ open, onOpenChange, onAdd }: NewGoalDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_value: "",
    current_value: "",
    category: "Other",
    target_date: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await onAdd(formData)
      onOpenChange(false)
      setFormData({
        title: "",
        description: "",
        target_value: "",
        current_value: "",
        category: "Other",
        target_date: ""
      })
    } catch (error) {
      console.error("Failed to add goal:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-premium bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-foreground tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-inner-glow">
              <Target className="h-5 w-5" />
            </div>
            Define New Milestone
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">
            Set strategic health objectives for your wellness journey.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Goal Title</Label>
              <Input
                id="title"
                placeholder="e.g., Lower Cholesterol"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="rounded-xl border-border/50 bg-muted/30 font-bold"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger className="rounded-xl border-border/50 bg-muted/30 font-bold">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50">
                  <SelectItem value="Weight">Weight Management</SelectItem>
                  <SelectItem value="Cardio">Cardiovascular Activity</SelectItem>
                  <SelectItem value="Lipids">Lipid Optimization</SelectItem>
                  <SelectItem value="Nutrition">Nutritional Goals</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current State</Label>
                <Input
                  id="current"
                  placeholder="e.g., 165 mg/dL"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                  className="rounded-xl border-border/50 bg-muted/30 font-bold"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Objective</Label>
                <Input
                  id="target"
                  placeholder="e.g., < 130 mg/dL"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  required
                  className="rounded-xl border-border/50 bg-muted/30 font-bold"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="target_date" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Date</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="rounded-xl border-border/50 bg-muted/30 font-bold"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Clinical Rationale</Label>
              <Textarea
                id="description"
                placeholder="Describe why this goal is important for your health..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl border-border/50 bg-muted/30 font-medium min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-xl font-black text-xs uppercase tracking-widest h-12 shadow-glow bg-primary text-white hover:bg-primary/90 transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Establish Milestone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
