import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { emailStatusEnum } from "./enums";

export const emailLog = pgTable("email_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  toEmail: text("to_email").notNull(),
  template: text("template").notNull(),
  relatedType: text("related_type"),
  relatedId: uuid("related_id"),
  providerMessageId: text("provider_message_id"),
  status: emailStatusEnum("status").notNull().default("queued"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
