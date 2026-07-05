import { describe, expect, it } from "vitest";
import { runtimeFallbackStatus } from "@/lib/api";

describe("runtimeFallbackStatus", () => {
  it("keeps local development visibly degraded when the API is unavailable", () => {
    const status = runtimeFallbackStatus("local");

    expect(status.health).toBe("degraded");
    expect(status.environment).toBe("local");
    expect(status.authMode).toBe("mock");
    expect(status.supervisor).toBe("offline");
    expect(status.agents.every((agent) => agent.state === "waiting")).toBe(true);
  });

  it("describes the deployed Cloudflare surface in production", () => {
    const status = runtimeFallbackStatus("production");

    expect(status.health).toBe("ok");
    expect(status.environment).toBe("production");
    expect(status.authMode).toBe("accounts.sigmashake.com");
    expect(status.stateGeneration).toBe("cloudflare-worker");
    expect(status.supervisor).toBe("one_for_one");
    expect(status.agents.every((agent) => agent.state === "ready")).toBe(true);
  });
});
