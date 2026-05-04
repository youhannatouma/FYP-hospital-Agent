"use client"
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect } from "react"
import { m } from "framer-motion"
import { AlertCircle, RefreshCcw, Home, LifeBuoy } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/5 blur-[120px]" />
      </div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 transition-transform hover:scale-110">
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>

        <h1 className="font-heading text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          System Interruption
        </h1>
        
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          A temporary error occurred while processing clinical data. Our systems are working to resolve the issue.
        </p>

        {error.digest && (
          <div className="mt-4 rounded-lg bg-muted px-3 py-1 text-xs font-mono text-muted-foreground">
            Error ID: {error.digest}
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => reset()}
            className="h-12 gap-2 bg-rose-500 px-8 font-semibold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry Operation
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            asChild
            className="h-12 gap-2 border-border px-8 font-semibold"
          >
            <a href="/">
              <Home className="h-4 w-4" />
              Return Home
            </a>
          </Button>
        </div>

        <div className="mt-12 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <LifeBuoy className="h-4 w-4 text-primary" />
          Need assistance? <a href="#" className="text-primary hover:underline">Contact Support</a>
        </div>
      </m.div>

      <div className="absolute bottom-8 text-xs font-medium text-muted-foreground uppercase tracking-widest">
        Clinical Safety Protocol Active
      </div>
    </div>
  )
}
