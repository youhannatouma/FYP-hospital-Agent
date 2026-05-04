"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import { m } from "framer-motion"
import { Shield, Lock, Eye, Award, Heart, CheckCircle2 } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const securityFeatures = [
  { icon: Shield, title: "HIPAA Compliance", items: ["All patient records encrypted end-to-end", "Strict access controls per staff role", "Mandatory annual compliance training", "Regular third-party compliance audits"] },
  { icon: Lock, title: "Patient Data Protection", items: ["Medical records stored with AES-256 encryption", "Secure patient portal with 2FA login", "Automated data anonymization for research", "30-day data retention policy for guest users"] },
  { icon: Eye, title: "Clinical Quality Assurance", items: ["Board-certified physicians and specialists", "Evidence-based clinical decision support", "Peer-reviewed AI diagnostic models", "Continuous quality improvement programs"] },
]

const certifications = [
  { icon: Award, title: "Joint Commission Accredited" },
  { icon: Heart, title: "AHA Certified Center" },
  { icon: Shield, title: "HITRUST CSF Certified" },
]

export function TrustSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()

  const stats = [
    { value: "250K+", label: "Active Patients", suffix: "" },
    { value: "99.9", label: "System Uptime", suffix: "%" },
    { value: "2048", label: "Bit Encryption", suffix: "" },
    { value: "15", label: "Global Regions", suffix: "" }
  ]

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className="mx-auto max-w-3xl text-center mb-20">
          <m.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-bold tracking-widest text-primary uppercase"
          >
            Reliability & Trust
          </m.span>
          <m.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-foreground font-heading"
          >
            Built on the Most <span className="text-gradient">Secure</span> Foundations
          </m.h2>
          <m.p 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground"
          >
            We adhere to world-class healthcare regulations including HIPAA and GDPR. Your health data is encrypted, anonymized, and never shared without explicit consent.
          </m.p>
        </div>

        {/* Dynamic Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, i) => (
            <m.div 
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl lg:text-5xl font-black text-foreground mb-2">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-sm font-bold text-primary uppercase tracking-wider">{stat.label}</div>
            </m.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {securityFeatures.map((feature, i) => (
            <m.div 
              key={feature.title} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.4 }}
              className="rounded-3xl border border-border bg-card/30 p-8 hover:bg-card/50 transition-colors backdrop-blur-sm"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-6 text-xl font-bold text-card-foreground">{feature.title}</h3>
              <ul className="space-y-4">
                {feature.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground font-medium leading-relaxed">
                    <CheckCircle2 size={16} className="shrink-0 text-primary mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </m.div>
          ))}
        </div>

        <m.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-20 pt-12 border-t border-border flex flex-wrap justify-center gap-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all"
        >
          {certifications.map((cert) => (
            <div key={cert.title} className="flex items-center gap-3">
              <cert.icon className="h-6 w-6 text-foreground" />
              <span className="text-sm font-bold tracking-tight uppercase">{cert.title}</span>
            </div>
          ))}
        </m.div>
      </div>
    </section>
  )
}
