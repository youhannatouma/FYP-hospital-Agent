"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ArrowRight,
  Bot,
  Mic,
  MessageCircle,
  Shield,
  Users,
  Star,
} from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function HeroSection() {
  const { ref, isVisible } = useScrollAnimation(0.1)

  return (
    <section
      id="home"
      ref={ref}
      className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28 mesh-gradient"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 right-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[120px] dark:opacity-50" />
        <div className="absolute bottom-20 left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[120px] dark:opacity-30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-start lg:gap-20">
          {/* Left content - fade in from left */}
          <div
            className={`flex max-w-2xl flex-1 flex-col items-center text-center lg:items-start lg:text-left transition-all duration-700 ease-out ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-16 opacity-0"
            }`}
          >
            {/* Trust badge */}
            <div className="mb-8 flex items-center gap-3 rounded-full border border-border bg-card px-5 py-2.5 shadow-sm">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary/10 text-xs font-bold text-primary"
                  >
                    <Users className="h-4 w-4" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  260k+ Patients
                </span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-accent text-accent"
                    />
                  ))}
                  <span className="text-xs text-muted-foreground">
                    Trust Us
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl font-heading">
              {"Your Family's Care,"}
              <br />
              <span className="text-primary">Our AI-Powered</span> Mission
            </h1>

            <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              From pediatrics to geriatrics, our integrated healthcare system
              ensures seamless support throughout life{"'"}s journey with
              intelligent AI assistance.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/auth/role-selection">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8 text-base"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-border text-foreground px-8 text-base bg-transparent"
              >
                <Mic className="h-4 w-4" />
                Talk to AI
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid w-full grid-cols-3 gap-8 border-t border-border pt-8">
              {[
                { value: "50+", label: "Specialties" },
                { value: "24/7", label: "AI Support" },
                { value: "98%", label: "Satisfaction" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - AI Assistant Card - fade in from right */}
          <div
            className={`relative flex-shrink-0 transition-all duration-700 delay-200 ease-out ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-16 opacity-0"
            }`}
          >
            <div className="relative w-80 sm:w-96">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      AI Voice Assistant
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Always ready to help
                    </p>
                  </div>
                  <div className="ml-auto h-3 w-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                </div>

                {/* Chat bubbles */}
                <div className="flex flex-col gap-3">
                  <div className="self-end rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    I have a headache and fever
                  </div>
                  <div className="self-start rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm text-foreground">
                    {"I'll help you assess your symptoms. How long have you been experiencing this?"}
                  </div>
                  <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>

                {/* Input area */}
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Type or speak...
                  </span>
                  <Mic className="ml-auto h-4 w-4 text-primary" />
                </div>
              </div>

              {/* Floating badge */}
              <div className="animate-float absolute -right-4 -bottom-4 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs font-semibold text-card-foreground">
                      HIPAA Compliant
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Your data is secure
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
