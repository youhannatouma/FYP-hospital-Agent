import axios, { AxiosError } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * API Client instance
 * Configured with base URL, auth interceptor, and common headers.
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


type ClerkLike = {
  session?: {
    getToken: () => Promise<string | null>;
  };
};

async function _getClerkToken(): Promise<string | null> {
  if (typeof globalThis.window === 'undefined') return null;
  try {
    const clerkInstance = (globalThis as { Clerk?: ClerkLike }).Clerk;
    if (clerkInstance?.session) {
      return await clerkInstance.session.getToken();
    }
  } catch {
    // ignore
  }
  return null;
}


// Request interceptor: automatically attach Clerk token if available
apiClient.interceptors.request.use(
  async (config) => {
    const token = await _getClerkToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    let message = 'An unexpected error occurred';
    let status: number | undefined;
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string; detail?: string }>;
      status = axiosError.response?.status;
      message = axiosError.response?.data?.message || axiosError.response?.data?.detail || message;
    }
    // 401 is expected while auth is initializing or a session is refreshed.
    if (status !== 401) {
      console.error('[API Error]', message);
    }
    return Promise.reject(error);
  }
);


// ── Thread helpers (REST) ──────────────────────────────────────────────

export interface Thread {
  thread_id: string;
  title: string | null;
  created_at: string;
  last_message_at: string | null;
  message_count?: number;
}

export interface ThreadMessage {
  message_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

export async function createThread(title?: string): Promise<Thread> {
  const res = await apiClient.post('/assistant/threads', { title });
  return res.data;
}

export async function listThreads(limit = 20, before?: string): Promise<{ threads: Thread[]; next_cursor: string | null }> {
  const params = new URLSearchParams();
  params.append('limit', String(limit));
  if (before) params.append('before', before);
  const res = await apiClient.get(`/assistant/threads?${params.toString()}`);
  return res.data;
}

export async function fetchMessages(threadId: string, limit = 60, before?: string): Promise<{ messages: ThreadMessage[]; next_cursor: string | null }> {
  const params = new URLSearchParams();
  params.append('limit', String(limit));
  if (before) params.append('before', before);
  const res = await apiClient.get(`/assistant/threads/${threadId}/messages?${params.toString()}`);
  return res.data;
}

export async function cancelStream(threadId: string): Promise<{ message: string }> {
  const res = await apiClient.post(`/assistant/threads/${threadId}/cancel`);
  return res.data;
}


// ── SSE streaming (fetch-based) ────────────────────────────────────────

export interface StreamHandlers {
  onDelta: (content: string) => void;
  onComplete: (message: { id: string; content: string; created_at: string; metadata?: Record<string, unknown> | null }) => void;
  onCancelled: () => void;
  onError: (message: string) => void;
}

export async function streamAssistantReply(
  threadId: string,
  message: string,
  handlers: StreamHandlers,
  signal?: AbortSignal,
  options?: { clientMessageId?: string; mode?: string; metadata?: Record<string, unknown> },
): Promise<void> {
  const token = await _getClerkToken();
  if (!token) {
    handlers.onError('Not authenticated');
    return;
  }

  const body = JSON.stringify({
    message,
    client_message_id: options?.clientMessageId ?? undefined,
    mode: options?.mode ?? 'chat',
    metadata: options?.metadata ?? undefined,
  });

  const res = await fetch(`${BASE_URL}/assistant/threads/${threadId}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body,
    signal,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      detail = data.detail || data.message || detail;
    } catch {
      // ignore parse error
    }
    handlers.onError(detail);
    return;
  }

  if (!res.body) {
    handlers.onError('No response body');
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) break;
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6);
        try {
          const event = JSON.parse(payload);
          if (event.type === 'delta' && event.content) {
            handlers.onDelta(event.content);
          } else if (event.type === 'complete' && event.message) {
            handlers.onComplete(event.message);
          } else if (event.type === 'cancelled') {
            handlers.onCancelled();
          } else if (event.type === 'error') {
            handlers.onError(event.message || 'Streaming error');
          }
        } catch {
          // ignore malformed JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}


// Named export so both `import apiClient` and `import { apiClient }` work
export { apiClient };
export default apiClient; 
