"use client"

/**
 * ThreeAvatar — Lightweight 3D-style avatar component
 * Renders an animated CSS orb as a placeholder for a full Three.js avatar.
 * Can be replaced with @react-three/fiber implementation when needed.
 */

import { Bot } from "lucide-react"

interface ThreeAvatarProps {
  size?: number
}

export default function ThreeAvatar({ size = 180 }: ThreeAvatarProps) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-white/5 animate-pulse" />

      {/* Inner orb */}
      <div
        className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/40 via-violet-500/30 to-purple-600/20 backdrop-blur-xl border border-white/20 shadow-2xl"
        style={{ width: size * 0.75, height: size * 0.75 }}
      >
        {/* Floating particles */}
        <div className="absolute top-2 right-4 w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0.2s" }} />
        <div className="absolute bottom-6 left-3 w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0.8s" }} />
        <div className="absolute top-8 left-6 w-1 h-1 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "0.5s" }} />

        {/* Center icon */}
        <Bot className="h-12 w-12 text-white/80 drop-shadow-lg" />
      </div>

      {/* Rotating ring */}
      <div
        className="absolute inset-2 rounded-full border border-dashed border-white/10 animate-spin"
        style={{ animationDuration: "20s" }}
      />
    </div>
  )
}
