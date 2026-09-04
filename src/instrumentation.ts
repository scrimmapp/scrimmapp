import type { Instrumentation } from "next";

// App-wide safety net: catches any server error (render, route handler, or server action) that
// wasn't already reported closer to its source, so nothing server-side fails silently in
// production. Complements the client-side capture in posthog-provider.tsx and global-error.tsx.
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const { captureServerException } = await import("@/lib/monitoring/posthog-server");
  captureServerException(error, {
    path: request.path,
    method: request.method,
    routeType: context.routeType,
  });
};
