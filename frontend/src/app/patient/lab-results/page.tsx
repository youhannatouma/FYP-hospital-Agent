"use client"

import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FlaskConical,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const labResults = [
  {
    id: 1,
    testName: "Lipid Panel",
    collectedDate: "Jan 8, 2024",
    orderedBy: "Dr. Michael Chen",
    status: "Review Needed",
    statusColor: "bg-amber-500/10 text-amber-600",
    results: [
      { name: "Total Cholesterol", value: "245", unit: "mg/dL", range: "< 200", trend: "up", flag: "High" },
      { name: "LDL", value: "165", unit: "mg/dL", range: "< 130", trend: "up", flag: "High" },
      { name: "HDL", value: "48", unit: "mg/dL", range: "> 40", trend: "stable", flag: null },
      { name: "Triglycerides", value: "160", unit: "mg/dL", range: "< 150", trend: "up", flag: "Borderline" },
    ],
  },
  {
    id: 2,
    testName: "Complete Blood Count",
    collectedDate: "Dec 15, 2023",
    orderedBy: "Dr. Emily Watson",
    status: "Normal",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    results: [
      { name: "WBC", value: "7.2", unit: "K/uL", range: "4.5-11.0", trend: "stable", flag: null },
      { name: "RBC", value: "4.8", unit: "M/uL", range: "4.5-5.5", trend: "stable", flag: null },
      { name: "Hemoglobin", value: "14.2", unit: "g/dL", range: "13.5-17.5", trend: "stable", flag: null },
      { name: "Platelets", value: "250", unit: "K/uL", range: "150-400", trend: "stable", flag: null },
    ],
  },
  {
    id: 3,
    testName: "Comprehensive Metabolic Panel",
    collectedDate: "Nov 10, 2023",
    orderedBy: "Dr. Emily Watson",
    status: "Normal",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    results: [
      { name: "Glucose", value: "98", unit: "mg/dL", range: "70-100", trend: "stable", flag: null },
      { name: "BUN", value: "15", unit: "mg/dL", range: "7-20", trend: "stable", flag: null },
      { name: "Creatinine", value: "0.9", unit: "mg/dL", range: "0.7-1.3", trend: "stable", flag: null },
      { name: "Sodium", value: "140", unit: "mEq/L", range: "136-145", trend: "stable", flag: null },
    ],
  },
]

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-destructive" />
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-primary" />
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

export default function LabResultsPage() {
  const { toast } = useToast()
  const [downloading, setDownloading] = useState<number | null>(null)
  const [exportingAll, setExportingAll] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lab Results</h1>
          <p className="text-sm text-muted-foreground">
            View and track your laboratory test results
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-border text-foreground"
          disabled={exportingAll}
          onClick={() => {
            setExportingAll(true)
            setTimeout(() => {
              setExportingAll(false)
              toast({
                title: "Export Complete",
                description: "All lab results exported as PDF.",
              })
            }, 1500)
          }}
        >
          {exportingAll ? (
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exportingAll ? "Exporting..." : "Export All Results"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">1</p>
              <p className="text-xs text-muted-foreground">Needs Review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">2</p>
              <p className="text-xs text-muted-foreground">Normal Results</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <FlaskConical className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">3</p>
              <p className="text-xs text-muted-foreground">Total Tests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lab Results List */}
      <div className="flex flex-col gap-4">
        {labResults.map((lab) => (
          <Card key={lab.id} className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FlaskConical className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-card-foreground">
                      {lab.testName}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{lab.collectedDate}</span>
                      </div>
                      <span>{lab.orderedBy}</span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`${lab.statusColor} border-0`}
                >
                  {lab.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-5 gap-4 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
                  <span>Test</span>
                  <span>Result</span>
                  <span>Unit</span>
                  <span>Reference</span>
                  <span>Trend</span>
                </div>
                {lab.results.map((result, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-5 gap-4 px-4 py-2.5 text-sm border-t border-border"
                  >
                    <span className="font-medium text-card-foreground">
                      {result.name}
                    </span>
                    <span
                      className={`font-semibold ${
                        result.flag ? "text-destructive" : "text-card-foreground"
                      }`}
                    >
                      {result.value}
                      {result.flag && (
                        <span className="ml-1 text-xs">({result.flag})</span>
                      )}
                    </span>
                    <span className="text-muted-foreground">{result.unit}</span>
                    <span className="text-muted-foreground">{result.range}</span>
                    <div className="flex items-center">
                      <TrendIcon trend={result.trend} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                  disabled={downloading === lab.id}
                  onClick={() => {
                    setDownloading(lab.id)
                    setTimeout(() => {
                      setDownloading(null)
                      toast({
                        title: "Download Complete",
                        description: `${lab.testName} report saved to your device.`,
                      })
                    }, 1000)
                  }}
                >
                  {downloading === lab.id ? (
                    <>
                      <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3" />
                      Download Report
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 border-border text-foreground"
                  onClick={() => {
                    toast({
                      title: `Viewing ${lab.testName}`,
                      description: `Full report from ${lab.collectedDate} by ${lab.orderedBy}`,
                    })
                  }}
                >
                  <Eye className="h-3 w-3" />
                  View Full Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
