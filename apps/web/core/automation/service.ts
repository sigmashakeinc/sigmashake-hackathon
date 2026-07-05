import { getSupabaseServerClient } from "@/services/supabase";
import type { AutomationRule, AutomationTemplate, AutomationRun, AutomationLog, TriggerType, ActionType, RuleMode, RunStatus, LogLevel } from "./types";

export function createAutomationService() {
  function client() {
    return getSupabaseServerClient();
  }

  // Rules
  async function listRules(hackathonId: string): Promise<AutomationRule[]> {
    const { data } = await client()
      .from("automation_rules")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .order("sort_order")
      .order("created_at", { ascending: false });

    return ((data ?? []) as Record<string, unknown>[]).map(mapRuleRow);
  }

  async function getRule(id: string): Promise<AutomationRule | null> {
    const { data } = await client()
      .from("automation_rules")
      .select("*")
      .eq("id", id)
      .single();

    return data ? mapRuleRow(data as Record<string, unknown>) : null;
  }

  async function createRule(input: {
    hackathonId: string;
    name: string;
    description?: string;
    triggerType: TriggerType;
    actionType: ActionType;
    triggerConfig?: Record<string, unknown>;
    actionConfig?: Record<string, unknown>;
    mode?: RuleMode;
  }): Promise<AutomationRule> {
    const { data } = await client()
      .from("automation_rules")
      .insert({
        hackathon_id: input.hackathonId,
        name: input.name,
        description: input.description ?? null,
        trigger_type: input.triggerType,
        action_type: input.actionType,
        trigger_config: input.triggerConfig ?? {},
        action_config: input.actionConfig ?? {},
        mode: input.mode ?? "automatic",
      } as never)
      .select()
      .single() as never;

    return data as unknown as AutomationRule;
  }

  async function updateRule(id: string, input: Partial<AutomationRule>): Promise<void> {
    await client()
      .from("automation_rules")
      .update(input as never)
      .eq("id", id) as never;
  }

  async function deleteRule(id: string): Promise<void> {
    await client()
      .from("automation_rules")
      .delete()
      .eq("id", id) as never;
  }

  async function toggleRule(id: string, enabled: boolean): Promise<void> {
    await client()
      .from("automation_rules")
      .update({ enabled } as never)
      .eq("id", id) as never;
  }

  // Templates
  async function listTemplates(): Promise<AutomationTemplate[]> {
    const { data } = await client()
      .from("automation_templates")
      .select("*")
      .order("sort_order");

    return ((data ?? []) as Record<string, unknown>[]).map(mapTemplateRow);
  }

  // Runs
  async function listRuns(hackathonId: string, limit = 50): Promise<AutomationRun[]> {
    const { data } = await client()
      .from("automation_runs")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .order("created_at", { ascending: false })
      .limit(limit);

    return ((data ?? []) as Record<string, unknown>[]).map(mapRunRow);
  }

  async function recordRun(input: {
    ruleId: string;
    hackathonId: string;
    triggerType: TriggerType;
    actionType: ActionType;
    status: RunStatus;
    triggerData?: Record<string, unknown>;
    result?: Record<string, unknown>;
    error?: string;
    durationMs?: number;
  }): Promise<AutomationRun> {
    const { data } = await client()
      .from("automation_runs")
      .insert({
        rule_id: input.ruleId,
        hackathon_id: input.hackathonId,
        trigger_type: input.triggerType,
        action_type: input.actionType,
        status: input.status,
        trigger_data: input.triggerData ?? null,
        result: input.result ?? null,
        error_message: input.error ?? null,
        started_at: new Date().toISOString(),
        completed_at: input.status !== "running" ? new Date().toISOString() : null,
        duration_ms: input.durationMs ?? null,
      } as never)
      .select()
      .single() as never;

    return data as unknown as AutomationRun;
  }

  // Logs
  async function listLogs(ruleId: string, limit = 50): Promise<AutomationLog[]> {
    const { data } = await client()
      .from("automation_logs")
      .select("*")
      .eq("rule_id", ruleId)
      .order("created_at", { ascending: false })
      .limit(limit);

    return ((data ?? []) as Record<string, unknown>[]).map(mapLogRow);
  }

  function getRecentRuns(hackathonId: string, limit = 10): Promise<AutomationRun[]> {
    return listRuns(hackathonId, limit);
  }

  // Execute a rule manually
  async function executeRule(ruleId: string, hackathonId: string): Promise<AutomationRun | null> {
    const rule = await getRule(ruleId);
    if (!rule) return null;

    const startTime = Date.now();
    let status: RunStatus = "completed";
    let error: string | undefined;
    let result: Record<string, unknown> | undefined;

    try {
      switch (rule.actionType) {
        case "create_notification":
          result = { notified: true };
          break;
        case "create_activity":
          result = { logged: true };
          break;
        case "create_task":
          result = { task_created: true };
          break;
        case "create_note":
          result = { note_created: true };
          break;
        default:
          result = { executed: true };
      }
    } catch (e) {
      status = "failed";
      error = (e as Error).message;
    }

    const run = await recordRun({
      ruleId: rule.id,
      hackathonId,
      triggerType: rule.triggerType,
      actionType: rule.actionType,
      status,
      triggerData: { manual: true },
      result,
      error,
      durationMs: Date.now() - startTime,
    });

    await client()
      .from("automation_rules")
      .update({
        run_count: rule.runCount + 1,
        last_run_at: new Date().toISOString(),
      } as never)
      .eq("id", ruleId) as never;

    return run;
  }

  return {
    listRules, getRule, createRule, updateRule, deleteRule, toggleRule,
    listTemplates,
    listRuns, recordRun,
    listLogs, getRecentRuns,
    executeRule,
  };
}

