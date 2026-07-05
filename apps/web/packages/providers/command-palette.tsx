"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useHackathon } from "@/core/hackathon";
import { searchAll, type SearchResult, type Command } from "@/core/search";
import { cn } from "@/packages/utils";

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  commands: Command[];
  register: (cmd: Command) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue>({
  open: false, setOpen: () => {}, commands: [], register: () => {},
});

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { activeHackathon } = useHackathon();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<"search" | "commands">("commands");
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Navigation commands
  const navCommands: Command[] = [
    { id: "nav-mc", label: "Mission Control", icon: "dashboard", action: () => router.push("/app") },
    { id: "nav-planning", label: "Open Planning", icon: "map", action: () => router.push("/app/planning") },
    { id: "nav-ideas", label: "Open Ideas", icon: "lightbulb", action: () => router.push("/app/ideas") },
    { id: "nav-research", label: "Open Research", icon: "travel_explore", action: () => router.push("/app/research") },
    { id: "nav-tasks", label: "Open Tasks", icon: "checklist", action: () => router.push("/app/tasks") },
    { id: "nav-notes", label: "Open Notes", icon: "note", action: () => router.push("/app/notes") },
    { id: "nav-files", label: "Open Files", icon: "folder", action: () => router.push("/app/files") },
    { id: "nav-team", label: "Go To Team", icon: "group", action: () => router.push("/app/team") },
    { id: "nav-submission", label: "Open Submission", icon: "task_alt", action: () => router.push("/app/submission") },
    { id: "nav-hackathons", label: "View Hackathons", icon: "emoji_events", action: () => router.push("/app/hackathons") },
    { id: "nav-profile", label: "Go To Profile", icon: "settings", action: () => router.push("/app/settings/profile") },
    { id: "nav-invite", label: "Invite Team Member", icon: "group_add", action: () => router.push("/app/team/invitations") },
  ];

  const createCommands: Command[] = [
    { id: "create-task", label: "Create Task", icon: "add", action: () => { router.push("/app/tasks"); setTimeout(() => setOpen(false), 100); } },
    { id: "create-idea", label: "Create Idea", icon: "add", action: () => { router.push("/app/ideas"); setTimeout(() => setOpen(false), 100); } },
    { id: "create-note", label: "Create Note", icon: "add", action: () => { router.push("/app/notes"); setTimeout(() => setOpen(false), 100); } },
    { id: "create-research", label: "Add Research", icon: "add", action: () => { router.push("/app/research"); setTimeout(() => setOpen(false), 100); } },
  ];

  const allCommands = [...navCommands, ...createCommands];

  // Keyboard shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Search
  useEffect(() => {
    if (!open) { setQuery(""); setResults([]); return; }
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setMode("commands"); return; }
    setMode("search");
    setSelectedIndex(0);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!activeHackathon) return;
      setIsSearching(true);
      const res = await searchAll(activeHackathon.id, query);
      setResults(res);
      setIsSearching(false);
    }, 150);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, activeHackathon]);

  const items = mode === "commands" ? allCommands : results;
  const totalItems = items.length;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, totalItems - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && items[selectedIndex]) {
      const item = items[selectedIndex]!;
      if ("action" in item) {
        (item as Command).action();
        setOpen(false);
      } else {
        const result = item as SearchResult;
        router.push(result.href);
        setOpen(false);
      }
    }
  }

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen, commands: allCommands, register: () => {} }}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-[12vh]"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-2xl rounded border border-outline-variant bg-surface-container-low shadow-2xl">
            <div className="flex items-center border-b border-outline-variant/30 px-md">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search anything or type a command..."
                className="w-full bg-transparent px-sm py-md text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant/50"
                role="combobox"
                aria-expanded="true"
                aria-haspopup="listbox"
                aria-controls="search-results"
                aria-label="Search"
              />
              <kbd className="rounded border border-outline-variant bg-black px-sm py-xs font-mono text-[9px] text-on-surface-variant">ESC</kbd>
            </div>

            {mode === "commands" && !query.trim() && (
              <div id="search-results" className="max-h-[50vh] overflow-y-auto p-xs scrollbar-thin">
                <p className="px-md py-xs font-mono text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Navigate</p>
                {navCommands.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); setOpen(false); }}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={cn(
                      "flex w-full items-center gap-md rounded px-md py-sm text-body-sm transition-colors",
                      i === selectedIndex ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                    )}
                    role="option"
                    aria-selected={i === selectedIndex}
                  >
                    <span className="material-symbols-outlined text-[16px]">{cmd.icon}</span>
                    <span>{cmd.label}</span>
                  </button>
                ))}
                <p className="mt-xs px-md py-xs font-mono text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Create</p>
                {createCommands.map((cmd, i) => {
                  const idx = i + navCommands.length;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => { cmd.action(); setOpen(false); }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "flex w-full items-center gap-md rounded px-md py-sm text-body-sm transition-colors",
                        idx === selectedIndex ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                      )}
                      role="option"
                      aria-selected={idx === selectedIndex}
                    >
                      <span className="material-symbols-outlined text-[16px]">{cmd.icon}</span>
                      <span>{cmd.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {(mode === "search" || query.trim()) && (
              <div id="search-results" className="max-h-[50vh] overflow-y-auto p-xs scrollbar-thin">
                {isSearching ? (
                  <div className="flex items-center justify-center py-lg">
                    <div className="flex items-center gap-sm">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
                    </div>
                  </div>
                ) : results.length === 0 && query.trim() ? (
                  <div className="flex flex-col items-center gap-sm py-lg text-center">
                    <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30">search_off</span>
                    <p className="text-body-sm text-on-surface-variant">No results for &ldquo;{query}&rdquo;</p>
                  </div>
                ) : (
                  results.map((result, i) => (
                    <button
                      key={`${result.module}-${result.id}`}
                      onClick={() => { router.push(result.href); setOpen(false); }}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={cn(
                        "flex w-full items-center gap-md rounded px-md py-sm text-body-sm transition-colors",
                        i === selectedIndex ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                      )}
                      role="option"
                      aria-selected={i === selectedIndex}
                    >
                      <span className="material-symbols-outlined text-[16px]">{result.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{result.title}</p>
                        <p className="truncate font-mono text-[10px] text-on-surface-variant">{result.type} · {result.subtitle}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  return useContext(CommandPaletteContext);
}
