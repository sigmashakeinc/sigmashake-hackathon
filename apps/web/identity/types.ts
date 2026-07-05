export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface IdentityUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface IdentitySession {
  user: IdentityUser | null;
  status: AuthStatus;
  accessToken: string | null;
  expiresAt: string | null;
  providerToken: string | null;
}

export type SignInParams = {
  username: string;
  password: string;
  remember?: boolean;
};

export type SignUpParams = {
  inviteCode: string;
  displayName: string;
  username: string;
  password: string;
};

export type AuthError = {
  code: string;
  message: string;
};

export interface AuthResult {
  session: IdentitySession;
  error: AuthError | null;
}
