"use client"

import { Canvas, useFrame, useGraph } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { useRef, useEffect, useMemo, useState } from "react"
import * as THREE from "three"
import { SkeletonUtils } from "three-stdlib"

interface HeadProps {
  textToSpeak?: string
  onSpeechStart?: () => void
  onSpeechEnd?: () => void
}

function Head({ textToSpeak = "", onSpeechStart, onSpeechEnd }: HeadProps) {
  const { scene } = useGLTF("/models/avatar.glb")

  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes } = useGraph(clone)

  const groupRef = useRef<THREE.Group>(null!)
  const headMeshRef = useRef<THREE.SkinnedMesh | null>(null)
  const visemes = useRef<Record<string, number>>({})
  const activeViseme = useRef<number>(0)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (!voices?.length) return

      const candidates = [
        "zira",
        "samantha",
        "kendra",
        "ivy",
        "alloy",
        "anna",
        "victoria",
        "karen",
        "nicole",
        "olivia",
        "emma",
        "amy",
        "tessa",
        "ava",
        "bella",
        "linda",
        "audrey",
      ]

      const voice =
        voices.find((voice) =>
          candidates.some((candidate) => voice.name.toLowerCase().includes(candidate))
        ) ||
        voices.find((voice) => /female|woman|girl/.test(voice.name.toLowerCase())) ||
        voices.find((voice) => voice.lang.startsWith("en")) ||
        voices[0]

      setSelectedVoice(voice)
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  useEffect(() => {
    if (!scene) return

    const head = nodes["Wolf3D_Head"] as THREE.SkinnedMesh
    if (!head) return

    headMeshRef.current = head
    if (head.morphTargetDictionary) {
      visemes.current = head.morphTargetDictionary
    }

    const visible = ["Wolf3D_Head", "Wolf3D_Teeth", "EyeLeft", "EyeRight"]
    Object.entries(nodes).forEach(([key, node]) => {
      if ((node as any).isSkinnedMesh) {
        ;(node as THREE.SkinnedMesh).visible = visible.includes(key)
      }
    })
  }, [nodes, scene])

  useEffect(() => {
    if (!textToSpeak) return

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    if (selectedVoice) {
      utterance.voice = selectedVoice
      utterance.lang = selectedVoice.lang
    }
    utterance.pitch = 1.2
    utterance.rate = 1.05
    utterance.volume = 1

    utterance.onstart = () => {
      onSpeechStart?.()
    }

    utterance.onboundary = (event) => {
      const char = textToSpeak[event.charIndex]?.toLowerCase()
      if (!char) return

      if ("aeiou".includes(char)) activeViseme.current = visemes.current["viseme_aa"] ?? 0
      else if ("bmp".includes(char)) activeViseme.current = visemes.current["viseme_PP"] ?? 0
      else if ("fv".includes(char)) activeViseme.current = visemes.current["viseme_FF"] ?? 0
      else if ("lr".includes(char)) activeViseme.current = visemes.current["viseme_RR"] ?? 0
      else if (char === "s") activeViseme.current = visemes.current["viseme_SS"] ?? 0
      else if ("kgt".includes(char)) activeViseme.current = visemes.current["viseme_kk"] ?? 0
      else activeViseme.current = visemes.current["viseme_sil"] ?? 0
    }

    utterance.onend = () => {
      activeViseme.current = visemes.current["viseme_sil"] ?? 0
      onSpeechEnd?.()
    }

    utterance.onerror = () => {
      onSpeechEnd?.()
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)

    return () => window.speechSynthesis.cancel()
  }, [textToSpeak, onSpeechEnd, onSpeechStart, selectedVoice])

  useFrame((state) => {
    if (!groupRef.current) return

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1)

    const mesh = headMeshRef.current
    if (!mesh?.morphTargetInfluences) return

    const influences = mesh.morphTargetInfluences
    const talking = Boolean(textToSpeak.trim())
    const decay = talking ? 0.12 : 0.25
    for (let i = 0; i < influences.length; i++) {
      influences[i] = THREE.MathUtils.lerp(influences[i], 0, decay)
    }

    const mouthPulse = talking ? Math.sin(state.clock.elapsedTime * 18) * 0.08 + 0.08 : 0
    const targetValue = talking ? 0.75 + mouthPulse : 0
    influences[activeViseme.current] = THREE.MathUtils.lerp(
      influences[activeViseme.current],
      targetValue,
      0.3
    )

    groupRef.current.position.y = -1.58 + Math.sin(state.clock.elapsedTime) * 0.02
  })

  return (
    <group ref={groupRef} position={[0, -1.58, 0]}>
      <primitive object={clone} />
    </group>
  )
}

interface ThreeAvatarProps {
  size: number
  textToSpeak?: string
  onSpeechStart?: () => void
  onSpeechEnd?: () => void
}

export default function ThreeAvatar({ size, textToSpeak = "", onSpeechStart, onSpeechEnd }: ThreeAvatarProps) {
  return (
    <Canvas
      style={{ width: size, height: size, display: "block" }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.15, 0.65], fov: 42 }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      }}
    >
      <ambientLight intensity={2} />
      <directionalLight position={[2, 2, 2]} intensity={2} />
      <Head textToSpeak={textToSpeak} onSpeechStart={onSpeechStart} onSpeechEnd={onSpeechEnd} />
    </Canvas>
  )
}
