"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createDiscoveryService, EVENT_TYPE_LABELS, STATUS_COLORS, PIPELINE_LABELS, type HackathonEvent } from "@/core/discovery";
import { CardSkeleton } from "@/components/ui/page-skeleton";

export default function DiscoverPage() {
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [pipeline, setPipeline] = useState<HackathonEvent[]>([]);

  const svc = createDiscoveryService();

  useEffect(() => {
    Promise.all([svc.list(), svc.getPipeline("current-user").catch(() => [])])
      .then(([e, p]) => { setEvents(e); setPipeline(p); })
      .catch((err) => console.error("[Page] error:", err)).finally(() => setIsLoading(false));
  }, []);

  async function handlePipeline(eventId: string, status: string) {
    await svc.setPipelineStatus(eventId, "current-user", status);
    const updated = await svc.getPipeline("current-user").catch(() => []);
    setPipeline(updated);
  }

  const pipelineEventIds = new Set(pipeline.map((p) => p.id));
  const featured = events.filter((e) => e.featured);
  const upcoming = events.filter((e) => !e.featured && (e.status === "upcoming" || e.status === "registration_open"));

  let filtered = [...upcoming];
  if (search) { const q = search.toLowerCase(); filtered = filtered.filter((e) => e.name.toLowerCase().includes(q) || e.organizer.toLowerCase().includes(q)); }
  if (filterType) filtered = filtered.filter((e) => e.eventType === filterType);

  return (
    <div className="p-lg">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-lg">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">Discover</h1>
          <p className="font-mono text-[11px] text-on-surface-variant">Find your next hackathon</p>
        </div>

        <div className="flex flex-wrap items-center gap-sm">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hackathons..."
            className="h-8 w-64 rounded border border-outline-variant bg-black px-md text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="h-8 rounded border border-outline-variant bg-black px-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
            <option value="">All types</option>
            <option value="online">Online</option><option value="in_person">In Person</option><option value="hybrid">Hybrid</option>
          </select>
          <Link href="/app/discover/calendar" className="ml-auto rounded border border-outline-variant bg-black px-sm py-xs text-body-sm text-on-surface transition-colors hover:border-on-surface">
            Calendar View
          </Link>
        </div>

        {isLoading ? (
          <CardSkeleton count={6} />
        ) : (
          <>
            {pipeline.length > 0 && (
              <div>
                <h2 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">My Events</h2>
                <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3">
                  {pipeline.map((event) => (
                    <EventCard key={`p-${event.id}`} event={event} pipeline pipelinedStatus={event.pipelineStatus} onStatusChange={handlePipeline} />
                  ))}
                </div>
              </div>
            )}

            {featured.length > 0 && (
              <div>
                <h2 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Featured Events</h2>
                <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3">
                  {featured.map((event) => (
                    <EventCard key={`f-${event.id}`} event={event} inPipeline={pipelineEventIds.has(event.id)} onStatusChange={handlePipeline} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Upcoming Hackathons</h2>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-sm py-xl text-center">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">travel_explore</span>
                  <p className="text-body-sm text-on-surface-variant">No hackathons found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((event) => (
                    <EventCard key={`u-${event.id}`} event={event} inPipeline={pipelineEventIds.has(event.id)} onStatusChange={handlePipeline} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, inPipeline, pipeline, pipelinedStatus, onStatusChange }: {
  event: HackathonEvent; inPipeline?: boolean; pipeline?: boolean; pipelinedStatus?: string | null;
  onStatusChange: (id: string, status: string) => void;
}) {

  return (
    <Link href={`/app/discover/${event.slug}`}
      className="group flex flex-col rounded border border-outline-variant/30 bg-surface-container-low transition-colors hover:bg-surface-container overflow-hidden">
      <div className="h-24 bg-surface-container-highest bg-gradient-to-br from-surface-container-high to-surface-container" />
      <div className="flex flex-col gap-sm p-md">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-body-sm font-semibold text-on-surface truncate">{event.name}</h3>
            <p className="font-mono text-[10px] text-on-surface-variant">{event.organizer}</p>
          </div>
          {event.logoUrl && <img src={event.logoUrl} alt="" className="h-8 w-8 rounded object-cover" />}
        </div>
        <div className="flex flex-wrap gap-x-sm gap-y-xs font-mono text-[9px] text-on-surface-variant">
          <span className={`rounded border px-xs py-[1px] ${STATUS_COLORS[event.status] ?? ""}`}>{event.status.replace("_", " ")}</span>
          <span>{EVENT_TYPE_LABELS[event.eventType]}</span>
          {event.country && <span>{event.country}</span>}
          {event.prizePool && <span>{event.prizePool}</span>}
        </div>
        {event.startDate && (
          <p className="font-mono text-[9px] text-on-surface-variant">
            {new Date(event.startDate).toLocaleDateString()}{event.endDate ? ` — ${new Date(event.endDate).toLocaleDateString()}` : ""}
          </p>
        )}
        <div className="flex items-center gap-sm pt-xs">
          {(pipeline || pipelinedStatus) ? (
            <span className="rounded bg-primary/10 px-sm py-xs font-mono text-[9px] text-primary">
              {pipelinedStatus ? PIPELINE_LABELS[pipelinedStatus] ?? pipelinedStatus : "In Pipeline"}
            </span>
          ) : (
            <>
              {!inPipeline && (
                <button type="button" onClick={(e) => { e.preventDefault(); onStatusChange(event.id, "watching"); }}
                  className="rounded border border-outline-variant bg-black px-sm py-xs font-mono text-[9px] text-on-surface-variant transition-colors hover:border-on-surface">
                  Watch
                </button>
              )}
              {event.registrationUrl && (
                <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="rounded bg-primary px-sm py-xs font-mono text-[9px] font-medium text-on-primary transition-colors hover:bg-[#c01826]">
                  Register
                </a>
              )}
              {event.registrationClose && <span className="ml-auto font-mono text-[9px] text-on-surface-variant">Open</span>}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
