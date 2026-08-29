import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { ratings } from "../schema";

// One rating per (connection, rater) by DB constraint, so this tells the UI whether the
// current coach has already rated this specific arranged match.
export function getRatingByConnectionAndRater(connectionId: string, raterId: string) {
  return db
    .select()
    .from(ratings)
    .where(and(eq(ratings.connectionId, connectionId), eq(ratings.raterId, raterId)))
    .then((rows) => rows[0]);
}
