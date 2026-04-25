"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DoctorOnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect immediately to dashboard
    router.push("/doctor");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-xl font-bold tracking-tight">
          Redirecting to Dashboard...
        </h2>
      </div>
    </div>
  );
}
