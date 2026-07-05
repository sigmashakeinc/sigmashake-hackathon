import { getSupabaseServerClient } from "@/services/supabase";
import type { Notification } from "./types";

function mapRow(d: Record<string, unknown>): Notification {
  return {
    id: String(d.id ?? ""), hackathonId: (d.hackathon_id as string) ?? null,
    userId: String(d.user_id ?? ""), type: String(d.type ?? ""),
    title: String(d.title ?? ""), message: (d.message as string) ?? null,
    module: (d.module as string) ?? null, link: (d.link as string) ?? null,
    read: Boolean(d.read), archived: Boolean(d.archived),
    metadata: (d.metadata as Record<string, unknown>) ?? null,
    createdAt: String(d.created_at ?? ""),
  };
}

export function createNotificationService() {
  const supabase = getSupabaseServerClient();

  return {
    async list(userId: string, includeArchived = false) {
      let q = supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
      if (!includeArchived) q = q.eq("archived", false);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
    },

    async getUnreadCount(userId: string) {
      const { count, error } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("read", false);
      if (error) throw error;
      return count ?? 0;
    },

    async markAsRead(id: string) {
      const { error } = await supabase.from("notifications").update({ read: true } as never).eq("id", id);
      if (error) throw error;
    },

    async markAllAsRead(userId: string) {
      const { error } = await supabase.from("notifications").update({ read: true } as never).eq("user_id", userId).eq("read", false);
      if (error) throw error;
    },

    async archive(id: string) {
      const { error } = await supabase.from("notifications").update({ archived: true } as never).eq("id", id);
      if (error) throw error;
    },

    async create(input: Omit<Notification, "id" | "createdAt" | "read" | "archived">) {
      const { error } = await supabase.from("notifications").insert({
        hackathon_id: input.hackathonId, user_id: input.userId, type: input.type,
        title: input.title, message: input.message, module: input.module,
        link: input.link, metadata: input.metadata,
      } as never);
      if (error) console.error("[Notifications] create error:", error);
    },

    async bulkCreate(inputs: Omit<Notification, "id" | "createdAt" | "read" | "archived">[]) {
      const { error } = await supabase.from("notifications").insert(
        inputs.map((i) => ({
          hackathon_id: i.hackathonId, user_id: i.userId, type: i.type,
          title: i.title, message: i.message, module: i.module,
          link: i.link, metadata: i.metadata,
        })) as never,
      );
      if (error) console.error("[Notifications] bulk create error:", error);
    },

    async getPreferences(userId: string) {
      const { data, error } = await supabase.from("notification_preferences").select("preferences").eq("user_id", userId).maybeSingle();
      if (error) throw error;
      return data ? ((data as Record<string, unknown>).preferences as Record<string, boolean>) : {};
    },

    async setPreferences(userId: string, preferences: Record<string, boolean>) {
      const { error } = await supabase.from("notification_preferences").upsert(
        { user_id: userId, preferences } as never,
        { onConflict: "user_id" },
      );
      if (error) throw error;
    },
  };
}
