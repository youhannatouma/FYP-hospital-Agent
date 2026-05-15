"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { getServiceContainer } from "@/lib/services/service-container"
import type { Prescription } from "@/lib/services/repositories/prescription-repository"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, Pill } from "lucide-react"
import { toast } from "sonner"

export default function PharmacistDashboard() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const { isLoaded } = useAuth()

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const container = getServiceContainer()
      const data = await container.prescription.getAllPrescriptions()
      setPrescriptions(data)
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error)
      toast.error("Failed to load prescriptions")
    } finally {
      setLoading(false)
    }
  }

  const handleFulfill = async (id: string) => {
    try {
      const container = getServiceContainer()
      await container.prescription.fulfillPrescription(id)
      toast.success("Prescription fulfilled successfully")
      fetchPrescriptions()
    } catch (error) {
      console.error("Failed to fulfill prescription:", error)
      toast.error("Failed to fulfill prescription")
    }
  }

  useEffect(() => {
    if (isLoaded) {
      fetchPrescriptions()
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
          <h1 className="text-3xl font-black tracking-tight text-foreground">Pharmacy Hub</h1>
          <p className="text-muted-foreground font-medium mt-1">Manage and fulfill patient prescriptions</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner-glow">
          <Pill className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-6">
        {prescriptions.length === 0 ? (
          <Card className="premium-card rounded-[2rem] border-none shadow-premium bg-card/50 p-12 text-center">
            <p className="text-muted-foreground font-medium italic">No active prescriptions pending fulfillment.</p>
          </Card>
        ) : (
          prescriptions.map((p) => (
            <Card key={p.prescription_id} className="premium-card rounded-[2rem] border-none shadow-premium bg-card overflow-hidden hover:shadow-hover transition-all">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black tracking-widest uppercase">
                        Active
                      </Badge>
                      <span className="text-xs text-muted-foreground font-bold">Issued: {p.issue_date}</span>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-black text-foreground">Patient: {p.patient_name || "Unknown"}</h3>
                      <p className="text-sm text-muted-foreground font-medium">Prescribed by {p.doctor_name}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Medications</p>
                      <ul className="space-y-1">
                        {p.medications?.map((m, idx) => (
                          <li key={idx} className="text-sm font-bold text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Instructions</p>
                      <p className="text-sm font-medium text-foreground italic">{p.instructions}</p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end gap-3 min-w-[200px]">
                    <Button 
                      onClick={() => handleFulfill(p.prescription_id!)}
                      className="h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-premium"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Fulfill Order
                    </Button>
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
