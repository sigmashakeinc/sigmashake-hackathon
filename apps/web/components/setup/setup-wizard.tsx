"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AuthCard, AuthHeader, AuthPageShell,
} from "@/components/auth";
import { Input, Button } from "@/components/ui";
import { type PlatformSetupInput, type OwnerSetupInput, type SetupStep } from "@/core/setup";
import { config } from "@/services/config";
import { getSupabaseBrowserClient } from "@/services/supabase";

const INITIAL_PLATFORM: PlatformSetupInput = {
  platformName: "SSG-Hackathon",
  description: "",
  timezone: "UTC",
  defaultLocale: "en-US",
};

const INITIAL_OWNER: OwnerSetupInput = {
  displayName: "",
  username: "",
  email: "",
  password: "",
};

export function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>("welcome");
  const [setupKey, setSetupKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [platform, setPlatform] = useState<PlatformSetupInput>(INITIAL_PLATFORM);
  const [owner, setOwner] = useState<OwnerSetupInput>(INITIAL_OWNER);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gitHubConnected, setGitHubConnected] = useState("");
  const [error, setError] = useState("");
  const [initialising, setInitialising] = useState(false);

  // Restore form state after OAuth redirect
  useEffect(() => {
    const saved = sessionStorage.getItem("setup_form");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.step) setStep(data.step);
        if (data.platform) setPlatform(data.platform);
        if (data.owner) setOwner(data.owner);
        if (data.confirmPassword !== undefined) setConfirmPassword(data.confirmPassword);
        if (data.gitHubConnected) setGitHubConnected(data.gitHubConnected);
      } catch { /* ignore */ }
      sessionStorage.removeItem("setup_form");
    }
  }, []);

  // Detect GitHub OAuth return
  useEffect(() => {
    const sb = getSupabaseBrowserClient();
    sb.auth.getSession().then(({ data }: { data: { session: { provider_token?: string | null; user?: { user_metadata?: Record<string, unknown> } } | null } | null }) => {
      if (data?.session?.provider_token && !gitHubConnected) {
        const name = data.session.user?.user_metadata?.user_name;
        setGitHubConnected(typeof name === "string" ? name : "Connected");
      }
    }).catch(() => {});
  }, [gitHubConnected]);

  async function handleKeySubmit(e: FormEvent) {
    e.preventDefault();
    setKeyError("");
    const res = await fetch("/api/validate-setup-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: setupKey }),
    });
    const body: { data?: { valid: boolean } } = await res.json();
    if (body.data?.valid) {
      setStep("platform");
    } else {
      setKeyError("Invalid setup key.");
    }
  }

  function handleOwnerSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!owner.displayName.trim()) { setError("Display name is required."); return; }
    if (!owner.username.trim()) { setError("Username is required."); return; }
    if (!owner.email.trim()) { setError("Email is required."); return; }
    if (owner.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (owner.password !== confirmPassword) { setError("Passwords do not match."); return; }
    setStep("review");
  }

  async function handleGitHubConnect() {
    sessionStorage.setItem("setup_form", JSON.stringify({
      step, setupKey, platform, owner, confirmPassword, gitHubConnected,
    }));
    const sb = getSupabaseBrowserClient();
    await sb.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/setup` },
    });
  }

  async function handleInitialise() {
    setInitialising(true);
    setError("");
    try {
      const res = await fetch("/api/initialise-platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, owner }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error ?? "Initialisation failed.");
        setStep("owner");
        return;
      }

      // Auto-sign-in after successful platform creation
      const sb = getSupabaseBrowserClient();
      const { error: signInError } = await sb.auth.signInWithPassword({
        email: owner.email,
        password: owner.password,
      });
      if (signInError) {
        setError("Platform created but auto-login failed. Please sign in manually.");
        setStep("complete");
        return;
      }

      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      setStep("owner");
    } finally {
      setInitialising(false);
    }
  }

  const stepTitles: Record<SetupStep, string> = {
    welcome: "Welcome",
    key: "Setup Key",
    platform: "Platform",
    owner: "Owner",
    review: "Review",
    complete: "Complete",
  };

  return (
    <AuthPageShell>
      <AuthCard>
        <AuthHeader
          showLogo
          title={step === "complete" ? "Platform Initialised" : stepTitles[step]}
          subtitle={
            step === "welcome"
              ? "This deployment has not yet been configured. Only the deployment administrator should continue."
              : step === "complete"
                ? "Platform created. Redirecting to Mission Control..."
                : `Step ${["welcome", "key", "platform", "owner", "review", "complete"].indexOf(step)} of 5`
          }
        />

        {step === "welcome" && (
          <div className="flex flex-col gap-md">
            <div className="rounded border border-outline-variant/30 bg-surface-container-low p-md">
              <p className="text-body-sm text-on-surface-variant">
                This setup wizard will guide you through creating the Owner account
                and configuring SSG-Hackathon for first use. This process can only be completed once.
              </p>
            </div>
            <Button onClick={() => setStep("key")}>Begin Setup</Button>
          </div>
        )}

        {step === "key" && (
          <form onSubmit={handleKeySubmit} className="flex flex-col gap-md">
            <Input
              label="Platform Setup Key"
              type="password"
              value={setupKey}
              onChange={(e) => setSetupKey(e.target.value)}
              placeholder="Enter the PLATFORM_SETUP_KEY"
              error={keyError || undefined}
              required
            />
            <div className="flex gap-sm">
              <Button variant="ghost" onClick={() => setStep("welcome")}>Back</Button>
              <Button type="submit" disabled={!setupKey}>Verify Key</Button>
            </div>
          </form>
        )}

        {step === "platform" && (
          <div className="flex flex-col gap-md">
            <Input
              label="Platform Name"
              value={platform.platformName}
              onChange={(e) => setPlatform({ ...platform, platformName: e.target.value })}
              required
            />
            <div className="flex flex-col gap-xs">
              <label className="font-mono text-[9px] font-bold uppercase tracking-widest text-on-surface">Description (optional)</label>
              <textarea
                value={platform.description}
                onChange={(e) => setPlatform({ ...platform, description: e.target.value })}
                rows={3}
                className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y"
              />
            </div>
            <Input
              label="Timezone"
              value={platform.timezone}
              onChange={(e) => setPlatform({ ...platform, timezone: e.target.value })}
              placeholder="UTC"
            />
            <div className="flex gap-sm">
              <Button variant="ghost" onClick={() => setStep("key")}>Back</Button>
              <Button onClick={() => setStep("owner")}>Continue</Button>
            </div>
          </div>
        )}

        {step === "owner" && (
          <form onSubmit={handleOwnerSubmit} className="flex flex-col gap-md">
            <Input
              label="Display Name"
              value={owner.displayName}
              onChange={(e) => setOwner({ ...owner, displayName: e.target.value })}
              required
            />
            <Input
              label="Username"
              value={owner.username}
              onChange={(e) => setOwner({ ...owner, username: e.target.value.toLowerCase() })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={owner.email}
              onChange={(e) => setOwner({ ...owner, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              value={owner.password}
              onChange={(e) => setOwner({ ...owner, password: e.target.value })}
              placeholder="At least 8 characters"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
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
                <button type="button" onClick={handleGitHubConnect} disabled={initialising}
                  className="rounded bg-surface-container-high px-sm py-xs text-body-xs text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-50">
                  Connect GitHub
                </button>
              )}
            </div>

            {error && <p role="alert" className="font-mono text-[10px] text-error">{error}</p>}
            <div className="flex gap-sm">
              <Button variant="ghost" onClick={() => setStep("platform")}>Back</Button>
              <Button type="submit">Review Setup</Button>
            </div>
          </form>
        )}

        {step === "review" && (
          <div className="flex flex-col gap-md">
            <div className="rounded border border-outline-variant/30 bg-surface-container-low p-md">
              <h3 className="mb-xs font-mono text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Platform</h3>
              <p className="text-body-sm text-on-surface">{platform.platformName}</p>
              {platform.description && <p className="font-mono text-[9px] text-on-surface-variant">{platform.description}</p>}
              <p className="mt-xs font-mono text-[9px] text-on-surface-variant">{platform.timezone} · {platform.defaultLocale}</p>
            </div>
            <div className="rounded border border-outline-variant/30 bg-surface-container-low p-md">
              <h3 className="mb-xs font-mono text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Owner</h3>
              <p className="text-body-sm text-on-surface">{owner.displayName}</p>
              <p className="font-mono text-[9px] text-on-surface-variant">@{owner.username} · {owner.email}{gitHubConnected ? ` · GitHub: ${gitHubConnected}` : ""}</p>
            </div>
            <div className="rounded border border-outline-variant/30 bg-surface-container-low p-md">
              <h3 className="mb-xs font-mono text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Environment</h3>
              <p className="font-mono text-[9px] text-on-surface-variant">
                {config.app.environment} · v{config.app.version}
              </p>
            </div>
            <div className="flex gap-sm">
              <Button variant="ghost" onClick={() => setStep("owner")}>Back</Button>
              <Button onClick={handleInitialise} disabled={initialising}>
                {initialising ? "Initialising..." : "Initialise Platform"}
              </Button>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="flex flex-col items-center gap-md py-lg">
            <div className="flex items-center gap-sm">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
            </div>
            <p className="font-mono text-[10px] text-on-surface-variant">{error ?? "Redirecting to Mission Control..."}</p>
            {error && (
              <Button onClick={() => router.push("/login")}>Go to Sign In</Button>
            )}
          </div>
        )}
      </AuthCard>
    </AuthPageShell>
  );
}
