"use client"

import { useEffect, useRef, useState } from "react"

export function useScrollAnimation(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null)
  // Fail open: keep content visible by default so hydration or observer timing
  // issues never blank critical sections on first paint.
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(node)
        }
      },
      { threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}
