import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { feedbackCategoryEnum } from "./enums";
import { profiles } from "./profiles";

// Footer feedback widget, per Javi's Sep 2026 request. profileId is nullable: a logged-out
// visitor can still report an issue, so this can't require an account the way the rest of the
// app's write path does.
export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id),
  category: feedbackCategoryEnum("category").notNull(),
  message: text("message").notNull(),
  contactEmail: text("contact_email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
