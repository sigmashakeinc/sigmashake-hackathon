import { getSupabaseServerClient } from "@/services/supabase";
import type { HackathonEvent } from "./types";

function mapEvent(d: Record<string, unknown>): HackathonEvent {
  return {
    id: String(d.id ?? ""), name: String(d.name ?? ""), slug: String(d.slug ?? ""),
    organizer: String(d.organizer ?? ""), description: (d.description as string) ?? null,
    bannerUrl: (d.banner_url as string) ?? null, logoUrl: (d.logo_url as string) ?? null,
    websiteUrl: (d.website_url as string) ?? null, registrationUrl: (d.registration_url as string) ?? null,
    location: (d.location as string) ?? null, country: (d.country as string) ?? null,
    eventType: (d.event_type as HackathonEvent["eventType"]) ?? "online",
    difficulty: (d.difficulty as HackathonEvent["difficulty"]) ?? "all",
    prizePool: (d.prize_pool as string) ?? null, maxTeamSize: (d.max_team_size as number) ?? null,
    minTeamSize: Number(d.min_team_size ?? 1), timezone: String(d.timezone ?? "UTC"),
    startDate: (d.start_date as string) ?? null, endDate: (d.end_date as string) ?? null,
    registrationOpen: (d.registration_open as string) ?? null,
    registrationClose: (d.registration_close as string) ?? null,
    submissionDeadline: (d.submission_deadline as string) ?? null,
    tracks: (d.tracks as string[]) ?? null, technologies: (d.technologies as string[]) ?? null,
    rules: (d.rules as string) ?? null, eligibility: (d.eligibility as string) ?? null,
    judgingCriteria: (d.judging_criteria as string) ?? null, sponsors: (d.sponsors as string) ?? null,
    faq: (d.faq as Record<string, string>[]) ?? null, resources: (d.resources as string) ?? null,
    status: (d.status as HackathonEvent["status"]) ?? "upcoming", featured: Boolean(d.featured),
    tags: (d.tags as string[]) ?? null, ownerNotes: (d.owner_notes as string) ?? null,
    createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

export function createDiscoveryService() {
  const supabase = getSupabaseServerClient();

  return {
    async list() {
      const { data, error } = await supabase.from("hackathon_events").select("*").order("start_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []).map((r) => mapEvent(r as Record<string, unknown>));
    },

    async getBySlug(slug: string) {
      const { data, error } = await supabase.from("hackathon_events").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data ? mapEvent(data as Record<string, unknown>) : null;
    },

    async getFeatured() {
      const { data, error } = await supabase.from("hackathon_events").select("*").eq("featured", true).order("start_date").limit(6);
      if (error) throw error;
      return (data ?? []).map((r) => mapEvent(r as Record<string, unknown>));
    },

    async getPipeline(userId: string) {
      const { data, error } = await supabase.from("event_pipeline").select("*, hackathon_events(*)").eq("user_id", userId).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: Record<string, unknown>) => {
        const event = mapEvent((r.hackathon_events ?? {}) as Record<string, unknown>);
        event.pipelineStatus = r.status as HackathonEvent["pipelineStatus"];
        return event;
      });
    },

    async setPipelineStatus(eventId: string, userId: string, status: string) {
      const { error } = await supabase.from("event_pipeline").upsert({ event_id: eventId, user_id: userId, status } as never, { onConflict: "event_id,user_id" });
      if (error) throw error;
    },

    async updateOwnerNote(eventId: string, notes: string) {
      const { error } = await supabase.from("hackathon_events").update({ owner_notes: notes } as never).eq("id", eventId);
      if (error) throw error;
    },
  };
}
