/**
 * Navbar Brand Component
 * Displays brand/logo
 * Follows: Single Responsibility Principle (SRP)
 */

"use client";

import Link from "next/link";
import { Activity } from "lucide-react";

export function NavbarBrand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
        <Activity className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold italic tracking-tight text-foreground font-heading">
        Care
      </span>
    </Link>
  );
}
