"use client"

import { useEffect } from "react"
import { Stethoscope, RefreshCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DoctorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Doctor Portal Error]", error)
  }, [error])

  return (
    <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center">
      {/* CSS animation instead of framer-motion (error boundaries need no providers) */}
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10"
        style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
      >
        <Stethoscope className="h-10 w-10 text-destructive" />
      </div>

      <h2 className="text-2xl font-bold text-foreground">Clinical Module Failure</h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        The consultation module could not be initialized. Patient data safety protocols are active.
        Please attempt a system restart or refresh the view.
      </p>

      {error.digest && (
        <div className="mt-4 rounded-lg bg-muted px-3 py-1 text-xs font-mono text-muted-foreground">
          Error ID: {error.digest}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button
          onClick={() => reset()}
          className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          <RefreshCcw className="h-4 w-4" />
          Restart Module
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <a href="/doctor">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </a>
        </Button>
      </div>
    </div>
  )
}
