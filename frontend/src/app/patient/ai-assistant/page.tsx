"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Bot,
  CalendarPlus,
  Clock,
  Loader2,
  Mic,
  MicOff,
  Pill,
  Plus,
  Search,
  Send,
  Sparkles,
  Square,
  Stethoscope,
  User,
} from "lucide-react"
import {
  cancelStream,
  createThread,
  fetchMessages,
  listThreads,
  streamAssistantReply,
  Thread,
  ThreadMessage,
} from "@/lib/api-client"

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
  { label: "Book Visit", icon: CalendarPlus },
]

export default function PatientAIAssistantPage() {
  const searchParams = useSearchParams()
  const [threads, setThreads] = useState<Thread[]>([])
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoadingThreads, setIsLoadingThreads] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [streamingText, setStreamingText] = useState("")

  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const didRunInitialPrompt = useRef(false)
  const sendMessageRef = useRef<(rawContent: string) => Promise<void>>(async () => {})

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streamingText, isStreaming])

  const loadThreads = useCallback(async () => {
    setIsLoadingThreads(true)
    try {
      const data = await listThreads(20)
      setThreads(data.threads)
    } catch (error) {
      console.error("Failed to load threads", error)
    } finally {
      setIsLoadingThreads(false)
    }
  }, [])

  useEffect(() => {
    loadThreads()
  }, [loadThreads])

  const loadThreadMessages = useCallback(async (threadId: string) => {
    setIsLoadingMessages(true)
    try {
      const data = await fetchMessages(threadId)
      setMessages(data.messages)
    } catch (error) {
      console.error("Failed to load messages", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  const handleSelectThread = async (threadId: string) => {
    setCurrentThreadId(threadId)
    setMessages([])
    setStreamingText("")
    await loadThreadMessages(threadId)
  }

  const handleNewThread = async () => {
    try {
      const thread = await createThread()
      setThreads((prev) => [thread, ...prev])
      setCurrentThreadId(thread.thread_id)
      setMessages([])
      setStreamingText("")
    } catch (error) {
      console.error("Failed to create thread", error)
    }
  }

  const sendMessage = async (rawContent: string) => {
    const content = rawContent.trim()
    if (!content) return

    let threadId = currentThreadId
    if (!threadId) {
      try {
        const thread = await createThread()
        threadId = thread.thread_id
        setThreads((prev) => [thread, ...prev])
        setCurrentThreadId(threadId)
      } catch (error) {
        console.error("Failed to create thread", error)
        return
      }
    }

    const userMessage: ThreadMessage = {
      message_id: `user-${Date.now()}`,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsStreaming(true)
    setStreamingText("")

    abortRef.current = new AbortController()

    try {
      await streamAssistantReply(
        threadId,
        content,
        {
          onDelta: (delta) => {
            setStreamingText((prev) => prev + delta)
          },
          onComplete: (msg) => {
            setMessages((prev) => [
              ...prev,
              {
                message_id: msg.id,
                role: "assistant",
                content: msg.content,
                created_at: msg.created_at,
                metadata: msg.metadata,
              },
            ])
            setStreamingText("")
            setIsStreaming(false)
            loadThreads()
          },
          onCancelled: () => {
            if (streamingText) {
              setMessages((prev) => [
                ...prev,
                {
                  message_id: `cancelled-${Date.now()}`,
                  role: "assistant",
                  content: `${streamingText}\n\n[Cancelled]`,
                  created_at: new Date().toISOString(),
                },
              ])
            }
            setStreamingText("")
            setIsStreaming(false)
          },
          onError: (errorMessage) => {
            setMessages((prev) => [
              ...prev,
              {
                message_id: `error-${Date.now()}`,
                role: "assistant",
                content: `Error: ${errorMessage}`,
                created_at: new Date().toISOString(),
              },
            ])
            setStreamingText("")
            setIsStreaming(false)
          },
        },
        abortRef.current.signal,
        {
          mode: "chat",
          metadata: { ui_source: "patient_ai_assistant" },
        },
      )
    } catch (error) {
      console.error("Stream error", error)
      setIsStreaming(false)
      setStreamingText("")
    }
  }

  sendMessageRef.current = sendMessage

  useEffect(() => {
    const prompt = searchParams.get("prompt")?.trim()
    if (!prompt || didRunInitialPrompt.current) return
    didRunInitialPrompt.current = true
    void sendMessageRef.current(prompt)
  }, [searchParams])

  const handleCancel = async () => {
    if (currentThreadId) {
      try {
        await cancelStream(currentThreadId)
      } catch (error) {
        console.error("Cancel failed", error)
      }
    }
    abortRef.current?.abort()
    setIsStreaming(false)
  }

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return ""
    }
  }

  const displayMessages = useMemo(() => messages, [messages])
  const hasStreamingBubble = isStreaming && Boolean(streamingText)

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Health Assistant</h1>
          <p className="text-sm text-muted-foreground">Ask questions about your health, medications, and care.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleNewThread}>
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <Card className="flex flex-1 flex-col overflow-hidden border border-border bg-card shadow-sm">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-4">
                {isLoadingMessages && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!isLoadingMessages && displayMessages.length === 0 && !isStreaming && (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Bot className="h-10 w-10 opacity-30" />
                    <p className="text-sm">Start a new conversation or choose one from your recent threads.</p>
                  </div>
                )}

                {displayMessages.map((message) => (
                  <div key={message.message_id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                    {message.role !== "user" && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-card-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                      <p className={`mt-1 text-xs ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {hasStreamingBubble && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[75%] rounded-2xl bg-muted px-4 py-3 text-card-foreground">
                      <p className="whitespace-pre-line text-sm leading-relaxed">{streamingText}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="gap-1 border-primary/30 text-xs text-primary hover:bg-primary/10"
                  onClick={() => sendMessage(`I need help with: ${action.label}`)}
                  disabled={isStreaming}
                >
                  <action.icon className="h-3 w-3" />
                  {action.label}
                </Button>
              ))}
            </div>

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
                  disabled={isStreaming}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setIsListening((prev) => !prev)}
                  disabled={isStreaming}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                {isStreaming ? (
                  <Button type="button" variant="destructive" size="icon" className="shrink-0" onClick={handleCancel}>
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90" disabled={!inputValue.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </form>
            </div>
          </Card>
        </div>

        <div className="hidden w-72 flex-col gap-4 lg:flex">
          <Card className="border border-border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-card-foreground">Suggested Questions</h3>
              </div>
              <div className="flex flex-col gap-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                    className="rounded-lg p-2 text-left text-xs leading-relaxed text-primary transition-colors hover:bg-primary/5 hover:text-primary/80"
                  >
                    {`\"${question}\"`}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-card-foreground">Recent Conversations</h3>
              </div>
              <div className="flex flex-col gap-2">
                {isLoadingThreads && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {threads.map((thread) => (
                  <button
                    key={thread.thread_id}
                    onClick={() => handleSelectThread(thread.thread_id)}
                    className={`flex flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/50 ${
                      currentThreadId === thread.thread_id ? "bg-muted" : ""
                    }`}
                  >
                    <span className="truncate text-sm font-medium text-card-foreground">{thread.title || "New Conversation"}</span>
                    <span className="text-xs text-muted-foreground">
                      {thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : "No messages yet"}
                    </span>
                  </button>
                ))}
                {threads.length === 0 && !isLoadingThreads && <p className="text-xs text-muted-foreground">No conversations yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
