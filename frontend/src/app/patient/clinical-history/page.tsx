"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { getServiceContainer } from "@/lib/services/service-container"
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  Stethoscope, 
  ArrowRight,
  ChevronDown,
  Clock,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ClinicalHistoryPage() {
  const { user } = useUser()
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Follow-up" | "Archived">("All")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [patientRecords, setPatientRecords] = useState<any[]>([])

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const container = getServiceContainer()
        const response = await container.medicalRecord.getMyMedicalRecords()
        if (Array.isArray(response)) {
          setPatientRecords(response)
        }
      } catch (error) {
        console.error("Failed to load clinical history:", error)
        toast({
          title: "Error",
          description: "Failed to load clinical history.",
          variant: "destructive"
        })
      }
    }
    if (user) {
      loadRecords()
    }
  }, [user, toast])

  const filteredRecords = patientRecords.filter((r: any) => {
    const matchesSearch = (
      r.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.record_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const recordStatus = r.status || "Active"
    const matchesStatus = statusFilter === "All" || recordStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Active': return { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 }
      case 'Follow-up': return { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock }
      case 'Archived': return { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: FileText }
      default: return { color: 'bg-muted text-muted-foreground', icon: Filter }
    }
  }

  const handleDownload = (record: any) => {
    setDownloadingId(record.record_id)
    setTimeout(() => {
      // Simulate CSV generation
      const headers = ["Record ID", "Doctor", "Date", "Diagnosis", "Notes", "Status"]
      const row = [record.record_id, record.doctor_name, record.created_at, record.diagnosis, record.notes || "N/A", record.status || "Active"]
      const csvContent = [headers, row].map(e => e.join(",")).join("\n")
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `medical_record_${record.record_id}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setDownloadingId(null)
      toast({
        title: "Record Downloaded",
        description: `Your medical record has been saved.`,
      })
    }, 800)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clinical History</h1>
          <p className="text-sm text-muted-foreground">Access your formal medical records and clinical summaries.</p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 border-primary text-primary hover:bg-primary/5"
          onClick={() => {
            toast({
              title: "Full History Export",
              description: "Generating a comprehensive PDF of your entire clinical history...",
            })
          }}
        >
          <Download className="h-4 w-4" />
          Export All Records
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">Total Records</p>
                <h3 className="text-2xl font-bold">{patientRecords.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">Active Diagnoses</p>
                <h3 className="text-2xl font-bold">{patientRecords.filter((r: any) => (r.status || 'Active') === 'Active').length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">Primary Care</p>
                <h3 className="text-2xl font-bold">Dr. Michael Chen</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and List */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search history by diagnosis or provider..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 min-w-[140px] justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5" />
                      {statusFilter === "All" ? "All History" : statusFilter}
                    </div>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("All")}>All History</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Active")}>Active Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Follow-up")}>Follow-up Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Archived")}>Past History</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.map((record: any) => {
              const statusInfo = getStatusInfo(record.status || 'Active')
              return (
                <div 
                  key={record.record_id} 
                  className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${statusInfo.color} border shadow-sm`}>
                        <statusInfo.icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-base truncate">{record.diagnosis}</h3>
                          <Badge className={`${statusInfo.color} border-0 text-[10px]`}>
                            {record.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(record.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Stethoscope className="h-3.5 w-3.5" />
                            {record.doctor_name || "Staff Physician"}
                          </div>
                          <div className="hidden sm:flex items-center gap-1.5 grayscale opacity-70">
                            <Clock className="h-3.5 w-3.5" />
                            ID: {record.record_id?.split('-')[0]}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-primary"
                        disabled={downloadingId === record.record_id}
                        onClick={() => handleDownload(record)}
                      >
                        {downloadingId === record.record_id ? (
                          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {record.notes && (
                    <div className="relative pl-4 border-l-2 border-primary/20">
                      <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-2">
                        "{record.notes}"
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end pt-2 border-t border-border mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="link" className="text-primary text-xs h-auto p-0 gap-1">
                      View Clinical Summary <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}

            {filteredRecords.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No Records Found</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  We couldn't find any medical records matching your criteria.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Privacy Notice */}
      <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/40 text-xs text-muted-foreground leading-relaxed">
        <Stethoscope className="h-5 w-5 shrink-0 text-primary/40" />
        <p>
          Your clinical history is protected by HIPAA and state privacy laws. This record includes formal diagnoses, 
          clinical encounters, and practitioner summaries. If you notice any inaccuracies, please contact your 
          healthcare provider or the medical records department immediately.
        </p>
      </div>
    </div>
  )
}
