import { and, asc, eq } from "drizzle-orm";
import { db } from "../client";
import { comments } from "../schema";

export function listCommentsForListing(listingId: string) {
  return db
    .select()
    .from(comments)
    .where(and(eq(comments.listingId, listingId), eq(comments.isHidden, false)))
    .orderBy(asc(comments.createdAt));
}
