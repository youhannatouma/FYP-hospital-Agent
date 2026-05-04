import { IHttpClient } from "../index"
import { getClerkToken } from "@/lib/network/auth-token"
import { resolveApiBaseUrl } from "@/lib/network/runtime-config"

export interface ChatRequestDto {
  message: string
  context?: string
}

export interface ChatResponseDto {
  reply?: string
  message?: string
}

export interface IAiRepository {
  chat(data: ChatRequestDto): Promise<ChatResponseDto>
}

export class AiRepository implements IAiRepository {
  constructor(private httpClient: IHttpClient) {}

  async chat(data: ChatRequestDto): Promise<ChatResponseDto> {
    const threadRes = await this.httpClient.post<{ thread_id: string }>("/assistant/threads", {})
    const threadId = threadRes.data.thread_id
    const token = await getClerkToken({ waitForSession: true })
    if (!token) {
      return { message: "Not authenticated" }
    }

    const response = await fetch(`${resolveApiBaseUrl()}/assistant/threads/${threadId}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: data.message,
        mode: "chat",
        metadata: { ui_source: "legacy_ai_repository" },
      }),
    })

    if (!response.ok || !response.body) {
      return { message: `HTTP ${response.status}` }
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    let content = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split("\n\n")
      buffer = parts.pop() || ""
      for (const part of parts) {
        const line = part.trim()
        if (!line.startsWith("data: ")) continue
        try {
          const event = JSON.parse(line.slice(6))
          if (event.type === "delta" && event.content) {
            content += String(event.content)
          } else if (event.type === "complete" && event.message?.content) {
            content = String(event.message.content)
          } else if (event.type === "error" && event.message) {
            return { message: String(event.message) }
          }
        } catch {
          // ignore malformed lines
        }
      }
    }

    return { reply: content, message: content }
  }
}

let aiRepositoryInstance: IAiRepository | null = null;

export function getAiRepository(httpClient: IHttpClient): IAiRepository {
  if (!aiRepositoryInstance) {
    aiRepositoryInstance = new AiRepository(httpClient);
  }
  return aiRepositoryInstance;
}

export function setAiRepository(repository: IAiRepository): void {
  aiRepositoryInstance = repository;
}
