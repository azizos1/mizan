// src/app/api/referral/click/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { referralClicks } from "@/db/schema";
import { headers } from "next/headers";

export async function POST() {
  try {
    const session = await auth();
    const headersList = headers();
    
    await db.insert(referralClicks).values({
      userId: session?.user?.id || null,
      ipAddress: headersList.get("x-forwarded-for") || "unknown",
      userAgent: headersList.get("user-agent") || "unknown",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Click error:", error);
    return NextResponse.json({ success: false });
  }
}