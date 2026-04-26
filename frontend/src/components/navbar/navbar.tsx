/**
 * Refactored Navbar Component
 * Composes smaller, single-responsibility components
 * Follows: Composition over Inheritance
 * Follows: Single Responsibility Principle (SRP)
 * Follows: Open/Closed Principle (OCP)
 */

"use client";

import { NavbarBrand } from "./navbar-brand";
import { NavLinks, NavLink } from "./nav-links";
import { ThemeSwitcher } from "./theme-switcher";
import { NavbarAuthSection } from "./navbar-auth-section";
import { MobileNav } from "./mobile-nav";

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/#home" },
  { label: "Features", href: "/#features" },
  { label: "Doctors", href: "/#doctors" },
  { label: "AI Assistant", href: "/#ai" },
  { label: "Departments", href: "/#architecture" },
];

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 glass-dark">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <NavbarBrand />

        {/* Desktop Navigation Links */}
        <NavLinks
          links={NAV_LINKS}
          className="hidden items-center gap-1 lg:flex"
        />

        {/* Right Section: Theme + Auth */}
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <NavbarAuthSection />

          {/* Mobile Menu */}
          <MobileNav links={NAV_LINKS} />
        </div>
      </nav>
    </header>
  );
}
