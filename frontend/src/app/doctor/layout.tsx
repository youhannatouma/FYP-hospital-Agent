"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DoctorSidebar } from "@/components/doctor/doctor-sidebar";
import { DoctorTopNav } from "@/components/doctor/doctor-top-nav";

function DoctorRoleInitializer() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Only fill missing role once for doctor users; avoid mutating existing roles.
    const role = user.publicMetadata?.role as string | undefined;
    if (!role) {
      (async () => {
        try {
          const token = await getToken();
          await fetch("/api/v1/set-role", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ role: "doctor" }),
          });
          await getToken({ skipCache: true });
          await user.reload();
        } catch (err) {
          console.error("Failed to set doctor role:", err);
        }
      })();
    }
  }, [user, isLoaded, getToken]);

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
