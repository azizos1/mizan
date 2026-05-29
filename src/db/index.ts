// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL is not defined");
}

console.log("✅ Connecting to database...");

const pool = new Pool({
  connectionString: connectionString,
  connectionTimeoutMillis: 30000,
  max: 1,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
  console.error("❌ Pool error:", err);
});

export const db = drizzle(pool, { schema });