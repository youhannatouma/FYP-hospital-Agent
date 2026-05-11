import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

function normalizeBackendBase(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function getBackendCandidates(): string[] {
  const configured = process.env.BACKEND_URL;
  if (configured && configured.trim()) {
    return [normalizeBackendBase(configured)];
  }
  return [
    "http://127.0.0.1:8000/api",
    "http://localhost:8000/api",
    "http://backend:8000/api",
    "http://host.docker.internal:8000/api",
  ];
}

async function fetchBackend(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const candidates = getBackendCandidates();
  let lastError: unknown = null;

  for (const base of candidates) {
    try {
      return await fetch(`${base}${path}`, init);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Backend connection failed");
}

async function resolveBearerToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  try {
    const { getToken } = await auth();
    const template = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE?.trim();
    if (template) {
      const templated = await getToken({ template });
      if (templated) return templated;
    }
    return await getToken();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const token = await resolveBearerToken(request);
    const { searchParams } = new URL(request.url);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Proxy to FastAPI backend
    const res = await fetchBackend(`/users/?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const raw = await res.text();
    let data: unknown = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { detail: raw };
      }
    }
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[users GET] Error:", error);
    return NextResponse.json(
      { error: "Backend unavailable. Please try again in a moment." },
      { status: 502 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const token = await resolveBearerToken(request);
    const body = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Proxy to FastAPI backend - update current user
    const res = await fetchBackend("/users/me", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    let data: unknown = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { detail: raw };
      }
    }
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[users PATCH] Error:", error);
    return NextResponse.json(
      { error: "Backend unavailable. Please try again in a moment." },
      { status: 502 },
    );
  }
}
