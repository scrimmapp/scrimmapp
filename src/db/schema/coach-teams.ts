import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { programLevelEnum, genderEnum } from "./enums";
import { profiles } from "./profiles";

// A coach can run more than one team (common across age groups), so this is a separate table
// rather than more columns on profiles. Capped at 3 per coach at the app layer, per the
// onboarding requirement, not enforced in the schema since "cap at N rows" isn't a natural
// constraint in Postgres without a trigger, and the app is the only writer.
export const coachTeams = pgTable("coach_teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  teamName: text("team_name").notNull(),
  gender: genderEnum("gender").notNull(),
  ageGroup: text("age_group").notNull(),
  level: programLevelEnum("level").notNull(),
  subLevel: text("sub_level").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
