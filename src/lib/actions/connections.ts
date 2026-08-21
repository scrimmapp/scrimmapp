"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { connections, messages } from "@/db/schema";
import { getListingById } from "@/db/queries";

export async function sendConnectionAction(listingId: string, message: string): Promise<{ error?: string }> {
  if (!message.trim()) return { error: "Message can't be empty." };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to connect with a coach." };

  const listing = await getListingById(listingId);
  if (!listing) return { error: "That listing no longer exists." };
  if (listing.ownerId === user.id) return { error: "You can't send an inquiry on your own listing." };

  const [connection] = await db
    .insert(connections)
    .values({
      listingId,
      fromProfileId: user.id,
      toProfileId: listing.ownerId,
      message: message.trim(),
      status: "sent",
    })
    .returning({ id: connections.id });

  await db.insert(messages).values({
    connectionId: connection.id,
    senderId: user.id,
    body: message.trim(),
  });

  revalidatePath("/inbox");
  return {};
}

export async function markAllInboxReadAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const myConnections = await db
    .select({ id: connections.id })
    .from(connections)
    .where(eq(connections.toProfileId, user.id));
  const connectionIds = myConnections.map((c) => c.id);
  if (connectionIds.length === 0) return;

  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(and(isNull(messages.readAt), inArray(messages.connectionId, connectionIds)));
}
