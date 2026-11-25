"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { listings, cancellations } from "@/db/schema";
import { getListingById, getProfileById, getConnectionForListingAndProfiles } from "@/db/queries";
import {
  genderToDb,
  levelToDb,
  refFeeToDb,
  timeWindowToDb,
  travelRadiusToDb,
  competitivePreferenceToDb,
} from "@/db/mappers";
import type { CompetitivePreference, Gender, Level, RefFee, TimeWindow, TravelRadius } from "@/lib/types";
import type { cancellationReasonEnum } from "@/db/schema/enums";
import { containsProfanity } from "@/lib/moderation/profanity-filter";
import { sendRatingReminderEmail } from "@/lib/email/rating-reminder-notification";
import { isRateLimited, MAX_LEN, tooLong } from "@/lib/limits";

function readListingText(formData: FormData) {
  const text = (key: string) => String(formData.get(key) || "").trim();
  const fields = {
    teamName: text("teamName"),
    location: text("location"),
    date: text("date"),
    subLevel: text("subLevel"),
    fieldNumber: text("fieldNumber"),
    notes: text("notes"),
    homeColor: text("homeColor"),
    awayColor: text("awayColor"),
  };

  if (!fields.teamName || !fields.location || !fields.date || !fields.subLevel) {
    return { error: "Team name, league, location, and date are required." } as const;
  }
  if (
    tooLong([
      [fields.teamName, MAX_LEN.name],
      [fields.location, MAX_LEN.location],
      [fields.date, 10],
      [fields.subLevel, MAX_LEN.short],
      [fields.fieldNumber, MAX_LEN.short],
      [fields.homeColor, MAX_LEN.short],
      [fields.awayColor, MAX_LEN.short],
    ])
  ) {
    return { error: "One of the fields is too long. Please shorten it and try again." } as const;
  }
  if (fields.notes.length > MAX_LEN.notes) {
    return { error: `Notes can be up to ${MAX_LEN.notes} characters.` } as const;
  }
  // subLevel is free text now that "Other" lets coaches type a league, and shows on the board.
  const publicText = [fields.teamName, fields.subLevel, fields.fieldNumber, fields.notes, fields.homeColor, fields.awayColor];
  if (publicText.some(containsProfanity)) {
    return { error: "That listing contains language that isn't allowed here." } as const;
  }
  return { fields } as const;
}

export async function createListingAction(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to post a listing." };
  if (await isRateLimited("listing", 10, 60 * 60_000, user.id)) {
    return { error: "You've posted a lot of listings this hour. Please try again a bit later." };
  }

  const parsed = readListingText(formData);
  if ("error" in parsed) return parsed;
  const { teamName, location, date, subLevel, fieldNumber, notes, homeColor, awayColor } = parsed.fields;

  await db.insert(listings).values({
    ownerId: user.id,
    teamName,
    gender: genderToDb(formData.get("gender") as Gender),
    ageGroup: String(formData.get("age")),
    level: levelToDb(formData.get("level") as Level),
    subLevel,
    competitivePreference: competitivePreferenceToDb(formData.get("competitivePreference") as CompetitivePreference),
    matchDate: date,
    timeWindow: timeWindowToDb(formData.get("time") as TimeWindow),
    venueId: null,
    locationText: location,
    fieldNumber: fieldNumber || null,
    travelRadiusMiles: travelRadiusToDb(formData.get("travelRadius") as TravelRadius),
    isHosting: formData.get("isHosting") === "on",
    hasRef: formData.get("refFee") !== "No Ref",
    refFeeSplit: refFeeToDb(formData.get("refFee") as RefFee),
    fieldFeeShare: formData.get("hasFieldFee") === "on",
    hydrationStation: formData.get("hydrationStation") === "on",
    canopiesForOpponent: formData.get("canopiesForOpponent") === "on",
    isRecorded: formData.get("isRecorded") === "on",
    homeColor: homeColor || null,
    awayColor: awayColor || null,
    notes: notes || null,
    status: "open",
  });

  revalidatePath("/board");
  return {};
}

