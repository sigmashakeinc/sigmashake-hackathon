export type { AuthService } from "./auth-service";
export type {
  AuthResult,
  AuthStatus,
  AuthError,
  IdentitySession,
  IdentityUser,
  SignInParams,
  SignUpParams,
} from "./types";

export { createSupabaseAuthService } from "./supabase-auth";
export { SessionStoreProvider, useSessionStore } from "./session-store";
export { useAuth, useUser, useIsAuthenticated } from "./hooks";
export { IdentityProvider } from "./providers";
export { ProtectedRoute, GuestRoute } from "./guard";
