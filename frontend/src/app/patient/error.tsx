"use client"

import { m } from "framer-motion"
import { AlertCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PatientError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 text-center backdrop-blur-sm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10">
        <AlertCircle className="h-8 w-8 text-rose-500" />
      </div>
      <h3 className="text-xl font-bold text-foreground">Patient Portal Error</h3>
      <p className="mt-2 text-muted-foreground max-w-sm">
        We encountered a problem loading your health records. Please try again or contact your care provider.
      </p>
      <Button 
        variant="outline"
        onClick={() => reset()}
        className="mt-6 gap-2 border-rose-500/30 hover:bg-rose-500/10"
      >
        <RefreshCcw className="h-4 w-4" />
        Retry Loading Records
      </Button>
    </div>
  )
}
