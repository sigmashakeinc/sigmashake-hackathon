"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AuthCard,
  AuthHeader,
  AuthFooter,
  FormField,
  AuthPageShell,
} from "@/components/auth";
import { getSupabaseBrowserClient } from "@/services/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetError } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthPageShell>
        <AuthCard>
          <AuthHeader
            showLogo
            title="Check Your Email"
            subtitle="If an account exists with that email, we've sent password reset instructions."
          />
          <Link
            href="/login"
            className="bg-primary px-md py-md text-body-sm text-on-primary inline-flex w-full items-center justify-center rounded font-medium transition-colors hover:bg-[#c01826]"
          >
            Return to Sign In
          </Link>
        </AuthCard>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <AuthCard>
        <AuthHeader
          showLogo
          title="Reset Password"
          subtitle="Enter your email and we'll send you reset instructions."
        />

        <form
          onSubmit={handleSubmit}
          className="gap-lg flex flex-col"
          noValidate
        >
          <FormField
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="email"
            error={error ? error : undefined}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary px-md py-md text-body-sm text-on-primary inline-flex w-full items-center justify-center rounded font-medium transition-all hover:bg-[#c01826] disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="border-on-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <AuthFooter>
          <Link
            href="/login"
            className="text-body-sm text-primary transition-opacity hover:opacity-80"
          >
            Back to Sign In
          </Link>
        </AuthFooter>
      </AuthCard>
    </AuthPageShell>
  );
}
