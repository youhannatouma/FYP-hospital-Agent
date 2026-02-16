"use client"

import * as React from "react"
import { Send, Bot, Sparkles, Plus, Search, Brain, FileText, Pill, ShieldAlert, History, MessageSquare, ChevronRight, Mic, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const suggestedPrompts = [
  { icon: FileText, label: "Summarize Patient History", description: "Get a concise overview of medical history" },
  { icon: Pill, label: "Check Drug Interactions", description: "Verify safety between multiple medications" },
  { icon: Brain, label: "Differential Diagnosis", description: "Explore possibilities based on symptoms" },
  { icon: ShieldAlert, label: "Clinical Guidelines", description: "Check latest protocols for hypertension" },
]

export default function DoctorAIAssistant() {
  const { toast } = useToast()
  const [messages, setMessages] = React.useState([
    {
      role: "assistant",
      content: "Hello Dr. Smith. I'm your Clinical AI Assistant. How can I help you today? I can help with patient history summaries, diagnostic support, or checking drug-drug interactions.",
      time: "Now"
    }
  ])
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)

  const handleSend = () => {
    if (!input.trim()) return
    
    const userMsg = { role: "user", content: input, time: "Just now" }
    setMessages([...messages, userMsg])
    setInput("")
    setIsTyping(true)

    // Move to next turn simulation
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm analyzing the clinical data for you. Based on the symptoms described and the hospital's latest protocols, I recommend checking the laboratory results for any electrolyte imbalances. Would you like me to pull the latest reports for this patient?",
        time: "Just now"
      }])
    }, 1500)
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 overflow-hidden">
      {/* Left Side - Chat Area */}
      <div className="flex-1 flex flex-col bg-card border rounded-2xl shadow-sm overflow-hidden relative">
        <div className="p-4 border-b flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Clinical AI Co-Pilot</h2>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-medium">Enhanced for Cardiology</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-2 border-primary/20 hover:bg-primary/5 text-primary"
              onClick={() => toast({ title: "Advanced Mode", description: "Enabling multi-modal GPT-4o analysis..." })}
            >
              <Sparkles className="h-3.3 w-3.3" /> Advanced Mode
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => toast({ title: "Chat History", description: "Loading previous clinical consultations..." })}
            >
               <History className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8 shrink-0 mt-1 ring-2 ring-primary/10">
                  {msg.role === 'assistant' ? (
                    <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-muted"><AvatarImage src="https://github.com/shadcn.png" /></AvatarFallback>
                  )}
                </Avatar>
                <div className={`space-y-1 ${msg.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'assistant' 
                    ? 'bg-muted/50 border rounded-tl-none' 
                    : 'bg-primary text-primary-foreground rounded-tr-none'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-2">{msg.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-4">
                <Avatar className="h-8 w-8 shrink-0 bg-primary/10 text-primary flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </Avatar>
                <div className="bg-muted/50 border p-4 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="p-4 border-t bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Input 
                placeholder="Ask about patient data, protocols, or diagnostic aid..." 
                className="pr-24 h-12 rounded-xl border-2 focus-visible:ring-primary/20"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-9 w-9 text-muted-foreground"
                  onClick={() => toast({ title: "Voice Mode", description: "Clinical voice-to-text is initializing..." })}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-9 w-9 text-muted-foreground"
                  onClick={() => toast({ title: "Attachments", description: "Select lab results or medical images to analyze..." })}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button size="icon" className="h-9 w-9" onClick={handleSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-center text-muted-foreground">
              Clinical AI can provide decision support but should not replace professional medical judgment.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Tools & Suggestions */}
      <div className="w-80 flex flex-col gap-6">
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
             <Sparkles className="h-4 w-4 text-primary" /> Suggestions
          </h3>
          <div className="grid gap-2">
            {suggestedPrompts.map((p, i) => (
              <button 
                key={i} 
                className="flex flex-col text-left p-3 rounded-xl border bg-muted/5 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                onClick={() => setInput(p.label)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <p.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{p.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground group-hover:text-primary/70">{p.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4 flex-1">
          <h3 className="font-bold text-sm flex items-center gap-2">
             <Brain className="h-4 w-4 text-primary" /> Case Summary
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
              <p className="text-[10px] font-bold text-primary uppercase">Active Session</p>
              <h4 className="text-sm font-bold">Hypertension Protocol</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Analyzing recent BP spikes in patient Michael Johnson (P-1002). Correlating with Amlodipine dosage...
              </p>
            </div>
            
            <div className="space-y-2">
               <h5 className="text-[10px] font-bold uppercase text-muted-foreground">Recent Findings</h5>
               <ul className="space-y-2">
                 <li className="flex items-start gap-2 text-xs">
                   <ChevronRight className="h-3 w-3 mt-0.5 text-primary" />
                   <span>Potential ACE inhibitor interaction detected.</span>
                 </li>
                 <li className="flex items-start gap-2 text-xs">
                   <ChevronRight className="h-3 w-3 mt-0.5 text-primary" />
                   <span>Recommended TSH panel for diagnostic exclusion.</span>
                 </li>
               </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
