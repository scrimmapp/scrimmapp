import { PostHog } from "posthog-node";

// One client, reused across requests. PostHog's Node client batches events and flushes on an
// interval, so a fresh client per request would mean most captured errors never get flushed
// before the serverless/Cloud Run instance is recycled.
let client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.POSTHOG_API_KEY;
  if (!key) return null;
  if (!client) {
    client = new PostHog(key, {
      host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

// Reports a server-side exception to PostHog. No-ops silently if POSTHOG_API_KEY isn't set
// (e.g. local dev), so this is safe to sprinkle into catch blocks without an env-var guard
// at every call site.
export function captureServerException(error: unknown, context?: Record<string, unknown>) {
  const ph = getClient();
  if (!ph) return;
  ph.captureException(error, "server", context);
}
