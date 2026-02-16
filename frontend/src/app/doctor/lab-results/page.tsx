"use client"

import * as React from "react"
import { Search, Filter, FileText, CheckCircle2, AlertCircle, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const mockResults = [
  { id: "LAB-902", patient: "Michael Johnson", test: "Complete Blood Count", date: "2024-02-15", priority: "High", status: "Pending Review" },
  { id: "LAB-855", patient: "Emily Davis", test: "Lipid Profile", date: "2024-02-14", priority: "Medium", status: "Reviewed" },
  { id: "LAB-712", patient: "Lisa Wang", test: "Urinalysis", date: "2024-02-13", priority: "Low", status: "Abnormal" },
  { id: "LAB-690", patient: "Thomas Clark", test: "Liver Function Test", date: "2024-02-12", priority: "Medium", status: "Reviewed" },
]

export default function DoctorLabResultsPage() {
  const { toast } = useToast()
  const [search, setSearch] = React.useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Results</h1>
          <p className="text-muted-foreground text-sm">Review and sign-off on patient diagnostic tests.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export All
          </Button>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl shadow-sm border space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search results by patient or test name..." 
              className="pl-10 h-10 bg-muted/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold uppercase text-[10px]">Test ID</TableHead>
              <TableHead className="font-bold uppercase text-[10px]">Patient Name</TableHead>
              <TableHead className="font-bold uppercase text-[10px]">Test Name</TableHead>
              <TableHead className="font-bold uppercase text-[10px]">Date</TableHead>
              <TableHead className="font-bold uppercase text-[10px]">Priority</TableHead>
              <TableHead className="font-bold uppercase text-[10px]">Status</TableHead>
              <TableHead className="font-bold uppercase text-[10px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockResults.map((result) => (
              <TableRow key={result.id} className="cursor-pointer hover:bg-muted/30">
                <TableCell className="font-mono text-xs">{result.id}</TableCell>
                <TableCell className="font-medium text-sm">{result.patient}</TableCell>
                <TableCell className="text-sm">{result.test}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{result.date}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    result.priority === "High" ? "bg-rose-500/10 text-rose-600 border-rose-200" :
                    result.priority === "Medium" ? "bg-amber-500/10 text-amber-600 border-amber-200" :
                    "bg-blue-500/10 text-blue-600 border-blue-200"
                  }>
                    {result.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                     {result.status === "Reviewed" ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <AlertCircle className="h-3 w-3 text-amber-500" />}
                     <span className="text-xs">{result.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                        toast({ title: "Opening Lab Report", description: `Viewing results for ${result.test} - ${result.patient}` })
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => {
                        toast({ title: "Signing Result", description: `Laboratory result for ${result.patient} has been signed and released.` })
                    }}>
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}