"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderOpen, Download, MoreVertical, Plus, Search, FileText, Stethoscope, ShieldCheck } from "lucide-react"

import { FlaskConical } from "lucide-react"
import { useMedicalRecords } from "@/hooks/use-medical-records"

export function MedicalDocuments() {
  const { records, loading: isLoading } = useMedicalRecords()

  const documents = records.map((r: any) => ({
    id: r.record_id,
    title: r.title || r.diagnosis || "Medical Record",
    date: new Date(r.created_at).toLocaleDateString(),
    size: "145 KB", // Mock size since we don't store actual files yet
    icon: r.record_type?.toLowerCase().includes("lab") ? FlaskConical : FileText,
    iconBg: r.record_type?.toLowerCase().includes("lab") ? "bg-amber-100 dark:bg-amber-500/10" : "bg-blue-100 dark:bg-blue-500/10",
    iconColor: r.record_type?.toLowerCase().includes("lab") ? "text-amber-600" : "text-blue-600",
  }))
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
          {isLoading ? (
            <div className="col-span-full py-8 text-center text-sm text-muted-foreground italic">
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="col-span-full py-8 text-center text-sm text-muted-foreground italic">
              No medical documents found.
            </div>
          ) : (
            documents.map((doc) => (
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
                <h4 className="text-sm font-semibold text-card-foreground mb-1 truncate">
                  {doc.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {doc.date} - {doc.size}
                </p>
                <Button
                  size="sm"
                  className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
            ))
          )}

          {/* Upload Card */}
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-4 text-center hover:border-primary/50 transition-colors cursor-pointer min-h-[140px]">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              Upload Document
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
