// test-db.ts
import postgres from "postgres";
import * as dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

async function testConnection() {
  const url = process.env.DATABASE_URL!;

  console.log("جاري اختبار الاتصال...");
  console.log("الرابط:", url.substring(0, 60) + "...");

  const sql = postgres(url, {
    ssl: {
      rejectUnauthorized: false,
      requestCert: true,
    },
    connect_timeout: 60,
    idle_timeout: 20,
    max: 1,
    debug: true, // عشان نشوف وين المشكلة
  });

  try {
    const result = await sql`SELECT 1 as test`;
    console.log("✅ الاتصال نجح!", result);
  } catch (error: any) {
    console.error("❌ فشل الاتصال:");
    console.error("الرسالة:", error.message);
    console.error("الكود:", error.code);
  } finally {
    await sql.end();
  }
}

testConnection();