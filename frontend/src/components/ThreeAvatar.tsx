"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function ThreeAvatar({ size }: { size: number }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50, size / size, 0.1, 1000)
    camera.position.z = 3

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(size, size)
    mount.appendChild(renderer.domElement)

    // --- HEAD: Ellipsoid (taller than wide) ---
    const headGeo = new THREE.SphereGeometry(1, 64, 64)
    headGeo.scale(1, 1.2, 1) // stretch in Y for a more human head shape
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.6,
      roughness: 0.4,
    })
    const head = new THREE.Mesh(headGeo, headMat)
    scene.add(head)

    // --- VISOR: Eye area ---
    const visorGeo = new THREE.SphereGeometry(
      0.6,  // slightly smaller than before
      64,
      64,
      0,
      Math.PI * 2,
      Math.PI * 0.3,
      Math.PI * 0.4
    )
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.2,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9,
    })
    const visor = new THREE.Mesh(visorGeo, visorMat)
    visor.position.set(0, 0.1, 0.85) // move up slightly for eye level
    head.add(visor)

    // --- Subtle nose hint ---
    const noseGeo = new THREE.ConeGeometry(0.08, 0.3, 16)
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x111111 })
    const nose = new THREE.Mesh(noseGeo, noseMat)
    nose.rotation.x = Math.PI / 2
    nose.position.set(0, 0, 0.9)
    head.add(nose)

    // --- LIGHTS ---
    const light = new THREE.PointLight(0xffffff, 2)
    light.position.set(5, 5, 5)
    scene.add(light)
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)

    // --- ANIMATE ---
    let frameId: number
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      head.rotation.y += 0.003
      const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.02
      visor.scale.set(pulse, pulse, pulse)
      renderer.render(scene, camera)
    }
    animate()

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(frameId)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [size])

  return <div ref={mountRef} className="h-full w-full" />
}

