"use client";
import dynamic from "next/dynamic";
import { ReactNode } from "react";

// Dynamically import so sessionStorage check runs client-side only
const LandingIntro = dynamic(
  () => import("./LandingIntro").then((m) => m.LandingIntro),
  { ssr: false }  // ← critical: prevents server/client mismatch
);

export function LandingIntroClient({ children }: { children: ReactNode }) {
  return <LandingIntro>{children}</LandingIntro>;
}
