// @ts-nocheck
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
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pill, RefreshCw } from "lucide-react"

interface RefillRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prescription: unknown | null
}

export function RefillRequestDialog({ 
  open, 
  onOpenChange, 
  prescription 
}: RefillRequestDialogProps) {
  const { toast } = useToast()
  const [pharmacy, setPharmacy] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!prescription) return null

  const handleRequest = () => {
    if (!pharmacy) {
      toast({
        title: "Missing Information",
        description: "Please select a pharmacy for your refill.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onOpenChange(false)
      toast({
        title: "Feature Coming Soon",
        description: "The Pharmacy API integration is currently under development. Please check back later.",
        variant: "default"
      })
      setPharmacy("")
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Request Refill
          </DialogTitle>
          <DialogDescription>
            Submit a refill request for your active prescription.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="rounded-lg bg-muted/50 p-4 border border-border flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{prescription.name}</p>
              <p className="text-sm text-muted-foreground">{prescription.dosage} • {prescription.frequency}</p>
              <p className="text-xs text-muted-foreground mt-1">Prescribed by {prescription.doctor}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Preferred Pharmacy</label>
            <Select value={pharmacy} onValueChange={setPharmacy}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pharmacy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CVS Pharmacy - 123 Main St">CVS Pharmacy - 123 Main St</SelectItem>
                <SelectItem value="Walgreens - 456 Oak Ave">Walgreens - 456 Oak Ave</SelectItem>
                <SelectItem value="Rite Aid - 789 Elm Blvd">Rite Aid - 789 Elm Blvd</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border">
            Cancel
          </Button>
          <Button onClick={handleRequest} disabled={isSubmitting} className="bg-primary text-primary-foreground">
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
