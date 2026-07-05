"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useHackathon } from "@/core/hackathon";
import {
  createInvitationService,
  buildInviteUrl,
  INVITE_EXPIRY_OPTIONS,
  INVITE_MAX_USES_OPTIONS,
  INVITE_ROLE_OPTIONS,
  type Invitation,
  type InvitationRole,
} from "@/core/invitation";

function parseExpiry(value: string): number {
  const map: Record<string, number> = {
    "1h": 3600000,
    "24h": 86400000,
    "7d": 604800000,
    "30d": 2592000000,
  };
  return map[value] ?? 604800000;
}

const statusStyles: Record<string, string> = {
  active: "text-[#3fb950] border-[#3fb950]/30 bg-[#3fb950]/5",
  pending:
    "text-on-surface-variant border-surface-variant bg-surface-container",
  used: "text-on-surface-variant border-surface-variant bg-surface-container",
  expired: "text-[#d29922] border-[#d29922]/30 bg-[#d29922]/5",
  revoked: "text-error border-error/30 bg-error/5",
  disabled:
    "text-on-surface-variant border-surface-variant bg-surface-container",
};

export default function InvitationsPage() {
  const router = useRouter();
  const { activeHackathon } = useHackathon();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [loadKey, setLoadKey] = useState(0);

  const [role, setRole] = useState<InvitationRole>("member");
  const [maxUses, setMaxUses] = useState(1);
  const [expiry, setExpiry] = useState("7d");
  const [notes, setNotes] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://hack.sigmashake.com";

  useEffect(() => {
    if (!activeHackathon) return;
    setIsLoading(true);
    const service = createInvitationService();
    service
      .list(activeHackathon.id)
      .then(setInvitations)
      .catch((err) => console.error("[Page] error:", err))
      .finally(() => setIsLoading(false));
  }, [activeHackathon, loadKey]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!activeHackathon) return;
    setCreateError("");
    setIsCreating(true);

    try {
      const expiresAt =
        expiry === "never"
          ? null
          : new Date(Date.now() + parseExpiry(expiry)).toISOString();

      const service = createInvitationService();
      await service.create({
        hackathonId: activeHackathon.id,
        role,
        maxUses,
        expiresAt,
        createdBy: "owner",
        notes: notes.trim() || undefined,
      });

      setShowCreate(false);
      setRole("member");
      setMaxUses(1);
      setExpiry("7d");
      setNotes("");
      setLoadKey((k) => k + 1);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create invitation.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    const service = createInvitationService();
    await service.revoke(id, "owner");
    setLoadKey((k) => k + 1);
  }

  async function handleToggle(id: string, currentStatus: string) {
    const service = createInvitationService();
    if (currentStatus === "disabled") {
      await service.enable(id);
    } else {
      await service.disable(id);
    }
    setLoadKey((k) => k + 1);
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filtered =
    filter === "all"
      ? invitations
      : invitations.filter((i) => i.status === filter);

  if (!activeHackathon) {
    router.replace("/app");
    return null;
  }

  return (
    <div className="p-lg">
      <div className="gap-lg mx-auto flex max-w-[1200px] flex-col">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-h1 text-on-surface font-semibold">Team</h1>
            <p className="text-on-surface-variant font-mono text-[11px]">
              Manage invitations for {activeHackathon.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="gap-sm bg-primary px-md py-sm text-body-sm text-on-primary inline-flex items-center rounded font-medium transition-colors hover:bg-[#c01826]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Generate Invite
          </button>
        </div>

        {showCreate && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCreate(false);
            }}
          >
            <div
              className="border-outline-variant bg-surface-container-low p-xl w-full max-w-md rounded border"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-lg text-h2 text-on-surface font-semibold">
                Generate Invitation
              </h2>
              <form onSubmit={handleCreate} className="gap-md flex flex-col">
                <div className="gap-xs flex flex-col">
                  <label className="text-on-surface font-mono text-[10px] font-bold tracking-widest uppercase">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as InvitationRole)}
                    className="border-outline-variant px-md py-sm text-body-sm text-on-surface focus:border-primary focus:ring-primary w-full rounded border bg-black focus:ring-1 focus:outline-none"
                  >
                    {INVITE_ROLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="gap-xs flex flex-col">
                  <label className="text-on-surface font-mono text-[10px] font-bold tracking-widest uppercase">
                    Max Uses
                  </label>
                  <select
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="border-outline-variant px-md py-sm text-body-sm text-on-surface focus:border-primary focus:ring-primary w-full rounded border bg-black focus:ring-1 focus:outline-none"
                  >
                    {INVITE_MAX_USES_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="gap-xs flex flex-col">
                  <label className="text-on-surface font-mono text-[10px] font-bold tracking-widest uppercase">
                    Expires
                  </label>
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="border-outline-variant px-md py-sm text-body-sm text-on-surface focus:border-primary focus:ring-primary w-full rounded border bg-black focus:ring-1 focus:outline-none"
                  >
                    {INVITE_EXPIRY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="gap-xs flex flex-col">
                  <label className="text-on-surface font-mono text-[10px] font-bold tracking-widest uppercase">
                    Note (optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. For backend dev role"
                    className="border-outline-variant px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-primary w-full rounded border bg-black focus:ring-1 focus:outline-none"
                  />
                </div>
                {createError && (
                  <p
                    role="alert"
                    className="border-error-container/30 bg-error-container/5 px-sm py-xs text-error rounded border font-mono text-[10px]"
                  >
                    {createError}
                  </p>
                )}
                <div className="gap-sm flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="border-outline-variant px-md py-sm text-body-sm text-on-surface hover:border-on-surface rounded border bg-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="bg-primary px-md py-sm text-body-sm text-on-primary rounded font-medium transition-colors hover:bg-[#c01826] disabled:opacity-50"
                  >
                    {isCreating ? "Generating..." : "Generate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="gap-sm flex">
          {["all", "active", "used", "expired", "revoked"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-sm py-xs text-body-sm rounded transition-colors ${filter === f ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-xl flex items-center justify-center">
            <div className="gap-sm flex items-center">
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="gap-sm py-xl flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-on-surface-variant/30 text-[48px]">
              link
            </span>
            <p className="text-body-sm text-on-surface-variant">
              No invitations found.
            </p>
          </div>
        ) : (
          <div className="gap-xs flex flex-col">
            {filtered.map((inv) => {
              const { url } = buildInviteUrl(baseUrl, inv.token, inv.code);
              return (
                <div
                  key={inv.id}
                  className="border-outline-variant/30 bg-surface-container-low px-lg py-md flex items-center justify-between rounded border"
                >
                  <div className="min-w-0 flex-1">
                    <div className="gap-sm flex items-center">
                      <span className="text-on-surface font-mono text-[11px] font-medium">
                        {inv.code}
                      </span>
                      <span
                        className={`px-xs rounded border py-[1px] font-mono text-[9px] ${statusStyles[inv.status] ?? statusStyles.pending}`}
                      >
                        {inv.status}
                      </span>
                      <span className="text-on-surface-variant font-mono text-[10px]">
                        {inv.role}
                      </span>
                    </div>
                    <div className="mt-xs gap-md text-on-surface-variant flex font-mono text-[10px]">
                      <span>
                        Uses: {inv.currentUses}/{inv.maxUses}
                      </span>
                      {inv.expiresAt && (
                        <span>
                          Expires:{" "}
                          {new Date(inv.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                      <span>
                        Created: {new Date(inv.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {inv.notes && (
                      <p className="mt-xs text-body-sm text-on-surface-variant">
                        {inv.notes}
                      </p>
                    )}
                    <div className="mt-xs gap-sm flex">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(url, `url-${inv.id}`)}
                        className="text-primary font-mono text-[10px] transition-opacity hover:opacity-80"
                      >
                        {copiedId === `url-${inv.id}` ? "Copied!" : "Copy Link"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(inv.code, `code-${inv.id}`)
                        }
                        className="text-primary font-mono text-[10px] transition-opacity hover:opacity-80"
                      >
                        {copiedId === `code-${inv.id}`
                          ? "Copied!"
                          : "Copy Code"}
                      </button>
                    </div>
                  </div>
                  <div className="gap-sm flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => handleToggle(inv.id, inv.status)}
                      className="border-outline-variant px-sm py-xs text-body-sm text-on-surface hover:border-on-surface rounded border bg-black transition-colors"
                    >
                      {inv.status === "disabled" ? "Enable" : "Disable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevoke(inv.id)}
                      className="border-error/30 px-sm py-xs text-body-sm text-error hover:border-error rounded border transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
