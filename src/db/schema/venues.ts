import { pgTable, uuid, text, integer, boolean, doublePrecision, type AnyPgColumn } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const venues = pgTable("venues", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  fieldCount: integer("field_count"),
  surface: text("surface"),
  hasLights: boolean("has_lights").notNull().default(false),
  parkingNotes: text("parking_notes"),
  // Nullable: circular with profiles.home_venue_id. See the note there.
  createdBy: uuid("created_by").references((): AnyPgColumn => profiles.id),
  isPublic: boolean("is_public").notNull().default(true),
});
