"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { X } from "lucide-react" 

const ThreeAvatar = dynamic(() => import("./ThreeAvatar"), { ssr: false })

export function FloatingAvatar() {
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const messages = useMemo(
    () => [
      "Hi there, how can I help you today?",
      "Need a hand with your schedule?",
      "I can help you find your next appointment.",
      "Ask me anything about your health records.",
      "Ready to assist with your care plan.",
    ],
    []
  )

  const speechText = useMemo(
    () => (expanded ? messages[Math.floor(Math.random() * messages.length)] : ""),
    [expanded, messages]
  )

  const dragRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasDragged = useRef(false)

  useEffect(() => {
    setMounted(true)
    setPosition({
      x: window.innerWidth - 80,
      y: window.innerHeight - 80,
    })
  }, [])

  const startDrag = useCallback((x: number, y: number) => {
    if (!dragRef.current) return
    hasDragged.current = false
    const rect = dragRef.current.getBoundingClientRect()
    offsetRef.current = { x: x - rect.left, y: y - rect.top }
    longPressTimer.current = setTimeout(() => setIsDragging(true), 300)
  }, [])

  const onDrag = useCallback(
    (x: number, y: number) => {
      if (!isDragging) return
      hasDragged.current = true
      const size = expanded ? 128 : 64
      setPosition({
        x: Math.min(Math.max(0, x - offsetRef.current.x), window.innerWidth - size),
        y: Math.min(Math.max(0, y - offsetRef.current.y), window.innerHeight - size),
      })
    },
    [isDragging, expanded]
  )

  const stopDrag = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    setIsDragging(false)
  }, [])

  const handleClick = useCallback(() => {
    if (!hasDragged.current) setExpanded((prev) => !prev)
  }, [])

  useEffect(() => {
    if (!isDragging) return
    const move = (e: MouseEvent) => onDrag(e.clientX, e.clientY)
    const up = () => stopDrag()
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseup", up)
    }
  }, [isDragging, onDrag, stopDrag])

  if (!mounted) return null

  const size = expanded ? 128 : 64
  // The canvas renders larger than the circle to keep the face centred
  // after the circular clip. We offset it so it stays centred.
  const canvasSize = Math.round(size * 1.8)
  const canvasOffset = -Math.round((canvasSize - size) / 2)

  return (
    <div
      ref={dragRef}
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        cursor: isDragging ? "grabbing" : "pointer",
      }}
      onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
      onMouseUp={handleClick}
    >
      {/* Pulse ring */}
      <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />

      {/* Circular clipping container */}
      <div
        className="relative rounded-full overflow-hidden border shadow-xl"
        style={{ width: size, height: size }}
      >
        {/* Canvas is larger and centred via negative offset so the face fills the circle */}
        <div
          style={{
            position: "absolute",
            top: canvasOffset,
            left: canvasOffset,
            pointerEvents: "none",
          }}
        >
          <ThreeAvatar size={canvasSize} textToSpeak={expanded ? speechText : ""} />
        </div>
      </div>

      {expanded && (
        <div className="absolute -top-2 -right-2">
          <X size={12} />
        </div>
      )}
    </div>
  )
}