"use client"

import { useState } from "react"
import { m, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarPlus, Phone, Sparkles, ArrowRight } from "lucide-react"
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
import { cn } from "@/lib/utils"

export default function PatientDashboardPage() {
  const [showBookAppointment, setShowBookAppointment] = useState(false)
  const [showContactDoctor, setShowContactDoctor] = useState(false)

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
                Welcome back, Sarah
              </h1>
              <p className="text-muted-foreground mt-4 font-medium text-lg max-w-lg leading-relaxed">
                Your health telemetry is synchronized. Summary for <span className="text-foreground font-black underline decoration-primary/30 underline-offset-4">January 15, 2024</span>.
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

        {/* Core Metrics Staggered */}
        <div className="space-y-12">
          {/* Stat Cards - Horizontal Layer */}
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
             <MessagesSection />
             <div className="flex flex-col gap-8">
                <MedicalDocuments />
                <HealthEducation />
             </div>
          </div>
        </div>

        <div className="mt-12 lg:hidden">
           <HealthTip />
        </div>

        <BookAppointmentDialog open={showBookAppointment} onOpenChange={setShowBookAppointment} />
        <ContactDoctorDialog open={showContactDoctor} onOpenChange={setShowContactDoctor} />
      </m.div>
    </AnimatePresence>
  )
}
