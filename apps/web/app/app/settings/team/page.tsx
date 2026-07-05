"use client";

import Link from "next/link";

export default function TeamSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Team Settings</h1>
      <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
        <p className="text-body-sm text-on-surface-variant">Manage your team roles, permissions, and member limits.</p>
        <div className="mt-md flex gap-sm">
          <Link href="/app/team" className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">View Team</Link>
          <Link href="/app/team/invitations" className="rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface transition-colors hover:border-on-surface">Manage Invitations</Link>
        </div>
      </div>
    </div>
  );
}
