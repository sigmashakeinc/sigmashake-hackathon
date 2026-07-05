"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useHackathon } from "@/core/hackathon";
import { CardSkeleton } from "@/components/ui/page-skeleton";
import { createIdeasService, IDEA_CATEGORIES, IDEA_STATUSES, IDEA_PRIORITIES, type Idea, type IdeaPriority, type IdeaCategory } from "@/core/ideas";

const statusStyles: Record<string, string> = {
  draft: "bg-surface-container text-on-surface-variant border-surface-variant",
  open: "text-[#3fb950] border-[#3fb950]/30 bg-[#3fb950]/5",
  in_discussion: "text-[#d29922] border-[#d29922]/30 bg-[#d29922]/5",
  approved: "text-primary border-primary/30 bg-primary/5",
  rejected: "text-error border-error/30 bg-error/5",
  archived: "text-on-surface-variant border-surface-variant bg-surface-container",
  implemented: "text-[#3fb950] border-[#3fb950]/30 bg-[#3fb950]/10",
};

function IdeaCard({ idea, onVote, onPin, onArchive }: {
  idea: Idea; onVote: (i: Idea) => void; onPin: (id: string, pinned: boolean) => void;
  onArchive: (id: string, archived: boolean) => void;
}) {
  return (
    <div className={`rounded border ${idea.pinned ? "border-primary/40" : "border-outline-variant/30"} bg-surface-container-low p-md transition-colors hover:bg-surface-container`}>
      <div className="flex items-start gap-md">
        <button type="button" onClick={() => onVote(idea)}
          className="flex flex-col items-center gap-xs rounded px-sm py-xs text-on-surface-variant transition-colors hover:text-primary"
          aria-label={`Vote for ${idea.title}`}>
          <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
          <span className="font-mono text-[10px]">{idea.voteCount}</span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-sm">
            {idea.pinned && <span className="material-symbols-outlined text-[14px] text-primary">push_pin</span>}
            <span className={`rounded border px-xs py-[1px] font-mono text-[9px] ${statusStyles[idea.status] ?? statusStyles.draft}`}>
              {idea.status.replace("_", " ")}
            </span>
            <span className="font-mono text-[9px] text-on-surface-variant">{idea.category}{idea.customCategory ? ` (${idea.customCategory})` : ""}</span>
          </div>
          <p className="mt-xs text-body-sm font-medium text-on-surface">{idea.title}</p>
          {idea.summary && <p className="mt-xs text-body-sm text-on-surface-variant line-clamp-2">{idea.summary}</p>}
          <div className="mt-sm flex items-center gap-sm font-mono text-[9px] text-on-surface-variant">
            {idea.author && <span>{idea.author}</span>}
            {idea.priority === "high" && <span className="text-error">High</span>}
            {idea.priority === "critical" && <span className="text-error">Critical</span>}
          </div>
        </div>
      </div>
      <div className="mt-sm flex items-center justify-end gap-sm border-t border-outline-variant/30 pt-sm">
        <button type="button" onClick={() => onPin(idea.id, !idea.pinned)}
          className="font-mono text-[9px] text-on-surface-variant transition-colors hover:text-primary">
          {idea.pinned ? "Unpin" : "Pin"}
        </button>
        <button type="button" onClick={() => onArchive(idea.id, !idea.archived)}
          className="font-mono text-[9px] text-on-surface-variant transition-colors hover:text-error">
          {idea.archived ? "Restore" : "Archive"}
        </button>
      </div>
    </div>
  );
}

