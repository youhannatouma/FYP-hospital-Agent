"use client"

import {
  Bot,
  Search,
  Pill,
  FileText,
  CalendarCheck,
  Stethoscope,
} from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Healthcare Assistant",
    description:
      "24/7 intelligent medical Q&A with symptom analysis, first aid guidance, and medication inquiries.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Search,
    title: "Doctor Discovery",
    description:
      "AI-powered doctor matching based on symptoms, with ratings, reviews, and virtual clinic tours.",
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Pill,
    title: "Pharmacy Assistant",
    description:
      "Search medicines, check local pharmacy availability, compare prices, and find alternatives.",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: FileText,
    title: "Report Analysis",
    description:
      "Upload and analyze medical reports with AI-powered insights and plain language explanations.",
    color: "text-orange-500 dark:text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: CalendarCheck,
    title: "Appointment Booking",
    description:
      "Real-time availability, AI-suggested optimal times, video or in-person options with reminders.",
    color: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500/10",
  },
  {
    icon: Stethoscope,
    title: "Symptom Checker",
    description:
      "AI-powered symptom analysis with triage recommendations and specialist referrals.",
    color: "text-indigo-500 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">
            Core Features
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need for Better Healthcare
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            A comprehensive suite of AI-powered tools designed to simplify your
            healthcare experience from start to finish.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
