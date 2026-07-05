"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SetupWizard } from "@/components/setup/setup-wizard";

export default function SetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/platform-status")
      .then((r) => r.json())
      .then((data) => {
        if (data.initialised) {
          router.replace("/login");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-sm">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return <SetupWizard />;
}
