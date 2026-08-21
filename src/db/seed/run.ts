import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "../schema";
import { buildSeedRows } from "./from-mock-data";

/**
 * Seeds demo data. Since migration 0002, profiles.id has a foreign key to Supabase's managed
 * auth.users table, so every seeded profile needs a matching auth.users row, created by
 * inserting into auth.users with metadata (firing the same trigger a real signup fires) and
 * then updating the resulting profile with the seed's richer data.
 *
 * This writes directly into Supabase's managed auth.users table, bypassing GoTrue. That is
 * fine for a scratch/dev project (these rows have no password hash and can never actually log
 * in, they only exist to satisfy the profiles FK for demo data), but must never be run against
 * a production project with real users in it.
 */
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  }

  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client, { schema });

  const rows = buildSeedRows();

  console.log("Clearing existing rows (safe to re-run)...");
  await db.execute(sql`update ${schema.venues} set created_by = null`);
  await db.delete(schema.emailLog);
  await db.delete(schema.cancellations);
  await db.delete(schema.ratings);
  await db.delete(schema.comments);
  await db.delete(schema.messages);
  await db.delete(schema.connections);
  await db.delete(schema.calendarEvents);
  await db.delete(schema.listings);
  await db.delete(schema.venues);
  // Deleting from auth.users (not profiles directly) cascades to profiles via the FK, so a
  // rerun cleanly removes both sides. Matched by email, since ids are freshly random each run.
  const seedEmails = rows.profiles.map((p) => p.contactEmail);
  await client`delete from auth.users where email = any(${seedEmails})`;

  console.log("Inserting seed rows...");
  for (const p of rows.profiles) {
    await client`
      insert into auth.users (id, email, raw_user_meta_data)
      values (${p.id}, ${p.contactEmail}, ${JSON.stringify({ coach_name: p.coachName, team_name: p.teamName })}::jsonb)
    `;
  }
  for (const p of rows.profiles) {
    await db
      .update(schema.profiles)
      .set({
        clubName: p.clubName,
        orgType: p.orgType,
        division: p.division,
        defaultAgeGroup: p.defaultAgeGroup,
        defaultGender: p.defaultGender,
        reliabilityScore: p.reliabilityScore,
        ratingsCount: p.ratingsCount,
      })
      .where(sql`${schema.profiles.id} = ${p.id}`);
  }

  if (rows.venues.length) await db.insert(schema.venues).values(rows.venues);
  if (rows.listings.length) await db.insert(schema.listings).values(rows.listings);
  if (rows.connections.length) await db.insert(schema.connections).values(rows.connections);
  if (rows.messages.length) await db.insert(schema.messages).values(rows.messages);
  if (rows.calendarEvents.length) await db.insert(schema.calendarEvents).values(rows.calendarEvents);

  console.log("Seed complete:");
  console.log(`  venues: ${rows.venues.length}`);
  console.log(`  profiles: ${rows.profiles.length}`);
  console.log(`  listings: ${rows.listings.length}`);
  console.log(`  connections: ${rows.connections.length}`);
  console.log(`  messages: ${rows.messages.length}`);
  console.log(`  calendar_events: ${rows.calendarEvents.length}`);
  console.log("  comments, ratings, cancellations, email_log: 0 (no mock source yet)");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
