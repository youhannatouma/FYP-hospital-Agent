"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FlaskConical, Download } from "lucide-react"
import Link from "next/link"

const labResults = [
  {
    id: 1,
    title: "Lipid Panel",
    collected: "Collected: Jan 8, 2024",
    status: "Review Needed",
    statusColor: "bg-amber-500/10 text-amber-600",
    values: [
      { label: "Total Cholesterol", value: "245 mg/dL", flag: true },
      { label: "LDL", value: "165 mg/dL", flag: true },
      { label: "HDL", value: "48 mg/dL", flag: false },
      { label: "Triglycerides", value: "160 mg/dL", flag: false },
    ],
    borderColor: "border-amber-300/50",
    downloadColor: "bg-amber-500 text-white hover:bg-amber-600",
  },
  {
    id: 2,
    title: "Complete Blood Count",
    collected: "Collected: Dec 15, 2023",
    status: "Normal",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    values: [
      { label: "WBC", value: "7.2 K/uL", flag: false },
      { label: "RBC", value: "4.8 M/uL", flag: false },
      { label: "Hemoglobin", value: "14.2 g/dL", flag: false },
      { label: "Platelets", value: "250 K/uL", flag: false },
    ],
    borderColor: "border-border",
    downloadColor: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
]

export function RecentLabResults() {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <FlaskConical className="h-5 w-5 text-rose-500" />
          Recent Lab Results
        </CardTitle>
        <Link href="/patient/lab-results" className="text-sm text-primary hover:underline">
          View All
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {labResults.map((result) => (
          <div
            key={result.id}
            className={`rounded-lg border p-4 ${result.borderColor}`}
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-sm font-semibold text-card-foreground">
                {result.title}
              </h4>
              <Badge
                variant="secondary"
                className={`text-xs ${result.statusColor} border-0`}
              >
                {result.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {result.collected}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {result.values.map((val) => (
                <div key={val.label}>
                  <span className="text-[11px] text-muted-foreground">
                    {val.label}
                  </span>
                  <p
                    className={`text-sm font-semibold ${
                      val.flag
                        ? "text-amber-600"
                        : "text-card-foreground"
                    }`}
                  >
                    {val.value} {val.flag && <span className="text-xs">&#x2191;</span>}
                  </p>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              className={`mt-3 w-full gap-1 ${result.downloadColor}`}
            >
              <Download className="h-3 w-3" />
              Download Report
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
