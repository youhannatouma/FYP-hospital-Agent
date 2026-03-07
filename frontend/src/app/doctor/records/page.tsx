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

const MOCK_RECORDS: MedicalRecord[] = [
  { 
    id: "1", 
    patientId: "P-2024-001", 
    name: "John Doe", 
    lastVisit: "2024-02-05", 
    diagnosis: "Hypertension", 
    status: "Active",
    age: 45,
    gender: "Male",
    bloodType: "A+",
    phone: "(555) 123-4567",
    email: "john.doe@example.com",
    address: "123 Main St, Springfield",
    height: 180,
    weight: 85,
    bloodPressure: "140/90",
    heartRate: 72,
    temperature: 36.6,
    medications: ["Lisinopril 10mg"],
    allergies: ["Pollen"],
    treatmentPlan: "Regular monitoring and low-sodium diet.",
    notes: "Patient is compliant with current medication.",
    nextAppointment: "2024-03-05"
  },
  { 
    id: "2", 
    patientId: "P-2024-002", 
    name: "Jane Smith", 
    lastVisit: "2024-02-04", 
    diagnosis: "Type 2 Diabetes", 
    status: "Active",
    age: 38,
    gender: "Female",
    bloodType: "O-",
    phone: "(555) 987-6543",
    email: "jane.smith@example.com",
    address: "456 Oak Ave, Metropolis",
    height: 165,
    weight: 70,
    bloodPressure: "120/80",
    heartRate: 68,
    temperature: 37.0,
    medications: ["Metformin 500mg"],
    allergies: ["Latex"],
    treatmentPlan: "Blood sugar monitoring and carb-controlled diet.",
    notes: "Requires follow-up on A1C levels.",
    nextAppointment: "2024-02-18"
  },
  { 
    id: "3", 
    patientId: "P-2024-003", 
    name: "Mike Johnson", 
    lastVisit: "2024-02-03", 
    diagnosis: "Asthma", 
    status: "Follow-up",
    age: 28,
    gender: "Male",
    bloodType: "B+",
    phone: "(555) 456-7890",
    email: "mike.j@example.com",
    address: "789 Pine Rd, Smallville",
    height: 175,
    weight: 75,
    bloodPressure: "115/75",
    heartRate: 75,
    temperature: 36.8,
    medications: ["Albuterol Inhaler"],
    allergies: ["Dust Mites"],
    treatmentPlan: "Avoid triggers and use inhaler as needed.",
    nextAppointment: "2024-02-15"
  },
  { 
    id: "4", 
    patientId: "P-2024-004", 
    name: "Sarah Williams", 
    lastVisit: "2024-02-02", 
    diagnosis: "Migraine", 
    status: "Active",
    age: 32,
    gender: "Female",
    bloodType: "AB+",
    phone: "(555) 222-3333",
    email: "sarah.w@example.com",
    address: "101 Maple Ln, Hill Valley",
    height: 170,
    weight: 60,
    bloodPressure: "110/70",
    heartRate: 65,
    temperature: 36.5,
    medications: ["Sumatriptan"],
    treatmentPlan: "Triptans for acute attacks and trigger management."
  },
  { 
    id: "5", 
    patientId: "P-2024-005", 
    name: "Robert Brown", 
    lastVisit: "2024-02-01", 
    diagnosis: "Back Pain", 
    status: "Recovered",
    age: 55,
    gender: "Male",
    bloodType: "A-",
    phone: "(555) 555-4444",
    email: "robert.b@example.com",
    address: "202 Cedar St, Riverdale",
    height: 185,
    weight: 95,
    bloodPressure: "135/85",
    heartRate: 80,
    temperature: 36.9,
    treatmentPlan: "Physical therapy and sporadic NSAIDs."
  },
]

const statusColors: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-500",
  "Follow-up": "bg-amber-500/10 text-amber-500",
  Recovered: "bg-blue-500/10 text-blue-500",
}

export default function MedicalRecordsPage() {
  const [search, setSearch] = React.useState("")
  const [selectedRecord, setSelectedRecord] = React.useState<MedicalRecord | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [records, setRecords] = React.useState<MedicalRecord[]>(MOCK_RECORDS)

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
        <CardContent>
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
                    <Badge className={`border-0 ${statusColors[record.status] ?? "bg-muted text-muted-foreground"}`}>
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