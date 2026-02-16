"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Bot, Heart, MessageCircle, Mic } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const suggestedQuestions = [
  "What should I know about my cholesterol levels?",
  "Are there any medication interactions I should know?",
  "What lifestyle changes can improve my heart health?",
]

export function AIHealthAvatar() {
  const { toast } = useToast()
  return (
    <Card className="border-0 bg-gradient-to-b from-indigo-600 to-violet-700 text-white shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Health Avatar</h3>
            <p className="text-xs text-white/70">Your Personal Health Guide</p>
          </div>
        </div>

        <div className="rounded-lg bg-white/10 p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-rose-300" />
            <span className="text-sm font-medium text-white">Health Status Summary</span>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            Your overall health is looking good! Blood pressure is well-controlled with current medication. Continue monitoring cholesterol levels.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Progress value={82} className="h-2 flex-1 bg-white/20 [&>div]:bg-emerald-400" />
            <span className="text-xs font-medium text-white">82%</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-2 flex items-center gap-1 text-xs font-medium text-white/80">
            <MessageCircle className="h-3 w-3" />
            Suggested Questions
          </p>
          <div className="flex flex-col gap-2">
            {suggestedQuestions.map((q, i) => (
              <Link key={i} href="/patient/ai-assistant">
                <button
                  className="rounded-lg bg-white/10 px-3 py-2 text-left text-xs text-white/90 transition-colors hover:bg-white/20 w-full"
                >
                  {`"${q}"`}
                </button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/patient/ai-assistant">
            <Button className="w-full bg-amber-500 text-white hover:bg-amber-600 border-0">
              <MessageCircle className="mr-2 h-4 w-4" />
              Start AI Chat
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={() => {
              toast({
                title: "Voice Avatar",
                description: "Voice-powered AI is being activated...",
              })
            }}
          >
            <Mic className="mr-2 h-4 w-4" />
            Launch Voice Avatar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
