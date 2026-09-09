import { pgTable, uuid, text, integer, boolean, date, time, timestamp } from "drizzle-orm/pg-core";
import { programLevelEnum, genderEnum, timeWindowEnum, refFeeSplitEnum, listingStatusEnum, competitivePreferenceEnum } from "./enums";
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
  // How the poster wants an opponent to compare, not just what level they play at: whether
  // they're looking for a fair test (similar), a step up (stronger), or a lower-pressure game
  // to develop players (developing). Defaults to "similar" since that's the common case.
  competitivePreference: competitivePreferenceEnum("competitive_preference").notNull().default("similar"),
  matchDate: date("match_date").notNull(),
  timeWindow: timeWindowEnum("time_window").notNull(),
  kickoffTime: time("kickoff_time"),
  venueId: uuid("venue_id").references(() => venues.id),
  locationText: text("location_text").notNull(),
  // Separate from locationText: the facility/venue is resolved via Places Autocomplete, but a
  // 10+ field sports complex needs a specific field/pitch number too, per Javi: without this,
  // coaches and refs waste time guessing which field their match is on within a huge complex.
  fieldNumber: text("field_number"),
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
