import type { venues } from "../schema";
import type { Venue } from "@/lib/types";

type VenueRow = typeof venues.$inferSelect;

export function venueToDisplay(row: VenueRow): Venue {
  return {
    id: row.id,
    name: row.name,
    city: `${row.city}, ${row.state}`,
    fields: row.fieldCount ? `${row.fieldCount} ${row.surface ?? ""}`.trim() : (row.surface ?? ""),
    lights: row.hasLights,
    parking: row.parkingNotes ?? "",
  };
}
