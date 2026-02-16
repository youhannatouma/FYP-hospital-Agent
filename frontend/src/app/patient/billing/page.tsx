"use client"

import { useState } from "react"
import { useDataStore } from "@/hooks/use-data-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Download,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CalendarDays,
  Building2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PaymentDialog } from "@/components/patient/billing/payment-dialog"

export default function BillingPage() {
  const { toast } = useToast()
  const { getInvoicesByPatient } = useDataStore()
  const invoices = getInvoicesByPatient("pat-1")
  
  const [paymentInvoice, setPaymentInvoice] = useState<any | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  
  const totalDue = invoices
    .filter((i) => i.status === "Pending" || i.status === "Overdue")
    .reduce((sum, i) => sum + i.amount, 0)
    
  const totalPaid = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + i.amount, 0)

  const insuranceTotal = 0 // MockDatabase Invoice doesn't have insurancePaid yet

  const insuranceInfo = {
    provider: "BlueCross BlueShield",
    plan: "Premium Health Plus",
    memberId: "BCB-4521-8837",
    groupNumber: "GRP-1842",
    deductible: "$1,500",
    deductibleMet: "$820",
    outOfPocketMax: "$5,000",
    outOfPocketUsed: "$235",
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-500/10 text-amber-600'
      case 'Overdue': return 'bg-red-500/10 text-red-600'
      case 'Paid': return 'bg-emerald-500/10 text-emerald-600'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Insurance</h1>
        <p className="text-sm text-muted-foreground">
          View invoices, clinical claims, and insurance benefits
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="border border-border bg-card shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">${totalDue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Amount Due</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">${totalPaid.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Paid YTD</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">${insuranceTotal.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ins. Covered</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">3</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Claims</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="invoices" className="data-[state=active]:bg-card shadow-sm">Invoices</TabsTrigger>
          <TabsTrigger value="insurance" className="data-[state=active]:bg-card shadow-sm">Insurance</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-card shadow-sm">Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4 flex flex-col gap-4">
          {invoices.length === 0 ? (
            <div className="py-20 text-center bg-card rounded-xl border border-dashed">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold">No Invoices Found</h3>
              <p className="text-sm text-muted-foreground">Your billing history will appear here.</p>
            </div>
          ) : (
            invoices.map((invoice) => (
              <Card key={invoice.id} className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-card-foreground">
                            {invoice.description}
                          </h3>
                          <Badge variant="secondary" className={`${getStatusColor(invoice.status)} border-0 text-[10px] font-bold px-2`}>
                            {invoice.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {invoice.provider || 'Care Medical Group'}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-muted-foreground uppercase tracking-tight">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>Billed: {invoice.date}</span>
                          </div>
                          {(invoice.status === 'Pending' || invoice.status === 'Overdue') && (
                            <div className="flex items-center gap-1.5 text-amber-600">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Due: {invoice.dueDate || 'Next Month'}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-6 p-3 rounded-lg bg-muted/30">
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Amount</span>
                            <span className="font-bold text-card-foreground">${invoice.amount.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Insurance Paid</span>
                            <span className="font-bold text-emerald-600">$0.00</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Patient Liability</span>
                            <span className="font-extrabold text-primary">${invoice.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(invoice.status === "Pending" || invoice.status === "Overdue") && (
                        <Button
                          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-sm"
                          onClick={() => setPaymentInvoice(invoice)}
                        >
                          Pay Outstanding
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-border text-foreground hover:bg-accent"
                        disabled={downloadingId === invoice.id}
                        onClick={() => {
                          setDownloadingId(invoice.id)
                          setTimeout(() => {
                            setDownloadingId(null)
                            toast({
                              title: "Download Complete",
                              description: `Invoice for ${invoice.description} saved as PDF.`,
                            })
                          }, 1000)
                        }}
                      >
                        {downloadingId === invoice.id ? (
                          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="insurance" className="mt-4">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Benefit Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 pt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Provider</p>
                  <p className="text-lg font-bold text-card-foreground">{insuranceInfo.provider}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Plan Type</p>
                  <p className="text-lg font-bold text-card-foreground">{insuranceInfo.plan}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Member ID</p>
                  <p className="text-lg font-mono font-bold text-card-foreground">{insuranceInfo.memberId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Group Number</p>
                  <p className="text-lg font-mono font-bold text-card-foreground">{insuranceInfo.groupNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="border border-border bg-muted/30 shadow-inner">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground font-bold uppercase">Deductible Tracker</p>
                    <p className="text-2xl font-black text-card-foreground mt-1">
                      {insuranceInfo.deductibleMet} <span className="text-sm font-normal text-muted-foreground">/ {insuranceInfo.deductible}</span>
                    </p>
                    <div className="mt-3 h-3 rounded-full bg-muted overflow-hidden border">
                      <div className="h-full w-[55%] rounded-full bg-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">55% of annual deductible met</p>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-muted/30 shadow-inner">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground font-bold uppercase">Max Out-of-Pocket</p>
                    <p className="text-2xl font-black text-card-foreground mt-1">
                      {insuranceInfo.outOfPocketUsed} <span className="text-sm font-normal text-muted-foreground">/ {insuranceInfo.outOfPocketMax}</span>
                    </p>
                    <div className="mt-3 h-3 rounded-full bg-muted overflow-hidden border">
                      <div className="h-full w-[5%] rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">5% of yearly max reached</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Wallet & Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-6">
              <Card className="border border-border bg-muted/30 hover:border-primary/30 transition-colors cursor-pointer group">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-card-foreground">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground font-medium">Primary Method • Expires 12/2025</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-0 font-bold px-3">DEFAULT</Badge>
                </CardContent>
              </Card>

              <Button
                variant="outline"
                className="border-dashed border-2 hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary gap-2 w-full py-8 text-lg font-bold transition-all"
                onClick={() => {
                  toast({
                    title: "Security Gateway",
                    description: "Opening secure portal for payment setup...",
                  })
                }}
              >
                <CreditCard className="h-5 w-5" />
                ADD NEW PAYMENT METHOD
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PaymentDialog
        invoice={paymentInvoice}
        open={!!paymentInvoice}
        onOpenChange={(open) => { if (!open) setPaymentInvoice(null) }}
        onSuccess={() => {
          setPaymentInvoice(null)
          toast({
            title: "Transaction Finalized",
            description: "Your payment has been successfully recorded in the clinical system.",
          })
        }}
      />
    </div>
  )
}
