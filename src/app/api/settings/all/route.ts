// src/app/api/settings/all/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id!));

    return NextResponse.json({ settings: settings || null });
  } catch (error) {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const userId = session.user.id!;

    const [existing] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    if (existing) {
      await db.update(userSettings).set(body).where(eq(userSettings.userId, userId));
    } else {
      await db.insert(userSettings).values({ userId, ...body });
    }

    return NextResponse.json({ message: "تم الحفظ" });
  } catch (error) {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}