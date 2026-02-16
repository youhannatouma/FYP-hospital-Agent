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
import { ShoppingCart, CreditCard, MapPin, Truck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OrderMedicineDialogProps {
  pharmacyName: string
  price: string
}

export function OrderMedicineDialog({ pharmacyName, price }: OrderMedicineDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)

  const handleOrder = () => {
    setStep(2) // Processing
    setTimeout(() => {
      setOpen(false)
      toast({
        title: "Order Placed Successfully",
        description: `Your order from ${pharmacyName} is being processed.`,
      })
      setTimeout(() => setStep(1), 500) // Reset
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Review Order</DialogTitle>
          <DialogDescription>
            Complete your purchase from {pharmacyName}.
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="py-4 space-y-4">
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>$2.99</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>${(parseFloat(price.replace('$', '')) + 2.99).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Delivery Address
              </h4>
              <p className="text-sm text-muted-foreground pl-6">
                123 Patient Lane, Apt 4B<br />
                Cityville, ST 12345
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment Method
              </h4>
              <p className="text-sm text-muted-foreground pl-6">
                Visa ending in 4242
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Processing payment...</p>
          </div>
        )}

        {step === 1 && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOrder} className="gap-2">
              <Truck className="h-4 w-4" />
              Place Order
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
