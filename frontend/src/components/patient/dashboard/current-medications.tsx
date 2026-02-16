"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pill, RefreshCw, Trash2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { RefillRequestDialog } from "@/components/patient/medicines/refill-dialog"
import { useDataStore } from "@/hooks/use-data-store"

export function CurrentMedications() {
  const { prescriptions } = useDataStore()

  const activeMedications = prescriptions
    .filter(p => p.status === 'Active')
    .slice(0, 3)

  return (
    <Card className="border-sidebar-border bg-card/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Pill className="h-5 w-5 text-amber-500" />
          Active Prescriptions
        </CardTitle>
        <Link href="/patient/medicines" className="text-xs font-bold text-primary hover:underline">
          View Pharmacy
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {activeMedications.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm border-2 border-dashed border-muted rounded-xl">
             No active prescriptions found in your chart.
          </div>
        ) : (
          activeMedications.map((med) => {
            const primaryMed = med.medicines[0] || { name: "Unknown Medicine", dosage: "N/A", frequency: "N/A" }
            return (
              <div
                key={med.id}
                className="rounded-xl border border-sidebar-border bg-background p-4 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {primaryMed.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Prescription</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-none rounded-lg text-xs"
                  >
                    {med.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <div>
                    <span className="block opacity-40">Dosage</span>
                    <span className="text-xs font-bold text-foreground">{primaryMed.dosage}</span>
                  </div>
                  <div>
                    <span className="block opacity-40">Frequency</span>
                    <span className="text-xs font-bold text-foreground">{primaryMed.frequency}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-sidebar-border">
                  <RefillRequestDialog 
                     medicationName={primaryMed.name} 
                     prescriptionId={med.id}
                  />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
