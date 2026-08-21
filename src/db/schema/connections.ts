import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { connectionStatusEnum } from "./enums";
import { listings } from "./listings";
import { profiles } from "./profiles";

export const connections = pgTable("connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").notNull().references(() => listings.id),
  fromProfileId: uuid("from_profile_id").notNull().references(() => profiles.id),
  toProfileId: uuid("to_profile_id").notNull().references(() => profiles.id),
  message: text("message").notNull(),
  status: connectionStatusEnum("status").notNull().default("sent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
});
