import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Resolves a placeId (from the autocomplete route) into a full formatted address, so the
// listing stores the exact, verified address rather than the ambiguous typed text.
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const placeId = request.nextUrl.searchParams.get("placeId")?.trim();
  if (!placeId || placeId.length > 300) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  const apiKey = process.env.PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Places API is not configured." }, { status: 200 });
  }

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "formattedAddress,displayName,location",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Could not resolve that place." }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json({
      formattedAddress: data.formattedAddress ?? "",
      displayName: data.displayName?.text ?? "",
      lat: data.location?.latitude ?? null,
      lng: data.location?.longitude ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Could not resolve that place." }, { status: 200 });
  }
}
