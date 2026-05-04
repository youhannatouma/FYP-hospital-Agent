
"use client"

/**
 * RecentPatients (Doctor Dashboard Component)
 * Follows: Single Responsibility Principle (SRP) — display only, data via repository
 * Follows: Dependency Inversion Principle (DIP) — uses IDoctorRepository via service container
 */

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getServiceContainer } from "@/lib/services/service-container"
import type { RecentPatient } from "@/lib/services/repositories/doctor-repository"

export interface RecentPatientsProps {
  onSelectPatient?: (patient: RecentPatient) => void
}

export function RecentPatients({ onSelectPatient }: RecentPatientsProps) {
  const [patients, setPatients] = React.useState<RecentPatient[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchRecentPatients = async () => {
      try {
        setIsLoading(true)
        const container = getServiceContainer()
        const data = await container.doctor.getRecentPatients()
        setPatients(data)
      } catch (error) {
        console.error("[RecentPatients] Failed to fetch recent patients:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecentPatients()
  }, [])

  if (isLoading) {
    return (
      <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Recent Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="size-9 rounded-full bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 rounded bg-muted" />
                  <div className="h-2 w-20 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Recent Patients</CardTitle>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">
            No recent patients found.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-primary/5 cursor-pointer group/item active:scale-98"
                onClick={() => onSelectPatient?.(patient)}
              >
                <Avatar className="size-9">
                  <AvatarImage
                    src={patient.avatar || "/placeholder.svg"}
                    alt={patient.name}
                  />
                  <AvatarFallback className="bg-muted text-xs">
                    {patient.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium truncate">{patient.name}</span>
                  <span className="text-xs text-muted-foreground">{patient.condition}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {patient.lastVisit}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
