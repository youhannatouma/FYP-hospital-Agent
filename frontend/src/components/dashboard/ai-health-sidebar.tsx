"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */

import { MessageCircle, Mic, Activity, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AIHealthSidebar() {
  return (
    <div className="w-full rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 p-4 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarImage src="/images/ai-doctor-avatar.jpg" alt="AI Avatar" />
            <AvatarFallback className="bg-purple-200 text-purple-900">AI</AvatarFallback>
          </Avatar>
           <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-indigo-700 bg-emerald-400"></div>
        </div>
        <div>
          <h3 className="font-bold text-sm leading-none">AI Health Avatar</h3>
          <p className="text-xs text-purple-100/80 mt-1">Your Personal Health Guide</p>
        </div>
      </div>

      {/* Health Status Dashboard */}
      <div className="mb-6 rounded-lg bg-white/10 p-3 backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-emerald-300" />
            <h4 className="text-sm font-semibold">Health Status Summary</h4>
        </div>
        <p className="text-xs text-purple-100/90 leading-relaxed mb-3">
          Your overall health is looking good! Blood pressure is well-controlled with current medication.
        </p>
        <div className="flex items-center gap-2">
            <Progress value={82} className="h-2 bg-purple-900/50 [&>div]:bg-emerald-400" />
            <span className="text-xs font-bold font-mono">82%</span>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="mb-6 rounded-lg bg-white/5 p-3 border border-white/5">
         <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
            <h4 className="text-xs font-semibold uppercase tracking-wider opacity-80">Suggested Questions</h4>
        </div>
        <div className="space-y-2">
            <button className="w-full text-left rounded bg-purple-500/20 px-3 py-2 text-xs font-medium text-purple-100 hover:bg-purple-500/30 hover:text-white transition-colors">
                "What should I know about my cholesterol?"
            </button>
             <button className="w-full text-left rounded bg-purple-500/20 px-3 py-2 text-xs font-medium text-purple-100 hover:bg-purple-500/30 hover:text-white transition-colors">
                "Are there any medication interactions?"
            </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button className="w-full bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-sm" size="sm">
            <MessageCircle className="mr-2 h-4 w-4" /> Start AI Chat
        </Button>
        <Button variant="outline" className="w-full border-purple-400/30 bg-purple-800/20 text-white hover:bg-purple-800/40 hover:text-white" size="sm">
            <Mic className="mr-2 h-4 w-4" /> Launch Voice
        </Button>
      </div>
    </div>
  )
}
