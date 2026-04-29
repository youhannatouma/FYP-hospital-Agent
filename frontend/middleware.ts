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
  console.log(`[AUTH] Path: ${pathname} | Role: ${role} | User: ${userId}`);

  // ── 1. Authenticated users on landing page → redirect to dashboard ──
  if (userId && pathname === "/") {
    if (role === "doctor") return NextResponse.redirect(new URL("/doctor", req.url));
    if (role === "admin")  return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "patient") return NextResponse.redirect(new URL("/patient", req.url));
    // No role yet? Send to onboarding
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // ── 2. Authenticated users on auth pages → redirect to their dashboard ──
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

  // ── 3. Protect all dashboard routes — must be signed in ──
  if (isProtectedRoute(req)) {
    await auth.protect();

    // ── 4. Strict Role-Based Access Control (RBAC) ──

    // DOCTOR routes
    if (pathname.startsWith("/doctor")) {
      if (role && role !== "doctor") {
        if (role === "admin")   return NextResponse.redirect(new URL("/admin", req.url));
        if (role === "patient") return NextResponse.redirect(new URL("/patient", req.url));
      }
    }

    // PATIENT routes
    if (pathname.startsWith("/patient")) {
      if (role && role !== "patient") {
        if (role === "admin")  return NextResponse.redirect(new URL("/admin", req.url));
        if (role === "doctor") return NextResponse.redirect(new URL("/doctor", req.url));
      }
    }

    // ADMIN routes
    if (pathname.startsWith("/admin")) {
      if (role && role !== "admin") {
        if (role === "doctor")  return NextResponse.redirect(new URL("/doctor", req.url));
        if (role === "patient") return NextResponse.redirect(new URL("/patient", req.url));
      }
    }

    // ONBOARDING — skip if already has a role & dashboard
    if (pathname.startsWith("/onboarding")) {
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
