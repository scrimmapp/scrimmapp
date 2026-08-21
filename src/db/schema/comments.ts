import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { listings } from "./listings";
import { profiles } from "./profiles";

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").notNull().references(() => listings.id),
  authorId: uuid("author_id").notNull().references(() => profiles.id),
  body: text("body").notNull(),
  isHidden: boolean("is_hidden").notNull().default(false),
  moderationReason: text("moderation_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