export async function updateListingAction(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const existing = await getListingById(id);
  if (!existing) return { error: "That listing no longer exists." };
  if (existing.ownerId !== user.id) return { error: "You can only edit your own listings." };

  const parsed = readListingText(formData);
  if ("error" in parsed) return parsed;
  const { teamName, location, date, subLevel, fieldNumber, notes, homeColor, awayColor } = parsed.fields;

  await db
    .update(listings)
    .set({
      teamName,
      gender: genderToDb(formData.get("gender") as Gender),
      ageGroup: String(formData.get("age")),
      level: levelToDb(formData.get("level") as Level),
      subLevel,
      competitivePreference: competitivePreferenceToDb(formData.get("competitivePreference") as CompetitivePreference),
      matchDate: date,
      timeWindow: timeWindowToDb(formData.get("time") as TimeWindow),
      locationText: location,
      fieldNumber: fieldNumber || null,
      travelRadiusMiles: travelRadiusToDb(formData.get("travelRadius") as TravelRadius),
      isHosting: formData.get("isHosting") === "on",
      hasRef: formData.get("refFee") !== "No Ref",
      refFeeSplit: refFeeToDb(formData.get("refFee") as RefFee),
      fieldFeeShare: formData.get("hasFieldFee") === "on",
      hydrationStation: formData.get("hydrationStation") === "on",
      canopiesForOpponent: formData.get("canopiesForOpponent") === "on",
      isRecorded: formData.get("isRecorded") === "on",
      homeColor: homeColor || null,
      awayColor: awayColor || null,
      notes: notes || null,
    })
    .where(eq(listings.id, id));

  revalidatePath("/board");
  revalidatePath(`/listings/${id}`);
  return {};
}

export async function cancelListingAction(
  id: string,
  reasonCode: (typeof cancellationReasonEnum.enumValues)[number],
  reasonText: string,
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const existing = await getListingById(id);
  if (!existing) return { error: "That listing no longer exists." };
  if (existing.ownerId !== user.id) return { error: "You can only cancel your own listings." };

  await db.update(listings).set({ status: "cancelled" }).where(eq(listings.id, id));
  await db.insert(cancellations).values({
    listingId: id,
    cancelledBy: user.id,
    reasonCode,
    reasonText: reasonText.trim().slice(0, MAX_LEN.notes) || null,
  });

  revalidatePath("/board");
  revalidatePath(`/listings/${id}`);
  revalidatePath("/calendar");
  return {};
}

export async function confirmListingMatchAction(id: string, opponentProfileId: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const existing = await getListingById(id);
  if (!existing) return { error: "That listing no longer exists." };
  if (existing.ownerId !== user.id) return { error: "You can only confirm your own listings." };
  if (existing.status !== "open") return { error: "This listing isn't open to confirm anymore." };
  if (!(await getConnectionForListingAndProfiles(id, user.id, opponentProfileId))) {
    return { error: "You can only confirm a coach who has contacted you about this listing." };
  }

  await db
    .update(listings)
    .set({ status: "matched", matchedProfileId: opponentProfileId })
    .where(eq(listings.id, id));

  revalidatePath("/board");
  revalidatePath("/posts");
  revalidatePath(`/listings/${id}`);
  revalidatePath("/calendar");
  return {};
}

export async function completeListingAction(id: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const existing = await getListingById(id);
  if (!existing) return { error: "That listing no longer exists." };
  if (existing.ownerId !== user.id) return { error: "You can only complete your own listings." };
  if (existing.status !== "matched") return { error: "Only a confirmed match can be marked completed." };

  await db.update(listings).set({ status: "completed" }).where(eq(listings.id, id));

  // Best-effort: prompts both coaches to rate the match now that it's playable-history, not
  // just an open listing. Never blocks completion (sendRatingReminderEmail never throws).
  if (existing.matchedProfileId) {
    const [ownerProfile, opponentProfile, connection] = await Promise.all([
      getProfileById(existing.ownerId),
      getProfileById(existing.matchedProfileId),
      getConnectionForListingAndProfiles(id, existing.ownerId, existing.matchedProfileId),
    ]);
    if (ownerProfile && opponentProfile && connection) {
      await Promise.all([
        sendRatingReminderEmail({
          to: ownerProfile.contactEmail,
          recipientCoachName: ownerProfile.coachName,
          otherTeamName: opponentProfile.teamName,
          listingTeamName: existing.teamName,
          connectionId: connection.id,
          actionPath: "/posts",
        }),
        sendRatingReminderEmail({
          to: opponentProfile.contactEmail,
          recipientCoachName: opponentProfile.coachName,
          otherTeamName: ownerProfile.teamName,
          listingTeamName: existing.teamName,
          connectionId: connection.id,
          actionPath: `/inbox/${connection.id}`,
        }),
      ]);
    }
  }

  revalidatePath("/board");
  revalidatePath("/posts");
  revalidatePath("/inbox");
  revalidatePath(`/listings/${id}`);
  return {};
}
