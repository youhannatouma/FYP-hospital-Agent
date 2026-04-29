"use client"

import { Button } from "@/components/ui/button"
import {  Phone } from "lucide-react"
import { StatCards } from "@/components/doctor/dashboard/stat-cards"
import { DoctorMedicalTimeline } from "@/components/doctor/dashboard/doctor-history-timeline"
import { DoctorAIAvatar } from "@/components/doctor/dashboard/ai-avatar"
import { UpcomingVisits } from "@/components/doctor/dashboard/upcoming-visits"
import { DoctorMessagesSection as MessagesSection } from "@/components/doctor/dashboard/messages-section"
import { RecentPatients } from "@/components/doctor/dashboard/recent-patients"
import {AppointmentsTable} from "@/components/doctor/dashboard/appointment-table"
import {VitalsTracking} from "@/components/doctor/dashboard/vitals-tracking"
import { LabManagement } from "@/components/admin/lab-management"
import { PharmacyManagement } from "@/components/admin/pharmacy-management"
import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"


import { ContactAdminDialog } from "@/components/doctor/dialogs/contact-admin-dialog"
import { DoctorNewMessageDialog } from "@/components/doctor/dialogs/new-message-dialog"
import { PatientProfileDialog } from "@/components/doctor/dialogs/patient-profile-dialog"
import { AppointmentDetailDialog } from "@/components/doctor/dialogs/appointment-detail-dialog"
import { RecordDetailDialog } from "@/components/doctor/dialogs/record-detail-dialog"
import { useState } from "react"
import { m } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"
import { useUser } from "@clerk/nextjs"

export default function DoctorDashboardPage() {
  const { toast } = useToast()
  const { user } = useUser()
  const { admin } = useHospital()
  const { getToken } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)
  const [isPatientProfileOpen, setIsPatientProfileOpen] = useState(false)
  const [isAppointmentDetailOpen, setIsAppointmentDetailOpen] = useState(false)
  const [isRecordDetailOpen, setIsRecordDetailOpen] = useState(false)
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)

  const firstName = user?.firstName || "Doctor"
  const isLabDoctor = user?.publicMetadata?.specialty === 'Laboratory'
  const isPharmacist = user?.publicMetadata?.specialty === 'Pharmacy'
  const isAdmin = user?.publicMetadata?.role === 'admin'
  const todayFormatted = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

  const handleSyncRegistry = async () => {
    setIsSyncing(true)
    try {
      const token = await getToken()
      // Note: syncClerk needs to be added to AdminManager
      const response = await admin.syncClerkRegistry(token || undefined)
      toast({
        title: "Registry Synchronized",
        description: response.message || "All clinicians and patients have been mapped to the local registry.",
      })
      // Reload to show new data
      window.location.reload()
    } catch (error) {
      console.error('Sync failed', error)
      toast({
        title: "Sync Error",
        description: "Could not communicate with the authentication server. Ensure you have Admin privileges.",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleViewPatient = (patient: any) => {
    setSelectedPatient(patient)
    setIsPatientProfileOpen(true)
  }

  const handleViewAppointment = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsAppointmentDetailOpen(true)
  }

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record)
    setIsRecordDetailOpen(true)
  }

  // If it's a lab doctor, show a specialized dashboard
  if (isLabDoctor) {
    return (
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-foreground tracking-tight">Diagnostic Command Center</h1>
          <p className="text-muted-foreground font-medium">
            Welcome Dr. {firstName}. Manage clinical laboratory requests and bio-data analysis.
          </p>
        </div>
        
        <LabManagement />
        
        <div className="mt-8">
          <MessagesSection onNewMessage={() => setIsNewMessageOpen(true)} />
        </div>
      </m.div>
    )
  }

  // If it's a pharmacist, show specialized dispensary dashboard
  if (isPharmacist) {
    return (
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-foreground tracking-tight">Pharmaceutical Dispensary</h1>
          <p className="text-muted-foreground font-medium">
            Welcome Dr. {firstName}. Manage e-prescriptions and medication fulfillment.
          </p>
        </div>
        
        <PharmacyManagement />
        
        <div className="mt-8">
          <MessagesSection onNewMessage={() => setIsNewMessageOpen(true)} />
        </div>
      </m.div>
    )
  }

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6"
    >
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {selectedPatient ? `Reviewing: ${selectedPatient.name}` : `Welcome Dr. ${firstName}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedPatient 
                ? `Clinical deep-dive for ${selectedPatient.name}. Patient ID: ${selectedPatient.id}`
                : `Here's your health overview for ${todayFormatted}`
              }
            </p>
          </div>
          {selectedPatient && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => setSelectedPatient(null)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button 
              variant="outline"
              className="gap-2 border-border/50 font-bold"
              onClick={handleSyncRegistry}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? "Syncing..." : "Sync Registry"}
            </Button>
          )}
          <Button 
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsAdminDialogOpen(true)}
          >
            <Phone className="h-4 w-4" />
            Contact Admin
          </Button>
        </div>
      </div>

      <ContactAdminDialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen} />
      <DoctorNewMessageDialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen} />
      <PatientProfileDialog 
        open={isPatientProfileOpen} 
        onOpenChange={setIsPatientProfileOpen} 
        patient={selectedPatient} 
      />
      <AppointmentDetailDialog 
        open={isAppointmentDetailOpen} 
        onOpenChange={setIsAppointmentDetailOpen} 
        appointment={selectedAppointment} 
      />
      <RecordDetailDialog 
        open={isRecordDetailOpen} 
        onOpenChange={setIsRecordDetailOpen} 
        record={selectedRecord} 
      />

      {/* Stat Cards */}
      <StatCards />

      {/* Medical History Timeline + AI Avatar + Upcoming Visits */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DoctorMedicalTimeline 
            selectedPatient={selectedPatient}
            onViewPatient={handleViewPatient}
            onViewRecord={handleViewRecord}
          />
        </div>
        <div className="flex flex-col gap-6">
          <DoctorAIAvatar selectedPatient={selectedPatient} />
          <UpcomingVisits 
            onViewAppointment={handleViewAppointment}
          />
        </div>
      </div>

      <div className="mt-6">
        <RecentPatients onSelectPatient={(p) => setSelectedPatient(p)} />
      </div>

      <div className="mt-6">
        <VitalsTracking selectedPatient={selectedPatient} />
      </div>

      <div className="mt-6">
        <AppointmentsTable onSelectAppointment={handleViewAppointment} />
      </div>

      {/* Messages & Communication */}
      <MessagesSection onNewMessage={() => setIsNewMessageOpen(true)} />

    </m.div>
  );
}
