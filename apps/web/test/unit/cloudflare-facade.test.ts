import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildAccountsUrl,
  getSupabaseServerClient,
} from "@/services/supabase";

const appRoot = resolve(process.cwd());

describe("ported frontend surface", () => {
  it("includes the upstream mission-control and core workflow routes", () => {
    const expectedRoutes = [
      "app/page.tsx",
      "app/login/page.tsx",
      "app/join/page.tsx",
      "app/status/page.tsx",
      "app/app/page.tsx",
      "app/app/planning/page.tsx",
      "app/app/ideas/page.tsx",
      "app/app/research/page.tsx",
      "app/app/tasks/page.tsx",
      "app/app/files/page.tsx",
      "app/app/analytics/page.tsx",
      "app/app/automation/page.tsx",
      "app/app/submission-prep/page.tsx",
      "app/app/admin/page.tsx",
      "app/app/admin/activity/page.tsx",
      "app/app/admin/diagnostics/page.tsx",
      "app/app/admin/members/page.tsx",
      "app/app/settings/page.tsx",
      "app/app/settings/account/page.tsx",
      "app/app/settings/security/page.tsx",
      "app/app/settings/developer/page.tsx",
    ];

    for (const route of expectedRoutes) {
      expect(existsSync(resolve(appRoot, route)), route).toBe(true);
    }
  });
});

describe("Cloudflare compatibility facade", () => {
  it("uses SigmaShake Accounts as the auth authority", () => {
    const url = new URL(buildAccountsUrl());

    expect(url.origin).toBe("https://accounts.sigmashake.com");
    expect(url.searchParams.get("client_id")).toBe("sigmashake-hackathon");
  });

  it("returns seeded active hackathon data without Supabase", async () => {
    const { data, error } = await getSupabaseServerClient()
      .from("hackathons")
      .select("*")
      .eq("status", "active")
      .maybeSingle();

    expect(error).toBeNull();
    expect(data?.name).toBe("SigmaShake Hackathon");
    expect(data?.status).toBe("active");
  });
});
