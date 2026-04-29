"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ArrowRight, Mic, Users, Star, Activity, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

/**
 * HeroSection — uses a simple mount-based animation trigger.
 * No IntersectionObserver needed since the hero is ALWAYS at the top of the viewport.
 */
export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure the DOM is settled after hydration
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="home"
      className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <m.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ willChange: "opacity" }}
          className="absolute top-20 right-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[120px] dark:opacity-50"
        />
        <m.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ willChange: "opacity" }}
          className="absolute bottom-20 left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[120px] dark:opacity-30"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-12">
          {/* Left Content */}
          <m.div
            initial={{ opacity: 0, x: -50 }}
            animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex max-w-2xl flex-1 flex-col items-center text-center lg:items-start lg:text-left"
          >
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 flex items-center gap-3 rounded-full border border-border bg-card/50 backdrop-blur-md px-5 py-2.5 shadow-sm"
            >
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
                  260k+ Patients Trusted
                </span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                  ))}
                  <span className="text-xs text-muted-foreground font-medium">
                    99% Satisfaction
                  </span>
                </div>
              </div>
            </m.div>

            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-7xl font-heading"
            >
              The Future of <br />
              <span className="text-gradient">Personalized Care</span>
            </m.h1>

            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground"
            >
              Experience a world-class AI-powered healthcare platform.
              Seamlessly connect with doctors, analyze symptoms, and manage your
              health with intelligent, medical-grade support.
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="h-14 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8 text-lg font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
                >
                  Start Your Journey
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 gap-2 border-primary/20 text-foreground px-8 text-lg font-semibold backdrop-blur-sm transition-all hover:bg-primary/5 hover:border-primary/40 active:scale-95"
                >
                  <Mic className="h-5 w-5 text-primary" />
                  Speak to AI
                </Button>
              </Link>
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              animate={mounted ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="mt-12 grid w-full grid-cols-3 gap-8 border-t border-border pt-8"
            >
              {[
                { value: "150+", label: "Specialties" },
                { value: "24/7", label: "Real-time AI" },
                { value: "Secured", label: "Data Grade" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </m.div>
          </m.div>

          {/* Right Visual Element (AI Visual) */}
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={mounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative flex flex-1 items-center justify-center"
          >
            <div className="relative aspect-square w-full max-w-[500px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <m.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ willChange: "transform" }}
                  className="absolute h-[85%] w-[85%] rounded-full border border-dashed border-primary/30"
                />
                <m.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 50,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ willChange: "transform" }}
                  className="absolute h-[95%] w-[95%] rounded-full border border-primary/10"
                />
              </div>

              {/* Performant AI Core Visual */}
              <div className="relative h-full w-full overflow-hidden rounded-full border border-border bg-card/10 backdrop-blur-sm shadow-2xl flex items-center justify-center">
                <div className="relative flex h-full w-full items-center justify-center">
                  {/* Central Pulsing Orb */}
                  <m.div
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="h-32 w-32 rounded-full bg-primary/40 blur-2xl"
                  />
                  <div className="absolute h-16 w-16 rounded-full bg-primary shadow-[0_0_40px_rgba(0,184,156,0.6)]" />

                  {/* Dynamic DNA/Helix-like SVG Visual */}
                  <svg
                    className="absolute h-full w-full opacity-30"
                    viewBox="0 0 400 400"
                  >
                    <path
                      d="M200,100 C250,150 150,250 200,300"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-primary"
                    />
                    <m.circle
                      r="4"
                      fill="currentColor"
                      className="text-primary"
                      animate={{
                        offsetDistance: ["0%", "100%"],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{
                        offsetPath: "path('M200,100 C250,150 150,250 200,300')",
                        willChange: "transform, opacity",
                      }}
                    />
                  </svg>
                </div>

                {/* Overlay Highlights */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/10 to-transparent" />
              </div>

              <m.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ willChange: "transform" }}
                className="absolute -left-4 top-1/4 rounded-2xl border border-border bg-card/80 p-4 shadow-xl backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Analysis
                    </div>
                    <div className="text-sm font-bold">Vital Signs Normal</div>
                  </div>
                </div>
              </m.div>

              <m.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                style={{ willChange: "transform" }}
                className="absolute -right-4 bottom-1/4 rounded-2xl border border-border bg-card/80 p-4 shadow-xl backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                    <Shield className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Safety
                    </div>
                    <div className="text-sm font-bold">HIPAA Compliant</div>
                  </div>
                </div>
              </m.div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
