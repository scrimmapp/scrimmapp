import { asc, count, eq } from "drizzle-orm";
import { db } from "../client";
import { coachTeams } from "../schema";

export function listTeamsForProfile(profileId: string) {
  return db.select().from(coachTeams).where(eq(coachTeams.profileId, profileId)).orderBy(asc(coachTeams.createdAt));
}

export async function countTeamsForProfile(profileId: string) {
  const [row] = await db.select({ count: count() }).from(coachTeams).where(eq(coachTeams.profileId, profileId));
  return row?.count ?? 0;
}
