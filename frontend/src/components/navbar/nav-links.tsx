/**
 * Navigation Links Component
 * Manages navigation links display
 * Follows: Single Responsibility Principle (SRP)
 */

"use client";

import Link from "next/link";

export interface NavLink {
  label: string;
  href: string;
}

interface NavLinksProps {
  links: NavLink[];
  className?: string;
}

export function NavLinks({ links, className = "" }: NavLinksProps) {
  return (
    <ul className={className}>
      {links.map((link) => (
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
  );
}
