"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import ThreeAvatar from "./ThreeAvatar"

export function FloatingAvatar() {
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
        x: window.innerWidth - 120, // fixed starting size
        y: window.innerHeight - 120,
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
      const avatarSize = 120 // fixed size
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
    [isDragging]
  )

  const stopDrag = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setIsDragging(false)
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

  const size = 120 // fixed avatar size

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
          : "left 0.3s ease, top 0.3s ease",
        cursor: isDragging ? "grabbing" : "pointer",
      }}
      onMouseDown={(e) => {
        e.preventDefault()
        startDrag(e.clientX, e.clientY)
      }}
      onMouseUp={() => {
        if (!hasDragged.current) stopDrag()
      }}
      onTouchStart={(e) => {
        const touch = e.touches[0]
        startDrag(touch.clientX, touch.clientY)
      }}
      onTouchEnd={(e) => {
        e.preventDefault()
        stopDrag()
      }}
      role="button"
      tabIndex={0}
    >
      {/* Avatar container */}
      <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-primary/60 bg-card shadow-xl">
        <ThreeAvatar size={size} />
      </div>
    </div>
  )
}
