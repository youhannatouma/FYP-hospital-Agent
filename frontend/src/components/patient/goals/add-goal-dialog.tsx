"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AddGoalDialog() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [goal, setGoal] = useState({
    type: "",
    target: "",
    deadline: ""
  })

  const handleAdd = () => {
    toast({
      title: "Goal Added",
      description: "Your new health goal has been created successfully.",
    })
    setOpen(false)
    setGoal({ type: "", target: "", deadline: "" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs">
          <Plus className="h-3 w-3" />
          Add Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Health Goal</DialogTitle>
          <DialogDescription>
            Set a target to improve your health and track your progress.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Goal Type</label>
            <Select 
              value={goal.type} 
              onValueChange={(val) => setGoal({ ...goal, type: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select goal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">Lose Weight</SelectItem>
                <SelectItem value="bp">Lower Blood Pressure</SelectItem>
                <SelectItem value="exercise">Increase Activity</SelectItem>
                <SelectItem value="sleep">Improve Sleep</SelectItem>
                <SelectItem value="water">Drink More Water</SelectItem>
                <SelectItem value="custom">Custom Goal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Value</label>
            <Input 
              placeholder="e.g., 150 lbs, 8 hours, 30 mins/day" 
              value={goal.target}
              onChange={(e) => setGoal({ ...goal, target: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Date</label>
            <Input 
              type="date" 
              value={goal.deadline}
              onChange={(e) => setGoal({ ...goal, deadline: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!goal.type || !goal.target}>
            Create Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
