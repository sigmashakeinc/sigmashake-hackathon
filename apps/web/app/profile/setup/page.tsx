"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/identity";
import { useHackathon } from "@/core/hackathon";
import { createProfileService } from "@/core/profile";
import { AuthCard, AuthHeader, FormField, AuthPageShell } from "@/components/auth";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { activeHackathon } = useHackathon();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [github, setGithub] = useState("");
  const [discord, setDiscord] = useState("");
  const [bio, setBio] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !user) {
    return (
      <AuthPageShell>
        <AuthCard>
          <div className="flex items-center justify-center py-lg">
            <div className="flex items-center gap-sm">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
            </div>
          </div>
        </AuthCard>
      </AuthPageShell>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");

    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const service = createProfileService();

      await service.create(user!.id, {
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        timezone,
        githubUsername: github.trim() || undefined,
        discordUsername: discord.trim() || undefined,
        bio: bio.trim() || undefined,
      });

      await service.update(user!.id, { onboarded: true });

      if (activeHackathon) {
        await service.joinHackathon(user!.id, activeHackathon.id, "member");
      }

      router.replace("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageShell>
      <AuthCard>
        <AuthHeader
          showLogo
          title="Welcome aboard!"
          subtitle="Set up your profile to get started."
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <FormField
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your full name"
            disabled={isSubmitting}
            required
          />
          <FormField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            disabled={isSubmitting}
            required
          />

          <div className="grid grid-cols-1 gap-lg sm:grid-cols-2">
            <FormField label="GitHub Username" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="@username" disabled={isSubmitting} />
            <FormField label="Discord Username" value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="user#0000" disabled={isSubmitting} />
          </div>

          <FormField label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="UTC" disabled={isSubmitting} />

          <div className="flex flex-col gap-xs">
            <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..."
              className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y" />
          </div>

          {error && <p role="alert" className="rounded border border-error-container/30 bg-error-container/5 px-sm py-xs font-mono text-[10px] text-error">{error}</p>}

          <button type="submit" disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded bg-primary px-md py-md text-body-sm font-medium text-on-primary transition-all hover:bg-[#c01826] disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Complete Setup"}
          </button>
        </form>
      </AuthCard>
    </AuthPageShell>
  );
}
