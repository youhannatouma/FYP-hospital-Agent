"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PatientError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Patient Portal Error]", error)
  }, [error])

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 text-center backdrop-blur-sm">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10"
        style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
      >
        <AlertCircle className="h-8 w-8 text-rose-500" />
      </div>

      <h3 className="text-xl font-bold text-foreground">Patient Portal Error</h3>
      <p className="mt-2 text-muted-foreground max-w-sm">
        We encountered a problem loading your health records. Please try again or contact your care
        provider.
      </p>

      {error.digest && (
        <div className="mt-4 rounded-lg bg-muted px-3 py-1 text-xs font-mono text-muted-foreground">
          Error ID: {error.digest}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => reset()}
          className="gap-2 border-rose-500/30 hover:bg-rose-500/10"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry Loading Records
        </Button>
        <Button variant="ghost" asChild className="gap-2">
          <a href="/patient">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </a>
        </Button>
      </div>
    </div>
  )
}
