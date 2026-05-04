"use client"

import { Construction } from "lucide-react"

export default function ComplianceSecurityPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Construction className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-3xl font-black tracking-tight mb-2">Trust & Security</h1>
      <h2 className="text-xl font-bold text-muted-foreground uppercase tracking-widest">Coming Soon</h2>
      <p className="mt-4 text-muted-foreground max-w-md">
        The compliance, audit logging, and security center is currently under development. 
        It will be available in Phase 5 of the clinical system rollout.
      </p>
    </div>
  )
}
