"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">About</h1>

      <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
        <div className="mb-md flex h-12 w-12 items-center justify-center">
          <Image src="/logo-192.png" alt="SSG-Hackathon" width={48} height={48} className="rounded object-contain" />
        </div>
        <h2 className="text-h2 font-semibold text-on-surface">SSG-Hackathon</h2>
        <p className="mt-xs font-mono text-[10px] text-on-surface-variant">v0.1.0 · MIT License</p>
        <p className="mt-md text-body-sm text-on-surface-variant">
          An invite-only collaborative workstation for hackathon teams.
          Built with Next.js, Supabase, and Tailwind CSS.
        </p>
        <div className="mt-md flex gap-sm">
          <Link href="https://github.com/millsydotdev/SSG-Hackathon" target="_blank" rel="noopener noreferrer"
            className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">GitHub →</Link>
          <Link href="/privacy" className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">Privacy →</Link>
          <Link href="/terms" className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">Terms →</Link>
        </div>
      </div>
    </div>
  );
}
