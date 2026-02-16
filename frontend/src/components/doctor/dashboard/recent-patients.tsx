
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PatientDetailDialog } from "@/components/shared/dialogs/patient-detail-dialog";
import { useDataStore } from "@/hooks/use-data-store"

export function RecentPatients() {
  const { appointments, users } = useDataStore()
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handlePatientClick = (patient: any) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
  };

  // Derive recent patients from appointments
  const allAppointments = appointments
  const uniquePatientIds = Array.from(new Set(allAppointments.map(app => app.patientId)))
  
  const patients = users
    .filter(user => uniquePatientIds.includes(user.id))
    .slice(0, 5)
    .map(p => {
      // Find the last appointment or condition for this patient
      const patientApps = allAppointments.filter(app => app.patientId === p.id)
      const lastApp = patientApps[0] // Since it's sorted or just pick one
      return {
        ...p,
        initials: p.name.split(" ").map(n => n[0]).join("").toUpperCase(),
        condition: lastApp?.type || "General Checkup",
        lastVisit: lastApp?.date || "Recent"
      }
    })

  return (
    <>
    <Card className="border-sidebar-border bg-card/50 shadow-sm">
      <CardHeader className="pb-3 border-b border-sidebar-border/50">
        <CardTitle className="text-xl font-bold">Recent Encounters</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {patients.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
             No recent patient encounters found in registry.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-muted/50 cursor-pointer group"
                onClick={() => handlePatientClick(patient)}
              >
                <Avatar className="h-10 w-10 border border-sidebar-border">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`}
                    alt={patient.name}
                  />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                    {patient.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {patient.name}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    {patient.condition}
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span className="italic">{patient.email}</span>
                  </span>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last Visit</p>
                   <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                    {patient.lastVisit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <PatientDetailDialog 
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      patient={selectedPatient}
    />
    </>
  );
}
