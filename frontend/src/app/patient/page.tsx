"use client"

/**
 * Patient Dashboard Page
 * Follows: Single Responsibility Principle (SRP) — page orchestration only, no data fetching
 * Follows: Dependency Inversion Principle (DIP) — user info via useUserProfile service layer
 */

import { useState, useEffect, useCallback } from "react"
import { m, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CalendarPlus, Phone, Sparkles, ArrowRight, Database, CheckCircle2, Loader2 } from "lucide-react"
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
import { BookAppointmentDialog } from "@/components/patient/dialogs/book-appointment-dialog"
import { ContactDoctorDialog } from "@/components/patient/dialogs/contact-doctor-dialog"
import { useUserProfile } from "@/hooks/use-user-profile"
import { getServiceContainer } from "@/lib/services/service-container"
import { useMedicalRecords } from "@/hooks/use-medical-records"

export default function PatientDashboardPage() {
  const [showBookAppointment, setShowBookAppointment] = useState(false)
  const [showContactDoctor, setShowContactDoctor] = useState(false)
  const [seedLoading, setSeedLoading] = useState(false)
  const [seedDone, setSeedDone] = useState(false)

  // Use service layer profile — not direct Clerk hook (DIP)
  const { profile } = useUserProfile()
  const firstName = profile?.first_name || "there"
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Check if account is empty and banner should show
  const { records, loading: recordsLoading, refetch } = useMedicalRecords()
  const showSeedBanner = !recordsLoading && records.length === 0 && !seedDone

  const handleSeedAccount = useCallback(async () => {
    setSeedLoading(true)
    try {
      const container = getServiceContainer()
      await container.api.post("/users/seed-my-account", {})
      setSeedDone(true)
      // Refresh all dashboard data
      await refetch()
    } catch (err) {
      console.error("[SeedBanner] Failed to seed account:", err)
    } finally {
      setSeedLoading(false)
    }
  }, [refetch])

  return (
    <AnimatePresence mode="wait">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col gap-12 max-w-[1400px] mx-auto pb-24 px-4 sm:px-6"
      >
        {/* Premium Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between pt-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none shadow-inner-glow">
              <Sparkles className="h-3 w-3" />
              Patient Ecosystem
            </div>
            <div>
              <h1 className="text-4xl font-black text-foreground tracking-tight leading-none lg:text-5xl">
                Welcome back, {firstName}
              </h1>
              <p className="text-muted-foreground mt-4 font-medium text-lg max-w-lg leading-relaxed">
                Your health telemetry is synchronized. Summary for{" "}
                <span className="text-foreground font-black underline decoration-primary/30 underline-offset-4">
                  {todayFormatted}
                </span>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="gap-3 border-border/50 text-foreground h-12 px-6 rounded-2xl hover:bg-muted/50 transition-all font-black text-xs uppercase tracking-widest shadow-subtle group"
              onClick={() => setShowBookAppointment(true)}
            >
              <CalendarPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
              Book Session
            </Button>
            <Button
              className="gap-3 bg-slate-900 text-white hover:bg-slate-800 h-12 px-8 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-glow group"
              onClick={() => setShowContactDoctor(true)}
            >
              <Phone className="h-4 w-4 transition-transform group-hover:rotate-12" />
              Consult Specialist
              <ArrowRight className="h-4 w-4 ml-2 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Button>
          </div>
        </div>

        {/* Smart Seed Banner — only shown to new accounts with no data */}
        <AnimatePresence>
          {showSeedBanner && (
            <m.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 shadow-premium"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner-glow">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase tracking-widest text-primary mb-1">New Account Detected</p>
                  <h3 className="text-xl font-black text-foreground">Your dashboard is empty</h3>
                  <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                    Populate your account with realistic clinical history — medical records, appointments, prescriptions, and health goals — to see the full dashboard experience.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-2xl bg-primary text-white hover:bg-primary/90 font-black text-xs uppercase tracking-widest shadow-glow shrink-0 gap-3 disabled:opacity-60"
                  onClick={handleSeedAccount}
                  disabled={seedLoading}
                >
                  {seedLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Seeding...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Seed My Account</>
                  )}
                </Button>
              </div>
            </m.div>
          )}
          {seedDone && (
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-emerald-500"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span className="text-sm font-black uppercase tracking-widest">Account seeded — refreshing dashboard...</span>
            </m.div>
          )}
        </AnimatePresence>

        {/* Core Metrics Staggered */}
        <div className="space-y-12">
          {/* Stat Cards — Horizontal Layer */}
          <section>
            <StatCards />
          </section>

          {/* Asymmetric Core Grid: Timeline + AI Focus */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <MedicalHistoryTimeline />
            </div>
            <div className="flex flex-col gap-8 order-1 lg:order-2">
              <AIHealthAvatar />
              <div className="hidden lg:block">
                <HealthTip />
              </div>
            </div>
          </div>

          {/* Rhythm Shift: Upcoming + Vitals */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="order-2 lg:order-1">
              <UpcomingVisits />
            </div>
            <div className="lg:col-span-2 order-1 lg:order-2">
              <VitalsTracking />
            </div>
          </div>

          {/* Secondary Intelligence: Medications + Labs + Goals */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <CurrentMedications />
            <RecentLabResults />
            <HealthGoals />
          </div>

          {/* Deep Insights Full Width */}
          <section className="pt-8 border-t border-border/30">
            <AIHealthInsights />
          </section>

          {/* Utility Sections Staggered */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <MessagesSection />
            </div>
            <div className="lg:col-span-3 flex flex-col gap-8">
              <MedicalDocuments />
              <HealthEducation />
            </div>
          </div>
        </div>

        <div className="mt-12 lg:hidden">
          <HealthTip />
        </div>

        <BookAppointmentDialog
          open={showBookAppointment}
          onOpenChange={setShowBookAppointment}
        />
        <ContactDoctorDialog
          open={showContactDoctor}
          onOpenChange={setShowContactDoctor}
        />
      </m.div>
    </AnimatePresence>
  )
}
