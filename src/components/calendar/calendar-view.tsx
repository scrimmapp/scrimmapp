"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { AddEventDialog } from "@/components/calendar/add-event-dialog";
import { useAppData } from "@/lib/app-data";
import { buildMonthCells, isoDate, monthNames, weekdayLabels } from "@/lib/calendar";
import type { CalendarEvent, TimeWindow } from "@/lib/types";

interface UnifiedEvent {
  id: string;
  title: string;
  date: string;
  time: TimeWindow;
  location?: string;
  kind: CalendarEvent["kind"] | "scrimmage";
  listingId?: string;
}

const kindLabel: Record<UnifiedEvent["kind"], string> = {
  scrimmage: "Scrimmage",
  league: "League",
  tournament: "Tournament",
  practice: "Practice",
  blackout: "Blackout",
};

export function CalendarView() {
  const { calendarEvents, listings } = useAppData();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [addDate, setAddDate] = useState<string | null>(null);
  const [detail, setDetail] = useState<UnifiedEvent | null>(null);

  const events: UnifiedEvent[] = useMemo(() => {
    const fromListings: UnifiedEvent[] = listings
      .filter((l) => l.status !== "cancelled")
      .map((l) => ({
        id: l.id,
        title: `${l.teamName} (${l.gender} ${l.age})`,
        date: l.date,
        time: l.time,
        location: l.location,
        kind: "scrimmage",
        listingId: l.id,
      }));
    const fromCustom: UnifiedEvent[] = calendarEvents.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      location: e.location,
      kind: e.kind,
    }));
    return [...fromListings, ...fromCustom];
  }, [listings, calendarEvents]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, UnifiedEvent[]>();
    for (const ev of events) {
      const list = map.get(ev.date) ?? [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [events]);

  const cells = buildMonthCells(year, month);
  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate());

  function changeMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    else if (m > 11) { m = 0; y += 1; }
    setMonth(m);
    setYear(y);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-3 px-4 py-4">
      <div className="flex flex-col gap-2.5 border-b border-rule pb-2.5 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="inline-flex rounded-pill border border-pitch/25 bg-pitch-bg px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-pitch-ink">
            Season planning tool
          </span>
          <h1 className="mt-1 font-display text-xl font-extrabold tracking-tight text-ink md:text-2xl">
            {monthNames[month]} {year}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-control border border-rule-2 bg-surface p-1">
            <button onClick={() => changeMonth(-1)} className="rounded-[0.4rem] px-2.5 py-1 text-[11px] font-bold text-ink-2 hover:bg-surface-2 hover:text-ink">
              ← Prev
            </button>
            <button
              onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
              className="rounded-[0.4rem] px-2.5 py-1 text-[11px] font-bold text-pitch hover:bg-pitch-bg"
            >
              Today
            </button>
            <button onClick={() => changeMonth(1)} className="rounded-[0.4rem] px-2.5 py-1 text-[11px] font-bold text-ink-2 hover:bg-surface-2 hover:text-ink">
              Next →
            </button>
          </div>
          <Button variant="accent" size="sm" onClick={() => setAddDate(todayIso)}>
            + Add Game / Blackout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold uppercase tracking-wider text-muted">
        {weekdayLabels.map((d) => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} className="min-h-[3.75rem] min-w-0 rounded-control border border-rule/40 bg-surface/30" />;

          const dayEvents = eventsByDate.get(cell.date) ?? [];
          const timeCounts = new Map<string, number>();
          let conflict = false;
          for (const ev of dayEvents) {
            const n = (timeCounts.get(ev.time) ?? 0) + 1;
            timeCounts.set(ev.time, n);
            if (n > 1) conflict = true;
          }
          const isToday = cell.date === todayIso;

          return (
            <div
              key={cell.date}
              className={`group flex min-h-[3.75rem] min-w-0 flex-col justify-between rounded-control border p-1 transition-colors ${
                conflict
                  ? "border-crit/40 bg-crit-bg"
                  : isToday
                    ? "border-pitch/40 bg-pitch-bg"
                    : "border-rule bg-surface hover:border-rule-2"
              }`}
            >
              <div className="flex min-w-0 items-center justify-between gap-1">
                <span className={`text-[11px] font-bold ${isToday ? "text-pitch" : "text-ink-2"}`}>{cell.day}</span>
                {conflict && (
                  <>
                    <span
                      className="hidden shrink-0 rounded-pill bg-crit px-1.5 py-0.5 text-[8px] font-black uppercase text-white min-[480px]:inline-flex"
                      title="Scheduling conflict"
                    >
                      Conflict
                    </span>
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-crit min-[480px]:hidden"
                      role="img"
                      aria-label="Scheduling conflict"
                      title="Scheduling conflict"
                    />
                  </>
                )}
              </div>

              <div className="my-1 flex-1 space-y-1 overflow-y-auto">
                {dayEvents.map((ev) =>
                  ev.listingId ? (
                    <Link
                      key={ev.id}
                      href={`/listings/${ev.listingId}`}
                      className="block truncate rounded-[0.35rem] bg-pitch-bg px-1.5 py-1 text-[9px] font-bold text-pitch-ink hover:brightness-95"
                    >
                      {ev.title}
                    </Link>
                  ) : (
                    <button
                      key={ev.id}
                      onClick={() => setDetail(ev)}
                      className="block w-full truncate rounded-[0.35rem] bg-surface-2 px-1.5 py-1 text-left text-[9px] font-bold text-ink-2 hover:bg-surface-hover"
                    >
                      {ev.title}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => setAddDate(cell.date)}
                className="w-full rounded-[0.35rem] bg-surface-2 py-1 text-[9px] font-bold text-muted opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
              >
                + Add
              </button>
            </div>
          );
        })}
      </div>

      <AddEventDialog open={addDate !== null} onClose={() => setAddDate(null)} defaultDate={addDate ?? todayIso} />

      <Dialog open={detail !== null} onClose={() => setDetail(null)} title={detail?.title ?? ""}>
        {detail && (
          <div className="space-y-3 text-sm">
            <Badge tone="muted">{kindLabel[detail.kind]}</Badge>
            <p className="text-ink-2">
              {detail.date} · {detail.time}
              {detail.location ? ` · ${detail.location}` : ""}
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
