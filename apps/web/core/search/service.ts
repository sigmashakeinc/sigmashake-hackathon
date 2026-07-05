import { createPlanningService } from "@/core/planning";
import { createIdeasService } from "@/core/ideas";
import { createResearchService } from "@/core/research";
import { createTaskService } from "@/core/tasks";
import type { SearchResult } from "./types";

export async function searchAll(hackathonId: string, query: string): Promise<SearchResult[]> {
  if (!query.trim() || query.length < 1) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  // Tasks
  try {
    const tasks = await createTaskService().list(hackathonId);
    tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 5).forEach((t) => {
      results.push({ id: t.id, title: t.title, subtitle: t.status, module: "tasks", icon: "checklist", href: "/app/tasks", type: "Task" });
    });
  } catch {}

  // Ideas
  try {
    const ideas = await createIdeasService().list(hackathonId);
    ideas.filter((i) => i.title.toLowerCase().includes(q) || i.summary?.toLowerCase().includes(q)).slice(0, 5).forEach((i) => {
      results.push({ id: i.id, title: i.title, subtitle: i.status, module: "ideas", icon: "lightbulb", href: "/app/ideas", type: "Idea" });
    });
  } catch {}

  // Research
  try {
    const items = await createResearchService().list(hackathonId);
    items.filter((r) => r.title.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q)).slice(0, 5).forEach((r) => {
      results.push({ id: r.id, title: r.title, subtitle: r.sourceType, module: "research", icon: "travel_explore", href: "/app/research", type: "Research" });
    });
  } catch {}

  // Planning
  try {
    const p = createPlanningService();
    const objectives = await p.listObjectives(hackathonId);
    objectives.filter((o) => o.title.toLowerCase().includes(q)).slice(0, 3).forEach((o) => {
      results.push({ id: o.id, title: o.title, subtitle: `Objective · ${o.status}`, module: "objectives", icon: "track_changes", href: "/app/planning", type: "Objective" });
    });
    const milestones = await p.listMilestones(hackathonId);
    milestones.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 3).forEach((m) => {
      results.push({ id: m.id, title: m.name, subtitle: `Milestone · ${m.status}`, module: "milestones", icon: "flag", href: "/app/planning", type: "Milestone" });
    });
  } catch {}

  return results.slice(0, 20);
}
