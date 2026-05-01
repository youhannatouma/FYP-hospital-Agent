// @ts-nocheck
"use client"
/* eslint-disable react/no-unescaped-entities */

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Download, FlaskConical, CalendarDays, Activity } from "lucide-react"

interface LabReportDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: unknown | null
}

export function LabReportDetailDialog({ 
  open, 
  onOpenChange, 
  report 
}: LabReportDetailDialogProps) {
  if (!report) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">{report.testName}</DialogTitle>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>Collected: {report.collectedDate}</span>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className={`${report.statusColor} border-0 mt-1`}>
              {report.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="py-2">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 text-sm">
              <div>
                <p className="text-muted-foreground">Ordered By</p>
                <p className="font-medium text-foreground">{report.orderedBy}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Facility</p>
                <p className="font-medium text-foreground">Central Lab Diagnostics</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Detailed Findings
              </h4>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-5 gap-4 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
                  <span className="col-span-2">Test Component</span>
                  <span>Value</span>
                  <span>Ref. Range</span>
                  <span>Interpretation</span>
                </div>
                {report.results.map((result: unknown, idx: number) => (
                  <div key={idx} className="grid grid-cols-5 gap-4 px-4 py-3 text-sm border-t border-border">
                    <span className="col-span-2 font-medium text-card-foreground">
                      {result.name}
                    </span>
                    <span className={`font-semibold ${result.flag ? "text-destructive" : "text-card-foreground"}`}>
                      {result.value} <span className="text-xs text-muted-foreground font-normal ml-1">{result.unit}</span>
                    </span>
                    <span className="text-muted-foreground">{result.range}</span>
                    <span>
                      {result.flag ? (
                        <Badge variant="outline" className="text-xs border-destructive text-destructive">
                          {result.flag}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Normal</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h4 className="font-semibold text-primary text-sm mb-2">Physician's Note</h4>
              <p className="text-sm text-foreground leading-relaxed">
                {report.status === "Review Needed" 
                  ? "We need to discuss these results at your next appointment. Some values are outside the normal range and we may need to adjust your treatment plan."
                  : "All results look good and are within normal ranges. Keep up the good work and continue with your current routine."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="bg-primary text-primary-foreground gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
