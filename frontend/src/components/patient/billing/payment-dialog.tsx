"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react"

import { useDataStore } from "@/hooks/use-data-store"

interface PaymentDialogProps {
  invoice: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PaymentDialog({
  invoice,
  open,
  onOpenChange,
  onSuccess
}: PaymentDialogProps) {
  const { payInvoice } = useDataStore()
  const [step, setStep] = useState<"form" | "processing" | "success">("form")
  
  if (!invoice) return null

  const handlePay = () => {
    setStep("processing")
    
    // Actually update the DB
    payInvoice(invoice.id)

    // Simulate network delay for UX
    setTimeout(() => {
      setStep("success")
    }, 1500)
  }

  const handleClose = () => {
    onOpenChange(false)
    if (step === "success") {
      onSuccess()
    }
    // Reset for next time
    setTimeout(() => setStep("form"), 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Secure Payment</DialogTitle>
              <DialogDescription>
                Complete payment for: {invoice.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Total Patient Due:</span>
                <span className="text-2xl font-bold text-foreground">{invoice.patientDue}</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <div className="relative">
                    <Input 
                      id="card-number" 
                      placeholder="0000 0000 0000 0000" 
                      className="pl-10"
                    />
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM / YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="***" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] text-emerald-700 font-medium">
                  Your payment is secured with 256-bit encryption. No data is stored on our servers.
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-bold"
                onClick={handlePay}
              >
                Pay {invoice.patientDue}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "processing" && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-lg font-bold text-foreground">Processing Payment...</p>
            <p className="text-sm text-muted-foreground">Please do not close this window</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Your payment for <span className="text-foreground font-medium">{invoice.description}</span> has been processed.
            </p>
            <Button className="w-full max-w-[200px] mt-6" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