function mapRuleRow(row: Record<string, unknown>): AutomationRule {
  return {
    id: row.id as string,
    hackathonId: row.hackathon_id as string,
    name: row.name as string,
    description: row.description as string | null,
    triggerType: row.trigger_type as TriggerType,
    triggerConfig: (row.trigger_config as Record<string, unknown>) ?? {},
    actionType: row.action_type as ActionType,
    actionConfig: (row.action_config as Record<string, unknown>) ?? {},
    enabled: (row.enabled as boolean) ?? true,
    mode: (row.mode as RuleMode) ?? "automatic",
    runCount: (row.run_count as number) ?? 0,
    lastRunAt: row.last_run_at as string | null,
    sortOrder: (row.sort_order as number) ?? 0,
    createdBy: row.created_by as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapTemplateRow(row: Record<string, unknown>): AutomationTemplate {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | null,
    triggerType: row.trigger_type as TriggerType,
    triggerConfig: (row.trigger_config as Record<string, unknown>) ?? {},
    actionType: row.action_type as ActionType,
    actionConfig: (row.action_config as Record<string, unknown>) ?? {},
    category: row.category as string,
    builtIn: (row.built_in as boolean) ?? false,
    sortOrder: (row.sort_order as number) ?? 0,
    createdAt: row.created_at as string,
  };
}

function mapRunRow(row: Record<string, unknown>): AutomationRun {
  return {
    id: row.id as string,
    ruleId: row.rule_id as string,
    hackathonId: row.hackathon_id as string,
    triggerType: row.trigger_type as TriggerType,
    actionType: row.action_type as ActionType,
    status: row.status as RunStatus,
    triggerData: row.trigger_data as Record<string, unknown> | null,
    result: row.result as Record<string, unknown> | null,
    errorMessage: row.error_message as string | null,
    startedAt: row.started_at as string | null,
    completedAt: row.completed_at as string | null,
    durationMs: row.duration_ms as number | null,
    createdAt: row.created_at as string,
  };
}

function mapLogRow(row: Record<string, unknown>): AutomationLog {
  return {
    id: row.id as string,
    runId: row.run_id as string | null,
    ruleId: row.rule_id as string,
    level: row.level as LogLevel,
    message: row.message as string,
    details: (row.details as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  };
}
