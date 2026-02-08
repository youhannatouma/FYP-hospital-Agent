"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DoctorSidebar } from "@/components/doctor/doctor-sidebar";
import { DoctorTopNav } from "@/components/doctor/doctor-top-nav";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DoctorSidebar />
      <SidebarInset>
      <DoctorTopNav />

        <div className="flex-1 overflow-auto p-4 lg:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
