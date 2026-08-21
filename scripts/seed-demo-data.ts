/**
 * Populates the live Supabase project with a handful of public venues and open listings under
 * a dedicated "ScrimmApp Demo" account, so a first-time visitor sees a populated board instead
 * of an empty one. Runs entirely over HTTPS (Supabase Auth + PostgREST), not the direct Postgres
 * connection, so it works from network environments where port 5432 isn't reachable.
 *
 * Writes go through the demo account's own access token, not a superuser connection, so RLS's
 * owner-only insert policies (venues_insert_own, listings_insert_own) apply exactly as they
 * would for a real coach signing up and posting.
 *
 * Safe to re-run: signup falls back to sign-in if the demo account already exists, and Postgres
 * assigns new ids each time, so re-running adds a second round of sample rows rather than
 * erroring. Delete old ones from the dashboard first if that's not what you want.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. Copy .env.example to .env.local and fill it in.");
}

const DEMO_EMAIL = "demo@scrimmapp.com";
const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD || "ScrimmDemo-Showcase-2026!";

async function authRequest(path: string, body: unknown) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY! },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, json };
}

async function getDemoSession(): Promise<{ accessToken: string; userId: string }> {
  const signUp = await authRequest("/auth/v1/signup", {
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    data: { coach_name: "ScrimmApp Demo", team_name: "ScrimmApp Showcase FC" },
  });
  if (signUp.ok && signUp.json.access_token) {
    console.log("Created the demo account.");
    return { accessToken: signUp.json.access_token, userId: signUp.json.user.id };
  }

  console.log("Demo account already exists, signing in instead.");
  const signIn = await authRequest("/auth/v1/token?grant_type=password", {
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (!signIn.ok) {
    throw new Error(`Could not sign in to the demo account: ${signIn.status} ${JSON.stringify(signIn.json)}`);
  }
  return { accessToken: signIn.json.access_token, userId: signIn.json.user.id };
}

async function restInsert(table: string, accessToken: string, rows: Record<string, unknown>[]) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY!,
      Authorization: `Bearer ${accessToken}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(rows),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`POST ${table} failed: ${res.status} ${JSON.stringify(json)}`);
  return json as Array<Record<string, unknown>>;
}

function inDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

async function main() {
  const { accessToken, userId } = await getDemoSession();
  console.log(`Demo profile id: ${userId}`);

  const venueRows = await restInsert("venues", accessToken, [
    {
      name: "Great Park Soccer Complex", city: "Irvine", state: "CA", field_count: 4, surface: "Turf",
      has_lights: true, parking_notes: "Free lot, arrive 20 min early on weekends", created_by: userId, is_public: true,
    },
    {
      name: "Mile Square Park Fields", city: "Fountain Valley", state: "CA", field_count: 6, surface: "Grass",
      has_lights: false, parking_notes: "Street parking only", created_by: userId, is_public: true,
    },
    {
      name: "Anaheim Youth Sports Complex", city: "Anaheim", state: "CA", field_count: 3, surface: "Turf",
      has_lights: true, parking_notes: "Paid lot, $5/day", created_by: userId, is_public: true,
    },
  ]);
  console.log(`Seeded ${venueRows.length} venues.`);

  const listingRows = await restInsert("listings", accessToken, [
    {
      owner_id: userId, team_name: "ScrimmApp Showcase FC", gender: "boys", age_group: "U14", level: "club",
      sub_level: "Premier (ECNL / RL)", match_date: inDays(6), time_window: "morning",
      location_text: "Great Park Soccer Complex, Irvine CA", travel_radius_miles: 25,
      is_hosting: true, has_ref: true, ref_fee_split: "split_50_50", field_fee_share: false,
      notes: "Sample listing so the board isn't empty on your first visit. Feel free to click in and see how the flow works.",
      status: "open",
    },
    {
      owner_id: userId, team_name: "Showcase Girls Academy", gender: "girls", age_group: "U16", level: "club",
      sub_level: "Elite (MLS Next / GA)", match_date: inDays(9), time_window: "afternoon",
      location_text: "Mile Square Park Fields, Fountain Valley CA", travel_radius_miles: 50,
      is_hosting: true, has_ref: true, ref_fee_split: "host_pays", field_fee_share: false,
      notes: "Another sample listing, different level and location, to show how filters narrow the board.",
      status: "open",
    },
    {
      owner_id: userId, team_name: "Showcase High School Varsity", gender: "boys", age_group: "Varsity", level: "high_school",
      sub_level: "CIF Division 2", match_date: inDays(12), time_window: "evening",
      location_text: "Anaheim Youth Sports Complex, Anaheim CA", travel_radius_miles: 10,
      is_hosting: false, has_ref: true, ref_fee_split: "visitor_pays", field_fee_share: true,
      notes: "A third sample listing under our High School division.",
      status: "open",
    },
    {
      owner_id: userId, team_name: "Showcase Rec United", gender: "girls", age_group: "U10", level: "rec",
      sub_level: "AYSO Select", match_date: inDays(4), time_window: "morning",
      location_text: "Mile Square Park Fields, Fountain Valley CA", travel_radius_miles: 10,
      is_hosting: true, has_ref: false, ref_fee_split: "split_50_50", field_fee_share: false,
      notes: "A younger, recreational-level sample listing.",
      status: "open",
    },
  ]);
  console.log(`Seeded ${listingRows.length} listings.`);
  console.log("\nDone. The board and venues page should now show sample data.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
