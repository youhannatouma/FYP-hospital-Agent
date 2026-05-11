"use client"

/**
 * Doctor Dashboard Page
 * Follows: Single Responsibility Principle (SRP) — page orchestration only
 * Follows: Dependency Inversion Principle (DIP) — user data via useUserProfile, sync via IStatsRepository
 */

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { StatCards } from "@/components/doctor/dashboard/stat-cards"
import { DoctorMedicalTimeline } from "@/components/doctor/dashboard/doctor-history-timeline"
import { DoctorAIAvatar } from "@/components/doctor/dashboard/ai-avatar"
import { UpcomingVisits } from "@/components/doctor/dashboard/upcoming-visits"
import { MessagesSection } from "@/components/patient/dashboard/messages-section"
import { RecentPatients } from "@/components/doctor/dashboard/recent-patients"
import { AppointmentsTable } from "@/components/doctor/dashboard/appointment-table"
import { VitalsTracking } from "@/components/doctor/dashboard/vitals-tracking"

import { ContactAdminDialog } from "@/components/doctor/dialogs/contact-admin-dialog"
import { DoctorNewMessageDialog } from "@/components/doctor/dialogs/new-message-dialog"
import { PatientProfileDialog } from "@/components/doctor/dialogs/patient-profile-dialog"
import { AppointmentDetailDialog } from "@/components/doctor/dialogs/appointment-detail-dialog"
import { RecordDetailDialog } from "@/components/doctor/dialogs/record-detail-dialog"

import { m } from "framer-motion"
import { useUserProfile } from "@/hooks/use-user-profile"

type AppointmentSelection = {
  appointment_id?: string
  id?: string
  patient_name?: string
  patientName?: string
  status?: string
  type?: string
  appointment_type?: string
  date?: string
  appointment_date?: string
  time?: string
  start_time?: string
  location?: string
  room_id?: string
}

export default function DoctorDashboardPage() {
  const { profile } = useUserProfile()
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)
  const [isPatientProfileOpen, setIsPatientProfileOpen] = useState(false)
  const [isAppointmentDetailOpen, setIsAppointmentDetailOpen] = useState(false)
  const [isRecordDetailOpen, setIsRecordDetailOpen] = useState(false)
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)

  const [selectedPatient, setSelectedPatient] = useState<unknown>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentSelection | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<unknown>(null)

  // Derive display name from SOLID service layer instead of useUser directly
  const firstName = profile?.first_name || "Doctor"
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const handleViewPatient = useCallback((patient: unknown) => {
    setSelectedPatient(patient)
    setIsPatientProfileOpen(true)
  }, [])

  const handleViewAppointment = useCallback((appointment: unknown) => {
    setSelectedAppointment(appointment as AppointmentSelection)
    setIsAppointmentDetailOpen(true)
  }, [])

  const handleViewRecord = useCallback((record: unknown) => {
    setSelectedRecord(record)
    setIsRecordDetailOpen(true)
  }, [])

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6"
    >
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Welcome Dr. {firstName}
          </h1>
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            {`Here's your health overview for ${todayFormatted}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsAdminDialogOpen(true)}
          >
            <Phone className="h-4 w-4" />
            Contact Admin
          </Button>
        </div>
      </div>

      {/* Dialogs */}
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
        onStatusChanged={() => {
          setIsAppointmentDetailOpen(false)
          // Future: trigger refetch instead of reload
          window.location.reload()
        }}
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
            onViewPatient={(patient: unknown) =>
              handleViewPatient(patient || { name: "Unknown Patient", id: "" })
            }
            onViewRecord={handleViewRecord}
          />
        </div>
        <div className="flex flex-col gap-6">
          <DoctorAIAvatar />
          <UpcomingVisits onViewAppointment={handleViewAppointment} />
        </div>
      </div>

      <div className="mt-6">
        <RecentPatients onSelectPatient={handleViewPatient} />
      </div>

      <div className="mt-6">
        <VitalsTracking />
      </div>

      <div className="mt-6">
        <AppointmentsTable onSelectAppointment={handleViewAppointment} />
      </div>

      {/* Messages & Communication */}
      <MessagesSection onNewMessage={() => setIsNewMessageOpen(true)} aiAssistantPath="/doctor/ai-assistant" />
    </m.div>
  )
}
