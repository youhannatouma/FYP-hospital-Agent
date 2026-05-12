import { Bot, Brain, MessageCircle, Mic, Activity } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { m } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const suggestedTasks = [
  "Analyze population health trends",
  "Check drug interaction safety",
  "Retrieve evidence-based protocols",
]

export function DoctorAIAvatar() {
  const { toast } = useToast()
  const router = useRouter()

  const openAssistant = (prompt?: string) => {
    if (prompt) {
      router.push(`/doctor/ai-assistant?prompt=${encodeURIComponent(prompt)}`)
      return
    }
    router.push("/doctor/ai-assistant")
  }
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="premium-card rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-900 text-white shadow-2xl overflow-hidden relative group p-6"
    >
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-glow">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-none text-white">Clinical AI Pilot</h3>
              <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mt-1.5">Diagnostic Intelligence</p>
            </div>
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-indigo-600 bg-indigo-500/50 backdrop-blur-sm" />
            ))}
          </div>
        </div>


        <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-5 mt-2 inner-glow">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-blue-200 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-indigo-100">Assistant Workspace</span>
          </div>
          <p className="text-xs text-indigo-50/70 leading-relaxed font-bold">
            Open the assistant for research, drafting, note summarization, and protocol questions using your live workspace context.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden relative border border-white/5">
                <m.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-300 rounded-full shadow-glow" 
                />
            </div>
            <span className="text-[10px] font-black text-white">Ready</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-200/50 px-1">
            <Activity className="h-3 w-3" />
            Clinical Reasoning
          </p>
          <div className="flex flex-col gap-2">
            {suggestedTasks.map((task, i) => (
              <m.button
                key={i}
                whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.1)" }}
                onClick={() => openAssistant(task)}
                className="rounded-xl bg-white/5 border border-white/5 px-4 py-2.5 text-left text-[11px] font-bold text-white/90 transition-all hover:text-white group-hover:border-white/10"
              >
                {task}
              </m.button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <Link href="/doctor/ai-assistant">
            <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 border-0 h-11 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95">
              <MessageCircle className="mr-2 h-4 w-4" />
              Open Assistant
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 h-11 rounded-2xl font-black text-[11px] uppercase tracking-widest backdrop-blur-md transition-all active:scale-95"
            onClick={() => {
              toast({
                title: "Voice Transcription",
                description: "Opening dictation workspace...",
              })
              openAssistant("Transcribe this clinical note and summarize key findings")
            }}
          >
            <Mic className="mr-2 h-4 w-4" />
            Dictate
          </Button>
        </div>
      </div>

      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
    </m.div>
  )
}
