import { createBrowserClient } from "@supabase/ssr";

// createBrowserClient caches a singleton by default, so a "Remember me" client (which needs a
// non-default cookie maxAge) must opt out of that cache with isSingleton: false. Otherwise the
// short-lived cookie policy from one unchecked login would silently apply to every later call
// elsewhere in the app that expects the default long-lived session.
export function createSupabaseBrowserClient(options?: { rememberMe?: boolean }) {
  if (options?.rememberMe === false) {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        isSingleton: false,
        // 1 day instead of the default 400: this session cookie clears itself out much sooner
        // when "Remember me" is left unchecked, rather than persisting for over a year.
        cookieOptions: { maxAge: 60 * 60 * 24 },
      },
    );
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
