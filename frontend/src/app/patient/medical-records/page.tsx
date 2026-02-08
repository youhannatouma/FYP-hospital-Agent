import { FileText, Download, Filter, Search, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const records = [
  {
    id: "REC-001",
    date: "2024-02-05",
    type: "Lab Result",
    doctor: "Dr. Sarah Smith",
    title: "Complete Blood Count (CBC)",
    status: "Final",
  },
  {
    id: "REC-002",
    date: "2024-01-20",
    type: "Prescription",
    doctor: "Dr. Michael Ross",
    title: "Amoxicillin 500mg Course",
    status: "Active",
  },
  {
    id: "REC-003",
    date: "2023-12-15",
    type: "Diagnosis",
    doctor: "Dr. Emily Chen",
    title: "Acute Bronchitis",
    status: "Archived",
  },
  {
    id: "REC-004",
    date: "2023-11-10",
    type: "Imaging",
    doctor: "Dr. James Wilson",
    title: "Chest X-Ray",
    status: "Final",
  },
]

export default function MedicalRecordsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Medical Records</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Download className="mr-2 h-4 w-4" /> Download All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Health Records</CardTitle>
          <CardDescription>
            Access and manage your medical history, test results, and prescriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 mb-4">
             <div className="flex items-center flex-1 gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search records..." className="h-8 w-[150px] lg:w-[250px]" />
             </div>
             <div className="flex items-center gap-2">
                <Select defaultValue="all">
                    <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="lab">Lab Results</SelectItem>
                        <SelectItem value="prescription">Prescriptions</SelectItem>
                        <SelectItem value="imaging">Imaging</SelectItem>
                    </SelectContent>
                </Select>
                 <Button variant="outline" size="sm" className="h-8 lg:flex">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
             </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.id}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                         <Badge variant="outline">{record.type}</Badge>
                    </TableCell>
                    <TableCell>{record.title}</TableCell>
                    <TableCell>{record.doctor}</TableCell>
                    <TableCell>
                        <Badge variant={record.status === "Active" ? "default" : "secondary"}>
                            {record.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                            </Button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
