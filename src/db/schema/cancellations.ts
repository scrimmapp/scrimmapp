import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { cancellationReasonEnum } from "./enums";
import { listings } from "./listings";
import { profiles } from "./profiles";

export const cancellations = pgTable("cancellations", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").notNull().references(() => listings.id),
  cancelledBy: uuid("cancelled_by").notNull().references(() => profiles.id),
  reasonCode: cancellationReasonEnum("reason_code").notNull(),
  reasonText: text("reason_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
