"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { AuthService } from "./auth-service";
import type {
  AuthResult,
  IdentitySession,
  SignInParams,
  SignUpParams,
} from "./types";

interface SessionStoreValue {
  session: IdentitySession;
  isLoading: boolean;
  error: string | null;
  signIn: (params: SignInParams) => Promise<AuthResult>;
  signUp: (params: SignUpParams) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  signInWithOAuth: (provider: string) => Promise<void>;
  getGitHubToken: () => Promise<string | null>;
}

const EMPTY_SESSION: IdentitySession = {
  user: null,
  status: "unauthenticated",
  accessToken: null,
  expiresAt: null,
  providerToken: null,
};

const EMPTY_RESULT: AuthResult = {
  session: EMPTY_SESSION,
  error: { code: "", message: "Not initialized" },
};

const SessionStoreContext = createContext<SessionStoreValue>({
  session: EMPTY_SESSION,
  isLoading: true,
  error: null,
  signIn: () => Promise.resolve(EMPTY_RESULT),
  signUp: () => Promise.resolve(EMPTY_RESULT),
  signOut: () => Promise.resolve(),
  refresh: () => Promise.resolve(),
  signInWithOAuth: () => Promise.resolve(),
  getGitHubToken: () => Promise.resolve(null),
});

export function SessionStoreProvider({
  children,
  authService,
}: {
  children: ReactNode;
  authService: AuthService | null;
}) {
  const [session, setSession] = useState<IdentitySession>(EMPTY_SESSION);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService) {
      return;
    }

    let cancelled = false;

    authService.getSession().then((s) => {
      if (!cancelled) {
        setSession(s);
        setIsReady(true);
      }
    });

    const unsubscribe = authService.onAuthStateChange((s) => {
      if (!cancelled) {
        setSession(s);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [authService]);

  const signIn = useCallback(
    async (params: SignInParams) => {
      if (!authService) return EMPTY_RESULT;
      setError(null);
      const result = await authService.signIn(params);
      if (!result.error) {
        setSession(result.session);
      } else {
        setError(result.error.message);
      }
      return result;
    },
    [authService],
  );

  const signUp = useCallback(
    async (params: SignUpParams) => {
      if (!authService) return EMPTY_RESULT;
      setError(null);
      const result = await authService.signUp(params);
      if (!result.error) {
        setSession(result.session);
      } else {
        setError(result.error.message);
      }
      return result;
    },
    [authService],
  );

  const signOut = useCallback(async () => {
    if (!authService) return;
    setError(null);
    await authService.signOut();
    setSession(EMPTY_SESSION);
  }, [authService]);

  const refresh = useCallback(async () => {
    if (!authService) return;
    const s = await authService.refreshSession();
    setSession(s);
  }, [authService]);

  const signInWithOAuth = useCallback(async (provider: string) => {
    if (!authService) return;
    await authService.signInWithOAuth(provider);
  }, [authService]);

  const getGitHubToken = useCallback(() => {
    if (!authService) return Promise.resolve(null);
    return authService.getGitHubToken();
  }, [authService]);

  return (
    <SessionStoreContext.Provider
      value={{
        session,
        isLoading: !isReady,
        error,
        signIn,
        signUp,
        signOut,
        refresh,
        signInWithOAuth,
        getGitHubToken,
      }}
    >
      {children}
    </SessionStoreContext.Provider>
  );
}

export function useSessionStore() {
  return useContext(SessionStoreContext);
}
