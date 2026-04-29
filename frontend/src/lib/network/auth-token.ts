type ClerkLike = {
  session?: {
    getToken: (opts?: Record<string, unknown>) => Promise<string | null>;
  };
};

export type ClerkTokenOptions = {
  forceRefresh?: boolean;
  waitForSession?: boolean;
};

const SESSION_WAIT_MS = 1200;
const SESSION_POLL_MS = 100;

function resolveTokenTemplate(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE?.trim();
  return raw ? raw : undefined;
}

export async function getClerkToken(options?: ClerkTokenOptions): Promise<string | null> {
  if (typeof globalThis.window === "undefined") return null;
  try {
    const shouldWait = options?.waitForSession !== false;
    const startedAt = Date.now();
    let clerkInstance = (globalThis as { Clerk?: ClerkLike }).Clerk;

    while (shouldWait && !clerkInstance?.session && Date.now() - startedAt < SESSION_WAIT_MS) {
      await new Promise((resolve) => setTimeout(resolve, SESSION_POLL_MS));
      clerkInstance = (globalThis as { Clerk?: ClerkLike }).Clerk;
    }

    if (clerkInstance?.session?.getToken) {
      const template = resolveTokenTemplate();
      const tokenOpts: Record<string, unknown> = {};
      if (template) tokenOpts.template = template;
      if (options?.forceRefresh) tokenOpts.skipCache = true;
      return await clerkInstance.session.getToken(tokenOpts);
    }
  } catch {
    // ignore
  }
  return null;
}
