"use client"

import { m } from "framer-motion"
import { Activity } from "lucide-react"

export default function Loading() {


  
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background">
      <div className="relative flex flex-col items-center">
        {/* Animated pulse background */}
        <div 
          className="absolute h-32 w-32 rounded-full bg-primary blur-2xl"
        />

        <div
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm"
        >
          <Activity className="h-8 w-8 text-primary animate-pulse" />
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/80">
            Initializing Services
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1 w-1 rounded-full bg-primary"
              />
            ))}
          </div>
        </div>

        {/* Secure layer indicator */}
        <div className="mt-16 flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-1.5 backdrop-blur-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Secure Clinical Environment
          </span>
        </div>
      </div>
    </div>
  )
}
