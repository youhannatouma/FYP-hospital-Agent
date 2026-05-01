// @ts-nocheck
"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import Link from "next/link"
import { m } from "framer-motion"
import { Bot, Mic, MessageCircle, Brain, Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const aiCapabilities = [
  { icon: MessageCircle, title: "Chat Assistant", description: "Have a conversation with our AI assistant anytime. Discuss symptoms, medications, and get instant guidance." },
  { icon: Mic, title: "Voice Interaction", description: "Speak naturally with our AI. Perfect for accessibility and hands-free healthcare navigation." },
  { icon: Brain, title: "Symptom Analysis", description: "Advanced AI-powered symptom analysis with triage recommendations and specialist matching." },
  { icon: Heart, title: "Mental Health", description: "AI-powered emotion analysis, mood tracking, mental health assessments, and therapist matching." },
  { icon: Camera, title: "Visual Analysis", description: "Upload images for AI-assisted visual analysis. Skin conditions, medication identification, and more." },
  { icon: ShieldCheck, title: "Report Interpretation", description: "Get plain language explanations of lab results and medical reports powered by medical AI." },
]

function Camera(props: unknown) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
  )
}

function ShieldCheck(props: unknown) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
  )
}

export function AISection() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation(0.1)

  const messages = [
    { role: "patient", text: "I've been feeling persistent fatigue and slight dizziness lately." },
    { role: "ai", text: "I understand. Have you noticed any other symptoms like shortness of breath or changes in your sleep patterns?" },
    { role: "patient", text: "Yes, I've had some trouble sleeping and occasional headaches." },
    { role: "ai", text: "Based on these symptoms, I recommend checking your blood pressure and possibly scheduling a consultation with a General Practitioner. Would you like me to find a doctor for you?" }
  ]

  return (
    <section id="ai" className="py-24 lg:py-32 bg-muted/30 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Chat Interface Mockup */}
          <m.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full max-w-[500px]"
          >
            <div className="rounded-3xl border border-border bg-card shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="bg-primary/5 p-6 border-b border-border flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center relative">
                  <Bot className="h-6 w-6 text-primary" />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Clinical Intelligence</h4>
                  <p className="text-xs text-muted-foreground font-medium">Always Online • Secure</p>
                </div>
              </div>
              <div className="p-6 space-y-6 h-[400px] overflow-y-auto">
                {messages.map((msg, i) => (
                  <m.div 
                    key={i}
                    initial={{ opacity: 0, x: msg.role === "ai" ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 + 0.3 }}
                    className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm font-medium shadow-sm ${
                      msg.role === "ai" 
                        ? "bg-muted text-foreground rounded-tl-sm" 
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    }`}>
                      {msg.text}
                    </div>
                  </m.div>
                ))}
                
                {/* Typing Indicator */}
                <m.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.5, repeat: Infinity, repeatType: "reverse" }}
                  className="flex justify-start"
                >
                  <div className="bg-muted px-4 py-2 rounded-full flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </m.div>
              </div>
              <div className="p-4 border-t border-border bg-muted/20">
                <div className="rounded-xl border border-border bg-background px-4 py-3 flex items-center gap-3">
                  <Mic className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground flex-1">Describe your symptoms...</span>
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </m.div>

          {/* Right: Content */}
          <div className="flex-1">
            <m.span 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-sm font-bold tracking-widest text-primary uppercase"
            >
              24/7 Virtual Support
            </m.span>
            <m.h2 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-foreground font-heading"
            >
              Your Personal AI <br />
              <span className="text-gradient">Care Companion</span>
            </m.h2>
            <m.p 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg leading-relaxed text-muted-foreground"
            >
              More than just a chatbot. Our clinical AI analyzes symptoms with complex medical matching, interprets lab reports, and tracks your progress over time—all while keeping your data strictly private.
            </m.p>
            
            <m.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10 grid sm:grid-cols-2 gap-6"
            >
              {aiCapabilities.slice(0, 4).map((cap) => (
                <div key={cap.title} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center mt-1">
                    <cap.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">{cap.title}</h4>
                    <p className="text-sm text-muted-foreground leading-snug">{cap.description}</p>
                  </div>
                </div>
              ))}
            </m.div>

            <m.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-10"
            >
              <Link href="/sign-up">
                <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  Try AI Assessment
                </Button>
              </Link>
            </m.div>
          </div>
        </div>
      </div>
    </section>
  )
}
