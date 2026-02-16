"use client"

import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { StatCards } from "@/components/doctor/dashboard/stat-cards"
import { DoctorMedicalTimeline } from "@/components/doctor/dashboard/doctor-history-timeline"
import { DoctorAIAvatar } from "@/components/doctor/dashboard/ai-avatar"
import { UpcomingVisits } from "@/components/doctor/dashboard/upcoming-visits"
import { DoctorMessagesSection } from "@/components/doctor/dashboard/messages-section"
import { RecentPatients } from "@/components/doctor/dashboard/recent-patients"
import { AppointmentsTable } from "@/components/doctor/dashboard/appointement-table"
import { VitalsTracking } from "@/components/doctor/dashboard/vitals-tracking"
import { useUser } from "@clerk/nextjs"
import { useDataStore } from "@/hooks/use-data-store"
import { format } from "date-fns"

export default function DoctorDashboardPage() {
  const { isHydrating } = useDataStore()
  const { toast } = useToast()
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
            Welcome, Dr. {user?.lastName || "Provider"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {"Current clinical overview for " + format(new Date(), "MMMM dd, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              toast({
                title: "Internal Request",
                description: "Opening secure channel to administration...",
              })
            }}
          >
            <Phone className="h-4 w-4" />
            Contact Admin
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <StatCards />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Core Clinical View */}
        <div className="lg:col-span-2 space-y-8">
          <DoctorMedicalTimeline />
          <RecentPatients />
          <AppointmentsTable />
        </div>

        {/* Right Column - AI & Quick Actions */}
        <div className="flex flex-col gap-8">
          <DoctorAIAvatar />
          <UpcomingVisits />
          <VitalsTracking />
        </div>
      </div>

      {/* Bottom Section - Full Width/Communication */}
      <div className="border-t border-sidebar-border pt-8">
        <DoctorMessagesSection />
      </div>
    </div>
  )
}
