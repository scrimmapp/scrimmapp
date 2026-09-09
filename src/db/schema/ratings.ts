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
    // Shared across both rating directions (owner rating the visiting opponent, and the
    // opponent rating the host back): both sides always answer these.
    onTime: boolean("on_time").notNull(),
    accurateFieldInfo: boolean("accurate_field_info").notNull(),
    // Required in both directions at the app layer (see submitRatingAction), but nullable here
    // like the direction-specific fields below: safer for a hand-authored ALTER on a table that
    // may already have rows in some environment, and the DB constraint isn't load-bearing since
    // nothing reads this table outside the app.
    respectfulSidelines: boolean("respectful_sidelines"),
    // Owner-rating-opponent only (nullable: not asked in the reverse direction).
    goodCommunication: boolean("good_communication"),
    paidRefFee: boolean("paid_ref_fee"),
    // Opponent-rating-host only (nullable: not asked in the forward direction).
    fieldSetupQuality: boolean("field_setup_quality"),
    refereesAsAgreed: boolean("referees_as_agreed"),
    evenlyMatchedTier: boolean("evenly_matched_tier"),
    wouldTravelAgain: boolean("would_travel_again"),
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
