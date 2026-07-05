import { checkSupabaseHealth } from "@/services/supabase";
import { checkRedisHealth } from "@/services/redis";
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
    supabase: { healthy: boolean; error?: string };
    redis: { healthy: boolean; error?: string };
  };
}

export async function runHealthCheck(): Promise<HealthCheckResult> {
  const envValidation = validateEnv();
  const [supabaseHealth, redisHealth] = await Promise.all([
    checkSupabaseHealth().catch((e) => ({ healthy: false, error: e.message })),
    checkRedisHealth().catch((e) => ({ healthy: false, error: e.message })),
  ]);

  const checks = {
    env: {
      healthy: envValidation.valid,
      missing: envValidation.missing.length,
      warnings: envValidation.warnings.length,
    },
    supabase: supabaseHealth,
    redis: redisHealth,
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
