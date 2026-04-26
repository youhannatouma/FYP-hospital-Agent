/**
 * Auth Service Interface
 * Abstracts away authentication implementation details (Clerk, etc.)
 * Follows: Dependency Inversion Principle (DIP)
 */

export interface IAuthService {
  getToken(): Promise<string | null>;
  isSignedIn(): boolean;
  getCurrentUserId(): string | null;
}

export class ClerkAuthService implements IAuthService {
  constructor(private clerkInstance?: any) {}

  async getToken(): Promise<string | null> {
    try {
      if (typeof globalThis.window === "undefined") return null;
      const clerk = this.clerkInstance || (globalThis as any).Clerk;
      if (clerk?.session) {
        return await clerk.session.getToken();
      }
    } catch {
      return null;
    }
    return null;
  }

  isSignedIn(): boolean {
    try {
      if (typeof globalThis.window === "undefined") return false;
      const clerk = this.clerkInstance || (globalThis as any).Clerk;
      return !!clerk?.session;
    } catch {
      return false;
    }
  }

  getCurrentUserId(): string | null {
    try {
      if (typeof globalThis.window === "undefined") return null;
      const clerk = this.clerkInstance || (globalThis as any).Clerk;
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
