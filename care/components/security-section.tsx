"use client"

import { Shield, Lock, Eye, FileCheck, Heart, Award } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const securityFeatures = [
  {
    icon: Shield,
    title: "HIPAA Compliance",
    items: [
      "All patient records encrypted end-to-end",
      "Strict access controls per staff role",
      "Mandatory annual compliance training",
      "Regular third-party compliance audits",
    ],
  },
  {
    icon: Lock,
    title: "Patient Data Protection",
    items: [
      "Medical records stored with AES-256 encryption",
      "Secure patient portal with 2FA login",
      "Automated data anonymization for research",
      "30-day data retention policy for guest users",
    ],
  },
  {
    icon: Eye,
    title: "Clinical Quality Assurance",
    items: [
      "Board-certified physicians and specialists",
      "Evidence-based clinical decision support",
      "Peer-reviewed AI diagnostic models",
      "Continuous quality improvement programs",
    ],
  },
]

const certifications = [
  {
    icon: Award,
    title: "Joint Commission Accredited",
    desc: "Gold Seal of Approval",
  },
  {
    icon: Heart,
    title: "AHA Certified Center",
    desc: "Heart & Stroke Care",
  },
  {
    icon: Shield,
    title: "HITRUST CSF Certified",
    desc: "Healthcare Security",
  },
]

export function SecuritySection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1)
  const { ref: certRef, isVisible: certVisible } = useScrollAnimation(0.2)

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header fades in from left */}
        <div
          ref={headerRef}
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            headerVisible
              ? "translate-x-0 opacity-100"
              : "-translate-x-16 opacity-0"
          }`}
        >
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">
            Safety & Compliance
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">
            Your Privacy and Safety Come First
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            We adhere to the highest healthcare regulations and quality
            standards to protect your personal health information.
          </p>
        </div>

        {/* Grid fades in from right */}
        <div
          ref={gridRef}
          className={`mt-16 grid gap-6 lg:grid-cols-3 transition-all duration-700 delay-150 ease-out ${
            gridVisible
              ? "translate-x-0 opacity-100"
              : "translate-x-16 opacity-0"
          }`}
        >
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
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <FileCheck className="h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Certifications bar fades in from left */}
        <div
          ref={certRef}
          className={`mt-10 rounded-2xl border border-border bg-card p-6 transition-all duration-700 delay-300 ease-out ${
            certVisible
              ? "translate-x-0 opacity-100"
              : "-translate-x-16 opacity-0"
          }`}
        >
          <h3 className="mb-4 text-center text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Accreditations & Certifications
          </h3>
          <div className="grid gap-6 sm:grid-cols-3">
            {certifications.map((cert) => (
              <div
                key={cert.title}
                className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <cert.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-card-foreground">
                    {cert.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {cert.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
