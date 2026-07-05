"use client";

import { useEffect, useState } from "react";
import { createAdminService, type MembersOverview } from "@/core/admin";
import { AdminTable, type Column } from "@/components/admin/admin-table";
import { useAuth } from "@/identity";

export default function AdminMembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<MembersOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createAdminService().listMembers()
      .then(setMembers)
      .catch((err) => console.error("[Page] error:", err))
      .finally(() => setLoading(false));
  }, []);

  async function handleDeactivate(id: string) {
    if (!user || !confirm("Deactivate this member?")) return;
    await createAdminService().deactivateMember(id, user.id);
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, active: false } : m));
  }

  async function handleReactivate(id: string) {
    if (!user) return;
    await createAdminService().reactivateMember(id, user.id);
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, active: true } : m));
  }

  const columns: Column<MembersOverview>[] = [
    {
      key: "name", label: "Name",
      render: (m) => (
        <div className="flex items-center gap-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-variant font-mono text-[9px] text-on-surface-variant">
            {m.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-body-sm font-medium text-on-surface">{m.displayName}</p>
            <p className="font-mono text-[9px] text-on-surface-variant">@{m.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role", label: "Role",
      render: (m) => (
        <span className={`font-mono text-[9px] ${m.role === "owner" ? "text-primary" : "text-on-surface-variant"}`}>
          {m.role}
        </span>
      ),
    },
    {
      key: "github", label: "GitHub",
      render: (m) => (
        <span className={`font-mono text-[9px] ${m.githubConnected ? "text-[#3fb950]" : "text-on-surface-variant/50"}`}>
          {m.githubConnected ? "Connected" : "—"}
        </span>
      ),
    },
    {
      key: "status", label: "Status",
      render: (m) => (
        <span className={`font-mono text-[9px] ${m.active ? "text-[#3fb950]" : "text-error"}`}>
          {m.active ? "Active" : "Deactivated"}
        </span>
      ),
    },
    {
      key: "joined", label: "Joined",
      render: (m) => (
        <span className="font-mono text-[9px] text-on-surface-variant">
          {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "actions", label: "",
      render: (m) => (
        <div className="flex items-center gap-xs">
          {m.active
            ? <button type="button" onClick={() => handleDeactivate(m.id)}
                className="font-mono text-[9px] text-error hover:underline">Deactivate</button>
            : <button type="button" onClick={() => handleReactivate(m.id)}
                className="font-mono text-[9px] text-[#3fb950] hover:underline">Reactivate</button>
          }
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-sm">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Members ({members.length})</h1>
      <div className="rounded border border-outline-variant/30 bg-surface-container-low">
        <AdminTable columns={columns} data={members} keyExtractor={(m) => m.id} emptyMessage="No members found." />
      </div>
    </div>
  );
}
