"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import Link from "next/link"
import { m } from "framer-motion"
import { Star, MapPin, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const doctorsList = [
  { name: "Dr. Sarah Mitchell", specialty: "Cardiology", rating: 4.9, reviews: 234, location: "New York, NY", availability: "Available Today", initials: "SM" },
  { name: "Dr. James Chen", specialty: "Neurology", rating: 4.8, reviews: 189, location: "San Francisco, CA", availability: "Next: Tomorrow", initials: "JC" },
  { name: "Dr. Emily Rodriguez", specialty: "Pediatrics", rating: 4.9, reviews: 312, location: "Austin, TX", availability: "Available Today", initials: "ER" },
  { name: "Dr. Michael Park", specialty: "Dermatology", rating: 4.7, reviews: 156, location: "Chicago, IL", availability: "Next: Wed", initials: "MP" },
]

export function DoctorsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1)

  return (
    <section id="doctors" className="bg-muted/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${headerVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">Find Your Doctor</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">Top-Rated Specialists Near You</h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">Browse our network of verified healthcare professionals. Sign up to book appointments and access full profiles.</p>
        </div>
        <div ref={gridRef} className={`mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 delay-150 ease-out ${gridVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}>
          {doctorsList.map((doc) => (
            <div key={doc.name} className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">{doc.initials}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-card-foreground">{doc.name}</h3>
                  <p className="text-xs text-primary">{doc.specialty}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="text-sm font-medium text-card-foreground">{doc.rating}</span>
                  <span className="text-xs text-muted-foreground">({doc.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{doc.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{doc.availability}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full border-border text-foreground bg-transparent">View Profile</Button>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/sign-up">
            <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
              Sign up to see all doctors
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
