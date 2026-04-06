"use client"

import { Canvas, useFrame, useGraph } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { useRef, useEffect, useMemo, useState } from "react"
import * as THREE from "three"
import { SkeletonUtils } from "three-stdlib"

interface Props {
  size: number
  textToSpeak?: string
  manualJawPosition?: number // 0-1, manual control of jaw position
}

export function Head({ textToSpeak = "", manualJawPosition }: { textToSpeak?: string, manualJawPosition?: number }) {
  const { scene, error } = useGLTF("/models/avatar.glb")
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes } = useGraph(clone)

  // Debug logging
  useEffect(() => {
    console.log("Avatar model loaded:", !!scene)
    console.log("Avatar error:", error)
    console.log("Nodes:", Object.keys(nodes))
  }, [scene, error, nodes])
  
  const groupRef = useRef<THREE.Group>(null!)
  const headMeshRef = useRef<THREE.SkinnedMesh | null>(null)
  const teethMeshRef = useRef<THREE.SkinnedMesh | null>(null)
  const jawIndex = useRef<number | null>(null)
  const speakingIntensity = useRef(0)
  
  // Re-defining the missing 'mouse' ref
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (error) {
      console.error("Failed to load avatar model:", error)
      return
    }

    if (!scene) {
      console.log("Avatar model not loaded yet")
      return
    }

    // Hide body parts
    const partsToKeep = ["Wolf3D_Head", "Wolf3D_Teeth", "EyeLeft", "EyeRight"]
    Object.keys(nodes).forEach((key) => {
      const node = nodes[key]
      if ((node as THREE.SkinnedMesh).isSkinnedMesh) {
        node.visible = partsToKeep.includes(key)
      }
    })

    // Assign refs for the frame loop to use directly
    const head = nodes["Wolf3D_Head"] as THREE.SkinnedMesh
    const teeth = nodes["Wolf3D_Teeth"] as THREE.SkinnedMesh
    
    if (head) {
      headMeshRef.current = head
      if (head.morphTargetDictionary && head.morphTargetDictionary["jawOpen"] !== undefined) {
        jawIndex.current = head.morphTargetDictionary["jawOpen"]
      }
    }
    if (teeth) teethMeshRef.current = teeth
  }, [nodes])

  // Speech Logic
  useEffect(() => {
    if (!textToSpeak) return
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    let interval: NodeJS.Timeout

    utterance.onstart = () => {
      interval = setInterval(() => {
        speakingIntensity.current = Math.random() * 0.7
      }, 100)
    }
    utterance.onend = () => {
      clearInterval(interval)
      speakingIntensity.current = 0
    }

    window.speechSynthesis.speak(utterance)
    return () => {
      window.speechSynthesis.cancel()
      clearInterval(interval)
    }
  }, [textToSpeak])

  useFrame((state) => {
    if (!groupRef.current) return

    // 1. Movement
    const targetY = THREE.MathUtils.clamp(mouse.current.x * 0.5, -0.6, 0.6)
    const targetX = THREE.MathUtils.clamp(-mouse.current.y * 0.3, -0.4, 0.4)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.1)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.1)

    // 2. Jaw Morph (Applying to the Ref, which usually bypasses the "nodes" immutability check)
    if (headMeshRef.current && jawIndex.current !== null) {
      const influence = headMeshRef.current.morphTargetInfluences!
      const target = jawIndex.current

      // Use manual jaw position if provided, otherwise use speech synthesis
      const jawPosition = manualJawPosition !== undefined ? manualJawPosition : speakingIntensity.current

      influence[target] = THREE.MathUtils.lerp(influence[target], jawPosition, 0.2)

      // Sync teeth
      if (teethMeshRef.current?.morphTargetInfluences) {
        teethMeshRef.current.morphTargetInfluences[target] = influence[target]
      }
    }
    
    // 3. Gentle Float Animation (Optional)
    groupRef.current.position.y = -1.5 + Math.sin(state.clock.elapsedTime) * 0.02
  })

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      <primitive object={clone} />
    </group>
  )
}

export default function ThreeAvatar({ size, textToSpeak = "", manualJawPosition }: Props) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Check if WebGL is supported
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      console.error('WebGL not supported')
      setHasError(true)
    }
  }, [])

  if (hasError) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div>Avatar</div>
          <div style={{ fontSize: '12px', color: 'red' }}>WebGL Error</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0.2, 0.8], fov: 35 }}>
        <ambientLight intensity={2} />
        <pointLight position={[2, 2, 2]} intensity={5} />
        <Head textToSpeak={textToSpeak} manualJawPosition={manualJawPosition} />
      </Canvas>
    </div>
  )
}