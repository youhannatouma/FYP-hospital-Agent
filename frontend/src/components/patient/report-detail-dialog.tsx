"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Download,
  Share2,
  CalendarDays,
  HardDrive,
  Bot,
  FileText,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ShareReportDialog } from "@/components/patient/reports/share-dialog"

export interface Report {
  id: number
  name: string
  type: string
  typeIcon: typeof FileText
  typeColor: string
  uploadDate: string
  fileSize: string
  aiSummary: string
  aiFindings: string[]
  doctor: string
  status: string
  statusColor: string
}

export function ReportDetailModal({ report }: { report: Report }) {
  const { toast } = useToast()

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-foreground">
          <report.typeIcon className="h-5 w-5 text-primary" />
          {report.name}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>{report.uploadDate}</span>
          <span className="text-border">|</span>
          <HardDrive className="h-4 w-4" />
          <span>{report.fileSize}</span>
        </div>

        <div>
          <Badge
            variant="secondary"
            className={`${report.statusColor} border-0`}
          >
            {report.status}
          </Badge>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm text-foreground">AI Summary</h4>
          </div>
          <p className="text-sm text-muted-foreground">{report.aiSummary}</p>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-foreground mb-2">Key Findings</h4>
          <ul className="flex flex-col gap-1.5">
            {report.aiFindings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {finding}
              </li>
            ))}
          </ul>
        </div>

        {report.doctor !== "N/A" && (
          <p className="text-sm text-muted-foreground">
            Ordered by: <span className="font-medium text-foreground">{report.doctor}</span>
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            onClick={() => {
              toast({
                title: "Downloading...",
                description: report.name + " (" + report.fileSize + ") has started downloading.",
              })
            }}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <ShareReportDialog reportName={report.name} />
        </div>
      </div>
    </DialogContent>
  )
}
