import { and, count, desc, eq, ne, or } from "drizzle-orm";
import { db } from "../client";
import { listings } from "../schema";

export function listOpenListings() {
  return db.select().from(listings).where(eq(listings.status, "open")).orderBy(desc(listings.createdAt));
}

export function getListingById(id: string) {
  return db.select().from(listings).where(eq(listings.id, id)).then((rows) => rows[0]);
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
