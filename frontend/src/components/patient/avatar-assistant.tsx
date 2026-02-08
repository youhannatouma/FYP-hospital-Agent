"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AvatarAssistantProps {
  position?: 'sidebar' | 'floating'
  className?: string
}

export function AvatarAssistant({ position = 'floating', className }: AvatarAssistantProps) {
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

  const size = expanded ? 128 : 64
  const isSidebar = position === 'sidebar'

  return (
    <div
      className={cn(
        "z-50 select-none transition-all duration-300 ease-in-out",
        isSidebar ? "relative mx-auto" : "fixed",
        className
      )}
      style={!isSidebar ? {
        left: coords.x,
        top: coords.y,
        width: size,
        height: size,
      } : {
        width: size,
        height: size,
      }}
      role="button"
      tabIndex={0}
      aria-label={expanded ? "Collapse avatar" : "Expand avatar"}
      onClick={() => setExpanded(!expanded)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          setExpanded((prev) => !prev)
        }
      }}
    >
      {/* Glow ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-primary/20 transition-transform duration-300",
          expanded ? "scale-110" : "scale-100"
        )}
        style={{
          borderRadius: "50%",
        }}
      />

      {/* Avatar container */}
      <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-primary/60 bg-card shadow-xl transition-all duration-300">
        <Image
          src="/images/ai-doctor-avatar.jpg"
          alt="AI Healthcare Assistant"
          width={128}
          height={128}
          className="h-full w-full object-cover"
          draggable={false}
          priority
        />

        {/* Online indicator */}
        <div className="absolute right-1 bottom-1 h-3 w-3 rounded-full border-2 border-card bg-emerald-500 shadow-sm shadow-emerald-500/50" />
      </div>

      {/* Close hint when expanded */}
      {expanded && (
        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border shadow-md animate-in fade-in zoom-in duration-200">
          <X className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
