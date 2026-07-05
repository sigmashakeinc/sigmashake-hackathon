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

const tracks: RuntimeStatus["tracks"] = [
  { slug: "runtime", name: "Runtime", openSubmissions: 0 },
  { slug: "frontend", name: "Frontend", openSubmissions: 0 },
  { slug: "security", name: "Security", openSubmissions: 0 }
];

export function runtimeFallbackStatus(
  environment = process.env.SIGMASHAKE_ENV ?? "local"
): RuntimeStatus {
  const production = environment === "production";
  const agentState = production ? "ready" : "waiting";

  return {
    health: production ? "ok" : "degraded",
    environment,
    authMode: production ? "accounts.sigmashake.com" : "mock",
    stateGeneration: production ? "cloudflare-worker" : "unavailable",
    supervisor: production ? "one_for_one" : "offline",
    tracks,
    agents: [
      { name: "codex", state: agentState },
      { name: "opencode", state: agentState },
      { name: "claude-code", state: agentState }
    ]
  };
}

export async function getRuntimeStatus(): Promise<RuntimeStatus> {
  const fallbackStatus = runtimeFallbackStatus();
  const configuredBaseURL = process.env.SIGMASHAKE_API_URL;

  if (!configuredBaseURL && fallbackStatus.environment === "production") {
    return fallbackStatus;
  }

  const baseURL = configuredBaseURL ?? "http://localhost:8787";

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
