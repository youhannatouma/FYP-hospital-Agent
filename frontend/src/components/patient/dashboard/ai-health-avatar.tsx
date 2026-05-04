"use client"

import { Bot, Heart, MessageCircle, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThreeAvatar from "../../ThreeAvatar"
import { m } from "framer-motion"
import { useRouter } from "next/navigation"

const suggestedQuestions = [
  "What should I know about my cholesterol levels?",
  "Are there any medication interactions I should know?",
  "What lifestyle changes can improve my heart health?",
]

export function AIHealthAvatar() {
  const router = useRouter()

  const openAssistant = (prompt?: string) => {
    if (prompt) {
      router.push(`/patient/ai-assistant?prompt=${encodeURIComponent(prompt)}`)
      return
    }
    router.push("/patient/ai-assistant")
  }

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="premium-card rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-2xl overflow-hidden relative group p-6"
    >
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-glow">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-none text-white">AI Health Avatar</h3>
              <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mt-1.5">Hyper-Personalized Guide</p>
            </div>
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-indigo-600 bg-indigo-500/50 backdrop-blur-sm" />
            ))}
          </div>
        </div>

        <div className="relative aspect-square max-w-[180px] mx-auto group-hover:scale-105 transition-transform duration-700">
           <ThreeAvatar size={180} textToSpeak="Hello, I am your Health Assistant. How can I help you today?" />
           <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 glass-dark rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl">
             AI Active & Scanning
           </div>
        </div>

        <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-5 mt-2 inner-glow">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-rose-300 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-indigo-100">Vital Diagnostics</span>
          </div>
          <p className="text-xs text-indigo-50/70 leading-relaxed font-medium">
            Your cardiovascular health is currently <span className="text-emerald-300 font-black">optimal</span>. Blood pressure is within range (120/80).
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden relative border border-white/5">
               <m.div 
                initial={{ width: 0 }}
                animate={{ width: "82%" }}
                transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full shadow-glow" 
               />
            </div>
            <span className="text-[10px] font-black text-white">82% Score</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-200/50 px-1">
            <MessageCircle className="h-3 w-3" />
            Contextual Inquiry
          </p>
          <div className="flex flex-col gap-2">
            {suggestedQuestions.map((q, i) => (
              <m.button
                key={i}
                whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.1)" }}
                className="rounded-xl bg-white/5 border border-white/5 px-4 py-2.5 text-left text-[11px] font-bold text-white/90 transition-all hover:text-white group-hover:border-white/10"
                onClick={() => openAssistant(q)}
              >
                {q}
              </m.button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <Button
            className="w-full bg-amber-400 text-slate-950 hover:bg-amber-500 border-0 h-11 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95"
            onClick={() => openAssistant()}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Start Chat
          </Button>
          <Button
            variant="outline"
            className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 h-11 rounded-2xl font-black text-[11px] uppercase tracking-widest backdrop-blur-md transition-all active:scale-95"
          >
            <Mic className="mr-2 h-4 w-4" />
            Vocalize
          </Button>
        </div>
      </div>

      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none" />
    </m.div>
  )
}
