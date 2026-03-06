"use client";

import { useState, ReactNode } from "react";
import { IntroOverlay } from "./IntroOverlay";

const INTRO_STORAGE_KEY = "intro_seen";

export function LandingIntro({ children }: { children: ReactNode }) {
  // states: "checking" (initial), "playing" (show intro), "idle" (show content)
  // states: "playing" (show intro) | "idle" (show content)
  const [state, setState] = useState<"playing" | "idle">(() => {
    // Read sessionStorage during client render; if server, default to idle.
    try {
      if (typeof window === "undefined") return "idle";
      const seen = sessionStorage.getItem(INTRO_STORAGE_KEY);
      return seen ? "idle" : "playing";
    } catch {
      return "idle";
    }
  });

  const handleFinish = () => {
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {}
    setState("idle");
  };

  // While playing, do not render the page content to avoid flashes.
  if (state === "playing") {
    return <IntroOverlay onFinish={handleFinish} />;
  }

  // state === 'idle' -> render page content
  return children;
}
