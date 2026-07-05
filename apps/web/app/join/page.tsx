"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createInvitationService } from "@/core/invitation";
import { useAuth } from "@/identity";
import {
  AuthCard,
  AuthHeader,
  AuthFooter,
  FormField,
  AuthPageShell,
} from "@/components/auth";

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, signInWithOAuth, session } = useAuth();
  const validatedRef = useRef(false);

  const [inviteCode, setInviteCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [gitHubConnected, setGitHubConnected] = useState("");
  const [oauthRestored, setOauthRestored] = useState(false);

  // Restore form state from sessionStorage after OAuth redirect
  useEffect(() => {
    if (oauthRestored) return;
    const saved = sessionStorage.getItem("join_form");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setInviteCode(data.inviteCode ?? "");
        setDisplayName(data.displayName ?? "");
        setUsername(data.username ?? "");
        setEmail(data.email ?? "");
        setPassword(data.password ?? "");
        setConfirmPassword(data.confirmPassword ?? "");
        setGitHubConnected(data.gitHubConnected ?? "");
      } catch { /* ignore */ }
      sessionStorage.removeItem("join_form");
    }
    setOauthRestored(true);
  }, [oauthRestored]);

  // Check if returning from GitHub OAuth
  useEffect(() => {
    if (session.providerToken && !gitHubConnected) {
      setGitHubConnected(session.user?.username ?? "Connected");
    }
  }, [session.providerToken, gitHubConnected]);

  useEffect(() => {
    if (validatedRef.current) return;
    const token = searchParams.get("token");
    if (!token) return;
    validatedRef.current = true;
    setInviteCode(token);
    setIsValidating(true);
    setError("");

    createInvitationService()
      .validate(token)
      .then((result) => {
        if (result.valid) {
          setInviteValid(true);
        } else {
          setInviteValid(false);
          setError(result.error ?? "Invalid invitation.");
        }
      })
      .catch(() => {
        setInviteValid(false);
        setError("Unable to verify invitation.");
      })
      .finally(() => setIsValidating(false));
  }, []);

  async function handleGitHubConnect() {
    sessionStorage.setItem("join_form", JSON.stringify({
      inviteCode, displayName, username, email, password, confirmPassword, gitHubConnected,
    }));
    await signInWithOAuth("github");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!inviteCode.trim()) {
      setError("Please enter your invite code.");
      return;
    }
    if (!displayName.trim()) {
      setError("Please enter your display name.");
      return;
    }
    if (!username.trim()) {
      setError("Please choose a username.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    const result = await signUp({
      inviteCode: inviteCode.trim(),
      displayName: displayName.trim(),
      username: username.trim().toLowerCase(),
      password,
    });

    if (result.error) {
      setError(result.error.message);
      setIsLoading(false);
      return;
    }

    router.replace("/app");
  }

  return (
    <AuthPageShell>
      <AuthCard>
        <AuthHeader
          showLogo
          title="Join Team"
          subtitle="Complete your account to join the hackathon workspace."
        />

        {isValidating && (
          <div className="py-lg flex items-center justify-center">
            <div className="gap-sm flex items-center">
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {inviteValid === false && !isValidating && (
          <div className="gap-sm py-lg flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-error text-[32px]">
              gpp_bad
            </span>
            <p className="text-body-sm text-error">
              {error || "Invalid or expired invitation."}
            </p>
            <Link
              href="/"
              className="text-body-sm text-primary transition-opacity hover:opacity-80"
            >
              Return home
            </Link>
          </div>
        )}

        {inviteValid !== false && !isValidating && (
          <form
            onSubmit={handleSubmit}
            className="gap-lg flex flex-col"
            noValidate
          >
            <FormField
              label="Invite Code"
              type="text"
              placeholder="XXXX-XXXX-XXXX"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              disabled={isLoading || !!searchParams.get("token")}
              required
              helperText="Enter the code from your invitation."
            />

            <FormField
              label="Display Name"
              type="text"
              placeholder="Your full name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
              required
            />

            <div className="gap-lg grid grid-cols-1 sm:grid-cols-2">
              <FormField
                label="Username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
              <FormField
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <FormField
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="new-password"
            />

            <FormField
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="new-password"
            />

            {/* GitHub OAuth */}
            <div className="flex items-center justify-between rounded border border-outline-variant/20 bg-surface-container-lowest p-sm">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">code</span>
                <div>
                  <p className="text-body-sm text-on-surface">GitHub</p>
                  <p className="font-mono text-[9px] text-on-surface-variant">
                    {gitHubConnected ? `Connected as ${gitHubConnected}` : "Not connected (optional)"}
                  </p>
                </div>
              </div>
              {gitHubConnected ? (
                <span className="flex items-center gap-xs font-mono text-[9px] text-[#3fb950]">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Connected
                </span>
              ) : (
                <button type="button" onClick={handleGitHubConnect} disabled={isLoading}
                  className="rounded bg-surface-container-high px-sm py-xs text-body-xs text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-50">
                  Connect GitHub
                </button>
              )}
            </div>

            {error && (
              <p
                role="alert"
                className="border-error-container/30 bg-error-container/5 px-sm py-xs text-error rounded border font-mono text-[10px]"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary px-md py-md text-body-sm text-on-primary inline-flex w-full items-center justify-center rounded font-medium transition-all hover:bg-[#c01826] disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? "Joining..." : "Join Team"}
            </button>
          </form>
        )}

        <AuthFooter>
          <p className="text-body-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary transition-opacity hover:opacity-80"
            >
              Sign In
            </Link>
          </p>
        </AuthFooter>
      </AuthCard>
    </AuthPageShell>
  );
}
