"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DoctorSidebar } from "@/components/doctor/doctor-sidebar";
import { DoctorTopNav } from "@/components/doctor/doctor-top-nav";

function DoctorRoleInitializer() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Only fill missing role once for doctor users; avoid mutating existing roles.
    const role = user.publicMetadata?.role as string | undefined;
    if (!role) {
      fetch("/api/v1/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "doctor" }),
      }).catch((err) => console.error("Failed to set doctor role:", err));
    }
  }, [user, isLoaded]);

  return null;
}

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DoctorRoleInitializer />
      <DoctorSidebar />
      <SidebarInset>
      <DoctorTopNav />

        <div className="flex-1 overflow-auto p-4 lg:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
