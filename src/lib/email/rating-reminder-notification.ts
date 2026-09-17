import { sendTemplateEmail } from "./send-email";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendRatingReminderEmail({
  to,
  recipientCoachName,
  otherTeamName,
  listingTeamName,
  connectionId,
  // The host rates from /posts (RateOpponentDialog), the visiting coach rates from the
  // /inbox thread (RateHostDialog): same email template, different destination per side.
  actionPath,
}: {
  to: string;
  recipientCoachName: string;
  otherTeamName: string;
  listingTeamName: string;
  connectionId: string;
  actionPath: "/posts" | `/inbox/${string}`;
}): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const threadUrl = `${siteUrl}${actionPath}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111827;">
      <p>Hi ${escapeHtml(recipientCoachName)},</p>
      <p>Your scrimmage between <strong>${escapeHtml(listingTeamName)}</strong> and
      <strong>${escapeHtml(otherTeamName)}</strong> is marked completed on ScrimmApp.</p>
      <p>Take a minute to rate how it went, it helps other coaches know who they're scheduling with.</p>
      <p><a href="${threadUrl}" style="color: #1e7a45; font-weight: bold;">Rate this scrimmage &rarr;</a></p>
      <p style="color: #71809b; font-size: 12px;">ScrimmApp, the scrimmage marketplace and season planner.</p>
    </div>
  `.trim();

  await sendTemplateEmail({
    to,
    subject: `Rate your scrimmage with ${otherTeamName}`,
    html,
    template: "rating_reminder",
    relatedType: "connection",
    relatedId: connectionId,
  });
}
