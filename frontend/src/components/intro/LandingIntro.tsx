"use client";

import { useSyncExternalStore } from "react";
import { IntroOverlay } from "./IntroOverlay";

const INTRO_STORAGE_KEY = "intro_seen";
const INTRO_STORAGE_EVENT = "landing_intro_seen_changed";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(INTRO_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(INTRO_STORAGE_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  try {
    return !sessionStorage.getItem(INTRO_STORAGE_KEY);
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

export function LandingIntro() {
  const isPlaying = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const handleFinish = () => {
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
      window.dispatchEvent(new Event(INTRO_STORAGE_EVENT));
    } catch {}
  };

  return isPlaying ? <IntroOverlay onFinish={handleFinish} /> : null;
}
