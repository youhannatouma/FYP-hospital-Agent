"use client";

import { m, Variants, useAnimation } from "framer-motion";
import { Activity } from "lucide-react";

// Use the real controls type returned by `useAnimation` so it's compatible
// with framer-motion's internal control implementation.
type Controls = ReturnType<typeof useAnimation>;

interface IntroAnimationProps {
  controls: Controls;
}

// Durations for deterministic timeline (seconds)
const DURATION = {
  LOGO: 1.5,
  TAGLINE: 1.3,
  EXIT: 0.7,
};

const logoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  logoVisible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: DURATION.LOGO },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -12,
    transition: { duration: DURATION.EXIT },
  },
};

const taglineVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  taglineVisible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.TAGLINE },
  },
  exit: { opacity: 0, y: -8, transition: { duration: DURATION.EXIT } },
};

const overlayVariants: Variants = {
  hidden: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: DURATION.EXIT } },
};

export function IntroAnimation({ controls }: IntroAnimationProps) {
  // Purely presentational: uses passed `controls` for deterministic timeline
  const bg = "linear-gradient(135deg,#041025 0%,#071428 100%)";

  return (
    <m.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: bg }}
      initial="hidden"
      animate={controls}
      variants={overlayVariants}
    >
      <div className="pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center gap-8 select-none">
        <m.div
          className="flex flex-col items-center gap-6"
          variants={logoVariants}
          initial="hidden"
          animate={controls}
        >
          <div className="relative flex items-center justify-center">
            <m.div
              className="absolute rounded-full border border-primary/20"
              style={{ inset: -24 }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.6, 0.35] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] shadow-2xl bg-gradient-to-br from-teal-400 to-teal-600">
              <Activity className="h-12 w-12 text-white" strokeWidth={2} />
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            <m.span
              className="text-6xl font-black italic tracking-tight"
              style={{
                fontFamily: "var(--font-space-grotesk)",
                color: "#ffffff",
              }}
            >
              Care
            </m.span>
            <m.span className="text-3xl font-black text-primary ml-1">
              .AI
            </m.span>
          </div>
        </m.div>

        <m.div
          variants={taglineVariants}
          initial="hidden"
          animate={controls}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/60" />
            <p className="text-sm font-black uppercase tracking-[0.3em] text-primary">
              Neural Clinical Intelligence
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/60" />
          </div>
          <p className="text-center text-lg font-medium max-w-xs leading-relaxed text-white/70">
            Bringing medical expertise to every doorstep
          </p>
        </m.div>
      </div>
    </m.div>
  );
}
