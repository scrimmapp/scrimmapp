import { sendTemplateEmail } from "./send-email";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendReplyNotificationEmail({
  to,
  recipientCoachName,
  fromTeamName,
  listingTeamName,
  connectionId,
  message,
}: {
  to: string;
  recipientCoachName: string;
  fromTeamName: string;
  listingTeamName: string;
  connectionId: string;
  message: string;
}): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const threadUrl = `${siteUrl}/inbox/${connectionId}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111827;">
      <p>Hi ${escapeHtml(recipientCoachName)},</p>
      <p><strong>${escapeHtml(fromTeamName)}</strong> just replied in your conversation about
      &ldquo;<strong>${escapeHtml(listingTeamName)}</strong>&rdquo; on ScrimmApp:</p>
      <blockquote style="margin: 12px 0; padding: 10px 14px; border-left: 3px solid #1e7a45; background: #f6f8fb; color: #44506a;">
        ${escapeHtml(message)}
      </blockquote>
      <p><a href="${threadUrl}" style="color: #1e7a45; font-weight: bold;">View the conversation &rarr;</a></p>
      <p style="color: #71809b; font-size: 12px;">ScrimmApp, the scrimmage marketplace and season planner.</p>
    </div>
  `.trim();

  await sendTemplateEmail({
    to,
    subject: `${fromTeamName} replied on ScrimmApp`,
    html,
    template: "reply_notification",
    relatedType: "connection",
    relatedId: connectionId,
  });
}
