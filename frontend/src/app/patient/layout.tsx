"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { PatientSidebar } from "@/components/patient/patient-sidebar"
import { PatientTopNav } from "@/components/patient/patient-top-nav"

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <PatientSidebar />
      <SidebarInset>
        <PatientTopNav />
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
