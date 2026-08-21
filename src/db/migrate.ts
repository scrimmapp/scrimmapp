import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const connectionString = process.env.DIRECT_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL is not set. Copy .env.example to .env.local and fill it in.");
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  console.log("Migrations applied.");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
