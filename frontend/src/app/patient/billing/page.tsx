"use client"

import { useState } from "react"
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
} from "lucide-react"
import { PaymentDialog } from "@/components/patient/billing/payment-dialog"
import { useHospital } from "@/hooks/use-hospital"

const invoices = [
  {
    id: 1,
    date: "Jan 10, 2024",
    description: "Follow-up Cardiology Visit",
    provider: "Dr. Michael Chen",
    totalAmount: "$250.00",
    insurancePaid: "$205.00",
    patientDue: "$45.00",
    status: "Due",
    statusColor: "bg-amber-500/10 text-amber-600",
    dueDate: "Feb 10, 2024",
  },
  {
    id: 2,
    date: "Dec 20, 2023",
    description: "Lab Work - Lipid Panel & CBC",
    provider: "Central Lab Services",
    totalAmount: "$180.00",
    insurancePaid: "$160.00",
    patientDue: "$20.00",
    status: "Paid",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    dueDate: "Jan 20, 2024",
  },
  {
    id: 3,
    date: "Nov 15, 2023",
    description: "Annual Physical Examination",
    provider: "Dr. Emily Watson",
    totalAmount: "$350.00",
    insurancePaid: "$350.00",
    patientDue: "$0.00",
    status: "Covered",
    statusColor: "bg-blue-500/10 text-blue-600",
    dueDate: "N/A",
  },
  {
    id: 4,
    date: "Aug 22, 2023",
    description: "Emergency Visit - Chest Pain",
    provider: "City Emergency Center",
    totalAmount: "$1,200.00",
    insurancePaid: "$1,050.00",
    patientDue: "$150.00",
    status: "Paid",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    dueDate: "Sep 22, 2023",
  },
]

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

export default function BillingPage() {
  const { payment } = useHospital()
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  const handlePayNow = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsPaymentOpen(true)
  }

  const handlePaymentSuccess = () => {
    console.log("Payment successful for invoice:", selectedInvoice?.id)
  }

  const totalDue = invoices
    .filter((i) => i.status === "Due")
    .reduce((sum, i) => sum + parseFloat(i.patientDue.replace("$", "")), 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Insurance</h1>
        <p className="text-sm text-muted-foreground">
          View invoices, payments, and insurance details
        </p>
      </div>

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
              <p className="text-2xl font-bold text-card-foreground">$170.00</p>
              <p className="text-xs text-muted-foreground">Paid This Year</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">$1,765</p>
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
              <p className="text-2xl font-bold text-card-foreground">1</p>
              <p className="text-xs text-muted-foreground">Pending Claims</p>
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
          {invoices.map((invoice) => (
            <Card 
              key={invoice.id} 
              className="border border-border bg-card shadow-sm hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handlePayNow(invoice)}
            >
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-card-foreground">{invoice.description}</h3>
                        <Badge variant="secondary" className={`${invoice.statusColor} border-0 text-xs`}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{invoice.provider}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{invoice.date}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total: </span>
                          <span className="font-medium text-card-foreground">{invoice.totalAmount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Insurance: </span>
                          <span className="font-medium text-emerald-600">{invoice.insurancePaid}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">You Owe: </span>
                          <span className="font-bold text-card-foreground">{invoice.patientDue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {invoice.status === "Due" && (
                      <Button 
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={(e) => { e.stopPropagation(); handlePayNow(invoice); }}
                      >
                        Pay Now
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={(e) => { e.stopPropagation(); payment.handleAction('download_invoice', { id: invoice.id }); }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Provider</p>
                  <p className="font-medium text-card-foreground">{insuranceInfo.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium text-card-foreground">{insuranceInfo.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member ID</p>
                  <p className="font-medium text-card-foreground">{insuranceInfo.memberId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Group Number</p>
                  <p className="font-medium text-card-foreground">{insuranceInfo.groupNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="border border-border bg-muted/30">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Annual Deductible</p>
                    <p className="text-xl font-bold text-card-foreground mt-1">
                      {insuranceInfo.deductibleMet} / {insuranceInfo.deductible}
                    </p>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[55%] rounded-full bg-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">55% of deductible met</p>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-muted/30">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Out-of-Pocket Maximum</p>
                    <p className="text-xl font-bold text-card-foreground mt-1">
                      {insuranceInfo.outOfPocketUsed} / {insuranceInfo.outOfPocketMax}
                    </p>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[5%] rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">5% of max reached</p>
                  </CardContent>
                </Card>
              </div>
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
              <Card className="border border-border bg-muted/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-0">Default</Badge>
                </CardContent>
              </Card>

              <Button variant="outline" className="border-border text-foreground gap-2 w-fit">
                <CreditCard className="h-4 w-4" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PaymentDialog 
        invoice={selectedInvoice}
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
