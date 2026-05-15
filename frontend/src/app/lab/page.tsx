"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { getServiceContainer } from "@/lib/services/service-container"
import type { MedicalRecord } from "@/lib/services/repositories/medical-record-repository"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Beaker, FileUp, ClipboardList } from "lucide-react"
import { toast } from "sonner"

export default function LabDashboard() {
  const [orders, setOrders] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { isLoaded } = useAuth()

  // Form state for result upload
  const [selectedOrder, setSelectedOrder] = useState<MedicalRecord | null>(null)
  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const container = getServiceContainer()
      const data = await container.medicalRecord.getPendingLabOrders()
      setOrders(data)
    } catch (error) {
      console.error("Failed to fetch lab orders:", error)
      toast.error("Failed to load lab orders")
    } finally {
      setLoading(false)
    }
  }

  const handleUploadResult = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return

    try {
      setSubmitting(true)
      const container = getServiceContainer()
      await container.medicalRecord.createRecord({
        patient_id: selectedOrder.patient_id,
        record_type: "Lab Result",
        title: `Results for: ${selectedOrder.title}`,
        diagnosis: diagnosis,
        description: notes,
        date: new Date().toISOString(),
        appointment_id: selectedOrder.appointment_id ? String(selectedOrder.appointment_id) : undefined
      })
      
      toast.success("Lab results uploaded successfully")
      setIsDialogOpen(false)
      fetchOrders()
      // Reset form
      setDiagnosis("")
      setNotes("")
    } catch (error) {
      console.error("Failed to upload lab results:", error)
      toast.error("Failed to upload lab results")
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (isLoaded) {
      fetchOrders()
    }
  }, [isLoaded])

  if (!isLoaded || loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Diagnostic Lab</h1>
          <p className="text-muted-foreground font-medium mt-1">Process pending lab orders and upload findings</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner-glow">
          <Beaker className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-6">
        {orders.length === 0 ? (
          <Card className="premium-card rounded-[2rem] border-none shadow-premium bg-card/50 p-12 text-center">
            <p className="text-muted-foreground font-medium italic">No pending lab orders found.</p>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.record_id} className="premium-card rounded-[2rem] border-none shadow-premium bg-card overflow-hidden hover:shadow-hover transition-all">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-amber-500/10 text-amber-500 border-none text-[10px] font-black tracking-widest uppercase">
                        Pending
                      </Badge>
                      <span className="text-xs text-muted-foreground font-bold">Requested: {new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-black text-foreground">{order.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium">Patient: {order.patient_name} | Ordered by {order.doctor_name}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Clinical Instructions</p>
                      <p className="text-sm font-medium text-foreground">{order.clinical_notes || "No specific instructions provided."}</p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end gap-3 min-w-[200px]">
                    <Dialog open={isDialogOpen && selectedOrder?.record_id === order.record_id} onOpenChange={(open) => {
                      setIsDialogOpen(open)
                      if (open) setSelectedOrder(order)
                    }}>
                      <DialogTrigger asChild>
                        <Button className="h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-premium bg-indigo-600 hover:bg-indigo-700">
                          <FileUp className="mr-2 h-4 w-4" />
                          Upload Results
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-2">
                            <ClipboardList className="h-6 w-6 text-indigo-500" />
                            Submit Lab Findings
                          </DialogTitle>
                        </DialogHeader>
                        
                        <form onSubmit={handleUploadResult} className="space-y-6 mt-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Main Finding / Diagnosis</label>
                            <Input 
                              placeholder="e.g., Vitamin D Deficiency (18 ng/mL)" 
                              value={diagnosis}
                              onChange={(e) => setDiagnosis(e.target.value)}
                              className="h-12 rounded-xl bg-muted/50 border-border/50 font-medium"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detailed Notes</label>
                            <Textarea 
                              placeholder="Enter full lab report details here..." 
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="min-h-[120px] rounded-xl bg-muted/50 border-border/50 font-medium p-4"
                              required
                            />
                          </div>

                          <DialogFooter>
                            <Button 
                              type="submit" 
                              disabled={submitting}
                              className="h-12 w-full rounded-xl font-black text-xs uppercase tracking-widest shadow-premium bg-indigo-600 hover:bg-indigo-700 mt-2"
                            >
                              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Results to Patient File"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
