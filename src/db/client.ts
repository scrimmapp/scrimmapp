import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
}

// prepare: false is required against Supabase's transaction-mode pooler (PgBouncer), which
// does not reliably support prepared statements.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
