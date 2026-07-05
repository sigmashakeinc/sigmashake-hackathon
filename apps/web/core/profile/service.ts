import { getSupabaseServerClient } from "@/services/supabase";
import type { Profile, ProfileInput } from "./types";

function mapRow(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id ?? ""),
    displayName: String(row.display_name ?? ""),
    username: String(row.username ?? ""),
    email: String(row.email ?? ""),
    avatarUrl: (row.avatar_url as string) ?? null,
    bio: (row.bio as string) ?? null,
    timezone: String(row.timezone ?? "UTC"),
    country: (row.country as string) ?? null,
    pronouns: (row.pronouns as string) ?? null,
    githubUsername: (row.github_username as string) ?? null,
    discordUsername: (row.discord_username as string) ?? null,
    website: (row.website as string) ?? null,
    experienceLevel: (row.experience_level as Profile["experienceLevel"]) ?? null,
    status: (row.status as Profile["status"]) ?? "offline",
    lastActiveAt: (row.last_active_at as string) ?? null,
    onboarded: Boolean(row.onboarded),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export function createProfileService() {
  const supabase = getSupabaseServerClient();

  return {
    async getById(id: string): Promise<Profile | null> {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapRow(data as unknown as Record<string, unknown>) : null;
    },

    async create(id: string, input: ProfileInput): Promise<Profile> {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id,
          display_name: input.displayName,
          username: input.username,
          email: input.username,
          avatar_url: input.avatarUrl ?? null,
          bio: input.bio ?? null,
          timezone: input.timezone ?? "UTC",
          country: input.country ?? null,
          pronouns: input.pronouns ?? null,
          github_username: input.githubUsername ?? null,
          discord_username: input.discordUsername ?? null,
          website: input.website ?? null,
          experience_level: input.experienceLevel ?? null,
          onboarded: false,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return mapRow(data as unknown as Record<string, unknown>);
    },

    async update(id: string, input: Partial<ProfileInput & { onboarded?: boolean }>): Promise<Profile> {
      const dbData: Record<string, unknown> = {};
      if (input.displayName !== undefined) dbData.display_name = input.displayName;
      if (input.username !== undefined) dbData.username = input.username;
      if (input.avatarUrl !== undefined) dbData.avatar_url = input.avatarUrl;
      if (input.bio !== undefined) dbData.bio = input.bio;
      if (input.timezone !== undefined) dbData.timezone = input.timezone;
      if (input.country !== undefined) dbData.country = input.country;
      if (input.pronouns !== undefined) dbData.pronouns = input.pronouns;
      if (input.githubUsername !== undefined) dbData.github_username = input.githubUsername;
      if (input.discordUsername !== undefined) dbData.discord_username = input.discordUsername;
      if (input.website !== undefined) dbData.website = input.website;
      if (input.experienceLevel !== undefined) dbData.experience_level = input.experienceLevel;
      if (input.onboarded !== undefined) dbData.onboarded = input.onboarded;

      const { data, error } = await supabase
        .from("profiles")
        .update(dbData as never)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return mapRow(data as unknown as Record<string, unknown>);
    },

    async listByHackathon(hackathonId: string): Promise<(Profile & { role: string })[]> {
      const { data, error } = await supabase
        .from("team_members")
        .select("role, profiles(*)")
        .eq("hackathon_id", hackathonId)
        .is("deactivated_at", null)
        .order("joined_at", { ascending: true });

      if (error) throw error;
      return (data ?? []).map((r: Record<string, unknown>) => {
        const profile = mapRow((r.profiles ?? {}) as Record<string, unknown>);
        return { ...profile, role: String(r.role ?? "member") };
      });
    },

    async joinHackathon(profileId: string, hackathonId: string, role: string, invitedBy?: string): Promise<void> {
      const { error } = await supabase
        .from("team_members")
        .insert({
          hackathon_id: hackathonId,
          profile_id: profileId,
          role,
          invited_by: invitedBy ?? null,
        } as never);
      if (error) throw error;
    },

    async updateRole(profileId: string, hackathonId: string, role: string): Promise<void> {
      const { error } = await supabase
        .from("team_members")
        .update({ role } as never)
        .eq("profile_id", profileId)
        .eq("hackathon_id", hackathonId);
      if (error) throw error;
    },

    async deactivate(profileId: string, hackathonId: string): Promise<void> {
      const { error } = await supabase
        .from("team_members")
        .update({ deactivated_at: new Date().toISOString() } as never)
        .eq("profile_id", profileId)
        .eq("hackathon_id", hackathonId);
      if (error) throw error;
    },
  };
}
