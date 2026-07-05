"use client";

import Link from "next/link";
import { useHackathon } from "@/core/hackathon";
import { StatusIndicator } from "@/packages/ui";

const statusLabels: Record<string, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  active: "Active",
  submission: "Submission",
  judging: "Judging",
  completed: "Completed",
  archived: "Archived",
};

const statusColors: Record<string, "active" | "idle" | "paused" | "success"> = {
  draft: "paused",
  upcoming: "idle",
  active: "active",
  submission: "active",
  judging: "idle",
  completed: "success",
  archived: "paused",
};

export default function HackathonsPage() {
  const { hackathons, activate, state } = useHackathon();

  return (
    <div className="p-lg">
      <div className="gap-lg mx-auto flex max-w-[1600px] flex-col">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-h1 text-on-surface font-semibold">
              Hackathons
            </h1>
            <p className="text-on-surface-variant font-mono text-[11px]">
              All hackathons — active, archived, and drafts
            </p>
          </div>
          <Link
            href="/app/hackathons/new"
            className="gap-sm bg-primary px-md py-sm text-body-sm text-on-primary inline-flex items-center rounded font-medium transition-colors hover:bg-[#c01826]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Hackathon
          </Link>
        </div>

        {state === "loading" && (
          <div className="py-xl flex items-center justify-center">
            <div className="gap-sm flex items-center">
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {hackathons.length === 0 && state === "empty" && (
          <div className="gap-sm py-xl flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-on-surface-variant/30 text-[48px]">
              emoji_events
            </span>
            <p className="text-body-sm text-on-surface-variant">
              No hackathons yet. Create your first one to get started.
            </p>
          </div>
        )}

        <div className="gap-sm flex flex-col">
          {hackathons.map((h) => (
            <div
              key={h.id}
              className="border-outline-variant/30 bg-surface-container-low px-lg py-md hover:bg-surface-container flex items-center justify-between rounded border transition-colors"
            >
              <div className="gap-md flex items-start">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded">
                  <span className="material-symbols-outlined text-[20px]">
                    emoji_events
                  </span>
                </div>
                <div>
                  <p className="text-body-sm text-on-surface font-medium">
                    {h.name}
                  </p>
                  <p className="text-on-surface-variant font-mono text-[10px]">
                    {h.organizer}
                    {h.location && ` · ${h.location}`}
                  </p>
                  <div className="mt-xs">
                    <StatusIndicator
                      status={statusColors[h.status] ?? "paused"}
                      label={statusLabels[h.status] ?? h.status}
                    />
                  </div>
                </div>
              </div>
              <div className="gap-sm flex items-center">
                {h.status === "archived" && (
                  <button
                    type="button"
                    onClick={() => activate(h.id)}
                    className="border-outline-variant px-sm py-xs text-body-sm text-on-surface hover:border-primary rounded border bg-black transition-colors"
                  >
                    Reactivate
                  </button>
                )}
                {h.status === "active" && (
                  <Link
                    href="/app"
                    className="bg-primary px-sm py-xs text-body-sm text-on-primary rounded font-medium transition-colors hover:bg-[#c01826]"
                  >
                    Open
                  </Link>
                )}
                <Link
                  href={`/app/hackathons/${h.id}/edit`}
                  className="border-outline-variant px-sm py-xs text-body-sm text-on-surface hover:border-on-surface rounded border bg-black transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
