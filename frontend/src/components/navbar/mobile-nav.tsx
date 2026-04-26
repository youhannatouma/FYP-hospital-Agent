/**
 * Mobile Navigation Component
 * Manages mobile menu for navbar
 * Follows: Single Responsibility Principle (SRP)
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { NavLink } from "./nav-links";

interface MobileNavProps {
  links: NavLink[];
  onNavigate?: () => void;
}

export function MobileNav({ links, onNavigate }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-white/10 p-4">
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors block"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
