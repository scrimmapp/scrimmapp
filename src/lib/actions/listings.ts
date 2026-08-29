"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { listings, cancellations } from "@/db/schema";
import { getListingById } from "@/db/queries";
import {
  genderToDb,
  levelToDb,
  refFeeToDb,
  timeWindowToDb,
  travelRadiusToDb,
} from "@/db/mappers";
import type { Gender, Level, RefFee, TimeWindow, TravelRadius } from "@/lib/types";
import type { cancellationReasonEnum } from "@/db/schema/enums";

export async function createListingAction(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to post a listing." };

  const teamName = String(formData.get("teamName") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const date = String(formData.get("date") || "");
  if (!teamName || !location || !date) return { error: "Team name, location, and date are required." };

  await db.insert(listings).values({
    ownerId: user.id,
    teamName,
    gender: genderToDb(formData.get("gender") as Gender),
    ageGroup: String(formData.get("age")),
    level: levelToDb(formData.get("level") as Level),
    subLevel: String(formData.get("subLevel")),
    matchDate: date,
    timeWindow: timeWindowToDb(formData.get("time") as TimeWindow),
    venueId: null,
    locationText: location,
    travelRadiusMiles: travelRadiusToDb(formData.get("travelRadius") as TravelRadius),
    isHosting: formData.get("isHosting") === "on",
    hasRef: true,
    refFeeSplit: refFeeToDb(formData.get("refFee") as RefFee),
    fieldFeeShare: formData.get("hasFieldFee") === "on",
    notes: String(formData.get("notes") || "").trim() || null,
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

  const teamName = String(formData.get("teamName") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const date = String(formData.get("date") || "");
  if (!teamName || !location || !date) return { error: "Team name, location, and date are required." };

  await db
    .update(listings)
    .set({
      teamName,
      gender: genderToDb(formData.get("gender") as Gender),
      ageGroup: String(formData.get("age")),
      level: levelToDb(formData.get("level") as Level),
      subLevel: String(formData.get("subLevel")),
      matchDate: date,
      timeWindow: timeWindowToDb(formData.get("time") as TimeWindow),
      locationText: location,
      travelRadiusMiles: travelRadiusToDb(formData.get("travelRadius") as TravelRadius),
      isHosting: formData.get("isHosting") === "on",
      refFeeSplit: refFeeToDb(formData.get("refFee") as RefFee),
      fieldFeeShare: formData.get("hasFieldFee") === "on",
      notes: String(formData.get("notes") || "").trim() || null,
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
    reasonText: reasonText.trim() || null,
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

  revalidatePath("/board");
  revalidatePath("/posts");
  revalidatePath(`/listings/${id}`);
  return {};
}
