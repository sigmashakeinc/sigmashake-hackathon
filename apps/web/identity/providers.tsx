"use client";

import { useState, useEffect, type ReactNode } from "react";
import { SessionStoreProvider } from "./session-store";
import type { AuthService } from "./auth-service";

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [authService, setAuthService] = useState<AuthService | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("./supabase-auth")
      .then((mod) => mod.createAccountsAuthService())
      .then((service) => {
        if (!cancelled) setAuthService(service);
      })
      .catch((err) => {
        console.error("[IdentityProvider] Auth init failed:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SessionStoreProvider authService={authService}>
      {children}
    </SessionStoreProvider>
  );
}
