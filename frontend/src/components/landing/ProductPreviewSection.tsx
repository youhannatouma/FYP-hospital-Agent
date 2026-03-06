"use client"

import { m } from "framer-motion"
import { Activity } from "lucide-react"

export function ProductPreviewSection() {
  const tabs = [
    { title: "Patient Mobile", desc: "Access records, book appointments, and chat with AI on the go." },
    { title: "Doctor Dashboard", desc: "A powerful command center for managing patient lists and consultations." },
    { title: "Clinical Insights", desc: "AI-driven analytics for better clinical decision making." }
  ]

  return (
    <section className="py-24 lg:py-32 bg-muted/50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <m.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black tracking-tight text-foreground font-heading"
          >
            Experience the <span className="text-gradient">Platform</span>
          </m.h2>
          <m.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            A seamless experience designed for both patients and healthcare professionals.
          </m.p>
        </div>

        <div className="relative">
          {/* Main Preview Screen */}
          <m.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative mx-auto max-w-5xl rounded-3xl border border-border bg-card shadow-[0_0_50px_-12px_rgba(0,184,156,0.3)] overflow-hidden aspect-[16/10] flex items-center justify-center p-8 lg:p-12 mb-12"
          >
            <div className="w-full h-full rounded-2xl bg-muted/50 border border-border flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group">
              <Activity className="h-16 w-16 text-primary mb-6 animate-pulse-slow" />
              <h3 className="text-2xl font-bold mb-4">Patient Care Dashboard</h3>
              <p className="max-w-md text-muted-foreground mb-8 font-medium">Visualizing real-time health metrics, upcoming appointments, and AI recommendations in a clean, unified view.</p>
              
              {/* Mock UI Elements */}
              <div className="absolute top-8 right-8 w-32 h-32 rounded-full border border-primary/20 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-primary/40 flex items-center justify-center">
                  <div className="text-xs font-bold text-primary">82 BPM</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 w-full mt-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-xl border border-border bg-card/80 p-4 transition-transform group-hover:-translate-y-2">
                    <div className="h-2 w-12 bg-primary/20 rounded-full mb-2" />
                    <div className="h-3 w-full bg-muted rounded-full" />
                  </div>
                ))}
              </div>
              
              {/* Subtle mesh background inside preview */}
              <div className="absolute inset-0 -z-10 opacity-30 mesh-gradient" />
            </div>
            
            {/* Glass Overlays */}
            <div className="absolute top-1/4 -left-8 w-48 h-48 bg-primary/5 blur-3xl" />
            <div className="absolute bottom-1/4 -right-8 w-48 h-48 bg-accent/5 blur-3xl" />
          </m.div>

          {/* Quick Selection / Navigation */}
          <div className="grid sm:grid-cols-3 gap-6">
            {tabs.map((tab, i) => (
              <m.div 
                key={tab.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i + 0.5 }}
                className="p-6 rounded-2xl border border-border bg-card/50 hover:bg-card transition-all cursor-pointer group"
              >
                <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{tab.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{tab.desc}</p>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
