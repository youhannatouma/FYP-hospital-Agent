"use client";

import { useState, ReactNode, useEffect, useCallback } from "react";
import { IntroOverlay } from "./IntroOverlay";

const INTRO_STORAGE_KEY = "intro_seen";

/**
 * LandingIntroWrapper — simplified and stable.
 *
 * Strategy: The content (children) is ALWAYS rendered normally.
 * The intro overlay simply sits ON TOP with fixed positioning.
 * When the intro finishes, the overlay is removed from the DOM.
 * This avoids all display:none / IntersectionObserver race conditions.
 */
export function LandingIntroWrapper({ children }: { children: ReactNode }) {
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  useEffect(() => {
    // Check sessionStorage only on the client after mount
    const alreadySeen = sessionStorage.getItem(INTRO_STORAGE_KEY);
    setShowIntro(!alreadySeen);
  }, []);

  const handleFinish = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {}
    setShowIntro(false);
  }, []);

  return (
    <>
      {/* Intro overlay — fixed on top, does NOT affect children layout */}
      {showIntro && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
          }}
        >
          <IntroOverlay onFinish={handleFinish} />
        </div>
      )}

      {/* Content is ALWAYS rendered — never hidden with display:none */}
      {children}
    </>
  );
}
