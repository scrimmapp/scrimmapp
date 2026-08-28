import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // Cloud Run terminates TLS at its proxy and forwards to the container over plain HTTP on
  // an internal address, so request.url's origin resolves to 0.0.0.0:8080 rather than the
  // public host. The proxy sets these forwarded headers with the real public origin instead.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : new URL(request.url).origin;

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
