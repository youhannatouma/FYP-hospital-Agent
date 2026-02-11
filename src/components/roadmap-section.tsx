"use client"

import { CheckCircle2, Circle, Clock } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const careJourney = [
  {
    phase: "Step 1",
    title: "Symptom Assessment & Triage",
    status: "complete" as const,
    description: "Initial Evaluation",
    tasks: [
      "AI-powered symptom checker analyzes your condition",
      "Severity level is determined (mild, moderate, urgent)",
      "Relevant medical history is reviewed",
      "You receive triage recommendations instantly",
    ],
  },
  {
    phase: "Step 2",
    title: "Doctor Matching & Appointment",
    status: "complete" as const,
    description: "Finding the Right Specialist",
    tasks: [
      "AI matches you with top-rated specialists",
      "View real-time availability and clinic locations",
      "Book in-person or telemedicine appointments",
      "Receive pre-visit instructions and preparation tips",
    ],
  },
  {
    phase: "Step 3",
    title: "Consultation & Diagnosis",
    status: "in-progress" as const,
    description: "Professional Medical Care",
    tasks: [
      "Comprehensive physical or virtual examination",
      "Lab work, imaging, or diagnostic tests ordered",
      "AI assists the doctor in analyzing test results",
      "Clear diagnosis and treatment plan provided",
    ],
  },
  {
    phase: "Step 4",
    title: "Treatment & Follow-Up",
    status: "upcoming" as const,
    description: "Ongoing Care & Recovery",
    tasks: [
      "Prescription management and pharmacy integration",
      "Post-visit follow-up reminders and check-ins",
      "AI monitors your recovery progress over time",
      "Seamless referral to specialists if needed",
    ],
  },
]

function StatusIcon({
  status,
}: {
  status: "complete" | "in-progress" | "upcoming"
}) {
  if (status === "complete")
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
  if (status === "in-progress")
    return <Clock className="h-5 w-5 text-accent" />
  return <Circle className="h-5 w-5 text-muted-foreground" />
}

function StatusBadge({
  status,
}: {
  status: "complete" | "in-progress" | "upcoming"
}) {
  const styles = {
    complete: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    "in-progress": "bg-accent/10 text-accent",
    upcoming: "bg-muted text-muted-foreground",
  }
  const labels = {
    complete: "Available Now",
    "in-progress": "In Progress",
    upcoming: "Coming Soon",
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

export function RoadmapSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollAnimation(0.05)

  return (
    <section className="bg-muted/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header fades in from right */}
        <div
          ref={headerRef}
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            headerVisible
              ? "translate-x-0 opacity-100"
              : "translate-x-16 opacity-0"
          }`}
        >
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">
            Your Care Journey
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">
            From Symptoms to Recovery
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Our streamlined process ensures you get the right care at the right
            time, guided by AI and supported by expert physicians.
          </p>
        </div>

        {/* Steps alternate left/right */}
        <div ref={stepsRef} className="mt-16 flex flex-col gap-6">
          {careJourney.map((step, i) => (
            <div
              key={step.phase}
              className={`rounded-2xl border border-border bg-card p-6 lg:p-8 transition-all duration-700 ease-out ${
                stepsVisible
                  ? "translate-x-0 opacity-100"
                  : i % 2 === 0
                    ? "-translate-x-16 opacity-0"
                    : "translate-x-16 opacity-0"
              }`}
              style={{ transitionDelay: `${150 + i * 120}ms` }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon status={step.status} />
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {step.phase}: {step.title}
                      </h3>
                      <StatusBadge status={step.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {step.tasks.map((task) => (
                  <div
                    key={task}
                    className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                  >
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {task}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
