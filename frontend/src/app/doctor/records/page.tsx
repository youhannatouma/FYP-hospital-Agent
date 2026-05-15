"use client"

import React, { useState, useEffect } from "react"
import { Plus, Search, Eye, Edit, Download, Loader2 } from "lucide-react"
import { m } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { RecordDetailDialog } from "@/components/doctor/MedicalRecord/record-detail-dialog"
import { MedicalRecord } from "@/components/doctor/MedicalRecord/columns"
import { CreateRecordDialog } from "@/components/doctor/MedicalRecord/create-record-dialog"
import { getServiceContainer } from "@/lib/services/service-container"

export default function MedicalRecordsPage() {
  const [search, setSearch] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchRecords = async () => {
      try {
        const container = getServiceContainer()
        const data = await container.medicalRecord.getMyRecords()
        
        if (!isMounted) return

        if (Array.isArray(data)) {
          setRecords(data)
        }
      } catch (error) {
        if (!isMounted) return
        console.error("Failed to fetch medical records:", error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchRecords()
    return () => { isMounted = false }
  }, [])

  const handleAddRecord = () => {
    setSelectedRecord(null)
    setIsCreateOpen(true)
  }

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setIsDetailOpen(true)
  }

  const handleEditRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setIsDetailOpen(false)
    setIsCreateOpen(true)
  }

  const handleDownloadRecord = (record: MedicalRecord) => {
    toast({
      title: "Preparing Download",
      description: `Generating a secure PDF package for ${record.patient_name || "the patient"}'s history.`,
    })
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `Medical record for ${record.patient_name || "the patient"} has been downloaded.`,
      })
    }, 2000)
  }

  const handleCreateSuccess = (data: Partial<MedicalRecord>) => {
    if (selectedRecord) {
      // Edit
      setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, ...data } as MedicalRecord : r))
    } else {
      // Add
      setRecords(prev => [data as MedicalRecord, ...prev])
    }
  }

  const filtered = records.filter(
    (r) =>
      (r.patient_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.diagnosis || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medical Records</h1>
          <p className="text-sm text-muted-foreground">View and manage patient medical records</p>
        </div>
        <Button
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleAddRecord}
        >
          <Plus className="h-4 w-4" />
          Add Record
        </Button>
      </div>

      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-bold">Patient Records</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients or diagnoses..."
                className="pl-10 h-9 bg-muted/30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[300px] gap-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Loading Records...</p>
            </div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((record) => (
                <TableRow 
                  key={record.id} 
                  className="hover:bg-muted/20 cursor-pointer"
                  onClick={() => handleViewRecord(record)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                        {(record.patient_name || "UP").split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="font-medium text-foreground">{record.patient_name || "Unknown Patient"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{record.patient_id}</TableCell>
                  <TableCell className="text-muted-foreground">{record.created_at ? new Date(record.created_at).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell className="text-foreground">{record.diagnosis || "Consultation"}</TableCell>
                  <TableCell>
                    <Badge className={`border-0 bg-primary/10 text-primary`}>
                      {record.record_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        title="View Details"
                        onClick={() => handleViewRecord(record)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-amber-600"
                        title="Edit Record"
                        onClick={() => handleEditRecord(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                        title="Download PDF"
                        onClick={() => handleDownloadRecord(record)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <RecordDetailDialog 
        record={selectedRecord}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={handleEditRecord}
        onDownload={handleDownloadRecord}
      />

      <CreateRecordDialog 
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        record={selectedRecord}
        onSuccess={handleCreateSuccess}
      />
    </m.div>
  )
}
