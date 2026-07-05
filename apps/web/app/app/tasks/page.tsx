"use client";

import { useState, useEffect, useCallback, type FormEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { useHackathon } from "@/core/hackathon";
import { createTaskService, TASK_STATUSES, getStatusStyle, type Task, type TaskStatus } from "@/core/tasks";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "backlog", label: "Backlog" },
  { status: "todo", label: "To Do" },
  { status: "in_progress", label: "In Progress" },
  { status: "blocked", label: "Blocked" },
  { status: "review", label: "Review" },
  { status: "testing", label: "Testing" },
  { status: "done", label: "Done" },
];

export default function TasksPage() {
  const router = useRouter();
  const { activeHackathon } = useHackathon();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Create form
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const svc = createTaskService();

  const load = useCallback(() => {
    if (!activeHackathon) return;
    setIsLoading(true);
    svc.list(activeHackathon.id, showArchived).then(setTasks).catch((err) => console.error("[Page] error:", err)).finally(() => setIsLoading(false));
  }, [activeHackathon, showArchived]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!activeHackathon || !title.trim()) return;
    setCreateError("");
    setIsCreating(true);
    try {
      await svc.create(activeHackathon.id, {
        title: title.trim(), description: desc.trim() || undefined,
        priority: priority as Task["priority"],
        owner: assignee.trim() || undefined,
      });
      setTitle(""); setDesc(""); setPriority("medium"); setAssignee("");
      setShowCreate(false);
      load();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed.");
    } finally { setIsCreating(false); }
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    await svc.updateStatus(id, status);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status, completedDate: status === "done" ? new Date().toISOString() : t.completedDate } : t)));
  }

  function handleDragStart(id: string) { setDraggedTask(id); }
  function handleDragOver(e: DragEvent) { e.preventDefault(); }
  function handleDrop(status: TaskStatus) {
    if (draggedTask) { handleStatusChange(draggedTask, status); setDraggedTask(null); }
  }

  let filtered = [...tasks];
  if (search) { const q = search.toLowerCase(); filtered = filtered.filter((t) => t.title.toLowerCase().includes(q)); }
  if (filterStatus) filtered = filtered.filter((t) => t.status === filterStatus);
  if (filterPriority) filtered = filtered.filter((t) => t.priority === filterPriority);

  if (!activeHackathon) { router.replace("/app"); return null; }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-outline-variant/30 bg-surface px-lg py-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 font-semibold text-on-surface">Tasks</h1>
            <p className="font-mono text-[11px] text-on-surface-variant">{tasks.filter((t) => t.status !== "done" && t.status !== "archived").length} active</p>
          </div>
          <button type="button" onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-sm rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">
            <span className="material-symbols-outlined text-[16px]">add</span>New Task
          </button>
        </div>
        <div className="mt-sm flex flex-wrap items-center gap-sm">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..."
            className="h-8 w-48 rounded border border-outline-variant bg-black px-md text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 rounded border border-outline-variant bg-black px-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
            <option value="">All status</option>
            {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
            className="h-8 rounded border border-outline-variant bg-black px-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
            <option value="">All priority</option>
            <option value="critical">Critical</option><option value="high">High</option>
            <option value="medium">Medium</option><option value="low">Low</option>
          </select>
          <label className="flex cursor-pointer items-center gap-xs text-body-sm text-on-surface-variant">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)}
              className="h-4 w-4 rounded-[2px] border border-outline-variant bg-black text-primary focus:ring-1 focus:ring-primary focus:outline-none" /> Show archived
          </label>
          <div className="ml-auto flex gap-xs rounded bg-surface-container p-xs">
            <button type="button" onClick={() => setView("kanban")}
              className={`rounded px-sm py-xs text-body-sm ${view === "kanban" ? "bg-secondary-container text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>Board</button>
            <button type="button" onClick={() => setView("list")}
              className={`rounded px-sm py-xs text-body-sm ${view === "list" ? "bg-secondary-container text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>List</button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-sm">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
          </div>
        </div>
      ) : view === "kanban" ? (
        <div className="flex flex-1 gap-sm overflow-x-auto p-lg scrollbar-thin">
          {COLUMNS.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="flex w-72 shrink-0 flex-col rounded border border-outline-variant/30 bg-surface-container-lowest">
                <div className="flex items-center justify-between border-b border-outline-variant/30 px-md py-sm">
                  <span className="text-body-sm font-medium text-on-surface">{col.label}</span>
                  <span className="rounded bg-surface-container-high px-xs py-[1px] font-mono text-[10px] text-on-surface-variant">{colTasks.length}</span>
                </div>
                <div className="flex flex-col gap-xs p-sm scrollbar-thin overflow-y-auto flex-1"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(col.status)}
                >
                  {colTasks.length === 0 && (
                    <div className="flex items-center justify-center py-lg text-center">
                      <p className="font-mono text-[10px] text-on-surface-variant">No tasks</p>
                    </div>
                  )}
                  {colTasks.map((task) => (
                    <div key={task.id} draggable onDragStart={() => handleDragStart(task.id)}
                      className="cursor-grab rounded border border-outline-variant/30 bg-surface-container-low p-md transition-colors hover:bg-surface-container active:cursor-grabbing">
                      <div className="flex items-center gap-sm">
                        {task.priority === "critical" && <span className="material-symbols-outlined text-[14px] text-error">priority_high</span>}
                        {task.priority === "high" && <span className="material-symbols-outlined text-[14px] text-[#d29922]">arrow_upward</span>}
                        {task.blocked && <span className="material-symbols-outlined text-[14px] text-error">block</span>}
                      </div>
                      <p className="mt-xs text-body-sm font-medium text-on-surface line-clamp-2">{task.title}</p>
                      <div className="mt-sm flex flex-wrap gap-x-sm gap-y-xs font-mono text-[9px] text-on-surface-variant">
                        {task.owner && <span>{task.owner}</span>}
                        {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-lg scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-sm py-xl text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">checklist</span>
              <p className="text-body-sm text-on-surface-variant">No tasks found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-xs">
              {filtered.map((task) => (
                <div key={task.id} className="flex items-center gap-md rounded border border-outline-variant/30 bg-surface-container-low px-lg py-md">
                  <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                    className={`rounded border px-sm py-[2px] font-mono text-[10px] ${getStatusStyle(task.status)} focus:outline-none`}>
                    {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-medium text-on-surface">{task.title}</p>
                    <div className="mt-xs flex gap-sm font-mono text-[9px] text-on-surface-variant">
                      {task.owner && <span>{task.owner}</span>}
                      {task.priority !== "medium" && <span className={task.priority === "critical" ? "text-error" : task.priority === "high" ? "text-[#d29922]" : ""}>{task.priority}</span>}
                      {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="w-full max-w-lg rounded border border-outline-variant bg-surface-container-low p-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-lg text-h2 font-semibold text-on-surface">New Task</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?"
                  className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" required />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Description</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Details..."
                  className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
                    <option value="critical">Critical</option><option value="high">High</option>
                    <option value="medium">Medium</option><option value="low">Low</option>
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Assignee</label>
                  <input type="text" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Team member"
                    className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
              </div>
              {createError && <p role="alert" className="rounded border border-error-container/30 bg-error-container/5 px-sm py-xs font-mono text-[10px] text-error">{createError}</p>}
              <div className="flex items-center justify-end gap-sm">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface transition-colors hover:border-on-surface">Cancel</button>
                <button type="submit" disabled={isCreating}
                  className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826] disabled:opacity-50">{isCreating ? "Creating..." : "Create Task"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
