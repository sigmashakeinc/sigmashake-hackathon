"use client";

import { useEffect, useState } from "react";
import { createAdminService, type InvitationOverview } from "@/core/admin";
import { AdminTable, type Column } from "@/components/admin/admin-table";
import { useAuth } from "@/identity";

export default function AdminInvitationsPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<InvitationOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createAdminService().listInvitations()
      .then(setInvitations)
      .catch((err) => console.error("[Page] error:", err))
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    if (!user) return;
    const code = await createAdminService().generateInvitation({ adminId: user.id });
    setInvitations((prev) => [{
      id: crypto.randomUUID(), code, email: null, role: "member",
      uses: 0, maxUses: null, expiresAt: null, status: "active",
      createdBy: user.id, createdAt: new Date().toISOString(),
    }, ...prev]);
  }

  const columns: Column<InvitationOverview>[] = [
    {
      key: "code", label: "Code",
      render: (inv) => (
        <div>
          <p className="font-mono text-[11px] font-bold text-on-surface">{inv.code}</p>
          {inv.email && <p className="font-mono text-[9px] text-on-surface-variant">{inv.email}</p>}
        </div>
      ),
    },
    {
      key: "role", label: "Role",
      render: (inv) => <span className="font-mono text-[9px] text-on-surface-variant">{inv.role}</span>,
    },
    {
      key: "uses", label: "Uses",
      render: (inv) => <span className="font-mono text-[9px] text-on-surface-variant">{inv.uses}{inv.maxUses ? `/${inv.maxUses}` : ""}</span>,
    },
    {
      key: "status", label: "Status",
      render: (inv) => {
        const colors: Record<string, string> = { active: "text-[#3fb950]", expired: "text-[#d29922]", revoked: "text-error", used: "text-on-surface-variant/50" };
        return <span className={`font-mono text-[9px] ${colors[inv.status] ?? ""}`}>{inv.status}</span>;
      },
    },
    {
      key: "created", label: "Created",
      render: (inv) => <span className="font-mono text-[9px] text-on-surface-variant">{new Date(inv.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: "expires", label: "Expires",
      render: (inv) => <span className="font-mono text-[9px] text-on-surface-variant">{inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : "—"}</span>,
    },
    {
      key: "actions", label: "",
      render: (inv) => (
        <button type="button" onClick={() => { navigator.clipboard.writeText(inv.code); }}
          className="font-mono text-[9px] text-primary hover:underline">Copy</button>
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
      <div className="mb-lg flex items-center justify-between">
        <h1 className="text-h1 font-semibold text-on-surface">Invitations ({invitations.length})</h1>
        <button type="button" onClick={handleGenerate}
          className="flex items-center gap-xs rounded bg-primary px-sm py-xs text-body-xs font-medium text-on-primary transition-colors hover:bg-[#c01826]">
          <span className="material-symbols-outlined text-[14px]">add</span> Generate
        </button>
      </div>
      <div className="rounded border border-outline-variant/30 bg-surface-container-low">
        <AdminTable columns={columns} data={invitations} keyExtractor={(inv) => inv.id} emptyMessage="No invitations found." />
      </div>
    </div>
  );
}
