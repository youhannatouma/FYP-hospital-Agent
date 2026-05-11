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

function resolveTokenTemplate(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE?.trim();
  return raw ? raw : undefined;
}

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId, getToken } = await auth();
  const metadata = sessionClaims?.publicMetadata as { role?: string } | undefined;
  const claimRole = metadata?.role;
  let role = claimRole;
  const { pathname } = req.nextUrl;

  if (!role && userId) {
    let token: string | null = null;
    try {
      const template = resolveTokenTemplate();
      token = template ? await getToken({ template }) : await getToken();
      if (!token && template) {
        token = await getToken();
      }
    } catch {
      token = null;
    }
    if (token) {
      const backendRole = await resolveBackendRole(token);
      if (backendRole) role = backendRole;
    }
  }

  if (userId) {
    const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname.startsWith("/doctor-sign-in");
    if (isAuthPage) {
      if (role === "doctor") return NextResponse.redirect(new URL("/doctor", req.url));
      if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "patient") return NextResponse.redirect(new URL("/patient", req.url));
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect();

    if (pathname.startsWith("/doctor")) {
      if (role !== "doctor") {
        if (role === "patient") return NextResponse.redirect(new URL("/patient", req.url));
        if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    if (pathname.startsWith("/patient")) {
      if (role !== "patient") {
        if (role === "doctor") return NextResponse.redirect(new URL("/doctor", req.url));
        if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
        if (userId && !role) return NextResponse.next();
      }
    }

    if (pathname.startsWith("/admin")) {
      if (role !== "admin") {
        if (role === "doctor") return NextResponse.redirect(new URL("/doctor", req.url));
        if (role === "patient") return NextResponse.redirect(new URL("/patient", req.url));
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
    }

    if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
      if (role === "doctor") return NextResponse.redirect(new URL("/doctor", req.url));
      if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
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
