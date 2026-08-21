"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { calendarEvents } from "@/db/schema";
import { timeWindowToDb } from "@/db/mappers";
import type { CalendarEvent, TimeWindow } from "@/lib/types";

export async function createCalendarEventAction(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to add a calendar entry." };

  const title = String(formData.get("title") || "").trim();
  const date = String(formData.get("date") || "");
  if (!title || !date) return { error: "Title and date are required." };

  await db.insert(calendarEvents).values({
    profileId: user.id,
    title,
    eventDate: date,
    timeWindow: timeWindowToDb(formData.get("time") as TimeWindow),
    kind: formData.get("kind") as CalendarEvent["kind"],
    locationText: String(formData.get("location") || "").trim() || null,
  });

  revalidatePath("/calendar");
  return {};
}

async function getOwnCalendarEvent(id: string, userId: string) {
  const [row] = await db
    .select({ profileId: calendarEvents.profileId })
    .from(calendarEvents)
    .where(eq(calendarEvents.id, id));
  if (!row) return { error: "That entry no longer exists." } as const;
  if (row.profileId !== userId) return { error: "You can only manage your own calendar entries." } as const;
  return { error: undefined } as const;
}

export async function updateCalendarEventAction(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const guard = await getOwnCalendarEvent(id, user.id);
  if (guard.error) return { error: guard.error };

  const title = String(formData.get("title") || "").trim();
  const date = String(formData.get("date") || "");
  if (!title || !date) return { error: "Title and date are required." };

  await db
    .update(calendarEvents)
    .set({
      title,
      eventDate: date,
      timeWindow: timeWindowToDb(formData.get("time") as TimeWindow),
      kind: formData.get("kind") as CalendarEvent["kind"],
      locationText: String(formData.get("location") || "").trim() || null,
    })
    .where(eq(calendarEvents.id, id));

  revalidatePath("/calendar");
  return {};
}

export async function deleteCalendarEventAction(id: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const guard = await getOwnCalendarEvent(id, user.id);
  if (guard.error) return { error: guard.error };

  await db.delete(calendarEvents).where(eq(calendarEvents.id, id));

  revalidatePath("/calendar");
  return {};
}
