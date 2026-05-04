/**
 * Theme Switcher Component
 * Focuses ONLY on theme switching logic
 * Follows: Single Responsibility Principle (SRP)
 */

"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SunMoon } from "lucide-react";

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="text-muted-foreground hover:text-foreground"
      aria-label="Toggle theme"
    >
      <SunMoon className="h-5 w-5" />
    </Button>
  );
}
