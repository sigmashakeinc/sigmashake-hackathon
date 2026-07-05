import { getSupabaseServerClient } from "@/services/supabase";
import type { Relationship, RelationshipType, RelationshipNode, RelationshipEdge } from "./types";

function mapRow(d: Record<string, unknown>): Relationship {
  return {
    id: String(d.id ?? ""), hackathonId: (d.hackathon_id as string) ?? null,
    sourceModule: String(d.source_module ?? ""), sourceId: String(d.source_id ?? ""),
    targetModule: String(d.target_module ?? ""), targetId: String(d.target_id ?? ""),
    relationshipType: (d.relationship_type as RelationshipType) ?? "related",
    createdAt: String(d.created_at ?? ""),
  };
}

export function createRelationshipService() {
  const supabase = getSupabaseServerClient();

  return {
    async list(hackathonId: string) {
      const { data, error } = await supabase
        .from("relationships")
        .select("*")
        .or(`hackathon_id.eq.${hackathonId}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
    },

    async getForSource(module: string, id: string) {
      const { data, error } = await supabase
        .from("relationships")
        .select("*")
        .or(`source_module.eq.${module},source_id.eq.${id}`)
        .or(`target_module.eq.${module},target_id.eq.${id}`);
      if (error) throw error;
      return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
    },

    async create(input: {
      hackathonId?: string; sourceModule: string; sourceId: string;
      targetModule: string; targetId: string; relationshipType: RelationshipType;
    }) {
      const { error } = await supabase.from("relationships").upsert({
        hackathon_id: input.hackathonId ?? null,
        source_module: input.sourceModule, source_id: input.sourceId,
        target_module: input.targetModule, target_id: input.targetId,
        relationship_type: input.relationshipType,
      } as never, { onConflict: "source_module,source_id,target_module,target_id,relationship_type" });
      if (error) throw error;
    },

    async remove(id: string) {
      const { error } = await supabase.from("relationships").delete().eq("id", id);
      if (error) throw error;
    },

    async getGraph(hackathonId: string): Promise<{ nodes: RelationshipNode[]; edges: RelationshipEdge[] }> {
      const rels = await this.list(hackathonId);
      const seen = new Set<string>();
      const nodes: RelationshipNode[] = [];
      const edges: RelationshipEdge[] = [];

      for (const rel of rels) {
        const srcKey = `${rel.sourceModule}-${rel.sourceId}`;
        const tgtKey = `${rel.targetModule}-${rel.targetId}`;

        if (!seen.has(srcKey)) {
          seen.add(srcKey);
          nodes.push({ id: srcKey, module: rel.sourceModule, label: rel.sourceId.slice(0, 8), type: rel.sourceModule, x: 0, y: 0 });
        }
        if (!seen.has(tgtKey)) {
          seen.add(tgtKey);
          nodes.push({ id: tgtKey, module: rel.targetModule, label: rel.targetId.slice(0, 8), type: rel.targetModule, x: 0, y: 0 });
        }
        edges.push({ source: srcKey, target: tgtKey, type: rel.relationshipType });
      }

      // Layout: simple circle
      const centerX = 300, centerY = 300, radius = 200;
      nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / nodes.length;
        node.x = centerX + radius * Math.cos(angle);
        node.y = centerY + radius * Math.sin(angle);
      });

      return { nodes, edges };
    },
  };
}
