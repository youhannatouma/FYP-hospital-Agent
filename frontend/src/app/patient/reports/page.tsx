"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Upload,
  Search,
  Download,
  Eye,
  Share2,
  FileText,
  FlaskConical,
  Image as ImageIcon,
  Stethoscope,
  Brain,
  MoreVertical,
  CalendarDays,
  HardDrive,
  Bot,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Report {
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

const reports: Report[] = [
  {
    id: 1,
    name: "Lipid Panel Report",
    type: "Lab Results",
    typeIcon: FlaskConical,
    typeColor: "bg-red-500/10 text-red-600",
    uploadDate: "Jan 8, 2024",
    fileSize: "245 KB",
    aiSummary:
      "Total cholesterol elevated at 245 mg/dL. LDL elevated at 165 mg/dL. HDL within normal range. Recommend dietary changes and medication review.",
    aiFindings: [
      "Total Cholesterol: 245 mg/dL (High)",
      "LDL: 165 mg/dL (High)",
      "HDL: 48 mg/dL (Normal)",
      "Triglycerides: 160 mg/dL (Borderline)",
    ],
    doctor: "Dr. Michael Chen",
    status: "Needs Review",
    statusColor: "bg-amber-500/10 text-amber-600",
  },
  {
    id: 2,
    name: "Visit Summary",
    type: "Clinical Notes",
    typeIcon: FileText,
    typeColor: "bg-blue-500/10 text-blue-600",
    uploadDate: "Jan 10, 2024",
    fileSize: "156 KB",
    aiSummary:
      "Follow-up cardiology visit. Blood pressure stable. Medication dosage adjusted. Next appointment scheduled in 3 months.",
    aiFindings: [
      "Blood pressure: 137/85 mmHg (Slightly elevated)",
      "Heart rate: 72 bpm (Normal)",
      "Medication adjustment recommended",
    ],
    doctor: "Dr. Michael Chen",
    status: "Reviewed",
    statusColor: "bg-emerald-500/10 text-emerald-600",
  },
  {
    id: 3,
    name: "Prescription - Lisinopril",
    type: "Prescription",
    typeIcon: Stethoscope,
    typeColor: "bg-purple-500/10 text-purple-600",
    uploadDate: "Dec 20, 2023",
    fileSize: "89 KB",
    aiSummary:
      "Prescription for Lisinopril 10mg, once daily for hypertension management. Valid for 6 months with 3 refills.",
    aiFindings: [
      "Medication: Lisinopril 10mg",
      "Dosage: Once daily, morning",
      "Duration: 6 months",
      "Refills: 3 remaining",
    ],
    doctor: "Dr. Michael Chen",
    status: "Active",
    statusColor: "bg-emerald-500/10 text-emerald-600",
  },
  {
    id: 4,
    name: "CBC Results",
    type: "Lab Results",
    typeIcon: FlaskConical,
    typeColor: "bg-red-500/10 text-red-600",
    uploadDate: "Dec 15, 2023",
    fileSize: "198 KB",
    aiSummary:
      "Complete blood count within normal limits. All values within reference ranges. No signs of infection or anemia.",
    aiFindings: [
      "WBC: 7.2 K/uL (Normal)",
      "RBC: 4.8 M/uL (Normal)",
      "Hemoglobin: 14.2 g/dL (Normal)",
      "Platelets: 250 K/uL (Normal)",
    ],
    doctor: "Dr. Emily Watson",
    status: "Normal",
    statusColor: "bg-emerald-500/10 text-emerald-600",
  },
  {
    id: 5,
    name: "Chest X-Ray",
    type: "Imaging",
    typeIcon: ImageIcon,
    typeColor: "bg-orange-500/10 text-orange-600",
    uploadDate: "Aug 20, 2023",
    fileSize: "1.2 MB",
    aiSummary:
      "Chest X-ray shows no acute cardiopulmonary disease. Heart size normal. Lungs clear bilaterally.",
    aiFindings: [
      "Heart size: Normal",
      "Lungs: Clear bilaterally",
      "No pleural effusion",
      "No pneumothorax",
    ],
    doctor: "Dr. Sarah Kim",
    status: "Normal",
    statusColor: "bg-emerald-500/10 text-emerald-600",
  },
  {
    id: 6,
    name: "Insurance Card",
    type: "Insurance",
    typeIcon: FileText,
    typeColor: "bg-green-500/10 text-green-600",
    uploadDate: "Jun 10, 2023",
    fileSize: "105 KB",
    aiSummary: "Health insurance card on file. Coverage details available for reference.",
    aiFindings: [
      "Provider: BlueCross BlueShield",
      "Plan: Premium Health Plus",
      "Member ID: BCB-4521-8837",
    ],
    doctor: "N/A",
    status: "On File",
    statusColor: "bg-blue-500/10 text-blue-600",
  },
  {
    id: 7,
    name: "Consent Forms",
    type: "Administrative",
    typeIcon: FileText,
    typeColor: "bg-gray-500/10 text-gray-600",
    uploadDate: "Jul 15, 2023",
    fileSize: "2.06 MB",
    aiSummary: "Patient consent forms signed and on file for all current treatments.",
    aiFindings: [
      "General consent: Signed",
      "HIPAA acknowledgment: Signed",
      "Telehealth consent: Signed",
    ],
    doctor: "N/A",
    status: "On File",
    statusColor: "bg-blue-500/10 text-blue-600",
  },
]

function ReportDetailModal({ report }: { report: Report }) {
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
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" className="flex-1 border-border text-foreground gap-1.5">
            <Share2 className="h-4 w-4" />
            Share with Doctor
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || r.type === typeFilter
    return matchesSearch && matchesType
  })

  const reportTypes = Array.from(new Set(reports.map((r) => r.type)))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Medical Documents & Records
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload, view, and manage your medical documents
        </p>
      </div>

      {/* Upload Zone */}
      <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-card-foreground">
              Upload Document
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Drag and drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Supports PDF, JPG, PNG, DICOM (max 20MB)
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Choose Files
          </Button>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {reportTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredReports.map((report) => (
          <Dialog key={report.id}>
            <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${report.typeColor}`}
                  >
                    <report.typeIcon className="h-5 w-5" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share with Doctor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3">
                  <h3 className="font-semibold text-sm text-card-foreground line-clamp-1">
                    {report.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {report.uploadDate} - {report.fileSize}
                  </p>
                </div>

                <DialogTrigger asChild>
                  <Button className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download
                  </Button>
                </DialogTrigger>
              </CardContent>
            </Card>
            <ReportDetailModal report={report} />
          </Dialog>
        ))}

        {/* Upload Card */}
        <Card className="border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Upload Document
            </span>
          </CardContent>
        </Card>
      </div>

      {filteredReports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">
            No documents found
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  )
}
