import { getSupabaseServerClient } from "@/services/supabase";
import type { ActivityEvent, ActivityInput } from "./types";

function mapEvent(d: Record<string, unknown>): ActivityEvent {
  return {
    id: String(d.id ?? ""), hackathonId: (d.hackathon_id as string) ?? null,
    eventType: String(d.event_type ?? ""), module: String(d.module ?? ""),
    title: String(d.title ?? ""), description: (d.description as string) ?? null,
    actor: (d.actor as string) ?? null, targetType: (d.target_type as string) ?? null,
    targetId: (d.target_id as string) ?? null,
    metadata: (d.metadata as Record<string, unknown>) ?? null,
    severity: (d.severity as ActivityEvent["severity"]) ?? "info",
    createdAt: String(d.created_at ?? ""),
  };
}

export function createActivityService() {
  const supabase = getSupabaseServerClient();

  return {
    async log(hackathonId: string | null, input: ActivityInput): Promise<void> {
      const { error } = await supabase.from("activity_events").insert({
        hackathon_id: hackathonId,
        event_type: input.eventType,
        module: input.module,
        title: input.title,
        description: input.description,
        actor: input.actor,
        target_type: input.targetType,
        target_id: input.targetId,
        metadata: input.metadata,
        severity: input.severity ?? "info",
      } as never);
      if (error) console.error("[Activity] log error:", error);
    },

    async list(hackathonId: string, limit = 20): Promise<ActivityEvent[]> {
      const { data, error } = await supabase
        .from("activity_events")
        .select("*")
        .eq("hackathon_id", hackathonId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((r) => mapEvent(r as Record<string, unknown>));
    },

    async listByModule(hackathonId: string, module: string, limit = 10): Promise<ActivityEvent[]> {
      const { data, error } = await supabase
        .from("activity_events")
        .select("*")
        .eq("hackathon_id", hackathonId)
        .eq("module", module)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((r) => mapEvent(r as Record<string, unknown>));
    },
  };
}
