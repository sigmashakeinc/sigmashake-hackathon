"use client";

import Link from "next/link";

export default function InvitationsSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Invitation Settings</h1>
      <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
        <p className="text-body-sm text-on-surface-variant">Configure default invitation behaviour.</p>
        <div className="mt-md">
          <Link href="/app/team/invitations" className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">Manage Invitations</Link>
        </div>
      </div>
    </div>
  );
}
