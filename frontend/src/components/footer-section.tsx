"use client"

import { Activity, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function FooterSection() {
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation(0.15)

  return (
    <footer className="border-t border-border bg-card">
      {/* CTA - fades in from below with scale */}
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div
          ref={ctaRef}
          className={`rounded-2xl bg-primary p-8 text-center sm:p-12 lg:p-16 transition-all duration-700 ease-out ${
            ctaVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-8 opacity-0 scale-95"
          }`}
        >
          <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl font-heading">
            Ready to Transform Your Care Experience?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-primary-foreground/80">
            Join 260,000+ patients already using Care for smarter, faster, and
            more accessible healthcare.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 gap-2 px-8 text-base"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 px-8 text-base"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <a href="#home" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold italic text-card-foreground font-heading">
                  Care
                </span>
              </a>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Your intelligent healthcare companion, making quality healthcare
                accessible to everyone.
              </p>
            </div>

            {[
              {
                title: "Platform",
                links: ["Features", "AI Assistant", "Find Doctors", "Pricing"],
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Blog", "Contact"],
              },
              {
                title: "Legal",
                links: [
                  "Privacy Policy",
                  "Terms of Service",
                  "HIPAA Notice",
                  "Cookie Policy",
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-card-foreground">
                  {col.title}
                </h4>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              2026 Care. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Built with care for better healthcare.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
