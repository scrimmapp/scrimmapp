import type { calendarEvents } from "../schema";
import type { CalendarEvent } from "@/lib/types";
import { timeWindowToDisplay } from "./time-window";
import { toDateString } from "./date";

type CalendarEventRow = typeof calendarEvents.$inferSelect;

export function calendarEventToDisplay(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    date: toDateString(row.eventDate),
    time: timeWindowToDisplay(row.timeWindow),
    location: row.locationText ?? undefined,
    // DB kind values already match CalendarEvent["kind"] exactly.
    kind: row.kind,
  };
}
