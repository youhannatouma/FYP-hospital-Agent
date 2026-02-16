"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderOpen, Download, MoreVertical, Plus, Search, FileText, Stethoscope, ShieldCheck } from "lucide-react"
import { DocumentActionsMenu, DocumentDownloadButton } from "@/components/patient/dashboard/dialogs/document-preview-dialog"
import { UploadReportDialog } from "@/components/patient/reports/upload-dialog"

import { FlaskConical } from "lucide-react"

export function MedicalDocuments() {
  const [documents, setDocuments] = React.useState([
    {
      id: 1,
      title: "Lipid Panel Report",
      date: "Jan 8, 2024",
      size: "245 KB",
      icon: FileText,
      iconBg: "bg-rose-100 dark:bg-rose-500/10",
      iconColor: "text-rose-600",
    },
    {
      id: 2,
      title: "Visit Summary",
      date: "Jan 10, 2024",
      size: "184 KB",
      icon: FileText,
      iconBg: "bg-blue-100 dark:bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      id: 3,
      title: "Prescription - Lisinopril",
      date: "Dec 20, 2023",
      size: "88 KB",
      icon: Stethoscope,
      iconBg: "bg-violet-100 dark:bg-violet-500/10",
      iconColor: "text-violet-600",
    },
    {
      id: 4,
      title: "CBC Results",
      date: "Dec 15, 2023",
      size: "196 KB",
      icon: FlaskConical,
      iconBg: "bg-emerald-100 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      id: 5,
      title: "Chest X-Ray",
      date: "Aug 22, 2023",
      size: "1.2 MB",
      icon: FileText,
      iconBg: "bg-amber-100 dark:bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    {
      id: 6,
      title: "Insurance Card",
      date: "Jan 15, 2023",
      size: "156 KB",
      icon: ShieldCheck,
      iconBg: "bg-emerald-100 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      id: 7,
      title: "Consent Forms",
      date: "Jun 15, 2023",
      size: "2.56 KB",
      icon: FileText,
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
    },
  ])

  // API Endpoints Suggestion:
  // GET: /patient/documents -> Fetch medical documents for the logged-in patient
  /*
    React.useEffect(() => {
      const fetchDocuments = async () => {
        try {
          // const response = await apiClient.get('/patient/documents');
          // setDocuments(response.data);
        } catch (error) {
          console.error('Failed to fetch documents', error);
        }
      };
      fetchDocuments();
    }, []);
  */
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <FolderOpen className="h-5 w-5 text-blue-500" />
          Medical Documents & Records
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="h-8 w-40 pl-8 text-xs"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="lab">Lab Results</SelectItem>
              <SelectItem value="prescription">Prescriptions</SelectItem>
              <SelectItem value="imaging">Imaging</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-border p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${doc.iconBg}`}
                >
                  <doc.icon className={`h-5 w-5 ${doc.iconColor}`} />
                </div>
                <DocumentActionsMenu doc={doc} />
              </div>
              <h4 className="text-sm font-semibold text-card-foreground mb-1 truncate">
                {doc.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {doc.date} - {doc.size}
              </p>
              <DocumentDownloadButton title={doc.title} />
            </div>
          ))}

          {/* Upload Card */}
          <UploadReportDialog />
        </div>
      </CardContent>
    </Card>
  )
}
