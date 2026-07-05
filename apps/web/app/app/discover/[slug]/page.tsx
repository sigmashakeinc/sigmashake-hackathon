"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createDiscoveryService, EVENT_TYPE_LABELS, STATUS_COLORS, type HackathonEvent } from "@/core/discovery";

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<HackathonEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerNotes, setOwnerNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  const svc = createDiscoveryService();

  useEffect(() => {
    svc.getBySlug(params.slug as string).then((e) => {
      setEvent(e); setOwnerNotes(e?.ownerNotes ?? "");
    }).catch((err) => console.error("[Page] error:", err)).finally(() => setIsLoading(false));
  }, [params.slug]);

  async function saveNotes() {
    if (!event) return;
    await svc.updateOwnerNote(event.id, ownerNotes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  async function handlePipeline(status: string) {
    if (!event) return;
    await svc.setPipelineStatus(event.id, "current-user", status);
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center">
      <div className="flex items-center gap-sm">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
      </div>
    </div>;
  }

  if (!event) {
    return <div className="flex h-full items-center justify-center">
      <p className="text-body-sm text-on-surface-variant">Event not found.</p>
    </div>;
  }

  return (
    <div className="overflow-y-auto p-lg scrollbar-thin">
      <div className="mx-auto max-w-[1000px]">
        <Link href="/app/discover" className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">
          ← Back to Discover
        </Link>

        <div className="mt-md rounded border border-outline-variant/30 bg-surface-container-low overflow-hidden">
          <div className="h-48 bg-surface-container-highest bg-gradient-to-br from-surface-container-high to-surface-container" />
          <div className="p-lg">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-h1 font-semibold text-on-surface">{event.name}</h1>
                <p className="mt-xs font-mono text-[11px] text-on-surface-variant">{event.organizer}</p>
              </div>
              <div className="flex items-center gap-sm">
                <button type="button" onClick={() => handlePipeline("watching")}
                  className="rounded border border-outline-variant bg-black px-sm py-xs text-body-sm text-on-surface transition-colors hover:border-on-surface">Watch</button>
                <button type="button" onClick={() => handlePipeline("interested")}
                  className="rounded border border-outline-variant bg-black px-sm py-xs text-body-sm text-on-surface transition-colors hover:border-on-surface">Interested</button>
                {event.registrationUrl && (
                  <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer"
                    className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">Register</a>
                )}
              </div>
            </div>

            <div className="mt-md flex flex-wrap gap-x-lg gap-y-sm font-mono text-[10px] text-on-surface-variant">
              <span className={`rounded border px-sm py-xs ${STATUS_COLORS[event.status] ?? ""}`}>{event.status.replace("_", " ")}</span>
              <span>{EVENT_TYPE_LABELS[event.eventType]}</span>
              {event.country && <span>{event.country}</span>}
              {event.location && <span>{event.location}</span>}
              {event.prizePool && <span>Prize: {event.prizePool}</span>}
              {event.difficulty !== "all" && <span>{event.difficulty}</span>}
            </div>

            <div className="mt-md grid grid-cols-2 gap-md font-mono text-[10px] text-on-surface-variant">
              {event.startDate && <div><span className="text-on-surface">Start:</span> {new Date(event.startDate).toLocaleDateString()}</div>}
              {event.endDate && <div><span className="text-on-surface">End:</span> {new Date(event.endDate).toLocaleDateString()}</div>}
              {event.registrationClose && <div><span className="text-on-surface">Reg closes:</span> {new Date(event.registrationClose).toLocaleDateString()}</div>}
              {event.submissionDeadline && <div><span className="text-on-surface">Submission:</span> {new Date(event.submissionDeadline).toLocaleDateString()}</div>}
              {event.maxTeamSize && <div><span className="text-on-surface">Team size:</span> {event.minTeamSize}-{event.maxTeamSize}</div>}
            </div>

            {event.description && (
              <div className="mt-md"><h2 className="mb-xs font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">About</h2>
                <p className="text-body-sm text-on-surface-variant whitespace-pre-wrap">{event.description}</p></div>
            )}

            {event.websiteUrl && (
              <div className="mt-md"><a href={event.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">Official Website →</a></div>
            )}
          </div>
        </div>

        {/* Owner Notes */}
        <div className="mt-lg rounded border border-outline-variant/30 bg-surface-container p-lg">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Owner Notes (Private)</h2>
            <div className="flex items-center gap-sm">
              {notesSaved && <span className="font-mono text-[10px] text-[#3fb950]">Saved</span>}
              <button type="button" onClick={saveNotes} className="rounded bg-primary px-sm py-xs font-mono text-[10px] font-medium text-on-primary">Save</button>
            </div>
          </div>
          <textarea value={ownerNotes} onChange={(e) => setOwnerNotes(e.target.value)}
            rows={4} placeholder="Private notes about this event..."
            className="mt-sm w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y" />
        </div>
      </div>
    </div>
  );
}
