"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

// Client-side error + session capture. Initializes once on mount, no-ops if the public key
// isn't configured (local dev, or before Javi sets up a PostHog project).
export function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_exceptions: true,
    });
  }, []);

  return null;
}
