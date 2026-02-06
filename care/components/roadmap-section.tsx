"use client"

import { CheckCircle2, Circle, Clock } from "lucide-react"

const phases = [
  {
    phase: "Phase 1",
    title: "Core Setup",
    status: "complete" as const,
    duration: "Weeks 1-4",
    tasks: [
      "Project architecture setup",
      "Authentication system",
      "Basic UI components",
      "Database schema design",
    ],
  },
  {
    phase: "Phase 2",
    title: "AI Features",
    status: "in-progress" as const,
    duration: "Weeks 5-10",
    tasks: [
      "AI chat assistant",
      "Symptom analysis engine",
      "Voice interaction",
      "Doctor matching algorithm",
    ],
  },
  {
    phase: "Phase 3",
    title: "Advanced Features",
    status: "upcoming" as const,
    duration: "Weeks 11-16",
    tasks: [
      "Telemedicine integration",
      "Payment processing",
      "Report analysis AI",
      "Mental health module",
    ],
  },
  {
    phase: "Phase 4",
    title: "Polish & Testing",
    status: "upcoming" as const,
    duration: "Weeks 17-20",
    tasks: [
      "Performance optimization",
      "Security audit",
      "User acceptance testing",
      "Production deployment",
    ],
  },
]

function StatusIcon({ status }: { status: "complete" | "in-progress" | "upcoming" }) {
  if (status === "complete") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
  if (status === "in-progress") return <Clock className="h-5 w-5 text-accent" />
  return <Circle className="h-5 w-5 text-muted-foreground" />
}

function StatusBadge({ status }: { status: "complete" | "in-progress" | "upcoming" }) {
  const styles = {
    complete: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    "in-progress": "bg-accent/10 text-accent",
    upcoming: "bg-muted text-muted-foreground",
  }
  const labels = {
    complete: "Complete",
    "in-progress": "In Progress",
    upcoming: "Upcoming",
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export function RoadmapSection() {
  return (
    <section className="bg-muted/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">
            Implementation Roadmap
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A 20-Week Development Plan
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Our structured approach ensures every feature is built with quality,
            security, and performance in mind.
          </p>
        </div>

        <div className="mt-16 flex flex-col gap-6">
          {phases.map((phase) => (
            <div
              key={phase.phase}
              className="rounded-2xl border border-border bg-card p-6 lg:p-8"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon status={phase.status} />
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {phase.phase}: {phase.title}
                      </h3>
                      <StatusBadge status={phase.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {phase.duration}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {phase.tasks.map((task) => (
                  <div
                    key={task}
                    className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
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
