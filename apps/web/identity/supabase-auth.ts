import { buildAccountsUrl } from "@/services/supabase";
import type { AuthService } from "./auth-service";
import type { AuthResult, IdentitySession, SignInParams, SignUpParams } from "./types";

const previewSession: IdentitySession = {
  user: {
    id: "preview-user",
    email: "agent@sigmashake.com",
    username: "sigmashake-agent",
    displayName: "SigmaShake Agent",
    avatarUrl: null,
  },
  status: "authenticated",
  accessToken: "preview-session",
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  providerToken: null,
};

function success(session = previewSession): AuthResult {
  return {session, error: null};
}

export async function createSupabaseAuthService(
  _supabaseUrl = "",
  _supabaseAnonKey = "",
): Promise<AuthService> {
  return createAccountsAuthService();
}

export function createAccountsAuthService(): AuthService {
  return {
    getSession: async () => previewSession,
    signIn: async (_params: SignInParams) => success(),
    signUp: async (_params: SignUpParams) => success(),
    signOut: async () => ({error: null}),
    refreshSession: async () => previewSession,
    signInWithOAuth: async () => {
      if (typeof window !== "undefined") {
        window.location.href = buildAccountsUrl("/oauth/authorize");
      }
    },
    getGitHubToken: async () => null,
    onAuthStateChange: (_callback: (session: IdentitySession) => void) => () => {},
  };
}
