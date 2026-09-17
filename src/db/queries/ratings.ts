import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "../client";
import { ratings, connections, listings } from "../schema";

// One rating per (connection, rater) by DB constraint, so this tells the UI whether the
// current coach has already rated this specific arranged match.
export function getRatingByConnectionAndRater(connectionId: string, raterId: string) {
  return db
    .select()
    .from(ratings)
    .where(and(eq(ratings.connectionId, connectionId), eq(ratings.raterId, raterId)))
    .then((rows) => rows[0]);
}

// Completed listings this coach is party to (as owner or matched opponent) with the arranged
// connection resolved, that this coach hasn't rated yet. Powers the "you have a scrimmage to
// rate" nav badge, per Javi Sep 2026.
export async function listPendingRatingsForProfile(profileId: string) {
  const candidates = await db
    .select({
      connectionId: connections.id,
      listingId: listings.id,
      listingTeamName: listings.teamName,
    })
    .from(listings)
    .innerJoin(
      connections,
      and(
        eq(connections.listingId, listings.id),
        or(
          and(eq(connections.fromProfileId, listings.ownerId), eq(connections.toProfileId, listings.matchedProfileId)),
          and(eq(connections.toProfileId, listings.ownerId), eq(connections.fromProfileId, listings.matchedProfileId)),
        ),
      ),
    )
    .where(and(eq(listings.status, "completed"), or(eq(listings.ownerId, profileId), eq(listings.matchedProfileId, profileId))));

  if (candidates.length === 0) return [];

  const alreadyRated = await db
    .select({ connectionId: ratings.connectionId })
    .from(ratings)
    .where(
      and(
        eq(ratings.raterId, profileId),
        inArray(ratings.connectionId, candidates.map((c) => c.connectionId)),
      ),
    );
  const ratedSet = new Set(alreadyRated.map((r) => r.connectionId));

  return candidates.filter((c) => !ratedSet.has(c.connectionId));
}
