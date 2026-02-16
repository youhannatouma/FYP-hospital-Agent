"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { useRef, useMemo, useEffect } from "react"
import * as THREE from "three"

interface Props {
  size: number
  speaking?: number
}

function Head({ speaking = 0 }: { speaking?: number }) {
  const group = useRef<THREE.Group>(null)
  const { scene } = useGLTF("/models/charlize_theron_head.glb")
  const clonedScene = useMemo(() => scene.clone(), [scene])

  // Store mouse position relative to canvas
  const mouse = useRef({ x: 0, y: 0 })

  // Track mouse movements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = document.querySelector("canvas")
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      // normalize between -1 and 1 relative to canvas center
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useFrame(() => {
    if (!group.current) return

    const baseTilt = -0.2 // radians, starts slightly looking upward

    // Sensitivity multipliers
    const horizontalSensitivity = 0.15 // smaller = less movement
    const verticalSensitivity = 0.025

    // Target rotations
    let targetY = mouse.current.x * horizontalSensitivity
    let targetX = -mouse.current.y * verticalSensitivity + baseTilt

    // Clamp rotations to prevent over-rotation
    targetY = THREE.MathUtils.clamp(targetY, -0.3, 0.3) // ~17° left/right
    targetX = THREE.MathUtils.clamp(targetX, -0.15 + baseTilt, 0.15 + baseTilt) // very minimal vertical

    // Smooth interpolation
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.05)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.05)

    // Mouth animation
    const mouth = group.current.getObjectByName("Mouth") as THREE.Mesh | null
    if (mouth) {
      mouth.scale.y = 1 + speaking * 0.35
    }
  })

  return (
    <primitive
      ref={group}
      object={clonedScene}
      scale={0.1}
      position={[0, -1.5, 0]}
      rotation={[0, 0, 0]}
    />
  )
}

export default function ThreeAvatar({ size, speaking = 0 }: Props) {
  return (
    <Canvas
      style={{ width: size, height: size }}
      camera={{ position: [0, 1.4, 3], fov: 45 }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 5, 2]} intensity={2} />
      <Head speaking={speaking} />
    </Canvas>
  )
}

// Preload model
useGLTF.preload("/models/charlize_theron_head.glb")
