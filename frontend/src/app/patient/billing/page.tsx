"use client"

import { useState, useEffect, useCallback } from "react"
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
  FileText,
  CalendarDays,
  Building2,
  Loader2,
} from "lucide-react"
import { managers } from "@/lib/hospital-core/Managers"
import { useAuth } from "@clerk/nextjs"
import { PaymentDialog } from "@/components/patient/dialogs/payment-dialog"
import { useUserProfile } from "@/hooks/use-user-profile"
import { format } from "date-fns"

export default function BillingPage() {
  const { getToken } = useAuth()
  const { profile, isLoading: isProfileLoading } = useUserProfile()
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = await getToken()
      const data = await managers.payment.getMyInvoices(token as string)
      setInvoices(data)
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
    } finally {
      setIsLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const totalDue = invoices
    .filter((i) => i.status === "Due")
    .reduce((sum, i) => sum + (i.patient_due || 0), 0)

  const totalPaid = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + (i.patient_due || 0), 0)

  const insuranceCovered = invoices.reduce((sum, i) => sum + (i.insurance_paid || 0), 0)

  const handlePayNow = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsPaymentDialogOpen(true)
  }

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Insurance</h1>
        <p className="text-sm text-muted-foreground">
          View invoices, payments, and insurance details
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">${totalDue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Amount Due</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">${totalPaid.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Paid Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">${insuranceCovered.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Insurance Covered</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{invoices.filter(i => i.status === 'Due').length}</p>
              <p className="text-xs text-muted-foreground">Outstanding Invoices</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4 flex flex-col gap-4">
          {invoices.length === 0 ? (
            <Card className="border border-dashed border-border bg-card p-12 flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground">No invoices found</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">
                You don't have any billing records yet. New invoices will appear here after your appointments.
              </p>
            </Card>
          ) : (
            invoices.map((invoice) => (
              <Card key={invoice.invoice_id} className="border border-border bg-card shadow-sm">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-card-foreground">
                            {invoice.description}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`border-0 text-xs ${
                              invoice.status === 'Due' ? 'bg-amber-500/10 text-amber-600' : 
                              invoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 
                              'bg-blue-500/10 text-blue-600'
                            }`}
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {invoice.provider}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>{invoice.date ? format(new Date(invoice.date), "MMM d, yyyy") : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total: </span>
                            <span className="font-medium text-card-foreground">${invoice.total_amount?.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Insurance: </span>
                            <span className="font-medium text-emerald-600">${invoice.insurance_paid?.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">You Owe: </span>
                            <span className="font-bold text-card-foreground">${invoice.patient_due?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {invoice.status === "Due" && (
                        <Button 
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => handlePayNow(invoice)}
                        >
                          Pay Now
                        </Button>
                      )}
                      <Button variant="outline" size="icon" className="border-border text-foreground">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="insurance" className="mt-4">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Insurance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {profile?.insurance_provider ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Provider</p>
                      <p className="font-medium text-card-foreground">{profile.insurance_provider}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Plan</p>
                      <p className="font-medium text-card-foreground">{profile.insurance_plan}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Member ID</p>
                      <p className="font-medium text-card-foreground">{profile.insurance_member_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Group Number</p>
                      <p className="font-medium text-card-foreground">{profile.insurance_group_number}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Card className="border border-border bg-muted/30">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Annual Deductible</p>
                        <p className="text-xl font-bold text-card-foreground mt-1">
                          ${profile.insurance_deductible_met?.toFixed(0)} / ${profile.insurance_deductible?.toFixed(0)}
                        </p>
                        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-primary transition-all duration-500" 
                            style={{ width: `${Math.min(100, (profile.insurance_deductible_met / profile.insurance_deductible) * 100 || 0)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((profile.insurance_deductible_met / profile.insurance_deductible) * 100 || 0)}% of deductible met
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border border-border bg-muted/30">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Out-of-Pocket Maximum</p>
                        <p className="text-xl font-bold text-card-foreground mt-1">
                          ${profile.insurance_out_of_pocket_used?.toFixed(0)} / ${profile.insurance_out_of_pocket_max?.toFixed(0)}
                        </p>
                        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                            style={{ width: `${Math.min(100, (profile.insurance_out_of_pocket_used / profile.insurance_out_of_pocket_max) * 100 || 0)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((profile.insurance_out_of_pocket_used / profile.insurance_out_of_pocket_max) * 100 || 0)}% of max reached
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No insurance information provided.</p>
                  <Button variant="outline" className="mt-4 border-border text-foreground">
                    Update Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground mb-2">
                Stored payment methods are coming soon. You can currently pay per-invoice using any credit card.
              </p>
              
              <Button variant="outline" className="border-border text-foreground gap-2 w-fit" disabled>
                <CreditCard className="h-4 w-4" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedInvoice && (
        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
          amount={selectedInvoice.patient_due}
          description={selectedInvoice.description}
          invoiceId={selectedInvoice.invoice_id}
          appointmentId={selectedInvoice.appointment_id}
          onSuccess={fetchInvoices}
        />
      )}
    </div>
  )
}
