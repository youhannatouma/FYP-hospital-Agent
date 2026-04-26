"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getServiceContainer } from "@/lib/services/service-container"
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Stethoscope,
  Pill,
  CalendarPlus,
  Search,
  Sparkles,
  User,
  Clock,
} from "lucide-react"

interface ChatMessage {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: string
}

const suggestedQuestions = [
  "What should I know about my cholesterol levels?",
  "Are there any medication interactions I should know?",
  "What lifestyle changes can improve my heart health?",
  "When is my next appointment?",
]

const quickActions = [
  { label: "Find Doctor", icon: Stethoscope },
  { label: "Check Symptoms", icon: Search },
  { label: "Medication Info", icon: Pill },
  { label: "Book Appointment", icon: CalendarPlus },
]

const recentConversations = [
  { id: 1, title: "Cholesterol Management Tips", date: "Jan 14, 2024" },
  { id: 2, title: "Medication Side Effects", date: "Jan 10, 2024" },
  { id: 3, title: "Exercise Recommendations", date: "Jan 5, 2024" },
  { id: 4, title: "Diet and Nutrition", date: "Dec 28, 2023" },
]

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hello Sarah! I'm your AI Health Assistant. I have access to your medical history and can help you with questions about your health, medications, appointments, and more. How can I assist you today?",
    timestamp: "10:00 AM",
  },
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      const container = getServiceContainer();
      const response = await container.ai.chat({ message: content });
      const aiMessage: ChatMessage = {
        id: messages.length + 2,
        role: "assistant",
        content: response.reply || response.message || "I couldn't process that request.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false)
    } catch (error) {
      console.warn('[AI Assistant] API failed, using local simulation');
      // Simulate AI response — setIsTyping(false) must run AFTER the timeout resolves
      setTimeout(() => {
        const aiResponses: Record<string, string> = {
          cholesterol:
            "Based on your recent lipid panel from January 8th, your total cholesterol is 245 mg/dL and LDL is 165 mg/dL. Both are above recommended levels. Your doctor has suggested dietary changes alongside your Atorvastatin medication. I'd recommend:\n\n1. Reducing saturated fat intake\n2. Increasing fiber-rich foods\n3. Regular exercise (30 min, 3-5 times/week)\n4. Omega-3 rich foods like salmon and walnuts\n\nWould you like more specific dietary recommendations?",
          medication:
            "You're currently taking 3 medications:\n\n1. **Lisinopril 10mg** - For hypertension, once daily\n2. **Atorvastatin 20mg** - For cholesterol, once daily\n3. **Aspirin 81mg** - For cardiovascular protection, once daily\n\nNo known interactions between these medications. However, avoid grapefruit with Atorvastatin as it can increase side effects. Your Lisinopril has 2 refills remaining.",
          appointment:
            "Your next appointment is:\n\n**Cardiology Follow-up**\nDr. Michael Chen\nJanuary 25, 2024 at 10:00 AM\nType: Video Consultation\n\nYou also have an Annual Physical with Dr. Emily Watson on February 15, 2024 at 2:30 PM. Would you like to schedule any additional appointments?",
        }

        let responseText = "I understand your concern. Based on your medical history, I'd recommend discussing this with your healthcare provider at your next appointment on January 25th. Is there anything specific you'd like me to help you prepare for that visit?"

        const lowerContent = content.toLowerCase()
        if (lowerContent.includes("cholesterol") || lowerContent.includes("lipid")) {
          responseText = aiResponses.cholesterol
        } else if (lowerContent.includes("medication") || lowerContent.includes("medicine") || lowerContent.includes("drug") || lowerContent.includes("interaction")) {
          responseText = aiResponses.medication
        } else if (lowerContent.includes("appointment") || lowerContent.includes("next") || lowerContent.includes("schedule")) {
          responseText = aiResponses.appointment
        }

        const aiMessage: ChatMessage = {
          id: messages.length + 2,
          role: "assistant",
          content: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }

        setMessages((prev) => [...prev, aiMessage])
        setIsTyping(false)
      }, 1500)
    }
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Health Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about your health, medications, and more
        </p>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Chat Area */}
        <div className="flex flex-1 flex-col min-w-0">
          <Card className="flex flex-1 flex-col border border-border bg-card shadow-sm overflow-hidden">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-auto p-4">
              <div className="flex flex-col gap-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className={
                          message.role === "assistant"
                            ? "bg-primary/10 text-primary"
                            : "bg-primary text-primary-foreground"
                        }
                      >
                        {message.role === "assistant" ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-card-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {message.content}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          message.role === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
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
                  onClick={() => sendMessage(`I need help with: ${action.label}`)}
                >
                  <action.icon className="h-3 w-3" />
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendMessage(inputValue)
                }}
                className="flex items-center gap-2"
              >
                <Input
                  placeholder="Type your health question..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={`shrink-0 ${
                    isListening
                      ? "border-destructive text-destructive bg-destructive/10"
                      : "border-border text-foreground"
                  }`}
                  onClick={() => setIsListening(!isListening)}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
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
        <div className="hidden w-72 flex-col gap-4 lg:flex">
          {/* Suggested Questions */}
          <Card className="border border-border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-card-foreground">
                  Suggested Questions
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(question)}
                    className="text-left text-xs text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg p-2 transition-colors leading-relaxed"
                  >
                    {`"${question}"`}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Conversations */}
          <Card className="border border-border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm text-card-foreground">
                  Recent Conversations
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {recentConversations.map((conv) => (
                  <button
                    key={conv.id}
                    className="flex flex-col text-left rounded-lg p-2 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-xs font-medium text-card-foreground">
                      {conv.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {conv.date}
                    </span>
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
