import type {
  AuthResult,
  IdentitySession,
  SignInParams,
  SignUpParams,
} from "./types";

/**
 * Abstract authentication service interface.
 * Future auth providers (Supabase, mock, etc.) implement this.
 */
export interface AuthService {
  /** Get the current session (restored from cookies/storage) */
  getSession: () => Promise<IdentitySession>;

  /** Sign in with username and password */
  signIn: (params: SignInParams) => Promise<AuthResult>;

  /** Sign up with invite code */
  signUp: (params: SignUpParams) => Promise<AuthResult>;

  /** Sign out the current user */
  signOut: () => Promise<{ error: AuthResult["error"] }>;

  /** Refresh the session token */
  refreshSession: () => Promise<IdentitySession>;

  /** Sign in with OAuth provider */
  signInWithOAuth: (provider: string) => Promise<void>;

  /** Get GitHub provider token from the current session */
  getGitHubToken: () => Promise<string | null>;

  /** Listen for auth state changes */
  onAuthStateChange: (
    callback: (session: IdentitySession) => void,
  ) => () => void;
}
