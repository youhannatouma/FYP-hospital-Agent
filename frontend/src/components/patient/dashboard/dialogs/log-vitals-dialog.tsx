"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

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
import { Label } from "@/components/ui/label"
import { Activity, Plus, Heart, Scale, Thermometer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LogVitalsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function LogVitalsDialog({ open: controlledOpen, onOpenChange: setControlledOpen, trigger }: LogVitalsDialogProps) {
  const { toast } = useToast()
  const [internalOpen, setInternalOpen] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (val: boolean) => {
    setControlledOpen?.(val)
    setInternalOpen(val)
  }
  
  const handleSave = () => {
    toast({
      title: "Vitals Logged",
      description: "Your health metrics have been updated successfully.",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1 border-primary/20 text-primary hover:bg-primary/5">
          <Plus className="h-3.5 w-3.5" />
          Log Vitals
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Health Metrics</DialogTitle>
          <DialogDescription>
            Record your daily vitals to track your health progress.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
             <Label htmlFor="bp" className="flex items-center gap-2">
               <Activity className="h-4 w-4 text-primary" /> Blood Pressure
             </Label>
             <div className="flex items-center gap-2">
               <Input id="systolic" placeholder="120" className="text-center" />
               <span className="text-muted-foreground">/</span>
               <Input id="diastolic" placeholder="80" className="text-center" />
               <span className="text-sm text-muted-foreground">mmHg</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="heart-rate" className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" /> Heart Rate
              </Label>
              <div className="relative">
                <Input id="heart-rate" placeholder="72" className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">bpm</span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-500" /> Weight
              </Label>
              <div className="relative">
                <Input id="weight" placeholder="150" className="pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">lbs</span>
              </div>
            </div>
          </div>
          
           <div className="grid gap-2">
              <Label htmlFor="temperature" className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-amber-500" /> Temperature
              </Label>
              <div className="relative">
                <Input id="temperature" placeholder="98.6" className="pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">°F</span>
              </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
