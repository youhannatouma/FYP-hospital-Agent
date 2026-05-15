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
import { Activity, Plus, Heart, Scale, Thermometer, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMedicalRecords } from "@/hooks/use-medical-records"

interface LogVitalsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function LogVitalsDialog({ open: controlledOpen, onOpenChange: setControlledOpen, trigger }: LogVitalsDialogProps) {
  const { toast } = useToast()
  const { createRecord } = useMedicalRecords()
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Form State
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [heartRate, setHeartRate] = useState("")
  const [weight, setWeight] = useState("")
  const [temperature, setTemperature] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (val: boolean) => {
    setControlledOpen?.(val)
    setInternalOpen(val)
  }
  
  const handleSave = async () => {
    if (!systolic && !heartRate && !weight && !temperature) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least one vital sign.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const recordData = {
        title: `Vitals Update - ${new Date().toLocaleDateString()}`,
        record_type: "Vitals",
        date: new Date().toISOString(),
        description: "Patient self-reported vitals update.",
        vitals: {
          systolic: systolic ? parseInt(systolic) : undefined,
          diastolic: diastolic ? parseInt(diastolic) : undefined,
          heart_rate: heartRate ? parseInt(heartRate) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          temperature: temperature ? parseFloat(temperature) : undefined
        }
      }

      const newRecord = await createRecord(recordData)

      if (newRecord) {
        toast({
          title: "Vitals Logged",
          description: "Your health metrics have been updated successfully.",
        })
        
        // Reset form
        setSystolic("")
        setDiastolic("")
        setHeartRate("")
        setWeight("")
        setTemperature("")
        setOpen(false)
      } else {
        throw new Error("Failed to create record")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not log vitals. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
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
               <Input 
                 id="systolic" 
                 placeholder="120" 
                 className="text-center" 
                 value={systolic}
                 onChange={(e) => setSystolic(e.target.value)}
                 type="number"
               />
               <span className="text-muted-foreground">/</span>
               <Input 
                 id="diastolic" 
                 placeholder="80" 
                 className="text-center" 
                 value={diastolic}
                 onChange={(e) => setDiastolic(e.target.value)}
                 type="number"
               />
               <span className="text-sm text-muted-foreground">mmHg</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="heart-rate" className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" /> Heart Rate
              </Label>
              <div className="relative">
                <Input 
                  id="heart-rate" 
                  placeholder="72" 
                  className="pr-10" 
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  type="number"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">bpm</span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-500" /> Weight
              </Label>
              <div className="relative">
                <Input 
                  id="weight" 
                  placeholder="150" 
                  className="pr-8" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  type="number"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">lbs</span>
              </div>
            </div>
          </div>
          
           <div className="grid gap-2">
              <Label htmlFor="temperature" className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-amber-500" /> Temperature
              </Label>
              <div className="relative">
                <Input 
                  id="temperature" 
                  placeholder="98.6" 
                  className="pr-8" 
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  type="number"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">°F</span>
              </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
