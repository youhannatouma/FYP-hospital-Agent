"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Stethoscope, FileText, Pill, ClipboardCheck, AlertTriangle } from "lucide-react"

const filterTabs = ["All", "Visits", "Labs", "Medications"]

const timelineItems = [
  {
    id: 1,
    type: "visit",
    title: "Follow-up Cardiology Visit",
    date: "Jan 10, 2024",
    description: "Dr. Michael Chen - Routine checkup and medication review",
    status: "Completed",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    dotColor: "bg-primary",
    icon: Stethoscope,
    extra: [
      { label: "Notes Available", type: "info" },
      { label: "View Details", type: "link" },
    ],
  },
  {
    id: 2,
    type: "lab",
    title: "Lab Results - Lipid Panel",
    date: "Jan 8, 2024",
    description: null,
    status: "Needs Review",
    statusColor: "bg-amber-500/10 text-amber-600",
    dotColor: "bg-amber-500",
    icon: FileText,
    labValues: [
      { label: "Total Cholesterol", value: "245 mg/dL" },
      { label: "LDL", value: "165 mg/dL" },
      { label: "HDL", value: "48 mg/dL" },
    ],
    extra: [
      { label: "Needs Review", type: "warning" },
      { label: "Download Report", type: "link" },
    ],
  },
  {
    id: 3,
    type: "medication",
    title: "Medication Adjustment",
    date: "Dec 20, 2023",
    description: "Lisinopril dosage increased to 10mg daily",
    status: "Active",
    statusColor: "bg-blue-500/10 text-blue-600",
    dotColor: "bg-blue-500",
    icon: Pill,
    extra: [
      { label: "Active", type: "info" },
      { label: "Current Medication", type: "tag" },
    ],
  },
  {
    id: 4,
    type: "visit",
    title: "Annual Physical Exam",
    date: "Nov 15, 2023",
    description: "Comprehensive health assessment - All vitals within normal range.",
    status: "Completed",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    dotColor: "bg-emerald-500",
    icon: ClipboardCheck,
    extra: [
      { label: "Completed", type: "success" },
    ],
  },
  {
    id: 5,
    type: "visit",
    title: "Emergency Visit - Chest Pain",
    date: "Aug 22, 2023",
    description: "Evaluated for chest discomfort. ECG normal. Diagnosed with anxiety-related symptoms.",
    status: "Resolved",
    statusColor: "bg-muted text-muted-foreground",
    dotColor: "bg-rose-500",
    icon: AlertTriangle,
    extra: [
      { label: "Resolved", type: "info" },
      { label: "ER Visit", type: "tag" },
    ],
  },
  {
    id: 6,
    type: "visit",
    title: "Initial Consultation",
    date: "Jun 10, 2023",
    description: "First visit - Health history documented. Hypertension diagnosis established.",
    status: "Historical",
    statusColor: "bg-muted text-muted-foreground",
    dotColor: "bg-muted-foreground",
    icon: Stethoscope,
    extra: [
      { label: "Historical", type: "info" },
    ],
  },
]

export function MedicalHistoryTimeline() {
  const [activeFilter, setActiveFilter] = useState("All")

  const filtered = timelineItems.filter((item) => {
    if (activeFilter === "All") return true
    if (activeFilter === "Visits") return item.type === "visit"
    if (activeFilter === "Labs") return item.type === "lab"
    if (activeFilter === "Medications") return item.type === "medication"
    return true
  })

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <Stethoscope className="h-5 w-5 text-primary" />
          Medical History Timeline
        </CardTitle>
        <div className="flex items-center gap-1">
          {filterTabs.map((tab) => (
            <Button
              key={tab}
              variant={activeFilter === tab ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(tab)}
              className={
                activeFilter === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }
            >
              {tab}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative ml-4 border-l-2 border-border">
          {filtered.map((item) => (
            <div key={item.id} className="relative mb-8 pl-8 last:mb-0">
              <div
                className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-card ${item.dotColor}`}
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-card-foreground">
                    {item.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {item.date}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {item.labValues && (
                  <div className="mt-1 flex flex-wrap gap-4 rounded-lg bg-amber-50 dark:bg-amber-500/5 p-3">
                    {item.labValues.map((lv) => (
                      <div key={lv.label}>
                        <span className="text-xs text-muted-foreground">
                          {lv.label}
                        </span>
                        <p className="text-sm font-semibold text-card-foreground">
                          {lv.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {item.extra.map((e, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className={`text-xs ${item.statusColor} border-0`}
                    >
                      {e.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button variant="ghost" className="text-primary hover:text-primary/80">
            Load More History
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
