"use client";

import Link from "next/link";
import { useHackathon } from "@/core/hackathon";

export default function HackathonSettingsPage() {
  const { activeHackathon, hackathons } = useHackathon();

  return (
    <div className="mx-auto max-w-2xl p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Hackathon Settings</h1>

      {activeHackathon && (
        <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
          <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Current Hackathon</h2>
          <div className="flex flex-col gap-xs font-mono text-[10px] text-on-surface-variant">
            <p>Name: {activeHackathon.name}</p>
            <p>Organizer: {activeHackathon.organizer}</p>
            <p>Status: {activeHackathon.status}</p>
            <p>Slug: {activeHackathon.slug}</p>
          </div>
          <div className="mt-md">
            <Link href={`/app/hackathons/${activeHackathon.id}/edit`}
              className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">Edit Hackathon Details →</Link>
          </div>
        </div>
      )}

      <div className="mt-lg rounded border border-outline-variant/30 bg-surface-container p-lg">
        <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">All Hackathons</h2>
        <p className="font-mono text-[10px] text-on-surface-variant">{hackathons.length} hackathon{(hackathons.length) !== 1 ? "s" : ""}</p>
        <div className="mt-md">
          <Link href="/app/hackathons" className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">Manage Hackathons →</Link>
        </div>
      </div>
    </div>
  );
}
