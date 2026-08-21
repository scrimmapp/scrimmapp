import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/board`);
    }
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message, error.status);
  } else {
    console.error("[auth/callback] no code param on callback request. Full URL:", request.url);
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
