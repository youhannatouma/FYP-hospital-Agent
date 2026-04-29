const DEFAULT_API_BASE_URL = "http://localhost:8000/api";

function _normalizeBaseUrl(value: string): string {
  const trimmed = (value || "").trim();
  let normalized = trimmed.replace(/\/+$/, "");
  // Keep local dev host consistent to avoid mixed localhost/127.0.0.1 surprises.
  normalized = normalized.replace("http://127.0.0.1:", "http://localhost:");
  normalized = normalized.replace("https://127.0.0.1:", "https://localhost:");
  return normalized;
}

export function resolveApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
  const normalized = _normalizeBaseUrl(raw);
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    console.warn("[API Config Warning] Invalid NEXT_PUBLIC_API_URL; falling back to default.", {
      provided: raw,
      fallback: DEFAULT_API_BASE_URL,
    });
    return DEFAULT_API_BASE_URL;
  }
  return normalized;
}

export function warnIfSuspiciousApiBaseUrl(baseURL: string): void {
  if (typeof globalThis.window === "undefined") return;
  try {
    const api = new URL(baseURL);
    const page = new URL(globalThis.window.location.href);
    const localHosts = new Set(["localhost", "127.0.0.1"]);
    if (localHosts.has(page.hostname) && !localHosts.has(api.hostname)) {
      console.warn("[API Config Warning] Frontend is local but API host is not local.", {
        pageHost: page.hostname,
        apiHost: api.hostname,
        baseURL,
      });
    }
    if (localHosts.has(page.hostname) && localHosts.has(api.hostname) && page.port !== api.port) {
      console.warn("[API Config Warning] Frontend and API use different local ports.", {
        pageOrigin: page.origin,
        apiOrigin: api.origin,
        baseURL,
      });
    }
  } catch {
    console.warn("[API Config Warning] Could not parse API base URL.", { baseURL });
  }
}
