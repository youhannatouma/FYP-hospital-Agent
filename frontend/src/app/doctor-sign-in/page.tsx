"use client"

import { SignIn } from "@clerk/nextjs"
import { Activity, Stethoscope } from "lucide-react"
import Link from "next/link"

export default function DoctorSignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Left Decoration */}
      <div className="hidden md:flex flex-1 bg-primary/5 p-12 flex-col justify-between relative overflow-hidden border-r border-border/50">
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
          <div className="absolute top-[10%] right-[10%] w-[60%] h-[60%] bg-primary/40 blur-[120px] rounded-full" />
        </div>

        <Link href="/" className="flex items-center gap-2 text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tighter">Care</span>
        </Link>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              Physician <span className="text-primary italic">Portal</span>.
            </h2>
            <p className="text-muted-foreground text-lg max-w-md font-medium">
              Access your personalized dashboard, manage schedules, and coordinate patient care.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
          <span>Secure sign-in for medical professionals</span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-card">
        <div className="w-full max-w-md space-y-8">
          <div className="md:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-2xl font-black tracking-tighter">Care</span>
            </Link>
          </div>

          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight text-foreground">Doctor Sign In</h1>
            <p className="text-muted-foreground font-medium">
              Sign in to access your physician portal.
            </p>
          </div>

          <SignIn
            afterSignInUrl="/doctor"
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-sm font-bold h-11 rounded-xl shadow-lg shadow-primary/20",
                card: "bg-transparent border-0 shadow-none p-0",
                headerTitle: "text-3xl font-extrabold tracking-tight text-foreground",
                headerSubtitle: "text-muted-foreground font-medium",
                socialButtonsBlockButton:
                  "rounded-xl border-border bg-card/50 hover:bg-muted text-foreground transition-all h-11",
                formFieldLabel: "text-sm font-bold text-foreground",
                formFieldInput:
                  "rounded-xl border-border bg-muted/30 focus:border-primary focus:ring-primary backdrop-blur-sm h-11",
                footerActionLink: "text-primary hover:text-primary/80 font-bold",
                identityPreviewText: "text-foreground font-medium",
                identityPreviewEditButton: "text-primary font-bold",
              },
            }}
          />

          <div className="text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Not a doctor?{" "}
              <Link href="/sign-in" className="text-primary font-bold hover:underline">
                Patient Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
