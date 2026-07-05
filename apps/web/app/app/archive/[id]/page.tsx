"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createArchiveService, type WorkspaceArchive } from "@/core/archive";
import { createLessonService, type Lesson, type LessonInput } from "@/core/lessons";
import { createRetrospectiveService, type Retrospective, type RetrospectiveInput } from "@/core/retrospectives";
import { LessonsPanel, RetrospectiveEditor } from "@/components/archive";

export default function ArchiveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [archive, setArchive] = useState<WorkspaceArchive | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [retro, setRetro] = useState<Retrospective | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "lessons" | "retrospective" | "snapshots">("overview");

  const archiveSvc = createArchiveService();
  const lessonSvc = createLessonService();
  const retroSvc = createRetrospectiveService();

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [arch, l, r] = await Promise.all([
      archiveSvc.getById(id),
      lessonSvc.list(id),
      retroSvc.getByArchive(id),
    ]);
    setArchive(arch);
    setLessons(l);
    setRetro(r);
    setLoading(false);
  }, [id, archiveSvc, lessonSvc, retroSvc]);

  useEffect(() => { load(); }, [load]);

  async function handleCreateLesson(input: LessonInput) {
    if (!id) return;
    await lessonSvc.create(id, input);
    const l = await lessonSvc.list(id);
    setLessons(l);
  }

  async function handleUpdateLesson(lessonId: string, input: Partial<LessonInput>) {
    await lessonSvc.update(lessonId, input);
    const l = await lessonSvc.list(id!);
    setLessons(l);
  }

  async function handleDeleteLesson(lessonId: string) {
    await lessonSvc.remove(lessonId);
    setLessons((prev) => prev.filter((x) => x.id !== lessonId));
  }

  async function handleSearchLessons(term: string) {
    if (!id) return;
    if (!term.trim()) {
      const l = await lessonSvc.list(id);
      setLessons(l);
      return;
    }
    const l = await lessonSvc.search(id, term);
    setLessons(l);
  }

  async function handleSaveRetrospective(input: RetrospectiveInput) {
    if (!id) return;
    if (retro) {
      await retroSvc.update(id, input);
    } else {
      await retroSvc.create(id, input);
    }
    const r = await retroSvc.getByArchive(id);
    setRetro(r);
  }

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: "info" },
    { id: "lessons" as const, label: `Lessons (${lessons.length})`, icon: "school" },
    { id: "retrospective" as const, label: "Retrospective", icon: "feedback" },
    { id: "snapshots" as const, label: "Snapshots", icon: "photo_library" },
  ];

  if (loading || !archive) {
    return (
      <div className="flex items-center justify-center p-lg">
        <div className="flex items-center gap-sm">
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    completed: "text-[#3fb950]",
    cancelled: "text-on-surface-variant",
    abandoned: "text-error",
    imported: "text-primary",
  };

  return (
    <div className="mx-auto max-w-4xl p-lg">
      <Link href="/app/archive" className="mb-md inline-flex items-center gap-xs font-mono text-[10px] text-primary transition-opacity hover:opacity-80">
        <span className="material-symbols-outlined text-[14px]">arrow_back</span>
        Back to Archive
      </Link>

      <div className="mb-lg">
        <h1 className="text-h1 font-semibold text-on-surface">{archive.name}</h1>
        <div className="flex items-center gap-md font-mono text-[10px] text-on-surface-variant">
          <span>{archive.organizer}</span>
          <span className={statusColors[archive.status] ?? ""}>{archive.status}</span>
          {archive.result && archive.result !== "none" && <span>{archive.result}</span>}
          {archive.placement && <span>#{archive.placement}</span>}
          {archive.prize && <span className="text-[#d4af37]">{archive.prize}</span>}
          {archive.startDate && <span>{new Date(archive.startDate).toLocaleDateString()}</span>}
          {archive.memberCount > 0 && <span>{archive.memberCount} members</span>}
        </div>
      </div>

      <nav className="mb-lg flex gap-xs" aria-label="Sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-xs rounded px-sm py-xs text-body-xs font-medium transition-all ${
              tab === t.id
                ? "bg-primary text-on-primary"
                : "border border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60 hover:text-on-surface"
            }`}
            aria-current={tab === t.id ? "page" : undefined}
          >
            <span className="material-symbols-outlined text-[14px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <div className="flex flex-col gap-md">
          <div className="grid grid-cols-2 gap-sm md:grid-cols-4">
            <div className="rounded border border-outline-variant/20 bg-surface-container-low p-sm">
              <span className="font-mono text-[9px] text-on-surface-variant">Completion</span>
              <p className="text-h3 font-semibold text-on-surface">{archive.completionPct}%</p>
            </div>
            <div className="rounded border border-outline-variant/20 bg-surface-container-low p-sm">
              <span className="font-mono text-[9px] text-on-surface-variant">Members</span>
              <p className="text-h3 font-semibold text-on-surface">{archive.memberCount}</p>
            </div>
            <div className="rounded border border-outline-variant/20 bg-surface-container-low p-sm">
              <span className="font-mono text-[9px] text-on-surface-variant">Lessons</span>
              <p className="text-h3 font-semibold text-on-surface">{archive.lessonCount ?? 0}</p>
            </div>
            <div className="rounded border border-outline-variant/20 bg-surface-container-low p-sm">
              <span className="font-mono text-[9px] text-on-surface-variant">Submission</span>
              <p className="text-h3 font-semibold text-on-surface">{archive.submissionStatus ?? "—"}</p>
            </div>
          </div>

          {archive.notes && (
            <div className="rounded border border-outline-variant/20 bg-surface-container-low p-md">
              <h3 className="mb-xs font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Notes</h3>
              <p className="text-body-sm text-on-surface-variant">{archive.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
            <div className="rounded border border-outline-variant/20 bg-surface-container-low p-md">
              <h3 className="mb-sm font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Details</h3>
              <div className="flex flex-col gap-[4px] font-mono text-[10px] text-on-surface-variant">
                <span>Slug: {archive.slug}</span>
                <span>Category: {archive.category ?? "—"}</span>
                <span>Technology: {archive.technology ?? "—"}</span>
                <span>Template: {archive.templateOrigin ?? "—"}</span>
                <span>Archived: {new Date(archive.archivedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="rounded border border-outline-variant/20 bg-surface-container-low p-md">
              <h3 className="mb-sm font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Quick Links</h3>
              <div className="flex flex-col gap-xs">
                <Link href={`/app/planning`} className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">Planning →</Link>
                <Link href={`/app/tasks`} className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">Tasks →</Link>
                <Link href={`/app/files`} className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">Files →</Link>
                <Link href={`/app/relationships`} className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">Relationships →</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "lessons" && (
        <LessonsPanel
          lessons={lessons}
          onCreate={handleCreateLesson}
          onUpdate={handleUpdateLesson}
          onDelete={handleDeleteLesson}
          onSearch={handleSearchLessons}
        />
      )}

      {tab === "retrospective" && (
        <RetrospectiveEditor
          retrospective={retro}
          onSave={handleSaveRetrospective}
        />
      )}

      {tab === "snapshots" && (
        <div className="flex flex-col items-center gap-sm py-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">photo_library</span>
          <p className="font-mono text-[10px] text-on-surface-variant">
            Snapshots are captured automatically when a workspace is archived.
          </p>
        </div>
      )}
    </div>
  );
}
