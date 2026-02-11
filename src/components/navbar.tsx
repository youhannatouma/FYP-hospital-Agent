"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Activity,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Doctors", href: "#doctors" },
  { label: "AI Assistant", href: "#ai" },
  { label: "Departments", href: "#architecture" },
];

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Schedule the state update for the next paint
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 glass-dark">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#home" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold italic tracking-tight text-foreground font-heading">
            Care
          </span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <span className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Toggle language"
          >
            <Globe className="h-5 w-5" />
          </Button>

          <div className="hidden items-center gap-2 lg:flex">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost" className="text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/role-selection">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/patient">
                <Button variant="ghost" className="gap-2 text-foreground">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="ml-2 h-9 w-9 overflow-hidden rounded-full border-2 border-primary/20 transition-all hover:border-primary/50">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-full w-full",
                    },
                  }}
                />
              </div>
            </SignedIn>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 pb-6 lg:hidden">
          <ul className="flex flex-col gap-1 pt-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            <SignedOut>
              <Link href="/sign-in" className="w-full">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-foreground"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/role-selection" className="w-full">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/patient" className="w-full">
                <Button
                  variant="ghost"
                  className="w-full justify-center gap-2 text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                <span className="text-sm font-medium text-muted-foreground">
                  My Account
                </span>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
}
