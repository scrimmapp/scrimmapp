/**
 * Applies every committed migration (schema, the calendar_conflicts view, the auth trigger,
 * RLS policies, the realtime publication) to an in-memory PGlite Postgres, seeds it with the
 * transformed mock data, and asserts row counts and behavior. Runs with zero network access
 * and zero Supabase credentials, so it's the check that runs before anything ever touches a
 * live project.
 *
 * PGlite has no `auth` schema and no `supabase_realtime` publication, both of which the newer
 * migrations reference. The stubs below exist only so this offline check can prove the SQL is
 * valid and applies cleanly; they cannot prove the trigger fires on a real signup, that RLS
 * actually blocks a cross-user read, or that realtime delivery works, those need the live
 * project (see the plan's verification section).
 */
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { sql } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { buildSeedRows } from "../src/db/seed/from-mock-data";

async function main() {
  const client = new PGlite();

  console.log("Stubbing Supabase roles, auth schema, auth.uid(), and the realtime publication...");
  await client.exec(`
    create role anon;
    create role authenticated;
    create role service_role;
    create schema if not exists auth;
    create table if not exists auth.users (
      id uuid primary key,
      email text,
      raw_user_meta_data jsonb
    );
    create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
    create publication supabase_realtime;
  `);

  const db = drizzle(client, { schema });

  console.log("Applying migrations to in-memory Postgres...");
  await migrate(db, { migrationsFolder: "./src/db/migrations" });

  console.log("Testing the auth.users -> profiles trigger directly...");
  const triggerTestId = "00000000-0000-0000-0000-000000000001";
  await client.exec(`
    insert into auth.users (id, email, raw_user_meta_data)
    values ('${triggerTestId}', 'trigger-test@example.com', '{"coach_name": "Trigger Test Coach", "team_name": "Trigger Test FC"}');
  `);
  const triggerResult = await db.execute(sql`select coach_name, team_name, contact_email, org_type from profiles where id = ${triggerTestId}`);
  const triggerRow = triggerResult.rows[0] as Record<string, unknown> | undefined;

  console.log("Running the seed transform and inserting...");
  const rows = buildSeedRows();
  // The profiles.id -> auth.users.id FK (added in migration 0002) means every seeded profile
  // needs a matching auth.users row. Inserting one fires the same trigger tested above, which
  // creates a baseline profiles row from the metadata, so the seed's own richer profile data
  // (org_type, division, reliability, etc.) is applied as a follow-up update rather than a
  // second insert, which is exactly how this would need to work against a real signup too.
  for (const p of rows.profiles) {
    await client.query(
      `insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`,
      [p.id, p.contactEmail, JSON.stringify({ coach_name: p.coachName, team_name: p.teamName })],
    );
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

  await db.insert(schema.venues).values(rows.venues);
  await db.insert(schema.listings).values(rows.listings);
  await db.insert(schema.connections).values(rows.connections);
  await db.insert(schema.messages).values(rows.messages);
  await db.insert(schema.calendarEvents).values(rows.calendarEvents);

  const assertions: Array<[string, boolean, string]> = [];
  function assert(label: string, condition: boolean, detail: string) {
    assertions.push([label, condition, detail]);
  }

  assert(
    "auth.users -> profiles trigger creates a matching row",
    !!triggerRow && triggerRow.coach_name === "Trigger Test Coach" && triggerRow.team_name === "Trigger Test FC" && triggerRow.contact_email === "trigger-test@example.com",
    `got ${JSON.stringify(triggerRow)}`,
  );
  assert(
    "trigger-created profile gets the org_type default",
    triggerRow?.org_type === "club",
    `got org_type=${triggerRow?.org_type}`,
  );

  const venueCount = await db.select().from(schema.venues);
  assert("venues seeded", venueCount.length === 4, `expected 4, got ${venueCount.length}`);

  const profileCount = await db.select().from(schema.profiles);
  assert("profiles seeded", profileCount.length === 6, `expected 6 (1 trigger-test + 1 real + 4 placeholders), got ${profileCount.length}`);

  const listingCount = await db.select().from(schema.listings);
  assert("listings seeded", listingCount.length === 4, `expected 4, got ${listingCount.length}`);

  const connectionCount = await db.select().from(schema.connections);
  assert("connections seeded", connectionCount.length === 1, `expected 1, got ${connectionCount.length}`);

  const messageCount = await db.select().from(schema.messages);
  assert("messages seeded", messageCount.length === 1, `expected 1, got ${messageCount.length}`);

  const calendarCount = await db.select().from(schema.calendarEvents);
  assert("calendar_events seeded", calendarCount.length === 2, `expected 2, got ${calendarCount.length}`);

  const emptyTables = await Promise.all([
    db.select().from(schema.comments),
    db.select().from(schema.ratings),
    db.select().from(schema.cancellations),
    db.select().from(schema.emailLog),
  ]);
  assert(
    "comments/ratings/cancellations/email_log stay empty",
    emptyTables.every((rows) => rows.length === 0),
    `counts: ${emptyTables.map((r) => r.length).join(", ")}`,
  );

  // The conflict view: nothing in the seed data is status "matched", so it should return
  // zero rows right now, but the query itself must be valid Postgres.
  const viewResult = await db.execute(sql`select * from calendar_conflicts`);
  assert("calendar_conflicts view is queryable", Array.isArray(viewResult.rows), "query did not return rows array");
  assert("calendar_conflicts view has 0 rows (no matched listings in seed data)", viewResult.rows.length === 0, `got ${viewResult.rows.length} rows`);

  // The ratings check constraint should reject an out-of-range value.
  let checkConstraintFired = false;
  try {
    await db.insert(schema.ratings).values({
      connectionId: rows.connections[0].id,
      raterId: rows.profiles[0].id,
      rateeId: rows.profiles[1].id,
      stars: 6,
      onTime: true,
      goodCommunication: true,
      accurateFieldInfo: true,
      paidRefFee: true,
    });
  } catch {
    checkConstraintFired = true;
  }
  assert("ratings.stars check constraint rejects out-of-range value", checkConstraintFired, "insert with stars=6 should have failed");

  const publicationTables = await db.execute(
    sql`select tablename from pg_publication_tables where pubname = 'supabase_realtime' order by tablename`,
  );
  const publicationTableNames = publicationTables.rows.map((r) => (r as Record<string, unknown>).tablename);
  assert(
    "realtime publication includes listings, comments, connections, messages",
    ["listings", "comments", "connections", "messages"].every((t) => publicationTableNames.includes(t)),
    `got ${JSON.stringify(publicationTableNames)}`,
  );

  console.log("\nResults:");
  let allPassed = true;
  for (const [label, condition, detail] of assertions) {
    console.log(`  ${condition ? "PASS" : "FAIL"}  ${label}${condition ? "" : ` (${detail})`}`);
    if (!condition) allPassed = false;
  }

  await client.close();

  if (!allPassed) {
    console.error("\nOffline verification FAILED.");
    process.exit(1);
  }
  console.log("\nOffline verification passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
