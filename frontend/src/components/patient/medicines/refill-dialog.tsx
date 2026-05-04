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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshCw, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RefillRequestDialogProps {
  medicationName: string
  prescriptionId: string
}

export function RefillRequestDialog({ medicationName, prescriptionId }: RefillRequestDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [pharmacy, setPharmacy] = useState<string>("")

  const handleRefill = () => {
    toast({
      title: "Refill Requested",
      description: `Refill request for ${medicationName} sent to selected pharmacy.`,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 text-white hover:bg-amber-600 gap-1.5 w-full sm:w-auto">
          <RefreshCw className="h-3.5 w-3.5" />
          Request Refill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Refill</DialogTitle>
          <DialogDescription>
            Select a pharmacy to send your refill request for {medicationName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Pharmacy</label>
            <Select value={pharmacy} onValueChange={setPharmacy}>
              <SelectTrigger>
                <SelectValue placeholder="Choose pharmacy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cvs-downtown">CVS Pharmacy - Downtown</SelectItem>
                <SelectItem value="walgreens-north">Walgreens - North Ave</SelectItem>
                <SelectItem value="health-plus">HealthPlus Pharmacy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {pharmacy && (
            <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5" />
              <span>
                {pharmacy === "cvs-downtown" && "123 Main St, Cityville"}
                {pharmacy === "walgreens-north" && "456 North Ave, Suburbia"}
                {pharmacy === "health-plus" && "789 Health Blvd, Medtown"}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRefill} disabled={!pharmacy}>
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
