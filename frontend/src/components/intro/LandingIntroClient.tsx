"use client";
import dynamic from "next/dynamic";
import { ReactNode } from "react";

// ssr: false is critical — sessionStorage doesn't exist on the server.
// Without this, the initial render always shows "idle" (no intro),
// then hydration re-renders with the correct state, causing a flash.
const LandingIntro = dynamic(
  () => import("./LandingIntro").then((m) => m.LandingIntro),
  { ssr: false }
);

interface LandingIntroClientProps {
  children: ReactNode;
}

export function LandingIntroClient({ children }: LandingIntroClientProps) {
  // No timer. No hidden div. LandingIntro handles everything correctly.
  return <LandingIntro>{children}</LandingIntro>;
}
