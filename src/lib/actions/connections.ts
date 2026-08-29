"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, isNull, ne, or } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { connections, messages } from "@/db/schema";
import { getListingById, getProfileById } from "@/db/queries";
import { sendInquiryNotificationEmail } from "@/lib/email/inquiry-notification";
import { sendReplyNotificationEmail } from "@/lib/email/reply-notification";

export async function sendConnectionAction(listingId: string, message: string): Promise<{ error?: string; connectionId?: string }> {
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

  // Best-effort: a coach shouldn't miss an inquiry just because they haven't opened the app.
  // sendInquiryNotificationEmail never throws, so a delivery failure can't undo the inquiry
  // above; it's logged to email_log instead.
  const [senderProfile, ownerProfile] = await Promise.all([
    getProfileById(user.id),
    getProfileById(listing.ownerId),
  ]);
  if (ownerProfile) {
    await sendInquiryNotificationEmail({
      to: ownerProfile.contactEmail,
      ownerCoachName: ownerProfile.coachName,
      fromTeamName: senderProfile?.teamName ?? "A coach",
      listingTeamName: listing.teamName,
      listingId,
      message: message.trim(),
    });
  }

  revalidatePath("/inbox");
  return { connectionId: connection.id };
}

export async function markAllInboxReadAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const myConnections = await db
    .select({ id: connections.id })
    .from(connections)
    .where(or(eq(connections.toProfileId, user.id), eq(connections.fromProfileId, user.id)));
  const connectionIds = myConnections.map((c) => c.id);
  if (connectionIds.length === 0) return;

  // Only the other party's messages: a coach's own sent messages were never "unread" to them.
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(and(isNull(messages.readAt), ne(messages.senderId, user.id), inArray(messages.connectionId, connectionIds)));
}

export async function markThreadReadAction(connectionId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(and(eq(messages.connectionId, connectionId), isNull(messages.readAt), ne(messages.senderId, user.id)));
}

export async function sendReplyAction(connectionId: string, body: string): Promise<{ error?: string }> {
  if (!body.trim()) return { error: "Message can't be empty." };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to reply." };

  const [connection] = await db
    .select({ fromProfileId: connections.fromProfileId, toProfileId: connections.toProfileId, listingId: connections.listingId })
    .from(connections)
    .where(eq(connections.id, connectionId))
    .limit(1);

  if (!connection) return { error: "That conversation no longer exists." };
  if (connection.fromProfileId !== user.id && connection.toProfileId !== user.id) {
    return { error: "You're not part of this conversation." };
  }

  await db.insert(messages).values({
    connectionId,
    senderId: user.id,
    body: body.trim(),
  });

  const recipientId = connection.fromProfileId === user.id ? connection.toProfileId : connection.fromProfileId;
  const [senderProfile, recipientProfile, listing] = await Promise.all([
    getProfileById(user.id),
    getProfileById(recipientId),
    getListingById(connection.listingId),
  ]);
  if (recipientProfile && senderProfile && listing) {
    await sendReplyNotificationEmail({
      to: recipientProfile.contactEmail,
      recipientCoachName: recipientProfile.coachName,
      fromTeamName: senderProfile.teamName,
      listingTeamName: listing.teamName,
      connectionId,
      message: body.trim(),
    });
  }

  revalidatePath(`/inbox/${connectionId}`);
  revalidatePath("/inbox");
  return {};
}
