import { pgTable, uuid, text, integer, boolean, date, time, timestamp } from "drizzle-orm/pg-core";
import { programLevelEnum, genderEnum, timeWindowEnum, refFeeSplitEnum, listingStatusEnum } from "./enums";
import { profiles } from "./profiles";
import { venues } from "./venues";

export const listings = pgTable("listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull().references(() => profiles.id),
  teamName: text("team_name").notNull(),
  gender: genderEnum("gender").notNull(),
  ageGroup: text("age_group").notNull(),
  level: programLevelEnum("level").notNull(),
  subLevel: text("sub_level").notNull(),
  matchDate: date("match_date").notNull(),
  timeWindow: timeWindowEnum("time_window").notNull(),
  kickoffTime: time("kickoff_time"),
  venueId: uuid("venue_id").references(() => venues.id),
  locationText: text("location_text").notNull(),
  travelRadiusMiles: integer("travel_radius_miles").notNull(),
  isHosting: boolean("is_hosting").notNull().default(false),
  hasRef: boolean("has_ref").notNull().default(false),
  refFeeSplit: refFeeSplitEnum("ref_fee_split").notNull(),
  fieldFeeShare: boolean("field_fee_share").notNull().default(false),
  matchFormat: text("match_format"),
  // Simple free-text rather than a color picker/enum, per Javi: "Home (light colors) / Away
  // (dark colors)" is meant as a quick heads-up so two teams don't both show up in white, not
  // a precise jersey-color registry.
  homeColor: text("home_color"),
  awayColor: text("away_color"),
  notes: text("notes"),
  status: listingStatusEnum("status").notNull().default("open"),
  matchedProfileId: uuid("matched_profile_id").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
