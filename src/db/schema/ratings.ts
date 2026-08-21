import { pgTable, uuid, integer, boolean, text, timestamp, unique, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { connections } from "./connections";
import { profiles } from "./profiles";

export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    connectionId: uuid("connection_id").notNull().references(() => connections.id),
    raterId: uuid("rater_id").notNull().references(() => profiles.id),
    rateeId: uuid("ratee_id").notNull().references(() => profiles.id),
    stars: integer("stars").notNull(),
    onTime: boolean("on_time").notNull(),
    goodCommunication: boolean("good_communication").notNull(),
    accurateFieldInfo: boolean("accurate_field_info").notNull(),
    paidRefFee: boolean("paid_ref_fee").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One rating per person, per direction, per connection: a coach cannot rate the same
    // arranged match twice.
    unique("ratings_connection_rater_unique").on(table.connectionId, table.raterId),
    check("ratings_stars_range", sql`${table.stars} >= 1 AND ${table.stars} <= 5`),
  ],
);
