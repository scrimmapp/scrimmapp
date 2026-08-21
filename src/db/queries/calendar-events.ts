import { eq } from "drizzle-orm";
import { db } from "../client";
import { calendarEvents } from "../schema";

export function listCalendarEventsForProfile(profileId: string) {
  return db.select().from(calendarEvents).where(eq(calendarEvents.profileId, profileId));
}
