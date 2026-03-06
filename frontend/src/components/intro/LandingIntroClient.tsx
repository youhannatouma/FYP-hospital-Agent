"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const LandingIntro = dynamic(
  () => import("./LandingIntro").then((m) => m.LandingIntro),
  { ssr: false },
);

interface LandingIntroClientProps {
  children: ReactNode;
}

export function LandingIntroClient({ children }: LandingIntroClientProps) {
  return <LandingIntro>{children}</LandingIntro>;
}
