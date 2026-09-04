import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { emailLog } from "@/db/schema";
import { getResendClient } from "./resend";
import { captureServerException } from "@/lib/monitoring/posthog-server";

// Never throws: a notification failing to send should never break the action that triggered
// it (e.g. posting an inquiry still succeeds even if the owner's notification email fails).
// Every attempt is recorded in email_log regardless of outcome.
export async function sendTemplateEmail({
  to,
  subject,
  html,
  template,
  relatedType,
  relatedId,
}: {
  to: string;
  subject: string;
  html: string;
  template: string;
  relatedType?: string;
  relatedId?: string;
}): Promise<void> {
  const [logRow] = await db
    .insert(emailLog)
    .values({
      toEmail: to,
      template,
      relatedType: relatedType ?? null,
      relatedId: relatedId ?? null,
      status: "queued",
    })
    .returning({ id: emailLog.id });

  const resend = getResendClient();
  if (!resend) {
    await db
      .update(emailLog)
      .set({ status: "failed", error: "RESEND_API_KEY is not configured." })
      .where(eq(emailLog.id, logRow.id));
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || "ScrimmApp <onboarding@resend.dev>";

  try {
    const { data, error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      await db.update(emailLog).set({ status: "failed", error: error.message }).where(eq(emailLog.id, logRow.id));
      captureServerException(new Error(`Email send failed (${template}): ${error.message}`), { to, template });
      return;
    }
    await db
      .update(emailLog)
      .set({ status: "sent", providerMessageId: data?.id ?? null })
      .where(eq(emailLog.id, logRow.id));
  } catch (err) {
    await db
      .update(emailLog)
      .set({ status: "failed", error: err instanceof Error ? err.message : String(err) })
      .where(eq(emailLog.id, logRow.id));
    captureServerException(err, { to, template });
  }
}
