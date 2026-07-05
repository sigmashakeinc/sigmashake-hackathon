import { getSupabaseServerClient } from "@/services/supabase";
import type { Invitation, InvitationRole, InvitationStatus } from "./types";

function mapRow(row: Record<string, unknown>): Invitation {
  return {
    id: String(row.id ?? ""),
    hackathonId: String(row.hackathon_id ?? ""),
    token: String(row.token ?? ""),
    code: String(row.code ?? ""),
    role: (row.role as InvitationRole) ?? "member",
    status: (row.status as InvitationStatus) ?? "pending",
    maxUses: Number(row.max_uses ?? 1),
    currentUses: Number(row.current_uses ?? 0),
    expiresAt: (row.expires_at as string) ?? null,
    createdBy: String(row.created_by ?? ""),
    createdAt: String(row.created_at ?? ""),
    revokedAt: (row.revoked_at as string) ?? null,
    revokedBy: (row.revoked_by as string) ?? null,
    lastUsedAt: (row.last_used_at as string) ?? null,
    notes: (row.notes as string) ?? null,
  };
}

export function createInvitationService() {
  const supabase = getSupabaseServerClient();

  return {
    async list(hackathonId: string): Promise<Invitation[]> {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("hackathon_id", hackathonId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) =>
        mapRow(r as unknown as Record<string, unknown>),
      );
    },

    async getById(id: string): Promise<Invitation | null> {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapRow(data as unknown as Record<string, unknown>) : null;
    },

    async getByToken(token: string): Promise<Invitation | null> {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .maybeSingle();
      if (error) throw error;
      return data ? mapRow(data as unknown as Record<string, unknown>) : null;
    },

    async getByCode(code: string): Promise<Invitation | null> {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("code", code)
        .maybeSingle();
      if (error) throw error;
      return data ? mapRow(data as unknown as Record<string, unknown>) : null;
    },

    async create(input: {
      hackathonId: string;
      role: InvitationRole;
      maxUses: number;
      expiresAt: string | null;
      createdBy: string;
      notes?: string;
    }): Promise<Invitation> {
      const { data, error } = await supabase
        .from("invitations")
        .insert({
          hackathon_id: input.hackathonId,
          role: input.role,
          max_uses: input.maxUses,
          expires_at: input.expiresAt,
          created_by: input.createdBy,
          notes: input.notes ?? null,
          status: "active",
        } as never)
        .select()
        .single();
      if (error) throw error;
      return mapRow(data as unknown as Record<string, unknown>);
    },

    async revoke(id: string, revokedBy: string): Promise<void> {
      const { error } = await supabase
        .from("invitations")
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
          revoked_by: revokedBy,
        } as never)
        .eq("id", id);
      if (error) throw error;
    },

    async disable(id: string): Promise<void> {
      const { error } = await supabase
        .from("invitations")
        .update({ status: "disabled" } as never)
        .eq("id", id);
      if (error) throw error;
    },

    async enable(id: string): Promise<void> {
      const { error } = await supabase
        .from("invitations")
        .update({ status: "active" } as never)
        .eq("id", id);
      if (error) throw error;
    },

    async validate(tokenOrCode: string): Promise<{
      valid: boolean;
      invitation?: Invitation;
      error?: string;
    }> {
      const inv =
        (await this.getByToken(tokenOrCode)) ??
        (await this.getByCode(tokenOrCode));

      if (!inv) return { valid: false, error: "Invitation not found." };

      if (inv.status === "revoked")
        return { valid: false, error: "This invitation has been revoked." };
      if (inv.status === "disabled")
        return { valid: false, error: "This invitation is disabled." };
      if (inv.status === "used")
        return {
          valid: false,
          error: "This invitation has already been used.",
        };
      if (inv.status === "expired")
        return { valid: false, error: "This invitation has expired." };
      if (inv.currentUses >= inv.maxUses)
        return {
          valid: false,
          error: "This invitation has reached its maximum uses.",
        };
      if (inv.expiresAt && new Date(inv.expiresAt) < new Date())
        return { valid: false, error: "This invitation has expired." };

      return { valid: true, invitation: inv };
    },

    async consume(id: string): Promise<void> {
      const { error } = await supabase.rpc(
        "consume_invitation" as never,
        {
          invitation_id: id,
        } as never,
      );
      if (error) throw error;
    },
  };
}
