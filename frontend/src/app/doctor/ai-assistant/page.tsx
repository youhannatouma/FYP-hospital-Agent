"use client"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Send, User, Sparkles, Stethoscope, FlaskConical, FileText, CalendarDays } from "lucide-react"
import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"

interface ChatMessage {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: string
}

const suggestedPrompts = [
  "Summarize latest lab results",
  "What are the latest treatment guidelines for hypertension?",
  "List patients with appointments today",
  "Draft a referral note",
]

const quickActions = [
  { label: "Patient Summary", icon: User },
  { label: "Lab Interpretation", icon: FlaskConical },
  { label: "Write Note", icon: FileText },
  { label: "Schedule",  icon: CalendarDays },
]

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hello! I'm your Clinical AI Assistant. I can help you with patient summaries, lab result interpretations, treatment guidelines, and clinical documentation. How can I assist you today?",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
]

export default function DoctorAIAssistantPage() {
  const { ai } = useHospital()
  const { getToken } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      const token = await getToken()
      const data = await ai.chat(content.trim(), 'doctor', token || undefined)
      
      const reply = data?.reply || data?.message || "I couldn't process that request."
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }])
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: "I'm having trouble connecting to the clinical AI right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clinical AI Assistant</h1>
        <p className="text-sm text-muted-foreground">Ask clinical questions, get patient summaries, and draft documentation</p>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Chat Area */}
        <div className="flex flex-1 flex-col min-w-0">
          <Card className="flex flex-1 flex-col border border-border bg-card shadow-sm overflow-hidden">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-auto p-4">
              <div className="flex flex-col gap-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className={message.role === "assistant" ? "bg-primary/10 text-primary" : "bg-primary text-primary-foreground"}>
                        {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-card-foreground"}`}>
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                      <p className={`mt-1 text-xs ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl bg-muted px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-primary hover:bg-primary/10 gap-1 text-xs"
                  onClick={() => sendMessage(`Help me with: ${action.label}`)}
                >
                  <action.icon className="h-3 w-3" />
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue) }}
                className="flex items-center gap-2"
              >
                <Input
                  placeholder="Ask a clinical question..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="hidden w-64 flex-col gap-4 lg:flex">
          <Card className="border border-border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-card-foreground">Suggested Prompts</h3>
              </div>
              <div className="flex flex-col gap-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-xs text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg p-2 transition-colors leading-relaxed"
                  >
                    {`"${prompt}"`}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
