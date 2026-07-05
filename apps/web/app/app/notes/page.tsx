"use client";

import { useState, useEffect, useRef } from "react";
import { useHackathon } from "@/core/hackathon";
import { createNotesService, NOTE_CATEGORIES, type Note, type NoteCategory } from "@/core/notes";

export default function NotesPage() {
  const { activeHackathon } = useHackathon();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("shared");
  const [_filterCategory] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState<NoteCategory>("general");
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const svc = createNotesService();

  function load() {
    setIsLoading(true);
    svc.list(activeHackathon?.id ?? null, null, filterType === "personal" ? "personal" : undefined, showArchived)
      .then(setNotes).catch((err) => console.error("[Page] error:", err)).finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, [activeHackathon, filterType, showArchived]);

  useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content ?? "");
      setEditCategory(activeNote.category);
    } else {
      setEditTitle(""); setEditContent(""); setEditCategory("general");
    }
  }, [activeNote?.id]);

  function autoSave() {
    if (!activeNote) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      await svc.update(activeNote.id, { title: editTitle, content: editContent, category: editCategory }).catch((err) => console.error("[Page] error:", err));
      setIsSaving(false);
    }, 1000);
  }

  useEffect(() => { autoSave(); }, [editTitle, editContent, editCategory]);

  async function handleNew() {
    if (!activeHackathon) return;
    const note = await svc.create({
      hackathonId: activeHackathon.id,
      title: "Untitled",
      content: "",
      noteType: filterType === "personal" ? "personal" : "shared",
      category: "general",
    });
    setActiveNote(note);
    load();
  }

  async function handlePin(id: string, pinned: boolean) { await svc.update(id, { pinned }); load(); if (activeNote?.id === id) setActiveNote({ ...activeNote, pinned }); }
  async function handleArchive(id: string, archived: boolean) { await svc.update(id, { archived }); setActiveNote(null); load(); }
  async function handleFav(id: string, favourite: boolean) { await svc.update(id, { favourite }); load(); if (activeNote?.id === id) setActiveNote({ ...activeNote, favourite }); }
  async function handleDelete(id: string) { await svc.delete(id); setActiveNote(null); load(); }

  let filtered = [...notes];
  if (search) { const q = search.toLowerCase(); filtered = filtered.filter((n) => n.title.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)); }
  if (_filterCategory) filtered = filtered.filter((n) => n.category === _filterCategory);

  return (
    <div className="flex h-full">
      <div className="flex w-72 shrink-0 flex-col border-r border-outline-variant/30 bg-surface-container-low">
        <div className="flex items-center justify-between border-b border-outline-variant/30 px-md py-sm">
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Notes</h2>
          <button type="button" onClick={handleNew} className="flex h-6 w-6 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" aria-label="New note">
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>
        <div className="p-sm">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..."
            className="w-full rounded border border-outline-variant bg-black px-md py-[4px] text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
        </div>
        <div className="flex gap-sm px-sm pb-sm">
          <button type="button" onClick={() => setFilterType("shared")} className={`rounded px-sm py-xs text-[10px] transition-colors ${filterType === "shared" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>Shared</button>
          <button type="button" onClick={() => setFilterType("personal")} className={`rounded px-sm py-xs text-[10px] transition-colors ${filterType === "personal" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>Personal</button>
          <label className="flex cursor-pointer items-center gap-xs text-[10px] text-on-surface-variant ml-auto">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="h-3 w-3 rounded-[2px] border border-outline-variant bg-black text-primary" /> Archive
          </label>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="flex items-center justify-center py-lg">
              <div className="flex items-center gap-sm"><div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /><div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" /><div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" /></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-md py-lg text-center"><p className="font-mono text-[10px] text-on-surface-variant">No notes yet</p></div>
          ) : (
            <div className="flex flex-col gap-[2px] px-sm pb-sm">
              {filtered.map((note) => (
                <button key={note.id} type="button" onClick={() => setActiveNote(note)}
                  className={`w-full rounded px-md py-sm text-left transition-colors ${activeNote?.id === note.id ? "bg-surface-container-high" : "hover:bg-surface-container-high"}`}>
                  <div className="flex items-center gap-sm">
                    {note.pinned && <span className="material-symbols-outlined text-[12px] text-primary">push_pin</span>}
                    <p className="truncate text-body-sm font-medium text-on-surface">{note.title}</p>
                  </div>
                  <p className="mt-xs truncate font-mono text-[10px] text-on-surface-variant">{note.content ?? ""}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {!activeNote ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-sm text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">note</span>
              <p className="text-body-sm text-on-surface-variant">Select a note or create a new one</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-outline-variant/30 px-lg py-sm">
              <div className="flex items-center gap-sm">
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as NoteCategory)}
                  className="rounded border border-outline-variant bg-black px-sm py-[2px] font-mono text-[10px] text-on-surface focus:border-primary focus:outline-none">
                  {NOTE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <span className="font-mono text-[10px] text-on-surface-variant">{activeNote.wordCount} words</span>
                {isSaving && <span className="font-mono text-[10px] text-on-surface-variant">Saving...</span>}
              </div>
              <div className="flex items-center gap-sm">
                <div className="flex gap-xs rounded bg-surface-container p-xs">
                  <button type="button" onClick={() => setViewMode("edit")} className={`rounded px-sm py-xs text-[10px] ${viewMode === "edit" ? "bg-secondary-container text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>Edit</button>
                  <button type="button" onClick={() => setViewMode("preview")} className={`rounded px-sm py-xs text-[10px] ${viewMode === "preview" ? "bg-secondary-container text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>Preview</button>
                  <button type="button" onClick={() => setViewMode("split")} className={`rounded px-sm py-xs text-[10px] ${viewMode === "split" ? "bg-secondary-container text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>Split</button>
                </div>
                <button type="button" onClick={() => handleFav(activeNote.id, !activeNote.favourite)}
                  className={`rounded px-sm py-xs text-[10px] transition-colors ${activeNote.favourite ? "text-[#d29922]" : "text-on-surface-variant hover:text-[#d29922]"}`}>{activeNote.favourite ? "Faved" : "Fav"}</button>
                <button type="button" onClick={() => handlePin(activeNote.id, !activeNote.pinned)}
                  className="rounded px-sm py-xs text-[10px] text-on-surface-variant transition-colors hover:text-primary">{activeNote.pinned ? "Pinned" : "Pin"}</button>
                <button type="button" onClick={() => handleArchive(activeNote.id, true)}
                  className="rounded px-sm py-xs text-[10px] text-on-surface-variant transition-colors hover:text-error">Archive</button>
                <button type="button" onClick={() => handleDelete(activeNote.id)}
                  className="rounded px-sm py-xs text-[10px] text-on-surface-variant transition-colors hover:text-error">Delete</button>
              </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
              {(viewMode === "edit" || viewMode === "split") && (
                <div className={`flex flex-col ${viewMode === "split" ? "w-1/2" : "flex-1"} border-r border-outline-variant/30`}>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    className="border-b border-outline-variant/30 bg-transparent px-lg py-md text-h2 font-semibold text-on-surface outline-none placeholder:text-on-surface-variant/50" placeholder="Note title" />
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 resize-none bg-transparent px-lg py-md text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant/50 scrollbar-thin" placeholder="Start writing..." />
                </div>
              )}
              {(viewMode === "preview" || viewMode === "split") && (
                <div className={`flex flex-col ${viewMode === "split" ? "w-1/2" : "flex-1"} overflow-y-auto scrollbar-thin`}>
                  <div className="px-lg py-md">
                    <h1 className="text-h1 font-semibold text-on-surface">{editTitle || "Untitled"}</h1>
                    <div className="mt-md whitespace-pre-wrap text-body-sm text-on-surface-variant">{editContent || "No content"}</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
