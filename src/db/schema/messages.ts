import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { connections } from "./connections";
import { profiles } from "./profiles";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  connectionId: uuid("connection_id").notNull().references(() => connections.id),
  senderId: uuid("sender_id").notNull().references(() => profiles.id),
  body: text("body").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
