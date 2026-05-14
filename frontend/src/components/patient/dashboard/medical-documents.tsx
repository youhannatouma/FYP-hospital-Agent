// @ts-nocheck
"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderOpen, Download, MoreVertical, Plus, Search, FileText, FlaskConical, CheckCircle2, Loader2 } from "lucide-react"

import { useMedicalRecords } from "@/hooks/use-medical-records"
import { toast } from "sonner"
import { useRef, useState } from "react"
import type { MedicalRecord } from "@/lib/services/repositories/medical-record-repository"

export function MedicalDocuments() {
  const { records, loading: isLoading, createRecord } = useMedicalRecords()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleDownload = (doc: any) => {
    toast.success(`Initializing secure download...`, {
      description: `${doc.title} is being prepared for export.`,
      icon: <Download className="h-4 w-4 text-blue-500" />,
    })
    
    try {
      let fileData: string
      let mimeType = 'text/plain'
      let fileName = `${doc.title.replace(/\s+/g, '_')}_${doc.date}.txt`

      // If we saved base64 content in metadata during upload
      if (doc.originalRecord?.metadata?.fileContent) {
        fileData = doc.originalRecord.metadata.fileContent
        mimeType = doc.originalRecord.metadata.fileType || 'application/octet-stream'
        fileName = doc.originalRecord.metadata.fileName || `${doc.title}.${mimeType.split('/')[1] || 'bin'}`
        
        // Convert Base64 back to Blob
        const byteCharacters = atob(fileData.split(',')[1] || fileData)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: mimeType })
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // Fallback: Generate text summary if it's just a regular record without a file attached
        let reportText = `PATIENT RECORD: ${doc.title}\nDate: ${doc.date}\nType: ${doc.originalRecord?.record_type}\n\n`
        reportText += `Description: ${doc.originalRecord?.description || 'N/A'}\n`
        if (doc.originalRecord?.vitals) {
           reportText += `\nVitals:\n${JSON.stringify(doc.originalRecord.vitals, null, 2)}`
        }

        const blob = new Blob([reportText], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      toast.success("Download Complete", {
        description: `${doc.title} has been saved to your device.`,
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      })
    } catch (e) {
      toast.error("Download Failed", {
        description: "Could not download the file."
      })
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit file size to ~2MB to prevent large Base64 strings crashing the backend JSON
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File Too Large", { description: "Please upload a document under 2MB." })
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string
      
      try {
        await createRecord({
          title: file.name.split('.')[0] || "Uploaded Document",
          record_type: "Document",
          description: "Patient uploaded document",
          metadata: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileContent: base64Data
          }
        })

        toast.success("Document Uploaded", {
          description: `${file.name} has been securely stored.`,
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        })
      } catch (error) {
        toast.error("Upload Failed", { description: "Could not save the document." })
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
    reader.readAsDataURL(file)
  }

  const documents = records.map((r: MedicalRecord) => ({
    id: r.id || r.record_id,
    title: r.title || r.diagnosis || "Medical Record",
    date: new Date(r.date || r.created_at || Date.now()).toLocaleDateString(),
    size: r.metadata?.fileSize ? `${Math.round(r.metadata.fileSize / 1024)} KB` : "145 KB",
    icon: r.record_type?.toLowerCase().includes("lab") ? FlaskConical : FileText,
    iconBg: r.record_type?.toLowerCase().includes("lab") ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500",
    originalRecord: r
  }))

  return (
    <Card className="premium-card rounded-[2.5rem] border-none shadow-premium bg-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
        <div>
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-foreground tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shadow-inner-glow">
              <FolderOpen className="h-5 w-5" />
            </div>
            Medical Documents & Records
          </CardTitle>
          <p className="text-sm text-muted-foreground font-medium mt-1">Managed clinical documentation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="h-10 w-48 pl-10 text-xs rounded-xl border-border/50 bg-muted/30 font-bold focus:ring-primary/20"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="h-10 w-32 text-[10px] font-black uppercase tracking-widest rounded-xl border-border/50 bg-muted/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="lab">Lab Results</SelectItem>
              <SelectItem value="prescription">Prescriptions</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-4">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-3xl border border-border/50 p-6 animate-pulse bg-card/30">
                <div className="h-10 w-10 rounded-xl bg-muted mb-4" />
                <div className="h-3 w-3/4 bg-muted rounded mb-2" />
                <div className="h-2 w-1/2 bg-muted rounded" />
              </div>
            ))
          ) : documents.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground italic font-medium">
              No medical documents identified in your history.
            </div>
          ) : (
            documents.map((doc) => (
              <m.div
                key={doc.id}
                whileHover={{ y: -4 }}
                className="rounded-[2rem] border border-border/30 bg-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner-glow", doc.iconBg)}>
                    <doc.icon className="h-6 w-6" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-xl hover:bg-muted/50">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <h4 className="text-sm font-black text-foreground mb-1 truncate tracking-tight">
                  {doc.title}
                </h4>
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                     {doc.date}
                   </p>
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                     {doc.size}
                   </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(doc)}
                  className="mt-5 w-full rounded-xl border-border/50 font-black text-[9px] uppercase tracking-[0.15em] h-10 hover:bg-primary hover:text-white hover:border-primary transition-all gap-2"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </m.div>
            ))
          )}

          <m.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border/50 p-6 text-center hover:border-primary/50 transition-all cursor-pointer min-h-[180px] bg-muted/5 group relative"
          >
            {isUploading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-[2rem] flex items-center justify-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
               <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
              Upload Document
            </p>
          </m.div>
        </div>
      </CardContent>
    </Card>
  )
}
