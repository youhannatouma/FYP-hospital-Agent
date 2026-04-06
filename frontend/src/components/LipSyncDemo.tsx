"use client"

import { useState, useEffect } from "react"
import ThreeAvatar from "./ThreeAvatar"
import { generateLipSync, PhonemeData } from "../lib/lipSync"

export function LipSyncDemo() {
  const [currentJawPosition, setCurrentJawPosition] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentText, setCurrentText] = useState("Hello world")
  const [currentViseme, setCurrentViseme] = useState<string>("")

  const startLipSync = (text: string = currentText) => {
    const syncData = generateLipSync(text)
    setIsAnimating(true)

    let currentTime = 0
    const phonemes = syncData.phonemes
    let lastJawPosition = 0

    const animate = () => {
      if (currentTime >= syncData.totalDuration) {
        setIsAnimating(false)
        setCurrentJawPosition(0)
        setCurrentViseme("")
        return
      }

      // Find current phoneme
      let accumulatedTime = 0
      let currentPhoneme: PhonemeData | null = null

      for (const phoneme of phonemes) {
        accumulatedTime += phoneme.duration
        if (currentTime < accumulatedTime) {
          currentPhoneme = phoneme
          break
        }
      }

      if (currentPhoneme) {
        // Smooth transition between jaw positions
        const targetJawPosition = currentPhoneme.viseme.jawPosition
        const smoothedJawPosition = lastJawPosition + (targetJawPosition - lastJawPosition) * 0.3

        setCurrentJawPosition(smoothedJawPosition)
        setCurrentViseme(currentPhoneme.viseme.phoneme)

        lastJawPosition = smoothedJawPosition
      }

      currentTime += 16 // ~60fps
      setTimeout(animate, 16)
    }

    animate()
  }

  const exampleTexts = [
    "Hello",
    "How are you?",
    "Thank you",
    "Goodbye",
    "I understand",
    "Mama made rum",
    "Fuzzy wuzzy",
    "Peter Piper"
  ]

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-bold">Lip Sync Demo</h2>

      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          className="px-3 py-2 border rounded"
          placeholder="Enter text to lip sync"
        />

        <div className="flex gap-2 flex-wrap">
          {exampleTexts.map((text) => (
            <button
              key={text}
              onClick={() => {
                setCurrentText(text)
                startLipSync(text)
              }}
              disabled={isAnimating}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm disabled:opacity-50"
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <ThreeAvatar size={200} manualJawPosition={currentJawPosition} />
      </div>

      <button
        onClick={() => startLipSync()}
        disabled={isAnimating}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isAnimating ? "Animating..." : "Start Lip Sync"}
      </button>

      <div className="text-sm text-gray-600">
        Current jaw position: {currentJawPosition.toFixed(2)} | Viseme: {currentViseme || 'none'}
      </div>
    </div>
  )
}