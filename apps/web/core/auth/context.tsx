"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Session } from "./session";
import type { User } from "@/core/user";

interface AuthContextValue {
  session: Session;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultSession: Session = {
  user: null,
  status: "unauthenticated",
  expiresAt: null,
};

const AuthContext = createContext<AuthContextValue>({
  session: defaultSession,
  isLoading: true,
  isAuthenticated: false,
  user: null,
  refresh: async () => {},
  signOut: async () => {},
});

export function AuthContextProvider({
  children,
  session,
  isLoading = true,
  onRefresh,
  onSignOut,
}: {
  children: ReactNode;
  session?: Session;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
}) {
  const value: AuthContextValue = {
    session: session ?? defaultSession,
    isLoading,
    isAuthenticated: session?.status === "authenticated",
    user: session?.user ?? null,
    refresh: onRefresh ?? (async () => {}),
    signOut: onSignOut ?? (async () => {}),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
