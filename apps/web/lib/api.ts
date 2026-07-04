export type RuntimeStatus = {
  health: "ok" | "degraded" | "down";
  environment: string;
  authMode: string;
  stateGeneration: string;
  supervisor: string;
  tracks: Array<{
    slug: string;
    name: string;
    openSubmissions: number;
  }>;
  agents: Array<{
    name: string;
    state: string;
  }>;
};

const fallbackStatus: RuntimeStatus = {
  health: "degraded",
  environment: "local",
  authMode: "mock",
  stateGeneration: "unavailable",
  supervisor: "offline",
  tracks: [
    { slug: "runtime", name: "Runtime", openSubmissions: 0 },
    { slug: "frontend", name: "Frontend", openSubmissions: 0 },
    { slug: "security", name: "Security", openSubmissions: 0 }
  ],
  agents: [
    { name: "codex", state: "waiting" },
    { name: "opencode", state: "waiting" },
    { name: "claude-code", state: "waiting" }
  ]
};

export async function getRuntimeStatus(): Promise<RuntimeStatus> {
  const baseURL = process.env.SIGMASHAKE_API_URL ?? "http://localhost:8787";

  try {
    const response = await fetch(`${baseURL}/v1/status`, {
      cache: "no-store"
    });

    if (!response.ok) return fallbackStatus;
    return (await response.json()) as RuntimeStatus;
  } catch {
    return fallbackStatus;
  }
}
