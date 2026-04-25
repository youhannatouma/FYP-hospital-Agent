/**
 * Navbar Auth Section Component
 * Manages authentication UI in navbar
 * Follows: Single Responsibility Principle (SRP)
 */

"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

/**
 * Helper to determine dashboard route based on user role
 * Follows: Single Responsibility Principle (SRP)
 */
function useDashboardRoute(): string {
  const { user } = useUser();

  return useMemo(() => {
    const role = user?.publicMetadata?.role as string | undefined;
    if (role === "doctor") return "/doctor";
    if (role === "patient") return "/patient";
    return "/onboarding";
  }, [user?.publicMetadata?.role]);
}

interface NavbarAuthSectionProps {
  showOnDesktop?: boolean;
  className?: string;
}

export function NavbarAuthSection({
  showOnDesktop = true,
  className = "",
}: NavbarAuthSectionProps) {
  const dashboardRoute = useDashboardRoute();

  return (
    <div
      className={`flex items-center gap-2 ${showOnDesktop ? "hidden lg:flex" : ""} ${className}`}
    >
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost" className="text-foreground font-bold">
            Sign In
          </Button>
        </SignInButton>
        <Link href="/sign-up">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6">
            Get Started
          </Button>
        </Link>
      </SignedOut>
      <SignedIn>
        <Link href={dashboardRoute}>
          <Button variant="ghost" className="text-foreground font-bold italic">
            Go to Dashboard
          </Button>
        </Link>
        <UserButton />
      </SignedIn>
    </div>
  );
}
