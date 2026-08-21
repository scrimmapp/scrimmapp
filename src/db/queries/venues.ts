import { eq } from "drizzle-orm";
import { db } from "../client";
import { venues } from "../schema";

export function listPublicVenues() {
  return db.select().from(venues).where(eq(venues.isPublic, true));
}

export function getVenueById(id: string) {
  return db.select().from(venues).where(eq(venues.id, id)).then((rows) => rows[0]);
}
