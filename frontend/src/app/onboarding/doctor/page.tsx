"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DoctorOnboardingRedirect() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const setDoctorRole = async () => {
      try {
        const token = await getToken();
        
        // 1. Set role in Clerk metadata
        const roleRes = await fetch("/api/v1/set-role", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ role: "doctor" }),
        });

        if (!roleRes.ok) {
          throw new Error("Failed to sync doctor role");
        }

        // 2. Refresh local session
        await getToken({ skipCache: true });
        await user.reload();

        toast({
          title: "Clinician Access Granted",
          description: "Welcome to your clinical workspace.",
        });

        // 3. Redirect
        router.push("/doctor");
      } catch (error) {
        console.error("Doctor onboarding failed:", error);
        toast({
          title: "Access Error",
          description: "We couldn't verify your clinical role. Please try again.",
          variant: "destructive",
        });
      }
    };

    setDoctorRole();
  }, [isLoaded, user, getToken, router, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-xl font-bold tracking-tight">
          Verifying Clinical Credentials...
        </h2>
      </div>
    </div>
  );
}
