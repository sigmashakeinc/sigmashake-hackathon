"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHackathon } from "@/core/hackathon";
import { createPlanningService, type PlanningCounts } from "@/core/planning";

const sections = [
  { key: "objectives", label: "Objectives", icon: "track_changes", color: "text-[#3fb950]" },
  { key: "milestones", label: "Milestones", icon: "flag", color: "text-primary" },
  { key: "deliverables", label: "Deliverables", icon: "inventory_2", color: "text-[#d29922]" },
  { key: "requirements", label: "Requirements", icon: "checklist", color: "text-on-surface" },
  { key: "risks", label: "Risks", icon: "warning", color: "text-error" },
  { key: "decisions", label: "Decisions", icon: "account_balance", color: "text-[#3fb950]" },
  { key: "checklists", label: "Checklists", icon: "playlist_add_check", color: "text-primary" },
  { key: "notes", label: "Notes", icon: "note", color: "text-on-surface" },
];

function SectionView({ hackathonId, section }: { hackathonId: string; section: string }) {
  const [items, setItems] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");

  const srv = createPlanningService();

  useEffect(() => {
    setIsLoading(true);
    const loaders: Record<string, () => Promise<unknown>> = {
      objectives: () => srv.listObjectives(hackathonId),
      milestones: () => srv.listMilestones(hackathonId),
      deliverables: () => srv.listDeliverables(hackathonId),
      requirements: () => srv.listRequirements(hackathonId),
      risks: () => srv.listRisks(hackathonId),
      decisions: () => srv.listDecisions(hackathonId),
      checklists: () => srv.listChecklists(hackathonId),
      notes: () => srv.listNotes(hackathonId),
    };
    const loader = loaders[section];
    Promise.resolve(loader ? loader().then((r) => setItems(r as unknown[])) : undefined).catch((err) => console.error("[Page] error:", err)).finally(() => setIsLoading(false));
  }, [hackathonId, section]);

  async function handleAdd() {
    if (!newTitle.trim()) return;
    try {
      if (section === "objectives") {
        await srv.createObjective(hackathonId, { title: newTitle.trim() });
      }
      setNewTitle("");
      const loaders: Record<string, () => Promise<unknown>> = {
        objectives: () => srv.listObjectives(hackathonId),
        milestones: () => srv.listMilestones(hackathonId),
        deliverables: () => srv.listDeliverables(hackathonId),
        requirements: () => srv.listRequirements(hackathonId),
        risks: () => srv.listRisks(hackathonId),
        decisions: () => srv.listDecisions(hackathonId),
        checklists: () => srv.listChecklists(hackathonId),
        notes: () => srv.listNotes(hackathonId),
      };
      await Promise.resolve(loaders[section]?.().then((r) => setItems(r as unknown[])));
    } catch { /* ignore */ }
  }

  async function handleToggle(id: string, checked: boolean) {
    await srv.toggleChecklistItem(id, checked);
    const data = await srv.listChecklists(hackathonId);
    setItems(data);
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-lg">
      <div className="flex items-center gap-sm">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
      </div>
    </div>;
  }

  if (items.length === 0) {
    return <div className="flex flex-col items-center gap-sm py-lg text-center">
      <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30">
        {section === "objectives" ? "track_changes" : section === "milestones" ? "flag" : section === "deliverables" ? "inventory_2" : section === "risks" ? "warning" : section === "decisions" ? "account_balance" : section === "checklists" ? "playlist_add_check" : "note"}
      </span>
      <p className="text-body-sm text-on-surface-variant">No {section} yet. Add the first one to get started.</p>
      <div className="flex gap-sm">
        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
          placeholder={`New ${section.slice(0, -1)}...`}
          className="w-64 rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
        <button type="button" onClick={handleAdd}
          className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">Add</button>
      </div>
    </div>;
  }

  return (
    <div className="flex flex-col gap-sm">
      <div className="mb-md flex gap-sm">
        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
          placeholder={`New ${section.slice(0, -1)}...`}
          className="flex-1 rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
        <button type="button" onClick={handleAdd}
          className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">Add</button>
      </div>

      {section === "checklists" ? (
        (items as unknown as { id: string; name: string; items?: { id: string; label: string; checked: boolean }[] }[]).map((t) => (
          <div key={t.id} className="rounded border border-outline-variant/30 bg-surface-container-low p-md">
            <p className="mb-sm text-body-sm font-medium text-on-surface">{t.name}</p>
            {t.items?.map((item) => (
              <label key={item.id} className="flex cursor-pointer items-center gap-sm py-xs">
                <input type="checkbox" checked={item.checked} onChange={() => handleToggle(item.id, !item.checked)}
                  className="h-4 w-4 rounded-[2px] border border-outline-variant bg-black text-primary focus:ring-1 focus:ring-primary focus:ring-offset-0 focus:outline-none" />
                <span className={`text-body-sm ${item.checked ? "text-on-surface-variant line-through" : "text-on-surface"}`}>{item.label}</span>
              </label>
            ))}
          </div>
        ))
      ) : (
        (items as { id: string; title?: string; name?: string; risk?: string; status?: string; priority?: string }[]).map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded border border-outline-variant/30 bg-surface-container-low px-lg py-md">
            <div>
              <p className="text-body-sm font-medium text-on-surface">{item.title ?? item.name ?? item.risk}</p>
              <div className="mt-xs flex gap-sm font-mono text-[10px] text-on-surface-variant">
                {item.status && <span>{item.status}</span>}
                {item.priority && <span>{item.priority}</span>}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function PlanningPage() {
  const router = useRouter();
  const { activeHackathon } = useHackathon();
  const [counts, setCounts] = useState<PlanningCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!activeHackathon) return;
    setIsLoading(true);
    createPlanningService()
      .getCounts(activeHackathon.id)
      .then(setCounts)
      .catch((err) => console.error("[Page] error:", err))
      .finally(() => setIsLoading(false));
  }, [activeHackathon]);

  if (!activeHackathon) {
    router.replace("/app");
    return null;
  }

  return (
    <div className="p-lg">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-lg">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">Planning</h1>
          <p className="font-mono text-[11px] text-on-surface-variant">
            Plan your hackathon — objectives, milestones, deliverables, and more
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-xl">
            <div className="flex items-center gap-sm">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
            </div>
          </div>
        ) : (
          <>
            {counts && (
              <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 lg:grid-cols-5">
                {sections.map((s) => {
                  const sub =
                    s.key === "objectives" ? `${counts.objectives.completed}/${counts.objectives.total}`
                    : s.key === "milestones" ? `${counts.milestones.completed}/${counts.milestones.total}`
                    : s.key === "deliverables" ? `${counts.deliverables.completed}/${counts.deliverables.total}`
                    : s.key === "risks" ? `${counts.risks.active} active`
                    : s.key === "decisions" ? `${counts.decisions.accepted} accepted`
                    : "";
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setActiveTab(s.key)}
                      className={`flex flex-col items-start gap-sm rounded border p-md text-left transition-colors ${
                        activeTab === s.key
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant/30 bg-surface-container-low hover:bg-surface-container"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[24px] ${s.color}`}>{s.icon}</span>
                      <span className="text-body-sm font-medium text-on-surface">{s.label}</span>
                      {sub && <span className="font-mono text-[10px] text-on-surface-variant">{sub}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
              {activeTab === "overview" && (
                <div className="flex flex-col items-center gap-sm py-lg text-center">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">map</span>
                  <p className="text-body-sm text-on-surface-variant">
                    Select a section above to start planning your hackathon.
                  </p>
                </div>
              )}
              {activeTab !== "overview" && (
                <SectionView hackathonId={activeHackathon.id} section={activeTab} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
