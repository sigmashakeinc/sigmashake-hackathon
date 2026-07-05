"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHackathon } from "@/core/hackathon";
import { createSubmissionService, type Submission, type SubmissionDeliverable, type SubmissionChecklistItem } from "@/core/submission";

export default function SubmissionPrepPage() {
  const router = useRouter();
  const { activeHackathon } = useHackathon();
  const [submission, setSubmission] = useState<(Submission & { deliverables: SubmissionDeliverable[]; checklist: SubmissionChecklistItem[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeLeft, setTimeLeft] = useState("");
  const [editingLinks, setEditingLinks] = useState(false);

  const [title, setTitle] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [devpostUrl, setDevpostUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [presentationUrl, setPresentationUrl] = useState("");

  // Countdown timer
  useEffect(() => {
    if (!activeHackathon?.submissionDeadline) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const deadline = new Date(activeHackathon.submissionDeadline!).getTime();
      const diff = deadline - now;
      if (diff <= 0) { setTimeLeft("Deadline passed"); clearInterval(interval); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    }, 60000);
    return () => clearInterval(interval);
  }, [activeHackathon?.submissionDeadline]);

  const svc = createSubmissionService();

  function load() {
    if (!activeHackathon) return;
    setIsLoading(true);
    svc.get(activeHackathon.id).then((s) => {
      setSubmission(s);
      if (s) { setTitle(s.title); setGithubRepo(s.githubRepo ?? ""); setDevpostUrl(s.devpostUrl ?? ""); setLiveDemoUrl(s.liveDemoUrl ?? ""); setVideoUrl(s.videoUrl ?? ""); setPresentationUrl(s.presentationUrl ?? ""); }
    }).catch((err) => console.error("[Page] error:", err)).finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, [activeHackathon]);

  async function handleCreate() {
    if (!activeHackathon) return;
    await svc.create(activeHackathon.id, `${activeHackathon.name} Submission`);
    load();
  }

  async function handleSaveLinks() {
    if (!submission) return;
    await svc.update(submission.id, {
      title, github_repo: githubRepo, devpost_url: devpostUrl,
      live_demo_url: liveDemoUrl, video_url: videoUrl, presentation_url: presentationUrl,
    });
    setEditingLinks(false);
    load();
  }

  async function handleDeliverableStatus(id: string, status: string) {
    await svc.updateDeliverable(id, { status: status as SubmissionDeliverable["status"] });
    load();
  }

  async function handleChecklistToggle(id: string, checked: boolean) {
    await svc.toggleChecklist(id, checked);
    load();
  }

  async function handleSubmit() {
    if (!submission) return;
    await svc.submit(submission.id);
    load();
  }

  async function handleUnlock() {
    if (!submission) return;
    await svc.unlock(submission.id);
    load();
  }

  const delComplete = submission?.deliverables.filter((d) => d.status === "complete").length ?? 0;
  const delTotal = submission?.deliverables.filter((d) => d.status !== "not_required").length ?? 0;
  const chkComplete = submission?.checklist.filter((c) => c.checked).length ?? 0;
  const chkTotal = submission?.checklist.filter((c) => !c.notRequired).length ?? 0;

  if (!activeHackathon) { router.replace("/app"); return null; }

  return (
    <div className="p-lg">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-lg">
        <div className="flex items-end justify-between">
          <div>
          <h1 className="text-h1 font-semibold text-on-surface">Submission Prep</h1>
            <p className="font-mono text-[11px] text-on-surface-variant">Prepare your materials for external submission{timeLeft ? ` · ${timeLeft}` : ""}</p>
          </div>
        <div className="rounded border border-outline-variant/30 bg-surface-container-low px-lg py-sm">
          <p className="font-mono text-[10px] text-on-surface-variant">
            SSG-Hackathon prepares your submission materials. The final submission is made on the hackathon organiser&apos;s platform.
          </p>
        </div>

        {!submission && (
            <button type="button" onClick={handleCreate}
              className="inline-flex items-center gap-sm rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">
              <span className="material-symbols-outlined text-[16px]">add</span>Create Submission
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-xl">
            <div className="flex items-center gap-sm"><div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /><div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" /><div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" /></div>
          </div>
        ) : !submission ? (
          <div className="flex flex-col items-center gap-sm py-xl text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">task_alt</span>
            <p className="text-body-sm text-on-surface-variant">No submission yet. Create one to get started.</p>
          </div>
        ) : (
          <>
            {/* Status bar */}
            <div className="flex items-center justify-between rounded border border-outline-variant/30 bg-surface-container-low px-lg py-md">
              <div className="flex items-center gap-md">
                <span className={`rounded border px-sm py-xs font-mono text-[10px] ${
                  submission.status === "submitted" ? "text-[#3fb950] border-[#3fb950]/30 bg-[#3fb950]/5"
                  : submission.status === "draft" ? "text-on-surface-variant border-surface-variant"
                  : "text-primary border-primary/30"
                }`}>{submission.status.toUpperCase()}</span>
                <span className="font-mono text-[10px] text-on-surface-variant">{submission.locked ? "Locked" : "Draft mode"}</span>
              </div>
              <div className="flex items-center gap-sm">
                {!submission.locked && submission.status !== "submitted" && (
                  <button type="button" onClick={handleSubmit}
                    className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">Submit</button>
                )}
                {submission.locked && (
                  <button type="button" onClick={handleUnlock}
                    className="rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface transition-colors hover:border-on-surface">Unlock</button>
                )}
              </div>
            </div>

            {/* Tab nav */}
            <div className="flex gap-sm">
              {["overview", "deliverables", "checklist", "links"].map((t) => (
                <button key={t} type="button" onClick={() => setActiveTab(t)}
                  className={`rounded px-sm py-xs text-body-sm ${activeTab === t ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
                  <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Progress</h2>
                  <div className="flex flex-col gap-sm">
                    <ProgressBar label="Deliverables" value={delComplete} max={delTotal} color="bg-primary" />
                    <ProgressBar label="Checklist" value={chkComplete} max={chkTotal} color="text-[#3fb950] bg-[#3fb950]" />
                  </div>
                </div>
                <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
                  <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Hackathon Info</h2>
                  <div className="flex flex-col gap-xs font-mono text-[10px] text-on-surface-variant">
                    <p>{activeHackathon.name}</p>
                    <p>Organizer: {activeHackathon.organizer}</p>
                    {activeHackathon.endDate && <p>Ends: {new Date(activeHackathon.endDate).toLocaleDateString()}</p>}
                    {activeHackathon.website && <a href={activeHackathon.website} target="_blank" rel="noopener noreferrer" className="text-primary">Website ↗</a>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "deliverables" && (
              <div className="flex flex-col gap-xs">
                {submission.deliverables.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded border border-outline-variant/30 bg-surface-container-low px-lg py-md">
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">{d.name}</p>
                      {d.owner && <p className="font-mono text-[9px] text-on-surface-variant">Owner: {d.owner}</p>}
                    </div>
                    <select value={d.status} onChange={(e) => handleDeliverableStatus(d.id, e.target.value)}
                      className={`rounded border px-sm py-xs font-mono text-[10px] focus:outline-none ${
                        d.status === "complete" ? "text-[#3fb950] border-[#3fb950]/30" : d.status === "blocked" ? "text-error border-error/30" : "text-on-surface-variant border-surface-variant"
                      }`}>
                      <option value="incomplete">Incomplete</option>
                      <option value="in_progress">In Progress</option>
                      <option value="complete">Complete</option>
                      <option value="blocked">Blocked</option>
                      <option value="not_required">Not Required</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "checklist" && (
              <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                <div className="mb-md flex items-center justify-between">
                  <span className="font-mono text-[10px] text-on-surface-variant">{chkComplete}/{chkTotal} complete</span>
                  <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-container-highest">
                    <div className="h-full rounded-full bg-[#3fb950] transition-all" style={{ width: `${chkTotal ? (chkComplete / chkTotal) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="flex flex-col gap-sm">
                  {submission.checklist.map((item) => (
                    <label key={item.id} className="flex cursor-pointer items-center gap-sm">
                      <input type="checkbox" checked={item.checked} onChange={(e) => handleChecklistToggle(item.id, e.target.checked)}
                        className="h-4 w-4 rounded-[2px] border border-outline-variant bg-black text-primary focus:ring-1 focus:ring-primary focus:outline-none" />
                      <span className={`text-body-sm ${item.checked ? "text-on-surface-variant line-through" : "text-on-surface"}`}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "links" && (
              <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
                {editingLinks ? (
                  <div className="flex flex-col gap-md">
                    <div><label className="mb-xs block font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Title</label>
                      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" /></div>
                    {[
                      ["GitHub Repository", githubRepo, setGithubRepo],
                      ["Devpost URL", devpostUrl, setDevpostUrl],
                      ["Live Demo URL", liveDemoUrl, setLiveDemoUrl],
                      ["Video URL", videoUrl, setVideoUrl],
                      ["Presentation URL", presentationUrl, setPresentationUrl],
                    ].map(([label, val, setter]) => (
                      <div key={label as string}><label className="mb-xs block font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">{label as string}</label>
                        <input type="url" value={val as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)} className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" /></div>
                    ))}
                    <div className="flex gap-sm">
                      <button type="button" onClick={handleSaveLinks} className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary">Save</button>
                      <button type="button" onClick={() => setEditingLinks(false)} className="rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-sm">
                    <div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Submission Links</span>
                      <button type="button" onClick={() => setEditingLinks(true)} className="font-mono text-[10px] text-primary">Edit</button>
                    </div>
                    {[
                      ["GitHub", submission.githubRepo],
                      ["Devpost", submission.devpostUrl],
                      ["Live Demo", submission.liveDemoUrl],
                      ["Video", submission.videoUrl],
                      ["Presentation", submission.presentationUrl],
                    ].map(([label, url]) => url ? (
                      <div key={label as string} className="flex items-center gap-sm">
                        <span className="font-mono text-[10px] text-on-surface-variant w-20">{label as string}</span>
                        <a href={url as string} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-primary truncate hover:opacity-80">{url as string}</a>
                      </div>
                    ) : null)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-xs flex justify-between font-mono text-[10px] text-on-surface-variant">
        <span>{label}</span><span>{value}/{max}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

