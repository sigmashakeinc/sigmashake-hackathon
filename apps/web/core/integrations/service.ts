import { getSupabaseServerClient } from "@/services/supabase";
import type {
  IntegrationConnection, IntegrationHealth, IntegrationLog, IntegrationValidation,
  IntegrationType, AuthMethod, ConnectionStatus, HealthStatus, ValidationResult, LogLevel,
} from "./types";

export function createIntegrationService() {
  function client() {
    return getSupabaseServerClient();
  }

  // Connection CRUD
  async function getConnections(hackathonId: string): Promise<IntegrationConnection[]> {
    const { data } = await client()
      .from("integration_connections")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .order("created_at", { ascending: false });

    return ((data ?? []) as Record<string, unknown>[]).map(mapConnectionRow);
  }

  async function getConnection(hackathonId: string, integrationType: string): Promise<IntegrationConnection | null> {
    const { data } = await client()
      .from("integration_connections")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .eq("integration_type", integrationType)
      .maybeSingle();

    return data ? mapConnectionRow(data as Record<string, unknown>) : null;
  }

  async function createConnection(input: {
    hackathonId: string;
    integrationType: IntegrationType;
    label: string;
    authMethod: AuthMethod;
    metadata?: Record<string, unknown>;
    enabledFeatures?: Record<string, boolean>;
    userId: string;
  }): Promise<IntegrationConnection> {
    const { data } = await client()
      .from("integration_connections")
      .insert({
        hackathon_id: input.hackathonId,
        integration_type: input.integrationType,
        label: input.label,
        auth_method: input.authMethod,
        status: "connected",
        metadata: input.metadata ?? {},
        enabled_features: input.enabledFeatures ?? {},
        created_by: input.userId,
      } as never)
      .select()
      .single() as never;

    return data as unknown as IntegrationConnection;
  }

  async function updateConnection(id: string, input: Partial<IntegrationConnection>): Promise<void> {
    await client()
      .from("integration_connections")
      .update(input as never)
      .eq("id", id) as never;
  }

  async function deleteConnection(id: string): Promise<void> {
    await client()
      .from("integration_connections")
      .delete()
      .eq("id", id) as never;
  }

  // Health
  async function recordHealth(connectionId: string, input: {
    status: HealthStatus;
    score: number;
    checks?: Record<string, unknown>;
    details?: Record<string, unknown>;
  }): Promise<void> {
    await client()
      .from("integration_health")
      .insert({
        connection_id: connectionId,
        status: input.status,
        score: input.score,
        checks: input.checks ?? {},
        details: input.details ?? {},
      } as never) as never;

    await client()
      .from("integration_connections")
      .update({ health_score: input.score, last_validated_at: new Date().toISOString() } as never)
      .eq("id", connectionId) as never;
  }

  async function getHealthHistory(connectionId: string, limit = 20): Promise<IntegrationHealth[]> {
    const { data } = await client()
      .from("integration_health")
      .select("*")
      .eq("connection_id", connectionId)
      .order("checked_at", { ascending: false })
      .limit(limit);

    return ((data ?? []) as Record<string, unknown>[]).map(mapHealthRow);
  }

  // Logs
  async function log(connectionId: string, level: LogLevel, message: string, details?: Record<string, unknown>): Promise<void> {
    await client()
      .from("integration_logs")
      .insert({
        connection_id: connectionId,
        level,
        message,
        details: details ?? {},
      } as never) as never;
  }

  async function getLogs(connectionId: string, limit = 50): Promise<IntegrationLog[]> {
    const { data } = await client()
      .from("integration_logs")
      .select("*")
      .eq("connection_id", connectionId)
      .order("created_at", { ascending: false })
      .limit(limit);

    return ((data ?? []) as Record<string, unknown>[]).map(mapLogRow);
  }

  // Validations
  async function recordValidation(connectionId: string, input: {
    validationType: string;
    result: ValidationResult;
    message?: string;
    details?: Record<string, unknown>;
  }): Promise<void> {
    await client()
      .from("integration_validations")
      .insert({
        connection_id: connectionId,
        validation_type: input.validationType,
        result: input.result,
        message: input.message ?? null,
        details: input.details ?? {},
      } as never) as never;
  }

  async function getValidations(connectionId: string, limit = 50): Promise<IntegrationValidation[]> {
    const { data } = await client()
      .from("integration_validations")
      .select("*")
      .eq("connection_id", connectionId)
      .order("created_at", { ascending: false })
      .limit(limit);

    return ((data ?? []) as Record<string, unknown>[]).map(mapValidationRow);
  }

  return {
    getConnections, getConnection, createConnection, updateConnection, deleteConnection,
    recordHealth, getHealthHistory,
    log, getLogs,
    recordValidation, getValidations,
  };
}

function mapConnectionRow(row: Record<string, unknown>): IntegrationConnection {
  return {
    id: row.id as string,
    hackathonId: row.hackathon_id as string,
    integrationType: row.integration_type as IntegrationType,
    label: row.label as string,
    authMethod: row.auth_method as AuthMethod,
    status: row.status as ConnectionStatus,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    enabledFeatures: (row.enabled_features as Record<string, boolean>) ?? {},
    healthScore: (row.health_score as number) ?? 0,
    lastValidatedAt: row.last_validated_at as string | null,
    lastSyncedAt: row.last_synced_at as string | null,
    version: (row.version as string) ?? "1.0.0",
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapHealthRow(row: Record<string, unknown>): IntegrationHealth {
  return {
    id: row.id as string,
    connectionId: row.connection_id as string,
    status: row.status as HealthStatus,
    score: (row.score as number) ?? 0,
    checks: (row.checks as Record<string, unknown>) ?? {},
    details: (row.details as Record<string, unknown>) ?? {},
    checkedAt: row.checked_at as string,
  };
}

function mapLogRow(row: Record<string, unknown>): IntegrationLog {
  return {
    id: row.id as string,
    connectionId: row.connection_id as string,
    level: row.level as LogLevel,
    message: row.message as string,
    details: (row.details as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  };
}

function mapValidationRow(row: Record<string, unknown>): IntegrationValidation {
  return {
    id: row.id as string,
    connectionId: row.connection_id as string,
    validationType: row.validation_type as string,
    result: row.result as ValidationResult,
    message: row.message as string | null,
    details: (row.details as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  };
}
