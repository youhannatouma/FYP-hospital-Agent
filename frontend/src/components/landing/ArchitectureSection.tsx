"use client"

import { Heart, Brain, Stethoscope, Pill, Ambulance, Hospital, Thermometer, Syringe } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const departments = [
  { icon: Heart, title: "Cardiology Center", color: "text-rose-500 dark:text-rose-400", borderColor: "border-rose-500/30", bg: "bg-rose-500/10", items: ["ECG & Echocardiography", "Cardiac Catheterization", "Heart Failure Management", "Arrhythmia Monitoring"] },
  { icon: Brain, title: "Neurology & Psychiatry", color: "text-indigo-500 dark:text-indigo-400", borderColor: "border-indigo-500/30", bg: "bg-indigo-500/10", items: ["EEG & Brain Mapping", "Stroke Rapid Response", "Cognitive Behavioral Therapy", "Sleep Disorder Clinic"] },
  { icon: Stethoscope, title: "Primary & Family Care", color: "text-primary", borderColor: "border-primary/30", bg: "bg-primary/10", items: ["Annual Health Screenings", "Chronic Disease Management", "Immunization Programs", "Pediatric Well-Child Visits"] },
  { icon: Pill, title: "Pharmacy & Lab Services", color: "text-orange-500 dark:text-orange-400", borderColor: "border-orange-500/30", bg: "bg-orange-500/10", items: ["In-House Pharmacy", "Blood Work & Pathology", "Drug Interaction Screening", "Personalized Medication Plans"] },
]

const quickStats = [
  { icon: Ambulance, label: "Emergency Care 24/7" },
  { icon: Hospital, label: "120+ Bed Capacity" },
  { icon: Thermometer, label: "Same-Day Test Results" },
  { icon: Syringe, label: "Vaccination Center" },
]

export function ArchitectureSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1)
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation(0.2)

  return (
    <section id="architecture" className="bg-muted/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${headerVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">Our Departments</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">Comprehensive Medical Specialties</h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">From preventive screenings to complex surgeries, our departments work together to deliver integrated, patient-centered care.</p>
        </div>
        <div ref={gridRef} className={`mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 delay-150 ease-out ${gridVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}>
          {departments.map((dept) => (
            <div key={dept.title} className={`rounded-2xl border bg-card p-6 ${dept.borderColor}`}>
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${dept.bg}`}>
                <dept.icon className={`h-6 w-6 ${dept.color}`} />
              </div>
              <h3 className={`mb-4 text-lg font-semibold ${dept.color}`}>{dept.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {dept.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className={`h-1.5 w-1.5 rounded-full ${dept.bg} ${dept.color}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div ref={statsRef} className={`mt-10 rounded-2xl border border-border bg-card p-6 transition-all duration-700 delay-300 ease-out ${statsVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {quickStats.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-card-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
