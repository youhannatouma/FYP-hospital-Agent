"use client"

import { Button } from "@/components/ui/button"
import {  Phone } from "lucide-react"
import { StatCards } from "@/components/doctor/dashboard/stat-cards"
import { DoctorMedicalTimeline } from "@/components/doctor/dashboard/doctor-history-timeline"
import { AIHealthAvatar } from "@/components/patient/dashboard/ai-health-avatar"
import { UpcomingVisits } from "@/components/doctor/dashboard/upcoming-visits"
import { MessagesSection } from "@/components/patient/dashboard/messages-section"
import { RecentPatients } from "@/components/doctor/dashboard/recent-patients"
import {AppointmentsTable} from "@/components/doctor/dashboard/appointement-table"
import {VitalsTracking} from "@/components/doctor/dashboard/vitals-tracking"


export default function PatientDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
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
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Phone className="h-4 w-4" />
            Contact Admin
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <StatCards />

      {/* Medical History Timeline + AI Avatar + Upcoming Visits */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DoctorMedicalTimeline />
        </div>
        <div className="flex flex-col gap-6">
          <AIHealthAvatar />
          <UpcomingVisits />
        </div>
      </div>

      <div className="mt-6">
        <RecentPatients />

      </div>
        <div className="mt-6">
        <VitalsTracking />
      </div>
      <div  className="mt-6">

        <AppointmentsTable />
      </div>
      {/* Current Medications + Recent Lab Results */}
      

      {/* Messages & Communication */}
      <MessagesSection />

      {/* Health Education */}
    </div>
  );
}
