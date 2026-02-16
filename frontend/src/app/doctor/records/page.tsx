"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useDataStore } from "@/hooks/use-data-store"
import { Plus, Search, Filter, Eye, Edit, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { AddRecordDialog } from "@/components/doctor/dialogs/add-record-dialog"
import { RecordDetailDialog } from "@/components/doctor/dialogs/record-detail-dialog"

export default function MedicalRecords() {
  const { user } = useUser()
  const { toast } = useToast()
  const { records } = useDataStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)

  // Filter records for this doctor (using name or ID mapping if available, for now using all clinical records in the doctor view)
  const doctorRecords = records; // In a real app we'd filter by doctorId === user.id

  const filteredRecords = doctorRecords.filter(r =>
    r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDownload = (record: any) => {
    setDownloadingId(record.id)
    setTimeout(() => {
      setDownloadingId(null)
      toast({
        title: "Download Complete",
        description: `Clinical record for ${record.patientName} saved.`,
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Clinical Records</h1>
        <Button
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search patient records, IDs or diagnoses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2"
            />
          </div>
          <Button
            variant="outline"
            className="border-border text-foreground flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Advanced Filter
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Patient</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Record ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Diagnosis</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-xs">
                        {record.patientName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium text-foreground">{record.patientName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{record.id}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{record.date}</td>
                <td className="px-6 py-4 text-sm font-medium text-foreground">{record.diagnosis}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' :
                    record.status === 'Follow-up' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-blue-500/10 text-blue-600'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-primary/5 hover:text-primary"
                      onClick={() => {
                        setSelectedRecord(record)
                        setIsDetailDialogOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      disabled={downloadingId === record.id}
                      onClick={() => handleDownload(record)}
                    >
                      {downloadingId === record.id ? (
                        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredRecords.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No medical records found matching your search.
          </div>
        )}
      </div>

      <AddRecordDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />

      <RecordDetailDialog 
        open={isDetailDialogOpen} 
        onOpenChange={setIsDetailDialogOpen} 
        record={selectedRecord}
      />
    </div>
  )
}
