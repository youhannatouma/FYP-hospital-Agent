"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FlaskConical, Loader2, Plus, Trash2, Send } from "lucide-react"
import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export function LabManagement() {
  const { medicalRecords } = useHospital()
  const { getToken } = useAuth()
  const { toast } = useToast()
  
  const [orders, setOrders] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedOrder, setSelectedOrder] = React.useState<any | null>(null)
  const [isSubmitOpen, setIsSubmitOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Biomarker rows for the current result submission
  const [biomarkers, setBiomarkers] = React.useState<any[]>([
    { name: "", value: "", unit: "", range: "", trend: "stable", flag: "" }
  ])

  const fetchOrders = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const token = await getToken()
      const data = await medicalRecords.getPendingLabOrders(token || undefined)
      setOrders(data || [])
    } catch (err) {
      console.error("Failed to fetch lab orders:", err)
    } finally {
      setIsLoading(false)
    }
  }, [medicalRecords, getToken])

  React.useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleOpenSubmit = (order: any) => {
    setSelectedOrder(order)
    setBiomarkers([{ name: "", value: "", unit: "", range: "", trend: "stable", flag: "" }])
    setIsSubmitOpen(true)
  }

  const addBiomarker = () => {
    setBiomarkers([...biomarkers, { name: "", value: "", unit: "", range: "", trend: "stable", flag: "" }])
  }

  const removeBiomarker = (index: number) => {
    setBiomarkers(biomarkers.filter((_, i) => i !== index))
  }

  const updateBiomarker = (index: number, field: string, value: string) => {
    const updated = [...biomarkers]
    updated[index][field] = value
    setBiomarkers(updated)
  }

  const handleSubmitResults = async () => {
    if (!selectedOrder) return
    
    setIsSubmitting(true)
    try {
      const token = await getToken()
      // Structure: { testName, biomarkers: [...] }
      const finalResults = {
        testName: selectedOrder.diagnosis,
        collectedDate: format(new Date(), "MMM d, yyyy"),
        biomarkers: biomarkers.filter(b => b.name && b.value)
      }
      
      await medicalRecords.submitLabResults(selectedOrder.record_id, finalResults, token || undefined)
      
      toast({
        title: "Results Published",
        description: `Laboratory results for ${selectedOrder.patient_name} have been updated.`,
      })
      setIsSubmitOpen(false)
      fetchOrders()
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: "Could not upload results. Please check your connection.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              Pending Laboratory Requests
            </CardTitle>
            <Badge variant="secondary" className="font-bold">
              {orders.length} Orders
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Synchronizing Queue...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground italic font-medium">
              No pending laboratory orders identified.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/30">
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest pl-8">Patient</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest">Ordered Lab</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest">Request Date</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest">Doctor</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.record_id} className="hover:bg-primary/5 transition-colors border-border/30">
                    <TableCell className="font-bold text-sm pl-8">{order.patient_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{order.diagnosis}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{order.clinical_notes}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {order.created_at ? format(new Date(order.created_at), "MMM d, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-muted-foreground">
                      Dr. {order.doctor_name || "Staff"}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button 
                        size="sm" 
                        className="rounded-xl h-9 bg-primary hover:bg-primary/90 font-bold text-[10px] uppercase tracking-widest"
                        onClick={() => handleOpenSubmit(order)}
                      >
                        Submit Results
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Result Submission Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-primary text-primary-foreground">
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <FlaskConical className="h-6 w-6" />
              Upload Lab Findings
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/70 font-medium">
              Entering results for <strong>{selectedOrder?.diagnosis}</strong> • Patient: <strong>{selectedOrder?.patient_name}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-8 pt-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <div className="col-span-4">Biomarker Name</div>
                <div className="col-span-2">Value</div>
                <div className="col-span-2">Unit</div>
                <div className="col-span-3">Ref. Range</div>
                <div className="col-span-1"></div>
              </div>

              {biomarkers.map((b, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-4">
                    <Input 
                      placeholder="e.g. Total Cholesterol" 
                      className="rounded-xl"
                      value={b.name}
                      onChange={(e) => updateBiomarker(idx, "name", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      placeholder="Value" 
                      className="rounded-xl font-bold"
                      value={b.value}
                      onChange={(e) => updateBiomarker(idx, "value", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      placeholder="mg/dL" 
                      className="rounded-xl"
                      value={b.unit}
                      onChange={(e) => updateBiomarker(idx, "unit", e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input 
                      placeholder="< 200" 
                      className="rounded-xl text-xs"
                      value={b.range}
                      onChange={(e) => updateBiomarker(idx, "range", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10 h-10 w-10 rounded-xl"
                      onClick={() => removeBiomarker(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full h-12 rounded-2xl border-dashed border-primary/30 text-primary hover:bg-primary/5 font-bold uppercase tracking-widest text-[10px]"
              onClick={addBiomarker}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Measurement Row
            </Button>
          </div>

          <DialogFooter className="p-8 bg-muted/30 border-t border-border/50">
            <Button 
              variant="outline" 
              onClick={() => setIsSubmitOpen(false)}
              className="rounded-2xl h-12 px-8 font-bold uppercase tracking-widest text-[10px]"
            >
              Cancel
            </Button>
            <Button 
              disabled={isSubmitting || biomarkers.every(b => !b.name)}
              onClick={handleSubmitResults}
              className="rounded-2xl h-12 px-8 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-glow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Commit Findings
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
