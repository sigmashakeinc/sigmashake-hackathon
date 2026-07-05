import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, AuthPageShell } from "@/components/auth";

export const metadata: Metadata = {
  title: "System Status",
};

export default function StatusPage() {
  return (
    <AuthPageShell>
      <AuthCard>
        <div className="mb-sm border-outline-variant pb-sm border-b">
          <h1 className="text-h2 text-on-surface font-semibold">
            System Status
          </h1>
          <p className="mt-xs text-on-surface-variant font-mono text-[11px]">
            v0.1.0 — production
          </p>
        </div>

        <div className="gap-md flex flex-col">
          <div className="border-outline-variant/30 bg-surface-container px-md py-sm flex items-center justify-between rounded border">
            <span className="text-body-sm text-on-surface">Application</span>
            <span className="gap-xs flex items-center font-mono text-[10px] text-[#3fb950]">
              <span className="inline-block h-[6px] w-[6px] rounded-full bg-[#3fb950]" />
              Operational
            </span>
          </div>
          <div className="border-outline-variant/30 bg-surface-container px-md py-sm flex items-center justify-between rounded border">
            <span className="text-body-sm text-on-surface">Cloudflare Data</span>
            <span className="gap-xs flex items-center font-mono text-[10px] text-[#3fb950]">
              <span className="inline-block h-[6px] w-[6px] rounded-full bg-[#3fb950]" />
              Preview Facade
            </span>
          </div>
          <div className="border-outline-variant/30 bg-surface-container px-md py-sm flex items-center justify-between rounded border">
            <span className="text-body-sm text-on-surface">Cloudflare Storage</span>
            <span className="gap-xs flex items-center font-mono text-[10px] text-[#3fb950]">
              <span className="inline-block h-[6px] w-[6px] rounded-full bg-[#3fb950]" />
              R2/KV Ready
            </span>
          </div>
          <div className="border-outline-variant/30 bg-surface-container px-md py-sm flex items-center justify-between rounded border">
            <span className="text-body-sm text-on-surface">Deployment</span>
            <span className="gap-xs flex items-center font-mono text-[10px] text-[#3fb950]">
              <span className="inline-block h-[6px] w-[6px] rounded-full bg-[#3fb950]" />
              Cloudflare Workers
            </span>
          </div>
          <div className="border-outline-variant/30 bg-surface-container px-md py-sm flex items-center justify-between rounded border">
            <span className="text-body-sm text-on-surface">Authentication</span>
            <span className="gap-xs flex items-center font-mono text-[10px] text-[#3fb950]">
              <span className="inline-block h-[6px] w-[6px] rounded-full bg-[#3fb950]" />
              accounts.sigmashake.com
            </span>
          </div>
        </div>

        <div className="mt-sm border-outline-variant pt-md border-t">
          <Link
            href="/login"
            className="text-body-sm text-primary transition-opacity hover:opacity-80"
          >
            Back to Sign In
          </Link>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
}
