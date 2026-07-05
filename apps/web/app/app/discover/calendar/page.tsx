"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createDiscoveryService, EVENT_TYPE_LABELS, type HackathonEvent } from "@/core/discovery";

export default function CalendarPage() {
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [view, setView] = useState<"month" | "agenda">("month");

  useEffect(() => {
    createDiscoveryService().list().then(setEvents).catch((err) => console.error("[Page] error:", err));
  }, []);

  const monthEvents = events.filter((e) => {
    if (!e.startDate) return false;
    const d = new Date(e.startDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  return (
    <div className="p-lg">
      <div className="mx-auto flex max-w-[1000px] flex-col gap-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 font-semibold text-on-surface">Calendar</h1>
            <p className="font-mono text-[11px] text-on-surface-variant">{events.length} hackathons</p>
          </div>
          <Link href="/app/discover" className="rounded border border-outline-variant bg-black px-sm py-xs text-body-sm text-on-surface transition-colors hover:border-on-surface">Discover</Link>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <button type="button" onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); } else setCurrentMonth((m) => m - 1); }}
              className="rounded border border-outline-variant bg-black px-sm py-xs text-body-sm text-on-surface">←</button>
            <h2 className="text-h2 font-semibold text-on-surface">
              {new Date(currentYear, currentMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <button type="button" onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); } else setCurrentMonth((m) => m + 1); }}
              className="rounded border border-outline-variant bg-black px-sm py-xs text-body-sm text-on-surface">→</button>
          </div>
          <div className="flex gap-xs rounded bg-surface-container p-xs">
            <button type="button" onClick={() => setView("month")} className={`rounded px-sm py-xs text-body-sm ${view === "month" ? "bg-secondary-container text-on-surface" : "text-on-surface-variant"}`}>Month</button>
            <button type="button" onClick={() => setView("agenda")} className={`rounded px-sm py-xs text-body-sm ${view === "agenda" ? "bg-secondary-container text-on-surface" : "text-on-surface-variant"}`}>Agenda</button>
          </div>
        </div>

        {view === "month" ? (
          <div className="rounded border border-outline-variant/30 bg-surface-container-low overflow-hidden">
            <div className="grid grid-cols-7 border-b border-outline-variant/30">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="px-md py-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-r border-outline-variant/30 last:border-r-0">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="min-h-[80px] border-b border-r border-outline-variant/30 p-sm" />)}
              {Array.from({ length: daysInMonth }).map((_, day) => {
                const dateEvents = monthEvents.filter((e) => e.startDate && new Date(e.startDate).getDate() === day + 1);
                return (
                  <div key={day} className="min-h-[80px] border-b border-r border-outline-variant/30 p-sm">
                    <span className="font-mono text-[10px] text-on-surface-variant">{day + 1}</span>
                    {dateEvents.map((e) => (
                      <Link key={e.id} href={`/app/discover/${e.slug}`}
                        className="mt-xs block truncate rounded bg-primary/10 px-xs py-[1px] font-mono text-[9px] text-primary">
                        {e.name}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-xs">
            {events.filter((e) => e.startDate).sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime()).map((e) => (
              <Link key={e.id} href={`/app/discover/${e.slug}`}
                className="flex items-center gap-md rounded border border-outline-variant/30 bg-surface-container-low px-lg py-md transition-colors hover:bg-surface-container">
                <div className="text-center">
                  <p className="text-h2 font-bold text-primary">{new Date(e.startDate!).getDate()}</p>
                  <p className="font-mono text-[9px] text-on-surface-variant">{new Date(e.startDate!).toLocaleDateString("en-US", { month: "short" })}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-medium text-on-surface">{e.name}</p>
                  <p className="font-mono text-[10px] text-on-surface-variant">{e.organizer} · {EVENT_TYPE_LABELS[e.eventType]}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
