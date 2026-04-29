"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useHospital } from "@/hooks/use-hospital";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { admin } = useHospital();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isLoaded) return;

    const checkAndRoute = async () => {
      try {
        // 1. Check Clerk metadata first
        const metaRole = user?.publicMetadata?.role as string | undefined;
        if (metaRole === "doctor") {
          router.push("/onboarding/doctor");
          return;
        } else if (metaRole === "patient") {
          router.push("/onboarding/patient");
          return;
        }

        // 2. Check backend database to see if user exists with a role already set
        try {
          const token = await getToken();
          const me = await admin.getMe(token || undefined);
          if (me && me.role) {
            // User exists in database with role set
            if (me.role === "doctor") {
              router.push("/doctor");
            } else if (me.role === "patient") {
              router.push("/patient");
            } else {
              // Role set but unknown - show role selection
              router.push("/onboarding/patient");
            }
            return;
          }
        } catch (err: any) {
          // Backend error (maybe user just created) - continue to role selection
          console.log(
            "[Onboarding] Backend check failed (OK for new users):",
            err.message,
          );
        }

        // 3. Check URL query param (set by sign-in redirect)
        const queryRole = searchParams.get("role");
        if (queryRole === "doctor") {
          router.push("/onboarding/doctor");
          return;
        } else if (queryRole === "patient") {
          router.push("/onboarding/patient");
          return;
        }

        // 4. If no role anywhere, default to patient onboarding
        console.log("[Onboarding] Defaulting to patient onboarding");
        router.push("/onboarding/patient");
      } catch (err: any) {
        console.error("[Onboarding] Unexpected error:", err);
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };

    checkAndRoute();
  }, [isLoaded, user, router, searchParams]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-xl font-bold tracking-tight">
          Authorizing Profile...
        </h2>
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <p className="text-muted-foreground font-medium animate-pulse text-center max-w-xs">
        Preparing your specialized healthcare portal experience.
      </p>
    </div>
  );
}
