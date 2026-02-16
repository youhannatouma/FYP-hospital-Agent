"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { ReportDetailModal, Report } from "../report-detail-dialog"
import { FileText, FlaskConical } from "lucide-react"

export function RecentLabResults() {
  const { toast } = useToast()
  const [downloading, setDownloading] = useState<number | null>(null)
  const [labResults, setLabResults] = React.useState([
    {
      id: 1,
      name: "Lipid Panel",
      type: "Lab Report",
      typeIcon: FileText,
      typeColor: "text-amber-500",
      uploadDate: "Jan 8, 2024",
      fileSize: "1.2 MB",
      aiSummary: "Lipid profile shows elevated LDL and total cholesterol levels.",
      aiFindings: ["Total Cholesterol: 245 mg/dL (High)", "LDL: 165 mg/dL (High)", "HDL: 48 mg/dL (Low)"],
      doctor: "Dr. Michael Chen",
      status: "Review Needed",
      statusColor: "bg-amber-500/10 text-amber-600",
      borderColor: "border-amber-300/50",
      downloadColor: "bg-amber-500 text-white hover:bg-amber-600",
      collected: "Collected: Jan 8, 2024",
      values: [
        { label: "Total Cholesterol", value: "245 mg/dL", flag: true },
        { label: "LDL", value: "165 mg/dL", flag: true },
        { label: "HDL", value: "48 mg/dL", flag: false },
        { label: "Triglycerides", value: "160 mg/dL", flag: false },
      ],
    },
    {
      id: 2,
      name: "Complete Blood Count",
      type: "Lab Report",
      typeIcon: FileText,
      typeColor: "text-rose-500",
      uploadDate: "Dec 15, 2023",
      fileSize: "0.8 MB",
      aiSummary: "CBC results are within normal ranges with no significant abnormalities.",
      aiFindings: ["WBC, RBC, and Platelets all normal", "Hemoglobin stable"],
      doctor: "Dr. Michael Chen",
      status: "Normal",
      statusColor: "bg-emerald-500/10 text-emerald-600",
      borderColor: "border-border",
      downloadColor: "bg-muted text-muted-foreground hover:bg-muted/80",
      collected: "Collected: Dec 15, 2023",
      values: [
        { label: "WBC", value: "7.2 K/uL", flag: false },
        { label: "RBC", value: "4.8 M/uL", flag: false },
        { label: "Hemoglobin", value: "14.2 g/dL", flag: false },
        { label: "Platelets", value: "250 K/uL", flag: false },
      ],
    },
  ])

  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // API Endpoints Suggestion:
  // GET: /patient/labs/recent -> Fetch recent lab results for the patient
  /*
    React.useEffect(() => {
      const fetchLabResults = async () => {
        try {
          // const response = await apiClient.get('/patient/labs/recent');
          // setLabResults(response.data);
        } catch (error) {
          console.error('Failed to fetch lab results', error);
        }
      };
      fetchLabResults();
    }, []);
  */
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
            className={`rounded-lg border p-4 cursor-pointer hover:shadow-md transition-all ${result.borderColor}`}
            onClick={() => {
              setSelectedReport(result)
              setDialogOpen(true)
            }}
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-sm font-semibold text-card-foreground">
                {result.name}
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
          </div>
        ))}
      </CardContent>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedReport && <ReportDetailModal report={selectedReport} />}
      </Dialog>
    </Card>
  )
}
