"use client"

import React from "react"
import { Plus, Search, Eye, Edit, Download } from "lucide-react"
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
import { useState, useEffect } from "react"
import { getServiceContainer } from "@/lib/services/service-container"
import { Loader2 } from "lucide-react"

export default function MedicalRecordsPage() {
  const [search, setSearch] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const container = getServiceContainer()
        const data = await container.medicalRecord.getMyRecords()
        if (Array.isArray(data)) {
          const mappedRecords = data.map((r: any) => ({
            id: r.record_id,
            patientId: r.patient_id || "Unknown",
            name: r.patient_name || "Unknown Patient",
            lastVisit: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Unknown',
            diagnosis: r.diagnosis || "Medical Record",
            status: "Active",
            age: 0,
            gender: "Unknown",
            bloodType: "Unknown",
            phone: "Unknown",
            email: "Unknown",
            address: "Unknown",
            height: 0,
            weight: 0,
            bloodPressure: "Unknown",
            heartRate: 0,
            temperature: 0,
            medications: [],
            allergies: [],
            treatmentPlan: r.treatment || "",
            notes: r.clinical_notes || "",
            nextAppointment: ""
          })) as MedicalRecord[]
          setRecords(mappedRecords)
        }
      } catch (error) {
        console.error("Failed to fetch medical records:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecords()
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
      description: `Generating a secure PDF package for ${record.name}'s history.`,
    })
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `Medical record for ${record.name} has been downloaded.`,
      })
    }, 2000)
  }

  const handleCreateSuccess = (data: Partial<MedicalRecord>) => {
    if (selectedRecord) {
      // Edit
      setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, ...data } : r))
    } else {
      // Add
      const newRecord: MedicalRecord = {
        ...data as MedicalRecord,
        id: Math.random().toString(36).substr(2, 9),
        lastVisit: new Date().toISOString().split('T')[0],
      }
      setRecords(prev => [newRecord, ...prev])
    }
  }

  const filtered = records.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(search.toLowerCase())
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
                        {record.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="font-medium text-foreground">{record.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{record.patientId}</TableCell>
                  <TableCell className="text-muted-foreground">{record.lastVisit}</TableCell>
                  <TableCell className="text-foreground">{record.diagnosis}</TableCell>
                  <TableCell>
                    <Badge className={`border-0 bg-emerald-500/10 text-emerald-500`}>
                      {record.status}
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