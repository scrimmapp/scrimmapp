import { sendTemplateEmail } from "./send-email";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendInquiryNotificationEmail({
  to,
  ownerCoachName,
  fromTeamName,
  listingTeamName,
  listingId,
  message,
}: {
  to: string;
  ownerCoachName: string;
  fromTeamName: string;
  listingTeamName: string;
  listingId: string;
  message: string;
}): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const inboxUrl = `${siteUrl}/inbox`;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111827;">
      <p>Hi ${escapeHtml(ownerCoachName)},</p>
      <p><strong>${escapeHtml(fromTeamName)}</strong> just sent an inquiry about your listing
      &ldquo;<strong>${escapeHtml(listingTeamName)}</strong>&rdquo; on ScrimmApp:</p>
      <blockquote style="margin: 12px 0; padding: 10px 14px; border-left: 3px solid #1e7a45; background: #f6f8fb; color: #44506a;">
        ${escapeHtml(message)}
      </blockquote>
      <p><a href="${inboxUrl}" style="color: #1e7a45; font-weight: bold;">View it in your inbox &rarr;</a></p>
      <p style="color: #71809b; font-size: 12px;">ScrimmApp, the scrimmage marketplace and season planner.</p>
    </div>
  `.trim();

  await sendTemplateEmail({
    to,
    subject: `New scrimmage inquiry: ${fromTeamName} wants to connect`,
    html,
    template: "inquiry_notification",
    relatedType: "listing",
    relatedId: listingId,
  });
}
