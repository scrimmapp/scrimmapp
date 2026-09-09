"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { feedback } from "@/db/schema";
import { containsProfanity } from "@/lib/moderation/profanity-filter";
import { sendFeedbackNotificationEmail } from "@/lib/email/feedback-notification";
import type { feedbackCategoryEnum } from "@/db/schema/enums";

type FeedbackCategory = (typeof feedbackCategoryEnum.enumValues)[number];

// Open to logged-out visitors too, per Javi's footer feedback request: someone hitting a bug
// before they've even signed up should still be able to report it.
export async function submitFeedbackAction(
  category: FeedbackCategory,
  message: string,
  contactEmail: string,
): Promise<{ error?: string }> {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) return { error: "Please add a message before submitting." };
  if (containsProfanity(trimmedMessage) || containsProfanity(contactEmail)) {
    return { error: "That message contains language that isn't allowed here." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [row] = await db
    .insert(feedback)
    .values({
      profileId: user?.id ?? null,
      category,
      message: trimmedMessage,
      contactEmail: contactEmail.trim() || null,
    })
    .returning({ id: feedback.id });

  await sendFeedbackNotificationEmail({
    feedbackId: row.id,
    category,
    message: trimmedMessage,
    contactEmail: contactEmail.trim() || null,
  });

  return {};
}
