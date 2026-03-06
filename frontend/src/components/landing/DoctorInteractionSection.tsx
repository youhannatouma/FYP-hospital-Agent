"use client"

import { m } from "framer-motion"
import { Users, Mic, MessageCircle, FileText, Activity, CalendarCheck, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DoctorInteractionSection() {
  return (
    <section className="py-24 lg:py-32 overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          {/* Visual Side: UI Mockups */}
          <div className="flex-1 relative w-full flex items-center justify-center h-[500px]">
            {/* Video Consult Card */}
            <m.div 
              initial={{ opacity: 0, x: 60, rotate: 5 }}
              whileInView={{ opacity: 1, x: 0, rotate: -2 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute z-20 w-80 lg:left-10 lg:top-10 rounded-3xl border border-border bg-card shadow-2xl p-4 overflow-hidden"
            >
              <div className="relative aspect-video rounded-2xl bg-muted overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] text-white font-bold uppercase tracking-wider">Live Consult</span>
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-xs font-bold">Dr. Sarah Mitchell</div>
                  <div className="text-[10px] opacity-80 font-medium">Cardiology Specialist</div>
                </div>
                <div className="h-full w-full flex items-center justify-center opacity-20">
                  <Users size={60} />
                </div>
              </div>
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-border/50">
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <Mic className="h-4 w-4 text-white" />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <Button size="sm" variant="destructive" className="h-8 rounded-lg px-4 text-xs font-bold uppercase tracking-wider">End Call</Button>
              </div>
            </m.div>

            {/* Records Card */}
            <m.div 
              initial={{ opacity: 0, x: -60, rotate: -5 }}
              whileInView={{ opacity: 1, x: 0, rotate: 2 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="absolute z-10 w-80 lg:right-10 lg:bottom-10 rounded-3xl border border-border bg-card shadow-xl p-6 backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Medical Records</h4>
                  <p className="text-[10px] text-muted-foreground font-medium">Last updated: 2h ago</p>
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="h-2 w-20 bg-muted-foreground/20 rounded-full" />
                    </div>
                    <div className="h-2 w-8 bg-primary/20 rounded-full" />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Patient: Sarah Johnson</div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            </m.div>

            {/* Background Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] bg-primary/5 blur-[100px] rounded-full" />
          </div>

          {/* Text Side */}
          <div className="flex-1">
            <m.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-bold tracking-widest text-primary uppercase"
            >
              Human + AI Collaboration
            </m.span>
            <m.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-foreground font-heading"
            >
              The Modern <br />
              <span className="text-gradient">Doctor Visit</span>
            </m.h2>
            <m.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg leading-relaxed text-muted-foreground"
            >
              Bring the clinic to your living room. Integrated video consultations, real-time vital tracking, and secure record sharing make professional care faster and more efficient than ever.
            </m.p>
            
            <m.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10 space-y-6"
            >
              <div className="flex gap-4 p-4 rounded-2xl border border-border bg-card/50 hover:bg-card transition-colors">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Continuous Monitoring</h4>
                  <p className="text-sm text-muted-foreground">Doctors can view your vital trends even between visits using AI-filtered data.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-2xl border border-border bg-card/50 hover:bg-card transition-colors">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CalendarCheck className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Zero Waiting Room</h4>
                  <p className="text-sm text-muted-foreground">Schedule and join calls instantly. AI handles the intake so doctors focus purely on you.</p>
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </div>
    </section>
  )
}
