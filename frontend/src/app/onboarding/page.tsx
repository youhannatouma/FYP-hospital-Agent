"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  React.useEffect(() => {
    if (!isLoaded) return

    // Read role from localStorage (set in /auth/role-selection)
    const role = localStorage.getItem("onboarding_role")

    // Default to patient if not specified or unrecognized
    if (role === "doctor") {
      router.push("/onboarding/doctor")
    } else {
      router.push("/onboarding/patient")
    }
  }, [isLoaded, router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
      <p className="text-muted-foreground font-medium animate-pulse">Preparing your personalized onboarding...</p>
    </div>
  )
}
