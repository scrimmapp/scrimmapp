import { randomUUID } from "crypto";
import { seedCalendarEvents, seedInbox, seedListings, seedVenues } from "@/lib/mock-data";
import {
  genderToDb,
  levelToDb,
  refFeeToDb,
  timeWindowToDb,
  travelRadiusToDb,
} from "../mappers";

/**
 * Turns the app's existing mock-data.ts arrays into insertable rows for every table that has
 * a real mock source. Pure and DB-free: every id is generated up front so the whole object
 * graph's foreign keys are already resolved before any insert happens.
 *
 * comments, ratings, cancellations, and email_log have no mock source (none of those flows
 * are built yet) and are intentionally not produced here; seed/run.ts leaves those tables
 * empty, matching the app's own current state.
 */
export function buildSeedRows() {
  // --- venues -----------------------------------------------------------
  // "12 Turf Pitches" parses into field_count/surface; "Stadium Grass Pitch" has no leading
  // number and falls back to field_count: null with the whole phrase kept as surface.
  const venueIdByMockId = new Map<string, string>();
  const venues = seedVenues.map((v) => {
    const id = randomUUID();
    venueIdByMockId.set(v.id, id);
    const [city, state] = v.city.split(",").map((s) => s.trim());
    const fieldsMatch = v.fields.match(/^(\d+)\s+(.*)$/);
    return {
      id,
      name: v.name,
      address: null as string | null,
      city: city ?? v.city,
      state: state ?? "CA",
      lat: null as number | null,
      lng: null as number | null,
      fieldCount: fieldsMatch ? Number(fieldsMatch[1]) : null,
      surface: fieldsMatch ? fieldsMatch[2] : v.fields,
      hasLights: v.lights,
      parkingNotes: v.parking,
      createdBy: null as string | null,
      isPublic: true,
    };
  });

  // --- profiles -----------------------------------------------------------
  // Only Javi's name/team come from a real mock source (app-data.tsx's defaultCoach). His
  // org type / age group / gender are back-filled from scrim-1, the one listing that's
  // actually his team. Everything else here is an explicit placeholder, not a real fact.
  const javiId = randomUUID();
  const javiProfile = {
    id: javiId,
    coachName: "Javi Reyes",
    teamName: "Irvine Strikers FC",
    clubName: null as string | null,
    orgType: levelToDb(seedListings[0].level),
    division: null as string | null,
    defaultAgeGroup: seedListings[0].age,
    defaultGender: genderToDb(seedListings[0].gender),
    contactEmail: "javi@irvinestrikers.example",
    phone: null as string | null,
    homeVenueId: null as string | null,
    reliabilityScore: 0,
    ratingsCount: 0,
  };

  // scrim-2/3/4 belong to teams that exist only as strings in the mock, with no profile
  // behind them anywhere in the app. listings.owner_id is NOT NULL + FK, so each needs a
  // minimal placeholder profile, org_type derived from that listing's own level field.
  function placeholderProfile(teamName: string, level: (typeof seedListings)[number]["level"]) {
    return {
      id: randomUUID(),
      coachName: `${teamName} Contact`,
      teamName,
      clubName: null as string | null,
      orgType: levelToDb(level),
      division: null as string | null,
      defaultAgeGroup: null as string | null,
      defaultGender: null as "boys" | "girls" | null,
      contactEmail: `contact@${teamName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.example`,
      phone: null as string | null,
      homeVenueId: null as string | null,
      reliabilityScore: 0,
      ratingsCount: 0,
    };
  }

  const missionViejo = placeholderProfile("Mission Viejo HS Varsity", seedListings[1].level);
  const southCounty = placeholderProfile("South County AYSO Select", seedListings[2].level);
  const tustinBlues = placeholderProfile("Tustin Blues U16 Girls", seedListings[3].level);
  const saddleback = placeholderProfile("Saddleback United U14", "Rec");

  const profiles = [javiProfile, missionViejo, southCounty, tustinBlues, saddleback];

  const ownerByListingId: Record<string, string> = {
    "scrim-1": javiId,
    "scrim-2": missionViejo.id,
    "scrim-3": southCounty.id,
    "scrim-4": tustinBlues.id,
  };

  // --- listings -----------------------------------------------------------
  // venue_id stays null for all four: the mock's location strings were never ID-linked to
  // seedVenues in the app itself, so there's nothing to join on. location_text carries the
  // original string as-is instead.
  const listingIdByMockId = new Map<string, string>();
  const listings = seedListings.map((l) => {
    const id = randomUUID();
    listingIdByMockId.set(l.id, id);
    return {
      id,
      ownerId: ownerByListingId[l.id],
      teamName: l.teamName,
      gender: genderToDb(l.gender),
      ageGroup: l.age,
      level: levelToDb(l.level),
      subLevel: l.subLevel,
      matchDate: l.date,
      timeWindow: timeWindowToDb(l.time),
      kickoffTime: null as string | null,
      venueId: null as string | null,
      locationText: l.location,
      travelRadiusMiles: travelRadiusToDb(l.travelRadius),
      isHosting: l.isHosting,
      hasRef: l.hasRef,
      refFeeSplit: refFeeToDb(l.refFee),
      fieldFeeShare: l.hasFieldFee,
      matchFormat: null as string | null,
      notes: l.notes ?? null,
      status: "open" as const,
      matchedProfileId: null as string | null,
      createdAt: new Date(l.createdAt),
    };
  });

  // --- connections + messages -----------------------------------------------------------
  // The mock's flat "inbox message" doesn't cleanly split into thread-header/thread-entry.
  // Best-effort: one connection row (status "sent", since isRead: false reads as "not yet
  // responded to") plus one message row under it.
  const connections = seedInbox.map((m) => ({
    id: randomUUID(),
    listingId: listingIdByMockId.get(m.listingId!)!,
    fromProfileId: saddleback.id,
    toProfileId: javiId,
    message: m.body,
    status: "sent" as const,
    createdAt: new Date(m.timestamp),
    respondedAt: null as Date | null,
  }));

  const messages = seedInbox.map((m, i) => ({
    id: randomUUID(),
    connectionId: connections[i].id,
    senderId: saddleback.id,
    body: m.body,
    readAt: m.isRead ? new Date(m.timestamp) : (null as Date | null),
    createdAt: new Date(m.timestamp),
  }));

  // --- calendar_events -----------------------------------------------------------
  // Clean 1:1 mapping, both attributed to Javi. kind values already match the enum exactly.
  const calendarEvents = seedCalendarEvents.map((e) => ({
    id: randomUUID(),
    profileId: javiId,
    title: e.title,
    eventDate: e.date,
    timeWindow: timeWindowToDb(e.time),
    kind: e.kind,
    venueId: null as string | null,
    locationText: e.location ?? null,
    linkedListingId: null as string | null,
    notes: null as string | null,
  }));

  return { venues, profiles, listings, connections, messages, calendarEvents };
}
