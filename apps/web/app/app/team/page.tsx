"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useHackathon } from "@/core/hackathon";
import { createProfileService, type Profile } from "@/core/profile";
import { StatusIndicator } from "@/packages/ui";

const roleOrder = ["owner", "lead", "member", "guest"];

export default function TeamPage() {
  const router = useRouter();
  const { activeHackathon } = useHackathon();
  const [members, setMembers] = useState<(Profile & { role: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeHackathon) return;
    setIsLoading(true);
    createProfileService()
      .listByHackathon(activeHackathon.id)
      .then(setMembers)
      .catch((err) => console.error("[Page] error:", err))
      .finally(() => setIsLoading(false));
  }, [activeHackathon]);

  if (!activeHackathon) {
    router.replace("/app");
    return null;
  }

  const sorted = [...members].sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role),
  );

  return (
    <div className="p-lg">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-lg">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-h1 font-semibold text-on-surface">Team</h1>
            <p className="font-mono text-[11px] text-on-surface-variant">
              {members.length} member{members.length !== 1 ? "s" : ""} in {activeHackathon.name}
            </p>
          </div>
          <Link
            href="/app/team/invitations"
            className="inline-flex items-center gap-sm rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Invite Member
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-xl">
            <div className="flex items-center gap-sm">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
            </div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-sm py-xl text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">group</span>
            <p className="text-body-sm text-on-surface-variant">No team members yet.</p>
            <Link href="/app/team/invitations"
              className="inline-flex items-center gap-sm rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Invite Members
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-sm md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((member) => (
              <div
                key={member.id}
                className="rounded border border-outline-variant/30 bg-surface-container-low p-lg transition-colors hover:bg-surface-container"
              >
                <div className="flex items-start gap-md">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container font-mono text-[12px] font-medium text-white">
                    {member.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-sm">
                      <p className="text-body-sm font-medium text-on-surface truncate">
                        {member.displayName}
                      </p>
                      <StatusIndicator
                        status={member.status === "online" ? "active" : member.status === "away" ? "warning" : "idle"}
                        pulse={member.status === "online"}
                      />
                    </div>
                    <p className="font-mono text-[10px] text-on-surface-variant">
                      @{member.username}
                    </p>
                    <span className="mt-xs inline-block rounded border border-outline-variant/30 px-xs py-[1px] font-mono text-[9px] text-on-surface-variant">
                      {member.role}
                    </span>
                  </div>
                </div>
                <div className="mt-md flex flex-wrap gap-x-lg gap-y-xs font-mono text-[10px] text-on-surface-variant">
                  {member.githubUsername && <span>GH: {member.githubUsername}</span>}
                  {member.discordUsername && <span>DC: {member.discordUsername}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-lg border-t border-outline-variant/30 pt-lg">
          <Link
            href="/app/team/invitations"
            className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80"
          >
            Manage Invitations →
          </Link>
        </div>
      </div>
    </div>
  );
}
