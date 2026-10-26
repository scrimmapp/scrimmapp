"use server";

import { revalidatePath } from "next/cache";
import { count, eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { comments, commentReports } from "@/db/schema";
import { containsProfanity } from "@/lib/moderation/profanity-filter";

// A single report shouldn't be able to silently censor another coach's comment, so it only
// hides once this many distinct coaches have reported it.
const HIDE_AFTER_REPORT_COUNT = 2;

export async function addCommentAction(listingId: string, body: string): Promise<{ error?: string }> {
  const trimmed = body.trim();
  if (!trimmed) return { error: "Comment can't be empty." };
  if (containsProfanity(trimmed)) return { error: "That comment contains language that isn't allowed here." };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to comment." };

  await db.insert(comments).values({
    listingId,
    authorId: user.id,
    body: trimmed,
  });

  revalidatePath(`/listings/${listingId}`);
  return {};
}

export async function reportCommentAction(commentId: string, listingId: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  await db
    .insert(commentReports)
    .values({ commentId, reporterId: user.id })
    // Reporting the same comment twice is a no-op, not an error: the unique constraint on
    // (comment_id, reporter_id) is what actually stops one coach's report from counting twice.
    .onConflictDoNothing();

  const [{ value: reportCount }] = await db
    .select({ value: count() })
    .from(commentReports)
    .where(eq(commentReports.commentId, commentId));

  if (reportCount >= HIDE_AFTER_REPORT_COUNT) {
    await db
      .update(comments)
      .set({ isHidden: true, moderationReason: `Hidden after ${reportCount} reports` })
      .where(eq(comments.id, commentId));
  }

  revalidatePath(`/listings/${listingId}`);
  return {};
}

export async function deleteCommentAction(commentId: string, listingId: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const [existing] = await db
    .select({ authorId: comments.authorId })
    .from(comments)
    .where(eq(comments.id, commentId));
  if (!existing) return {};
  if (existing.authorId !== user.id) return { error: "You can only delete your own comments." };

  await db.delete(comments).where(eq(comments.id, commentId));

  revalidatePath(`/listings/${listingId}`);
  return {};
}
