"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { genderToDb, levelToDb } from "@/db/mappers";
import type { Gender, Level } from "@/lib/types";

export async function updateProfileAction(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const coachName = String(formData.get("coachName") || "").trim();
  const teamName = String(formData.get("teamName") || "").trim();
  const contactEmail = String(formData.get("contactEmail") || "").trim();
  if (!coachName || !teamName || !contactEmail) {
    return { error: "Coach name, team name, and contact email are required." };
  }

  const clubName = String(formData.get("clubName") || "").trim();
  const division = String(formData.get("division") || "").trim();
  const defaultAgeGroup = String(formData.get("defaultAgeGroup") || "").trim();
  const defaultGenderRaw = String(formData.get("defaultGender") || "");
  const phone = String(formData.get("phone") || "").trim();
  const orgType = String(formData.get("orgType") || "Club") as Level;

  try {
    await db
      .update(profiles)
      .set({
        coachName,
        teamName,
        clubName: clubName || null,
        orgType: levelToDb(orgType),
        division: division || null,
        defaultAgeGroup: defaultAgeGroup || null,
        defaultGender: defaultGenderRaw ? genderToDb(defaultGenderRaw as Gender) : null,
        contactEmail,
        phone: phone || null,
      })
      .where(eq(profiles.id, user.id));
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "23505") {
      return { error: "That contact email is already in use by another account." };
    }
    throw err;
  }

  // The layout resolves the navbar's name/initials from the profile on every request, so
  // busting it (not just /profile) keeps a coach-name or team-name change from lagging in
  // the header until an unrelated navigation happens to re-render it.
  revalidatePath("/", "layout");
  return {};
}
