import { asc, eq } from "drizzle-orm";
import { db } from "../client";
import { comments } from "../schema";

export function listCommentsForListing(listingId: string) {
  return db
    .select()
    .from(comments)
    .where(eq(comments.listingId, listingId))
    .orderBy(asc(comments.createdAt));
}
