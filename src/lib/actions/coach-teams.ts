"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { coachTeams } from "@/db/schema";
import { countTeamsForProfile } from "@/db/queries";
import { genderToDb, levelToDb } from "@/db/mappers";
import type { Gender, Level } from "@/lib/types";

const MAX_TEAMS_PER_COACH = 3;

export async function addTeamAction(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const teamName = String(formData.get("teamName") || "").trim();
  if (!teamName) return { error: "Team name is required." };

  const existingCount = await countTeamsForProfile(user.id);
  if (existingCount >= MAX_TEAMS_PER_COACH) {
    return { error: `You can list up to ${MAX_TEAMS_PER_COACH} teams. Remove one to add another.` };
  }

  await db.insert(coachTeams).values({
    profileId: user.id,
    teamName,
    gender: genderToDb(formData.get("gender") as Gender),
    ageGroup: String(formData.get("ageGroup")),
    level: levelToDb(formData.get("level") as Level),
    subLevel: String(formData.get("subLevel")),
  });

  revalidatePath("/profile");
  revalidatePath("/board");
  return {};
}

export async function deleteTeamAction(teamId: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  await db.delete(coachTeams).where(and(eq(coachTeams.id, teamId), eq(coachTeams.profileId, user.id)));

  revalidatePath("/profile");
  revalidatePath("/board");
  return {};
}
