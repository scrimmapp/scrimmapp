import { pgTable, uuid, text, integer, real, timestamp, type AnyPgColumn } from "drizzle-orm/pg-core";
import { programLevelEnum, genderEnum } from "./enums";
import { venues } from "./venues";

export const profiles = pgTable("profiles", {
  // FK to auth.users(id) added in migration 0002 (a hand-written migration, since Drizzle's
  // schema can't express a table it doesn't own). A Postgres trigger on auth.users creates
  // the matching row here on signup; app code never inserts a profile directly.
  id: uuid("id").primaryKey().defaultRandom(),
  coachName: text("coach_name").notNull(),
  teamName: text("team_name").notNull(),
  clubName: text("club_name"),
  orgType: programLevelEnum("org_type").notNull(),
  division: text("division"),
  defaultAgeGroup: text("default_age_group"),
  defaultGender: genderEnum("default_gender"),
  contactEmail: text("contact_email").notNull().unique(),
  phone: text("phone"),
  // Nullable: circular with venues.created_by. A coach can exist before their home venue is
  // set, and a venue can be recorded before the profile that owns it is fully created.
  homeVenueId: uuid("home_venue_id").references((): AnyPgColumn => venues.id),
  reliabilityScore: real("reliability_score").notNull().default(0),
  ratingsCount: integer("ratings_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
