import type { TimeWindow } from "@/lib/types";

export type DbTimeWindow = "morning" | "afternoon" | "evening";

const toDb: Record<TimeWindow, DbTimeWindow> = {
  Morning: "morning",
  Afternoon: "afternoon",
  Evening: "evening",
};

const toDisplay: Record<DbTimeWindow, TimeWindow> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export function timeWindowToDb(value: TimeWindow): DbTimeWindow {
  return toDb[value];
}

export function timeWindowToDisplay(value: DbTimeWindow): TimeWindow {
  return toDisplay[value];
}
