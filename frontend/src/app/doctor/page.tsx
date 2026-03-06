"use client"

import { Button } from "@/components/ui/button"
import {  Phone } from "lucide-react"
import { StatCards } from "@/components/doctor/dashboard/stat-cards"
import { DoctorMedicalTimeline } from "@/components/doctor/dashboard/doctor-history-timeline"
import { DoctorAIAvatar } from "@/components/doctor/dashboard/ai-avatar"
import { UpcomingVisits } from "@/components/doctor/dashboard/upcoming-visits"
import { MessagesSection } from "@/components/patient/dashboard/messages-section"
import { RecentPatients } from "@/components/doctor/dashboard/recent-patients"
import {AppointmentsTable} from "@/components/doctor/dashboard/appointement-table"
import {VitalsTracking} from "@/components/doctor/dashboard/vitals-tracking"


import { ContactAdminDialog } from "@/components/doctor/dialogs/contact-admin-dialog"
import { DoctorNewMessageDialog } from "@/components/doctor/dialogs/new-message-dialog"
import { PatientProfileDialog } from "@/components/doctor/dialogs/patient-profile-dialog"
import { AppointmentDetailDialog } from "@/components/doctor/dialogs/appointment-detail-dialog"
import { RecordDetailDialog } from "@/components/doctor/dialogs/record-detail-dialog"
import { useState } from "react"
import { m } from "framer-motion"

export default function DoctorDashboardPage() {
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)
  const [isPatientProfileOpen, setIsPatientProfileOpen] = useState(false)
  const [isAppointmentDetailOpen, setIsAppointmentDetailOpen] = useState(false)
  const [isRecordDetailOpen, setIsRecordDetailOpen] = useState(false)
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)

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
            Welcome dr, Sarah
          </h1>
          <p className="text-sm text-muted-foreground">
            {"Here's your health overview for January 15, 2024"}
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
            onViewPatient={() => handleViewPatient({ name: "John Doe", id: "00284719" })}
            onViewRecord={handleViewRecord}
          />
        </div>
        <div className="flex flex-col gap-6">
          <DoctorAIAvatar />
          <UpcomingVisits 
            onViewAppointment={handleViewAppointment}
          />
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
      <MessagesSection onNewMessage={() => setIsNewMessageOpen(true)} />

    </m.div>
  );
}
