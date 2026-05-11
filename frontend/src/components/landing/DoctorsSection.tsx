"use client"

import { useEffect, useMemo, useState } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { ArrowRight, Clock, Loader2, MapPin, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { resolveApiBaseUrl } from "@/lib/network/runtime-config"
import type { Doctor } from "@/lib/services/repositories/doctor-repository"

type DoctorPreview = {
  id: string
  name: string
  specialty: string
  location: string
  availability: string
  initials: string
}

function getInitials(firstName?: string, lastName?: string) {
  const left = firstName?.trim()?.[0] || "D"
  const right = lastName?.trim()?.[0] || "R"
  return `${left}${right}`.toUpperCase()
}

function mapDoctorPreview(doctor: Doctor): DoctorPreview {
  const firstName = doctor.first_name?.trim() || "Doctor"
  const lastName = doctor.last_name?.trim() || ""
  const fullName = `Dr. ${[firstName, lastName].filter(Boolean).join(" ")}`

  return {
    id: doctor.id,
    name: fullName,
    specialty: doctor.specialty || "General Practice",
    location: doctor.clinic_address || "Clinic address available after sign in",
    availability: doctor.availability_status || "Schedule available after sign in",
    initials: getInitials(doctor.first_name, doctor.last_name),
  }
}

function resolveSignedInRoute(role?: string) {
  if (role === "doctor") return "/doctor"
  if (role === "admin") return "/admin"
  return "/patient/find-doctor"
}

export function DoctorsSection() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1)
  const [doctors, setDoctors] = useState<DoctorPreview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const dashboardRoute = useMemo(
    () => resolveSignedInRoute(user?.publicMetadata?.role as string | undefined),
    [user?.publicMetadata?.role],
  )

  useEffect(() => {
    let isActive = true
    const doctorsUrl = `${resolveApiBaseUrl()}/doctors`

    const fetchDoctors = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(doctorsUrl, { cache: "no-store" })
        if (!response.ok) {
          throw new Error(`Failed to load doctors (${response.status})`)
        }

        const data = (await response.json()) as Doctor[]
        if (!isActive) return
        setDoctors(data.slice(0, 4).map(mapDoctorPreview))
      } catch (error) {
        console.error("[LandingDoctorsSection] Failed to load doctors:", error)
        if (!isActive) return
        setDoctors([])
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    fetchDoctors()

    return () => {
      isActive = false
    }
  }, [])

  const showSignedInCta = isLoaded && isSignedIn
  const ctaHref = !isLoaded ? "/#doctors" : showSignedInCta ? dashboardRoute : "/sign-up"
  const ctaLabel = !isLoaded
    ? "Browse doctors"
    : showSignedInCta
      ? "Browse doctor directory"
      : "Sign up to see all doctors"
  const cardButtonLabel = !isLoaded
    ? "Browse doctors"
    : showSignedInCta
      ? "Open Directory"
      : "Create account to book"

  return (
    <section id="doctors" className="bg-muted/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${headerVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">Find Your Doctor</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">Top-Rated Specialists Near You</h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">Browse real doctors from your live directory. Signed-in users can open the full doctor search without seeing extra sign-up prompts.</p>
        </div>
        <div ref={gridRef} className={`mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 delay-150 ease-out ${gridVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`doctor-skeleton-${index}`} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-14 w-14 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))
          ) : doctors.length > 0 ? (
            doctors.map((doc) => (
              <div key={doc.id} className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">{doc.initials}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-card-foreground">{doc.name}</h3>
                    <p className="text-xs text-primary">{doc.specialty}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-card-foreground">{doc.specialty}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span className="line-clamp-2 text-xs text-muted-foreground">{doc.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{doc.availability}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full border-border bg-transparent text-foreground">
                  {cardButtonLabel}
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center text-muted-foreground">
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <Loader2 className="h-4 w-4" />
                No doctors are available to preview right now.
              </div>
            </div>
          )}
        </div>
        <div className="mt-10 text-center">
          <Link href={ctaHref}>
            <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
