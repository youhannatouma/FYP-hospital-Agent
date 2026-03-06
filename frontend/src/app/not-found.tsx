"use client"

import Link from "next/link"
import { m } from "framer-motion"
import { Home, Search, ArrowLeft, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 transition-transform hover:rotate-6">
          <Activity className="h-10 w-10 text-primary" />
        </div>

        <h1 className="font-heading text-8xl font-black tracking-tighter text-foreground sm:text-9xl">
          404
        </h1>
        
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Page Not Found
        </h2>
        
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          The medical record or page you're looking for doesn't exist or has been moved to another wing.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/">
            <Button size="lg" className="h-12 gap-2 px-8 font-semibold shadow-lg shadow-primary/20">
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-12 gap-2 border-primary/20 px-8 font-semibold hover:bg-primary/5"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        <div className="mt-12 flex flex-col items-center border-t border-border pt-8">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
            Quick Navigation
          </p>
          <div className="flex gap-6">
            <Link href="/patient" className="text-sm font-bold text-primary hover:underline">Patient Portal</Link>
            <Link href="/doctor" className="text-sm font-bold text-primary hover:underline">Doctor Clinic</Link>
            <Link href="/auth/sign-in" className="text-sm font-bold text-primary hover:underline">Secure Login</Link>
          </div>
        </div>
      </m.div>

      <div className="absolute bottom-8 text-xs font-medium text-muted-foreground uppercase tracking-widest">
        Care.AI • Intelligent Healthcare
      </div>
    </div>
  )
}
