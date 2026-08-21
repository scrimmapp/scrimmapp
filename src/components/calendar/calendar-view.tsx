"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddEventDialog } from "@/components/calendar/add-event-dialog";
import { deleteCalendarEventAction } from "@/lib/actions/calendar-events";
import { buildMonthCells, isoDate, monthNames, weekdayLabels } from "@/lib/calendar";
import { cn } from "@/lib/cn";
import type { CalendarEvent, Listing, TimeWindow } from "@/lib/types";

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

const kindDot: Record<UnifiedEvent["kind"], string> = {
  scrimmage: "bg-pitch",
  league: "bg-navy-ink",
  tournament: "bg-gold",
  practice: "bg-muted",
  blackout: "bg-crit",
};

export function CalendarView({
  initialEvents,
  initialListings,
}: {
  initialEvents: CalendarEvent[];
  initialListings: Listing[];
}) {
  const router = useRouter();
  const calendarEvents = initialEvents;
  const listings = initialListings;
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [addDate, setAddDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<UnifiedEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<UnifiedEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

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
  const selectedEvents = selectedDate ? (eventsByDate.get(selectedDate) ?? []) : [];

  function changeMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    else if (m > 11) { m = 0; y += 1; }
    setMonth(m);
    setYear(y);
  }

  function openEditEvent(ev: UnifiedEvent) {
    setSelectedDate(null);
    setEditingEvent(ev);
  }

  async function confirmDeleteEvent() {
    if (!deletingEvent) return;
    setDeleting(true);
    await deleteCalendarEventAction(deletingEvent.id);
    setDeleting(false);
    setDeletingEvent(null);
    setSelectedDate(null);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-3 px-4 py-4">
      <div className="flex flex-col gap-2.5 border-b border-rule pb-2.5 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="inline-flex rounded-pill border border-pitch/25 bg-pitch-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-pitch-ink">
            Season planning tool
          </span>
          <h1 className="mt-1 font-display text-lg font-extrabold tracking-tight text-ink md:text-xl">
            {monthNames[month]} {year}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-control border border-rule-2 bg-surface p-1">
            <button onClick={() => changeMonth(-1)} className="rounded-[0.4rem] px-2 py-0.5 text-[12px] font-bold text-ink transition-colors hover:bg-surface-2">
              ← Prev
            </button>
            <button
              onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
              className="rounded-[0.4rem] px-2 py-0.5 text-[12px] font-bold text-pitch transition-colors hover:bg-pitch-bg"
            >
              Today
            </button>
            <button onClick={() => changeMonth(1)} className="rounded-[0.4rem] px-2 py-0.5 text-[12px] font-bold text-ink transition-colors hover:bg-surface-2">
              Next →
            </button>
          </div>
          <Button variant="accent" size="sm" onClick={() => setAddDate(todayIso)}>
            + Add Game / Blackout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-ink">
        {weekdayLabels.map((d) => <div key={d}>{d}</div>)}
      </div>

      <motion.div
        key={`${year}-${month}`}
        className="grid grid-cols-7 gap-1"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.012 } } }}
      >
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} className="h-12 min-w-0 rounded-control border border-rule/40 bg-surface/30 sm:h-14" />;

          const dayEvents = eventsByDate.get(cell.date) ?? [];
          const timeCounts = new Map<string, number>();
          let conflict = false;
          for (const ev of dayEvents) {
            const n = (timeCounts.get(ev.time) ?? 0) + 1;
            timeCounts.set(ev.time, n);
            if (n > 1) conflict = true;
          }
          const isToday = cell.date === todayIso;
          const visibleDots = dayEvents.slice(0, 4);

          return (
            <motion.button
              key={cell.date}
              type="button"
              onClick={() => setSelectedDate(cell.date)}
              variants={{ hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1 } }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className={cn(
                "relative flex h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-control border p-1 text-center sm:h-14",
                conflict
                  ? "border-crit/50 bg-crit-bg"
                  : isToday
                    ? "border-pitch/50 bg-pitch-bg"
                    : "border-rule bg-surface hover:border-rule-2",
              )}
            >
              {conflict && (
                <motion.span
                  className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-crit"
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[12px] font-bold",
                  isToday ? "bg-pitch text-pitch-contrast" : "text-ink",
                )}
              >
                {cell.day}
              </span>
              {visibleDots.length > 0 && (
                <span className="flex items-center justify-center gap-0.5">
                  {visibleDots.map((ev) => (
                    <span key={ev.id} className={cn("h-1 w-1 rounded-full", kindDot[ev.kind])} />
                  ))}
                  {dayEvents.length > 4 && (
                    <span className="text-[9px] font-bold text-ink">+{dayEvents.length - 4}</span>
                  )}
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] font-semibold text-ink">
        {(Object.keys(kindLabel) as Array<keyof typeof kindLabel>).map((k) => (
          <span key={k} className="flex items-center gap-1">
            <span className={cn("h-1.5 w-1.5 rounded-full", kindDot[k])} />
            {kindLabel[k]}
          </span>
        ))}
      </div>

      <AddEventDialog
        key={editingEvent?.id ?? addDate ?? "new"}
        open={addDate !== null || editingEvent !== null}
        onClose={() => {
          setAddDate(null);
          setEditingEvent(null);
        }}
        defaultDate={addDate ?? todayIso}
        event={
          editingEvent
            ? {
                id: editingEvent.id,
                title: editingEvent.title,
                date: editingEvent.date,
                time: editingEvent.time,
                kind: editingEvent.kind as CalendarEvent["kind"],
                location: editingEvent.location,
              }
            : null
        }
      />

      <Dialog
        open={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : ""}
      >
        <div className="space-y-3">
          {selectedEvents.length === 0 ? (
            <p className="text-[13px] text-ink">Nothing scheduled yet.</p>
          ) : (
            <div className="space-y-1.5">
              {selectedEvents.map((ev) =>
                ev.listingId ? (
                  <Link
                    key={ev.id}
                    href={`/listings/${ev.listingId}`}
                    onClick={() => setSelectedDate(null)}
                    className="flex items-center justify-between gap-2 rounded-control border border-rule bg-paper px-3 py-2 text-[13px] font-bold text-ink transition-colors hover:bg-pitch-bg"
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", kindDot[ev.kind])} />
                      {ev.title}
                    </span>
                    <span className="text-[11px] font-semibold text-ink">{ev.time}</span>
                  </Link>
                ) : (
                  <div key={ev.id} className="flex items-center justify-between gap-2 rounded-control border border-rule bg-paper px-3 py-2 text-[13px] font-bold text-ink">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", kindDot[ev.kind])} />
                      <span className="truncate">{ev.title}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-[11px] font-semibold text-ink">{ev.time}</span>
                      <button
                        type="button"
                        onClick={() => openEditEvent(ev)}
                        className="text-[11px] font-bold text-pitch hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingEvent(ev)}
                        className="text-[11px] font-bold text-crit hover:underline"
                      >
                        Delete
                      </button>
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
          <Button
            variant="secondary"
            className="w-full normal-case"
            onClick={() => {
              const d = selectedDate;
              setSelectedDate(null);
              setAddDate(d);
            }}
          >
            + Add entry for this day
          </Button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={deletingEvent !== null}
        onClose={() => setDeletingEvent(null)}
        onConfirm={confirmDeleteEvent}
        confirming={deleting}
        title="Delete calendar entry?"
        description={deletingEvent ? `Remove "${deletingEvent.title}" from your planner. This can't be undone.` : ""}
        confirmLabel="Delete"
      />
    </div>
  );
}
