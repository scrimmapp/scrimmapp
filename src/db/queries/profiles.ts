import { eq } from "drizzle-orm";
import { db } from "../client";
import { profiles } from "../schema";

export function getProfileById(id: string) {
  return db.select().from(profiles).where(eq(profiles.id, id)).then((rows) => rows[0]);
}

export function listProfiles() {
  return db.select().from(profiles);
}
