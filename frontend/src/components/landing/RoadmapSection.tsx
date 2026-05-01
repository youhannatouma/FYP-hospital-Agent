"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import { m } from "framer-motion"
import { CheckCircle2, Clock, Circle } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const careJourney = [
  { phase: "Step 1", title: "Symptom Assessment & Triage", status: "complete" as const, description: "Initial Evaluation", tasks: ["AI-powered symptom checker analyzes your condition", "Severity level is determined (mild, moderate, urgent)", "Relevant medical history is reviewed", "You receive triage recommendations instantly"] },
  { phase: "Step 2", title: "Doctor Matching & Appointment", status: "complete" as const, description: "Finding the Right Specialist", tasks: ["AI matches you with top-rated specialists", "View real-time availability and clinic locations", "Book in-person or telemedicine appointments", "Receive pre-visit instructions and preparation tips"] },
  { phase: "Step 3", title: "Consultation & Diagnosis", status: "in-progress" as const, description: "Professional Medical Care", tasks: ["Comprehensive physical or virtual examination", "Lab work, imaging, or diagnostic tests ordered", "AI assists the doctor in analyzing test results", "Clear diagnosis and treatment plan provided"] },
  { phase: "Step 4", title: "Treatment & Follow-Up", status: "upcoming" as const, description: "Ongoing Care & Recovery", tasks: ["Prescription management and pharmacy integration", "Post-visit follow-up reminders and check-ins", "AI monitors your recovery progress over time", "Seamless referral to specialists if needed"] },
]

function StatusIcon({ status }: { status: "complete" | "in-progress" | "upcoming" }) {
  if (status === "complete") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
  if (status === "in-progress") return <Clock className="h-5 w-5 text-accent" />
  return <Circle className="h-5 w-5 text-muted-foreground" />
}

function StatusBadge({ status }: { status: "complete" | "in-progress" | "upcoming" }) {
  const styles = { complete: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", "in-progress": "bg-accent/10 text-accent", upcoming: "bg-muted text-muted-foreground" }
  const labels = { complete: "Available Now", "in-progress": "In Progress", upcoming: "Coming Soon" }
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}>{labels[status]}</span>
}

export function RoadmapSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollAnimation(0.05)

  return (
    <section id="roadmap" className="bg-muted/50 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${headerVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          <m.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-bold tracking-widest text-primary uppercase"
          >
            Your Care Journey
          </m.span>
          <m.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-balance text-4xl font-black tracking-tight text-foreground sm:text-5xl font-heading"
          >
            From Symptoms to Recovery
          </m.h2>
          <m.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            Our streamlined process ensures you get the right care at the right time, guided by AI and supported by expert physicians.
          </m.p>
        </div>
        <div ref={stepsRef} className="mt-20 flex flex-col gap-8">
          {careJourney.map((step, i) => (
            <m.div 
              key={step.phase} 
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="group relative rounded-[2rem] border border-border bg-card p-8 lg:p-10 shadow-sm transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-6">
                  <div className="mt-1">
                    <StatusIcon status={step.status} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-4 mb-2">
                      <span className="text-xs font-bold text-primary uppercase tracking-widest">{step.phase}</span>
                      <h3 className="text-2xl font-bold text-card-foreground">{step.title}</h3>
                      <StatusBadge status={step.status} />
                    </div>
                    <p className="text-base text-muted-foreground font-medium">{step.description}</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {step.tasks.map((task) => (
                  <div key={task} className="flex items-center gap-3 rounded-2xl bg-muted/30 px-4 py-3 text-sm text-muted-foreground font-medium border border-transparent group-hover:border-primary/10 transition-colors">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary/40 group-hover:text-primary transition-colors" />
                    {task}
                  </div>
                ))}
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
