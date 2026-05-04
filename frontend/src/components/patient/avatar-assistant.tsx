"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AvatarAssistantProps {
  position?: 'sidebar' | 'floating'
  className?: string
  src?: string
}

export function AvatarAssistant({ position = 'floating', className, src }: AvatarAssistantProps) {
  const [expanded, setExpanded] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [initialized, setInitialized] = useState(false)

  // Initialize position to bottom-right on collapse
  useEffect(() => {
    if (position !== 'sidebar') {
      setCoords({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80,
      })
    }
    setInitialized(true)
  }, [position])

  if (!initialized) return null

  const isSidebar = position === 'sidebar'
  const size = isSidebar ? '100%' : (expanded ? 128 : 64)

  return (
    <div
      className={cn(
        "z-50 select-none transition-all duration-500 ease-in-out",
        isSidebar ? "relative w-full aspect-square max-w-[120px] mx-auto" : "fixed",
        className
      )}
      style={!isSidebar ? {
        left: coords.x,
        top: coords.y,
        width: size,
        height: size,
      } : {}}
      role="button"
      tabIndex={0}
      aria-label={expanded ? "Collapse avatar" : "Expand avatar"}
      onClick={() => !isSidebar && setExpanded(!expanded)}
      onKeyDown={(e) => {
        if (!isSidebar && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          setExpanded((prev) => !prev)
        }
      }}
    >
      {/* Background Pulse/Glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-primary/30 blur-md animate-pulse decoration-indigo-500/50",
          !isSidebar && expanded ? "scale-125" : "scale-105"
        )}
      />

      {/* Avatar container */}
      <div className={cn(
         "relative h-full w-full overflow-hidden rounded-full border-2 border-white/40 bg-gradient-to-br from-primary/20 to-indigo-500/20 shadow-2xl transition-all duration-500",
         isSidebar ? "hover:scale-105" : (expanded ? "scale-100" : "hover:scale-110")
      )}>
        <Image
          src={src || "/images/ai-doctor-avatar.jpg"}
          alt="AI Healthcare Assistant"
          fill
          className="object-cover"
          draggable={false}
          priority
        />

        {/* Dynamic Scan Line Simulation */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-1/2 w-full animate-scan pointer-events-none" />

        {/* Online indicator */}
        <div className="absolute right-[15%] bottom-[15%] h-[12%] w-[12%] rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
      </div>

      {/* Close hint when expanded (only for floating) */}
      {!isSidebar && expanded && (
        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border shadow-md animate-in fade-in zoom-in duration-200">
          <X className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
