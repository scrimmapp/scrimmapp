import { and, desc, eq, isNull, ne, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../client";
import { connections, listings, messages, profiles } from "../schema";

// Unified thread list for a coach's inbox: every connection they're a party to, either side
// (received an inquiry, or sent one), each annotated with the other coach's identity, the
// listing, and the latest message so both Person A and Person B see every thread they're in.
export async function listThreadsForProfile(profileId: string) {
  const fromProfile = alias(profiles, "from_profile");
  const toProfile = alias(profiles, "to_profile");

  const rows = await db
    .select({
      connectionId: connections.id,
      listingId: connections.listingId,
      listingTeamName: listings.teamName,
      listingDate: listings.matchDate,
      fromProfileId: connections.fromProfileId,
      toProfileId: connections.toProfileId,
      fromTeamName: fromProfile.teamName,
      fromCoachName: fromProfile.coachName,
      toTeamName: toProfile.teamName,
      toCoachName: toProfile.coachName,
      connectionCreatedAt: connections.createdAt,
    })
    .from(connections)
    .innerJoin(listings, eq(listings.id, connections.listingId))
    .innerJoin(fromProfile, eq(fromProfile.id, connections.fromProfileId))
    .innerJoin(toProfile, eq(toProfile.id, connections.toProfileId))
    .where(or(eq(connections.fromProfileId, profileId), eq(connections.toProfileId, profileId)))
    .orderBy(desc(connections.createdAt));

  if (rows.length === 0) return [];

  const connectionIds = rows.map((r) => r.connectionId);
  const allMessages = await db
    .select({
      connectionId: messages.connectionId,
      senderId: messages.senderId,
      body: messages.body,
      readAt: messages.readAt,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .orderBy(desc(messages.createdAt));

  const messagesByConnection = new Map<string, typeof allMessages>();
  for (const m of allMessages) {
    if (!connectionIds.includes(m.connectionId)) continue;
    const list = messagesByConnection.get(m.connectionId) ?? [];
    list.push(m);
    messagesByConnection.set(m.connectionId, list);
  }

  return rows.map((r) => {
    const direction: "sent" | "received" = r.fromProfileId === profileId ? "sent" : "received";
    const otherTeamName = direction === "sent" ? r.toTeamName : r.fromTeamName;
    const otherCoachName = direction === "sent" ? r.toCoachName : r.fromCoachName;
    const threadMessages = messagesByConnection.get(r.connectionId) ?? [];
    const lastMessage = threadMessages[0];
    const unreadCount = threadMessages.filter((m) => m.senderId !== profileId && m.readAt === null).length;

    return {
      connectionId: r.connectionId,
      direction,
      otherTeamName,
      otherCoachName,
      listingId: r.listingId,
      listingTeamName: r.listingTeamName,
      listingDate: r.listingDate,
      lastMessageBody: lastMessage?.body ?? "",
      lastMessageAt: lastMessage?.createdAt ?? r.connectionCreatedAt,
      unreadCount,
    };
  });
}

// Full thread for one connection: every message in order, plus enough participant/listing
// context to render the header. Returns null if the requesting profile isn't a party to it,
// so a route can 404/redirect rather than leak another coach's conversation.
export async function getThreadForProfile(connectionId: string, profileId: string) {
  const [connection] = await db
    .select({
      id: connections.id,
      listingId: connections.listingId,
      fromProfileId: connections.fromProfileId,
      toProfileId: connections.toProfileId,
    })
    .from(connections)
    .where(eq(connections.id, connectionId))
    .limit(1);

  if (!connection) return null;
  if (connection.fromProfileId !== profileId && connection.toProfileId !== profileId) return null;

  const otherProfileId = connection.fromProfileId === profileId ? connection.toProfileId : connection.fromProfileId;

  const [listing] = await db
    .select({ id: listings.id, teamName: listings.teamName, matchDate: listings.matchDate })
    .from(listings)
    .where(eq(listings.id, connection.listingId))
    .limit(1);

  const [otherProfile] = await db
    .select({ id: profiles.id, teamName: profiles.teamName, coachName: profiles.coachName, clubName: profiles.clubName })
    .from(profiles)
    .where(eq(profiles.id, otherProfileId))
    .limit(1);

  const threadMessages = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      body: messages.body,
      readAt: messages.readAt,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.connectionId, connectionId))
    .orderBy(messages.createdAt);

  return { connection, listing, otherProfile, messages: threadMessages };
}

// The connection between two coaches for a given listing, whichever direction the inquiry
// went. Used to find which conversation to attach a post-match rating to.
export async function getConnectionForListingAndProfiles(listingId: string, profileA: string, profileB: string) {
  const rows = await db
    .select({ id: connections.id })
    .from(connections)
    .where(
      and(
        eq(connections.listingId, listingId),
        or(
          and(eq(connections.fromProfileId, profileA), eq(connections.toProfileId, profileB)),
          and(eq(connections.fromProfileId, profileB), eq(connections.toProfileId, profileA)),
        ),
      ),
    )
    .orderBy(desc(connections.createdAt))
    .limit(1);

  return rows[0];
}

// The coaches who inquired about a listing, so the owner can pick who to confirm as the
// matched opponent when booking it.
export async function listInquirersForListing(listingId: string) {
  const rows = await db
    .select({
      connectionId: connections.id,
      profileId: connections.fromProfileId,
      teamName: profiles.teamName,
      coachName: profiles.coachName,
    })
    .from(connections)
    .innerJoin(profiles, eq(profiles.id, connections.fromProfileId))
    .where(eq(connections.listingId, listingId))
    .orderBy(desc(connections.createdAt));

  return rows;
}

// A connection counts as unread for this profile if it holds a message from the other party
// that hasn't been read yet, regardless of which side started the conversation.
export async function listUnreadConnectionIds(profileId: string) {
  const rows = await db
    .select({ connectionId: connections.id })
    .from(connections)
    .innerJoin(messages, eq(messages.connectionId, connections.id))
    .where(
      and(
        or(eq(connections.toProfileId, profileId), eq(connections.fromProfileId, profileId)),
        isNull(messages.readAt),
        ne(messages.senderId, profileId),
      ),
    );

  return [...new Set(rows.map((r) => r.connectionId))];
}
