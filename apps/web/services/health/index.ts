import { checkSupabaseHealth as checkCloudflareDataHealth } from "@/services/supabase";
import { checkRedisHealth as checkCloudflareKvHealth } from "@/services/redis";
import { validateEnv } from "@/services/config/env";
import { config } from "@/services/config";
import { logger } from "@/services/logger";

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    env: { healthy: boolean; missing: number; warnings: number };
    cloudflareData: { healthy: boolean; error?: string; provider?: string };
    cloudflareKv: { healthy: boolean; error?: string; provider?: string };
  };
}

export async function runHealthCheck(): Promise<HealthCheckResult> {
  const envValidation = validateEnv();
  const [cloudflareDataHealth, cloudflareKvHealth] = await Promise.all([
    checkCloudflareDataHealth().catch((e) => ({
      healthy: false,
      error: e.message,
    })),
    checkCloudflareKvHealth().catch((e) => ({
      healthy: false,
      error: e.message,
    })),
  ]);

  const checks = {
    env: {
      healthy: envValidation.valid,
      missing: envValidation.missing.length,
      warnings: envValidation.warnings.length,
    },
    cloudflareData: cloudflareDataHealth,
    cloudflareKv: cloudflareKvHealth,
  };

  const allHealthy = Object.values(checks).every((c) => c.healthy);
  const someDegraded = Object.values(checks).some(
    (c) => !c.healthy && c !== checks.env,
  );

  const status: HealthCheckResult["status"] = allHealthy
    ? "healthy"
    : someDegraded
      ? "degraded"
      : "unhealthy";

  if (status !== "healthy") {
    logger.warn("Health check returned non-healthy status", {
      status,
      checks,
    });
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    version: config.app.version,
    environment: config.app.environment,
    checks,
  };
}
