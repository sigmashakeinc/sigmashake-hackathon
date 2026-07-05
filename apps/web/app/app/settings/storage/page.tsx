"use client";

import Link from "next/link";

export default function StorageSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Storage</h1>
      <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
        <p className="mb-md text-body-sm text-on-surface-variant">
          Storage management and monitoring is available through the Owner Control Centre.
          Usage statistics, file details, and bucket information are displayed there.
        </p>
        <Link href="/app/admin/storage"
          className="inline-flex items-center gap-xs rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">
          <span className="material-symbols-outlined text-[16px]">cloud</span>
          View Storage in Admin
        </Link>
      </div>
    </div>
  );
}
