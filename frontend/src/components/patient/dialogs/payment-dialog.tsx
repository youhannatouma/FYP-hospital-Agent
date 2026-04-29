"use client"

import React, { useState } from 'react'
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
import { CreditCard, Lock, Loader2, CheckCircle2 } from "lucide-react"
import { managers } from "@/lib/hospital-core/Managers"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"

interface PaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  description: string
  invoiceId?: string
  appointmentId?: string
  onSuccess?: () => void
}

export function PaymentDialog({
  isOpen,
  onClose,
  amount,
  description,
  invoiceId,
  appointmentId,
  onSuccess
}: PaymentDialogProps) {
  const { getToken } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const token = await getToken()
      
      // Simulate tokenization (e.g. Stripe.createToken)
      // In a real app, you'd use the Stripe SDK here.
      const paymentToken = "tok_visa_simulated_" + Math.random().toString(36).substring(7)

      const result = await managers.payment.processPayment(
        amount,
        appointmentId,
        invoiceId,
        paymentToken,
        token as string
      )

      if (result.success) {
        setIsSuccess(true)
        toast.success("Payment successful!")
        setTimeout(() => {
          setIsSuccess(false)
          onSuccess?.()
          onClose()
        }, 2000)
      } else {
        toast.error(result.message || "Payment failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("An error occurred during payment")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 animate-in zoom-in duration-300">
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Payment Complete</h2>
              <p className="text-muted-foreground mt-1">Thank you for your payment</p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="h-5 w-5 text-primary" />
                Complete Payment
              </DialogTitle>
              <DialogDescription>
                Secure payment for: <span className="font-medium text-foreground">{description}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted/30 p-4 rounded-xl border border-border/50 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-bold text-primary">${amount.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handlePayment} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Cardholder Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="card">Card Number</Label>
                <div className="relative">
                  <Input
                    id="card"
                    placeholder="0000 0000 0000 0000"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="bg-background border-border pl-10"
                  />
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    required
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2">
                <Lock className="h-3 w-3" />
                Payments are encrypted and secure. Powered by HospitalPay.
              </div>

              <DialogFooter className="mt-6">
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold" 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${amount.toFixed(2)}`
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
