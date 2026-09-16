import { and, count, desc, eq, ne, or } from "drizzle-orm";
import { db } from "../client";
import { listings, profiles } from "../schema";

export function listOpenListings() {
  return db.select().from(listings).where(eq(listings.status, "open")).orderBy(desc(listings.createdAt));
}

// Same as listOpenListings, but joined with the owning coach's profile: the board card shows
// who posted a listing and their reliability rating, which listOpenListings alone can't answer.
export function listOpenListingsWithCoach() {
  return db
    .select({
      listing: listings,
      coachName: profiles.coachName,
      reliabilityScore: profiles.reliabilityScore,
      ratingsCount: profiles.ratingsCount,
    })
    .from(listings)
    .innerJoin(profiles, eq(listings.ownerId, profiles.id))
    .where(eq(listings.status, "open"))
    .orderBy(desc(listings.createdAt));
}

export function getListingById(id: string) {
  return db.select().from(listings).where(eq(listings.id, id)).then((rows) => rows[0]);
}

// Same as getListingById, joined with the owning coach's profile for the listing detail page.
export function getListingWithCoachById(id: string) {
  return db
    .select({
      listing: listings,
      coachName: profiles.coachName,
      reliabilityScore: profiles.reliabilityScore,
      ratingsCount: profiles.ratingsCount,
    })
    .from(listings)
    .innerJoin(profiles, eq(listings.ownerId, profiles.id))
    .where(eq(listings.id, id))
    .then((rows) => rows[0]);
}

// A coach's own calendar shows their own listings, whether they're hosting or they're the
// matched opponent, not every listing on the board.
export function listListingsForProfileCalendar(profileId: string) {
  return db
    .select()
    .from(listings)
    .where(
      and(
        or(eq(listings.ownerId, profileId), eq(listings.matchedProfileId, profileId)),
        ne(listings.status, "cancelled"),
      ),
    );
}

export async function countListingsForProfile(profileId: string) {
  const [row] = await db.select({ count: count() }).from(listings).where(eq(listings.ownerId, profileId));
  return row?.count ?? 0;
}

// The "My Posts" tab: every listing this coach has posted, any status, newest first.
export function listOwnedListings(profileId: string) {
  return db.select().from(listings).where(eq(listings.ownerId, profileId)).orderBy(desc(listings.createdAt));
}
