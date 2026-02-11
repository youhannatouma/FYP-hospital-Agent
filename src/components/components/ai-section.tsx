"use client"

import {
  MessageCircle,
  Mic,
  Brain,
  Heart,
  Camera,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const capabilities = [
  {
    icon: MessageCircle,
    title: "Chat Assistant",
    description:
      "Have a conversation with our AI assistant anytime. Discuss symptoms, medications, and get instant guidance.",
  },
  {
    icon: Mic,
    title: "Voice Interaction",
    description:
      "Speak naturally with our AI. Perfect for accessibility and hands-free healthcare navigation.",
  },
  {
    icon: Brain,
    title: "Symptom Analysis",
    description:
      "Advanced AI-powered symptom analysis with triage recommendations and specialist matching.",
  },
  {
    icon: Heart,
    title: "Mental Health",
    description:
      "AI-powered emotion analysis, mood tracking, mental health assessments, and therapist matching.",
  },
  {
    icon: Camera,
    title: "Visual Analysis",
    description:
      "Upload images for AI-assisted visual analysis. Skin conditions, medication identification, and more.",
  },
  {
    icon: ShieldCheck,
    title: "Report Interpretation",
    description:
      "Get plain language explanations of lab results and medical reports powered by medical AI.",
  },
]

export function AISection() {
  return (
    <section id="ai" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">
            AI-Powered Care
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your Personal Healthcare Navigator
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Experience the future of healthcare with our intelligent AI
            assistant. Whether you prefer typing or talking, get instant help
            finding doctors, booking appointments, and navigating your needs.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <cap.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                {cap.title}
              </h3>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {cap.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8"
          >
            <MessageCircle className="h-4 w-4" />
            Try AI Chat
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 border-border text-foreground px-8 bg-transparent"
          >
            <Mic className="h-4 w-4" />
            Try Voice
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Guest users get 3 free symptom checks. Sign up for unlimited access.
        </p>
      </div>
    </section>
  )
}
