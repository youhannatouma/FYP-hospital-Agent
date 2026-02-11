"use client"

import { Shield, Lock, Eye, FileCheck } from "lucide-react"

const securityFeatures = [
  {
    icon: Shield,
    title: "HIPAA Compliance",
    items: [
      "End-to-end encryption for all data",
      "Audit logging for all access",
      "Business Associate Agreements",
      "Regular compliance audits",
    ],
  },
  {
    icon: Lock,
    title: "Data Protection",
    items: [
      "AES-256 encryption at rest",
      "TLS 1.3 in transit",
      "Role-based access control",
      "Data anonymization",
    ],
  },
  {
    icon: Eye,
    title: "Auditing",
    items: [
      "Real-time threat monitoring",
      "Automated vulnerability scanning",
      "Incident response protocols",
      "Penetration testing",
    ],
  },
]

export function SecuritySection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">
            Security & Compliance
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Enterprise-Grade Security for Healthcare
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Your data is protected with the highest security standards required
            for healthcare applications.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {securityFeatures.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {feature.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <FileCheck className="h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
