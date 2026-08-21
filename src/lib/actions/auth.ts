"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

// No redirect() here: the client caller decides navigation via router.refresh() +
// router.push(), matching the pattern the mobile-menu logout handler already used.
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
