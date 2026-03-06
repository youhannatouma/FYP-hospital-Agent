"use client";

import { useEffect, useRef } from "react";
import { useAnimation } from "framer-motion";
import { IntroAnimation } from "./IntroAnimation";

interface IntroOverlayProps {
  onFinish: () => void;
}

// Deterministic durations must match IntroAnimation's DURATION constants
// Sequence uses the variant labels exposed by `IntroAnimation`
// (kept conceptually for reference)

export function IntroOverlay({ onFinish }: IntroOverlayProps) {
  const controls = useAnimation();
  const exitingRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    // Safety fallback: ensure the intro always finishes after a maximum duration
    const FALLBACK_MS = 4200;
    const fallback = setTimeout(() => {
      if (!exitingRef.current) {
        exitingRef.current = true;
        controls
          .start("exit")
          .then(() => {
            if (mounted) onFinish();
          })
          .catch(() => {
            if (mounted) onFinish();
          });
      }
    }, FALLBACK_MS);

    async function run() {
      try {
        // Phase 1: logo
        await controls.start("logoVisible");

        // Phase 2: tagline
        await controls.start("taglineVisible");

        // Phase 3: exit
        await controls.start("exit");

        if (mounted) onFinish();
      } catch {
        if (mounted) onFinish();
      }
    }

    run();

    return () => {
      mounted = false;
      clearTimeout(fallback);
    };
  }, [controls, onFinish]);

  // Skip handlers (click/scroll/keydown) trigger exit immediately
  useEffect(() => {
    const handleSkip = () => {
      if (exitingRef.current) return;
      exitingRef.current = true;
      controls
        .start("exit")
        .then(() => onFinish())
        .catch(() => onFinish());
    };

    window.addEventListener("click", handleSkip, { passive: true });
    window.addEventListener("wheel", handleSkip, { passive: true });
    window.addEventListener("keydown", handleSkip);
    window.addEventListener("touchstart", handleSkip, { passive: true });

    return () => {
      window.removeEventListener("click", handleSkip as EventListener);
      window.removeEventListener("wheel", handleSkip as EventListener);
      window.removeEventListener("keydown", handleSkip as EventListener);
      window.removeEventListener("touchstart", handleSkip as EventListener);
    };
  }, [controls, onFinish]);

  return <IntroAnimation controls={controls} />;
}
