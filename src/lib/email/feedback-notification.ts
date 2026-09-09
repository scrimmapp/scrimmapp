import { sendTemplateEmail } from "./send-email";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const categoryLabels: Record<string, string> = {
  issue: "Report an Issue",
  improvement: "Suggest an Improvement",
  general: "General Feedback",
};

export async function sendFeedbackNotificationEmail({
  feedbackId,
  category,
  message,
  contactEmail,
}: {
  feedbackId: string;
  category: string;
  message: string;
  contactEmail: string | null;
}): Promise<void> {
  const to = process.env.FEEDBACK_NOTIFICATION_EMAIL;
  if (!to) return;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111827;">
      <p>New footer feedback: <strong>${escapeHtml(categoryLabels[category] ?? category)}</strong></p>
      <blockquote style="margin: 12px 0; padding: 10px 14px; border-left: 3px solid #1e7a45; background: #f6f8fb; color: #44506a;">
        ${escapeHtml(message)}
      </blockquote>
      ${contactEmail ? `<p>Reply-to: <strong>${escapeHtml(contactEmail)}</strong></p>` : "<p>No reply email provided.</p>"}
      <p style="color: #71809b; font-size: 12px;">ScrimmApp footer feedback widget.</p>
    </div>
  `.trim();

  await sendTemplateEmail({
    to,
    subject: `ScrimmApp feedback: ${categoryLabels[category] ?? category}`,
    html,
    template: "feedback_notification",
    relatedType: "feedback",
    relatedId: feedbackId,
  });
}
