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
import { ShoppingCart, Truck, Store } from "lucide-react"

interface PharmacyOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pharmacy: any | null
}

export function PharmacyOrderDialog({ 
  open, 
  onOpenChange, 
  pharmacy 
}: PharmacyOrderDialogProps) {
  const { toast } = useToast()
  const [method, setMethod] = useState("pickup")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!pharmacy) return null

  const handleOrder = () => {
    setIsSubmitting(true)

    // Mock API
    setTimeout(() => {
      setIsSubmitting(false)
      onOpenChange(false)
      toast({
        title: "Order Placed Successfully",
        description: `Your medications will be ready for ${method === "pickup" ? "pickup at" : "delivery from"} ${pharmacy.name}.`,
      })
      setMethod("pickup")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Order Medications
          </DialogTitle>
          <DialogDescription>
            Place your order through {pharmacy.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="rounded-lg bg-muted/50 p-4 border border-border flex items-start gap-4 justify-between">
            <div>
              <p className="font-semibold text-foreground">{pharmacy.name}</p>
              <p className="text-sm text-muted-foreground">{pharmacy.address}</p>
            </div>
            <p className="font-bold text-primary">{pharmacy.price}</p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Fulfillment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`border rounded-lg p-3 cursor-pointer flex flex-col items-center gap-2 transition-colors ${method === "pickup" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                onClick={() => setMethod("pickup")}
              >
                <Store className="h-6 w-6 text-foreground" />
                <span className="text-sm font-medium">Pickup</span>
              </div>
              <div 
                className={`border rounded-lg p-3 cursor-pointer flex flex-col items-center gap-2 transition-colors ${!pharmacy.deliveryAvailable ? "opacity-50 cursor-not-allowed" : method === "delivery" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                onClick={() => pharmacy.deliveryAvailable && setMethod("delivery")}
              >
                <Truck className="h-6 w-6 text-foreground" />
                <span className="text-sm font-medium">Delivery</span>
                {!pharmacy.deliveryAvailable && <span className="text-[10px] text-muted-foreground">Not Available</span>}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border">
            Cancel
          </Button>
          <Button onClick={handleOrder} disabled={isSubmitting} className="bg-primary text-primary-foreground">
            {isSubmitting ? "Processing..." : "Confirm Details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
