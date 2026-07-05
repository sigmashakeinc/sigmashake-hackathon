"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useHackathon } from "@/core/hackathon";
import { createResearchService, RESEARCH_CATEGORIES, RESEARCH_SOURCE_TYPES, type ResearchItem, type ResearchCategory, type ResearchSourceType } from "@/core/research";

const SOURCE_ICONS: Record<string, string> = {
  website: "language", documentation: "menu_book", api: "api", github: "code",
  package: "inventory_2", library: "local_library", video: "smart_display",
  course: "school", article: "article", pdf: "picture_as_pdf",
  research_paper: "biotech", blog: "rss_feed", tool: "handyman",
  service: "cloud", dataset: "database", image: "image", example: "code_blocks",
  general: "link",
};

const VERIFICATION_STYLES: Record<string, string> = {
  verified: "text-[#3fb950] border-[#3fb950]/30 bg-[#3fb950]/5",
  needs_review: "text-[#d29922] border-[#d29922]/30 bg-[#d29922]/5",
  deprecated: "text-error border-error/30 bg-error/5",
};

export default function ResearchPage() {
  const router = useRouter();
  const { activeHackathon } = useHackathon();
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alpha">("newest");
  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<ResearchCategory>("general");
  const [sourceType, setSourceType] = useState<ResearchSourceType>("general");
  const [author, setAuthor] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const svc = createResearchService();

  function load() {
    if (!activeHackathon) return;
    setIsLoading(true);
    svc.list(activeHackathon.id, showArchived).then(setItems).catch((err) => console.error("[Page] error:", err)).finally(() => setIsLoading(false));
  }

  useEffect(() => { if (activeHackathon) load(); }, [activeHackathon, showArchived]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!activeHackathon || !title.trim()) return;
    setCreateError("");
    setIsCreating(true);
    try {
      await svc.create(activeHackathon.id, {
        title: title.trim(), summary: summary.trim() || undefined,
        url: url.trim() || undefined, category, sourceType,
        author: author.trim() || undefined,
      });
      setTitle(""); setSummary(""); setUrl(""); setCategory("general"); setSourceType("general"); setAuthor("");
      setShowCreate(false);
      load();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed.");
    } finally { setIsCreating(false); }
  }

  async function handlePin(id: string, pinned: boolean) { await svc.update(id, { pinned }); load(); }
  async function handleArchive(id: string, archived: boolean) { await svc.update(id, { archived }); load(); }
  async function handleFav(id: string, favourite: boolean) { await svc.update(id, { favourite }); load(); }
  async function handleVerify(id: string, verificationStatus: string) { await svc.update(id, { verificationStatus }); load(); }

  let filtered = [...items];
  if (search) { const q = search.toLowerCase(); filtered = filtered.filter((i) => i.title.toLowerCase().includes(q) || i.summary?.toLowerCase().includes(q) || i.url?.toLowerCase().includes(q)); }
  if (filterCategory) filtered = filtered.filter((i) => i.category === filterCategory);
  if (filterSource) filtered = filtered.filter((i) => i.sourceType === filterSource);
  if (filterVerified) filtered = filtered.filter((i) => i.verificationStatus === filterVerified);

  filtered.sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return a.title.localeCompare(b.title);
  });

  if (!activeHackathon) { router.replace("/app"); return null; }

  return (
    <div className="p-lg">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-lg">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-h1 font-semibold text-on-surface">Research</h1>
            <p className="font-mono text-[11px] text-on-surface-variant">Knowledge base for your hackathon</p>
          </div>
          <button type="button" onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-sm rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">
            <span className="material-symbols-outlined text-[16px]">add</span>Add Resource
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-sm">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search research..."
            className="h-8 w-48 rounded border border-outline-variant bg-black px-md text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="h-8 rounded border border-outline-variant bg-black px-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
            <option value="">All categories</option>
            {RESEARCH_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)}
            className="h-8 rounded border border-outline-variant bg-black px-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
            <option value="">All sources</option>
            {RESEARCH_SOURCE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterVerified} onChange={(e) => setFilterVerified(e.target.value)}
            className="h-8 rounded border border-outline-variant bg-black px-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
            <option value="">All status</option>
            <option value="verified">Verified</option>
            <option value="needs_review">Needs Review</option>
            <option value="deprecated">Deprecated</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-8 rounded border border-outline-variant bg-black px-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="alpha">A-Z</option>
          </select>
          <label className="flex cursor-pointer items-center gap-xs text-body-sm text-on-surface-variant">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)}
              className="h-4 w-4 rounded-[2px] border border-outline-variant bg-black text-primary focus:ring-1 focus:ring-primary focus:outline-none" /> Show archived
          </label>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-xl">
            <div className="flex items-center gap-sm">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-sm py-xl text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">travel_explore</span>
            <p className="text-body-sm text-on-surface-variant">No research yet. Start collecting resources!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-xs">
            {filtered.map((item) => (
              <div key={item.id} className="rounded border border-outline-variant/30 bg-surface-container-low p-md transition-colors hover:bg-surface-container">
                <div className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{SOURCE_ICONS[item.sourceType] ?? "link"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-sm">
                      <p className="text-body-sm font-medium text-on-surface truncate">{item.title}</p>
                      {item.pinned && <span className="material-symbols-outlined text-[14px] text-primary">push_pin</span>}
                      {item.favourite && <span className="material-symbols-outlined text-[14px] text-[#d29922]">star</span>}
                      <span className={`rounded border px-xs py-[1px] font-mono text-[9px] ${VERIFICATION_STYLES[item.verificationStatus]}`}>{item.verificationStatus.replace("_", " ")}</span>
                    </div>
                    <div className="mt-xs flex flex-wrap gap-x-lg gap-y-xs font-mono text-[10px] text-on-surface-variant">
                      <span>{item.category}</span>
                      <span>{item.sourceType}</span>
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80 truncate max-w-[300px]">{item.url}</a>}
                      {item.author && <span>by {item.author}</span>}
                    </div>
                    {item.summary && <p className="mt-xs text-body-sm text-on-surface-variant line-clamp-2">{item.summary}</p>}
                  </div>
                </div>
                <div className="mt-sm flex items-center justify-end gap-sm border-t border-outline-variant/30 pt-sm">
                  <button type="button" onClick={() => handleFav(item.id, !item.favourite)}
                    className="font-mono text-[9px] text-on-surface-variant transition-colors hover:text-[#d29922]">{item.favourite ? "Unfavourite" : "Favourite"}</button>
                  <button type="button" onClick={() => handlePin(item.id, !item.pinned)}
                    className="font-mono text-[9px] text-on-surface-variant transition-colors hover:text-primary">{item.pinned ? "Unpin" : "Pin"}</button>
                  {item.verificationStatus !== "verified" && (
                    <button type="button" onClick={() => handleVerify(item.id, "verified")}
                      className="font-mono text-[9px] text-on-surface-variant transition-colors hover:text-[#3fb950]">Verify</button>
                  )}
                  {item.verificationStatus !== "deprecated" && (
                    <button type="button" onClick={() => handleVerify(item.id, "deprecated")}
                      className="font-mono text-[9px] text-on-surface-variant transition-colors hover:text-error">Deprecate</button>
                  )}
                  <button type="button" onClick={() => handleArchive(item.id, !item.archived)}
                    className="font-mono text-[9px] text-on-surface-variant transition-colors hover:text-error">{item.archived ? "Restore" : "Archive"}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="w-full max-w-lg rounded border border-outline-variant bg-surface-container-low p-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-lg text-h2 font-semibold text-on-surface">Add Resource</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is this resource?"
                  className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" required />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">URL</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..."
                  className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Summary</label>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} placeholder="Brief summary..."
                  className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as ResearchCategory)}
                    className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
                    {RESEARCH_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Source Type</label>
                  <select value={sourceType} onChange={(e) => setSourceType(e.target.value as ResearchSourceType)}
                    className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
                    {RESEARCH_SOURCE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Author (optional)</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name"
                  className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              {createError && <p role="alert" className="rounded border border-error-container/30 bg-error-container/5 px-sm py-xs font-mono text-[10px] text-error">{createError}</p>}
              <div className="flex items-center justify-end gap-sm">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface transition-colors hover:border-on-surface">Cancel</button>
                <button type="submit" disabled={isCreating}
                  className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826] disabled:opacity-50">{isCreating ? "Adding..." : "Add Resource"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
