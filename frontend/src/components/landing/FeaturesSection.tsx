"use client"

import { m } from "framer-motion"
import { Bot, Search, Pill, FileText, CalendarCheck, Stethoscope } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const features = [
  { icon: Bot, title: "AI Healthcare Assistant", description: "24/7 intelligent medical Q&A with symptom analysis, first aid guidance, and medication inquiries.", color: "text-primary", bg: "bg-primary/10" },
  { icon: Search, title: "Doctor Discovery", description: "AI-powered doctor matching based on symptoms, with ratings, reviews, and virtual clinic tours.", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10" },
  { icon: Pill, title: "Pharmacy Assistant", description: "Search medicines, check local pharmacy availability, compare prices, and find alternatives.", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: FileText, title: "Report Analysis", description: "Upload and analyze medical reports with AI-powered insights and plain language explanations.", color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500/10" },
  { icon: CalendarCheck, title: "Appointment Booking", description: "Real-time availability, AI-suggested optimal times, video or in-person options with reminders.", color: "text-rose-500 dark:text-rose-400", bg: "bg-rose-500/10" },
  { icon: Stethoscope, title: "Symptom Checker", description: "AI-powered symptom analysis with triage recommendations and specialist referrals.", color: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-500/10" },
]

export function FeaturesSection() {
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <section id="features" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <m.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold tracking-widest text-primary uppercase"
          >
            Clinical Excellence
          </m.span>
          <m.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-balance text-4xl font-black tracking-tight text-foreground sm:text-5xl font-heading"
          >
            Intelligent Tools for Modern Healthcare
          </m.h2>
          <m.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            Empowering both patients and healthcare providers with a comprehensive suite of AI-driven capabilities.
          </m.p>
        </div>

        <m.div 
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          animate={gridVisible ? "visible" : "hidden"}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <m.div 
              key={feature.title} 
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative rounded-3xl border border-border bg-card/50 p-8 shadow-sm transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
            >
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-card-foreground">{feature.title}</h3>
              <p className="text-base leading-relaxed text-muted-foreground">{feature.description}</p>
              
              <div className={`absolute bottom-0 left-8 right-8 h-1 rounded-t-full opacity-0 transition-opacity group-hover:opacity-100 ${feature.bg.replace('/10', '/30')}`} />
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  )
}
