"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X } from "lucide-react"
import ThreeAvatar from "./ThreeAvatar"

export function FloatingAvatar() {
  const [expanded, setExpanded] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const dragRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasDragged = useRef(false)

  // Initialize bottom-right position
useEffect(() => {
  requestAnimationFrame(() => {
    setPosition({
      x: window.innerWidth - 80,
      y: window.innerHeight - 80,
    })
    setInitialized(true)
  })
}, [])


  const startDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragRef.current) return
    hasDragged.current = false
    const rect = dragRef.current.getBoundingClientRect()
    offsetRef.current = { x: clientX - rect.left, y: clientY - rect.top }
    longPressTimer.current = setTimeout(() => {
      setIsDragging(true)
    }, 300)
  }, [])

  const onDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return
      hasDragged.current = true
      const avatarSize = expanded ? 128 : 64
      const newX = Math.min(
        Math.max(0, clientX - offsetRef.current.x),
        window.innerWidth - avatarSize
      )
      const newY = Math.min(
        Math.max(0, clientY - offsetRef.current.y),
        window.innerHeight - avatarSize
      )
      setPosition({ x: newX, y: newY })
    },
    [isDragging, expanded]
  )

  const stopDrag = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setIsDragging(false)
  }, [])

  const handleClick = useCallback(() => {
    if (!hasDragged.current) {
      setExpanded((prev) => {
        const next = !prev
        if (next) {
          setPosition((pos) => ({
            x: Math.min(pos.x, window.innerWidth - 128),
            y: Math.min(pos.y, window.innerHeight - 128),
          }))
        }
        return next
      })
    }
  }, [])

  // Mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => onDrag(e.clientX, e.clientY)
    const handleMouseUp = () => stopDrag()
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, onDrag, stopDrag])

  // Touch events
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      e.preventDefault()
      const touch = e.touches[0]
      onDrag(touch.clientX, touch.clientY)
    }
    const handleTouchEnd = () => stopDrag()
    if (isDragging) {
      window.addEventListener("touchmove", handleTouchMove, { passive: false })
      window.addEventListener("touchend", handleTouchEnd)
    }
    return () => {
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, onDrag, stopDrag])

  if (!initialized) return null

  const size = expanded ? 300 : 120

  return (
    <div
      ref={dragRef}
      className="fixed z-50 select-none"
      style={{
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        transition: isDragging
          ? "none"
          : "width 0.3s ease, height 0.3s ease, left 0.3s ease, top 0.3s ease",
        cursor: isDragging ? "grabbing" : "pointer",
      }}
      onMouseDown={(e) => {
        e.preventDefault()
        startDrag(e.clientX, e.clientY)
      }}
      onMouseUp={handleClick}
      onTouchStart={(e) => {
        const touch = e.touches[0]
        startDrag(touch.clientX, touch.clientY)
      }}
      onTouchEnd={(e) => {
        e.preventDefault()
        stopDrag()
        handleClick()
      }}
      role="button"
      tabIndex={0}
      aria-label={expanded ? "Collapse avatar" : "Expand avatar"}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          setExpanded((prev) => !prev)
        }
      }}
    >

      {/* Avatar container */}
      <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-primary/60 bg-card shadow-xl">
        <ThreeAvatar size={size}/>
      </div>

      {/* Close hint when expanded */}
      {expanded && (
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border shadow-md">
          <X className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
