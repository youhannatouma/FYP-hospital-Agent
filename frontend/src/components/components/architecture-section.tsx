"use client"

import {
  Monitor,
  Server,
  Brain,
  Plug,
  Database,
  Lock,
  Cloud,
  Zap,
} from "lucide-react"

const layers = [
  {
    icon: Monitor,
    title: "Frontend Layer",
    color: "text-blue-500 dark:text-blue-400",
    borderColor: "border-blue-500/30",
    bg: "bg-blue-500/10",
    items: [
      "Next.js 16 App Router",
      "TypeScript + React 19",
      "Tailwind CSS + shadcn/ui",
      "Real-time WebSocket",
    ],
  },
  {
    icon: Server,
    title: "Backend Layer",
    color: "text-emerald-500 dark:text-emerald-400",
    borderColor: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    items: [
      "Node.js + Express",
      "REST + GraphQL APIs",
      "JWT Authentication",
      "Rate Limiting & CORS",
    ],
  },
  {
    icon: Brain,
    title: "AI/ML Services",
    color: "text-primary",
    borderColor: "border-primary/30",
    bg: "bg-primary/10",
    items: [
      "NLP Symptom Analysis",
      "Voice Recognition",
      "Emotion Detection",
      "Medical Image AI",
    ],
  },
  {
    icon: Plug,
    title: "Integrations",
    color: "text-orange-500 dark:text-orange-400",
    borderColor: "border-orange-500/30",
    bg: "bg-orange-500/10",
    items: [
      "Payment Gateway",
      "SMS/Email Notifications",
      "Video Conferencing",
      "Pharmacy APIs",
    ],
  },
]

const infrastructure = [
  { icon: Database, label: "PostgreSQL + Redis" },
  { icon: Cloud, label: "Cloud Hosted" },
  { icon: Lock, label: "End-to-End Encryption" },
  { icon: Zap, label: "Edge Computing" },
]

export function ArchitectureSection() {
  return (
    <section id="architecture" className="bg-muted/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">
            System Architecture
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for Scale, Security, and Speed
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            A modern, microservices-based architecture designed for reliability
            and performance at healthcare scale.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {layers.map((layer) => (
            <div
              key={layer.title}
              className={`rounded-2xl border bg-card p-6 ${layer.borderColor}`}
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${layer.bg}`}>
                <layer.icon className={`h-6 w-6 ${layer.color}`} />
              </div>
              <h3 className={`mb-4 text-lg font-semibold ${layer.color}`}>
                {layer.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {layer.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className={`h-1.5 w-1.5 rounded-full ${layer.bg} ${layer.color}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Infrastructure bar */}
        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {infrastructure.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-card-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
