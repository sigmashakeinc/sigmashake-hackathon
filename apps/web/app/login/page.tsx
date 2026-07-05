"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/identity";
import {
  AuthCard,
  AuthHeader,
  AuthFooter,
  FormField,
  AuthPageShell,
} from "@/components/auth";

function mapAuthError(_code: string, message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Invalid username or password. Please try again.";
  }
  if (
    message.includes("rate limit") ||
    message.includes("too many") ||
    _code === "429"
  ) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (message.includes("Email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  if (message.includes("Network") || message.includes("fetch")) {
    return "Unable to connect. Please check your internet connection.";
  }
  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const { signInWithOAuth, isAuthenticated, isLoading: authLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/app");
    }
  }, [authLoading, isAuthenticated, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    setIsLoading(true);

    try {
      await signInWithOAuth("sigmashake");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to start login.";
      setError(mapAuthError("accounts", message));
      setIsLoading(false);
    }
  }

  if (authLoading) {
    return (
      <AuthPageShell>
        <AuthCard>
          <div className="py-lg flex items-center justify-center">
            <div className="gap-sm flex items-center">
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
            </div>
          </div>
        </AuthCard>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <AuthCard>
        <AuthHeader
          showLogo
          title="Sign In"
          subtitle="Continue with SigmaShake Accounts to access the hackathon workspace."
        />

        <form
          onSubmit={handleSubmit}
          className="gap-lg flex flex-col"
          noValidate
        >
          <FormField
            label="Username or Email"
            type="text"
            placeholder="Managed by accounts.sigmashake.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled
            autoComplete="username"
          />

          <FormField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <label className="group gap-sm inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled
                className="border-outline-variant text-primary focus:ring-primary h-4 w-4 rounded-[2px] border bg-black focus:ring-1 focus:ring-offset-0 focus:outline-none"
              />
              <span className="text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                Remember me
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-body-sm text-primary transition-opacity hover:opacity-80"
            >
              Forgot password?
            </Link>
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
            {isLoading ? (
              <>
                <div className="border-on-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                Opening Accounts...
              </>
            ) : (
              "Continue with SigmaShake Accounts"
            )}
          </button>
        </form>

        <AuthFooter>
          <p className="text-body-sm text-on-surface-variant">
            No account?{" "}
            <Link
              href="/join"
              className="text-primary transition-opacity hover:opacity-80"
            >
              Join with invite
            </Link>
          </p>
        </AuthFooter>
      </AuthCard>
    </AuthPageShell>
  );
}
