import { pgTable, uuid, text, date, timestamp } from "drizzle-orm/pg-core";
import { timeWindowEnum, calendarEventKindEnum } from "./enums";
import { profiles } from "./profiles";
import { venues } from "./venues";
import { listings } from "./listings";

export const calendarEvents = pgTable("calendar_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profiles.id),
  title: text("title").notNull(),
  eventDate: date("event_date").notNull(),
  timeWindow: timeWindowEnum("time_window").notNull(),
  kind: calendarEventKindEnum("kind").notNull(),
  venueId: uuid("venue_id").references(() => venues.id),
  locationText: text("location_text"),
  linkedListingId: uuid("linked_listing_id").references(() => listings.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
