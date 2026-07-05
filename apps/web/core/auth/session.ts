import type { User } from "@/core/user";

export type SessionStatus = "authenticated" | "unauthenticated" | "loading";

export interface Session {
  user: User | null;
  status: SessionStatus;
  expiresAt: string | null;
}

export interface SessionManager {
  getSession: () => Promise<Session>;
  refreshSession: () => Promise<Session>;
  clearSession: () => Promise<void>;
}

export interface AuthProvider {
  type: string;
  isReady: boolean;
  session: SessionManager;
}
