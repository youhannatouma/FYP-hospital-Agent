"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Activity, Menu, X, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton,
  useUser 
} from "@clerk/nextjs"

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "Features", href: "/#features" },
  { label: "Doctors", href: "/#doctors" },
  { label: "AI Assistant", href: "/#ai" },
  { label: "Departments", href: "/#architecture" },
]

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user } = useUser();

  const role = user?.publicMetadata?.role as string | undefined;
  const dashboardHref = role === "admin" ? "/admin" : role === "doctor" ? "/doctor" : "/patient";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 glass-dark">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold italic tracking-tight text-foreground font-heading">
            Care
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
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

          {/* Desktop Auth */}
          <div className="hidden items-center gap-2 lg:flex">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/onboarding">
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
              <Link href={dashboardHref}>
                <Button variant="ghost" className="text-foreground font-bold italic">
                  Go to Dashboard
                </Button>
              </Link>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9 rounded-xl border-2 border-primary/20 hover:border-primary transition-all shadow-lg"
                  }
                }}
              />
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

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 pb-6 lg:hidden">
          <ul className="flex flex-col gap-1 pt-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/onboarding">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-foreground font-bold"
                >
                  Sign In
                </Button>
              </SignInButton>
              <Link href="/sign-up" className="w-full">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                  Get Started
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href={dashboardHref} className="w-full">
                <Button variant="outline" className="w-full justify-center font-bold">
                  Go to Dashboard
                </Button>
              </Link>
              <div className="flex justify-center p-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  )
}