export default function IdeasPage() {
  const router = useRouter();
  const { activeHackathon } = useHackathon();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [_fp] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "oldest" | "priority">("newest");
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState<IdeaCategory>("general");
  const [priority, setPriority] = useState<IdeaPriority>("medium");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const svc = createIdeasService();

  function loadIdeas() {
    if (!activeHackathon) return;
    setIsLoading(true);
    svc.list(activeHackathon.id, showArchived).then(setIdeas).catch((err) => console.error("[Page] error:", err)).finally(() => setIsLoading(false));
  }

  useEffect(() => { if (activeHackathon) loadIdeas(); }, [activeHackathon, showArchived]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!activeHackathon || !title.trim()) return;
    setCreateError("");
    setIsCreating(true);
    try {
      await svc.create(activeHackathon.id, { title: title.trim(), summary: summary.trim() || undefined, category, priority });
      setTitle(""); setSummary(""); setCategory("general"); setPriority("medium");
      setShowCreate(false);
      loadIdeas();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create idea.");
    } finally { setIsCreating(false); }
  }

  async function handleVote(idea: Idea) {
    if (!activeHackathon) return;
    try {
      await svc.vote(idea.id, "current-user");
      setIdeas((prev) => prev.map((i) => i.id === idea.id ? { ...i, voteCount: i.voteCount + 1 } : i));
    } catch { /* ignore */ }
  }

  async function handlePin(id: string, pinned: boolean) {
    await svc.update(id, { pinned }).catch((err) => console.error("[Page] error:", err));
    loadIdeas();
  }

  async function handleArchive(id: string, archived: boolean) {
    await svc.update(id, { archived }).catch((err) => console.error("[Page] error:", err));
    loadIdeas();
  }

  let filtered = ideas;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((i) => i.title.toLowerCase().includes(q) || i.summary?.toLowerCase().includes(q));
  }
  if (filterStatus) filtered = filtered.filter((i) => i.status === filterStatus);
  if (filterCategory) filtered = filtered.filter((i) => i.category === filterCategory);
  if (_fp) filtered = filtered.filter((i) => i.priority === _fp);

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "votes") return b.voteCount - a.voteCount;
    const p = { critical: 0, high: 1, medium: 2, low: 3 };
    return (p[a.priority] ?? 2) - (p[b.priority] ?? 2);
  });

  if (!activeHackathon) { router.replace("/app"); return null; }

  return (
    <div className="p-lg">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-lg">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-h1 font-semibold text-on-surface">Ideas</h1>
            <p className="font-mono text-[11px] text-on-surface-variant">Brainstorm and explore solutions</p>
          </div>
          <button type="button" onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-sm rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">
            <span className="material-symbols-outlined text-[16px]">add</span>New Idea
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-sm">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ideas..."
            className="h-8 w-48 rounded border border-outline-variant bg-black px-md text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 rounded border border-outline-variant bg-black px-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
            <option value="">All status</option>
            {IDEA_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="h-8 rounded border border-outline-variant bg-black px-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
            <option value="">All categories</option>
            {IDEA_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-8 rounded border border-outline-variant bg-black px-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="votes">Most votes</option>
            <option value="priority">Priority</option>
          </select>
          <label className="flex cursor-pointer items-center gap-xs text-body-sm text-on-surface-variant">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)}
              className="h-4 w-4 rounded-[2px] border border-outline-variant bg-black text-primary focus:ring-1 focus:ring-primary focus:outline-none" />
            Show archived
          </label>
          <div className="ml-auto flex gap-xs rounded bg-surface-container p-xs">
            <button type="button" onClick={() => setView("list")}
              className={`rounded px-sm py-xs text-body-sm ${view === "list" ? "bg-secondary-container text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>List</button>
            <button type="button" onClick={() => setView("grid")}
              className={`rounded px-sm py-xs text-body-sm ${view === "grid" ? "bg-secondary-container text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>Grid</button>
          </div>
        </div>

        {isLoading ? (
          <CardSkeleton count={4} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-sm py-xl text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">lightbulb</span>
            <p className="text-body-sm text-on-surface-variant">No ideas yet. Share your first idea!</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 gap-sm md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onVote={handleVote} onPin={handlePin} onArchive={handleArchive} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-xs">
            {filtered.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onVote={handleVote} onPin={handlePin} onArchive={handleArchive} />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="w-full max-w-lg rounded border border-outline-variant bg-surface-container-low p-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-lg text-h2 font-semibold text-on-surface">New Idea</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's your idea?"
                  className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" required />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Summary</label>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="Brief description..."
                  className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as IdeaCategory)}
                    className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
                    {IDEA_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as IdeaPriority)}
                    className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
                    {IDEA_PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              {createError && <p role="alert" className="rounded border border-error-container/30 bg-error-container/5 px-sm py-xs font-mono text-[10px] text-error">{createError}</p>}
              <div className="flex items-center justify-end gap-sm">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface transition-colors hover:border-on-surface">Cancel</button>
                <button type="submit" disabled={isCreating}
                  className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826] disabled:opacity-50">{isCreating ? "Creating..." : "Create Idea"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
