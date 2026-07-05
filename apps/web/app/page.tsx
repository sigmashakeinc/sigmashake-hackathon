"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/identity";
import { AuthCard, AuthHeader, AuthPageShell } from "@/components/auth";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/app");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <AuthPageShell>
        <AuthCard>
          <div className="py-lg flex items-center justify-center">
            <div className="gap-sm flex items-center">
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
              <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
            </div>
          </div>
        </AuthCard>
      </AuthPageShell>
    );
  }

  if (isAuthenticated) return null;

  return (
    <AuthPageShell>
      <AuthCard>
        <AuthHeader
          showLogo
          title="SSG-Hackathon"
          subtitle="Private Collaborative Workstation"
        />
        <p className="text-body-sm text-center text-[#b5b5b5]">
          Access is restricted to invited members.
        </p>
        <div className="gap-md flex flex-col">
          <Link
            href="/login"
            className="bg-primary px-md py-md text-body-sm text-on-primary inline-flex w-full items-center justify-center rounded font-medium transition-colors hover:bg-[#c01826]"
          >
            Sign In
          </Link>
          <Link
            href="/join"
            className="border-outline-variant px-md py-md text-body-sm text-on-surface hover:border-on-surface inline-flex w-full items-center justify-center rounded border bg-black transition-colors"
          >
            Join Team
          </Link>
        </div>
        <div className="mt-sm gap-xs border-outline-variant pt-md flex items-center justify-center border-t">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white opacity-80" />
          <span className="text-on-surface-variant font-mono text-[11px] tracking-wider uppercase">
            Secure Connection
          </span>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
}
