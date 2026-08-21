"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { comments } from "@/db/schema";

export async function addCommentAction(listingId: string, body: string): Promise<{ error?: string }> {
  if (!body.trim()) return { error: "Comment can't be empty." };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to comment." };

  await db.insert(comments).values({
    listingId,
    authorId: user.id,
    body: body.trim(),
  });

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
