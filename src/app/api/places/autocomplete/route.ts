import { NextResponse, type NextRequest } from "next/server";

// Server-side proxy so the Places API key never reaches the browser. Uses the new Places API
// (autocomplete), not the legacy JS SDK, since we only need text suggestions, not a map.
export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("input")?.trim();
  if (!input || input.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  const apiKey = process.env.PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ suggestions: [], error: "Places API is not configured." }, { status: 200 });
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input,
        // Southern California only, per the plan's scope (§11): no need to suggest venues
        // outside the region this app actually serves.
        // Google caps circle radius at 50,000m; Southern California is wider than that, so
        // this biases toward Orange County/LA rather than covering the whole region exactly.
        locationBias: {
          circle: {
            center: { latitude: 33.9, longitude: -117.9 },
            radius: 50000,
          },
        },
        includedRegionCodes: ["us"],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const data = await res.json();
    const suggestions = (data.suggestions ?? [])
      .map((s: { placePrediction?: { placeId: string; text?: { text: string } } }) => s.placePrediction)
      .filter(Boolean)
      .map((p: { placeId: string; text?: { text: string } }) => ({
        placeId: p.placeId,
        description: p.text?.text ?? "",
      }));

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("[places/autocomplete] request failed:", err);
    return NextResponse.json({ suggestions: [] });
  }
}
