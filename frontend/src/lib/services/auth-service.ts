/**
 * Auth Service Interface
 * Abstracts away authentication implementation details (Clerk, etc.)
 * Follows: Dependency Inversion Principle (DIP)
 */

import { getClerkToken } from "@/lib/network/auth-token";

type ClerkSessionLike = {
  getToken?: (opts?: Record<string, unknown>) => Promise<string | null>;
};

type ClerkLike = {
  session?: ClerkSessionLike;
  user?: { id?: string | null };
};

export interface IAuthService {
  getToken(options?: { forceRefresh?: boolean; waitForSession?: boolean }): Promise<string | null>;
  isSignedIn(): boolean;
  getCurrentUserId(): string | null;
}

export class ClerkAuthService implements IAuthService {
  constructor(private clerkInstance?: ClerkLike) {}

  async getToken(options?: { forceRefresh?: boolean; waitForSession?: boolean }): Promise<string | null> {
    try {
      if (this.clerkInstance?.session?.getToken) {
        const tokenOpts: Record<string, unknown> = {};
        if (options?.forceRefresh) tokenOpts.skipCache = true;
        return await this.clerkInstance.session.getToken(tokenOpts);
      }
      return await getClerkToken(options);
    } catch {
      return null;
    }
  }

  isSignedIn(): boolean {
    try {
      if (typeof globalThis.window === "undefined") return false;
      const clerk = this.clerkInstance || (globalThis as { Clerk?: ClerkLike }).Clerk;
      return !!clerk?.session;
    } catch {
      return false;
    }
  }

  getCurrentUserId(): string | null {
    try {
      if (typeof globalThis.window === "undefined") return null;
      const clerk = this.clerkInstance || (globalThis as { Clerk?: ClerkLike }).Clerk;
      return clerk?.user?.id || null;
    } catch {
      return null;
    }
  }
}

// Singleton instance for app-wide use
let authServiceInstance: IAuthService | null = null;

export function getAuthService(): IAuthService {
  if (!authServiceInstance) {
    authServiceInstance = new ClerkAuthService();
  }
  return authServiceInstance;
}

export function setAuthService(service: IAuthService): void {
  authServiceInstance = service;
}
