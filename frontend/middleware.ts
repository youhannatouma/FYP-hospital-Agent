import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  '/patient(.*)',
  '/doctor(.*)',
  '/admin(.*)',
  '/onboarding(.*)',
]);

function normalizeBackendBase(url: string): string {
  const trimmed = (url || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function getBackendCandidates(): string[] {
  const configured = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (configured && configured.trim()) {
    return [normalizeBackendBase(configured)];
  }
  return [
    "http://127.0.0.1:8000/api",
    "http://localhost:8000/api",
    "http://backend:8000/api",
    "http://host.docker.internal:8000/api",
  ];
}

async function resolveBackendRole(token: string): Promise<string | null> {
  const candidates = getBackendCandidates();
  for (const base of candidates) {
    if (!base) continue;
    try {
      const res = await fetch(`${base}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) continue;
      const data = await res.json().catch(() => null) as { role?: string } | null;
      if (data?.role) return data.role;
    } catch {
      // try next candidate
    }
  }
  return null;
}

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId, getToken } = await auth();
  const metadata = sessionClaims?.publicMetadata as { role?: string } | undefined;
  const claimRole = metadata?.role;
  let role = claimRole;
  const { pathname } = req.nextUrl;
  const onboardingCookie = req.cookies.get("patient_onboarding_complete")?.value === "1";

  // Fallback role resolution when Clerk session claims are stale.
  if (!role && userId) {
    let token: string | null = null;
    try {
      token = await getToken();
    } catch {
      token = null;
    }
    if (token) {
      const backendRole = await resolveBackendRole(token);
      if (backendRole) role = backendRole;
    }
  }

  // ── 1. Authenticated users on auth pages → redirect to their dashboard ──
  if (userId) {
    const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname.startsWith("/doctor-sign-in");
    if (isAuthPage) {
      if (role === "doctor") return NextResponse.redirect(new URL("/doctor", req.url));
      if (role === "admin")  return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "patient") return NextResponse.redirect(new URL("/patient", req.url));
      // No role yet → onboarding
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  // ── 2. Protect all dashboard routes — must be signed in ──
  if (isProtectedRoute(req)) {
    await auth.protect();

    // ── 3. Role-based access control ──

    // DOCTOR routes
    if (pathname.startsWith("/doctor")) {
      if (role !== "doctor") {
        if (role === "patient") return NextResponse.redirect(new URL("/patient", req.url));
        if (role === "admin")   return NextResponse.redirect(new URL("/admin", req.url));
        // No role yet - allow access, role will be set on load
      }
    }

    // PATIENT routes
    if (pathname.startsWith("/patient")) {
      if (role !== "patient") {
        if (role === "doctor") return NextResponse.redirect(new URL("/doctor", req.url));
        if (role === "admin")  return NextResponse.redirect(new URL("/admin", req.url));
        // Missing claim role: allow if onboarding already completed cookie exists.
        if (userId && !role && !onboardingCookie) {
          return NextResponse.redirect(new URL("/onboarding/patient", req.url));
        }
      }
    }

    // ADMIN routes
    if (pathname.startsWith("/admin")) {
      if (role !== "admin") {
        if (role === "doctor")  return NextResponse.redirect(new URL("/doctor", req.url));
        if (role === "patient") return NextResponse.redirect(new URL("/patient", req.url));
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
    }

    // ONBOARDING — skip if already has a role & dashboard
    if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
      if (role === "doctor")  return NextResponse.redirect(new URL("/doctor", req.url));
      if (role === "admin")   return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "patient") return NextResponse.redirect(new URL("/patient", req.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
