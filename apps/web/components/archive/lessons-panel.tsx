"use client";

import { useState } from "react";
import type { Lesson, LessonInput } from "@/core/lessons";

interface LessonsPanelProps {
  lessons: Lesson[];
  onCreate: (input: LessonInput) => Promise<void>;
  onUpdate: (id: string, input: Partial<LessonInput>) => Promise<void>; // used for pin/favourite toggles
  onDelete: (id: string) => Promise<void>;
  onSearch?: (term: string) => void;
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "border-l-error",
  important: "border-l-[#d29922]",
  insight: "border-l-primary",
  tip: "border-l-on-surface-variant",
};

export function LessonsPanel({ lessons, onCreate, onDelete, onSearch }: LessonsPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [severity, setSeverity] = useState<"insight" | "important" | "critical" | "tip">("insight");
  const [search, setSearch] = useState("");

  async function handleCreate() {
    if (!title.trim() || !content.trim()) return;
    await onCreate({ title: title.trim(), content: content.trim(), severity });
    setTitle("");
    setContent("");
    setSeverity("insight");
    setShowForm(false);
  }

  const filtered = search && onSearch
    ? lessons
    : lessons;

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Lessons Learned ({lessons.length})
        </h3>
        <div className="flex items-center gap-sm">
          {onSearch && (
            <input
              type="text"
              placeholder="Search lessons..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); onSearch(e.target.value); }}
              className="h-7 w-36 rounded border border-outline-variant/30 bg-black px-sm font-mono text-[10px] text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
              aria-label="Search lessons"
            />
          )}
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex h-7 items-center rounded bg-primary px-sm text-body-xs font-medium text-on-primary transition-colors hover:bg-[#c01826]"
          >
            {showForm ? "Cancel" : "Add Lesson"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="flex flex-col gap-sm rounded border border-outline-variant/30 bg-surface-container p-md">
          <input
            type="text"
            placeholder="Lesson title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 rounded border border-outline-variant/30 bg-black px-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            aria-label="Lesson title"
          />
          <textarea
            placeholder="What did you learn?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="rounded border border-outline-variant/30 bg-black px-sm py-xs text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none resize-none"
            aria-label="Lesson content"
          />
          <div className="flex items-center justify-between">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as typeof severity)}
              className="h-7 rounded border border-outline-variant/30 bg-black px-sm font-mono text-[10px] text-on-surface focus:border-primary focus:outline-none"
              aria-label="Severity"
            >
              <option value="insight">Insight</option>
              <option value="tip">Tip</option>
              <option value="important">Important</option>
              <option value="critical">Critical</option>
            </select>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!title.trim() || !content.trim()}
              className="flex h-7 items-center rounded bg-primary px-sm text-body-xs font-medium text-on-primary transition-colors hover:bg-[#c01826] disabled:pointer-events-none disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-xs">
        {filtered.map((lesson) => (
          <div
            key={lesson.id}
            className={`flex flex-col gap-[2px] rounded border border-outline-variant/20 bg-surface-container-low p-sm border-l-2 ${SEVERITY_COLORS[lesson.severity] ?? "border-l-on-surface-variant"}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-medium text-on-surface">{lesson.title}</span>
              <div className="flex items-center gap-xs">
                <span className="rounded bg-surface-container-high px-[4px] py-[1px] font-mono text-[8px] uppercase tracking-wider text-on-surface-variant">
                  {lesson.severity}
                </span>
                {lesson.pinned && <span className="material-symbols-outlined text-[12px] text-primary">keep</span>}
                {lesson.favourite && <span className="material-symbols-outlined text-[12px] text-[#d29922]">star</span>}
                <button
                  type="button"
                  onClick={() => onDelete(lesson.id)}
                  className="flex h-5 w-5 items-center justify-center rounded text-on-surface-variant/50 hover:text-error transition-colors"
                  aria-label={`Delete ${lesson.title}`}
                >
                  <span className="material-symbols-outlined text-[12px]">close</span>
                </button>
              </div>
            </div>
            <p className="text-body-xs text-on-surface-variant">{lesson.content}</p>
            {lesson.tags.length > 0 && (
              <div className="mt-[2px] flex flex-wrap gap-[4px]">
                {lesson.tags.map((tag) => (
                  <span key={tag} className="rounded bg-surface-container-high px-[4px] py-[1px] font-mono text-[8px] text-on-surface-variant">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-md text-center font-mono text-[10px] text-on-surface-variant">
            {search ? "No matching lessons." : "No lessons recorded yet."}
          </p>
        )}
      </div>
    </div>
  );
}
