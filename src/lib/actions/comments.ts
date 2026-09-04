"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { comments } from "@/db/schema";
import { containsProfanity } from "@/lib/moderation/profanity-filter";

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
    .update(comments)
    .set({ isHidden: true, moderationReason: `Reported by ${user.id}` })
    .where(eq(comments.id, commentId));

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
