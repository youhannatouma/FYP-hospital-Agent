/**
 * Navbar Auth Section Component
 * Manages authentication UI in navbar
 * Follows: Single Responsibility Principle (SRP)
 */

"use client";

import Link from "next/link";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface NavbarAuthSectionProps {
  showOnDesktop?: boolean;
  className?: string;
}

export function NavbarAuthSection({
  showOnDesktop = true,
  className = "",
}: NavbarAuthSectionProps) {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;

  // Dynamically resolve dashboard route based on user role
  let dashboardRoute = "/onboarding";
  if (role === "doctor") dashboardRoute = "/doctor";
  else if (role === "admin") dashboardRoute = "/admin";
  else if (role === "patient") dashboardRoute = "/patient";

  return (
    <div
      className={`flex items-center gap-2 ${showOnDesktop ? "hidden lg:flex" : ""} ${className}`}
    >
      <ClerkLoading />
      <ClerkLoaded>
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost" className="text-foreground font-bold">
              Sign In
            </Button>
          </SignInButton>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6">
            <Link href="/sign-up">
              Get Started
            </Link>
          </Button>
        </SignedOut>
        <SignedIn>
          <Button asChild variant="ghost" className="text-foreground font-bold italic">
            <Link href={dashboardRoute}>
              Go to Dashboard
            </Link>
          </Button>
          <UserButton />
        </SignedIn>
      </ClerkLoaded>
    </div>
  );
}
