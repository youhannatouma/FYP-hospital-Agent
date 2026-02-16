"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Bot, Brain, MessageCircle, Mic, Sparkles } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const suggestedTasks = [
  "Analyze population health trends",
  "Check drug interaction safety",
  "Retrieve evidence-based protocols",
]

export function DoctorAIAvatar() {
  const { toast } = useToast()
  return (
    <Card className="border-0 bg-gradient-to-br from-blue-700 via-indigo-700 to-primary text-white shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <Sparkles className="h-24 w-24" />
      </div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Clinical AI Co-Pilot</h3>
            <p className="text-xs text-white/70">Your Advanced Diagnostic Aid</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 mb-6 border border-white/10 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-blue-200" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">Clinic Optimization</span>
          </div>
          <p className="text-xs text-white/90 leading-relaxed mb-4">
            I've identified 3 high-risk hypertension reviews pending. Clinic throughput is up 5% today. Ready for next patient analysis.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold">
               <span>Review Progress</span>
               <span>85%</span>
            </div>
            <Progress value={85} className="h-1.5 bg-white/20 [&>div]:bg-emerald-400" />
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-white/80 uppercase tracking-tight">
            <Sparkles className="h-3.3 w-3.3" />
            Quick AI Tasks
          </p>
          <div className="flex flex-col gap-2">
            {suggestedTasks.map((task, i) => (
              <button
                key={i}
                onClick={() => toast({ title: "AI Task Started", description: `Initializing: ${task}...` })}
                className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-left text-xs text-white/90 transition-all hover:bg-white/15 hover:border-white/30 group w-full"
              >
                <span className="opacity-70 group-hover:opacity-100 transition-opacity">{task}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/doctor/ai-assistant">
            <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold border-0 h-11">
              <MessageCircle className="mr-2 h-4 w-4" />
              Open AI Assistant
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full text-white hover:bg-white/10 hover:text-white h-11 font-medium"
            onClick={() => {
              toast({
                title: "Voice Transcription",
                description: "Voice-to-clinical-note agent is listening...",
              })
            }}
          >
            <Mic className="mr-2 h-4 w-4" />
            Launch Voice Dictation
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
