import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../client";
import { connections, listings, messages, profiles } from "../schema";

// The flat inbox list: one row per inquiry received, using connections.message/createdAt
// directly for display rather than the message thread, matching the shape the UI has always
// shown (a single-message inbox, no thread view built yet). isRead reflects that connection's
// one initiating message, since no reply UI exists yet to create a second one.
export async function listInboxForProfile(profileId: string) {
  const rows = await db
    .select({
      connectionId: connections.id,
      fromTeamName: profiles.teamName,
      message: connections.message,
      createdAt: connections.createdAt,
      listingId: connections.listingId,
      listingTeamName: listings.teamName,
      listingDate: listings.matchDate,
      readAt: messages.readAt,
    })
    .from(connections)
    .innerJoin(profiles, eq(profiles.id, connections.fromProfileId))
    .innerJoin(listings, eq(listings.id, connections.listingId))
    .leftJoin(messages, eq(messages.connectionId, connections.id))
    .where(eq(connections.toProfileId, profileId))
    .orderBy(desc(connections.createdAt));

  return rows.map((r) => ({ ...r, isRead: r.readAt !== null }));
}

export async function listUnreadConnectionIds(profileId: string) {
  const rows = await db
    .select({ connectionId: connections.id })
    .from(connections)
    .innerJoin(messages, eq(messages.connectionId, connections.id))
    .where(and(eq(connections.toProfileId, profileId), isNull(messages.readAt)));

  return rows.map((r) => r.connectionId);
}
