"use client"

import * as React from "react"
import { CalendarDays, Clock, Filter, Plus, Search, ChevronLeft, ChevronRight, Video, Calendar as CalendarIcon, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppointmentDetailDialog } from "@/components/doctor/dialogs/appointment-detail-dialog"
import { useToast } from "@/hooks/use-toast"
import { useDataStore, type Appointment } from "@/hooks/use-data-store"

// Mock current doctor ID (would come from Clerk in production)
const CURRENT_DOCTOR_ID = "doc-1"

export default function AppointmentsPage() {
  const { toast } = useToast()
  const { getAppointmentsByDoctor } = useDataStore()
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [view, setView] = React.useState<"list" | "calendar">("list")
  const [searchQuery, setSearchQuery] = React.useState("")

  const allAppointments = getAppointmentsByDoctor(CURRENT_DOCTOR_ID)
  
  const filteredAppointments = allAppointments.filter(apt => 
    apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAppointmentClick = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setIsDialogOpen(true)
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "In Progress": return "bg-primary/10 text-primary border-primary/20"
      case "Completed": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "Cancelled": return "bg-destructive/10 text-destructive border-destructive/20"
      case "Pending": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground text-sm">Manage your schedule and patient visits.</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={() => {
            toast({
              title: "Manual Scheduling",
              description: "Use the Patient records page or Admin panel to schedule new appointments for now.",
            })
          }}>
            <Plus className="h-4 w-4" /> Schedule New
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/50">
            <Button 
              variant={view === "list" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-8 gap-2"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" /> List
            </Button>
            <Button 
              variant={view === "calendar" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-8 gap-2"
              onClick={() => setView("calendar")}
            >
              <CalendarIcon className="h-4 w-4" /> Calendar
            </Button>
          </div>
          <div className="h-8 w-[1px] bg-border mx-2 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold whitespace-nowrap">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search patients..." 
              className="pl-9 h-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-3">
          <TabsTrigger value="all">All ({filteredAppointments.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({filteredAppointments.filter(a => a.status === 'Scheduled' || a.status === 'In Progress').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({filteredAppointments.filter(a => a.status === 'Completed').length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {view === "list" ? (
            <div className="grid gap-4">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <Card 
                    key={apt.id} 
                    className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group"
                    onClick={() => handleAppointmentClick(apt)}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="bg-primary/5 p-6 flex flex-col items-center justify-center sm:border-r w-full sm:w-32 border-b sm:border-b-0">
                          <span className="text-lg font-bold text-primary">{apt.time.split(' ')[0]}</span>
                          <span className="text-[10px] uppercase font-bold text-primary/60">{apt.time.split(' ')[1]}</span>
                        </div>
                        <div className="flex-1 p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${apt.patientName}`} />
                              <AvatarFallback>{getInitials(apt.patientName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-bold text-lg leading-none mb-1">{apt.patientName}</h4>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {apt.type}</span>
                                <span className="flex items-center gap-1 truncate max-w-[150px]">
                                  {apt.isVirtual ? <Video className="h-3 w-3 inline mr-1" /> : <MapPin className="h-3 w-3 inline mr-1" />}
                                  {apt.isVirtual ? "Video Call" : "In-person"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className={getStatusColor(apt.status)}>
                              {apt.status}
                            </Badge>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                  <p className="text-muted-foreground">No appointments found.</p>
                </div>
              )}
            </div>
          ) : (
            <Card className="flex items-center justify-center p-20 border-dashed bg-muted/20">
              <div className="text-center space-y-4">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="font-bold text-xl">Monthly Calendar View</h3>
                <p className="text-sm text-muted-foreground max-w-md">The calendar view is being integrated. Currently displaying today's list view for easier management.</p>
                <Button variant="outline" onClick={() => setView("list")}>Back to List View</Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <AppointmentDetailDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        appointment={selectedAppointment}
      />
    </div>
  )
}
