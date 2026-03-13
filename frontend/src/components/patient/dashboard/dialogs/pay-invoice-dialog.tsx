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
import { Label } from "@/components/ui/label"
import { CreditCard, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PayInvoiceDialogProps {
  amount?: string
  children: React.ReactNode
}

export function PayInvoiceDialog({ amount = "$45.00", children }: PayInvoiceDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handlePay = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setOpen(false)
      toast({
        title: "Payment Successful",
        description: `${amount} has been processed. A receipt has been emailed to you.`,
      })
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Pay Invoice</DialogTitle>
          <DialogDescription>
            Securely pay your medical bill online.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Amount Due</p>
            <p className="text-3xl font-bold text-foreground">{amount}</p>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="card">Card Number</Label>
              <div className="relative">
                <Input id="card" placeholder="•••• •••• •••• ••••" className="pr-10" />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="•••" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            256-bit SSL encrypted payment
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handlePay} disabled={processing} className="gap-2">
            {processing ? (
              <>
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay {amount}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
