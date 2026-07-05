import { getSupabaseServerClient } from "@/services/supabase";
import {
  slugify,
  type Hackathon,
  type HackathonInput,
  type HackathonStatus,
} from "./types";

function mapRow(row: Record<string, unknown>): Hackathon {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    organizer: String(row.organizer ?? ""),
    location: (row.location as string) ?? null,
    startDate: (row.start_date as string) ?? null,
    endDate: (row.end_date as string) ?? null,
    submissionDeadline: (row.submission_deadline as string) ?? null,
    timezone: String(row.timezone ?? "UTC"),
    website: (row.website as string) ?? null,
    devpostUrl: (row.devpost_url as string) ?? null,
    description: (row.description as string) ?? null,
    logoUrl: (row.logo_url as string) ?? null,
    bannerUrl: (row.banner_url as string) ?? null,
    status: (row.status as HackathonStatus) ?? "draft",
    rules: (row.rules as string) ?? null,
    prizes: (row.prizes as string) ?? null,
    tracks: (row.tracks as string) ?? null,
    sponsors: (row.sponsors as string) ?? null,
    submissionRequirements: (row.submission_requirements as string) ?? null,
    importantLinks: (row.important_links as string) ?? null,
    resources: (row.resources as string) ?? null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function toDb(input: HackathonInput): Record<string, unknown> {
  return {
    name: input.name,
    slug: slugify(input.name),
    organizer: input.organizer,
    location: input.location ?? null,
    start_date: input.startDate ?? null,
    end_date: input.endDate ?? null,
    submission_deadline: input.submissionDeadline ?? null,
    timezone: input.timezone ?? "UTC",
    website: input.website ?? null,
    devpost_url: input.devpostUrl ?? null,
    description: input.description ?? null,
    logo_url: input.logoUrl ?? null,
    banner_url: input.bannerUrl ?? null,
    status: input.status ?? "draft",
    rules: input.rules ?? null,
    prizes: input.prizes ?? null,
    tracks: input.tracks ?? null,
    sponsors: input.sponsors ?? null,
    submission_requirements: input.submissionRequirements ?? null,
    important_links: input.importantLinks ?? null,
    resources: input.resources ?? null,
  };
}

export function createHackathonService() {
  const supabase = getSupabaseServerClient();

  return {
    async list(status?: HackathonStatus): Promise<Hackathon[]> {
      let query = supabase
        .from("hackathons")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((r) =>
        mapRow(r as unknown as Record<string, unknown>),
      );
    },

    async getActive(): Promise<Hackathon | null> {
      const { data, error } = await supabase
        .from("hackathons")
        .select("*")
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return data ? mapRow(data as unknown as Record<string, unknown>) : null;
    },

    async getById(id: string): Promise<Hackathon | null> {
      const { data, error } = await supabase
        .from("hackathons")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapRow(data as unknown as Record<string, unknown>) : null;
    },

    async create(input: HackathonInput): Promise<Hackathon> {
      const dbData = toDb(input);
      const { data, error } = await supabase
        .from("hackathons")
        .insert(dbData as never)
        .select()
        .single();

      if (error) throw error;
      return mapRow(data as unknown as Record<string, unknown>);
    },

    async update(
      id: string,
      input: Partial<HackathonInput>,
    ): Promise<Hackathon> {
      const dbData = input.name
        ? { ...toDb(input as HackathonInput), slug: slugify(input.name) }
        : toDb(input as HackathonInput);

      const { data, error } = await supabase
        .from("hackathons")
        .update(dbData as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return mapRow(data as unknown as Record<string, unknown>);
    },

    async setStatus(id: string, status: HackathonStatus): Promise<void> {
      const { error } = await supabase
        .from("hackathons")
        .update({ status } as never)
        .eq("id", id);

      if (error) throw error;
    },

    async archive(id: string): Promise<void> {
      await this.setStatus(id, "archived");
    },

    async activate(id: string): Promise<void> {
      const { error } = await supabase.rpc(
        "activate_hackathon" as never,
        {
          hackathon_id: id,
        } as never,
      );
      if (error) throw error;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase.from("hackathons").delete().eq("id", id);
      if (error) throw error;
    },
  };
}
