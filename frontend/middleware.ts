import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  '/patient(.*)',
  '/doctor(.*)',
  '/admin(.*)',
  '/onboarding(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.publicMetadata as any)?.role as string | undefined;
  const { pathname } = req.nextUrl;

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
        // No role yet - proceed to onboarding
        if (userId && !role) return NextResponse.redirect(new URL("/onboarding/patient", req.url));
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
