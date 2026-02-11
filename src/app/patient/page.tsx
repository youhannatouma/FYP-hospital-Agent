"use client"

import { Button } from "@/components/ui/button"
import { CalendarPlus, Phone } from "lucide-react"
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

export default function PatientDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Welcome back, Sarah
          </h1>
          <p className="text-sm text-muted-foreground">
            {"Here's your health overview for January 15, 2024"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-border text-foreground">
            <CalendarPlus className="h-4 w-4" />
            Book Appointment
          </Button>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Phone className="h-4 w-4" />
            Contact Doctor
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <StatCards />

      {/* Medical History Timeline + AI Avatar + Upcoming Visits */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MedicalHistoryTimeline />
        </div>
        <div className="flex flex-col gap-6">
          <AIHealthAvatar />
          <UpcomingVisits />
        </div>
      </div>

      {/* Current Medications + Recent Lab Results */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CurrentMedications />
        <RecentLabResults />
      </div>

      {/* Medical Documents */}
      <MedicalDocuments />

      {/* Vitals Tracking + Health Goals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VitalsTracking />
        <HealthGoals />
      </div>

      {/* AI Health Insights */}
      <AIHealthInsights />

      {/* Health Tip */}
      <HealthTip />

      {/* Messages & Communication */}
      <MessagesSection />

      {/* Health Education */}
      <HealthEducation />
    </div>
  )
}
