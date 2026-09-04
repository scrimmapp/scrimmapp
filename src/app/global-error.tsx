"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

// Next.js only renders this for errors that escape every nested error boundary. Reporting here
// (in addition to the per-request server-side capture in src/lib/monitoring/posthog-server.ts)
// covers uncaught client-render exceptions too.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    if (posthog.__loaded) posthog.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: "3rem 1rem", textAlign: "center", fontFamily: "system-ui" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Something went wrong</h1>
          <p style={{ marginTop: "0.5rem", color: "#71809b" }}>
            We&apos;ve logged the error. Try reloading the page.
          </p>
        </div>
      </body>
    </html>
  );
}
