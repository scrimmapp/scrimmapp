"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { connections, listings, profiles, ratings } from "@/db/schema";

export async function submitRatingAction(
  connectionId: string,
  input: {
    stars: number;
    onTime: boolean;
    goodCommunication: boolean;
    accurateFieldInfo: boolean;
    paidRefFee: boolean;
    comment?: string;
  },
): Promise<{ error?: string }> {
  if (input.stars < 1 || input.stars > 5) return { error: "Star rating must be between 1 and 5." };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to leave a rating." };

  const [connection] = await db
    .select({ fromProfileId: connections.fromProfileId, toProfileId: connections.toProfileId, listingId: connections.listingId })
    .from(connections)
    .where(eq(connections.id, connectionId))
    .limit(1);
  if (!connection) return { error: "That conversation no longer exists." };
  if (connection.fromProfileId !== user.id && connection.toProfileId !== user.id) {
    return { error: "You're not part of this conversation." };
  }

  const rateeId = connection.fromProfileId === user.id ? connection.toProfileId : connection.fromProfileId;

  const [listing] = await db
    .select({ status: listings.status, matchedProfileId: listings.matchedProfileId })
    .from(listings)
    .where(eq(listings.id, connection.listingId))
    .limit(1);
  if (!listing) return { error: "That listing no longer exists." };
  if (listing.status !== "completed") return { error: "This scrimmage hasn't been marked completed yet." };
  if (listing.matchedProfileId !== rateeId) {
    return { error: "Only the confirmed opponent for this scrimmage can be rated." };
  }

  try {
    await db.insert(ratings).values({
      connectionId,
      raterId: user.id,
      rateeId,
      stars: input.stars,
      onTime: input.onTime,
      goodCommunication: input.goodCommunication,
      accurateFieldInfo: input.accurateFieldInfo,
      paidRefFee: input.paidRefFee,
      comment: input.comment?.trim() || null,
    });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code?: string }).code === "23505") {
      return { error: "You've already rated this opponent for this scrimmage." };
    }
    throw err;
  }

  // Running average: new_score = (old_score * old_count + stars) / (old_count + 1).
  await db
    .update(profiles)
    .set({
      reliabilityScore: sql`(${profiles.reliabilityScore} * ${profiles.ratingsCount} + ${input.stars}) / (${profiles.ratingsCount} + 1)`,
      ratingsCount: sql`${profiles.ratingsCount} + 1`,
    })
    .where(eq(profiles.id, rateeId));

  revalidatePath(`/inbox/${connectionId}`);
  revalidatePath("/posts");
  return {};
}
