"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */

import Link from "next/link"
import { m } from "framer-motion"
import { ArrowRight, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function FooterSection() {
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation(0.15)

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-24">
        {/* Transformative CTA Card */}
        <m.div 
          ref={ctaRef} 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={ctaVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[3rem] bg-foreground p-12 text-center sm:p-20 overflow-hidden shadow-2xl"
        >
          {/* Animated Background for CTA */}
          <div className="absolute inset-0 opacity-20 mesh-gradient pointer-events-none" />
          <m.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/40 blur-[100px]" 
          />

          <div className="relative z-10">
            <h2 className="text-balance text-4xl font-black tracking-tight text-white sm:text-6xl font-heading mb-6">
              Ready for the <br />
              <span className="text-primary">Medical Revolution?</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white/70 font-medium mb-10 leading-relaxed">
              Join 260,000+ patients and thousands of doctors already transforming healthcare through clinical intelligence.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/sign-up">
                <Button size="lg" className="h-16 rounded-full bg-primary text-white hover:bg-primary/90 gap-3 px-10 text-xl font-bold shadow-xl shadow-primary/30 transition-transform hover:scale-105 active:scale-95">
                  Get Started Free <ArrowRight className="h-6 w-6" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-16 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 px-10 text-xl font-bold backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
                onClick={() => toast({ title: "Clinical Overview", description: "The product walkthrough is loading..." })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </m.div>
      </div>

      {/* Main Footer Links */}
      <div className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <a href="#home" className="flex items-center gap-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-black text-foreground font-heading italic">Care.AI</span>
              </a>
              <p className="max-w-xs text-base leading-relaxed text-muted-foreground font-medium">
                The world's most advanced AI-powered healthcare platform, bringing medical excellence to your fingertips.
              </p>
            </div>
            {[{ title: "Platform", links: ["AI Assistant", "Doctor Network", "Pharmacy Search", "Patient Portal"] }, 
               { title: "Trust", links: ["Privacy Policy", "HIPAA Compliance", "Security", "Terms"] }, 
               { title: "Company", links: ["About Us", "Contact", "Careers", "Documentation"] }].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mb-6">{col.title}</h4>
                <ul className="flex flex-col gap-4">
                  {col.links.map((link) => {
                    const hrefMap: { [key: string]: string } = {
                      "AI Assistant": "/patient/ai-assistant",
                      "Doctor Network": "/patient/records",
                      "Pharmacy Search": "/patient/medicines",
                      "Patient Portal": "/patient",
                      "Privacy Policy": "/privacy-policy",
                      "HIPAA Compliance": "/hipaa",
                      "Security": "/security",
                      "Terms": "/terms",
                      "About Us": "/about-us",
                      "Contact": "/contact",
                      "Careers": "/careers",
                      "Documentation": "/documentation",
                    }
                    return (
                      <li key={link}>
                        <Link 
                          href={hrefMap[link] || "#"} 
                          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                          {link}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-20 pt-8 border-t border-border flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-sm font-medium text-muted-foreground">© 2026 Care Enterprise. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
