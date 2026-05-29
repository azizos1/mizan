// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL is not defined in .env.local");
}

console.log("✅ Connecting to:", connectionString.substring(0, 60) + "...");

const pool = new Pool({
  connectionString: connectionString + "?sslmode=no-verify",
  connectionTimeoutMillis: 30000,
  max: 1,
});

pool.on("error", (err) => {
  console.error("❌ Unexpected pool error:", err);
});

export const db = drizzle(pool, { schema });