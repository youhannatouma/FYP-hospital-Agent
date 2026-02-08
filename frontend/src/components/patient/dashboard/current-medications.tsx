"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pill, RefreshCw, Trash2 } from "lucide-react"
import Link from "next/link"

const medications = [
  {
    id: 1,
    name: "Lisinopril",
    purpose: "For: Hypertension",
    dosage: "10mg",
    frequency: "Once daily",
    refillsLeft: 2,
    status: "Active",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    highlight: true,
  },
  {
    id: 2,
    name: "Atorvastatin",
    purpose: "For: High Cholesterol",
    dosage: "20mg",
    frequency: "Once daily",
    refillsLeft: 5,
    status: "Active",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    highlight: false,
  },
  {
    id: 3,
    name: "Aspirin",
    purpose: "For: Cardiovascular Protection",
    dosage: "81mg",
    frequency: "Once daily",
    refillsLeft: null,
    status: "Active",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    highlight: false,
    type: "OTC",
  },
]

export function CurrentMedications() {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <Pill className="h-5 w-5 text-amber-500" />
          Current Medications
        </CardTitle>
        <Link href="/patient/medicines" className="text-sm text-primary hover:underline">
          View All
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className={`rounded-lg border p-4 ${
              med.highlight
                ? "border-amber-300/50 bg-amber-50/50 dark:bg-amber-500/5 dark:border-amber-500/20"
                : "border-border"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-card-foreground">
                  {med.name}
                </h4>
                <p className="text-xs text-muted-foreground">{med.purpose}</p>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs ${med.statusColor} border-0`}
              >
                {med.status}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-3 text-xs text-muted-foreground">
              <div>
                <span className="block text-muted-foreground/70">Dosage</span>
                <span className="font-medium text-card-foreground">{med.dosage}</span>
              </div>
              <div>
                <span className="block text-muted-foreground/70">Frequency</span>
                <span className="font-medium text-card-foreground">{med.frequency}</span>
              </div>
              <div>
                <span className="block text-muted-foreground/70">
                  {med.type ? "Type" : "Refills Left"}
                </span>
                <span className="font-medium text-card-foreground">
                  {med.type || med.refillsLeft}
                </span>
              </div>
            </div>
            {med.refillsLeft !== null && !med.type && (
              <Button
                size="sm"
                className="mt-3 w-full bg-amber-500 text-white hover:bg-amber-600 gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Request Refill
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
