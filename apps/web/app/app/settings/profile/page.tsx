"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/identity";
import { createProfileService } from "@/core/profile";
import { Input, Button } from "@/components/ui";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [github, setGithub] = useState("");
  const [discord, setDiscord] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.replace("/"); return; }
    if (!user) return;

    createProfileService()
      .getById(user.id)
      .then((profile) => {
        if (profile) {
          setDisplayName(profile.displayName);
          setUsername(profile.username);
          setTimezone(profile.timezone);
          setGithub(profile.githubUsername ?? "");
          setDiscord(profile.discordUsername ?? "");
          setWebsite(profile.website ?? "");
          setBio(profile.bio ?? "");
        }
      })
      .catch((err) => console.error("[Page] error:", err))
      .finally(() => setIsLoading(false));
  }, [authLoading, isAuthenticated, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setIsSaving(true);
    setSaved(false);

    try {
      await createProfileService().update(user.id, {
        displayName: displayName.trim() || undefined,
        username: username.trim().toLowerCase() || undefined,
        timezone,
        githubUsername: github.trim() || undefined,
        discordUsername: discord.trim() || undefined,
        website: website.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-sm">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
        <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
          <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Basic Info</h2>
          <div className="flex flex-col gap-md">
            <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
        </div>

        <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
          <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Social</h2>
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <Input label="GitHub" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="@username" />
            <Input label="Discord" value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="user#0000" />
            <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className="sm:col-span-2" />
          </div>
        </div>

        <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
          <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Details</h2>
          <div className="flex flex-col gap-md">
            <Input label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            <div className="flex flex-col gap-xs">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y" />
            </div>
          </div>
        </div>

        {error && <p role="alert" className="rounded border border-error-container/30 bg-error-container/5 px-sm py-xs font-mono text-[10px] text-error">{error}</p>}
        {saved && <p className="font-mono text-[10px] text-[#3fb950]">Profile saved successfully.</p>}

        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
      </form>
    </div>
  );
}
