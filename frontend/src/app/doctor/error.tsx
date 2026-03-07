"use client"

import { m } from "framer-motion"
import { Stethoscope, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DoctorError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <Stethoscope className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">Clinical Module Failure</h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        The consultation module could not be initialized. Patient data safety protocols are active. Please attempt a system restart or refresh the view.
      </p>
      <div className="mt-8 flex gap-4">
        <Button 
          onClick={() => reset()}
          className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          <RefreshCcw className="h-4 w-4" />
          Restart Module
        </Button>
      </div>
    </div>
  )
}
