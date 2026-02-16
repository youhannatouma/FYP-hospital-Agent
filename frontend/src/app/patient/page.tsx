"use client"

import { BookAppointmentDialog } from "@/components/patient/appointments/book-appointment-dialog"
import { ContactDoctorDialog } from "@/components/patient/dashboard/dialogs/contact-doctor-dialog"
import { StatCards } from "@/components/patient/dashboard/stat-cards"
import { MedicalHistoryTimeline } from "@/components/patient/dashboard/medical-history-timeline"
import { AIHealthAvatar } from "@/components/patient/dashboard/ai-health-avatar"
import { UpcomingVisits } from "@/components/patient/dashboard/upcoming-visits"
import { VitalsTracking } from "@/components/patient/dashboard/vitals-tracking"
import { HealthGoals } from "@/components/patient/dashboard/health-goals"
import { AIHealthInsights } from "@/components/patient/dashboard/ai-health-insights"
import { HealthTip } from "@/components/patient/dashboard/health-tip"
import { MessagesSection } from "@/components/patient/dashboard/messages-section"
import { HealthEducation } from "@/components/patient/dashboard/health-education"
import { CurrentMedications } from "@/components/patient/dashboard/current-medications"
import { RecentLabResults } from "@/components/patient/dashboard/recent-lab-results"
import { MedicalDocuments } from "@/components/patient/dashboard/medical-documents"
import { useDataStore } from "@/hooks/use-data-store"
import { useUser } from "@clerk/nextjs"
import { format } from "date-fns"

export default function PatientDashboardPage() {
  const { isHydrating } = useDataStore()
  const { user } = useUser()

  if (isHydrating) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.firstName || "Friend"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {"Your health summary for " + format(new Date(), "MMMM dd, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BookAppointmentDialog />
          <ContactDoctorDialog />
        </div>
      </div>

      {/* Stat Cards */}
      <StatCards />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-8">
          <MedicalHistoryTimeline />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <CurrentMedications />
            <RecentLabResults />
          </div>
          <MedicalDocuments />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          <AIHealthAvatar />
          <UpcomingVisits />
          <VitalsTracking />
          <HealthGoals />
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
         <div className="lg:col-span-2">
            <AIHealthInsights />
         </div>
         <HealthTip />
      </div>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border pt-8 space-y-8">
        <MessagesSection />
        <HealthEducation />
      </div>
    </div>
  )
}
