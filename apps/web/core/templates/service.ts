import { getSupabaseServerClient } from "@/services/supabase";
import { createPlanningService } from "@/core/planning";
import { createSubmissionService } from "@/core/submission";
import { BUILT_IN_TEMPLATES, type WorkspaceTemplate, type TemplateConfig } from "./types";

function mapRow(d: Record<string, unknown>): WorkspaceTemplate {
  return {
    id: String(d.id ?? ""), name: String(d.name ?? ""), slug: String(d.slug ?? ""),
    description: (d.description as string) ?? null,
    category: (d.category as WorkspaceTemplate["category"]) ?? "general",
    tags: (d.tags as string[]) ?? null, featured: Boolean(d.featured),
    builtIn: Boolean(d.built_in),
    config: (d.config as TemplateConfig) ?? {},
    usageCount: Number(d.usage_count ?? 0),
  };
}

export function createTemplateService() {
  const supabase = getSupabaseServerClient();

  return {
    async list() {
      const { data, error } = await supabase.from("workspace_templates").select("*").order("name");
      if (error) throw error;
      const custom = (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
      return [...BUILT_IN_TEMPLATES.map((t) => ({ ...t, id: t.id ?? t.slug, builtIn: true })) as WorkspaceTemplate[], ...custom];
    },

    async getById(id: string) {
      const builtIn = BUILT_IN_TEMPLATES.find((t) => t.id === id || t.slug === id);
      if (builtIn) return { ...builtIn, id: builtIn.id ?? builtIn.slug, builtIn: true } as WorkspaceTemplate;
      const { data, error } = await supabase.from("workspace_templates").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? mapRow(data as Record<string, unknown>) : null;
    },
  };
}

export async function createWorkspaceFromTemplate(
  hackathonId: string,
  template: WorkspaceTemplate,
): Promise<void> {
  const config = template.config;
  if (!config.sections || config.sections.length === 0) return;

  const planning = createPlanningService();

  if (config.sections.includes("objectives") && template.name) {
    await planning.createObjective(hackathonId, {
      title: `Complete ${template.name}`,
      description: "Primary objective for this hackathon",
      priority: "high", status: "active",
    });
  }

  if (config.sections.includes("deliverables") && config.deliverables) {
    const subSvc = createSubmissionService();
    const existing = await subSvc.get(hackathonId);
    if (!existing) {
      await subSvc.create(hackathonId, `${template.name} Workspace`);
    }
  }
}
