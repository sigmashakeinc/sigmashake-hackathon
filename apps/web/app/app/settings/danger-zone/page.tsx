"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/identity";
import { createAdminService } from "@/core/admin";
import Link from "next/link";

export default function DangerZonePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;
    createAdminService().isPlatformOwner(user.id)
      .then(setIsOwner)
      .catch((err) => console.error("[Page] error:", err))
      .finally(() => setChecking(false));
  }, [authLoading, isAuthenticated, user]);

  useEffect(() => {
    if (!checking && isOwner) router.replace("/app/admin");
  }, [checking, isOwner, router]);

  if (checking || authLoading || isOwner) return null;

  return (
    <div className="mx-auto max-w-2xl p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Danger Zone</h1>
      <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
        <p className="text-body-sm text-on-surface-variant">
          Destructive workspace actions are managed in the Admin Centre.
        </p>
        <Link href="/app/admin" className="mt-md inline-flex items-center gap-xs rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">
          <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
          Go to Admin Centre
        </Link>
      </div>
    </div>
  );
}
