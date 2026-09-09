"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { connections, listings, profiles, ratings } from "@/db/schema";

// Shared setup for both rating directions: resolve who the rater is rating, and confirm the
// match is actually completed and the two of them are the confirmed owner/opponent pair for it.
async function resolveCompletedMatch(connectionId: string, userId: string) {
  const [connection] = await db
    .select({ fromProfileId: connections.fromProfileId, toProfileId: connections.toProfileId, listingId: connections.listingId })
    .from(connections)
    .where(eq(connections.id, connectionId))
    .limit(1);
  if (!connection) return { error: "That conversation no longer exists." } as const;
  if (connection.fromProfileId !== userId && connection.toProfileId !== userId) {
    return { error: "You're not part of this conversation." } as const;
  }

  const rateeId = connection.fromProfileId === userId ? connection.toProfileId : connection.fromProfileId;

  const [listing] = await db
    .select({ status: listings.status, ownerId: listings.ownerId, matchedProfileId: listings.matchedProfileId })
    .from(listings)
    .where(eq(listings.id, connection.listingId))
    .limit(1);
  if (!listing) return { error: "That listing no longer exists." } as const;
  if (listing.status !== "completed") return { error: "This scrimmage hasn't been marked completed yet." } as const;
  if (listing.ownerId !== userId && listing.matchedProfileId !== userId) {
    return { error: "Only the two coaches in this scrimmage can rate each other." } as const;
  }
  if (listing.ownerId !== rateeId && listing.matchedProfileId !== rateeId) {
    return { error: "Only the confirmed opponent for this scrimmage can be rated." } as const;
  }

  return { rateeId, isOwner: listing.ownerId === userId } as const;
}

async function insertRating(
  connectionId: string,
  raterId: string,
  rateeId: string,
  stars: number,
  // Asked in both directions, always provided by either caller.
  shared: { onTime: boolean; accurateFieldInfo: boolean; respectfulSidelines: boolean },
  // Direction-specific: each caller provides only the subset that applies to it.
  directional: Partial<{
    goodCommunication: boolean;
    paidRefFee: boolean;
    fieldSetupQuality: boolean;
    refereesAsAgreed: boolean;
    evenlyMatchedTier: boolean;
    wouldTravelAgain: boolean;
  }>,
  comment: string | undefined,
): Promise<{ error?: string }> {
  if (stars < 1 || stars > 5) return { error: "Star rating must be between 1 and 5." };

  try {
    await db.insert(ratings).values({
      connectionId,
      raterId,
      rateeId,
      stars,
      onTime: shared.onTime,
      accurateFieldInfo: shared.accurateFieldInfo,
      respectfulSidelines: shared.respectfulSidelines,
      goodCommunication: directional.goodCommunication ?? null,
      paidRefFee: directional.paidRefFee ?? null,
      fieldSetupQuality: directional.fieldSetupQuality ?? null,
      refereesAsAgreed: directional.refereesAsAgreed ?? null,
      evenlyMatchedTier: directional.evenlyMatchedTier ?? null,
      wouldTravelAgain: directional.wouldTravelAgain ?? null,
      comment: comment?.trim() || null,
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
      reliabilityScore: sql`(${profiles.reliabilityScore} * ${profiles.ratingsCount} + ${stars}) / (${profiles.ratingsCount} + 1)`,
      ratingsCount: sql`${profiles.ratingsCount} + 1`,
    })
    .where(eq(profiles.id, rateeId));

  revalidatePath(`/inbox/${connectionId}`);
  revalidatePath("/posts");
  return {};
}

// Coach A (the listing owner) rates the visiting opponent back after a match.
export async function submitRatingAction(
  connectionId: string,
  input: {
    stars: number;
    onTime: boolean;
    goodCommunication: boolean;
    accurateFieldInfo: boolean;
    paidRefFee: boolean;
    respectfulSidelines: boolean;
    comment?: string;
  },
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to leave a rating." };

  const context = await resolveCompletedMatch(connectionId, user.id);
  if ("error" in context) return context;
  if (!context.isOwner) return { error: "Only the listing owner can leave this rating." };

  return insertRating(
    connectionId,
    user.id,
    context.rateeId,
    input.stars,
    { onTime: input.onTime, accurateFieldInfo: input.accurateFieldInfo, respectfulSidelines: input.respectfulSidelines },
    { goodCommunication: input.goodCommunication, paidRefFee: input.paidRefFee },
    input.comment,
  );
}

// Coach B (the visiting/matched opponent) rates the host back, per Javi's two-way rating
// request: a different, faster checklist (Uber/Airbnb-style quick badges) than the owner side.
export async function submitHostRatingAction(
  connectionId: string,
  input: {
    stars: number;
    accurateFieldInfo: boolean;
    onTime: boolean;
    fieldSetupQuality: boolean;
    refereesAsAgreed: boolean;
    evenlyMatchedTier: boolean;
    respectfulSidelines: boolean;
    wouldTravelAgain: boolean;
    comment?: string;
  },
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to leave a rating." };

  const context = await resolveCompletedMatch(connectionId, user.id);
  if ("error" in context) return context;
  if (context.isOwner) return { error: "Only the visiting/matched opponent can leave this rating." };

  return insertRating(
    connectionId,
    user.id,
    context.rateeId,
    input.stars,
    { onTime: input.onTime, accurateFieldInfo: input.accurateFieldInfo, respectfulSidelines: input.respectfulSidelines },
    {
      fieldSetupQuality: input.fieldSetupQuality,
      refereesAsAgreed: input.refereesAsAgreed,
      evenlyMatchedTier: input.evenlyMatchedTier,
      wouldTravelAgain: input.wouldTravelAgain,
    },
    input.comment,
  );
}
