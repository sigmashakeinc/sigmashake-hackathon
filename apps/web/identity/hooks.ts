"use client";

import { useSessionStore } from "./session-store";

export function useAuth() {
  const store = useSessionStore();

  return {
    user: store.session.user,
    session: store.session,
    isLoading: store.isLoading,
    isAuthenticated: store.session.status === "authenticated",
    error: store.error,
    signIn: store.signIn,
    signUp: store.signUp,
    signOut: store.signOut,
    refresh: store.refresh,
    signInWithOAuth: store.signInWithOAuth,
    getGitHubToken: store.getGitHubToken,
  };
}

export function useUser() {
  const { session, isLoading } = useSessionStore();
  return {
    user: session.user,
    isLoading,
    isAuthenticated: session.user !== null,
  };
}

export function useIsAuthenticated() {
  const { session, isLoading } = useSessionStore();
  return { isAuthenticated: session.status === "authenticated", isLoading };
}
