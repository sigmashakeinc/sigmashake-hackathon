"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useHackathon } from "@/core/hackathon";
import { createFileService, CATEGORY_ICONS, FILE_CATEGORIES, type FileRecord, type Folder } from "@/core/files";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function FilesPage() {
  const router = useRouter();
  const { activeHackathon } = useHackathon();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterCategory, setFilterCategory] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);

  const svc = createFileService();

  function load() {
    if (!activeHackathon) return;
    setIsLoading(true);
    Promise.all([
      svc.listFiles(activeHackathon.id, currentFolder, showArchived),
      svc.listFolders(activeHackathon.id, currentFolder),
    ]).then(([f, d]) => { setFiles(f); setFolders(d); }).catch((err) => console.error("[Page] error:", err)).finally(() => setIsLoading(false));
  }

  useEffect(() => { if (activeHackathon) load(); }, [activeHackathon, currentFolder, showArchived]);

  // Build folder path
  useEffect(() => {
    if (!currentFolder) { setFolderPath([]); return; }
    const path: Folder[] = [];
    let current = folders.find((f) => f.id === currentFolder);
    while (current) { path.unshift(current); current = folders.find((f) => f.id === current?.parentId); }
    setFolderPath(path);
  }, [currentFolder, folders]);

  async function handleFolderCreate() {
    if (!activeHackathon || !newFolderName.trim()) return;
    await svc.createFolder(activeHackathon.id, newFolderName.trim(), currentFolder);
    setNewFolderName(""); setShowNewFolder(false); load();
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    const input = fileInputRef.current;
    if (!input?.files?.length || !activeHackathon) return;
    setUploading(true); setUploadProgress(0);
    const total = input.files.length; let done = 0;
    for (const file of Array.from(input.files)) {
      await svc.upload(activeHackathon.id, file, currentFolder, (pct) => {
        setUploadProgress(Math.round(((done + pct / 100) / total) * 100));
      });
      done++;
      setUploadProgress(Math.round((done / total) * 100));
    }
    setUploading(false); input.value = ""; load();
  }

  async function handleDelete(id: string) { await svc.deleteFile(id); load(); }
  async function handlePin(id: string, pinned: boolean) { await svc.updateFile(id, { pinned }); load(); }
  async function handleArchive(id: string, archived: boolean) { await svc.updateFile(id, { archived }); load(); }

  let filtered = [...files];
  if (search) { const q = search.toLowerCase(); filtered = filtered.filter((f) => f.name.toLowerCase().includes(q)); }
  if (filterCategory) filtered = filtered.filter((f) => f.category === filterCategory);

  if (!activeHackathon) { router.replace("/app"); return null; }

  return (
    <div className="p-lg">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-lg">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-h1 font-semibold text-on-surface">Files</h1>
            <p className="font-mono text-[11px] text-on-surface-variant">{files.length} files</p>
          </div>
          <div className="flex items-center gap-sm">
            <button type="button" onClick={() => setShowNewFolder(true)}
              className="inline-flex items-center gap-xs rounded border border-outline-variant bg-black px-sm py-sm text-body-sm text-on-surface transition-colors hover:border-on-surface">
              <span className="material-symbols-outlined text-[16px]">create_new_folder</span>New Folder
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-sm rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">
              <span className="material-symbols-outlined text-[16px]">upload</span>Upload
            </button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-xs font-mono text-[10px] text-on-surface-variant">
          <button type="button" onClick={() => setCurrentFolder(null)} className="transition-colors hover:text-on-surface">Root</button>
          {folderPath.map((f) => (
            <span key={f.id} className="flex items-center gap-xs">
              <span>/</span>
              <button type="button" onClick={() => setCurrentFolder(f.id)} className="transition-colors hover:text-on-surface">{f.name}</button>
            </span>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-sm">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files..."
            className="h-8 w-48 rounded border border-outline-variant bg-black px-md text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="h-8 rounded border border-outline-variant bg-black px-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
            <option value="">All types</option>
            {FILE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <label className="flex cursor-pointer items-center gap-xs text-body-sm text-on-surface-variant">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)}
              className="h-4 w-4 rounded-[2px] border border-outline-variant bg-black text-primary" /> Archive
          </label>
          <div className="ml-auto flex gap-xs rounded bg-surface-container p-xs">
            <button type="button" onClick={() => setView("grid")}
              className={`rounded px-sm py-xs text-body-sm ${view === "grid" ? "bg-secondary-container text-on-surface" : "text-on-surface-variant"}`}>Grid</button>
            <button type="button" onClick={() => setView("list")}
              className={`rounded px-sm py-xs text-body-sm ${view === "list" ? "bg-secondary-container text-on-surface" : "text-on-surface-variant"}`}>List</button>
          </div>
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="rounded border border-primary/30 bg-primary/5 px-md py-sm">
            <div className="mb-xs flex justify-between font-mono text-[10px] text-on-surface-variant">
              <span>Uploading...</span><span>{uploadProgress}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {/* New folder input */}
        {showNewFolder && (
          <div className="flex gap-sm">
            <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name" autoFocus
              className="rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
            <button type="button" onClick={handleFolderCreate}
              className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary">Create</button>
            <button type="button" onClick={() => setShowNewFolder(false)}
              className="rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface">Cancel</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-xl">
            <div className="flex items-center gap-sm"><div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /><div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" /><div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" /></div>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {folders.map((f) => (
              <button key={f.id} type="button" onClick={() => setCurrentFolder(f.id)}
                className="flex flex-col items-center gap-sm rounded border border-outline-variant/30 bg-surface-container-low p-md transition-colors hover:bg-surface-container">
                <span className="material-symbols-outlined text-[32px] text-primary">folder</span>
                <p className="text-center text-body-sm text-on-surface truncate w-full">{f.name}</p>
              </button>
            ))}
            {filtered.map((file) => (
              <div key={file.id} className="group relative rounded border border-outline-variant/30 bg-surface-container-low p-md transition-colors hover:bg-surface-container">
                <div className="flex flex-col items-center gap-sm">
                  <span className="material-symbols-outlined text-[32px] text-on-surface-variant">{CATEGORY_ICONS[file.category] ?? "insert_drive_file"}</span>
                  <p className="text-center text-body-sm text-on-surface truncate w-full">{file.name}</p>
                  <p className="font-mono text-[9px] text-on-surface-variant">{formatSize(file.fileSize)}</p>
                </div>
                <div className="absolute right-xs top-xs hidden gap-xs group-hover:flex">
                  <button type="button" onClick={() => handlePin(file.id, !file.pinned)} className="rounded bg-surface-container-high px-xs py-[1px] text-[9px] text-on-surface-variant transition-colors hover:text-primary">{file.pinned ? "Unpin" : "Pin"}</button>
                  <button type="button" onClick={() => handleDelete(file.id)} className="rounded bg-surface-container-high px-xs py-[1px] text-[9px] text-on-surface-variant transition-colors hover:text-error">Del</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-xs">
            {folders.map((f) => (
              <button key={f.id} type="button" onClick={() => setCurrentFolder(f.id)}
                className="flex items-center gap-md rounded border border-outline-variant/30 bg-surface-container-low px-lg py-md transition-colors hover:bg-surface-container">
                <span className="material-symbols-outlined text-[18px] text-primary">folder</span>
                <span className="text-body-sm text-on-surface">{f.name}</span>
              </button>
            ))}
            {filtered.map((file) => (
              <div key={file.id} className="flex items-center gap-md rounded border border-outline-variant/30 bg-surface-container-low px-lg py-md">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{CATEGORY_ICONS[file.category] ?? "insert_drive_file"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm text-on-surface truncate">{file.name}</p>
                  <div className="flex gap-sm font-mono text-[9px] text-on-surface-variant">
                    <span>{formatSize(file.fileSize)}</span>
                    <span>{file.category}</span>
                    {file.uploader && <span>by {file.uploader}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-sm shrink-0">
                  <button type="button" onClick={() => handlePin(file.id, !file.pinned)} className="font-mono text-[9px] text-on-surface-variant transition-colors hover:text-primary">{file.pinned ? "Unpin" : "Pin"}</button>
                  <button type="button" onClick={() => handleArchive(file.id, true)} className="font-mono text-[9px] text-on-surface-variant transition-colors hover:text-error">Archive</button>
                  <button type="button" onClick={() => handleDelete(file.id)} className="font-mono text-[9px] text-on-surface-variant transition-colors hover:text-error">Delete</button>
                </div>
              </div>
            ))}
            {folders.length === 0 && filtered.length === 0 && (
              <div className="flex flex-col items-center gap-sm py-xl text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">folder_open</span>
                <p className="text-body-sm text-on-surface-variant">No files yet. Upload something to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
